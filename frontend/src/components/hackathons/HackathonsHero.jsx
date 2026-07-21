import { motion } from "framer-motion";
import { hackathonStats } from "../../data/hackathonsPageData";

function HackathonsHero() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="mb-8"
    >
      <div className="flex items-start justify-between">
        {/* Left */}
        <div>
          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="text-4xl lg:text-5xl font-extrabold page-title"
          >
            Hackathons{" "}
            <span className="inline-block">🏆</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="text-gray-400 text-base mt-2 mt-2 leading-relaxed"
          >
            Discover hackathons and find the perfect opportunity to build,
            innovate and win.
          </motion.p>
        </div>

        {/* Right - Stats */}
        <div className="flex items-center gap-4">
          {/* Stats */}
          <div className="hidden xl:flex items-center gap-3">
            {hackathonStats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 + index * 0.1, type: "spring" }}
                whileHover={{ scale: 1.05, y: -3 }}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl bg-gradient-to-br ${stat.color} border ${stat.border} backdrop-blur-xl`}
              >
                <span className="text-lg">{stat.icon}</span>
                <div>
                  <p className="text-xl font-bold text-white">{stat.value}</p>
                  <p className="text-[10px] text-gray-400">{stat.label}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default HackathonsHero;
