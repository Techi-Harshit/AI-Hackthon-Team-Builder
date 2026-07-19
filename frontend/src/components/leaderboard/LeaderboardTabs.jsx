import { motion } from "framer-motion";

function LeaderboardTabs({ activeTab, onChange }) {
  const tabs = [
    { label: "Teams", value: "team" },
    { label: "Developers", value: "developer" }
  ];

  return (
    <div className="flex flex-wrap gap-2 mb-6">
      {tabs.map((tab) => {
        const isActive = tab.value === activeTab;

        return (
          <button
            key={tab.value}
            onClick={() => onChange(tab.value)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all duration-300 relative border ${
              isActive
                ? "text-white border-[#FF8A00]/25"
                : "text-gray-400 hover:text-gray-200 border-white/5 bg-[#0e1222]/10 hover:bg-[#0e1222]/30"
            }`}
          >
            {isActive && (
              <motion.div
                layoutId="activeLeaderboardCategoryTab"
                className="absolute inset-0 bg-[#FF8A00]/25 rounded-xl"
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
              />
            )}
            <span className="relative z-10 font-mono">
              {tab.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}

export default LeaderboardTabs;
