import { motion } from "framer-motion";
import { recentActivities } from "../../data/myTeamData";
import { FaHistory } from "react-icons/fa";

function RecentActivityFeed() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", stiffness: 120, damping: 15 },
    },
  };

  return (
    <div className="rounded-3xl border border-white/5 bg-[#0e1222]/20 backdrop-blur-xl p-6 mb-6">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-lg font-bold text-white heading-font flex items-center gap-2">
          <FaHistory className="text-[#3B82F6] text-base" />
          Recent Activity
        </h3>
        <button className="text-2xs font-semibold text-[#3B82F6] hover:text-cyan-300 transition-colors uppercase tracking-wider">
          View All
        </button>
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-30px" }}
        className="relative border-l border-white/5 ml-3 pl-6 space-y-5"
      >
        {recentActivities.map((act, index) => (
          <motion.div
            key={index}
            variants={itemVariants}
            className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-1 group"
          >
            {/* Timeline node */}
            <span className="absolute -left-[31px] top-1 flex h-4 w-4 items-center justify-center rounded-full border border-white/5 bg-[#050816] text-2xs shadow-md group-hover:scale-125 transition-transform duration-200">
              <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
            </span>

            <div className="min-w-0">
              <p className="text-xs font-semibold text-slate-200 group-hover:text-cyan-300 transition-colors">
                <span className="mr-1.5">{act.icon}</span>
                {act.text}
              </p>
              <span className="block text-[10px] text-gray-500 font-medium mt-1">
                {act.date}
              </span>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}

export default RecentActivityFeed;
