import { motion } from "framer-motion";
import { FaShareAlt, FaPlus, FaCheck } from "react-icons/fa";
import { useState } from "react";

function MyTeamHero({ team }) {
  const [copied, setCopied] = useState(false);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, type: "spring", stiffness: 100 }}
      className="relative overflow-hidden rounded-3xl bg-[#0e1222]/50 backdrop-blur-xl border border-white/5 p-8 mb-8"
    >
      {/* Background glow animations */}
      <div className="absolute -top-24 -left-24 w-80 h-80 bg-[#3B82F6]/10 rounded-full blur-3xl" />
      <div className="absolute -bottom-24 -right-24 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl" />

      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-3">
            <motion.h1
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="text-4xl lg:text-5xl font-extrabold bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent heading-font"
            >
              {team ? `${team.teamName} 👥` : "My Team 👥"}
            </motion.h1>
          </div>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-gray-400 text-lg mt-3 max-w-2xl leading-relaxed"
          >
            Manage your squad, monitor sprint progress, track tasks, and collaborate on your active hackathons.
          </motion.p>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <motion.button
            whileHover={{ scale: 1.05, borderColor: "rgba(168, 85, 247, 0.5)" }}
            whileTap={{ scale: 0.95 }}
            onClick={handleShare}
            className="relative px-5 py-3 rounded-2xl bg-[#050816]/80 border border-white/5 text-sm font-semibold flex items-center gap-2 hover:text-[#3B82F6] transition-colors"
          >
            {copied ? (
              <>
                <FaCheck className="text-emerald-400 animate-bounce" />
                <span className="text-emerald-400">Link Copied!</span>
              </>
            ) : (
              <>
                <FaShareAlt className="text-gray-400" />
                <span>Share Team</span>
              </>
            )}
          </motion.button>

          <motion.button
            whileHover={{
              scale: 1.05,
              boxShadow: "0 0 20px rgba(168, 85, 247, 0.4)",
            }}
            whileTap={{ scale: 0.95 }}
            className="px-6 py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-blue-600 text-sm font-bold flex items-center gap-2 text-white hover:shadow-lg transition-all"
          >
            <FaPlus />
            <span>Create Team</span>
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}

export default MyTeamHero;
