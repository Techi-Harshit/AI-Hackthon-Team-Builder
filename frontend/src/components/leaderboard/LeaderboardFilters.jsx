import { useState } from "react";
import { motion } from "framer-motion";
import { FaFilter } from "react-icons/fa";

function LeaderboardFilters({ onApply, onReset }) {
  const [timePeriod, setTimePeriod] = useState("thisMonth");
  const [category, setCategory] = useState("all");
  const [region, setRegion] = useState("Global");

  const handleReset = () => {
    setTimePeriod("thisMonth");
    setCategory("all");
    setRegion("Global");
    if (onReset) onReset();
  };

  const handleApply = () => {
    if (onApply) {
      onApply({
        timePeriod,
        category: category === "all" ? undefined : category,
        region: region === "Global" ? undefined : region
      });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className="rounded-3xl border border-white/5 bg-[#050816]/50 backdrop-blur-xl p-6 relative overflow-hidden group hover:shadow-[0_10px_30px_rgba(168,85,247,0.08)] transition-all duration-300 text-left"
    >
      {/* Shiny diagonal reflection sweep */}
      <div
        className="absolute inset-0 w-[200%] bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-1/2 transition-transform duration-1000 ease-out pointer-events-none"
        style={{ transform: "skewX(-25deg)" }}
      />

      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-extrabold text-white text-sm heading-font">Filters</h3>
          <button
            onClick={handleReset}
            className="text-xs font-bold text-[#3B82F6] hover:text-cyan-300 transition-colors uppercase tracking-wider font-mono"
          >
            Reset
          </button>
        </div>

        {/* Inputs stack */}
        <div className="space-y-4">
          {/* Time Period */}
          <div>
            <label className="block text-[10px] uppercase font-bold tracking-wider text-gray-500 mb-1.5 font-mono">
              Time Period
            </label>
            <select
              value={timePeriod}
              onChange={(e) => setTimePeriod(e.target.value)}
              className="w-full bg-[#0e1222]/60 border border-white/5 hover:border-white/10 focus:border-purple-500 rounded-xl py-2.5 px-4 text-xs text-gray-300 font-semibold outline-none transition-colors cursor-pointer font-mono"
            >
              <option value="thisMonth">This Month</option>
              <option value="lastMonth">Last Month</option>
              <option value="allTime">All Time</option>
            </select>
          </div>

          {/* Category */}
          <div>
            <label className="block text-[10px] uppercase font-bold tracking-wider text-gray-500 mb-1.5 font-mono">
              Category Focus
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-[#0e1222]/60 border border-white/5 hover:border-white/10 focus:border-purple-500 rounded-xl py-2.5 px-4 text-xs text-gray-300 font-semibold outline-none transition-colors cursor-pointer font-mono"
            >
              <option value="all">All Focuses</option>
              <option value="AI">AI / ML</option>
              <option value="Web">Web Development</option>
              <option value="Blockchain">Blockchain</option>
            </select>
          </div>

          {/* Region */}
          <div>
            <label className="block text-[10px] uppercase font-bold tracking-wider text-gray-500 mb-1.5 font-mono">
              Region
            </label>
            <select
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              className="w-full bg-[#0e1222]/60 border border-white/5 hover:border-white/10 focus:border-purple-500 rounded-xl py-2.5 px-4 text-xs text-gray-300 font-semibold outline-none transition-colors cursor-pointer font-mono"
            >
              <option value="Global">Global</option>
              <option value="India">India</option>
              <option value="USA">USA</option>
            </select>
          </div>

          {/* Apply button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleApply}
            className="w-full py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-blue-600 border border-white/10 text-xs font-bold text-white flex items-center justify-center gap-2 hover:shadow-[0_0_15px_rgba(168,85,247,0.3)] transition-all font-mono"
          >
            <FaFilter className="text-3xs" />
            <span>Apply Filters</span>
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}

export default LeaderboardFilters;
