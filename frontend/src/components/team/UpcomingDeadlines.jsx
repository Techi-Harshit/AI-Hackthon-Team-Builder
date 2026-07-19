import { motion } from "framer-motion";
import { FaRegClock, FaExclamationTriangle, FaFileAlt, FaTrophy, FaCalendarCheck } from "react-icons/fa";

function UpcomingDeadlines({ team }) {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { type: "spring", stiffness: 100, damping: 15 },
    },
  };

  // Determine target hackathon name
  const hackName = team?.hackathonId?.title || team?.hackathonName || "This Hackathon";

  // Dynamic milestones mapping
  const milestones = [
    {
      id: 1,
      title: "Prototype & Code Submission",
      date: "In 6 Days",
      daysLeft: 6,
      urgent: true,
      icon: <FaFileAlt className="text-xs" />
    },
    {
      id: 2,
      title: "Presentation Pitch Deck Upload",
      date: "In 8 Days",
      daysLeft: 8,
      urgent: false,
      icon: <FaCalendarCheck className="text-xs" />
    },
    {
      id: 3,
      title: `${hackName} Final Demo Day`,
      date: "In 14 Days",
      daysLeft: 14,
      urgent: false,
      icon: <FaTrophy className="text-xs" />
    }
  ];

  return (
    <div className="rounded-3xl border border-white/5 bg-[#0e1222]/20 backdrop-blur-xl p-6 mb-6 text-left">
      <h3 className="text-lg font-bold text-white heading-font flex items-center gap-2 mb-4">
        <FaRegClock className="text-[#3B82F6] text-base" />
        Upcoming Milestones
      </h3>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-50px" }}
        className="space-y-3"
      >
        {milestones.map((deadline) => (
          <motion.div
            key={deadline.id}
            variants={itemVariants}
            whileHover={{ scale: 1.02 }}
            className={`relative overflow-hidden rounded-2xl border p-4 flex items-center justify-between gap-3 ${
              deadline.urgent
                ? "bg-red-500/5 border-red-500/25 shadow-[0_0_15px_rgba(239,68,68,0.08)]"
                : "bg-[#050816]/45 border-white/5"
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${
                deadline.urgent ? "bg-red-500/10 text-red-400" : "bg-[#0e1222] text-slate-350"
              }`}>
                {deadline.urgent ? (
                  <motion.div
                    animate={{ rotate: [0, -10, 10, -10, 10, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 2 }}
                  >
                    <FaExclamationTriangle className="text-xs" />
                  </motion.div>
                ) : (
                  deadline.icon
                )}
              </div>

              <div>
                <h4 className="text-xs font-bold text-slate-200 truncate max-w-[150px]">
                  {deadline.title}
                </h4>
                <span className="block text-[10px] text-gray-500 font-semibold mt-1">
                  {deadline.date}
                </span>
              </div>
            </div>

            {/* Countdown Badge */}
            <div className="text-right">
              <span className={`inline-block px-2.5 py-1 rounded-lg text-3xs font-extrabold uppercase font-mono border ${
                deadline.urgent
                  ? "bg-red-500/20 text-red-300 border-red-500/30 animate-pulse"
                  : "bg-[#0e1222] text-slate-300 border-white/10/50"
              }`}>
                {deadline.daysLeft} Days Left
              </span>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}

export default UpcomingDeadlines;
