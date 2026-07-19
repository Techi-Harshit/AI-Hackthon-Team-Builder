import { motion } from "framer-motion";
import { FaCheckCircle, FaProjectDiagram } from "react-icons/fa";

function About() {
  return (
    <section className="bg-transparent py-24 px-6 relative z-10">
      <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
        
        {/* Left Column Content */}
        <div className="text-left">
          <span className="text-cyan-400 border border-[#3B82F6]/25 px-4 py-1.5 rounded-full text-xs tracking-wider bg-white/2 inline-block mb-4">
            MISSION
          </span>
          
          <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight leading-tight">
            Why We Built <br />
            <span className="bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">This Platform</span>
          </h2>
          
          <p className="text-slate-400 mt-6 text-xs md:text-sm leading-relaxed">
            Finding compatible teammates is the single hardest part of participating in any hackathon. Developers often end up in unbalanced teams, leading to uncompleted projects and frustration.
          </p>
          
          <p className="text-slate-400 mt-4 text-xs md:text-sm leading-relaxed">
            COSMOQ AI bridges this gap. By evaluating multiple dimensions — technical skill weights, past hackathon completions, timezone preferences, and collaborative goals — our AI Matchmaker auto-builds highly balanced, functional teams tailored for success.
          </p>

          {/* Core Matching Capabilities list */}
          <ul className="mt-8 space-y-4">
            <li className="flex items-center gap-3 text-xs md:text-sm text-slate-200">
              <FaCheckCircle className="text-[#3B82F6] shrink-0 text-base" />
              <span>Skill Matrix Intersect Matching</span>
            </li>
            <li className="flex items-center gap-3 text-xs md:text-sm text-slate-200">
              <FaCheckCircle className="text-[#FF8A00] shrink-0 text-base" />
              <span>Timezone & Commitment Sync</span>
            </li>
            <li className="flex items-center gap-3 text-xs md:text-sm text-slate-200">
              <FaCheckCircle className="text-[#3B82F6] shrink-0 text-base" />
              <span>Role Distribution (Frontend, Backend, ML)</span>
            </li>
          </ul>
        </div>

        {/* Right Column: Animated Network Nodes Dashboard Illustration */}
        <div className="w-full flex justify-center relative">
          
          {/* Glowing Aura behind Illustration */}
          <div className="absolute inset-0 bg-purple-500/5 blur-[120px] rounded-full pointer-events-none" />

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.8 }}
            className="
              w-full
              max-w-md
              bg-[#0e1222]
              border
              border-white/5
              rounded-3xl
              p-6
              shadow-[0_10px_30px_rgba(5,8,22,0.6)]
              overflow-hidden
              relative
            "
          >
            {/* Illustration Title */}
            <div className="flex justify-between items-center pb-4 border-b border-white/5 mb-6">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
                <FaProjectDiagram className="text-[#3B82F6]" />
                <span>AI Connection Matrix</span>
              </div>
              <span className="w-2 h-2 rounded-full bg-green-400 animate-ping" />
            </div>

            {/* Dynamic Node Graph Layout */}
            <div className="relative h-64 flex items-center justify-center">
              
              {/* Animated Connection Lines */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
                {/* Line 1: Center to Top-Left */}
                <motion.line
                  x1="50%" y1="50%" x2="20%" y2="20%"
                  stroke="rgba(59, 130, 246, 0.4)" strokeWidth="2" strokeDasharray="6"
                  animate={{ strokeDashoffset: [-12, 0] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                />
                {/* Line 2: Center to Top-Right */}
                <motion.line
                  x1="50%" y1="50%" x2="80%" y2="20%"
                  stroke="rgba(255, 138, 0, 0.4)" strokeWidth="2" strokeDasharray="6"
                  animate={{ strokeDashoffset: [12, 0] }}
                  transition={{ duration: 2.2, repeat: Infinity, ease: "linear" }}
                />
                {/* Line 3: Center to Bottom-Left */}
                <motion.line
                  x1="50%" y1="50%" x2="15%" y2="80%"
                  stroke="rgba(59, 130, 246, 0.4)" strokeWidth="2" strokeDasharray="6"
                  animate={{ strokeDashoffset: [-12, 0] }}
                  transition={{ duration: 1.8, repeat: Infinity, ease: "linear" }}
                />
                {/* Line 4: Center to Bottom-Right */}
                <motion.line
                  x1="50%" y1="50%" x2="85%" y2="80%"
                  stroke="rgba(255, 138, 0, 0.4)" strokeWidth="2" strokeDasharray="6"
                  animate={{ strokeDashoffset: [12, 0] }}
                  transition={{ duration: 2.5, repeat: Infinity, ease: "linear" }}
                />
              </svg>

              {/* Center Node (AI Matchmaker Core) */}
              <motion.div
                animate={{ scale: [1, 1.08, 1] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                className="w-16 h-16 rounded-full bg-[#FF8A00] border-2 border-white flex flex-col items-center justify-center z-10 shadow-[0_0_20px_rgba(255,138,0,0.5)] cursor-pointer"
              >
                <span className="text-[10px] font-black text-white">AI ENGINE</span>
              </motion.div>

              {/* Node 1: Dev A (Top-Left) */}
              <div className="absolute top-[10%] left-[10%] bg-[#050816] border border-white/5 rounded-2xl p-2.5 flex items-center gap-2 z-10 shadow-md">
                <img src="https://i.pravatar.cc/50?img=12" alt="" className="w-6 h-6 rounded-full" />
                <div className="text-left leading-none">
                  <p className="text-[9px] font-bold text-white">React Dev</p>
                  <span className="text-[7px] text-green-400 font-bold">96% compat</span>
                </div>
              </div>

              {/* Node 2: Dev B (Top-Right) */}
              <div className="absolute top-[10%] right-[5%] bg-[#050816] border border-white/5 rounded-2xl p-2.5 flex items-center gap-2 z-10 shadow-md">
                <img src="https://i.pravatar.cc/50?img=3" alt="" className="w-6 h-6 rounded-full" />
                <div className="text-left leading-none">
                  <p className="text-[9px] font-bold text-white">Python ML</p>
                  <span className="text-[7px] text-green-400 font-bold">92% compat</span>
                </div>
              </div>

              {/* Node 3: Dev C (Bottom-Left) */}
              <div className="absolute bottom-[10%] left-[2%] bg-[#050816] border border-white/5 rounded-2xl p-2.5 flex items-center gap-2 z-10 shadow-md">
                <img src="https://i.pravatar.cc/50?img=49" alt="" className="w-6 h-6 rounded-full" />
                <div className="text-left leading-none">
                  <p className="text-[9px] font-bold text-white">UI Designer</p>
                  <span className="text-[7px] text-green-400 font-bold">89% compat</span>
                </div>
              </div>

              {/* Node 4: Dev D (Bottom-Right) */}
              <div className="absolute bottom-[10%] right-[2%] bg-[#050816] border border-white/5 rounded-2xl p-2.5 flex items-center gap-2 z-10 shadow-md">
                <img src="https://i.pravatar.cc/50?img=68" alt="" className="w-6 h-6 rounded-full" />
                <div className="text-left leading-none">
                  <p className="text-[9px] font-bold text-white">Node Backend</p>
                  <span className="text-[7px] text-green-400 font-bold">91% compat</span>
                </div>
              </div>

            </div>

            {/* Helper footer */}
            <div className="mt-4 pt-3 border-t border-white/5 text-center text-[9px] text-slate-500 font-medium">
              Real-time stack distribution & roles sync
            </div>

          </motion.div>
        </div>

      </div>
    </section>
  );
}

export default About;
