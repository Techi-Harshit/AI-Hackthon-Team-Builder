import { motion } from "framer-motion";
import { FaArrowUp, FaUsers } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

function YourRankCard({ myRank }) {
  const navigate = useNavigate();

  if (!myRank) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="rounded-3xl border border-white/5 bg-[#050816]/50 backdrop-blur-xl p-6 text-left"
      >
        <h3 className="font-extrabold text-white text-sm heading-font mb-3">Your Team Rank</h3>
        <p className="text-2xs text-slate-500 max-w-xs leading-relaxed mb-4">
          You are not currently in any registered team for this season. Join or create a team to compete on the leaderboard!
        </p>
        <button
          onClick={() => navigate("/discover")}
          className="w-full py-2.5 rounded-xl border border-white/5 bg-white/5 text-gray-300 hover:text-white text-xs font-bold transition-all flex items-center justify-center gap-2 font-mono"
        >
          Explore Teams
        </button>
      </motion.div>
    );
  }

  const { rank, teamName, xp, growth, message } = myRank;

  // Circle animation offset calculation (we map rank to a percentage. e.g. 1st rank is 100%, 100th is 0%)
  const percentage = Math.max(10, 100 - (rank * 2));
  const radius = 28;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: 0.1 }}
      className="rounded-3xl border border-white/5 bg-[#050816]/50 backdrop-blur-xl p-6 relative overflow-hidden group hover:shadow-[0_10px_30px_rgba(168,85,247,0.08)] hover:border-white/5 transition-all duration-300 text-left"
    >
      {/* Shiny sweep */}
      <div
        className="absolute inset-0 w-[200%] bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-1/2 transition-transform duration-1000 ease-out pointer-events-none"
        style={{ transform: "skewX(-25deg)" }}
      />

      <div className="relative z-10">
        {/* Title */}
        <h3 className="font-extrabold text-white text-sm heading-font mb-5">Your Team Rank</h3>

        {/* Info Layout */}
        <div className="flex items-center gap-5 mb-5">
          {/* Circular Progress Ring */}
          <div className="relative w-18 h-18 flex items-center justify-center flex-shrink-0">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 70 70">
              <defs>
                <linearGradient id="rankGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#8b5cf6" />
                  <stop offset="100%" stopColor="#3b82f6" />
                </linearGradient>
              </defs>
              {/* Background Circle */}
              <circle
                cx="35"
                cy="35"
                r={radius}
                className="stroke-slate-850"
                strokeWidth="6"
                fill="transparent"
              />
              {/* Foreground Animated Progress Circle */}
              <motion.circle
                cx="35"
                cy="35"
                r={radius}
                stroke="url(#rankGradient)"
                strokeWidth="6"
                fill="transparent"
                strokeDasharray={circumference}
                initial={{ strokeDashoffset: circumference }}
                whileInView={{ strokeDashoffset }}
                viewport={{ once: true }}
                transition={{ duration: 1.2, ease: "easeOut" }}
                strokeLinecap="round"
              />
            </svg>
            {/* Rank inside circle */}
            <div className="absolute inset-0 flex items-center justify-center flex-col">
              <span className="font-black text-lg text-white font-mono leading-none">{rank}</span>
            </div>
          </div>

          {/* Text details */}
          <div className="min-w-0 flex-1">
            <h4 className="font-extrabold text-white text-sm truncate">{teamName}</h4>
            <p className="text-[10px] text-gray-500 font-semibold mt-0.5 truncate">{message}</p>
            <div className="flex items-center gap-2 mt-2">
              <div className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider font-mono">
                Total XP <span className="text-white font-bold ml-1">{(xp || 0).toLocaleString()}</span>
              </div>
              <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-3xs font-extrabold font-mono">
                <FaArrowUp className="text-[8px]" /> {growth || 5.2}%
              </span>
            </div>
          </div>
        </div>

        {/* View Button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => navigate("/my-team")}
          className="w-full py-2.5 rounded-xl border border-white/5 hover:border-[#FF8A00]/40 hover:bg-purple-950/20 text-gray-300 hover:text-white text-xs font-bold transition-all flex items-center justify-center gap-2 font-mono"
        >
          <FaUsers className="text-3xs text-[#3B82F6]" />
          View Team Profile
        </motion.button>
      </div>
    </motion.div>
  );
}

export default YourRankCard;
