import { motion } from "framer-motion";
import {
  FaBrain,
  FaChartLine,
  FaHeartbeat,
  FaUserTag,
  FaComments,
  FaTrophy,
} from "react-icons/fa";

function Features() {
  const featuresList = [
    {
      icon: <FaBrain className="text-[#3B82F6] text-2xl" />,
      title: "AI Team Matching",
      desc: "Our neural matching engine analyzes multi-dimensional developer traits to recommend highly optimized teammate options.",
    },
    {
      icon: <FaChartLine className="text-[#FF8A00] text-2xl" />,
      title: "Skill Gap Analysis",
      desc: "Instantly identify missing technological requirements in your current team stack and receive recommendations on how to fill them.",
    },
    {
      icon: <FaHeartbeat className="text-[#3B82F6] text-2xl" />,
      title: "Compatibility Prediction",
      desc: "Predict project collaboration dynamics by analyzing past hackathon completions, timezone preferences, and communication values.",
    },
    {
      icon: <FaUserTag className="text-[#FF8A00] text-2xl" />,
      title: "Role Recommendation",
      desc: "Automatically assign developer roles (Frontend, Backend, ML, Mobile) based on past experience weight parameters.",
    },
    {
      icon: <FaComments className="text-[#3B82F6] text-2xl" />,
      title: "Live Messaging",
      desc: "Communicate securely with potential matches directly inside the app to discuss project concepts before final team confirmation.",
    },
    {
      icon: <FaTrophy className="text-[#FF8A00] text-2xl" />,
      title: "Hackathon Discovery",
      desc: "Explore upcoming global hackathons filterable by tech domains, prize values, registration deadlines, and regional locations.",
    },
  ];

  return (
    <section id="features" className="bg-transparent py-24 px-6 relative z-10">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <span className="text-cyan-400 border border-[#3B82F6]/25 px-4 py-1.5 rounded-full text-xs tracking-wider bg-white/2 inline-block mb-4">
            FEATURES
          </span>
          <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight">
            Designed for <span className="bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">Elite Teams</span>
          </h2>
          <p className="text-slate-400 mt-4 text-xs md:text-sm max-w-xl mx-auto leading-relaxed">
            Everything you need to discover hackathons, assemble compatible developers, and coordinate winning project submissions.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuresList.map((feature, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.08 }}
              whileHover={{
                y: -6,
                scale: 1.02,
                borderColor: idx % 2 === 0 ? "rgba(59, 130, 246, 0.25)" : "rgba(255, 138, 0, 0.25)",
                boxShadow: idx % 2 === 0 ? "0 0 30px rgba(59, 130, 246, 0.08)" : "0 0 30px rgba(255, 138, 0, 0.08)"
              }}
              className="
                bg-[#0e1222]
                border
                border-white/5
                rounded-3xl
                p-8
                text-left
                shadow-[0_10px_35px_rgba(5,8,22,0.45)]
                transition-all
                duration-300
                group
              "
            >
              {/* Icon container */}
              <div className="w-12 h-12 rounded-2xl bg-[#050816] border border-white/5 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                {feature.icon}
              </div>

              <h3 className="text-white text-lg font-bold">
                {feature.title}
              </h3>

              <p className="text-slate-400 mt-3 text-xs md:text-sm leading-relaxed">
                {feature.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Features;
