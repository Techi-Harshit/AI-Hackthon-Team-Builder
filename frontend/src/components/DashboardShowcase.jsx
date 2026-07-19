import { motion } from "framer-motion";
import { FaLaptop, FaTerminal, FaSlidersH, FaLink } from "react-icons/fa";

function DashboardShowcase() {
  return (
    <section className="bg-transparent py-24 px-6 relative z-10 flex flex-col items-center">
      <div className="max-w-7xl mx-auto w-full text-center">
        {/* Header */}
        <div className="mb-16">
          <span className="text-[#FF8A00] border border-[#FF8A00]/25 px-4 py-1.5 rounded-full text-xs tracking-wider bg-white/2 inline-block mb-4">
            PREVIEW
          </span>
          <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight">
            Explore the <span className="bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">App Dashboard</span>
          </h2>
          <p className="text-slate-400 mt-4 text-xs md:text-sm max-w-xl mx-auto leading-relaxed">
            See how the AI Matchmaker agent presents project details, evaluates skill gaps, and connects you with collaborators.
          </p>
        </div>

        {/* Laptop Container */}
        <motion.div
          initial={{ opacity: 0, y: 80, scale: 0.95 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="relative max-w-4xl w-full mx-auto"
        >
          {/* Laptop Screen Bezel */}
          <div className="bg-[#050816] rounded-t-3xl border-t-8 border-x-8 border-white/5 shadow-[0_25px_60px_rgba(5,8,22,0.8)] overflow-hidden h-[420px] md:h-[480px] relative z-10 flex flex-col">
            
            {/* Screen Webcam dot */}
            <div className="absolute top-2 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-[#050816] flex items-center justify-center">
              <div className="w-1 h-1 rounded-full bg-blue-900/60" />
            </div>

            {/* Inner App Interface */}
            <div className="flex-1 bg-[#050816] flex grid grid-cols-[200px_1fr] h-full text-left select-none text-white border-t border-white/5">
              
              {/* Left sidebar features list */}
              <div className="bg-[#0b0e1a]/80 border-r border-white/5/60 p-4 flex flex-col justify-between">
                <div>
                  {/* Branding */}
                  <div className="flex items-center gap-2 mb-8">
                    <div className="w-6 h-6 rounded-md bg-[#FF8A00] flex items-center justify-center text-xs font-black">C</div>
                    <span className="font-extrabold text-sm tracking-wider">COSMOQ</span>
                  </div>

                  {/* Feature Lists */}
                  <div className="space-y-4">
                    <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest px-2">Core Desk</p>
                    <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-white/2 border border-white/5 text-[11px] font-bold text-slate-200">
                      <FaSlidersH className="text-[#3B82F6]" />
                      Explore Matching
                    </div>
                    <div className="flex items-center gap-3 px-3 py-2.5 text-[11px] font-semibold text-slate-400 hover:text-slate-200 transition cursor-pointer">
                      <FaTerminal className="text-slate-600" />
                      Developers List
                    </div>
                    <div className="flex items-center gap-3 px-3 py-2.5 text-[11px] font-semibold text-slate-400 hover:text-slate-200 transition cursor-pointer">
                      <FaLaptop className="text-slate-600" />
                      Active Projects
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-white/2 rounded-xl border border-white/5 text-[9px] text-slate-500">
                  <span>Workspace V1.4</span>
                </div>
              </div>

              {/* Center Dashboard View */}
              <div className="p-6 flex flex-col h-full overflow-hidden">
                {/* Header bar */}
                <div className="flex justify-between items-center pb-4 border-b border-white/5/60 mb-5">
                  <div>
                    <h3 className="text-base font-bold">AI Team Recommendations</h3>
                    <p className="text-[10px] text-slate-500 mt-0.5">Top compatibilities matched by skill weights</p>
                  </div>
                  <span className="text-[10px] px-2.5 py-1 rounded-full border border-cyan-500/35 text-cyan-400 font-bold bg-cyan-950/20">
                    Match Active
                  </span>
                </div>

                {/* Grid details */}
                <div className="grid grid-cols-2 gap-4 flex-1 overflow-hidden">
                  {/* Left Column: matching cards */}
                  <div className="space-y-3">
                    <div className="rounded-2xl border border-white/5 bg-[#0e1222]/50 p-4 shadow-md flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <img src="https://i.pravatar.cc/50?img=3" alt="" className="w-8 h-8 rounded-full" />
                        <div>
                          <h4 className="text-xs font-bold">Animesh Pathak</h4>
                          <p className="text-[9px] text-slate-500">React Developer</p>
                        </div>
                      </div>
                      <span className="text-[10px] text-green-400 font-bold">96%</span>
                    </div>

                    <div className="rounded-2xl border border-white/5 bg-[#0e1222]/50 p-4 shadow-md flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <img src="https://i.pravatar.cc/50?img=4" alt="" className="w-8 h-8 rounded-full" />
                        <div>
                          <h4 className="text-xs font-bold">Nishant Verma</h4>
                          <p className="text-[9px] text-slate-500">ML Specialist</p>
                        </div>
                      </div>
                      <span className="text-[10px] text-green-400 font-bold">91%</span>
                    </div>
                  </div>

                  {/* Right Column: compatibility charts */}
                  <div className="rounded-2xl border border-white/5 bg-[#0e1222]/50 p-4 flex flex-col justify-between">
                    <div>
                      <h4 className="text-[10px] font-bold tracking-wider text-slate-400">Match Balance Matrix</h4>
                      <p className="text-[9px] text-[#FF8A00] mt-1 font-bold">AI Stack: Balanced</p>
                    </div>

                    {/* Progress bars stack */}
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between text-[8px] text-slate-400 mb-1">
                          <span>Collaboration Score</span>
                          <span>94%</span>
                        </div>
                        <div className="w-full h-1 bg-[#050816] rounded-full">
                          <div className="h-full bg-cyan-400 rounded-full" style={{ width: "94%" }} />
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-[8px] text-slate-400 mb-1">
                          <span>Tech Intersect</span>
                          <span>88%</span>
                        </div>
                        <div className="w-full h-1 bg-[#050816] rounded-full">
                          <div className="h-full bg-[#FF8A00] rounded-full" style={{ width: "88%" }} />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

              </div>

            </div>

          </div>

          {/* Laptop Base keyboard shelf */}
          <div className="relative max-w-5xl w-[108%] -left-[4%] h-4 rounded-b-xl bg-[#0e1222] border-b-2 border-b-slate-950 flex justify-center z-20">
            {/* Display opener notch */}
            <div className="w-20 h-1 rounded-b-sm bg-[#050816]" />
          </div>

          {/* Glowing Shadow under Laptop */}
          <div className="absolute top-[96%] left-1/2 -translate-x-1/2 w-[85%] h-8 bg-cyan-500/15 blur-xl rounded-full z-0" />
        </motion.div>
      </div>
    </section>
  );
}

export default DashboardShowcase;
