import React from "react";
import { FaUsers, FaTasks, FaSignal } from "react-icons/fa";

export default function TeamSummaryCard({ team }) {
  if (!team) return null;

  // Fallback defaults
  const remaining = team.remainingSlots !== undefined ? team.remainingSlots : (team.maxMembers - (team.members ? team.members.length : 0) - 1);
  const completion = team.teamCompletion !== undefined ? team.teamCompletion : Math.round(((team.maxMembers - remaining) / team.maxMembers) * 100);
  const recruitmentStatus = team.recruitmentStatus || "Recruiting";
  const requiredSkills = team.requiredSkills || [];
  const members = team.members || [];

  return (
    <div className="p-6 rounded-3xl bg-[#0e1222]/40 border border-white/5 backdrop-blur-md flex flex-col justify-between gap-5 text-left shadow-xl relative overflow-hidden group">
      {/* Glow decorative */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-purple-500/5 to-cyan-500/5 blur-2xl pointer-events-none" />

      <div className="space-y-4">
        {/* Header */}
        <div className="flex justify-between items-start flex-wrap gap-2">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-base text-white">{team.teamName}</span>
              <span className="px-2 py-0.5 rounded bg-purple-500/10 border border-purple-500/15 text-purple-400 text-[9px] font-black uppercase tracking-wider">
                {recruitmentStatus}
              </span>
            </div>
            <p className="text-[10px] text-gray-400 font-semibold mt-1">
              Recruiting team leader: {team.leader?.name || "You"}
            </p>
          </div>
          
          <div className="text-right">
            <span className="text-[9px] text-gray-500 uppercase font-black block">Open Slots</span>
            <span className="text-lg font-black text-cyan-400 flex items-center gap-1 mt-0.5 justify-end">
              <FaUsers className="text-xs" /> {remaining} / {team.maxMembers || 4}
            </span>
          </div>
        </div>

        {/* Completion Progress Bar */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center text-[10px] font-extrabold">
            <span className="text-gray-400">Team Building Progress</span>
            <span className="text-purple-400">{completion}%</span>
          </div>
          <div className="w-full h-1.5 rounded-full bg-[#030712]/60 overflow-hidden border border-white/5">
            <div 
              className="h-full bg-gradient-to-r from-purple-600 to-cyan-500 rounded-full transition-all duration-500" 
              style={{ width: `${completion}%` }}
            />
          </div>
        </div>

        {/* Required Skills */}
        <div className="space-y-1">
          <span className="text-[9px] text-gray-500 uppercase font-black block">Target Required Skills</span>
          <div className="flex flex-wrap gap-1">
            {requiredSkills.length === 0 ? (
              <span className="text-[10px] text-gray-400 italic">No specific skills listed.</span>
            ) : (
              requiredSkills.map((skill, index) => (
                <span 
                  key={index}
                  className="px-2 py-0.5 rounded bg-purple-500/5 text-purple-300 border border-purple-500/10 text-[9px] font-semibold"
                >
                  {skill}
                </span>
              ))
            )}
          </div>
        </div>

        {/* Current Members */}
        <div className="space-y-1.5">
          <span className="text-[9px] text-gray-500 uppercase font-black block">Team Roster ({members.length + 1})</span>
          <div className="flex flex-wrap gap-2">
            {/* Leader avatar */}
            <div className="flex items-center gap-1.5 p-1 px-2 rounded-lg bg-white/5 border border-white/5 text-[9px] font-bold">
              <img 
                src={team.leader?.avatar || "https://api.dicebear.com/7.x/bottts/svg?seed=Leader"} 
                className="w-4 h-4 rounded-md object-cover bg-black"
                alt="Leader"
              />
              <span className="text-gray-200 line-clamp-1 max-w-[80px]">{team.leader?.name || "Leader"} (L)</span>
            </div>
            {/* Other members */}
            {members.map((member, index) => {
              const mName = member.name || "Member";
              return (
                <div key={index} className="flex items-center gap-1.5 p-1 px-2 rounded-lg bg-white/5 border border-white/5 text-[9px] font-bold">
                  <img 
                    src={member.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=Member-${index}`} 
                    className="w-4 h-4 rounded-md object-cover bg-black"
                    alt={mName}
                  />
                  <span className="text-gray-400 line-clamp-1 max-w-[80px]">{mName}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
