import { motion } from "framer-motion";
import { FaCalendar, FaMapMarkerAlt, FaArrowRight } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import InterestButton from "./InterestButton";
import BookmarkButton from "../bookmarks/BookmarkButton";

export default function HackathonCard({ hack, index = 0, onInterestChange, onCreateTeam }) {
  const navigate = useNavigate();

  const hackId = hack._id || hack.id;
  
  const formatDate = (date) => {
    if (!date) return "TBD";
    return new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  // Status-based color mapping for tags
  const getDifficultyColor = (diff) => {
    switch (diff) {
      case "Beginner":
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/25";
      case "Advanced":
        return "bg-rose-500/10 text-rose-400 border-rose-500/25";
      case "Intermediate":
      default:
        return "bg-amber-500/10 text-amber-400 border-amber-500/25";
    }
  };

  const skills = hack.requiredSkills || hack.technology || [];
  const skillsArray = Array.isArray(skills) ? skills : [skills];

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.6 }}
      whileHover={{ y: -6 }}
      className="relative overflow-hidden rounded-3xl bg-[#0e1222]/80 backdrop-blur-xl border border-white/6 hover:border-cyan-500/35 hover:shadow-[0_20px_50px_rgba(6,182,212,0.15)] transition-all duration-300 group cursor-pointer text-left flex flex-col min-h-90"
    >
      {/* Premium Glassmorphic Shine Sweeper */}
      <motion.div
        animate={{ x: ["-100%", "300%"] }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: "linear",
          repeatDelay: 4,
        }}
        className="absolute inset-y-0 w-24 bg-linear-to-r from-transparent via-white/4 to-transparent pointer-events-none"
      />

      {/* Decorative Glow Shape */}
      <div className={`absolute -top-16 -right-16 w-36 h-36 bg-linear-to-br ${hack.logoBg || "from-cyan-600 to-purple-600"} opacity-15 rounded-full blur-3xl pointer-events-none group-hover:opacity-30 transition-opacity duration-500`} />

      {/* Top Banner Row */}
      <div className="p-5 pb-0 flex justify-between items-center gap-2 relative z-10">
        <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 uppercase tracking-wider">
          {hack.mode || "Online"}
        </span>

        {/* Prize Pool Display (Highlight) */}
        {hack.prizePool && (
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-linear-to-r from-amber-500/10 to-orange-500/10 text-amber-300 border border-amber-500/25 text-[10px] font-bold shadow-[0_0_12px_rgba(245,158,11,0.1)]">
            <span className="text-yellow-400">🏆</span>
            <span>{hack.prizePool}</span>
          </div>
        )}
        <BookmarkButton
          itemId={String(hackId)}
          bookmarkType="hackathon"
          itemName={hack.title || hack.name || "Hackathon"}
          itemImage={hack.banner || ""}
          itemDescription={`${hack.organizer || "Community"} • ${hack.mode || "Online"}`}
          hackathonId={hackId}
          status={hack.status || "Saved"}
          tags={skillsArray}
          className="shrink-0 rounded-full! p-2!"
        />
      </div>

      {/* Card Body */}
      <div className="p-5 flex-1 flex flex-col relative z-10">
        {/* Title + Organizer Area */}
        <div className="flex gap-4 items-start mb-4">
          <div className={`w-12 h-12 rounded-2xl bg-linear-to-br ${hack.logoBg || "from-cyan-500 to-blue-600"} flex items-center justify-center text-xl font-bold text-white shrink-0 border border-white/10 shadow-[0_4px_12px_rgba(0,0,0,0.25)]`}>
            {hack.logo || "🏆"}
          </div>
          <div className="min-w-0">
            <h3 className="text-base font-black text-white leading-snug line-clamp-2 group-hover:text-cyan-300 transition-colors">
              {hack.title || hack.name}
            </h3>
            <p className="text-xs text-slate-400 mt-1 truncate">
              by <span className="text-slate-300 font-semibold">{hack.organizerName || hack.organizer || "Community"}</span>
            </p>
          </div>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-2 gap-3 mb-4 py-3 border-y border-white/4 text-[11px]">
          <div className="flex items-center gap-2 text-slate-400">
            <FaCalendar className="text-cyan-400/70 text-xs shrink-0" />
            <span className="truncate">{formatDate(hack.startDate)} - {formatDate(hack.endDate)}</span>
          </div>
          <div className="flex items-center gap-2 text-slate-400">
            <FaMapMarkerAlt className="text-cyan-400/70 text-xs shrink-0" />
            <span className="truncate">{hack.location || "Global"}</span>
          </div>
        </div>

        {/* Short Description */}
        <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed mb-4">
          {hack.description || "Collaborate with talented builders, design innovative prototypes, and compete for rewards."}
        </p>

        {/* Skills Tags & Difficulty */}
        <div className="flex flex-wrap items-center gap-2.5 mt-auto pt-2">
          {/* Difficulty pill */}
          {hack.difficulty && (
            <span className={`px-2.5 py-0.5 rounded-md text-[9px] font-black uppercase border ${getDifficultyColor(hack.difficulty)}`}>
              {hack.difficulty}
            </span>
          )}

          {/* Tech/Skills */}
          {skillsArray.slice(0, 2).map((tech, idx) => (
            <span key={idx} className="px-2 py-0.5 rounded-md text-[9px] bg-slate-800/50 text-slate-300 border border-white/5 font-bold uppercase tracking-wide">
              {tech}
            </span>
          ))}

          {skillsArray.length > 2 && (
            <span className="px-2 py-0.5 rounded-md text-[9px] bg-slate-800/30 text-slate-500 border border-white/3 font-bold">
              +{skillsArray.length - 2}
            </span>
          )}
        </div>

        {/* Interest action */}
        <div className="mt-4 pt-4 border-t border-white/4">
          <InterestButton
            hackathonId={hackId}
            hackathon={hack}
            initialInterested={hack.isInterested}
            initialInterestId={hack.interestId}
            onChange={onInterestChange}
            onCreateTeam={onCreateTeam}
          />
          {typeof hack.interestCount === "number" && (
            <p className="mt-1.5 text-center text-[10px] text-slate-500">{hack.interestCount} interested builder{hack.interestCount === 1 ? "" : "s"}</p>
          )}
          <button
            type="button"
            onClick={() => navigate(`/hackathons/${hackId}`)}
            className="mt-2.5 w-full rounded-xl border border-white/10 bg-white/3 px-4 py-2.5 text-xs font-bold text-slate-300 transition hover:border-cyan-400/40 hover:bg-cyan-500/10 hover:text-cyan-200 flex items-center justify-center gap-2"
          >
            View full details <FaArrowRight className="text-[10px]" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
