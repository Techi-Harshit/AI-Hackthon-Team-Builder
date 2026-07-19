import { motion } from "framer-motion";
import { FaRobot } from "react-icons/fa";

function CTABanner() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.7 }}
      className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-purple-900/40 via-blue-900/40 to-purple-900/40 backdrop-blur-xl border border-white/5 p-6 mt-8"
    >
      {/* Animated glow sweep */}
      <motion.div
        animate={{ x: ["-100%", "200%"] }}
        transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
        className="absolute inset-y-0 w-40 bg-gradient-to-r from-transparent via-purple-400/10 to-transparent"
      />

      <div className="relative z-10 flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-xl"
          >
            ✨
          </motion.div>
          <div>
            <h3 className="text-xl font-bold text-white">
              Let AI find your perfect team
            </h3>
            <p className="text-sm text-gray-400 mt-1">
              Answer a few questions and get personalized team recommendations
            </p>
          </div>
        </div>

        <motion.button
          whileHover={{
            scale: 1.05,
            boxShadow: "0 0 30px rgba(168,85,247,0.4)",
          }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold text-sm hover:from-purple-500 hover:to-blue-500 transition whitespace-nowrap"
        >
          <FaRobot />
          ✨ Get AI Recommendations
        </motion.button>
      </div>
    </motion.div>
  );
}

export default CTABanner;
