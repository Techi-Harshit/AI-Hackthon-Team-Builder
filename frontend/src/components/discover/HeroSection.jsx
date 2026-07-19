import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { FaPlus } from "react-icons/fa";

function HeroSection({ onCreateTeamClick }) {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      className="relative overflow-hidden rounded-3xl bg-[#0e1222]/50 backdrop-blur-xl border border-white/5 p-8 mb-8"
    >
      {/* Glow effects */}
      <div className="absolute -top-20 -left-20 w-72 h-72 bg-[#3B82F6]/15 rounded-full blur-3xl" />
      <div className="absolute -bottom-20 -right-20 w-72 h-72 bg-blue-600/20 rounded-full blur-3xl" />

      <div className="relative z-10 flex items-center justify-between">
        {/* Left - Text */}
        <div className="max-w-xl text-left">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="text-4xl lg:text-5xl font-extrabold leading-tight"
          >
            <span className="page-title">Discover &amp; Join</span>{" "}
            <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
              Amazing Teams
            </span>{" "}
            <span>✨</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="text-gray-400 text-lg mt-4 leading-relaxed"
          >
            AI matches you with the best teams based on your skills, experience
            and hackathon goals.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="flex gap-4 mt-6"
          >
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={onCreateTeamClick}
              className="px-6 py-3 rounded-2xl bg-[#FF8A00] border border-[#FF8A00] text-xs font-bold text-white hover:bg-[#ff9a22] transition shadow-[0_0_15px_rgba(255,138,0,0.2)] flex items-center gap-1.5 cursor-pointer"
            >
              <FaPlus />
              Create a Team
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => {
                const el = document.getElementById("discover-teams-view") || document.querySelector(".overflow-x-auto");
                if (el) el.scrollIntoView({ behavior: "smooth" });
              }}
              className="px-6 py-3 rounded-2xl bg-[#0e1222]/80 border border-white/5 hover:border-white/10 text-xs font-bold text-white transition"
            >
              Browse Teams
            </motion.button>
          </motion.div>
        </div>

        {/* Right - Floating illustration */}
        <div className="relative hidden lg:flex items-center justify-center w-80 h-56">
          {/* Glowing Orb */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="w-40 h-40 rounded-full bg-gradient-to-br from-purple-600/40 via-blue-600/30 to-cyan-500/40 blur-sm"
          />
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 3, repeat: Infinity }}
            className="absolute w-32 h-32 rounded-full bg-gradient-to-br from-purple-500/50 to-blue-500/50 backdrop-blur-xl border border-[#FF8A00]/25"
          />

          {/* Match Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.8, type: "spring" }}
          >
            <motion.div
              animate={{ y: [-5, 5, -5] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="absolute -top-2 right-8 px-4 py-2 rounded-xl bg-emerald-500/20 backdrop-blur-xl border border-emerald-500/30 text-emerald-300 font-bold text-sm"
            >
              92% Match
            </motion.div>
          </motion.div>

          {/* Perfect Fit Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1, type: "spring" }}
          >
            <motion.div
              animate={{ y: [5, -5, 5] }}
              transition={{ duration: 3.5, repeat: Infinity }}
              className="absolute -bottom-2 right-0 px-4 py-2 rounded-xl bg-purple-500/20 backdrop-blur-xl border border-[#FF8A00]/25 text-cyan-300 font-bold text-sm flex items-center gap-2"
            >
              <span className="text-green-400">✓</span> Perfect Fit 🎯
            </motion.div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}

export default HeroSection;
