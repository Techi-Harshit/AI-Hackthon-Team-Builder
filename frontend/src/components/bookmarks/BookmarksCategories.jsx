import { motion } from "framer-motion";

function BookmarksCategories({ stats, activeType, onTypeChange }) {
  const categories = [
    { label: "All", type: "all", count: stats.total || 0 },
    { label: "Hackathons", type: "hackathon", count: stats.counts?.hackathons || 0 },
    { label: "Teams", type: "team", count: stats.counts?.teams || 0 },
    { label: "Projects", type: "project", count: stats.counts?.projects || 0 },
    { label: "Skills", type: "skill", count: stats.counts?.skills || 0 },
    { label: "Companies", type: "company", count: stats.counts?.companies || 0 },
    { label: "Profiles", type: "profile", count: stats.counts?.profiles || 0 },
    { label: "Organizers", type: "organizer", count: stats.counts?.organizers || 0 }
  ];

  return (
    <div className="flex flex-wrap gap-2 mb-6">
      {categories.map((cat, idx) => {
        const isActive = cat.type === activeType;

        return (
          <button
            key={idx}
            onClick={() => onTypeChange(cat.type)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all duration-300 relative border ${
              isActive
                ? "text-white border-[#FF8A00]/25"
                : "text-gray-400 hover:text-gray-200 border-white/5 bg-[#0e1222]/10 hover:bg-[#0e1222]/30"
            }`}
          >
            {isActive && (
              <motion.div
                layoutId="activeBookmarkCategoryTab"
                className="absolute inset-0 bg-[#FF8A00]/25 rounded-xl"
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
              />
            )}
            <span className="relative z-10 flex items-center gap-1.5 font-mono">
              {cat.label}
              <span className={`text-[10px] ${isActive ? "text-cyan-300" : "text-gray-500"}`}>
                ({cat.count})
              </span>
            </span>
          </button>
        );
      })}
    </div>
  );
}

export default BookmarksCategories;
