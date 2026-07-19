import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { useEffect, useState, useRef } from "react";

function CompatibilityRing({ percentage, color, size = 64, strokeWidth = 4.5 }) {
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

  // Intersection Observer for triggering animation
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

  // Glow intensity based on percentage
  const glowIntensity = percentage >= 85 ? "12px" : percentage >= 70 ? "8px" : "4px";

  return (
    <motion.div
      ref={ref}
      whileHover={{ scale: 1.15, rotate: 5 }}
      transition={{ type: "spring", stiffness: 300, damping: 15 }}
      className="relative flex items-center justify-center cursor-pointer group"
      style={{ width: size, height: size }}
    >
      {/* Outer glow pulse */}
      <motion.div
        animate={hasAnimated ? {
          boxShadow: [
            `0 0 0px ${color}00`,
            `0 0 ${glowIntensity} ${color}60`,
            `0 0 0px ${color}00`,
          ],
        } : {}}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        className="absolute inset-0 rounded-full"
      />

      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="-rotate-90"
      >
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(51, 65, 85, 0.4)"
          strokeWidth={strokeWidth}
        />
        {/* Animated progress circle */}
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
          style={{
            filter: `drop-shadow(0 0 8px ${color}50)`,
          }}
        />
        {/* Subtle secondary ring */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius + 3}
          fill="none"
          stroke={color}
          strokeWidth={0.5}
          opacity={0.2}
          strokeDasharray={circumference + 20}
          initial={{ strokeDashoffset: circumference + 20 }}
          animate={hasAnimated ? { strokeDashoffset: 0 } : {}}
          transition={{ duration: 3, ease: "easeOut" }}
        />
      </svg>

      {/* Percentage text with counting */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center"
        initial={{ opacity: 0, scale: 0.5 }}
        animate={hasAnimated ? { opacity: 1, scale: 1 } : {}}
        transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
      >
        <span
          className="text-sm font-bold"
          style={{ color: color }}
        >
          {displayValue}%
        </span>
      </motion.div>

      {/* Hover tooltip */}
      <motion.div
        initial={{ opacity: 0, y: 8, scale: 0.9 }}
        whileHover={{ opacity: 0 }}
        className="absolute -bottom-8 left-1/2 -translate-x-1/2 px-2 py-1 rounded-md bg-[#0e1222] text-[10px] text-gray-300 whitespace-nowrap pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity"
      >
        Compatibility Score
      </motion.div>
    </motion.div>
  );
}

export default CompatibilityRing;
