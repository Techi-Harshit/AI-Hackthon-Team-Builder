import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaUserCheck, FaBolt } from "react-icons/fa";
import DeveloperDetailsModal from "./common/DeveloperDetailsModal";

function TopDevelopers() {
  const developers = [
    {
      name: "Abhishek Saxena",
      role: "AI Engineer",
      avatar: "https://i.pravatar.cc/100?img=11",
      compatibility: "98%",
      skills: ["PyTorch", "Python", "LLMs", "FastAPI"],
      badge: "Top Match",
    },
    {
      name: "Deepika Sen",
      role: "React Specialist",
      avatar: "https://i.pravatar.cc/100?img=5",
      compatibility: "95%",
      skills: ["React", "TypeScript", "Tailwind", "Vite"],
      badge: "Vite Pro",
    },
    {
      name: "Raman Murthy",
      role: "Backend Architect",
      avatar: "https://i.pravatar.cc/100?img=68",
      compatibility: "92%",
      skills: ["Node.js", "Express", "MongoDB", "Redis"],
      badge: "DB Guru",
    },
    {
      name: "Nikita Sethi",
      role: "UI/UX Designer",
      avatar: "https://i.pravatar.cc/100?img=49",
      compatibility: "89%",
      skills: ["Figma", "Design Systems", "HTML5", "CSS3"],
      badge: "Creative",
    },
  ];

  const [selectedDev, setSelectedDev] = useState(null);

  return (
    <section className="bg-transparent py-24 px-6 relative z-10">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <span className="text-[#FF8A00] border border-[#FF8A00]/25 px-4 py-1.5 rounded-full text-xs tracking-wider bg-white/2 inline-block mb-4">
            TALENT
          </span>
          <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight">
            Top <span className="bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">Teammates</span>
          </h2>
          <p className="text-slate-400 mt-4 text-xs md:text-sm max-w-xl mx-auto leading-relaxed">
            Connect with highly compatible developers actively searching for teams in upcoming hackathons.
          </p>
        </div>

        {/* Developers Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {developers.map((dev, idx) => (
            <motion.div
              key={idx}
              onClick={() => setSelectedDev(dev)}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              whileHover={{
                y: -8,
                borderColor: "rgba(255, 255, 255, 0.15)",
                boxShadow: "0 15px 35px rgba(5,8,22,0.55)",
              }}
              className="
                bg-[#0e1222]
                border
                border-white/5
                rounded-3xl
                p-6
                text-center
                relative
                shadow-[0_10px_25px_rgba(5,8,22,0.4)]
                transition-all
                duration-300
                cursor-pointer
              "
            >
              {/* Badge */}
              <span className="absolute top-4 right-4 bg-[#3B82F6]/10 text-cyan-400 border border-[#3B82F6]/20 px-2 py-0.5 rounded-full text-[8px] font-bold uppercase tracking-wider">
                {dev.badge}
              </span>

              {/* Avatar */}
              <div className="relative w-20 h-20 mx-auto mb-5">
                <img
                  src={dev.avatar}
                  alt={dev.name}
                  className="w-full h-full rounded-full border-2 border-[#FF8A00]/40 p-0.5 object-cover"
                />
                <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-[#050816] border border-white/5 flex items-center justify-center text-[10px] text-green-400">
                  <FaUserCheck />
                </div>
              </div>

              {/* Name & Role */}
              <h3 className="text-white text-base font-bold">{dev.name}</h3>
              <p className="text-[#A1A1AA] text-xs mt-1">{dev.role}</p>

              {/* Compatibility Percentage indicator */}
              <div className="mt-4 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-500/10 text-green-400 text-[10px] font-bold border border-green-500/20">
                <FaBolt className="text-[9px] animate-bounce" />
                <span>{dev.compatibility} Match</span>
              </div>

              {/* Skills Tags */}
              <div className="flex flex-wrap gap-1.5 justify-center mt-6 pt-4 border-t border-white/5/60">
                {dev.skills.map((skill, sIdx) => (
                  <span
                    key={sIdx}
                    className="bg-[#050816] border border-white/5 text-slate-400 px-2 py-0.5 rounded-md text-[9px] font-medium"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {selectedDev && (
          <DeveloperDetailsModal
            developer={selectedDev}
            onClose={() => setSelectedDev(null)}
          />
        )}
      </AnimatePresence>
    </section>
  );
}

export default TopDevelopers;
