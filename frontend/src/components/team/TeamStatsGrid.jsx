import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { useEffect, useState, useRef } from "react";
import { teamStats } from "../../data/myTeamData";
import { FaTrophy, FaTasks, FaRegCalendarCheck, FaChartLine } from "react-icons/fa";

function StatsRing({ percentage, color, size = 64, strokeWidth = 5 }) {
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
            duration: 2,
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
    <div ref={ref} className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      {/* Glow pulse */}
      <motion.div
        animate={hasAnimated ? {
          boxShadow: [
            `0 0 0px ${color}00`,
            `0 0 10px ${color}40`,
            `0 0 0px ${color}00`,
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
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={hasAnimated ? { strokeDashoffset: circumference - (percentage / 100) * circumference } : {}}
          transition={{ duration: 2, ease: [0.16, 1, 0.3, 1] }}
          style={{ filter: `drop-shadow(0 0 4px ${color}40)` }}
        />
      </svg>

      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-sm font-extrabold text-white">
          {displayValue}%
        </span>
      </div>
    </div>
  );
}

function TeamStatsGrid() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 25 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", stiffness: 100, damping: 15 },
    },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-50px" }}
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
    >
      {teamStats.map((stat, index) => {
        return (
          <motion.div
            key={index}
            variants={cardVariants}
            whileHover={{ y: -6, transition: { duration: 0.2 } }}
            className="relative overflow-hidden rounded-2xl border border-white/5 bg-[#0e1222]/40 backdrop-blur-xl p-6 flex items-center justify-between group"
          >
            {/* Hover shine effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out" />

            <div className="flex flex-col gap-2">
              <span className="text-gray-400 text-xs font-semibold uppercase tracking-wider">
                {stat.label}
              </span>
              <span className="text-3xl font-extrabold text-white heading-font">
                {stat.type === "ring" ? (
                  stat.label === "Team Compatibility" ? "92%" : "68%"
                ) : (
                  stat.value
                )}
              </span>
              <span className="text-gray-400 text-xs flex items-center gap-1.5 mt-1">
                {stat.type === "rank" && <span className="text-amber-400">★</span>}
                {stat.subtext}
              </span>
            </div>

            {/* Right side representation */}
            <div>
              {stat.type === "ring" ? (
                <StatsRing percentage={stat.value} color={stat.color} />
              ) : stat.type === "text" ? (
                <div className="w-14 h-14 rounded-2xl bg-[#FF8A00]/10 border border-white/5 flex items-center justify-center text-[#3B82F6] text-2xl group-hover:scale-110 transition-transform">
                  <FaRegCalendarCheck className="animate-pulse" />
                </div>
              ) : (
                <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 text-2xl group-hover:scale-110 transition-transform">
                  <FaTrophy className="animate-bounce" />
                </div>
              )}
            </div>
          </motion.div>
        );
      })}
    </motion.div>
  );
}

export default TeamStatsGrid;
