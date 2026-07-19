import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaTimes,
  FaUsers,
  FaCheck,
  FaUserPlus,
  FaTrophy,
  FaChartPie,
  FaCode,
} from "react-icons/fa";
import api from "../../api/axios";
import DeveloperDetailsModal from "../common/DeveloperDetailsModal";

import { useAuth } from "../../context/AuthContext";

const defaultSkills = ["React", "Node.js", "MongoDB", "Python", "TypeScript"];

function TeamDetailsModal({ team, onClose }) {
  const { user } = useAuth();
  const [joined, setJoined] = useState(false);
  const [loading, setLoading] = useState(false);
  const [compatScore, setCompatScore] = useState(0);
  const [selectedMember, setSelectedMember] = useState(null);

  // Animate compatibility score
  useEffect(() => {
    let current = 0;
    const target = team.match || team.matchScore || 85;
    const timer = setInterval(() => {
      current += 2;
      if (current >= target) {
        current = target;
        clearInterval(timer);
      }
      setCompatScore(current);
    }, 20);
    return () => clearInterval(timer);
  }, [team]);

  // Handle join request
  const handleApply = async () => {
    setLoading(true);
    try {
      await api.post("/applications", {
        teamId: team._id || team.id,
        message: "Hi, I would love to join your team and contribute to your hackathon project!",
      });
      setJoined(true);
    } catch (err) {
      console.error("Error applying to team:", err);
    } finally {
      setLoading(false);
    }
  };

  const skillsList = team.skills || team.requiredSkills || defaultSkills;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
      />

      {/* Modal Content */}
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 30 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 30 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        className="
          relative
          w-full
          max-w-4xl
          bg-[#0e1222]/90
          backdrop-blur-2xl
          border
          border-white/8
          rounded-[32px]
          shadow-[0_25px_60px_rgba(5,8,22,0.85)]
          overflow-hidden
          z-10
          flex
          flex-col
          max-h-[90vh]
        "
      >
        {/* Background Accent Glows */}
        <div className="absolute -top-32 -left-32 w-72 h-72 bg-[#FF8A00]/5 blur-3xl rounded-full pointer-events-none" />
        <div className="absolute -bottom-32 -right-32 w-72 h-72 bg-[#3B82F6]/10 blur-3xl rounded-full pointer-events-none" />

        {/* Modal Header */}
        <div className="p-6 border-b border-white/5 flex justify-between items-center relative z-10">
          <div className="flex items-center gap-4 text-left">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-600 to-blue-500 flex items-center justify-center text-2xl border border-white/10 font-bold text-white shadow-md shrink-0">
              {team.avatar || (team.teamName ? team.teamName.charAt(0).toUpperCase() : "T")}
            </div>
            <div>
              <h2 className="text-xl md:text-2xl font-black text-white">
                {team.teamName || team.name}
              </h2>
              <p className="text-xs text-[#3B82F6] font-bold flex items-center gap-1.5 mt-0.5">
                <FaTrophy className="text-slate-500" />
                {team.hackathonName || team.hackathon || "Smart India Hackathon"}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-[#050816] hover:bg-slate-900 border border-white/5 flex items-center justify-center text-slate-400 hover:text-white transition"
          >
            <FaTimes />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-8 overflow-y-auto grid md:grid-cols-[1.2fr_1fr] gap-8 relative z-10 flex-1 min-h-0">
          
          {/* Left Column: Details & Members */}
          <div className="space-y-6 text-left">
            
            {/* Project description */}
            <div>
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Project Concept</h4>
              <p className="text-slate-300 text-xs md:text-sm leading-relaxed">
                {team.description || "Building an automated SaaS builder tool connecting developers globally utilizing neural matching components."}
              </p>
            </div>

            {/* Current members */}
            <div>
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Current Members</h4>
              <div className="space-y-2">
                {(team.members || [
                  { name: "Ashish Kumar", email: "ashish@example.com", role: "Team Leader" },
                  { name: "Kunal Rawat", email: "kunal@example.com", role: "Frontend Dev" }
                ]).map((member, mIdx) => {
                  const devName = member.name || (member._id ? `Developer ${member._id.slice(-4)}` : "Teammate");
                  const devRole = member.preferredRole || (mIdx === 0 ? "Team Leader" : "Full Stack Developer");
                  const imgIdx = member.img || (mIdx * 3 + 12);
                  const avatarSrc = member.avatar && (member.avatar.startsWith("http") || member.avatar.startsWith("data:"))
                      ? member.avatar
                      : `https://i.pravatar.cc/50?img=${imgIdx}`;
                  return (
                    <div
                      key={mIdx}
                      onClick={() => setSelectedMember(member)}
                      className="flex items-center gap-3 p-3 rounded-2xl border border-white/5 bg-[#050816]/40 hover:bg-[#050816]/70 transition-colors cursor-pointer"
                    >
                      <img src={avatarSrc} alt="" className="w-8 h-8 rounded-full border border-white/10 object-cover" />
                      <div className="leading-tight">
                        <p className="text-xs font-bold text-slate-200">{devName}</p>
                        <span className="text-[9px] text-[#3B82F6] font-bold mt-0.5 block">{devRole}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Open Slots */}
            <div>
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2.5">Open Skill Roles Seeking</h4>
              <div className="flex flex-wrap gap-2">
                {skillsList.map((skill, idx) => (
                  <span
                    key={idx}
                    className="bg-[#3B82F6]/10 text-cyan-400 border border-[#3B82F6]/25 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>

          </div>

          {/* Right Column: Visual Charts & Metrics */}
          <div className="space-y-6 text-left border-l border-white/5 md:pl-8">
            
            {/* Compatibility score dial */}
            <div className="rounded-3xl border border-white/5 bg-[#050816]/30 p-5 flex items-center justify-between gap-4">
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Synergy Index</h4>
                <p className="text-[10px] text-slate-500 font-semibold mt-1">AI calculated project overlap fit</p>
              </div>

              {/* Dial widget */}
              <div className="relative w-20 h-20 flex items-center justify-center shrink-0">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="38" stroke="#050816" strokeWidth="6" fill="none" />
                  <circle cx="50" cy="50" r="38" stroke="#FF8A00" strokeWidth="6" strokeDasharray="238" strokeDashoffset={238 - (238 * compatScore) / 100} strokeLinecap="round" fill="none" />
                </svg>
                <div className="absolute text-center leading-none">
                  <p className="text-xs font-black text-white">{compatScore}%</p>
                  <span className="text-[6px] text-slate-500 font-bold uppercase">match</span>
                </div>
              </div>
            </div>

            {/* Stack coverage horizontal bars */}
            <div className="rounded-3xl border border-white/5 bg-[#050816]/30 p-5 space-y-4">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Teammate Stack Strength</h4>
              
              <div className="space-y-3">
                {[
                  { name: "Frontend Development", pct: 90, color: "bg-cyan-400" },
                  { name: "Backend Architecture", pct: 85, color: "bg-purple-500" },
                  { name: "Database & Storage", pct: 78, color: "bg-emerald-400" },
                  { name: "Product Design", pct: 60, color: "bg-[#FF8A00]" },
                ].map((bar, idx) => (
                  <div key={idx}>
                    <div className="flex justify-between text-[10px] text-slate-400 mb-1 font-bold">
                      <span>{bar.name}</span>
                      <span>{bar.pct}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-[#050816] rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${bar.pct}%` }}
                        transition={{ duration: 1, delay: idx * 0.1 }}
                        className={`h-full ${bar.color} rounded-full`}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* CSS Experience Column Distribution chart */}
            <div className="rounded-3xl border border-white/5 bg-[#050816]/30 p-5">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Teammate Experience Matrix</h4>
              
              <div className="flex justify-between items-end h-20 pt-4 border-b border-white/5">
                {[
                  { label: "Beginner", height: "h-6", pct: "25%" },
                  { label: "Intermediate", height: "h-14", pct: "50%" },
                  { label: "Advanced", height: "h-10", pct: "25%" },
                ].map((col, idx) => (
                  <div key={idx} className="flex flex-col items-center gap-1.5 w-1/3">
                    <span className="text-[8px] text-slate-500 font-bold">{col.pct}</span>
                    <div className={`w-6 bg-gradient-to-t from-[#3B82F6] to-cyan-400 rounded-t-sm ${col.height} shadow-[0_0_10px_rgba(59,130,246,0.2)]`} />
                    <span className="text-[7px] text-slate-500 font-bold uppercase tracking-wider mt-1">{col.label}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>

        {/* Modal Footer */}
        <div className="p-6 border-t border-white/5 bg-[#050816]/40 flex justify-end items-center relative z-10">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-full text-xs font-bold text-slate-400 hover:text-white transition"
          >
            Cancel
          </button>
          
          {(() => {
            const isLeader = team.leader && (String(team.leader._id || team.leader) === String(user?._id));
            const isMember = team.members && team.members.some(m => String(m._id || m) === String(user?._id));
            const isDisabled = joined || loading || isLeader || isMember;
            
            let btnClass = "bg-[#FF8A00] border border-[#FF8A00] shadow-[0_0_15px_rgba(255,138,0,0.25)] hover:bg-[#ff9a22]";
            if (isLeader) {
              btnClass = "bg-purple-600/20 border border-purple-500/30 text-purple-300 cursor-not-allowed";
            } else if (isMember) {
              btnClass = "bg-emerald-600/20 border border-emerald-500/30 text-emerald-300 cursor-not-allowed";
            } else if (joined) {
              btnClass = "bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 cursor-default";
            }

            return (
              <motion.button
                whileHover={!isDisabled ? { scale: 1.05 } : {}}
                whileTap={!isDisabled ? { scale: 0.95 } : {}}
                onClick={handleApply}
                disabled={isDisabled}
                className={`
                  ml-4
                  px-8
                  py-3
                  rounded-full
                  text-xs
                  font-bold
                  tracking-wider
                  text-white
                  transition-all
                  duration-300
                  flex
                  items-center
                  gap-2
                  ${btnClass}
                `}
              >
                {isLeader ? (
                  <>
                    <FaCheck />
                    <span>Your Team (Leader)</span>
                  </>
                ) : isMember ? (
                  <>
                    <FaCheck />
                    <span>Already a Member</span>
                  </>
                ) : joined ? (
                  <>
                    <FaCheck />
                    <span>Request Pending</span>
                  </>
                ) : loading ? (
                  <span>Sending...</span>
                ) : (
                  <>
                    <FaUserPlus />
                    <span>Request to Join Team</span>
                  </>
                )}
              </motion.button>
            );
          })()}
        </div>

      </motion.div>

      <AnimatePresence>
        {selectedMember && (
          <DeveloperDetailsModal
            developer={selectedMember}
            onClose={() => setSelectedMember(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

export default TeamDetailsModal;
