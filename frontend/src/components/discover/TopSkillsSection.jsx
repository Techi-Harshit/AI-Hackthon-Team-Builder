import { motion } from "framer-motion";
import { topSkills } from "../../data/discoverTeamsData";

function TopSkillsSection() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.7, delay: 0.1 }}
      className="relative overflow-hidden rounded-2xl bg-[#0e1222]/70 backdrop-blur-xl border border-white/5 p-6"
    >
      {/* Glow */}
      <div className="absolute -bottom-16 -right-16 w-48 h-48 bg-blue-600/10 rounded-full blur-3xl" />

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <span>🔥</span> Top Skills in Demand
          </h2>
          <motion.button
            whileHover={{ scale: 1.05 }}
            className="text-xs text-[#3B82F6] hover:text-cyan-300 transition"
          >
            View All
          </motion.button>
        </div>

        <div className="space-y-4">
          {topSkills.map((skill, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group"
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-sm text-gray-300 font-medium">
                  {skill.name}
                </span>
                <span className="text-xs text-gray-500 font-semibold">
                  {skill.percentage}%
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-[#0e1222] overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  whileInView={{ width: `${skill.percentage}%` }}
                  viewport={{ once: true }}
                  transition={{
                    duration: 1,
                    delay: index * 0.15,
                    ease: "easeOut",
                  }}
                  className={`h-full rounded-full bg-gradient-to-r ${skill.color}`}
                />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

export default TopSkillsSection;
