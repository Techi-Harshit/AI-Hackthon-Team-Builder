import { motion } from "framer-motion";
import { useRef } from "react";
import { FaChevronLeft, FaChevronRight, FaCalendarAlt, FaMapMarkerAlt, FaUsers, FaBookmark, FaCheckCircle, FaRocket } from "react-icons/fa";

function SavedHackathons({ bookmarks, onRemove }) {
  const scrollRef = useRef(null);

  const handleScroll = (dir) => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({
        left: dir === "left" ? -330 : 330,
        behavior: "smooth",
      });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="mb-8 relative"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-white heading-font flex items-center gap-2">
          <span>Saved Hackathons</span>
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
            <FaRocket />
          </div>
          <h4 className="text-sm font-bold text-gray-250 mb-1">No Hackathons Saved</h4>
          <p className="text-2xs text-slate-500 max-w-xs leading-relaxed mb-4">
            Browse hackathons, check evaluation metrics and save your favorites here.
          </p>
          <a
            href="/hackathons"
            className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-[11px] font-black uppercase tracking-wider transition-colors"
          >
            Explore Hackathons
          </a>
        </div>
      ) : (
        <>
          {/* Chevrons */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleScroll("left")}
            className="absolute -left-4 top-[55%] -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-[#050816]/90 border border-white/5 flex items-center justify-center text-white hover:border-purple-500 transition-all shadow-[0_0_15px_rgba(0,0,0,0.5)]"
          >
            <FaChevronLeft className="text-xs" />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleScroll("right")}
            className="absolute -right-4 top-[55%] -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-[#050816]/90 border border-white/5 flex items-center justify-center text-white hover:border-purple-500 transition-all shadow-[0_0_15px_rgba(0,0,0,0.5)]"
          >
            <FaChevronRight className="text-xs" />
          </motion.button>

          {/* Horizontal Cards Scroller */}
          <div
            ref={scrollRef}
            className="flex gap-5 overflow-x-auto scrollbar-hide pb-4 px-1.5 sidebar-scroll"
          >
            {bookmarks.map((hack, index) => (
              <motion.div
                key={hack.id || hack.itemId}
                initial={{ opacity: 0, scale: 0.98 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ y: -6, borderColor: "rgba(168, 85, 247, 0.45)" }}
                className="min-w-[270px] max-w-[270px] rounded-3xl border border-white/5 bg-[#050816]/50 backdrop-blur-xl p-5 flex flex-col justify-between cursor-pointer group relative overflow-hidden transition-all duration-300 hover:shadow-[0_10px_30px_rgba(168,85,247,0.15)] text-left"
              >
                {/* Hover shiny reflection sweep */}
                <div
                  className="absolute inset-0 w-[200%] bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-1/2 transition-transform duration-1000 ease-out pointer-events-none"
                  style={{ transform: "skewX(-25deg)" }}
                />

                <div>
                  {/* Header: Badge & Bookmark */}
                  <div className="flex justify-between items-center mb-4">
                    <span className="px-2.5 py-0.8 rounded-full text-4xs font-black uppercase tracking-wide border text-cyan-300 bg-[#FF8A00]/10 border-purple-500/25">
                      {hack.status || "Saved"}
                    </span>

                    <motion.button
                      whileHover={{ scale: 1.15 }}
                      onClick={() => onRemove(hack.itemId)}
                      className="text-cyan-400 hover:text-red-400 transition-colors"
                      title="Remove Bookmark"
                    >
                      <FaBookmark className="text-xs" />
                    </motion.button>
                  </div>

                  {/* Title & Info */}
                  <div className="flex items-center gap-3 mb-4">
                    <img
                      src={hack.itemImage || "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQh57h9F1P5f9G6Z9QZ5V73w7P7uE_0oO0_0ww&s"}
                      alt=""
                      className="w-10 h-10 rounded-xl border border-white/5 flex-shrink-0 bg-slate-900"
                    />
                    <div className="min-w-0">
                      <h4 className="font-extrabold text-white text-xs sm:text-sm truncate group-hover:text-cyan-300 transition-colors flex items-center gap-1">
                        {hack.itemName}
                        <FaCheckCircle className="text-blue-400 text-[10px]" />
                      </h4>
                      <span className="block text-[10px] text-gray-500 mt-0.5 truncate">{hack.itemDescription || "Community Organizer"}</span>
                    </div>
                  </div>

                  {/* Detail fields */}
                  <div className="space-y-2 border-t border-white/5/60 pt-3.5 mb-4 text-3xs font-semibold text-gray-400">
                    <div className="flex items-center gap-2">
                      <FaCalendarAlt className="text-[#3B82F6] text-2xs" />
                      <span>Hackathon Event</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <FaMapMarkerAlt className="text-[#3B82F6] text-2xs" />
                      <span>Online / Hybrid</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <FaUsers className="text-[#3B82F6] text-2xs" />
                      <span>Open Registration</span>
                    </div>
                  </div>
                </div>

                {/* Tags */}
                {hack.tags && hack.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-auto">
                    {hack.tags.map((tag, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 rounded text-[9px] bg-[#050816]/80 text-slate-355 border border-white/5 font-bold"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </>
      )}
    </motion.div>
  );
}

export default SavedHackathons;
