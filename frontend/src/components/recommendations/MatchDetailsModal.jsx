import React from "react";
import { motion } from "framer-motion";
import { FaHeart, FaChevronRight, FaRegCheckCircle, FaExclamationCircle } from "react-icons/fa";

export default function MatchDetailsModal({ rec, onClose }) {
  if (!rec) return null;
  const scoreBreakdown = rec.scoreBreakdown || {};

  // Rule-based Recommendation Explanation Generator
  const generateExplanation = () => {
    const reasons = [];
    if ((scoreBreakdown.skills || 0) >= 25) {
      reasons.push("possesses excellent alignment with the required skills checklist of the hackathon");
    }
    if ((scoreBreakdown.role || 0) >= 12) {
      reasons.push("brings a highly complementary developer role that matches the empty slots in your team");
    } else {
      reasons.push("adds valuable support matching your team's core development focus");
    }
    if ((scoreBreakdown.interest || 0) >= 7) {
      reasons.push("shares common interest domains helping maintain project alignment");
    }
    if ((scoreBreakdown.experience || 0) >= 8) {
      reasons.push("has solid experience parameters matching or exceeding target complexity levels");
    }
    if ((scoreBreakdown.trust || 0) >= 8) {
      reasons.push("maintains an exemplary trust rating on the platform");
    }

    if (reasons.length === 0) {
      return `${rec.name} has been recommended because they meet the minimum criteria to participate.`;
    }

    const firstPart = reasons.slice(0, -1).join(", ");
    const lastPart = reasons[reasons.length - 1];
    const joined = reasons.length > 1 ? `${firstPart}, and ${lastPart}` : lastPart;
    
    return `Based on matching rules, ${rec.name} is recommended because they ${joined}. They maintain a profile completion of ${rec.profileCompletion}% and availability defined as "${rec.availability || "Anytime"}".`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-lg bg-[#0e1222]/90 border border-white/10 rounded-3xl p-6 relative backdrop-blur-xl text-left shadow-2xl space-y-6"
      >
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-gray-400 hover:text-white transition text-xs cursor-pointer p-1.5 rounded bg-white/5 font-extrabold"
        >
          ✕ Close
        </button>

        <div>
          <h3 className="text-base font-black text-white mb-1">
            Compatibility Score Details
          </h3>
          <p className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider">
            Compatibility breakdown calculation out of 100 maximum points.
          </p>
        </div>

        {/* Candidate Summary */}
        <div className="flex items-center gap-4 bg-[#030712]/30 p-3.5 rounded-2xl border border-white/5">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center text-white text-base font-black shadow-md shrink-0">
            {rec.compatibilityScore}%
          </div>
          <div>
            <h4 className="font-extrabold text-white text-sm">{rec.name}</h4>
            <p className="text-xs text-cyan-400 font-bold">{rec.preferredRole} Developer</p>
          </div>
        </div>

        {/* Reason Block */}
        <div className="bg-cyan-500/5 border border-cyan-500/10 p-3.5 rounded-2xl text-[11px] text-cyan-200 leading-relaxed font-semibold">
          <span className="block font-black text-[9px] uppercase tracking-wider text-cyan-400 mb-1">AI Recommendation Analysis:</span>
          {generateExplanation()}
        </div>

        {/* Detailed Breakdown Grid */}
        <div className="space-y-3 max-h-[30vh] overflow-y-auto pr-1">
          {[
            { label: "Skills Score", value: scoreBreakdown.skills, max: 35 },
            { label: "Role Score", value: scoreBreakdown.role, max: 15 },
            { label: "Interest Score", value: scoreBreakdown.interest, max: 10 },
            { label: "Experience Score", value: scoreBreakdown.experience, max: 10 },
            { label: "Trust Score", value: scoreBreakdown.trust, max: 10 },
            { label: "Hackathon Score", value: scoreBreakdown.hackathons, max: 5 },
            { label: "Availability Score", value: scoreBreakdown.availability, max: 5 },
            { label: "Profile Score", value: scoreBreakdown.profile, max: 5 },
            { label: "Activity Score", value: scoreBreakdown.activity, max: 5 }
          ].map((item, idx) => {
            const val = item.value || 0;
            const pct = Math.round((val / item.max) * 100);
            return (
              <div key={idx} className="space-y-1">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-gray-400">{item.label}</span>
                  <span className="text-cyan-400 font-bold">
                    {val} / {item.max} <span className="text-gray-500 font-normal">({pct}%)</span>
                  </span>
                </div>
                <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Skills Overlay details */}
        <div className="grid grid-cols-2 gap-3 text-[10px]">
          <div className="p-3 bg-[#030712]/30 rounded-xl border border-white/5 space-y-1">
            <span className="block font-black text-emerald-400 uppercase tracking-wider text-[8px] mb-1">Matched Skills</span>
            {rec.matchedSkills && rec.matchedSkills.length > 0 ? (
              <div className="flex flex-wrap gap-1">
                {rec.matchedSkills.map((s, i) => (
                  <span key={i} className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-300 font-bold">{s}</span>
                ))}
              </div>
            ) : (
              <span className="text-gray-500">None</span>
            )}
          </div>

          <div className="p-3 bg-[#030712]/30 rounded-xl border border-white/5 space-y-1">
            <span className="block font-black text-gray-500 uppercase tracking-wider text-[8px] mb-1">Missing Skills</span>
            {rec.missingSkills && rec.missingSkills.length > 0 ? (
              <div className="flex flex-wrap gap-1">
                {rec.missingSkills.map((s, i) => (
                  <span key={i} className="px-1.5 py-0.5 rounded bg-white/5 text-gray-400 font-semibold">{s}</span>
                ))}
              </div>
            ) : (
              <span className="text-gray-500">None</span>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
