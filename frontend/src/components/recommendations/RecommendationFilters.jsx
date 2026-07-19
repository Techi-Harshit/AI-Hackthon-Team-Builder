import React from "react";
import { FaFilter, FaSearch, FaSlidersH, FaSyncAlt } from "react-icons/fa";

export default function RecommendationFilters({ filters, setFilters, sortBy, setSortBy, onReset }) {
  const handleChange = (field, val) => {
    setFilters(prev => ({ ...prev, [field]: val }));
  };

  return (
    <div className="p-6 rounded-3xl bg-[#0e1222]/40 border border-white/5 backdrop-blur-xl space-y-6 text-left shadow-xl h-fit">
      <div className="flex items-center justify-between pb-4 border-b border-white/5">
        <h3 className="text-xs font-black text-white flex items-center gap-2">
          <FaFilter className="text-cyan-400 text-[10px]" /> Compatibility Filters
        </h3>
        <button
          onClick={onReset}
          className="text-[9px] text-gray-500 hover:text-white transition cursor-pointer font-black uppercase tracking-wider flex items-center gap-1"
        >
          <FaSyncAlt className="text-[8px]" /> Reset
        </button>
      </div>

      {/* Search Candidate */}
      <div className="space-y-1.5">
        <label className="text-[9px] text-gray-500 font-black uppercase tracking-wider">Search Candidate</label>
        <div className="relative">
          <input
            type="text"
            value={filters.search}
            onChange={(e) => handleChange("search", e.target.value)}
            placeholder="Enter name..."
            className="w-full bg-[#030712]/50 border border-white/5 rounded-xl py-2 pl-8 pr-3 text-xs text-white focus:outline-none focus:border-cyan-500 transition"
          />
          <FaSearch className="absolute left-2.5 top-3 text-[9px] text-gray-500" />
        </div>
      </div>

      {/* Preferred Role */}
      <div className="space-y-1.5">
        <label className="text-[9px] text-gray-500 font-black uppercase tracking-wider">Preferred Role</label>
        <select
          value={filters.preferredRole}
          onChange={(e) => handleChange("preferredRole", e.target.value)}
          className="w-full bg-[#030712]/50 border border-white/5 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-cyan-500 transition cursor-pointer appearance-none"
        >
          <option value="">All Roles</option>
          {["Frontend", "Backend", "Full Stack", "AI/ML", "UI/UX", "DevOps", "Mobile", "Blockchain"].map(role => (
            <option key={role} value={role}>{role}</option>
          ))}
        </select>
      </div>

      {/* College */}
      <div className="space-y-1.5">
        <label className="text-[9px] text-gray-500 font-black uppercase tracking-wider">College</label>
        <input
          type="text"
          value={filters.college}
          onChange={(e) => handleChange("college", e.target.value)}
          placeholder="Search by college..."
          className="w-full bg-[#030712]/50 border border-white/5 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-cyan-500 transition"
        />
      </div>

      {/* Interested Domain */}
      <div className="space-y-1.5">
        <label className="text-[9px] text-gray-500 font-black uppercase tracking-wider">Interested Domain</label>
        <input
          type="text"
          value={filters.interestedDomain}
          onChange={(e) => handleChange("interestedDomain", e.target.value)}
          placeholder="Web, AI, Cloud..."
          className="w-full bg-[#030712]/50 border border-white/5 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-cyan-500 transition"
        />
      </div>

      {/* Experience */}
      <div className="space-y-1.5">
        <label className="text-[9px] text-gray-500 font-black uppercase tracking-wider">Experience Level</label>
        <select
          value={filters.experience}
          onChange={(e) => handleChange("experience", e.target.value)}
          className="w-full bg-[#030712]/50 border border-white/5 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-cyan-500 transition cursor-pointer"
        >
          <option value="">Any Experience</option>
          {["Beginner", "Intermediate", "Advanced"].map(exp => (
            <option key={exp} value={exp}>{exp}</option>
          ))}
        </select>
      </div>

      {/* Availability */}
      <div className="space-y-1.5">
        <label className="text-[9px] text-gray-500 font-black uppercase tracking-wider">Availability</label>
        <select
          value={filters.availability}
          onChange={(e) => handleChange("availability", e.target.value)}
          className="w-full bg-[#030712]/50 border border-white/5 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-cyan-500 transition cursor-pointer"
        >
          <option value="">Any Availability</option>
          {["Anytime", "Weekends", "Part-Time", "Full-Time"].map(av => (
            <option key={av} value={av}>{av}</option>
          ))}
        </select>
      </div>

      {/* Sort By */}
      <div className="space-y-1.5">
        <label className="text-[9px] text-gray-500 font-black uppercase tracking-wider">Sort Candidates By</label>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="w-full bg-[#030712]/50 border border-white/5 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-cyan-500 transition cursor-pointer"
        >
          {["Highest Compatibility", "Highest Trust", "Newest", "Most Active", "Most Experienced"].map(option => (
            <option key={option} value={option}>{option}</option>
          ))}
        </select>
      </div>

      {/* Slider: Min Compatibility */}
      <div className="space-y-2">
        <div className="flex justify-between text-[9px] font-black uppercase text-gray-500">
          <span>Min Compatibility</span>
          <span className="text-cyan-400 font-bold">{filters.minCompatibility}%</span>
        </div>
        <input
          type="range"
          min="0"
          max="100"
          value={filters.minCompatibility}
          onChange={(e) => handleChange("minCompatibility", Number(e.target.value))}
          className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-cyan-500"
        />
      </div>

      {/* Slider: Min Trust Score */}
      <div className="space-y-2">
        <div className="flex justify-between text-[9px] font-black uppercase text-gray-500">
          <span>Min Trust Score</span>
          <span className="text-cyan-400 font-bold">{filters.minTrustScore}</span>
        </div>
        <input
          type="range"
          min="0"
          max="100"
          value={filters.minTrustScore}
          onChange={(e) => handleChange("minTrustScore", Number(e.target.value))}
          className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-cyan-500"
        />
      </div>

      {/* Slider: Min Profile Completion */}
      <div className="space-y-2">
        <div className="flex justify-between text-[9px] font-black uppercase text-gray-500">
          <span>Min Profile Completion</span>
          <span className="text-cyan-400 font-bold">{filters.minProfileCompletion}%</span>
        </div>
        <input
          type="range"
          min="0"
          max="100"
          value={filters.minProfileCompletion}
          onChange={(e) => handleChange("minProfileCompletion", Number(e.target.value))}
          className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-cyan-500"
        />
      </div>
    </div>
  );
}
