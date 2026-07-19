import { motion } from "framer-motion";
import { skillGaps, aiTips } from "../../data/recommendationsData";
import { FaGraduationCap, FaBrain, FaArrowRight, FaArrowUp } from "react-icons/fa";

function SkillSuggestionsCard() {
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
    hidden: { opacity: 0, x: 20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { type: "spring", stiffness: 100 },
    },
  };

  return (
    <div className="rounded-3xl border border-white/5 bg-[#0e1222]/20 backdrop-blur-xl p-6 mb-6">
      {/* Header */}
      <h3 className="text-lg font-bold text-white heading-font flex items-center gap-2 mb-4">
        <FaBrain className="text-[#3B82F6] text-base" />
        AI Tips & Suggestions
      </h3>

      {/* AI tips bullets */}
      <div className="space-y-3 mb-6">
        {aiTips.map((tip, idx) => (
          <div
            key={idx}
            className="p-3.5 rounded-2xl bg-purple-500/5 border border-purple-500/10 text-gray-300 text-3xs font-semibold leading-relaxed flex gap-2.5 items-start"
          >
            <span className="text-[#3B82F6] text-xs mt-0.5">💡</span>
            <span>{tip}</span>
          </div>
        ))}
      </div>

      <h4 className="text-xs font-extrabold uppercase tracking-wide text-gray-400 mb-3.5 flex items-center gap-1.5">
        <FaGraduationCap className="text-[#3B82F6] text-sm" />
        Skill Gap Analysis
      </h4>

      {/* Skill Gaps List */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-30px" }}
        className="space-y-4"
      >
        {skillGaps.map((item, index) => (
          <motion.div
            key={index}
            variants={itemVariants}
            whileHover={{ x: 4 }}
            className="p-3 rounded-2xl bg-[#050816]/45 border border-white/5 hover:border-white/5 transition-colors"
          >
            <div className="flex justify-between items-center text-2xs">
              <div>
                <span className="font-extrabold text-gray-200">{item.skill}</span>
                <span className="block text-gray-500 text-4xs font-bold uppercase tracking-wider mt-0.5">
                  {item.status}
                </span>
              </div>
              <span className="flex items-center gap-0.5 px-2 py-0.5 rounded bg-emerald-500/15 border border-emerald-500/25 text-emerald-400 text-4xs font-black uppercase font-mono">
                <FaArrowUp className="text-[7px]" />
                {item.trend}
              </span>
            </div>

            {/* Custom bar */}
            <div className="flex items-center gap-3 mt-3">
              <div className="flex-1 bg-[#0e1222] border border-white/5 rounded-full h-1.5 overflow-hidden p-[1px]">
                <motion.div
                  initial={{ width: 0 }}
                  whileInView={{ width: `${item.level}%` }}
                  viewport={{ once: true }}
                  transition={{ duration: 1.2, ease: "easeOut" }}
                  className="h-full rounded-full bg-gradient-to-r from-purple-500 to-blue-500"
                />
              </div>
              <span className="text-3xs font-mono font-bold text-gray-400">{item.level}%</span>
            </div>
          </motion.div>
        ))}
      </motion.div>

      <button className="w-full mt-6 py-2.5 rounded-xl border border-white/5 hover:border-white/10 bg-[#050816]/80 hover:bg-[#0e1222] text-[11px] font-bold text-gray-300 hover:text-white flex items-center justify-center gap-1.5 transition-all">
        <span>View Skill Suggestions</span>
        <FaArrowRight className="text-[9px]" />
      </button>
    </div>
  );
}

export default SkillSuggestionsCard;
