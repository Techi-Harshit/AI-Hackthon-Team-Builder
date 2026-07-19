import { motion } from "framer-motion";
import { FaChevronRight } from "react-icons/fa";
import { activeHackathons } from "../../data/discoverTeamsData";

const hackBadgeStyles = {
  purple: "bg-purple-500/20 text-cyan-300",
  green: "bg-emerald-500/20 text-emerald-300",
  cyan: "bg-cyan-500/20 text-cyan-300",
};

function ActiveHackathonsSection() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.7, delay: 0.2 }}
      className="relative overflow-hidden rounded-2xl bg-[#0e1222]/70 backdrop-blur-xl border border-white/5 p-6"
    >
      {/* Glow */}
      <div className="absolute -top-16 -right-16 w-48 h-48 bg-cyan-600/10 rounded-full blur-3xl" />

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <span>🏆</span> Active Hackathons
          </h2>
          <motion.button
            whileHover={{ scale: 1.05 }}
            className="text-xs text-[#3B82F6] hover:text-cyan-300 transition"
          >
            View All
          </motion.button>
        </div>

        <div className="space-y-3">
          {activeHackathons.map((hack, index) => (
            <motion.div
              key={hack.id}
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.15 }}
              whileHover={{ x: 4 }}
              className="flex items-center gap-3 p-3 rounded-xl bg-[#0e1222]/40 border border-white/10 cursor-pointer hover:border-[#FF8A00]/25 transition-all group"
            >
              {/* Icon */}
              <div
                className={`w-10 h-10 rounded-xl bg-gradient-to-br ${hack.iconBg} flex items-center justify-center text-lg font-bold flex-shrink-0`}
              >
                {hack.icon}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-sm text-white truncate">
                    {hack.name}
                  </h3>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${hackBadgeStyles[hack.badgeColor]}`}
                  >
                    {hack.badge}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-0.5">
                  {hack.date} • {hack.participants} Participants
                </p>
              </div>

              {/* Arrow */}
              <FaChevronRight className="text-xs text-gray-600 group-hover:text-[#3B82F6] transition flex-shrink-0" />
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

export default ActiveHackathonsSection;
