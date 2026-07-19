import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { recommendedTeammates } from "../../data/recommendationsData";
import { FaPlay, FaRobot, FaSearch, FaTimes, FaShieldAlt } from "react-icons/fa";

function MatchSimulator() {
  const [selectedId, setSelectedId] = useState(recommendedTeammates[0].id);
  const [status, setStatus] = useState("idle"); // idle, scanning, result
  const [logs, setLogs] = useState([]);
  const [simulatedScore, setSimulatedScore] = useState(0);

  const selectedCandidate = recommendedTeammates.find((c) => c.id === Number(selectedId));

  const runSimulation = () => {
    setStatus("scanning");
    setLogs([]);
    setSimulatedScore(0);

    const logSteps = [
      "Initializing Neural Matching Network...",
      "Analyzing user React & Node.js proficiency...",
      `Cross-referencing with ${selectedCandidate.name}'s backend skill set...`,
      "Comparing weekly availability calendars...",
      "Checking communication styles and goals alignment...",
      "Calculating synergy index...",
    ];

    logSteps.forEach((step, idx) => {
      setTimeout(() => {
        setLogs((prev) => [...prev, step]);
      }, idx * 450);
    });

    setTimeout(() => {
      setSimulatedScore(selectedCandidate.matchScore);
      setStatus("result");
    }, logSteps.length * 480);
  };

  return (
    <div className="rounded-3xl border border-white/5 bg-[#0e1222]/20 backdrop-blur-xl p-6 mb-6 relative overflow-hidden">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-xl bg-[#FF8A00]/10 border border-purple-500/25 flex items-center justify-center text-[#3B82F6] text-sm">
          🤖
        </div>
        <div>
          <h3 className="text-sm font-bold text-white heading-font">Deep Match Analyzer</h3>
          <p className="text-[10px] text-gray-500 mt-0.5">Run simulated compatibility tests with candidates.</p>
        </div>
      </div>

      {status === "idle" && (
        <div className="space-y-4">
          <div className="flex flex-col gap-2">
            <label className="text-4xs text-gray-500 font-bold uppercase tracking-wider">Select Candidate</label>
            <select
              value={selectedId}
              onChange={(e) => setSelectedId(e.target.value)}
              className="w-full bg-[#050816]/80 border border-white/5 rounded-xl py-3 px-4 text-xs font-semibold text-gray-300 outline-none focus:border-purple-500 cursor-pointer"
            >
              {recommendedTeammates.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.role})
                </option>
              ))}
            </select>
          </div>

          <motion.button
            whileHover={{ scale: 1.02, boxShadow: "0 0 15px rgba(168,85,247,0.35)" }}
            whileTap={{ scale: 0.98 }}
            onClick={runSimulation}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 border border-[#FF8A00]/25 text-xs font-bold text-white flex items-center justify-center gap-2"
          >
            <FaPlay className="text-3xs" />
            <span>Run Deep Match Scan</span>
          </motion.button>
        </div>
      )}

      {status === "scanning" && (
        <div className="relative py-4 flex flex-col justify-center min-h-[160px]">
          {/* Laser scanning bar */}
          <motion.div
            animate={{ y: [-10, 150, -10] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
            className="absolute left-0 right-0 h-0.5 bg-cyan-400 shadow-[0_0_8px_#22d3ee] z-20 pointer-events-none"
          />

          <div className="text-center mb-4 flex flex-col items-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1.2, ease: "linear" }}
              className="w-8 h-8 rounded-full border-2 border-dashed border-cyan-400 border-t-transparent mb-2"
            />
            <span className="text-2xs font-mono font-bold text-cyan-400 uppercase tracking-widest animate-pulse">
              Scanning Compatibility...
            </span>
          </div>

          {/* Console logs */}
          <div className="bg-[#050816]/90 border border-white/5 p-3 rounded-xl font-mono text-[9px] text-emerald-400 h-24 overflow-y-auto space-y-1.5 scrollbar-thin">
            {logs.map((log, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -5 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-1.5"
              >
                <span>&gt;</span>
                <span className="truncate">{log}</span>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {status === "result" && (
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-4"
          >
            {/* Card info */}
            <div className="flex items-center gap-3 bg-[#050816]/60 p-3.5 rounded-2xl border border-white/5">
              <img
                src={`https://i.pravatar.cc/80?img=${selectedCandidate.avatar}`}
                alt=""
                className="w-10 h-10 rounded-xl border border-white/5"
              />
              <div className="min-w-0">
                <h4 className="font-bold text-white text-xs truncate">{selectedCandidate.name}</h4>
                <span className="text-gray-500 text-3xs font-semibold">{selectedCandidate.role}</span>
              </div>
              <div className="ml-auto text-right">
                <span className="block text-[10px] text-gray-500 font-bold uppercase tracking-wider">Fit Score</span>
                <span className="text-sm font-black text-emerald-400 font-mono">{simulatedScore}%</span>
              </div>
            </div>

            {/* Verdict details */}
            <div className="p-3 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl text-[10px] leading-relaxed text-slate-350">
              <div className="font-bold text-emerald-400 mb-1 flex items-center gap-1.5">
                <FaShieldAlt />
                Verdict: Highly Recommended
              </div>
              Your frontend development skills in React perfectly align with {selectedCandidate.name}'s backend node experience. Target goals match by 90%.
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setStatus("idle")}
                className="flex-1 py-2 rounded-xl bg-[#050816]/80 hover:bg-[#0e1222] border border-white/5 text-[10px] font-bold text-gray-400 transition-colors"
              >
                Reset Analyzer
              </button>
              <button
                onClick={() => {
                  setStatus("idle");
                  // Trigger invite simulation
                }}
                className="flex-1 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 border border-[#FF8A00]/25 text-[10px] font-bold text-white transition-all shadow-md shadow-[#3B82F6]/10 hover:shadow-[#3B82F6]/20"
              >
                Invite to Squad
              </button>
            </div>
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
}

export default MatchSimulator;
