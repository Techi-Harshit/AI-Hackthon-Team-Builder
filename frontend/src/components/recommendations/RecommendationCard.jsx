import React from "react";
import { motion } from "framer-motion";
import { FaGithub, FaLinkedin } from "react-icons/fa";
import InviteButton from "./InviteButton";

const CompatibilityRing = ({ score }) => {
  const radius = 26;
  const stroke = 3.5;
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  let colorClass = "stroke-red-500";
  let textClass = "text-red-400";
  if (score >= 90) {
    colorClass = "stroke-emerald-500";
    textClass = "text-emerald-400";
  } else if (score >= 75) {
    colorClass = "stroke-blue-500";
    textClass = "text-blue-400";
  } else if (score >= 60) {
    colorClass = "stroke-orange-500";
    textClass = "text-orange-400";
  }

  return (
    <div className="relative flex items-center justify-center shrink-0">
      <svg height={radius * 2} width={radius * 2} className="-rotate-90">
        <circle
          className="stroke-white/5"
          fill="transparent"
          strokeWidth={stroke}
          r={normalizedRadius}
          cx={radius}
          cy={radius}
        />
        <circle
          className={`${colorClass} transition-all duration-500`}
          fill="transparent"
          strokeWidth={stroke}
          strokeDasharray={circumference + " " + circumference}
          style={{ strokeDashoffset }}
          strokeLinecap="round"
          r={normalizedRadius}
          cx={radius}
          cy={radius}
        />
      </svg>
      <span className={`absolute text-xs font-black ${textClass}`}>{score}%</span>
    </div>
  );
};

export default function RecommendationCard({ rec, hackathonId, onViewDetails, onViewProfile }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4, scale: 1.01 }}
      className="p-5 rounded-3xl bg-[#0e1222]/40 border border-white/5 backdrop-blur-md flex flex-col justify-between space-y-4 text-left shadow-lg relative group transition overflow-hidden"
    >
      {/* Decorative hover glow */}
      <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-cyan-500/5 to-blue-500/5 opacity-0 group-hover:opacity-100 pointer-events-none transition" />

      {/* Top Info Section */}
      <div className="flex justify-between items-start gap-3 relative z-10">
        <div className="flex gap-3">
          <img
            src={rec.avatar || "https://api.dicebear.com/7.x/bottts/svg?seed=Teammate"}
            alt={rec.name}
            className="w-12 h-12 rounded-2xl bg-[#030712] border border-white/5 object-cover"
          />
          <div>
            <h3 className="font-extrabold text-sm text-white">{rec.name}</h3>
            <div className="flex flex-wrap gap-1.5 items-center mt-0.5">
              <span className="text-[10px] text-cyan-400 font-bold">{rec.preferredRole} Developer</span>
              {rec.compatibilityScore >= 90 ? (
                <span className="px-1.5 py-0.5 rounded bg-red-500/10 border border-red-500/15 text-red-400 text-[8px] font-black uppercase tracking-wider shrink-0">
                  🔥 Best Match
                </span>
              ) : rec.compatibilityScore >= 80 ? (
                <span className="px-1.5 py-0.5 rounded bg-amber-500/10 border border-amber-500/15 text-amber-400 text-[8px] font-black uppercase tracking-wider shrink-0">
                  ⭐ Highly Recommended
                </span>
              ) : rec.compatibilityScore >= 70 ? (
                <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/15 text-emerald-400 text-[8px] font-black uppercase tracking-wider shrink-0">
                  ✅ Good Match
                </span>
              ) : null}
            </div>
            <p className="text-[10px] text-gray-500 font-semibold mt-0.5">{rec.college}</p>
          </div>
        </div>
        
        <CompatibilityRing score={rec.compatibilityScore} />
      </div>

      {/* Details Box */}
      <div className="grid grid-cols-3 gap-2 bg-[#030712]/30 p-2.5 rounded-xl text-[10px] font-semibold text-gray-400 relative z-10">
        <div>
          <span className="block text-[8px] text-gray-500 uppercase font-black">Experience</span>
          <span className="text-white font-bold">{rec.experience}</span>
        </div>
        <div>
          <span className="block text-[8px] text-gray-500 uppercase font-black">Trust Score</span>
          <span className="text-cyan-400 font-bold">{rec.trustScore}/100</span>
        </div>
        <div>
          <span className="block text-[8px] text-gray-500 uppercase font-black">Completion</span>
          <span className="text-emerald-400 font-bold">{rec.profileCompletion}%</span>
        </div>
      </div>

      {/* AI Recommendation Reason */}
      {rec.recommendationReason && (
        <div className="p-3 rounded-xl bg-gradient-to-r from-purple-500/10 to-cyan-500/10 border border-purple-500/10 text-[10px] text-gray-300 italic relative z-10 leading-relaxed">
          <span className="font-extrabold text-purple-400 not-italic block mb-0.5 text-[8px] uppercase tracking-wider">
            🤖 AI Matchmaker Reason:
          </span>
          "{rec.recommendationReason}"
        </div>
      )}

      {/* Skills Match Section */}
      <div className="space-y-1.5 relative z-10 text-[10px]">
        {rec.matchedSkills && rec.matchedSkills.length > 0 && (
          <div className="flex flex-wrap gap-1 items-center">
            <span className="text-[8px] font-extrabold text-emerald-400 uppercase shrink-0 w-12 text-left">Matches:</span>
            {rec.matchedSkills.slice(0, 3).map((s, idx) => (
              <span key={idx} className="px-1.5 py-0.5 rounded text-[8px] bg-emerald-500/10 text-emerald-300 font-black">
                {s}
              </span>
            ))}
            {rec.matchedSkills.length > 3 && (
              <span className="text-[8px] text-emerald-500 font-bold">+{rec.matchedSkills.length - 3}</span>
            )}
          </div>
        )}

        {rec.missingSkills && rec.missingSkills.length > 0 && (
          <div className="flex flex-wrap gap-1 items-center">
            <span className="text-[8px] font-extrabold text-gray-500 uppercase shrink-0 w-12 text-left">Missing:</span>
            {rec.missingSkills.slice(0, 3).map((s, idx) => (
              <span key={idx} className="px-1.5 py-0.5 rounded text-[8px] bg-white/5 text-gray-400 font-semibold">
                {s}
              </span>
            ))}
            {rec.missingSkills.length > 3 && (
              <span className="text-[8px] text-gray-500 font-bold">+{rec.missingSkills.length - 3}</span>
            )}
          </div>
        )}
      </div>

      {/* Footer Actions */}
      <div className="flex justify-between items-center pt-2 border-t border-white/5 relative z-10">
        <div className="flex gap-2">
          {rec.github && (
            <a
              href={rec.github.startsWith("http") ? rec.github : `https://${rec.github}`}
              target="_blank"
              rel="noreferrer"
              className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition"
            >
              <FaGithub className="text-xs" />
            </a>
          )}
          {rec.linkedin && (
            <a
              href={rec.linkedin.startsWith("http") ? rec.linkedin : `https://${rec.linkedin}`}
              target="_blank"
              rel="noreferrer"
              className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition"
            >
              <FaLinkedin className="text-xs" />
            </a>
          )}
        </div>

        <div className="flex gap-1.5 items-center">
          <button
            onClick={() => onViewProfile(rec)}
            className="px-2 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white text-[9px] font-extrabold transition cursor-pointer"
          >
            Profile
          </button>
          <button
            onClick={() => onViewDetails(rec)}
            className="px-2 py-1.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 text-[9px] font-extrabold transition cursor-pointer"
          >
            Details
          </button>
          <InviteButton hackathonId={hackathonId} candidateId={rec.id} />
        </div>
      </div>
    </motion.div>
  );
}
