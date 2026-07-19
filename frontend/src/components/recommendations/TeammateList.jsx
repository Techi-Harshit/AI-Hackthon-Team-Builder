import { motion } from "framer-motion";
import { useState } from "react";
import TeammateCard from "./TeammateCard";
import { recommendedTeammates as initialTeammates } from "../../data/recommendationsData";
import { FaSortAmountDown, FaFilter, FaArrowRight, FaSync } from "react-icons/fa";

function TeammateList({ onOpenProfile }) {
  const [teammates, setTeammates] = useState(initialTeammates);
  const [sortBy, setSortBy] = useState("best-match");
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleSortChange = (e) => {
    const val = e.target.value;
    setSortBy(val);

    // Simulate refresh/sort animation
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      let sorted = [...teammates];
      if (val === "best-match") {
        sorted.sort((a, b) => b.matchScore - a.matchScore);
      } else if (val === "experience") {
        // Parse experience float out, e.g. "2.3 yrs" -> 2.3
        const getExp = (str) => parseFloat(str.split(" ")[0]);
        sorted.sort((a, b) => getExp(b.experience) - getExp(a.experience));
      }
      setTeammates(sorted);
    }, 600);
  };

  return (
    <div className="space-y-6">
      {/* Header controls row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
        <h3 className="text-xl font-bold text-white heading-font flex items-center gap-2">
          Top AI Recommended Teammates
          {isRefreshing && (
            <FaSync className="text-[#3B82F6] text-xs animate-spin" />
          )}
        </h3>

        {/* Sort & Filter controls */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <select
              value={sortBy}
              onChange={handleSortChange}
              className="appearance-none bg-[#050816]/80 border border-white/5 rounded-xl py-2 pl-4 pr-10 text-xs font-semibold text-gray-300 outline-none focus:border-purple-500 transition-colors cursor-pointer"
            >
              <option value="best-match">Sort by: Best Match</option>
              <option value="experience">Sort by: Experience</option>
            </select>
            <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none text-2xs">
              <FaSortAmountDown />
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="w-9 h-9 rounded-xl bg-[#050816]/80 border border-white/5 flex items-center justify-center text-gray-400 hover:text-[#3B82F6] hover:border-white/10 transition-colors"
          >
            <FaFilter className="text-xs" />
          </motion.button>
        </div>
      </div>

      {/* Cards stack */}
      <div className="space-y-5 relative min-h-[200px]">
        {isRefreshing ? (
          <div className="absolute inset-0 flex items-center justify-center bg-[#050816]/10 backdrop-blur-3xs rounded-3xl z-20">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
              className="w-10 h-10 rounded-full border-t-2 border-r-2 border-purple-500"
            />
          </div>
        ) : null}

        {teammates.map((teammate, index) => (
          <TeammateCard key={teammate.id} teammate={teammate} index={index} onOpenProfile={onOpenProfile} />
        ))}
      </div>

      {/* Bottom Improve Profile Banner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="rounded-3xl border border-white/5 bg-gradient-to-r from-purple-950/20 via-indigo-950/10 to-slate-900/30 p-6 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden group"
      >
        <div className="absolute top-0 right-0 w-44 h-44 bg-[#FF8A00]/5 rounded-full blur-2xl pointer-events-none" />

        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#FF8A00]/10 border border-white/5 flex items-center justify-center text-[#3B82F6] text-xl flex-shrink-0 group-hover:scale-110 transition-transform">
            ⚡
          </div>
          <div>
            <h4 className="font-bold text-white text-sm sm:text-base heading-font">Want even better matches?</h4>
            <p className="text-xs text-gray-400 mt-1 max-w-xl">
              Complete your profile and add more skills to improve AI recommendations.
            </p>
          </div>
        </div>

        <motion.button
          whileHover={{ scale: 1.05, boxShadow: "0 0 20px rgba(168,85,247,0.4)" }}
          whileTap={{ scale: 0.95 }}
          className="px-5 py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-blue-600 border border-[#FF8A00]/25 text-xs font-bold text-white flex items-center gap-2 hover:shadow-lg transition-all self-stretch md:self-auto justify-center"
        >
          <span>Improve My Profile</span>
          <FaArrowRight className="text-3xs animate-pulse" />
        </motion.button>
      </motion.div>
    </div>
  );
}

export default TeammateList;
