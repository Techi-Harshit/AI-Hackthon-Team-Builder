import { motion } from "framer-motion";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  ResponsiveContainer,
} from "recharts";

const data = [
  { skill: "Frontend", value: 90 },
  { skill: "Backend", value: 80 },
  { skill: "DSA", value: 75 },
  { skill: "AI/ML", value: 65 },
  { skill: "UI/UX", value: 85 },
];

function SkillMatchChart() {
  return (
    <motion.div
      initial={{ opacity: 0, x: 80 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      className="
      bg-[#0e1222]/70
      backdrop-blur-xl
      border
      border-white/5
      rounded-3xl
      p-6
      relative
      overflow-hidden
      "
    >
      <div className="absolute top-0 right-0 w-40 h-40 bg-[#FF8A00]/10 rounded-full blur-3xl" />

      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">
          Skill Match Overview
        </h2>

        <button
          className="
          px-4
          py-2
          rounded-xl
          bg-[#0e1222]
          hover:bg-[#FF8A00]
          transition
          "
        >
          View Details
        </button>
      </div>

      <motion.div
        animate={{
          rotate: [0, 2, 0, -2, 0],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
        }}
        className="h-72"
      >
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={data}>
            <PolarGrid />
            <PolarAngleAxis dataKey="skill" />

            <Radar
              dataKey="value"
              stroke="#a855f7"
              fill="#9333ea"
              fillOpacity={0.5}
            />
          </RadarChart>
        </ResponsiveContainer>
      </motion.div>

      <div className="grid grid-cols-2 gap-3 mt-4">
        {data.map((item, index) => (
          <motion.div
            key={index}
            whileHover={{
              scale: 1.05,
            }}
            className="
            rounded-xl
            bg-[#050816]/60
            border
            border-white/5
            p-3
            text-center
            "
          >
            <h3 className="font-bold text-cyan-300">
              {item.value}%
            </h3>

            <p className="text-xs text-slate-400">
              {item.skill}
            </p>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

export default SkillMatchChart;