import { motion } from "framer-motion";
import { FaGlobe, FaChevronDown, FaFire, FaTrophy } from "react-icons/fa";

function LeaderboardHero() {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-8 items-stretch"
    >
      {/* Left Title Card */}
      <div className="xl:col-span-2 rounded-3xl bg-gradient-to-br from-indigo-950/40 via-[#0e1222]/60 to-purple-950/40 backdrop-blur-xl border border-purple-500/20 p-6 sm:p-8 flex flex-col justify-center relative overflow-hidden group shadow-[0_0_25px_rgba(139,92,246,0.08)]">
        {/* Glowing atmospheric highlights */}
        <div className="absolute -top-24 -left-24 w-80 h-80 bg-purple-500/15 rounded-full blur-3xl pointer-events-none group-hover:bg-purple-500/20 transition-all duration-700" />
        <div className="absolute -bottom-24 -right-24 w-80 h-80 bg-blue-500/15 rounded-full blur-3xl pointer-events-none group-hover:bg-blue-500/20 transition-all duration-700" />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="text-left">
            <h1 className="text-3xl sm:text-4xl font-black heading-font flex items-center gap-2.5">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-amber-400 via-orange-400 to-yellow-300">
                Rankings Arena
              </span>
              <span className="inline-block animate-bounce" style={{ animationDuration: '3s' }}>🏆</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-3 max-w-xl leading-relaxed">
              Where the best minds build the future. Compete in hackathons, complete project submissions, rack up points, and cement your legacy on the global leaderboard.
            </p>
          </div>

          {/* Region Badge / Info */}
          <div className="flex items-center gap-2 self-start sm:self-auto flex-shrink-0 px-4 py-2 rounded-2xl bg-white/5 border border-white/10 text-xs font-bold text-gray-300 font-mono">
            <FaGlobe className="text-cyan-400 animate-spin" style={{ animationDuration: '8s' }} />
            <span>GLOBAL TRACK</span>
          </div>
        </div>
      </div>

      {/* Right Performer Banner Card */}
      <motion.div
        whileHover={{ y: -4, borderColor: "rgba(249,115,22,0.4)" }}
        className="rounded-3xl bg-gradient-to-br from-amber-950/40 via-[#0e1222]/80 to-purple-950/50 border border-orange-500/20 p-6 flex items-center justify-between gap-4 relative overflow-hidden group hover:shadow-[0_10px_30px_rgba(249,115,22,0.1)] transition-all duration-300"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-amber-500/5 via-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

        <div className="relative z-10 flex-1 text-left">
          <div className="flex items-center gap-1.5 text-orange-400 mb-1">
            <FaFire className="text-xs animate-pulse" />
            <span className="text-[10px] font-bold uppercase tracking-wider font-mono">Hot Performer</span>
          </div>
          <h3 className="text-sm font-extrabold text-white heading-font">Top builders this month</h3>
          <p className="text-4xs text-slate-400 font-bold uppercase tracking-wider mt-1">Compete. Climb. Conquer.</p>
          <span className="inline-block mt-4 px-3 py-1 rounded-xl text-3xs font-extrabold uppercase bg-orange-500/15 border border-orange-500/25 text-orange-300 font-mono">
            Active Season 1
          </span>
        </div>

        {/* Generated 3D Trophy Image */}
        <div className="relative w-20 h-20 flex-shrink-0 flex items-center justify-center">
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 3, repeat: Infinity }}
            className="absolute w-16 h-16 rounded-full bg-orange-500/10 blur-md"
          />
          <motion.div
            animate={{ y: [-4, 4, -4] }}
            transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
            className="relative z-10 w-16 h-16 rounded-2xl bg-gradient-to-br from-yellow-500 to-amber-600 flex items-center justify-center text-3xl text-white shadow-lg border border-yellow-300/30"
          >
            🏆
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default LeaderboardHero;
