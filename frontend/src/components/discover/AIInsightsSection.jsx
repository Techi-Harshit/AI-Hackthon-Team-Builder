import { motion } from "framer-motion";
import { aiInsights } from "../../data/discoverTeamsData";

function AIInsightsSection() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.7 }}
      className="relative overflow-hidden rounded-2xl bg-[#0e1222]/70 backdrop-blur-xl border border-white/5 p-6"
    >
      {/* Glow */}
      <div className="absolute -top-16 -left-16 w-48 h-48 bg-[#3B82F6]/10 rounded-full blur-3xl" />

      <div className="relative z-10">
        <h2 className="text-lg font-bold mb-1 flex items-center gap-2">
          <span>🤖</span> AI Team Insights
        </h2>
        <p className="text-xs text-gray-500 mb-5">Based on your profile</p>

        <div className="space-y-4">
          {aiInsights.map((insight, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.15 }}
              whileHover={{ x: 6 }}
              className={`flex items-start gap-3 p-3 rounded-xl bg-gradient-to-r ${insight.color} border ${insight.borderColor} cursor-pointer transition-all`}
            >
              <span className="text-2xl mt-0.5">{insight.icon}</span>
              <div>
                <h3 className="font-semibold text-sm text-white">
                  {insight.title}
                </h3>
                <p className="text-xs text-gray-400 mt-1">
                  {insight.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

export default AIInsightsSection;
