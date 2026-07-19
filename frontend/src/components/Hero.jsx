import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import {
  FaBrain,
  FaSearch,
  FaGlobe,
  FaBell,
  FaCode,
  FaChartBar,
} from "react-icons/fa";

function Hero() {
  const navigate = useNavigate();
  const { demoLogin } = useAuth();
  const [score, setScore] = useState(0);

  const handleGetStarted = async () => {
    const result = await demoLogin();
    if (result.success) navigate("/dashboard");
  };
  
  // Ref for scroll tracking
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  // Transform functions for the 3D scroll animation
  const scale = useTransform(scrollYProgress, [0, 0.45], [0.85, 1]);
  const rotateX = useTransform(scrollYProgress, [0, 0.45], [14, 0]);
  const opacity = useTransform(scrollYProgress, [0, 0.35], [0.65, 1]);

  useEffect(() => {
    let current = 0;
    const timer = setInterval(() => {
      current += 2;
      if (current >= 95) {
        current = 95;
        clearInterval(timer);
      }
      setScore(current);
    }, 30);
    return () => clearInterval(timer);
  }, []);

  // Generate 10 floating particles
  const particles = Array.from({ length: 10 });

  // Word-by-word staggered animation setup
  const titleText = "Find Your Perfect Hackathon Team Powered by AI";
  const words = titleText.split(" ");

  return (
    <section id="overview" className="relative min-h-[175vh] lg:min-h-[155vh] bg-[#050816] text-white overflow-hidden flex flex-col items-center pt-20 pb-32">
      {/* Brand Watermark */}
      <div className="absolute top-[8%] left-1/2 -translate-x-1/2 text-[14vw] font-black tracking-widest pointer-events-none select-none bg-gradient-to-b from-white/12 via-white/5 to-transparent bg-clip-text text-transparent uppercase font-sans">
        COSMOQ
      </div>

      {/* Volumetric Glowing Beams (Left: Orange, Right: Blue) */}
      {/* Orange Glow on Left */}
      <div className="absolute left-[2%] top-[5%] w-[38%] h-[80%] bg-gradient-to-b from-transparent via-[#FF8A00]/15 to-transparent blur-[140px] rounded-full pointer-events-none mix-blend-screen" />
      {/* Blue Glow on Right */}
      <div className="absolute right-[2%] top-[10%] w-[38%] h-[80%] bg-gradient-to-b from-transparent via-[#3B82F6]/20 to-transparent blur-[140px] rounded-full pointer-events-none mix-blend-screen" />

      {/* Star Overlay */}
      <div className="absolute inset-0 opacity-15 bg-[radial-gradient(circle_at_center,#ffffff_0.8px,transparent_0.8px)] bg-[size:40px_40px] pointer-events-none" />

      {/* Floating Cosmic Space Particles */}
      {particles.map((_, i) => {
        const size = Math.random() * 2 + 1;
        const left = Math.random() * 100;
        const top = Math.random() * 100;
        const duration = Math.random() * 10 + 6;
        const delay = Math.random() * 5;
        return (
          <motion.div
            key={i}
            className="absolute bg-white rounded-full opacity-0 pointer-events-none z-0"
            style={{
              width: size,
              height: size,
              left: `${left}%`,
              top: `${top}%`,
            }}
            animate={{
              y: [0, -120],
              opacity: [0, 0.5, 0],
            }}
            transition={{
              duration,
              delay,
              repeat: Infinity,
              ease: "linear",
            }}
          />
        );
      })}

      {/* Content wrapper */}
      <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center w-full relative z-10 pt-16">
        
        {/* Left Side Content */}
        <div className="text-left flex flex-col items-start">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center px-4 py-1.5 rounded-full border border-[#3B82F6]/20 bg-[#3B82F6]/5 backdrop-blur-xl text-cyan-400 text-xs font-semibold mb-8 tracking-wider"
          >
            <span className="w-1.5 h-1.5 bg-[#3B82F6] rounded-full mr-2.5 animate-pulse" />
            AI Powered Hackathon Team Builder
          </motion.div>

          {/* Staggered Title */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight leading-[1.12] text-white flex flex-wrap">
            {words.map((word, i) => {
              const isGradient = word === "Hackathon" || word === "Team";
              return (
                <span key={i} className="inline-block overflow-hidden mr-3">
                  <motion.span
                    className="inline-block"
                    initial={{ y: "100%", opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{
                      duration: 0.8,
                      delay: i * 0.06,
                      ease: [0.16, 1, 0.3, 1],
                    }}
                  >
                    {isGradient ? (
                      <span className="bg-gradient-to-r from-[#FF8A00] to-[#ffaa00] bg-clip-text text-transparent">
                        {word}
                      </span>
                    ) : (
                      word
                    )}
                  </motion.span>
                </span>
              );
            })}
          </h1>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="text-slate-400 mt-6 text-sm md:text-base leading-relaxed tracking-wide max-w-xl"
          >
            Build highly compatible, balanced teams for your next hackathon project. Our advanced AI matches developers based on skills, interests, and collaborative values to optimize project success rates.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="mt-8 flex flex-wrap gap-4"
          >
            <button
              onClick={handleGetStarted}
              className="
              px-7
              py-3
              rounded-full
              text-xs
              font-bold
              tracking-wider
              text-white
              bg-[#FF8A00]
              border
              border-[#FF8A00]
              shadow-[0_0_20px_rgba(255,138,0,0.35)]
              hover:bg-[#ff9a22]
              hover:shadow-[0_0_30px_rgba(255,138,0,0.65)]
              hover:scale-105
              active:scale-95
              transition-all
              duration-300
              "
            >
              Click For Demo
            </button>
            <a
              href="#hackathons"
              className="
              px-7
              py-3
              rounded-full
              text-xs
              font-bold
              tracking-wider
              text-slate-300
              bg-[#0e1222]/80
              backdrop-blur-md
              border
              border-white/5
              hover:border-white/10
              hover:text-white
              hover:scale-105
              active:scale-95
              transition-all
              duration-300
              "
            >
              Explore Hackathons
            </a>
          </motion.div>

          {/* Trusted Logos list */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 1 }}
            className="mt-16 border-t border-white/5 pt-8 w-full"
          >
            <p className="text-[10px] text-slate-500 font-bold tracking-widest uppercase">Trusted by developers from</p>
            <div className="flex flex-wrap gap-x-8 gap-y-4 mt-4 text-xs font-black tracking-widest text-slate-600">
              <span className="hover:text-slate-400 transition cursor-default">GOOGLE</span>
              <span className="hover:text-slate-400 transition cursor-default">MICROSOFT</span>
              <span className="hover:text-slate-400 transition cursor-default">GITHUB</span>
              <span className="hover:text-slate-400 transition cursor-default">AWS</span>
              <span className="hover:text-slate-400 transition cursor-default">OPENAI</span>
              <span className="hover:text-slate-400 transition cursor-default">META</span>
            </div>
          </motion.div>
        </div>

        {/* Right Side Laptop / Dashboard Mockup Preview */}
        <div ref={containerRef} className="w-full flex justify-center relative pt-10">
          
          {/* Earth Horizon Glow behind Mockup */}
          <div className="absolute top-[60%] left-1/2 -translate-x-1/2 w-[130%] h-[200px] rounded-[100%] bg-[#050816] border-t border-t-cyan-500/20 shadow-[0_-15px_30px_rgba(6,182,212,0.12)] pointer-events-none z-0" />

          <motion.div
            style={{
              scale,
              rotateX,
              opacity,
              transformStyle: "preserve-3d",
              perspective: 1200,
            }}
            className="
            w-full
            rounded-2xl
            border
            border-white/10
            bg-[#0e1222]/80
            backdrop-blur-2xl
            p-1.5
            shadow-[0_20px_50px_rgba(5,8,22,0.7),0_0_30px_rgba(6,182,212,0.04)]
            overflow-hidden
            transition-all
            duration-300
            relative
            z-10
            "
          >
            {/* Hover scan trail border effect */}
            <div className="absolute inset-0 rounded-2xl border border-[#3b82f6]/20 pointer-events-none overflow-hidden z-20">
              <motion.div 
                className="absolute w-[200px] h-[200px] bg-gradient-to-r from-transparent via-[#3b82f6]/40 to-transparent blur-md opacity-60"
                animate={{
                  x: [-300, 900],
                  y: [-150, 500],
                }}
                transition={{
                  duration: 8,
                  repeat: Infinity,
                  ease: "linear",
                }}
              />
            </div>

            {/* Dashboard Inside Screen Layout */}
            <div className="rounded-[14px] bg-[#050816]/95 border border-white/5/60 overflow-hidden grid grid-cols-[180px_1fr] h-[480px] relative z-10 text-left">
              
              {/* Sidebar Mock */}
              <div className="bg-[#050816]/40 border-r border-white/5/60 p-4 flex flex-col justify-between">
                <div>
                  {/* Logo */}
                  <div className="flex items-center gap-2 mb-8">
                    <div className="w-5 h-5 rounded-md bg-[#FF8A00] flex items-center justify-center text-[10px] font-black text-white">C</div>
                    <span className="font-extrabold text-[11px] tracking-widest">COSMOQ</span>
                  </div>

                  {/* Nav Items */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg bg-[#3b82f6]/10 text-cyan-400 text-[10px] font-bold">
                      <div className="w-1 h-1 bg-cyan-400 rounded-full" />
                      Overview
                    </div>
                    <div className="flex items-center gap-2.5 px-3 py-1.5 text-slate-400 hover:text-white transition text-[10px] font-medium">
                      <div className="w-1 h-1 bg-slate-700 rounded-full" />
                      AI Matching
                    </div>
                    <div className="flex items-center gap-2.5 px-3 py-1.5 text-slate-400 hover:text-white transition text-[10px] font-medium">
                      <div className="w-1 h-1 bg-slate-700 rounded-full" />
                      Hackathons
                    </div>
                    <div className="flex items-center gap-2.5 px-3 py-1.5 text-slate-400 hover:text-white transition text-[10px] font-medium">
                      <div className="w-1 h-1 bg-slate-700 rounded-full" />
                      Team builder
                    </div>
                  </div>
                </div>

                {/* Agent Indicator */}
                <div className="p-2 border border-white/5 bg-white/2 rounded-lg text-[8px] text-slate-500">
                  <span className="text-[#3b82f6] font-bold">● Matcher Online</span>
                </div>
              </div>

              {/* Main Content Pane */}
              <div className="flex flex-col h-full overflow-hidden">
                {/* Topbar navigation bar */}
                <div className="h-14 border-b border-white/5/60 px-5 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400">
                    <FaCode />
                    <span>AI Matching Desk</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <FaSearch className="text-slate-600 text-[10px]" />
                    <FaBell className="text-slate-600 text-[10px] animate-pulse" />
                    <div className="flex items-center gap-1.5 text-[9px] text-slate-500 pl-2 border-l border-white/5">
                      <img src="https://i.pravatar.cc/50?img=60" alt="" className="w-5 h-5 rounded-full" />
                      <span>Ashish admin</span>
                    </div>
                  </div>
                </div>

                {/* Dashboard Grid Pane */}
                <div className="p-5 grid grid-cols-2 gap-4 flex-1 overflow-hidden">
                  
                  {/* Left Column: circular match and skill prog tracks */}
                  <div className="rounded-xl border border-white/5/60 bg-[#0e1222]/30 p-3 flex flex-col justify-between">
                    <div>
                      <h4 className="text-[9px] font-bold tracking-wider text-slate-400">Compatibility Dial</h4>
                      
                      {/* Circular Gauge */}
                      <div className="relative w-24 h-24 my-2 mx-auto flex items-center justify-center">
                        <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                          <circle cx="50" cy="50" r="38" stroke="#050816" strokeWidth="6" fill="none" />
                          <circle cx="50" cy="50" r="38" stroke="#FF8A00" strokeWidth="6" strokeDasharray="238" strokeDashoffset={238 - (238 * score) / 100} strokeLinecap="round" fill="none" />
                        </svg>
                        <div className="absolute text-center leading-none">
                          <p className="text-sm font-black text-white">{score}%</p>
                          <span className="text-[6px] text-slate-500 tracking-wider">MATCH</span>
                        </div>
                      </div>
                    </div>

                    {/* Skill progress bars */}
                    <div className="space-y-1.5 mt-2">
                      <div>
                        <div className="flex justify-between text-[7px] text-slate-400">
                          <span>React Frontend</span>
                          <span>92%</span>
                        </div>
                        <div className="w-full h-1 bg-[#050816] rounded-full overflow-hidden">
                          <div className="h-full bg-cyan-400 rounded-full" style={{ width: "92%" }} />
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-[7px] text-slate-400">
                          <span>Node Backend</span>
                          <span>85%</span>
                        </div>
                        <div className="w-full h-1 bg-[#050816] rounded-full overflow-hidden">
                          <div className="h-full bg-purple-500 rounded-full" style={{ width: "85%" }} />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Developer card matching and charts */}
                  <div className="space-y-3 flex flex-col">
                    {/* Developer match card list */}
                    <div className="rounded-xl border border-white/5/60 bg-[#0e1222]/30 p-3 flex-1 flex flex-col justify-between">
                      <div className="flex justify-between items-center">
                        <span className="text-[8px] text-slate-500 font-bold uppercase">Teammate Match</span>
                        <span className="text-[8px] text-green-400 font-extrabold">{score}%</span>
                      </div>

                      <div className="flex items-center gap-2 mt-2">
                        <img src="https://i.pravatar.cc/50?img=12" alt="" className="w-7 h-7 rounded-full border border-[#FF8A00]/30" />
                        <div className="leading-tight text-left">
                          <p className="text-[9px] font-bold text-slate-200">Kunal Rawat</p>
                          <p className="text-[7px] text-slate-500">Node, Express, MongoDB</p>
                        </div>
                      </div>

                      {/* Small mock bar charts */}
                      <div className="mt-3 flex items-end gap-1.5 h-10 pt-2 border-t border-white/5">
                        <div className="w-3 bg-purple-500/20 h-5 rounded-t-sm" />
                        <div className="w-3 bg-[#FF8A00]/40 h-8 rounded-t-sm" />
                        <div className="w-3 bg-cyan-500/30 h-6 rounded-t-sm" />
                        <div className="w-3 bg-[#3B82F6] h-9 rounded-t-sm" />
                      </div>
                    </div>
                  </div>

                </div>
              </div>

            </div>

            {/* Floating glass matching notification banner */}
            <motion.div
              animate={{
                y: [0, -8, 0],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="absolute top-24 right-4 bg-[#0e1222]/90 border border-[#FF8A00]/35 backdrop-blur-xl rounded-xl p-2.5 flex items-center gap-2.5 shadow-[0_10px_25px_rgba(5,8,22,0.6)] z-30"
            >
              <div className="w-5 h-5 rounded-full bg-[#FF8A00]/20 flex items-center justify-center text-[10px] text-[#FF8A00]">✦</div>
              <div className="leading-tight text-left">
                <p className="text-[9px] font-bold text-white">AI Match Found!</p>
                <p className="text-[7px] text-slate-400">95% compatibility match</p>
              </div>
            </motion.div>
          </motion.div>

        </div>

      </div>
    </section>
  );
}

export default Hero;
