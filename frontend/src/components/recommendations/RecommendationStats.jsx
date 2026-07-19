import React from "react";
import { FaUserFriends, FaPercent, FaTrophy, FaUserCheck } from "react-icons/fa";

export default function RecommendationStats({ stats }) {
  const items = [
    {
      label: "Recommended Candidates",
      value: stats?.recommendedCount || 0,
      icon: <FaUserFriends className="text-cyan-400 text-lg" />,
      colorClass: "from-cyan-500/10 to-blue-500/10 border-cyan-500/10"
    },
    {
      label: "Average Compatibility",
      value: `${stats?.averageCompatibility || 0}%`,
      icon: <FaPercent className="text-emerald-400 text-lg" />,
      colorClass: "from-emerald-500/10 to-teal-500/10 border-emerald-500/10"
    },
    {
      label: "Highest Compatibility",
      value: `${stats?.highestCompatibility || 0}%`,
      icon: <FaTrophy className="text-orange-400 text-lg" />,
      colorClass: "from-orange-500/10 to-amber-500/10 border-orange-500/10"
    },
    {
      label: "Eligible Candidates",
      value: stats?.eligibleCandidates || 0,
      icon: <FaUserCheck className="text-purple-400 text-lg" />,
      colorClass: "from-purple-500/10 to-fuchsia-500/10 border-purple-500/10"
    }
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {items.map((item, idx) => (
        <div
          key={idx}
          className={`p-4 rounded-3xl bg-gradient-to-br ${item.colorClass} border backdrop-blur-md flex items-center justify-between shadow-md relative overflow-hidden`}
        >
          <div className="text-left space-y-1 relative z-10">
            <span className="block text-[9px] text-gray-500 font-black uppercase tracking-wider">
              {item.label}
            </span>
            <span className="block text-xl font-black text-white">
              {item.value}
            </span>
          </div>
          <div className="p-2.5 rounded-2xl bg-white/5 relative z-10">
            {item.icon}
          </div>
        </div>
      ))}
    </div>
  );
}
