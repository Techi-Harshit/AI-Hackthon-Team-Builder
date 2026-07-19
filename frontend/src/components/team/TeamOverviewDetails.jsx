import { motion } from "framer-motion";
import { teamOverview } from "../../data/myTeamData";

function TeamOverviewDetails() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: 20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { type: "spring", stiffness: 100 },
    },
  };

  return (
    <div className="rounded-3xl border border-white/5 bg-[#0e1222]/20 backdrop-blur-xl p-6 mb-6">
      <h3 className="text-lg font-bold text-white heading-font mb-4">Team Details</h3>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-50px" }}
        className="space-y-3.5"
      >
        {teamOverview.map((item, index) => (
          <motion.div
            key={index}
            variants={itemVariants}
            whileHover={{ x: 4, transition: { duration: 0.15 } }}
            className="flex items-center gap-3 p-3 rounded-xl bg-[#050816]/45 border border-white/5 hover:border-white/5 transition-colors"
          >
            {/* Icon circle */}
            <div className="w-10 h-10 rounded-lg bg-[#0e1222] border border-white/5 flex items-center justify-center text-lg flex-shrink-0">
              {item.icon}
            </div>

            <div className="min-w-0">
              <span className="block text-4xs text-gray-500 font-bold uppercase tracking-wider">
                {item.label}
              </span>
              <span className="block text-xs font-semibold text-gray-200 mt-0.5 truncate">
                {item.value}
              </span>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}

export default TeamOverviewDetails;
