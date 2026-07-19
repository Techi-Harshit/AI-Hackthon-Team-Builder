import React from "react";
import { FaTrophy, FaGamepad, FaClock, FaCheckCircle, FaExclamationCircle } from "react-icons/fa";

export default function HackathonSummaryCard({ hackathon, eligibleCount }) {
  if (!hackathon) return null;

  const isRegistered = hackathon.isRegistered || false;

  return (
    <div className="p-6 rounded-3xl bg-[#0e1222]/40 border border-white/5 backdrop-blur-md flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shadow-xl relative overflow-hidden">
      {/* Glow Effect */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-cyan-500/10 to-blue-500/10 blur-3xl pointer-events-none" />

      <div className="space-y-3 text-left">
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 rounded-full text-[9px] bg-cyan-500/10 text-cyan-400 font-extrabold uppercase tracking-wider">
            {hackathon.mode || "Online"}
          </span>
          <span className="px-2 py-0.5 rounded-full text-[9px] bg-purple-500/10 text-purple-400 font-extrabold uppercase tracking-wider">
            {hackathon.difficulty || "Intermediate"}
          </span>
        </div>
        <div>
          <h2 className="text-xl font-black text-white">{hackathon.title}</h2>
          <p className="text-xs text-gray-400 font-medium mt-0.5">
            Hosted by <span className="text-white font-semibold">{hackathon.organizerName || hackathon.organizer || "Community Host"}</span>
          </p>
        </div>

        {/* Required Skills */}
        {hackathon.requiredSkills && hackathon.requiredSkills.length > 0 && (
          <div className="flex flex-wrap gap-1.5 items-center pt-1">
            <span className="text-[9px] text-gray-500 font-black uppercase tracking-wider mr-1">Required:</span>
            {hackathon.requiredSkills.map((skill, idx) => (
              <span key={idx} className="px-2 py-0.5 rounded-lg text-[9px] bg-white/5 text-gray-300 font-semibold border border-white/5">
                {skill}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="flex flex-row md:flex-col items-center md:items-end justify-between w-full md:w-auto gap-4 border-t md:border-t-0 border-white/5 pt-4 md:pt-0 shrink-0">
        <div className="text-left md:text-right">
          <span className="block text-[9px] text-gray-500 font-black uppercase tracking-wider">Interested Domain</span>
          <span className="text-xs font-black text-cyan-400">{hackathon.domain || hackathon.technology || "AI / Web"}</span>
        </div>

        <div className="text-left md:text-right flex items-center gap-2 md:justify-end">
          {isRegistered ? (
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase">
              <FaCheckCircle className="text-[10px]" /> Registered
            </span>
          ) : (
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white/5 border border-white/5 text-gray-400 text-[10px] font-black uppercase">
              <FaExclamationCircle className="text-[10px]" /> Not Registered
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
