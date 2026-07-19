import googleLogo from "../assets/logo.svg/companies/google-logo-png.png";
import microsoftLogo from "../assets/logo.svg/companies/images (1).png";
import mlhLogo from "../assets/logo.svg/companies/images (3).png";
import sihLogo from "../assets/logo.svg/companies/images (4).png";

import avatar from "../assets/logo.svg/avatars/avatar.png";
import hacker from "../assets/logo.svg/avatars/hacker.png";
import man from "../assets/logo.svg/avatars/man.png";

import { motion } from "framer-motion";
import {
  FaUsers,
  FaCalendar,
  FaAward,
  FaLockOpen,
  FaSignal,
} from "react-icons/fa";

function HackathonCards() {
  const hackathons = [
    {
      logo: googleLogo,
      title: "Google Solution Challenge",
      desc: "Build innovative solutions for real-world problems",
      participants: "1,200",
      date: "Dec 15, 2026",
      mode: "Online",
      prize: "$50,000",
      difficulty: "Advanced",
      status: "Open",
    },
    {
      logo: microsoftLogo,
      title: "Microsoft CodeFest",
      desc: "Create the next big thing with Microsoft cloud tech",
      participants: "850",
      date: "Dec 20, 2026",
      mode: "Hybrid",
      prize: "$35,000",
      difficulty: "Intermediate",
      status: "Open",
    },
    {
      logo: mlhLogo,
      title: "MLH Fellowship hack",
      desc: "Build and ship your ideas with the global community",
      participants: "2,100",
      date: "Jan 05, 2027",
      mode: "Online",
      prize: "$20,000",
      difficulty: "Intermediate",
      status: "Open",
    },
    {
      logo: sihLogo,
      title: "Smart India Hackathon",
      desc: "Solve real government problems through software",
      participants: "1,500",
      date: "Jan 15, 2027",
      mode: "Offline",
      prize: "₹15 Lakhs",
      difficulty: "Advanced",
      status: "Registering",
    },
  ];

  return (
    <section id="hackathons" className="bg-transparent py-24 overflow-hidden relative z-10">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Header */}
        <div className="text-center mb-16">
          <span className="text-cyan-400 border border-[#3B82F6]/25 px-4 py-1.5 rounded-full text-xs tracking-wider bg-white/2 inline-block mb-4">
            EXPLORE
          </span>
          <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight">
            Active <span className="bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">Hackathons</span>
          </h2>
          <p className="text-slate-400 mt-4 text-xs md:text-sm max-w-xl mx-auto leading-relaxed">
            Find the perfect challenge, assemble teammates, and register to compete for major prizes.
          </p>
        </div>

        {/* Carousel Slider */}
        <div className="relative">
          <motion.div
            className="flex gap-6 w-max"
            animate={{
              x: ["0%", "-50%"],
            }}
            transition={{
              duration: 35,
              repeat: Infinity,
              ease: "linear",
            }}
          >
            {[...hackathons, ...hackathons].map((hackathon, index) => (
              <motion.div
                key={index}
                whileHover={{
                  y: -8,
                  borderColor: "rgba(59, 130, 246, 0.25)",
                  boxShadow: "0 10px 30px rgba(5,8,22,0.6)",
                }}
                className="
                  w-[340px]
                  bg-[#0e1222]
                  border
                  border-white/5
                  rounded-3xl
                  p-6
                  shrink-0
                  cursor-pointer
                  transition-all
                  duration-300
                  flex
                  flex-col
                  justify-between
                  shadow-[0_10px_25px_rgba(5,8,22,0.45)]
                "
              >
                {/* Logo and Mode */}
                <div className="flex justify-between items-start gap-4">
                  <img
                    src={hackathon.logo}
                    alt=""
                    className="w-12 h-12 rounded-xl bg-white p-1"
                  />
                  <span className="bg-[#3B82F6]/10 text-cyan-400 border border-[#3B82F6]/20 px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider">
                    {hackathon.mode}
                  </span>
                </div>

                {/* Title & Desc */}
                <div className="mt-5">
                  <h3 className="text-white text-lg font-bold leading-tight">
                    {hackathon.title}
                  </h3>
                  <p className="text-slate-400 text-xs mt-2 leading-relaxed">
                    {hackathon.desc}
                  </p>
                </div>

                {/* Detailed statistics grid */}
                <div className="grid grid-cols-2 gap-3 mt-6 border-t border-white/5/60 pt-4 text-[10px] text-slate-400">
                  <div className="flex items-center gap-2">
                    <FaAward className="text-[#FF8A00]" />
                    <span>Prize: {hackathon.prize}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FaCalendar className="text-[#3B82F6]" />
                    <span>Due: {hackathon.date}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FaSignal className="text-[#FF8A00]" />
                    <span>{hackathon.difficulty}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FaLockOpen className="text-green-400" />
                    <span>Status: {hackathon.status}</span>
                  </div>
                </div>

                {/* Footer stack */}
                <div className="flex justify-between items-center mt-6 pt-4 border-t border-white/5/60">
                  <div className="flex items-center">
                    <img src={avatar} alt="" className="w-7 h-7 rounded-full border border-[#0e1222]" />
                    <img src={hacker} alt="" className="w-7 h-7 rounded-full border border-[#0e1222] -ml-2" />
                    <img src={man} alt="" className="w-7 h-7 rounded-full border border-[#0e1222] -ml-2" />
                    <span className="ml-2 text-slate-400 text-[10px] flex items-center gap-1">
                      <FaUsers />
                      {hackathon.participants}
                    </span>
                  </div>

                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    className="
                      bg-[#050816]/40
                      hover:bg-[#0e1222]/60
                      border
                      border-cyan-500/35
                      hover:border-cyan-400
                      hover:shadow-[0_0_15px_rgba(6,182,212,0.45)]
                      transition-all
                      px-4
                      py-1.5
                      rounded-full
                      font-bold
                      text-[10px]
                      tracking-wider
                      text-white
                      shadow-md
                    "
                  >
                    Join Now
                  </motion.button>
                </div>

              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}

export default HackathonCards;