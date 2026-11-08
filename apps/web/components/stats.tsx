"use client"

import { Briefcase, Star, Building2, Users } from "lucide-react"

const stats = [
  {
    label: "Active Jobs",
    value: "50K+",
    icon: Briefcase,
    color: "text-purple-400",
  },
  {
    label: "Satisfaction Rate",
    value: "97%",
    icon: Star,
    color: "text-orange-400",
  },
  {
    label: "Companies",
    value: "12K",
    icon: Building2,
    color: "text-indigo-400",
  },
  {
    label: "Job Seekers",
    value: "2M",
    icon: Users,
    color: "text-pink-400",
  },
]

export function StatsSection() {
  return (
    <section className="bg-[#0a0a0a] py-20 px-6 lg:px-10 border-y border-white/10">
      <div className="max-w-[1280px] mx-auto">
        <div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="flex flex-col items-center gap-3 p-6 rounded-xl border border-white/10 bg-white/5"
            >
              <div
                className={`w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center ${stat.color} shrink-0`}
              >
                <stat.icon size={20} strokeWidth={2} />
              </div>
              <div className="text-3xl font-bold text-white leading-none">
                {stat.value}
              </div>
              <p className="text-xs font-medium text-gray-400 uppercase tracking-widest">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
