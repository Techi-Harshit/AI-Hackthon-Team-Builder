import { motion } from "framer-motion";
import { FaUserCheck, FaSyncAlt, FaLayerGroup } from "react-icons/fa";

function RecommendationsHero() {
  const steps = [
    { icon: <FaUserCheck />, label: "AI analyzes", desc: "your profile" },
    { icon: <FaSyncAlt className="animate-spin" style={{ animationDuration: "8s" }} />, label: "Matches with", desc: "perfect teammates" },
    { icon: <FaLayerGroup />, label: "Build winning", desc: "teams together" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-8 items-stretch"
    >
      {/* Left Title Card */}
      <div className="xl:col-span-2 rounded-3xl bg-[#0e1222]/40 backdrop-blur-xl border border-white/5 p-8 flex flex-col justify-center relative overflow-hidden">
        <div className="absolute -top-24 -left-24 w-80 h-80 bg-[#3B82F6]/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -right-24 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl" />

        <div className="relative z-10">
          <div className="flex items-center gap-2">
            <h1 className="text-4xl lg:text-5xl font-extrabold bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent heading-font">
              AI Recommendations
            </h1>
            <motion.span
              animate={{ rotate: [0, 10, -10, 10, 0] }}
              transition={{ repeat: Infinity, duration: 2, repeatDelay: 3 }}
              className="text-3xl"
            >
              🪄
            </motion.span>
          </div>
          <p className="text-gray-400 text-base mt-4 max-w-xl leading-relaxed">
            Our AI analyzes your skills, experience and goals to find the best teammates for you.
          </p>
        </div>
      </div>

      {/* Right How It Works Bot Widget */}
      <motion.div
        whileHover={{ y: -4 }}
        className="rounded-3xl bg-gradient-to-br from-indigo-950/65 via-slate-900/60 to-slate-950/90 border border-white/5 p-6 flex items-center justify-between gap-4 relative overflow-hidden group"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 via-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <div className="relative z-10 flex-1">
          <h3 className="text-sm font-bold text-white mb-4 heading-font">How it works?</h3>
          <div className="flex flex-col gap-3.5">
            {steps.map((step, idx) => (
              <div key={idx} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-[#FF8A00]/10 border border-white/5 flex items-center justify-center text-[#3B82F6] text-xs shadow-inner">
                  {step.icon}
                </div>
                <div className="text-2xs">
                  <span className="block font-bold text-gray-200">{step.label}</span>
                  <span className="block text-gray-500 mt-0.5">{step.desc}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Floating Cute Robot Widget */}
        <div className="relative w-28 h-28 flex-shrink-0 flex items-center justify-center">
          {/* Glowing rings */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
            className="absolute w-24 h-24 rounded-full border border-dashed border-purple-500/35"
          />
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 3, repeat: Infinity }}
            className="absolute w-20 h-20 rounded-full bg-gradient-to-br from-purple-500/10 to-blue-500/10 blur-md"
          />
          {/* Floating Robot Image Asset */}
          <motion.img
            animate={{ y: [-6, 6, -6] }}
            transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
            src="/ai_bot_avatar.png"
            alt="AI Assistant Bot"
            className="relative z-10 w-18 h-18 rounded-2xl object-cover border border-white/5 shadow-lg shadow-[#3B82F6]/15"
          />
        </div>
      </motion.div>
    </motion.div>
  );
}

export default RecommendationsHero;
