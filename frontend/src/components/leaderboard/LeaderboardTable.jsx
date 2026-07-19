import { motion } from "framer-motion";
import { FaCheckCircle, FaStar, FaChevronRight, FaChevronLeft } from "react-icons/fa";

function LeaderboardTable({ items, pagination, activeType, onPageChange }) {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.04,
      },
    },
  };

  const rowVariants = {
    hidden: { opacity: 0, y: 12 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", stiffness: 100 },
    },
  };

  const getTrendStyle = (trend) => {
    if (!trend) return "text-gray-550";
    if (trend.startsWith("+")) return "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20";
    if (trend.startsWith("-")) return "bg-red-500/10 text-red-400 border border-red-500/20";
    if (trend === "NEW") return "bg-blue-500/10 text-blue-400 border border-blue-500/20";
    return "text-gray-500 border border-white/5";
  };

  const currentPage = pagination?.page || 1;
  const totalPages = pagination?.pages || 1;
  const totalItems = pagination?.total || 0;

  return (
    <div className="rounded-3xl border border-white/5 bg-[#0e1222]/20 backdrop-blur-xl p-5 mb-8 overflow-hidden">
      {/* Table grid structure */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-white/5 text-gray-500 font-bold uppercase tracking-wider text-[10px]">
              <th className="py-4 pl-4 w-12 font-mono">Rank</th>
              <th className="py-4 font-mono">{activeType === "developer" ? "Developer" : "Team"}</th>
              <th className="py-4 text-center font-mono">XP</th>
              <th className="py-4 text-center font-mono">Wins</th>
              <th className="py-4 text-center font-mono">{activeType === "developer" ? "Skills" : "Members"}</th>
              <th className="py-4 text-center font-mono">Rating</th>
              <th className="py-4 pr-4 text-center font-mono">Trend</th>
            </tr>
          </thead>
          <motion.tbody
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="divide-y divide-slate-850/40"
          >
            {items.map((row, index) => {
              const displayAvatar = row.avatar || (row.type === "developer" ? "👤" : "🛡️");
              const displayName = row.name || "Participant";
              const isDev = row.type === "developer" || activeType === "developer";

              return (
                <motion.tr
                  key={row._id || index}
                  variants={rowVariants}
                  className="hover:bg-[#0e1222]/25 transition-colors group cursor-pointer"
                >
                  {/* Rank */}
                  <td className="py-4 pl-4 font-black font-mono text-gray-400 group-hover:text-[#3B82F6] transition-colors">
                    {row.currentRank}
                  </td>

                  {/* Entity Details */}
                  <td className="py-4">
                    <div className="flex items-center gap-3">
                      {typeof displayAvatar === "string" && displayAvatar.startsWith("http") ? (
                        <img
                          src={displayAvatar}
                          alt=""
                          className="w-9 h-9 rounded-xl border border-white/5 object-cover flex-shrink-0 bg-slate-900"
                        />
                      ) : (
                        <div className="w-9 h-9 rounded-xl bg-[#050816]/80 border border-white/5 flex items-center justify-center text-lg flex-shrink-0">
                          {displayAvatar}
                        </div>
                      )}
                      <div className="min-w-0">
                        <h4 className="font-extrabold text-white text-xs sm:text-sm truncate group-hover:text-cyan-300 transition-colors flex items-center gap-1">
                          {displayName}
                          <FaCheckCircle className="text-blue-400 text-[10px]" />
                        </h4>
                        <p className="text-[10px] text-gray-500 mt-0.5 truncate">{row.category || "Hackathon Builder"}</p>
                      </div>
                    </div>
                  </td>

                  {/* XP */}
                  <td className="py-4 text-center font-bold font-mono text-[#3B82F6]">
                    {(row.totalXP || 0).toLocaleString()}
                  </td>

                  {/* Wins */}
                  <td className="py-4 text-center font-semibold text-gray-300 font-mono">
                    {row.wins || 0}
                  </td>

                  {/* Members / Skills subset */}
                  <td className="py-4 text-center font-semibold text-gray-300 font-mono">
                    {isDev ? (
                      <div className="flex flex-wrap gap-1 justify-center max-w-[150px] mx-auto">
                        {(row.skills || []).slice(0, 2).map((s, idx) => (
                          <span key={idx} className="px-1.5 py-0.5 rounded text-[8px] bg-slate-800 text-slate-350 border border-white/5">
                            {s}
                          </span>
                        ))}
                        {(row.skills || []).length === 0 && <span className="text-slate-600">-</span>}
                      </div>
                    ) : (
                      <span>{row.members ? row.members.length : 1}</span>
                    )}
                  </td>

                  {/* Rating */}
                  <td className="py-4 text-center">
                    <span className="inline-flex items-center justify-center gap-1 font-bold font-mono text-gray-200">
                      {row.rating ? row.rating.toFixed(1) : "0.0"}
                      <FaStar className="text-amber-400 text-3xs" />
                    </span>
                  </td>

                  {/* Trend Indicator */}
                  <td className="py-4 pr-4 text-center">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold font-mono ${getTrendStyle(row.trend)}`}>
                      {row.trend && row.trend.startsWith("+") && "▲"}
                      {row.trend && row.trend.startsWith("-") && "▼"}
                      {row.trend || "SAME"}
                    </span>
                  </td>
                </motion.tr>
              );
            })}
          </motion.tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-t border-white/5 pt-4 mt-4">
          <span className="text-[10px] text-gray-500 font-semibold font-mono">
            Showing {((currentPage - 1) * 10) + 1} to {Math.min(currentPage * 10, totalItems)} of {totalItems} items
          </span>

          {/* Page numbers */}
          <div className="flex items-center gap-1.5 text-xs font-bold self-end sm:self-auto font-mono">
            <button
              onClick={() => onPageChange(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="w-7 h-7 rounded-lg bg-[#050816]/60 border border-white/5 text-gray-400 hover:text-white flex items-center justify-center transition-colors disabled:opacity-30 disabled:pointer-events-none"
            >
              <FaChevronLeft className="text-[10px]" />
            </button>

            {Array.from({ length: totalPages }).map((_, idx) => {
              const p = idx + 1;
              const isActive = p === currentPage;
              return (
                <button
                  key={idx}
                  onClick={() => onPageChange(p)}
                  className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${
                    isActive
                      ? "bg-[#FF8A00] text-white border border-purple-500/35"
                      : "bg-[#050816]/60 border border-white/5 text-gray-400 hover:text-gray-250"
                  }`}
                >
                  {p}
                </button>
              );
            })}

            <button
              onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="w-7 h-7 rounded-lg bg-[#050816]/60 border border-white/5 text-gray-400 hover:text-white flex items-center justify-center transition-colors disabled:opacity-30 disabled:pointer-events-none"
            >
              <FaChevronRight className="text-[10px]" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default LeaderboardTable;
