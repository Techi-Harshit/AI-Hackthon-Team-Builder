import { motion } from "framer-motion";
import { FaBookmark, FaRegCalendarAlt, FaHistory } from "react-icons/fa";

function RecentlyBookmarked({ bookmarks, onRemove }) {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
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

  // Human readable time ago helper
  const formatTimeAgo = (dateString) => {
    try {
      const date = new Date(dateString);
      const seconds = Math.floor((new Date() - date) / 1000);
      
      let interval = Math.floor(seconds / 31536000);
      if (interval >= 1) return `${interval}y ago`;
      interval = Math.floor(seconds / 2592000);
      if (interval >= 1) return `${interval}mo ago`;
      interval = Math.floor(seconds / 86400);
      if (interval >= 1) return `${interval}d ago`;
      interval = Math.floor(seconds / 3600);
      if (interval >= 1) return `${interval}h ago`;
      interval = Math.floor(seconds / 60);
      if (interval >= 1) return `${interval}m ago`;
      return "just now";
    } catch {
      return "just now";
    }
  };

  return (
    <div className="rounded-3xl border border-white/5 bg-[#0e1222]/20 backdrop-blur-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-white heading-font flex items-center gap-1.5">
          <FaHistory className="text-purple-400 text-xs" />
          <span>Recently Saved</span>
        </h3>
      </div>

      {bookmarks.length === 0 ? (
        <div className="text-center py-6 text-slate-500 text-xs font-mono">
          No recently saved bookmarks.
        </div>
      ) : (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-30px" }}
          className="space-y-3"
        >
          {bookmarks.map((item) => (
            <motion.div
              key={item.id || item.itemId}
              variants={itemVariants}
              whileHover={{ scale: 1.02 }}
              className="p-3.5 rounded-2xl bg-[#050816]/45 border border-white/5 flex items-center justify-between gap-3 relative group"
            >
              <div className="flex items-center gap-3 min-w-0">
                <img
                  src={item.itemImage || `https://api.dicebear.com/7.x/identicon/svg?seed=${item.itemName}`}
                  alt=""
                  className="w-9 h-9 rounded-xl border border-white/5 object-cover flex-shrink-0 bg-slate-900"
                />
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <h4 className="font-extrabold text-white text-xs truncate max-w-[125px] group-hover:text-cyan-300 transition-colors">
                      {item.itemName}
                    </h4>
                    <span className="px-1.5 py-0.5 rounded text-[8px] font-extrabold uppercase bg-cyan-500/10 text-cyan-300 border border-white/5">
                      {item.bookmarkType}
                    </span>
                  </div>
                  <span className="block text-[10px] text-gray-500 font-semibold mt-1">
                    {formatTimeAgo(item.savedAt)}
                  </span>
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.15 }}
                onClick={() => onRemove(item.itemId)}
                className="text-[#3B82F6] hover:text-red-400 transition-colors flex-shrink-0"
                title="Remove Bookmark"
              >
                <FaBookmark className="text-3xs text-cyan-400 group-hover:text-red-400" />
              </motion.button>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}

export default RecentlyBookmarked;
