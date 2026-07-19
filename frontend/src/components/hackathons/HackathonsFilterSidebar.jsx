import { motion } from "framer-motion";
import { FaSearch, FaMapMarkerAlt } from "react-icons/fa";

function HackathonsFilterSidebar({
  search = "",
  onChangeSearch,
  technology = "",
  onChangeTechnology,
  difficulty = "",
  onChangeDifficulty,
  mode = "",
  onChangeMode,
  location = "",
  onChangeLocation,
  status = "",
  onChangeStatus,
  hackathonType = "",
  onChangeHackathonType,
  onReset
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full text-left"
    >
      <div className="p-5 rounded-3xl bg-[#090d1f]/60 border border-white/5 backdrop-blur-xl space-y-4">
        {/* Header Row */}
        <div className="flex items-center justify-between">
          <span className="text-xs uppercase font-extrabold text-[#3B82F6] tracking-wider flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
            Filter & Discover Hackathons
          </span>
          <motion.button
            whileHover={{ scale: 1.05 }}
            onClick={onReset}
            className="text-[11px] text-[#3B82F6] hover:text-cyan-300 transition font-black cursor-pointer uppercase tracking-wider"
          >
            Reset Filters
          </motion.button>
        </div>

        {/* Horizontal Filters Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-7 gap-4 text-xs">
          {/* Search */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">
              Search Keywords
            </label>
            <div className="relative">
              <input
                type="text"
                value={search}
                onChange={(e) => onChangeSearch && onChangeSearch(e.target.value)}
                placeholder="Search title, hosts..."
                className="w-full bg-[#020617] border border-white/5 rounded-xl py-2 pl-3 pr-8 text-xs text-white outline-none focus:border-cyan-500 transition placeholder:text-gray-600"
              />
              <FaSearch className="absolute right-2.5 top-3 text-gray-500 text-[10px]" />
            </div>
          </div>

          {/* Status */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">
              Status
            </label>
            <select
              value={status}
              onChange={(e) => onChangeStatus && onChangeStatus(e.target.value)}
              className="w-full px-2.5 py-2 text-xs rounded-xl bg-[#020617] border border-white/5 text-gray-400 focus:outline-none focus:border-cyan-500 cursor-pointer"
            >
              <option value="">All Statuses</option>
              <option value="upcoming">Upcoming</option>
              <option value="ongoing">Ongoing</option>
              <option value="completed">Completed</option>
              <option value="Published">Published</option>
              <option value="Approved">Approved</option>
            </select>
          </div>

          {/* Hackathon Type */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">
              Event Type
            </label>
            <select
              value={hackathonType}
              onChange={(e) => onChangeHackathonType && onChangeHackathonType(e.target.value)}
              className="w-full px-2.5 py-2 text-xs rounded-xl bg-[#020617] border border-white/5 text-gray-400 focus:outline-none focus:border-cyan-500 cursor-pointer"
            >
              <option value="">All Types</option>
              <option value="Open">🌍 Open Event</option>
              <option value="Student">🎓 Student Only</option>
              <option value="College">🏫 College Only</option>
              <option value="Community">🌐 Community Only</option>
            </select>
          </div>

          {/* Technology */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">
              Tech Stack
            </label>
            <select
              value={technology}
              onChange={(e) => onChangeTechnology && onChangeTechnology(e.target.value)}
              className="w-full px-2.5 py-2 text-xs rounded-xl bg-[#020617] border border-white/5 text-gray-400 focus:outline-none focus:border-cyan-500 cursor-pointer"
            >
              <option value="">All Stack</option>
              <option value="React">React</option>
              <option value="Node.js">Node.js</option>
              <option value="Python">Python</option>
              <option value="Solidity">Solidity</option>
              <option value="AI/ML">AI/ML</option>
              <option value="Figma">Figma</option>
            </select>
          </div>

          {/* Mode */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">
              Format / Mode
            </label>
            <select
              value={mode}
              onChange={(e) => onChangeMode && onChangeMode(e.target.value)}
              className="w-full px-2.5 py-2 text-xs rounded-xl bg-[#020617] border border-white/5 text-gray-400 focus:outline-none focus:border-cyan-500 cursor-pointer"
            >
              <option value="">All Formats</option>
              <option value="Online">Online</option>
              <option value="Offline">Offline</option>
              <option value="Hybrid">Hybrid</option>
            </select>
          </div>

          {/* Difficulty */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">
              Difficulty
            </label>
            <select
              value={difficulty}
              onChange={(e) => onChangeDifficulty && onChangeDifficulty(e.target.value)}
              className="w-full px-2.5 py-2 text-xs rounded-xl bg-[#020617] border border-white/5 text-gray-400 focus:outline-none focus:border-cyan-500 cursor-pointer"
            >
              <option value="">All Levels</option>
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
            </select>
          </div>

          {/* Location */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">
              Location City
            </label>
            <div className="relative">
              <input
                type="text"
                value={location}
                onChange={(e) => onChangeLocation && onChangeLocation(e.target.value)}
                placeholder="e.g. Bangalore"
                className="w-full bg-[#020617] border border-white/5 rounded-xl py-2 pl-3 pr-8 text-xs text-white outline-none focus:border-cyan-500 transition placeholder:text-gray-600"
              />
              <FaMapMarkerAlt className="absolute right-2.5 top-3 text-gray-500 text-[10px]" />
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default HackathonsFilterSidebar;
