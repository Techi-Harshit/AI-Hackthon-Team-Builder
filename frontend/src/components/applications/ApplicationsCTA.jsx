import { motion } from "framer-motion";
import { FaArrowRight, FaCheckCircle } from "react-icons/fa";

const tipItems = [
  {
    icon: "⚡",
    text: "Add more skills to your profile",
    color: "text-amber-400",
  },
  {
    icon: "📂",
    text: "Complete your portfolio",
    color: "text-blue-400",
  },
  {
    icon: "✅",
    text: "Verify your GitHub account",
    color: "text-emerald-400",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.3 },
  },
};

const tipVariants = {
  hidden: { opacity: 0, x: 20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { type: "spring", stiffness: 150, damping: 12 },
  },
};

function ApplicationsCTA() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-purple-900/30 via-slate-900/50 to-blue-900/30 backdrop-blur-xl border border-white/5 p-8 mt-8"
    >
      {/* Animated background particles */}
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          animate={{
            y: [0, -40, 0],
            x: [0, i % 2 === 0 ? 20 : -20, 0],
            opacity: [0.1, 0.4, 0.1],
          }}
          transition={{
            duration: 3 + i * 0.5,
            repeat: Infinity,
            delay: i * 0.4,
          }}
          className="absolute w-1 h-1 bg-purple-400 rounded-full"
          style={{
            left: `${15 + i * 15}%`,
            top: `${30 + (i % 3) * 20}%`,
          }}
        />
      ))}

      {/* Sweep glow */}
      <motion.div
        animate={{ x: ["-100%", "300%"] }}
        transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
        className="absolute inset-y-0 w-32 bg-gradient-to-r from-transparent via-purple-400/8 to-transparent"
      />

      <div className="relative z-10 flex items-center gap-8">
        {/* Bot icon */}
        <motion.div
          animate={{
            y: [-3, 3, -3],
            rotate: [0, 3, -3, 0],
          }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="hidden lg:flex w-20 h-20 rounded-2xl bg-gradient-to-br from-[#FF8A00]/25 to-[#3B82F6]/25 border border-white/5 items-center justify-center text-4xl flex-shrink-0"
        >
          🤖
        </motion.div>

        {/* Text */}
        <div className="flex-1">
          <motion.h3
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-xl font-bold text-white mb-1"
          >
            Improve your chances
          </motion.h3>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="text-sm text-gray-400"
          >
            Complete your profile, add more skills and build your portfolio to
            get better match with top teams.
          </motion.p>
        </div>

        {/* Tips */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="hidden xl:flex flex-col gap-2.5 flex-shrink-0"
        >
          {tipItems.map((tip, i) => (
            <motion.div
              key={i}
              variants={tipVariants}
              whileHover={{
                x: 6,
                transition: { type: "spring", stiffness: 400 },
              }}
              className="flex items-center gap-2.5 cursor-pointer group"
            >
              <span className={`text-sm ${tip.color}`}>{tip.icon}</span>
              <span className="text-sm text-gray-300 group-hover:text-white transition">
                {tip.text}
              </span>
              <motion.span
                initial={{ opacity: 0, x: -5 }}
                whileHover={{ opacity: 1, x: 0 }}
                className="text-[#3B82F6]"
              >
                <FaArrowRight className="text-xs opacity-0 group-hover:opacity-100 transition" />
              </motion.span>
            </motion.div>
          ))}
        </motion.div>

        {/* Button */}
        <motion.button
          whileHover={{
            scale: 1.05,
            boxShadow: "0 0 30px rgba(168,85,247,0.35)",
          }}
          whileTap={{ scale: 0.95 }}
          transition={{ type: "spring", stiffness: 400 }}
          className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold text-sm whitespace-nowrap flex-shrink-0"
        >
          Improve Profile
          <motion.span
            animate={{ x: [0, 4, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            <FaArrowRight className="text-xs" />
          </motion.span>
        </motion.button>
      </div>
    </motion.div>
  );
}

export default ApplicationsCTA;
