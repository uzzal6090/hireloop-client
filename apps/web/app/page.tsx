import { Hero } from "@/components/hero"
import { StatsSection } from "@/components/stats"
import { FeaturedJobsSection } from "@/components/featured-jobs"

export default function Page() {
  return (
    <div className="relative min-h-svh bg-background">
      <Hero />
      <StatsSection />
      <FeaturedJobsSection />
    </div>
  )
}
