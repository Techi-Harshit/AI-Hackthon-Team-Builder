import { motion } from "framer-motion";
import { useState } from "react";
import { FaRegBookmark, FaBookmark, FaPaperPlane, FaCheck, FaTrophy, FaUsers, FaCheckCircle } from "react-icons/fa";

const badgeColors = {
  emerald: "text-emerald-300 bg-emerald-500/10 border-emerald-500/20 shadow-emerald-500/5",
  cyan: "text-cyan-300 bg-cyan-500/10 border-cyan-500/20 shadow-cyan-500/5",
  amber: "text-amber-300 bg-amber-500/10 border-amber-500/20 shadow-amber-500/5",
};

const indicatorColors = {
  Available: "bg-green-500",
  Busy: "bg-amber-500",
};

function TeammateCard({ teammate, index, onOpenProfile }) {
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [inviteSent, setInviteSent] = useState(false);

  const handleInvite = () => {
    setInviteSent(true);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-30px" }}
      transition={{ type: "spring", stiffness: 100, damping: 15, delay: index * 0.05 }}
      whileHover={{ y: -4, borderColor: "rgba(168, 85, 247, 0.25)" }}
      className="relative overflow-hidden rounded-3xl border border-white/5/80 bg-[#0e1222]/15 backdrop-blur-xl p-5 sm:p-6 grid grid-cols-1 md:grid-cols-4 gap-6 items-start group"
    >
      {/* Background sweep shine */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/2 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out" />

      {/* Column 1: Profile & Info details */}
      <div className="flex gap-4 items-start col-span-1">
        <div className="relative flex-shrink-0">
          <motion.img
            whileHover={{ scale: 1.05, rotate: 2 }}
            src={teammate.avatar && (teammate.avatar.startsWith("http") || teammate.avatar.startsWith("data:")) ? teammate.avatar : `https://i.pravatar.cc/100?img=${teammate.avatar}`}
            alt={teammate.name}
            className="w-14 h-14 rounded-2xl border border-white/10/50"
          />
          <span className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-slate-950 ${
            indicatorColors[teammate.status]
          }`} />
        </div>

        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-1.5">
            <h3 className="font-extrabold text-white text-sm truncate group-hover:text-cyan-300 transition-colors">
              {teammate.name}
            </h3>
            <span className={`px-1.5 py-0.5 rounded text-[8px] font-extrabold uppercase border shadow-sm ${
              badgeColors[teammate.statusColor]
            }`}>
              {teammate.matchStatus}
            </span>
          </div>

          <p className="text-[11px] text-gray-400 mt-1 font-semibold">{teammate.role}</p>

          <div className="flex flex-col gap-0.5 mt-2.5">
            <span className="text-[10px] text-gray-500 font-bold">{teammate.experience}</span>
            <span className="flex items-center gap-1 text-[10px] font-bold text-gray-400 mt-0.5">
              <span className={`w-1.5 h-1.5 rounded-full ${indicatorColors[teammate.status]}`} />
              {teammate.status}
            </span>
          </div>
        </div>
      </div>

      {/* Column 2: Skills & Hackathons */}
      <div className="flex flex-col gap-4 col-span-1">
        <div>
          <span className="block text-4xs text-gray-500 font-bold uppercase tracking-wider mb-1.5">Top Skills</span>
          <div className="flex flex-wrap gap-1">
            {teammate.skills.map((skill, idx) => (
              <span
                key={idx}
                className="px-2 py-0.5 rounded text-[10px] bg-[#050816]/80 text-slate-350 border border-white/5"
              >
                {skill}
              </span>
            ))}
            {teammate.extraSkillsCount > 0 && (
              <span className="px-2 py-0.5 rounded text-[10px] bg-[#050816]/80 text-gray-500 border border-white/5">
                +{teammate.extraSkillsCount}
              </span>
            )}
          </div>
        </div>

        <div>
          <span className="block text-4xs text-gray-500 font-bold uppercase tracking-wider mb-1.5">Past Hackathons</span>
          <div className="flex items-center gap-2 text-2xs font-bold text-gray-300">
            <span className="flex items-center gap-1 bg-[#050816]/40 border border-white/5 px-2 py-1 rounded-lg">
              <FaTrophy className="text-amber-400" />
              {teammate.wins} {teammate.wins === 1 ? "Win" : "Wins"}
            </span>
            <span className="flex items-center gap-1 bg-[#050816]/40 border border-white/5 px-2 py-1 rounded-lg">
              <FaUsers className="text-[#3B82F6]" />
              {teammate.participations} Part.
            </span>
          </div>
        </div>
      </div>

      {/* Column 3: Match Score & Why Matched */}
      <div className="flex flex-col gap-4 col-span-1">
        <div>
          <div className="flex justify-between items-center text-2xs font-bold mb-1.5">
            <span className="text-gray-400">Match Score</span>
            <span className="text-emerald-400 font-mono">{teammate.matchScore}%</span>
          </div>
          <div className="w-full bg-[#050816]/85 rounded-full h-1.5 overflow-hidden border border-slate-855 p-[1px]">
            <motion.div
              initial={{ width: 0 }}
              whileInView={{ width: `${teammate.matchScore}%` }}
              viewport={{ once: true }}
              transition={{ duration: 1.2, ease: "easeOut" }}
              className="h-full rounded-full bg-gradient-to-r from-purple-600 via-pink-500 to-emerald-500"
            />
          </div>
        </div>

        <div>
          <span className="block text-4xs text-gray-500 font-bold uppercase tracking-wider mb-1.5">Why matched?</span>
          <ul className="space-y-1">
            {teammate.whyMatched.map((reason, idx) => (
              <li key={idx} className="flex items-start gap-1.5 text-3xs font-semibold text-gray-300 leading-normal">
                <FaCheckCircle className="text-emerald-400 mt-0.5 flex-shrink-0 text-[10px]" />
                <span>{reason}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Column 4: Actions */}
      <div className="flex flex-row md:flex-col items-center gap-2 w-full md:w-32 md:ml-auto col-span-1">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onOpenProfile && onOpenProfile(teammate)}
          className="w-full py-2 rounded-xl border border-slate-805 bg-[#0e1222]/40 hover:bg-[#0e1222] hover:border-white/10 text-3xs font-bold text-gray-350 hover:text-white transition-all text-center"
        >
          View Profile
        </motion.button>

        <motion.button
          whileHover={!inviteSent ? { scale: 1.02, boxShadow: "0 0 10px rgba(168,85,247,0.25)" } : {}}
          whileTap={!inviteSent ? { scale: 0.98 } : {}}
          onClick={handleInvite}
          disabled={inviteSent}
          className={`w-full py-2 rounded-xl text-3xs font-bold flex items-center justify-center gap-1.5 transition-all text-center border ${
            inviteSent
              ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
              : "bg-gradient-to-r from-purple-600 to-blue-600 border-[#FF8A00]/25 text-white"
          }`}
        >
          {inviteSent ? (
            <>
              <FaCheck />
              <span>Invited!</span>
            </>
          ) : (
            <>
              <FaPaperPlane className="text-[8px]" />
              <span>Send Invite</span>
            </>
          )}
        </motion.button>

        {/* Bookmark toggler */}
        <motion.button
          whileHover={{ scale: 1.15 }}
          whileTap={{ scale: 0.85 }}
          onClick={() => setIsBookmarked(!isBookmarked)}
          className={`w-8 h-8 rounded-xl border flex items-center justify-center text-xs transition-colors self-center ${
            isBookmarked
              ? "bg-purple-500/15 border-purple-500/35 text-[#3B82F6]"
              : "bg-[#0e1222]/40 border-white/5 text-gray-500 hover:text-[#3B82F6] hover:border-white/10"
          }`}
        >
          {isBookmarked ? <FaBookmark className="scale-110" /> : <FaRegBookmark />}
        </motion.button>
      </div>
    </motion.div>
  );
}

export default TeammateCard;
