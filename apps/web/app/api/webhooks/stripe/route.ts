import { NextResponse } from "next/server"
import Stripe from "stripe"
import { stripe } from "@/lib/payments/stripe.server"
import { client } from "@/lib/db"
import {
  claimWebhookEvent,
  getWebhookEvent,
  markWebhookEventProcessed,
} from "@/lib/repositories/webhook-event.repository"
import {
  getSubscriptionByStripeCustomerId,
  getSubscriptionByStripeSubscriptionId,
  updateSubscription,
} from "@/lib/repositories/subscription.repository"
import type { ClientSession } from "mongodb"

const GROWTH_PRICE_ID = process.env.STRIPE_GROWTH_PRICE_ID
const WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET
const GROWTH_JOB_LIMIT = 10
const LEASE_DURATION_MS = 300000 // 5 minutes; sufficient for webhook processing

export const config = {
  api: {
    bodyParser: false,
  },
}

function errorResponse(message: string, status: number) {
  return NextResponse.json({ success: false, error: message }, { status })
}

function isStripeCustomerId(value: unknown): value is string {
  return typeof value === "string" && value.startsWith("cus_")
}

/**
 * Syncs Stripe billing metadata without changing plan entitlement.
 * Used by customer.subscription.created so that metadata is recorded
 * but Growth access is NOT granted until invoice.paid confirms payment.
 */
async function syncBillingMetadata(
  subscription: Stripe.Subscription,
  session?: ClientSession
) {
  const stripeCustomerId = subscription.customer
  if (!isStripeCustomerId(stripeCustomerId)) {
    return
  }

  const priceId = subscription.items.data[0]?.price.id
  if (!priceId || priceId !== GROWTH_PRICE_ID) {
    return
  }

  const existing = await getSubscriptionByStripeCustomerId(stripeCustomerId)
  if (!existing) {
    return
  }

  if (
    subscription.metadata.userId &&
    subscription.metadata.userId !== existing.userId
  ) {
    return
  }

  const sub = subscription as unknown as Record<string, unknown>

  await updateSubscription(existing.userId, {
    stripeCustomerId,
    stripeSubscriptionId: subscription.id,
    stripePriceId: priceId,
    paymentStatus: String(sub.status ?? ""),
    currentPeriodStart: new Date(Number(sub.current_period_start) * 1000),
    currentPeriodEnd: new Date(Number(sub.current_period_end) * 1000),
    cancelAtPeriodEnd: Boolean(sub.cancel_at_period_end),
  }, session)
}

/**
 * Activates a Growth subscription only after verifying initial invoice
 * payment. This is the authoritative activation path. It requires:
 *   - Stripe subscription status === "active"
 *   - Price ID matches configured Growth price
 *   - Customer ID and userId mapping verified against stored subscription
 *   - Growth Price ID checked against actual subscription items
 */
async function activateGrowthFromInvoice(
  stripeSubscriptionId: string,
  session?: ClientSession
) {
  const subscription = await stripe.subscriptions.retrieve(stripeSubscriptionId)

  const stripeCustomerId = subscription.customer
  if (!isStripeCustomerId(stripeCustomerId)) {
    return
  }

  const priceId = subscription.items.data[0]?.price.id
  if (!priceId || priceId !== GROWTH_PRICE_ID) {
    return
  }

  const existing = await getSubscriptionByStripeCustomerId(stripeCustomerId)
  if (!existing) {
    return
  }

  if (
    subscription.metadata.userId &&
    subscription.metadata.userId !== existing.userId
  ) {
    return
  }

  const sub = subscription as unknown as Record<string, unknown>

  // Only activate when Stripe confirms the subscription is active
  if (sub.status !== "active") {
    return
  }

  // Idempotent: already active Growth, just sync billing metadata
  if (existing.planId === "growth" && existing.status === "active") {
    await syncBillingMetadata(subscription, session)
    return
  }

  await updateSubscription(existing.userId, {
    planId: "growth",
    planName: "Growth",
    jobLimit: GROWTH_JOB_LIMIT,
    status: "active",
    stripeCustomerId,
    stripeSubscriptionId: subscription.id,
    stripePriceId: priceId,
    paymentStatus: "paid",
    currentPeriodStart: new Date(Number(sub.current_period_start) * 1000),
    currentPeriodEnd: new Date(Number(sub.current_period_end) * 1000),
    cancelAtPeriodEnd: Boolean(sub.cancel_at_period_end),
  }, session)
}

async function handleCheckoutSessionCompleted(event: Stripe.Event) {
  const session = event.data.object as Stripe.Checkout.Session

  const userId = session.metadata?.userId
  const planId = session.metadata?.planId
  const stripeCustomerId = session.customer

  if (!userId || planId !== "growth") {
    return
  }

  if (!isStripeCustomerId(stripeCustomerId)) {
    return
  }

  const existing = await getSubscriptionByStripeCustomerId(stripeCustomerId)
  if (!existing) {
    return
  }

  if (existing.userId !== userId) {
    return
  }

  // Checkout session completed but subscription activation is deferred
  // to invoice.paid. Do not activate the paid plan here.
}

async function handleSubscriptionCreated(
  event: Stripe.Event,
  mongoSession?: ClientSession
) {
  const subscription = event.data.object as Stripe.Subscription
  // Sync billing metadata only; do NOT grant Growth entitlement here.
  // Initial activation happens exclusively on invoice.paid.
  await syncBillingMetadata(subscription, mongoSession)
}

async function handleSubscriptionUpdated(
  event: Stripe.Event,
  mongoSession?: ClientSession
) {
  const subscription = event.data.object as Stripe.Subscription

  const existing = await getSubscriptionByStripeSubscriptionId(subscription.id)
  if (!existing) {
    return
  }

  const sub = subscription as unknown as Record<string, unknown>

  if (existing.planId === "growth") {
    // Already Growth: sync billing metadata and reflect status changes.
    await syncBillingMetadata(subscription, mongoSession)

    if (sub.status === "canceled") {
      // Cancellation takes effect: restore Free entitlement and job limit.
      await updateSubscription(existing.userId, {
        planId: "free",
        planName: "Free",
        jobLimit: 3,
        status: "canceled",
        paymentStatus: "canceled",
      }, mongoSession)
    } else if (sub.status === "past_due" || sub.status === "unpaid") {
      await updateSubscription(existing.userId, {
        status: "past_due",
        paymentStatus: String(sub.status ?? ""),
      }, mongoSession)
    }
    return
  }

  // Not yet Growth: sync stripe metadata only, do not activate.
  await syncBillingMetadata(subscription, mongoSession)
}

async function handleSubscriptionDeleted(
  event: Stripe.Event,
  mongoSession?: ClientSession
) {
  const subscription = event.data.object as Stripe.Subscription

  const existing = await getSubscriptionByStripeSubscriptionId(subscription.id)
  if (!existing) {
    return
  }

  // Restore Free plan and 3-job limit. Retain Stripe identifiers for audit.
  await updateSubscription(existing.userId, {
    planId: "free",
    planName: "Free",
    jobLimit: 3,
    status: "canceled",
    paymentStatus: "canceled",
    currentPeriodEnd: new Date(),
  }, mongoSession)
}

async function handleInvoicePaid(
  event: Stripe.Event,
  mongoSession?: ClientSession
) {
  const invoice = event.data.object as unknown as Record<string, unknown>

  const stripeSubscriptionId = invoice.subscription
  if (!stripeSubscriptionId || typeof stripeSubscriptionId !== "string") {
    return
  }

  // Authoritative initial payment confirmation and renewal handling.
  await activateGrowthFromInvoice(stripeSubscriptionId, mongoSession)
}

async function handleInvoicePaymentFailed(
  event: Stripe.Event,
  mongoSession?: ClientSession
) {
  const invoice = event.data.object as unknown as Record<string, unknown>

  const stripeSubscriptionId = invoice.subscription
  if (!stripeSubscriptionId || typeof stripeSubscriptionId !== "string") {
    return
  }

  // Do not trust invoice metadata alone; verify via Stripe API.
  const subscription = await stripe.subscriptions.retrieve(stripeSubscriptionId)

  const stripeCustomerId = subscription.customer
  if (!isStripeCustomerId(stripeCustomerId)) {
    return
  }

  const priceId = subscription.items.data[0]?.price.id
  if (!priceId || priceId !== GROWTH_PRICE_ID) {
    // Ignore invoices for non-Growth subscriptions
    return
  }

  const existing = await getSubscriptionByStripeSubscriptionId(stripeSubscriptionId)
  if (!existing) {
    return
  }

  if (
    subscription.metadata.userId &&
    subscription.metadata.userId !== existing.userId
  ) {
    return
  }

  await updateSubscription(existing.userId, {
    paymentStatus: "payment_failed",
    status: "past_due",
  }, mongoSession)
}

/**
 * Process a webhook event inside a fenced MongoDB transaction.
 *
 * The transaction guarantees that a worker can only commit subscription
 * changes if it still holds the valid claim token. A concurrent reclaim by
 * another worker (after lease expiry) invalidates the token, causing the
 * transaction to abort and roll back any uncommitted changes.
 */
async function processEventFenced(
  event: Stripe.Event,
  claimToken: string
): Promise<void> {
  const mongoSession = client.startSession()

  try {
    await mongoSession.withTransaction(async () => {
      // 1. Verify the event is still claimed by this exact token and lease is valid.
      const eventDoc = await client
        .db("hireloopdb")
        .collection("webhookEvents")
        .findOne(
          { eventId: event.id, status: "claimed", claimToken },
          { session: mongoSession }
        )

      if (!eventDoc) {
        // Claim was revoked (expired and reclaimed by another worker).
        // Abort the transaction — do not commit any subscription changes.
        throw new Error("Claim token no longer valid; event was reclaimed")
      }

      // 2. Apply subscription updates based on event type (within transaction).
      switch (event.type) {
        case "checkout.session.completed":
          await handleCheckoutSessionCompleted(event)
          break
        case "customer.subscription.created":
          await handleSubscriptionCreated(event, mongoSession)
          break
        case "customer.subscription.updated":
          await handleSubscriptionUpdated(event, mongoSession)
          break
        case "customer.subscription.deleted":
          await handleSubscriptionDeleted(event, mongoSession)
          break
        case "invoice.paid":
          await handleInvoicePaid(event, mongoSession)
          break
        case "invoice.payment_failed":
          await handleInvoicePaymentFailed(event, mongoSession)
          break
        default:
          break
      }

      // 3. Mark the event processed using the same claim token within the transaction.
      const marked = await markWebhookEventProcessed(
        event.id,
        claimToken,
        mongoSession
      )

      if (!marked) {
        throw new Error(
          "Failed to mark event processed — claim may have been revoked"
        )
      }
    })
  } finally {
    await mongoSession.endSession()
  }
}

export async function POST(req: Request) {
  if (!WEBHOOK_SECRET) {
    return errorResponse("Webhook secret not configured", 500)
  }

  const signature = req.headers.get("stripe-signature")
  if (!signature) {
    return errorResponse("Missing stripe-signature header", 400)
  }

  const body = await req.text()

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, signature, WEBHOOK_SECRET)
  } catch {
    return errorResponse("Invalid signature", 400)
  }

  // Short-circuit if already fully processed
  const alreadyProcessed = await getWebhookEvent(event.id)
  if (alreadyProcessed?.status === "processed") {
    return NextResponse.json({ received: true })
  }

  // Atomically claim the event for this worker.
  // Returns claimed:false if another worker holds an active (unexpired) lease.
  const claimed = await claimWebhookEvent(
    event.id,
    event.type,
    LEASE_DURATION_MS
  )

  if (!claimed.claimed || !claimed.claimToken) {
    return errorResponse("Event is being processed by another worker", 429)
  }

  try {
    await processEventFenced(event, claimed.claimToken)
    return NextResponse.json({ received: true })
  } catch (err) {
    console.error(
      "Webhook processing error:",
      err instanceof Error ? err.message : "Unknown error"
    )
    // Leave status as "claimed". The lease expires after LEASE_DURATION_MS,
    // allowing a Stripe retry to reclaim and reprocess the event.
    return errorResponse("Webhook processing failed", 500)
  }
}
