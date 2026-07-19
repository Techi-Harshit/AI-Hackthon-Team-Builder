import React from "react";

export default function RecommendationSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
      {Array.from({ length: 4 }).map((_, idx) => (
        <div
          key={idx}
          className="p-5 rounded-3xl bg-[#0e1222]/30 border border-white/5 animate-pulse space-y-4"
        >
          {/* Avatar and Info Header */}
          <div className="flex gap-3 justify-between items-start">
            <div className="flex gap-3">
              <div className="w-12 h-12 rounded-2xl bg-white/5 shrink-0" />
              <div className="space-y-2 py-1">
                <div className="h-3 w-28 bg-white/10 rounded" />
                <div className="h-2 w-16 bg-white/5 rounded" />
                <div className="h-2.5 w-36 bg-white/5 rounded" />
              </div>
            </div>
            <div className="w-12 h-12 rounded-full bg-white/5" />
          </div>

          {/* Stats Bar */}
          <div className="h-10 bg-white/5 rounded-xl" />

          {/* Matches Chips */}
          <div className="space-y-1.5 pt-1">
            <div className="h-3.5 w-full bg-white/5 rounded" />
            <div className="h-3.5 w-5/6 bg-white/5 rounded" />
          </div>

          {/* Actions */}
          <div className="flex justify-between items-center pt-2">
            <div className="flex gap-2">
              <div className="w-7 h-7 bg-white/5 rounded-lg" />
              <div className="w-7 h-7 bg-white/5 rounded-lg" />
            </div>
            <div className="flex gap-2">
              <div className="h-7 w-20 bg-white/5 rounded-xl" />
              <div className="h-7 w-24 bg-white/5 rounded-xl" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
