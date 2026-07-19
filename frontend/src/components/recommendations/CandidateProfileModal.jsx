import React from "react";
import { motion } from "framer-motion";
import { FaGithub, FaLinkedin, FaTrophy, FaStar, FaShieldAlt } from "react-icons/fa";

export default function CandidateProfileModal({ rec, onClose }) {
  if (!rec) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-lg bg-[#0e1222]/90 border border-white/10 rounded-3xl p-6 relative backdrop-blur-xl text-left shadow-2xl space-y-6"
      >
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-gray-400 hover:text-white transition text-xs cursor-pointer p-1.5 rounded bg-white/5 font-extrabold"
        >
          ✕ Close
        </button>

        {/* Profile Header */}
        <div className="flex gap-4 items-center">
          <img
            src={rec.avatar || "https://api.dicebear.com/7.x/bottts/svg?seed=Teammate"}
            alt={rec.name}
            className="w-16 h-16 rounded-2xl bg-[#030712] border border-white/5 object-cover"
          />
          <div>
            <h3 className="font-extrabold text-base text-white">{rec.name}</h3>
            <p className="text-xs text-cyan-400 font-bold">{rec.preferredRole} Developer</p>
            <p className="text-xs text-gray-400 font-medium">{rec.college}</p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-3 bg-[#030712]/30 p-3.5 rounded-2xl border border-white/5 text-center">
          <div className="space-y-1">
            <span className="block text-[8px] text-gray-500 uppercase font-black tracking-wider flex items-center justify-center gap-1">
              <FaShieldAlt className="text-cyan-400" /> Trust Score
            </span>
            <span className="block text-sm font-black text-white">{rec.trustScore || 0}/100</span>
          </div>
          <div className="space-y-1">
            <span className="block text-[8px] text-gray-500 uppercase font-black tracking-wider flex items-center justify-center gap-1">
              <FaStar className="text-yellow-400" /> Avg Rating
            </span>
            <span className="block text-sm font-black text-white">{(rec.averageRating || 4.5).toFixed(1)} / 5</span>
          </div>
          <div className="space-y-1">
            <span className="block text-[8px] text-gray-500 uppercase font-black tracking-wider flex items-center justify-center gap-1">
              <FaTrophy className="text-orange-400" /> Hackathons
            </span>
            <span className="block text-sm font-black text-white">{rec.completedHackathons || 0} Done</span>
          </div>
        </div>

        {/* Bio */}
        <div className="space-y-1.5">
          <span className="block text-[9px] text-gray-500 font-black uppercase tracking-wider">Candidate Bio</span>
          <p className="text-xs text-gray-300 leading-relaxed font-medium bg-white/5 p-3 rounded-xl border border-white/5">
            {rec.bio || `${rec.name} is a passionate developer eager to collaborate on innovative projects and hackathons.`}
          </p>
        </div>

        {/* Skills */}
        <div className="space-y-1.5">
          <span className="block text-[9px] text-gray-500 font-black uppercase tracking-wider">Skills & Tech Stack</span>
          <div className="flex flex-wrap gap-1.5">
            {rec.matchedSkills && rec.matchedSkills.map((skill, idx) => (
              <span key={idx} className="px-2.5 py-0.5 rounded-lg text-[10px] bg-cyan-500/10 text-cyan-300 font-bold border border-cyan-500/10">
                {skill}
              </span>
            ))}
            {rec.missingSkills && rec.missingSkills.map((skill, idx) => (
              <span key={idx} className="px-2.5 py-0.5 rounded-lg text-[10px] bg-white/5 text-gray-400 font-semibold border border-white/5">
                {skill}
              </span>
            ))}
          </div>
        </div>

        {/* Social Link Handles */}
        <div className="flex justify-between items-center pt-2 border-t border-white/5">
          <div className="flex gap-2">
            {rec.github && (
              <a
                href={rec.github.startsWith("http") ? rec.github : `https://${rec.github}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-gray-300 hover:text-white transition"
              >
                <FaGithub /> GitHub
              </a>
            )}
            {rec.linkedin && (
              <a
                href={rec.linkedin.startsWith("http") ? rec.linkedin : `https://${rec.linkedin}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-gray-300 hover:text-white transition"
              >
                <FaLinkedin className="text-blue-400" /> LinkedIn
              </a>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
