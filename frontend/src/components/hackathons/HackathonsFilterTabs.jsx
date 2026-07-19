import { motion } from "framer-motion";
import { useState } from "react";
import { FaTh, FaList, FaChevronDown } from "react-icons/fa";
import { hackathonTabs } from "../../data/hackathonsPageData";

function HackathonsFilterTabs({ activeTab = "all", onChangeTab, sortBy = "newest", onChangeSort }) {
  const [viewMode, setViewMode] = useState("grid");

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="flex items-center justify-between mb-6 border-b border-white/5 pb-4"
    >
      {/* Tabs */}
      <div className="flex gap-1">
        {hackathonTabs.map((tab) => (
          <motion.button
            key={tab.id}
            onClick={() => onChangeTab && onChangeTab(tab.id)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`relative px-4 py-2 text-sm font-medium transition-all duration-300 ${
              activeTab === tab.id
                ? "text-[#3B82F6]"
                : "text-gray-400 hover:text-gray-200"
            }`}
          >
            {activeTab === tab.id && (
              <motion.div
                layoutId="activeHackTab"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full"
                transition={{ type: "spring", bounce: 0.2, duration: 0.5 }}
              />
            )}
            <span className="relative z-10">{tab.label}</span>
          </motion.button>
        ))}
      </div>

      {/* Sort + View */}
      <div className="flex items-center gap-3">
        <span className="text-xs text-gray-500">Sort by:</span>
        <select
          value={sortBy}
          onChange={(e) => onChangeSort && onChangeSort(e.target.value)}
          className="px-4 py-2 rounded-xl bg-[#0e1222]/80 border border-white/5 text-gray-300 text-sm focus:outline-none focus:border-[#FF8A00]/40 transition"
        >
          <option value="newest">Newest</option>
          <option value="prize_high">Highest Prize</option>
          <option value="popular">Most Popular</option>
          <option value="ending_soon">Ending Soon</option>
        </select>

        {/* View Toggle */}
        <div className="flex rounded-xl overflow-hidden border border-white/5">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => setViewMode("grid")}
            className={`p-2.5 transition ${
              viewMode === "grid"
                ? "bg-[#FF8A00]/30 text-cyan-300"
                : "bg-[#0e1222] text-gray-500 hover:text-gray-300"
            }`}
          >
            <FaTh className="text-sm" />
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => setViewMode("list")}
            className={`p-2.5 transition ${
              viewMode === "list"
                ? "bg-[#FF8A00]/30 text-cyan-300"
                : "bg-[#0e1222] text-gray-500 hover:text-gray-300"
            }`}
          >
            <FaList className="text-sm" />
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}

export default HackathonsFilterTabs;
