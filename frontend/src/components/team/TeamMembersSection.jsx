import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { teamInfo, teamMembers } from "../../data/myTeamData";
import { FaUserShield, FaCrown, FaPaperPlane, FaUserCircle } from "react-icons/fa";
import DeveloperDetailsModal from "../common/DeveloperDetailsModal";

const statusDotColors = {
  purple: "bg-purple-400 shadow-[#3B82F6]/50",
  emerald: "bg-emerald-400 shadow-emerald-500/50",
  amber: "bg-amber-400 shadow-amber-500/50",
};

const statusTextColors = {
  purple: "text-cyan-300 bg-[#FF8A00]/10 border-white/5",
  emerald: "text-emerald-300 bg-emerald-500/10 border-emerald-500/20",
  amber: "text-amber-300 bg-amber-500/10 border-amber-500/20",
};

import { useAuth } from "../../context/AuthContext";

function TeamMembersSection({ team, members, onRemoveMember }) {
  const { user } = useAuth();
  const [selectedMember, setSelectedMember] = useState(null);
  
  const rawMembers = members || (team && team.members) || [];
  const displayMembers = [];
  const seenIds = new Set();
  rawMembers.forEach(m => {
    const id = m._id || m.id;
    if (id && !seenIds.has(String(id))) {
      seenIds.add(String(id));
      displayMembers.push(m);
    }
  });

  const isLeader = team && team.leader && (team.leader._id === user?._id || team.leader === user?._id);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0, transition: { type: "spring", stiffness: 100 } },
  };

  return (
    <div className="space-y-8">

      {/* Members Section Header */}
      <div>
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-xl font-bold text-white heading-font flex items-center gap-2">
            Team Members
            <span className="text-xs bg-[#0e1222] text-slate-300 px-2 py-0.5 rounded-md font-mono">
              {teamMembers.length}
            </span>
          </h3>
        </div>

        {/* Member cards grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="grid grid-cols-1 md:grid-cols-2 gap-5"
        >
          {displayMembers.map((member, idx) => {
            const memberId = member._id || member.id || idx;
            const isYou = member.isYou || (user && member._id === user._id);
            const role = member.role || member.preferredRole || "Developer";
            const skills = member.skills || [];
            const status = member.status || member.availability || "Available";
            const statusColor = member.statusColor || "emerald";
            const avatar = member.avatar || (idx + 12);

            return (
              <motion.div
                key={memberId}
                variants={itemVariants}
                whileHover={{ y: -4, borderColor: "rgba(168, 85, 247, 0.3)" }}
                className="relative overflow-hidden rounded-2xl border border-white/5/80 bg-[#0e1222]/20 backdrop-blur-xl p-5 flex flex-col justify-between group text-left"
              >
                {/* Card background hover glow */}
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/0 via-purple-500/0 to-blue-500/0 group-hover:from-purple-500/5 group-hover:to-blue-500/5 transition-all duration-300" />

                <div className="relative z-10 flex items-start gap-4">
                  {/* Member Avatar */}
                  <div className="relative">
                    <motion.img
                      whileHover={{ scale: 1.08, rotate: 5 }}
                      src={member.avatar && (member.avatar.startsWith("http") || member.avatar.startsWith("data:")) ? member.avatar : `https://i.pravatar.cc/100?img=${avatar}`}
                      alt={member.name}
                      className="w-14 h-14 rounded-xl border border-white/10/50 shadow-md flex-shrink-0 object-cover"
                    />
                    <span className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-slate-950 bg-green-500" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-white text-base truncate group-hover:text-cyan-300 transition-colors">
                        {member.name}
                      </h4>
                      {isYou && (
                        <span className="px-1.5 py-0.5 text-[10px] font-bold rounded bg-blue-500/25 text-blue-300 border border-blue-500/30 font-mono uppercase tracking-wide">
                          You
                        </span>
                      )}
                    </div>
                    <p className="text-gray-400 text-xs mt-1 truncate">{role}</p>

                    <div className="flex flex-wrap gap-1 mt-3">
                      {skills.map((skill, index) => (
                        <span
                          key={index}
                          className="px-2 py-0.5 rounded text-[10px] bg-[#0e1222]/60 text-slate-400 border border-white/10/30"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Status pill & Actions */}
                <div className="relative z-10 flex items-center justify-between border-t border-white/5/60 mt-4 pt-4">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.8 rounded-full text-2xs font-semibold border ${statusTextColors[statusColor] || statusTextColors.emerald}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${statusDotColors[statusColor] || statusDotColors.emerald} animate-ping`} style={{ animationDuration: "2s" }} />
                    <span className={`w-1.5 h-1.5 rounded-full ${statusDotColors[statusColor] || statusDotColors.emerald} absolute`} />
                    {status}
                  </span>

                  {!isYou && (
                    <div className="flex items-center gap-2">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="p-2 rounded-lg bg-slate-850 hover:bg-purple-950 border border-white/8 hover:border-purple-800 text-slate-400 hover:text-cyan-300 transition-colors"
                        title="Send Message"
                      >
                        <FaPaperPlane className="text-xs" />
                      </motion.button>
                      {isLeader && memberId !== (team.leader?._id || team.leader) && (
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => onRemoveMember && onRemoveMember(memberId)}
                          className="px-2.5 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500 border border-red-500/20 hover:border-red-500 text-2xs font-semibold text-red-400 hover:text-white transition-colors"
                        >
                          Remove
                        </motion.button>
                      )}
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setSelectedMember(member)}
                        className="px-2.5 py-1.5 rounded-lg bg-slate-850 hover:bg-slate-750 border border-white/8 text-2xs font-semibold text-slate-300 transition-colors"
                      >
                        View Profile
                      </motion.button>
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>

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

export default TeamMembersSection;
