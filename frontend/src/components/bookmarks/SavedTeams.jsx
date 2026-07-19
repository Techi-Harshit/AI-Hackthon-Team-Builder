import { motion } from "framer-motion";
import { FaBookmark, FaEllipsisV, FaUsers, FaArrowRight } from "react-icons/fa";

function SavedTeams({ bookmarks, onRemove }) {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  };

  const rowVariants = {
    hidden: { opacity: 0, x: -15 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { type: "spring", stiffness: 100 },
    },
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-lg font-bold text-white heading-font flex items-center gap-2">
          <span>Saved Teams</span>
          <span className="text-xs bg-[#0e1222] text-slate-350 px-2 py-0.5 rounded-md font-mono">
            {bookmarks.length}
          </span>
        </h3>
        {bookmarks.length > 0 && (
          <button className="text-2xs font-semibold text-[#3B82F6] hover:text-cyan-300 transition-colors uppercase tracking-wider font-mono">
            View All ({bookmarks.length}) &rarr;
          </button>
        )}
      </div>

      {bookmarks.length === 0 ? (
        <div className="rounded-3xl border border-white/5 bg-[#050816]/30 p-8 text-center flex flex-col items-center justify-center min-h-[160px] relative overflow-hidden">
          <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 mb-3">
            <FaUsers />
          </div>
          <h4 className="text-sm font-bold text-gray-250 mb-1">No Teams Saved</h4>
          <p className="text-2xs text-slate-500 max-w-xs leading-relaxed mb-4">
            Discover active teams looking for members or post your own profile to match.
          </p>
          <a
            href="/discover"
            className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-[11px] font-black uppercase tracking-wider transition-colors"
          >
            Explore Teams
          </a>
        </div>
      ) : (
        /* Rows Container */
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-30px" }}
          className="space-y-3"
        >
          {bookmarks.map((team) => (
            <motion.div
              key={team.id || team.itemId}
              variants={rowVariants}
              whileHover={{ y: -4, borderColor: "rgba(168, 85, 247, 0.45)" }}
              className="relative overflow-hidden rounded-2xl border border-white/5 bg-[#050816]/50 backdrop-blur-xl p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 group transition-all duration-300 hover:shadow-[0_8px_25px_rgba(168,85,247,0.12)] text-left"
            >
              {/* Hover shiny reflection sweep */}
              <div
                className="absolute inset-0 w-[200%] bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-1/2 transition-transform duration-1000 ease-out pointer-events-none"
                style={{ transform: "skewX(-25deg)" }}
              />

              <div className="flex items-start gap-3.5 flex-1 min-w-0">
                {/* Bookmark & Avatar */}
                <div className="flex items-center gap-2 flex-shrink-0 mt-0.5">
                  <motion.button
                    whileHover={{ scale: 1.15 }}
                    onClick={() => onRemove(team.itemId)}
                    className="text-cyan-400 hover:text-red-400 transition-colors"
                    title="Remove Bookmark"
                  >
                    <FaBookmark className="text-xs" />
                  </motion.button>

                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center text-xl border border-white/10 shadow-inner">
                    👥
                  </div>
                </div>

                {/* Details */}
                <div className="min-w-0">
                  <div className="flex items-center flex-wrap gap-2">
                    <h4 className="font-extrabold text-white text-xs sm:text-sm truncate group-hover:text-cyan-300 transition-colors">
                      {team.itemName}
                    </h4>
                    <span className="px-2 py-0.5 rounded text-[8px] font-extrabold uppercase border text-cyan-350 bg-[#FF8A00]/10 border-white/5">
                      Team
                    </span>
                  </div>

                  <p className="text-[10px] text-gray-400 mt-1 truncate">{team.itemDescription || "No team description available."}</p>

                  {team.tags && team.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2.5">
                      {team.tags.map((tag, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded text-[9px] bg-[#050816]/80 text-slate-350 border border-white/5"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Status */}
              <div className="flex items-center justify-between md:justify-end gap-5 border-t md:border-t-0 border-white/5 pt-3 md:pt-0">
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1.5 text-[10px] font-bold text-gray-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-ping" />
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 absolute" />
                    Active
                  </span>

                  <button className="text-gray-500 hover:text-white p-1 transition-colors">
                    <FaEllipsisV className="text-xs" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}

export default SavedTeams;
