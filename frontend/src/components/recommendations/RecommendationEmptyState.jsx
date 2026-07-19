import React from "react";
import { Link } from "react-router-dom";
import { FaFilter, FaArrowLeft, FaRegTimesCircle } from "react-icons/fa";

export default function RecommendationEmptyState({ type = "no-recommendations", onResetFilters }) {
  if (type === "no-hackathon") {
    return (
      <div className="p-16 text-center rounded-3xl bg-[#0e1222]/20 border border-white/5 flex flex-col items-center justify-center max-w-2xl mx-auto shadow-xl">
        <span className="text-6xl block mb-6 animate-bounce">🤖</span>
        <h3 className="text-xl font-black text-white mb-2">No Hackathon Selected</h3>
        <p className="text-sm text-gray-400 max-w-md mx-auto mb-6">
          Please select a hackathon first to receive AI-powered teammate recommendations.
        </p>
        <Link
          to="/hackathons"
          className="px-6 py-3 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white text-xs font-bold transition flex items-center gap-2 cursor-pointer shadow-lg"
        >
          <FaArrowLeft /> Go to Hackathons
        </Link>
      </div>
    );
  }

  if (type === "no-results") {
    return (
      <div className="p-16 text-center rounded-3xl bg-[#0e1222]/20 border border-dashed border-white/10 flex flex-col items-center justify-center">
        <span className="text-5xl block mb-4">🛸</span>
        <h3 className="text-base font-bold text-white mb-1">No Search or Filter Results</h3>
        <p className="text-xs text-gray-500 mb-6 max-w-sm">
          No candidates match your current filter settings. Try relaxing your threshold compatibility parameters.
        </p>
        {onResetFilters && (
          <button
            onClick={onResetFilters}
            className="px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white text-xs font-bold transition cursor-pointer"
          >
            Reset Filters
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="p-16 text-center rounded-3xl bg-[#0e1222]/20 border border-dashed border-white/10 flex flex-col items-center justify-center">
      <span className="text-5xl block mb-4 font-black">👽</span>
      <h3 className="text-base font-bold text-white mb-1">No Recommendations Found</h3>
      <p className="text-xs text-gray-500 mb-6 max-w-xs leading-relaxed">
        No eligible candidates match your compatibility requirements. Try another hackathon or update your profile.
      </p>
      <div className="flex flex-col gap-2.5 text-xs text-left bg-[#030712]/50 p-4 rounded-2xl border border-white/5 text-gray-400">
        <span className="font-extrabold text-cyan-400 text-[10px] uppercase">Suggestions:</span>
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shrink-0" />
          <span>Reduce Compatibility Threshold</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shrink-0" />
          <span>Reduce Trust Score Slider Limit</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shrink-0" />
          <span>Complete Your Profile</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shrink-0" />
          <span>Try Another Hackathon</span>
        </div>
      </div>
    </div>
  );
}
