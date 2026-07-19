import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { useEffect, useState, useRef } from "react";
import { currentUser } from "../../data/recommendationsData";
import { FaEdit } from "react-icons/fa";

function MatchScoreRing({ percentage, size = 68, strokeWidth = 5.5 }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const [displayValue, setDisplayValue] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);
  const motionValue = useMotionValue(0);
  const rounded = useTransform(motionValue, (latest) => Math.round(latest));
  const ref = useRef(null);

  useEffect(() => {
    const unsubscribe = rounded.on("change", (v) => setDisplayValue(v));
    return () => unsubscribe();
  }, [rounded]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated) {
          setHasAnimated(true);
          animate(motionValue, percentage, {
            duration: 1.8,
            ease: [0.16, 1, 0.3, 1],
          });
        }
      },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [hasAnimated, motionValue, percentage]);

  return (
    <div ref={ref} className="relative flex items-center justify-center cursor-pointer group" style={{ width: size, height: size }}>
      {/* Outer pulsing ring */}
      <motion.div
        animate={hasAnimated ? {
          boxShadow: [
            "0 0 0px rgba(34, 197, 94, 0)",
            "0 0 10px rgba(34, 197, 94, 0.4)",
            "0 0 0px rgba(34, 197, 94, 0)",
          ],
        } : {}}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        className="absolute inset-0 rounded-full"
      />

      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(51, 65, 85, 0.3)"
          strokeWidth={strokeWidth}
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#22c55e"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={hasAnimated ? { strokeDashoffset: circumference - (percentage / 100) * circumference } : {}}
          transition={{ duration: 1.8, ease: [0.16, 1, 0.3, 1] }}
          style={{ filter: "drop-shadow(0 0 4px rgba(34, 197, 94, 0.4))" }}
        />
      </svg>

      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-sm font-black text-emerald-400 font-mono">
          {displayValue}%
        </span>
      </div>
    </div>
  );
}

import { useAuth } from "../../context/AuthContext";

function UserProfileRow() {
  const { user } = useAuth();
  const displayUser = user || currentUser;

  const displaySkills = Array.isArray(displayUser.skills)
    ? displayUser.skills.map((s) => (typeof s === "object" ? s.name : s))
    : [];

  const name = displayUser.name || "Developer Profile";
  const role = displayUser.preferredRole || displayUser.role || "Software Developer";
  const avatar = displayUser.avatar || currentUser.avatar || "12";
  const avatarSrc = avatar.startsWith("http") || avatar.startsWith("data:")
    ? avatar
    : `https://i.pravatar.cc/100?img=${avatar}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="rounded-3xl border border-white/5 bg-[#0e1222]/30 backdrop-blur-xl p-6 mb-8 flex flex-col xl:flex-row xl:items-center justify-between gap-6"
    >
      {/* Profile summary */}
      <div className="flex items-center gap-4 flex-shrink-0">
        <div className="relative">
          <img
            src={avatarSrc}
            alt={name}
            className="w-14 h-14 rounded-2xl border border-white/10/50 object-cover"
          />
          <span className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-slate-950 bg-green-500" />
        </div>
        <div className="text-left">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-white heading-font">{name}</h2>
            <span className="px-1.5 py-0.5 text-[9px] font-bold rounded bg-blue-500/25 text-blue-300 border border-blue-500/30 font-mono uppercase tracking-wide">
              You
            </span>
          </div>
          <p className="text-xs text-gray-400 mt-0.5">{role}</p>
        </div>
      </div>

      {/* Top Skills */}
      <div className="flex flex-col gap-1.5 min-w-0 flex-1 text-left">
        <span className="text-4xs text-gray-500 font-bold uppercase tracking-wider">Top Skills</span>
        <div className="flex flex-wrap gap-1.5">
          {displaySkills.slice(0, 6).map((skill, idx) => (
            <span
              key={idx}
              className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-[#050816]/60 text-slate-350 border border-white/5"
            >
              {skill}
            </span>
          ))}
          {displaySkills.length > 6 && (
            <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-[#050816]/60 text-gray-500 border border-white/5">
              +{displaySkills.length - 6}
            </span>
          )}
        </div>
      </div>


      {/* Preferences row (looking for, role) */}
      <div className="flex gap-6 border-t xl:border-t-0 xl:border-l border-white/5/80 pt-4 xl:pt-0 xl:pl-6">
        <div>
          <span className="block text-4xs text-gray-500 font-bold uppercase tracking-wider">Looking For</span>
          <span className="block text-xs font-bold text-gray-200 mt-1">{currentUser.lookingFor}</span>
        </div>
        <div>
          <span className="block text-4xs text-gray-500 font-bold uppercase tracking-wider">Role</span>
          <span className="block text-xs font-bold text-gray-200 mt-1 flex items-center gap-1.5">
            {currentUser.role}
            <button className="text-gray-500 hover:text-[#3B82F6] transition-colors">
              <FaEdit className="text-[10px]" />
            </button>
          </span>
        </div>
      </div>

      {/* Overall match card */}
      <div className="flex items-center gap-4 bg-[#050816]/60 border border-white/5 p-4 rounded-2xl min-w-[280px]">
        <MatchScoreRing percentage={currentUser.overallMatch} />
        <div className="min-w-0">
          <span className="block text-[11px] font-extrabold text-emerald-400 uppercase tracking-wide">
            Excellent Match
          </span>
          <p className="text-[10px] text-gray-400 mt-1 leading-relaxed">
            Great! You're highly compatible with these candidates.
          </p>
        </div>
      </div>
    </motion.div>
  );
}

export default UserProfileRow;
