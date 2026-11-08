"use client"

import { ChevronRight } from "lucide-react"

type JobCard = {
  id: string
  title: string
  description: string
  location: string
  workType: string
  salary: string
}

const featuredJobs: JobCard[] = [
  {
    id: "1",
    title: "Frontend Developer",
    description:
      "Showcase your commitment to diversity and inclusion by highlighting initiatives",
    location: "New York, USA",
    workType: "Hybrid",
    salary: "₹25-45K/hr",
  },
  {
    id: "2",
    title: "Frontend Developer",
    description:
      "Showcase your commitment to diversity and inclusion by highlighting initiatives",
    location: "New York, USA",
    workType: "Hybrid",
    salary: "₹25-45K/hr",
  },
  {
    id: "3",
    title: "Frontend Developer",
    description:
      "Showcase your commitment to diversity and inclusion by highlighting initiatives",
    location: "New York, USA",
    workType: "Hybrid",
    salary: "₹25-45K/hr",
  },
  {
    id: "4",
    title: "Frontend Developer",
    description:
      "Showcase your commitment to diversity and inclusion by highlighting initiatives",
    location: "New York, USA",
    workType: "Hybrid",
    salary: "₹25-45K/hr",
  },
  {
    id: "5",
    title: "Frontend Developer",
    description:
      "Showcase your commitment to diversity and inclusion by highlighting initiatives",
    location: "New York, USA",
    workType: "Hybrid",
    salary: "₹25-45K/hr",
  },
  {
    id: "6",
    title: "Frontend Developer",
    description:
      "Showcase your commitment to diversity and inclusion by highlighting initiatives",
    location: "New York, USA",
    workType: "Hybrid",
    salary: "₹25-45K/hr",
  },
]

export function FeaturedJobsSection() {
  return (
    <section className="bg-[#0a0a0a] py-20 px-6 lg:px-10 border-y border-white/10">
      <div className="max-w-[1280px] mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <span className="inline-flex items-center justify-center gap-1.5 text-[10px] font-medium text-purple-400 tracking-widest uppercase">
            <span className="w-1 h-1 bg-purple-400 rounded-full" />
            Smart Job Discovery
            <span className="w-1 h-1 bg-purple-400 rounded-full" />
          </span>
          <h2 className="mt-4 text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-tight tracking-tight">
            The roles you'd never find by searching
          </h2>
        </div>

        {/* Job Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredJobs.map((job) => (
            <div
              key={job.id}
              className="rounded-xl border border-white/10 bg-white/5 p-6 flex flex-col h-full"
            >
              {/* Job Title */}
              <h3 className="text-xl lg:text-2xl font-semibold text-white mb-3">
                {job.title}
              </h3>

              {/* Description */}
              <p className="text-sm text-gray-400 mb-4 leading-relaxed">
                {job.description}
              </p>

              {/* Location & Work Type */}
              <div className="flex items-center gap-2 mb-4">
                <span className="w-1 h-1 bg-gray-500 rounded-full shrink-0" />
                <span className="text-xs text-gray-400">{job.location}</span>
                <span className="w-1 h-1 bg-gray-500 rounded-full shrink-0" />
                <span className="text-xs text-gray-400">{job.workType}</span>
              </div>

              {/* Salary */}
              <div className="mb-6">
                <span className="text-xs font-medium text-gray-400 uppercase tracking-widest">
                  {job.salary}
                </span>
              </div>

              {/* Apply Button */}
              <button
                className="flex items-center gap-1.5 text-sm font-medium text-white transition-colors hover:text-purple-400"
              >
                Apply Now <ChevronRight size={14} strokeWidth={2} />
              </button>
            </div>
          ))}
        </div>

        {/* View All Jobs Button */}
        <div className="mt-16 text-center">
          <button
            className="inline-flex items-center justify-center gap-2 rounded-full bg-white/10 border border-white/10 px-8 py-3 text-sm font-medium text-white hover:bg-white/20 transition-colors"
          >
            View all jobs open
          </button>
        </div>
      </div>
    </section>
  )
}
