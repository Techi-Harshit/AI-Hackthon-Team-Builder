import { motion } from "framer-motion";
import { FaArrowRight } from "react-icons/fa";

function HackathonsCTA() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.7 }}
      className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-purple-900/30 via-slate-900/60 to-blue-900/30 backdrop-blur-xl border border-white/5 p-6 mt-8"
    >
      {/* Sweep glow */}
      <motion.div
        animate={{ x: ["-100%", "250%"] }}
        transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
        className="absolute inset-y-0 w-40 bg-gradient-to-r from-transparent via-purple-400/8 to-transparent"
      />

      <div className="relative z-10 flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-12 h-12 rounded-xl bg-[#0e1222]/80 border border-white/10 flex items-center justify-center text-2xl"
          >
            💡
          </motion.div>
          <div>
            <h3 className="text-lg font-bold text-white">
              Don't see a hackathon you like?
            </h3>
            <p className="text-sm text-gray-400 mt-0.5">
              Host your own hackathon and build something amazing with the
              community.
            </p>
          </div>
        </div>

        <motion.button
          whileHover={{
            scale: 1.05,
            boxShadow: "0 0 25px rgba(168,85,247,0.35)",
          }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold text-sm whitespace-nowrap"
        >
          Host a Hackathon
          <FaArrowRight className="text-xs" />
        </motion.button>
      </div>
    </motion.div>
  );
}

export default HackathonsCTA;
