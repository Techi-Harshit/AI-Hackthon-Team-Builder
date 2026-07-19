import { motion } from "framer-motion";
import { FaSearch, FaFilter, FaRegBookmark } from "react-icons/fa";

function BookmarksHero({ searchValue, onSearchChange, activeFilter, onFilterClick }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col xl:flex-row xl:items-center justify-between gap-6 mb-8 bg-[#0e1222]/40 backdrop-blur-xl border border-white/5 p-6 sm:p-8 rounded-3xl relative overflow-hidden"
    >
      <div className="absolute -top-24 -left-24 w-80 h-80 bg-[#FF8A00]/5 rounded-full blur-3xl pointer-events-none" />

      {/* Title */}
      <div>
        <div className="flex items-center gap-2.5">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white heading-font flex items-center gap-2">
            Bookmarks
          </h1>
          <span className="text-[#3B82F6] text-2xl flex items-center justify-center">
            <FaRegBookmark />
          </span>
        </div>
        <p className="text-xs sm:text-sm text-gray-400 mt-2 max-w-xl leading-relaxed">
          All your saved teams, hackathons, and opportunities in one place.
        </p>
      </div>

      {/* Search Input Control */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="relative w-full sm:w-[320px]">
          <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 text-xs" />
          <input
            type="text"
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search saved items..."
            className="w-full bg-[#050816]/80 border border-white/5 rounded-2xl py-3 pl-9 pr-12 text-xs outline-none text-white focus:border-purple-500 transition-all placeholder:text-gray-600 font-mono"
          />
          <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 text-xs pointer-events-none font-mono">
            {searchValue ? "🔍" : ""}
          </span>
        </div>
      </div>
    </motion.div>
  );
}

export default BookmarksHero;
