import { NextResponse } from "next/server"
import { requireRole } from "@/lib/auth-server"
import { stripe } from "@/lib/payments/stripe.server"
import { db } from "@/lib/db"
import {
  getSubscriptionByUserId,
  updateStripeFields,
} from "@/lib/repositories/subscription.repository"

function errorResponse(message: string, status: number) {
  return NextResponse.json({ success: false, error: message }, { status })
}

export async function POST(req: Request) {
  try {
    const session = await requireRole("recruiter")
    const userId = session.userId

    const priceId = process.env.STRIPE_GROWTH_PRICE_ID
    if (!priceId) {
      return errorResponse("Growth plan price not configured", 500)
    }

    const existing = await getSubscriptionByUserId(userId)
    if (!existing) {
      return errorResponse("Subscription not found", 404)
    }

    // Prevent creating a checkout session when already on a paid plan
    // or when a Stripe subscription already exists for this user.
    if (existing.stripeSubscriptionId || existing.planId === "growth") {
      return errorResponse("Already on a paid plan", 400)
    }

    // Get or create a Stripe customer for this recruiter.
    let stripeCustomerId = existing.stripeCustomerId
    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        metadata: {
          userId,
          planId: "growth",
        },
      })
      stripeCustomerId = customer.id
      await updateStripeFields(userId, { stripeCustomerId })
    }

    const origin = new URL(req.url).origin

    const checkoutSession = await stripe.checkout.sessions.create({
      customer: stripeCustomerId,
      mode: "subscription",
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      metadata: {
        userId,
        planId: "growth",
      },
      subscription_data: {
        metadata: {
          userId,
          planId: "growth",
        },
      },
      success_url: `${origin}/dashboard/recruiter/billing?session_id={CHECKOUT_SESSION_ID}&status=success`,
      cancel_url: `${origin}/dashboard/recruiter/billing?canceled=true`,
    })

    return NextResponse.json({ url: checkoutSession.url })
  } catch (err) {
    console.error(
      "Stripe checkout error:",
      err instanceof Error ? err.message : "Unknown error"
    )
    return errorResponse("Failed to create checkout session", 500)
  }
}
