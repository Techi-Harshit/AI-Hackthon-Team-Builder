import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { useEffect, useState, useRef } from "react";

function BookmarksOverview({ stats }) {
  const [totalCount, setTotalCount] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);
  const motionValue = useMotionValue(0);
  const rounded = useTransform(motionValue, (latest) => Math.round(latest));
  const ref = useRef(null);

  const total = stats.total || 0;

  const segmentsData = [
    { name: "Hackathons", value: stats.counts?.hackathons || 0, color: "#a855f7" },
    { name: "Teams", value: stats.counts?.teams || 0, color: "#3b82f6" },
    { name: "Projects", value: stats.counts?.projects || 0, color: "#10b981" },
    { name: "Others", value: (stats.counts?.skills || 0) + (stats.counts?.companies || 0) + (stats.counts?.profiles || 0) + (stats.counts?.organizers || 0) + (stats.counts?.opportunities || 0), color: "#f97316" }
  ].filter(item => item.value > 0);

  // SVG parameters
  const radius = 25;
  const circumference = 2 * Math.PI * radius; // 157

  // Calculate segment lengths and offsets
  let accumulatedOffset = 0;
  const segments = segmentsData.map((item) => {
    const percentage = total > 0 ? item.value / total : 0;
    const length = percentage * circumference;
    const offset = accumulatedOffset;
    accumulatedOffset += length;

    return {
      ...item,
      length,
      offset,
    };
  });

  useEffect(() => {
    const unsubscribe = rounded.on("change", (v) => setTotalCount(v));
    return () => unsubscribe();
  }, [rounded]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated) {
          setHasAnimated(true);
          animate(motionValue, total, {
            duration: 1.5,
            ease: [0.16, 1, 0.3, 1],
          });
        }
      },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [hasAnimated, motionValue, total]);

  // Handle prop update changes
  useEffect(() => {
    if (hasAnimated) {
      animate(motionValue, total, {
        duration: 0.8,
        ease: "easeOut"
      });
    }
  }, [total, hasAnimated, motionValue]);

  return (
    <div ref={ref} className="rounded-3xl border border-white/5 bg-[#0e1222]/20 backdrop-blur-xl p-6 mb-6">
      <h3 className="text-lg font-bold text-white heading-font mb-5">Bookmark Overview</h3>

      {total === 0 ? (
        <div className="text-center py-6 text-slate-500 text-xs font-mono">
          No statistics to calculate. Bookmark items to see analysis.
        </div>
      ) : (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          {/* Doughnut SVG */}
          <div className="relative w-28 h-28 flex-shrink-0 flex items-center justify-center">
            <svg width="100%" height="100%" viewBox="0 0 64 64" className="-rotate-90">
              {segments.map((seg, idx) => (
                <motion.circle
                  key={idx}
                  cx="32"
                  cy="32"
                  r={radius}
                  fill="none"
                  stroke={seg.color}
                  strokeWidth="7"
                  strokeDasharray={circumference}
                  initial={{ strokeDashoffset: circumference }}
                  animate={hasAnimated ? { strokeDashoffset: circumference - seg.length } : {}}
                  transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
                  style={{
                    transformOrigin: "32px 32px",
                    rotate: `${(seg.offset / circumference) * 360}deg`,
                    filter: `drop-shadow(0 0 2px ${seg.color}35)`,
                  }}
                />
              ))}
            </svg>

            {/* Central counter text */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-black text-white font-mono leading-none">
                {totalCount}
              </span>
              <span className="text-[8px] text-gray-500 font-bold uppercase tracking-wider mt-1">
                Total
              </span>
            </div>
          </div>

          {/* Legend */}
          <div className="flex-1 w-full space-y-2.5">
            {segments.map((seg, idx) => (
              <div key={idx} className="flex items-center justify-between text-xs font-mono">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: seg.color }} />
                  <span className="font-semibold text-gray-300">{seg.name}</span>
                </div>
                <span className="font-bold text-white bg-[#050816]/60 border border-white/5 px-2 py-0.5 rounded-md">
                  {seg.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default BookmarksOverview;
