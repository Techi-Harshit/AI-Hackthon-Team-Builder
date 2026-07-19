import { motion } from "framer-motion";
import { FaSearch, FaFilter, FaChevronDown } from "react-icons/fa";

function ApplicationsSearch() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.5 }}
      className="flex items-center gap-4 mb-6"
    >
      {/* Search Input */}
      <motion.div
        whileFocusWithin={{
          borderColor: "rgba(168, 85, 247, 0.5)",
          boxShadow: "0 0 20px rgba(168, 85, 247, 0.1)",
        }}
        className="relative flex-1 border border-white/5 rounded-xl transition-all"
      >
        <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm" />
        <input
          type="text"
          placeholder="Search teams..."
          className="w-full bg-[#0e1222]/60 rounded-xl py-3 pl-11 pr-4 text-sm text-white outline-none placeholder:text-gray-600"
        />
      </motion.div>

      {/* Status Dropdown */}
      <motion.button
        whileHover={{ scale: 1.03, borderColor: "rgba(168, 85, 247, 0.4)" }}
        whileTap={{ scale: 0.97 }}
        className="flex items-center gap-2 px-5 py-3 rounded-xl bg-[#0e1222]/60 border border-white/5 text-gray-300 text-sm font-medium transition"
      >
        All Status
        <FaChevronDown className="text-[10px] text-gray-500" />
      </motion.button>

      {/* Filter Icon */}
      <motion.button
        whileHover={{ scale: 1.1, rotate: 15 }}
        whileTap={{ scale: 0.9, rotate: -15 }}
        transition={{ type: "spring", stiffness: 400 }}
        className="w-11 h-11 rounded-xl bg-[#0e1222]/60 border border-white/5 flex items-center justify-center text-gray-400 hover:text-[#3B82F6] hover:border-purple-500/40 transition"
      >
        <FaFilter className="text-sm" />
      </motion.button>
    </motion.div>
  );
}

export default ApplicationsSearch;
