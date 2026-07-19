import { motion } from "framer-motion";
import { useState } from "react";
import { FaFilter } from "react-icons/fa";
import { filterTabs } from "../../data/discoverTeamsData";

function FilterTabs({ activeTab = "recommended", onChangeTab }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.3 }}
      className="flex items-center justify-between mb-8 animate-fade-in"
    >
      {/* Tabs */}
      <div className="flex gap-2">
        {filterTabs.map((tab) => (
          <motion.button
            key={tab.id}
            onClick={() => onChangeTab && onChangeTab(tab.id)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`relative px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 flex items-center gap-2 ${
              activeTab === tab.id
                ? "text-white"
                : "text-gray-400 hover:text-gray-200"
            }`}
          >
            {activeTab === tab.id && (
              <motion.div
                layoutId="activeFilterTab"
                className="absolute inset-0 rounded-xl bg-gradient-to-r from-[#FF8A00]/25 to-[#3B82F6]/25 border border-[#FF8A00]/25"
                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
              />
            )}
            <span className="relative z-10">{tab.icon}</span>
            <span className="relative z-10">{tab.label}</span>
          </motion.button>
        ))}
      </div>

      {/* Filter Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0e1222]/80 border border-white/5 text-gray-300 text-sm font-medium hover:border-[#FF8A00]/40 transition"
      >
        <FaFilter className="text-xs" />
        Filter
      </motion.button>
    </motion.div>
  );
}

export default FilterTabs;
