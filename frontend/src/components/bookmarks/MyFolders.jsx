import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { FaPlus, FaRegFolder, FaEllipsisV, FaCheck, FaTimes, FaTrash } from "react-icons/fa";

function MyFolders({ folders, activeFolder, onSelectFolder, onCreateFolder, onDeleteFolder }) {
  const [isAdding, setIsAdding] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");

  const handleAddFolder = (e) => {
    e.preventDefault();
    if (!newFolderName.trim()) return;
    onCreateFolder(newFolderName.trim());
    setNewFolderName("");
    setIsAdding(false);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: 20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { type: "spring", stiffness: 100 },
    },
  };

  // Pre-configured icons/colors for custom folders
  const getFolderStyle = (index) => {
    const styles = [
      { icon: "📁", color: "text-[#3B82F6] bg-[#3B82F6]/10 border-blue-500/25" },
      { icon: "🧠", color: "text-purple-400 bg-purple-500/10 border-purple-500/25" },
      { icon: "🚀", color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/25" },
      { icon: "🏆", color: "text-amber-450 bg-amber-500/10 border-amber-500/25" },
      { icon: "⭐", color: "text-cyan-400 bg-cyan-500/10 border-cyan-500/25" }
    ];
    return styles[index % styles.length];
  };

  return (
    <div className="rounded-3xl border border-white/5 bg-[#0e1222]/20 backdrop-blur-xl p-6 mb-6 relative overflow-hidden">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-white heading-font">My Folders</h3>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsAdding(!isAdding)}
          className="text-2xs font-semibold text-[#3B82F6] hover:text-cyan-300 transition-colors uppercase tracking-wider flex items-center gap-1 font-mono"
        >
          <FaPlus />
          New Folder
        </motion.button>
      </div>

      {/* Input Form for new folder */}
      <AnimatePresence>
        {isAdding && (
          <motion.form
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            onSubmit={handleAddFolder}
            className="flex items-center gap-2 mb-4 overflow-hidden border-b border-white/5 pb-4"
          >
            <input
              type="text"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              placeholder="Folder name..."
              className="flex-1 bg-[#050816]/80 border border-white/5 rounded-xl py-2 px-3 text-xs outline-none text-white focus:border-purple-500 transition-colors placeholder:text-gray-600 font-mono"
              autoFocus
            />
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="submit"
              className="w-8 h-8 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 text-white flex items-center justify-center text-xs"
            >
              <FaCheck />
            </motion.button>
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="w-8 h-8 rounded-xl bg-[#0e1222] border border-white/5 text-gray-400 flex items-center justify-center text-xs"
            >
              <FaTimes />
            </button>
          </motion.form>
        )}
      </AnimatePresence>

      {/* Folder items */}
      {folders.length === 0 ? (
        <div className="text-center py-4 text-slate-500 text-xs font-mono">
          No folders created yet.
        </div>
      ) : (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-30px" }}
          className="space-y-2.5"
        >
          {folders.map((folder, index) => {
            const style = getFolderStyle(index);
            const isActive = activeFolder === folder.folderName;
            const count = folder.bookmarks?.length || 0;

            return (
              <motion.div
                key={folder._id || index}
                variants={itemVariants}
                whileHover={{ x: 4 }}
                onClick={() => onSelectFolder(isActive ? null : folder.folderName)}
                className={`flex items-center justify-between p-3 rounded-2xl border transition-colors group cursor-pointer ${
                  isActive
                    ? "bg-[#FF8A00]/10 border-[#FF8A00]/25"
                    : "bg-[#050816]/45 border-white/5 hover:border-white/10"
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm border ${style.color}`}>
                    {style.icon}
                  </div>
                  <div className="min-w-0">
                    <span className="block font-bold text-xs text-gray-200 truncate group-hover:text-cyan-300 transition-colors">
                      {folder.folderName}
                    </span>
                    <span className="block text-[10px] text-gray-500 font-semibold mt-0.5">
                      {count} {count === 1 ? "item" : "items"}
                    </span>
                  </div>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (window.confirm(`Are you sure you want to delete folder "${folder.folderName}"?`)) {
                      onDeleteFolder(folder.folderName);
                    }
                  }}
                  className="text-gray-500 hover:text-red-400 p-1 opacity-0 group-hover:opacity-100 transition-all"
                  title="Delete Folder"
                >
                  <FaTrash className="text-3xs" />
                </button>
              </motion.div>
            );
          })}
        </motion.div>
      )}
    </div>
  );
}

export default MyFolders;
