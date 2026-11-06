"use client"

import Image from "next/image"
import globeImage from "@/app/assest/globe.png"

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-[#0a0a0a]">
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage:
            "repeating-linear-gradient(90deg, rgba(255,255,255,0.04) 0px, rgba(255,255,255,0.04) 1px, transparent 1px, transparent 48px)",
        }}
      />
      <div
        className="absolute inset-0 z-0"
        style={{
          background:
            "radial-gradient(circle at 50% 55%, rgba(99, 102, 241, 0.12) 0%, transparent 55%)",
        }}
      />

      <div className="relative z-10 flex flex-col items-center justify-center min-h-[90vh] pt-32 px-6 lg:px-10 text-center">
        <span className="inline-flex items-center justify-center gap-2 mb-12 px-4 py-1.5 rounded-full border border-white/10 bg-white/5 text-[11px] font-medium text-gray-400 tracking-widest uppercase">
          <span className="text-orange-500">💼</span>
          50,000+ NEW JOBS THIS MONTH
        </span>

        <h1 className="mb-8 max-w-[700px] text-4xl lg:text-5xl font-bold text-white leading-tight tracking-tight">
          Find Your Dream Job Today
        </h1>

        <p className="mb-14 max-w-xl text-sm text-gray-400 leading-relaxed">
          HireLoop connects top talent with world-class companies. Browse
          thousands of curated opportunities and land your next role — faster.
        </p>

        <div className="relative w-full max-w-[620px] mb-14">
          <div className="flex items-center gap-2 rounded-2xl bg-white/5 border border-white/10 px-4 py-3 shadow-lg shadow-black/40">
            <div className="flex items-center gap-2.5 flex-1 min-w-0">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width={16}
                height={16}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.5}
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-gray-500 shrink-0"
              >
                <circle cx="11" cy="11" r={8} />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                type="text"
                placeholder="Job title, skill or company"
                className="flex-1 bg-transparent text-sm text-white placeholder-gray-500 outline-none min-w-0"
              />
            </div>
            <div className="w-px h-5 bg-gray-700" />
            <div className="flex items-center gap-2.5 flex-1 min-w-0">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width={16}
                height={16}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.5}
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-purple-500 shrink-0"
              >
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0" />
                <circle cx="12" cy="10" r={3} />
              </svg>
              <input
                type="text"
                placeholder="Location or Remote"
                className="flex-1 bg-transparent text-sm text-white placeholder-gray-500 outline-none min-w-0"
              />
            </div>
            <button className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center hover:bg-purple-500 shadow-lg shadow-purple-500/40 transition-all shrink-0">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width={16}
                height={16}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="11" cy="11" r={8} />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </button>
          </div>
        </div>

        <div className="flex items-center justify-center gap-3 mb-16">
          <span className="text-[11px] font-medium text-gray-500 uppercase tracking-widest">
            Trending Position
          </span>
          {["Product Designer", "AI Engineering", "DevOps Engineer"].map((tag) => (
            <span
              key={tag}
              className="px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-[11px] text-gray-400 font-medium hover:text-white hover:border-white/30 transition-all"
            >
              {tag}
            </span>
          ))}
        </div>

        <div className="relative w-full max-w-[720px] h-[340px] flex items-end justify-center">
          <Image
            src={globeImage}
            alt="globe"
            fill
            className="object-cover opacity-95"
            sizes="(max-width: 768px) 100vw, 720px"
          />
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-full max-w-[600px] text-center px-4 z-10">
            <p className="text-xl text-white font-medium leading-tight">
              Assisting over 15,000 job seekers find their dream positions.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
