import { motion } from "framer-motion";
import {
  FaUserPlus,
  FaBrain,
  FaSearch,
  FaComments,
  FaTrophy,
} from "react-icons/fa";

function HowItWorks() {
  const steps = [
    {
      stepNum: "01",
      icon: <FaUserPlus />,
      title: "Create Profile",
      desc: "Add your technology stack, skill weights, timezone preferences, and collaboration interests.",
    },
    {
      stepNum: "02",
      icon: <FaBrain />,
      title: "AI Analysis",
      desc: "Our matching engine processes your data and past projects to evaluate stack compatibilities.",
    },
    {
      stepNum: "03",
      icon: <FaSearch />,
      title: "Find Matches",
      desc: "Instantly browse compatible teammate matches or project requests recommended by AI.",
    },
    {
      stepNum: "04",
      icon: <FaComments />,
      title: "Connect",
      desc: "Communicate directly inside the secure workspace to align on code ideas and team size.",
    },
    {
      stepNum: "05",
      icon: <FaTrophy />,
      title: "Build & Win",
      desc: "Submit your team confirmation, collaborate in real-time, and win the hackathon.",
    },
  ];

  return (
    <section id="how-it-works" className="bg-transparent py-24 px-6 relative z-10">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-20">
          <span className="text-cyan-400 border border-[#3B82F6]/25 px-4 py-1.5 rounded-full text-xs tracking-wider bg-white/2 inline-block mb-4">
            WORKFLOW
          </span>
          <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight">
            How It <span className="bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">Works</span>
          </h2>
          <p className="text-slate-400 mt-4 text-xs md:text-sm max-w-xl mx-auto leading-relaxed">
            Get your team ready for matching and project collaboration in five simple visual steps.
          </p>
        </div>

        {/* Horizontal Timeline Container */}
        <div className="relative">
          {/* Connector Line (Desktop Only) */}
          <div className="hidden lg:block absolute top-12 left-[10%] right-[10%] h-[1px] bg-gradient-to-r from-[#3B82F6]/20 via-[#FF8A00]/40 to-[#3B82F6]/20 z-0" />

          {/* Steps Grid */}
          <div className="grid lg:grid-cols-5 gap-8 relative z-10">
            {steps.map((step, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.6, delay: idx * 0.12 }}
                whileHover={{ y: -8 }}
                className="flex flex-col items-center lg:items-start text-center lg:text-left"
              >
                {/* Step Circle with Icon */}
                <div className="relative mb-6">
                  {/* Glowing Background Glow ring */}
                  <div className="absolute inset-0 rounded-full bg-[#3B82F6]/10 blur-md pointer-events-none" />
                  
                  <div className="w-16 h-16 rounded-full border border-white/10 bg-[#0e1222] flex items-center justify-center text-xl text-[#3B82F6] shadow-[0_0_15px_rgba(59,130,246,0.15)] relative z-10">
                    {step.icon}
                  </div>
                  
                  {/* Step Number Badge */}
                  <span className="absolute -top-1.5 -right-1.5 bg-[#FF8A00] text-white text-[9px] font-black px-1.5 py-0.5 rounded-full border border-slate-950">
                    {step.stepNum}
                  </span>
                </div>

                <h3 className="text-white text-lg font-bold">
                  {step.title}
                </h3>

                <p className="text-slate-400 mt-3 text-xs md:text-sm leading-relaxed max-w-[280px]">
                  {step.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default HowItWorks;