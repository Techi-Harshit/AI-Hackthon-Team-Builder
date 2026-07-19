import { motion } from "framer-motion";
import { FaChevronRight } from "react-icons/fa";

function LeaderboardInsights({ insights }) {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: 15 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { type: "spring", stiffness: 100 },
    },
  };

  const list = [
    {
      label: "Most Active",
      value: insights?.mostActive?.name || "No records",
      icon: "⚡",
      color: "bg-amber-500/10 text-amber-400 border-amber-500/20"
    },
    {
      label: "Top Winners",
      value: insights?.topWinners?.name || "No records",
      icon: "🏆",
      color: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
    },
    {
      label: "Top Rated",
      value: insights?.topRated?.name || "No records",
      icon: "⭐",
      color: "bg-blue-500/10 text-blue-400 border-blue-500/20"
    },
    {
      label: "Fastest Growing",
      value: insights?.fastestGrowing?.name || "No records",
      icon: "📈",
      color: "bg-purple-500/10 text-purple-400 border-purple-500/20"
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: 0.2 }}
      className="rounded-3xl border border-white/5 bg-[#050816]/50 backdrop-blur-xl p-6 relative overflow-hidden group hover:shadow-[0_10px_30px_rgba(168,85,247,0.08)] hover:border-white/5 transition-all duration-300 text-left"
    >
      {/* Shiny sweep */}
      <div
        className="absolute inset-0 w-[200%] bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-1/2 transition-transform duration-1000 ease-out pointer-events-none"
        style={{ transform: "skewX(-25deg)" }}
      />

      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-extrabold text-white text-sm heading-font">Leaderboard Insights</h3>
          <button className="text-3xs font-extrabold text-[#3B82F6] hover:text-cyan-300 transition-colors uppercase tracking-wider font-mono">
            View All
          </button>
        </div>

        {/* List of Insights */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-3"
        >
          {list.map((insight, idx) => (
            <motion.div
              key={idx}
              variants={itemVariants}
              whileHover={{ x: 4, backgroundColor: "rgba(30, 41, 59, 0.2)" }}
              className="flex items-center justify-between p-2.5 rounded-2xl border border-white/5 bg-[#050816]/20 hover:border-white/5 transition-all duration-200 cursor-pointer group/row"
            >
              <div className="flex items-center gap-3">
                {/* Icon wrapper */}
                <div className={`w-9 h-9 rounded-xl border flex items-center justify-center text-sm ${insight.color} shadow-sm`}>
                  {insight.icon}
                </div>
                {/* Text details */}
                <div>
                  <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider font-mono">
                    {insight.label}
                  </p>
                  <h4 className="font-extrabold text-white text-xs mt-0.5 group-hover/row:text-cyan-300 transition-colors">
                    {insight.value}
                  </h4>
                </div>
              </div>

              {/* Arrow */}
              <FaChevronRight className="text-[10px] text-gray-700 group-hover/row:text-[#3B82F6] group-hover/row:translate-x-0.5 transition-all mr-1" />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </motion.div>
  );
}

export default LeaderboardInsights;
