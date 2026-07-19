import { motion } from "framer-motion";
import { FaEllipsisV } from "react-icons/fa";
import CompatibilityRing from "./CompatibilityRing";

const statusStyles = {
  emerald: "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30",
  amber: "bg-amber-500/20 text-amber-300 border border-amber-500/30",
  red: "bg-red-500/20 text-red-300 border border-red-500/30",
};

const rowVariants = {
  hidden: { opacity: 0, x: -60, scale: 0.97 },
  visible: (i) => ({
    opacity: 1,
    x: 0,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 120,
      damping: 14,
      delay: i * 0.12,
    },
  }),
};

function ApplicationRow({ app, index }) {
  return (
    <motion.div
      custom={index}
      variants={rowVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-30px" }}
      whileHover={{
        scale: 1.01,
        x: 8,
        backgroundColor: "rgba(30, 41, 59, 0.5)",
        borderColor: "rgba(168, 85, 247, 0.2)",
        transition: { type: "spring", stiffness: 300, damping: 20 },
      }}
      className="relative overflow-hidden rounded-2xl bg-[#0e1222]/40 backdrop-blur-xl border border-white/5/60 p-5 cursor-pointer group"
    >
      {/* Hover gradient reveal */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-purple-600/5 via-transparent to-blue-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
      />

      {/* Moving shine on hover */}
      <motion.div
        className="absolute inset-y-0 w-20 bg-gradient-to-r from-transparent via-white/3 to-transparent -translate-x-full group-hover:translate-x-[800%] transition-transform duration-1000"
      />

      <div className="relative z-10 flex items-center gap-6">
        {/* Avatar */}
        <motion.div
          whileHover={{ rotate: 10, scale: 1.1 }}
          transition={{ type: "spring", stiffness: 300 }}
          className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${app.avatarBg} flex items-center justify-center text-2xl flex-shrink-0 shadow-lg`}
          style={{
            boxShadow: `0 4px 15px rgba(0,0,0,0.3)`,
          }}
        >
          {app.avatar}
        </motion.div>

        {/* Team Info */}
        <div className="min-w-[200px] flex-shrink-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-bold text-white text-base">{app.teamName}</h3>
            <motion.span
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-sm"
            >
              👥
            </motion.span>
          </div>
          <p className="text-xs text-gray-500 mb-2.5">{app.description}</p>
          <div className="flex flex-wrap gap-1.5">
            {app.skills.map((skill, i) => (
              <motion.span
                key={i}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 + i * 0.05, type: "spring" }}
                whileHover={{
                  scale: 1.1,
                  backgroundColor: "rgba(168, 85, 247, 0.15)",
                  borderColor: "rgba(168, 85, 247, 0.4)",
                }}
                className="px-2.5 py-0.5 rounded-md text-[11px] bg-[#0e1222]/80 text-cyan-300 border border-white/10/50 cursor-pointer transition-colors"
              >
                {skill}
              </motion.span>
            ))}
          </div>
        </div>

        {/* Applied On */}
        <div className="min-w-[130px] flex-shrink-0">
          <p className="text-[10px] text-gray-600 mb-1 uppercase tracking-wider font-semibold">
            Applied On
          </p>
          <p className="text-sm text-white font-medium">{app.appliedDate}</p>
          <p className="text-xs text-gray-500">{app.appliedTime}</p>
        </div>

        {/* Compatibility */}
        <div className="min-w-[130px] flex-shrink-0 flex flex-col items-center">
          <p className="text-[10px] text-gray-600 mb-2 uppercase tracking-wider font-semibold">
            Team Compatibility
          </p>
          <CompatibilityRing
            percentage={app.compatibility}
            color={app.compatibilityColor}
            size={58}
            strokeWidth={4}
          />
        </div>

        {/* Status */}
        <div className="min-w-[160px] flex-shrink-0">
          <p className="text-[10px] text-gray-600 mb-2 uppercase tracking-wider font-semibold">
            Status
          </p>
          <motion.span
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.15, type: "spring" }}
            className={`inline-block px-3 py-1 rounded-md text-xs font-semibold mb-1.5 ${statusStyles[app.statusColor]}`}
          >
            {app.status}
          </motion.span>
          <p className="text-xs text-gray-500">{app.statusText}</p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 ml-auto flex-shrink-0">
          <motion.button
            whileHover={{
              scale: 1.06,
              boxShadow: "0 0 20px rgba(168, 85, 247, 0.25)",
            }}
            whileTap={{ scale: 0.94 }}
            transition={{ type: "spring", stiffness: 400 }}
            className="px-4 py-2 rounded-xl border border-purple-500/40 text-cyan-300 text-xs font-semibold hover:bg-[#FF8A00]/10 transition-colors"
          >
            View Team
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.15, rotate: 90 }}
            whileTap={{ scale: 0.9 }}
            transition={{ type: "spring", stiffness: 300 }}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-500 hover:text-gray-300 hover:bg-[#0e1222] transition"
          >
            <FaEllipsisV className="text-xs" />
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}

export default ApplicationRow;
