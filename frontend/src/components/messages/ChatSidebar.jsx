import { motion } from "framer-motion";
import { useState } from "react";
import { FaSearch, FaFilter, FaCheckCircle } from "react-icons/fa";

const matchBadgeColors = {
  purple: "text-cyan-300 bg-[#FF8A00]/10 border-white/5",
  emerald: "text-emerald-300 bg-emerald-500/10 border-emerald-500/20",
};

function ChatSidebar({ chats, selectedChatId, onSelectChat }) {
  const [activeTab, setActiveTab] = useState("inbox");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredChats = chats.filter((chat) => {
    // Filter by tab
    if (activeTab === "unread" && chat.unreadCount === 0) return false;
    // Filter by query
    return chat.name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <div className="rounded-3xl border border-white/5 bg-[#0e1222]/10 backdrop-blur-xl p-5 flex flex-col h-[700px]">
      {/* Tabs */}
      <div className="flex items-center gap-1.5 bg-[#050816]/60 p-1 rounded-xl border border-white/5 mb-4 flex-shrink-0">
        {["inbox", "unread", "archived"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-1.5 rounded-lg text-2xs font-bold uppercase tracking-wider transition-all duration-300 relative ${
              activeTab === tab ? "text-white" : "text-gray-500 hover:text-gray-300"
            }`}
          >
            {activeTab === tab && (
              <motion.div
                layoutId="chatListTab"
                className="absolute inset-0 bg-[#0e1222] border border-white/10/50 rounded-lg"
                transition={{ type: "spring", stiffness: 350, damping: 25 }}
              />
            )}
            <span className="relative z-10">
              {tab === "inbox" ? "Inbox (3)" : tab === "unread" ? "Unread (3)" : "Archived"}
            </span>
          </button>
        ))}
      </div>

      {/* Search & Filter row */}
      <div className="flex items-center gap-2 mb-4 flex-shrink-0">
        <div className="relative flex-1">
          <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 text-xs" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search messages..."
            className="w-full bg-[#050816]/80 border border-white/5 rounded-xl py-2 pl-9 pr-3 text-xs outline-none text-white focus:border-purple-500 transition-colors placeholder:text-gray-650"
          />
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="w-8 h-8 rounded-xl bg-[#050816]/80 border border-white/5 flex items-center justify-center text-gray-400 hover:text-[#3B82F6] transition-colors"
        >
          <FaFilter className="text-[10px]" />
        </motion.button>
      </div>

      {/* Chats List with custom scroll behavior */}
      <div className="flex-1 overflow-y-auto space-y-2 sidebar-scroll pr-1">
        {filteredChats.map((chat) => {
          const isSelected = chat.id === selectedChatId;
          const isVerified = chat.verified;

          return (
            <motion.div
              key={chat.id}
              onClick={() => onSelectChat(chat.id)}
              whileHover={{ x: 2 }}
              className={`flex gap-3 p-3.5 rounded-2xl cursor-pointer border transition-all duration-300 relative group ${
                isSelected
                  ? "bg-[#3B82F6]/10 border-[#FF8A00]/25 shadow-[0_0_15px_rgba(168,85,247,0.05)]"
                  : "bg-[#050816]/35 border-white/5/60 hover:bg-[#0e1222]/40 hover:border-white/5/80"
              }`}
            >
              {/* Profile image with online dot */}
              <div className="relative flex-shrink-0">
                <img
                  src={typeof chat.avatar === "string" && chat.avatar.startsWith("http") ? chat.avatar : `https://i.pravatar.cc/80?img=${chat.avatar}`}
                  alt=""
                  className="w-10 h-10 rounded-xl border border-white/5"
                />
                {chat.online && (
                  <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-slate-950 bg-green-500" />
                )}
              </div>

              {/* Chat details */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1.5">
                  <div className="flex items-center gap-1 min-w-0">
                    <span className={`font-bold text-xs truncate ${isSelected ? "text-cyan-300" : "text-slate-200 group-hover:text-white"}`}>
                      {chat.name}
                    </span>
                    {isVerified && (
                      <FaCheckCircle className="text-blue-400 text-3xs flex-shrink-0" />
                    )}
                  </div>
                  <span className="text-[10px] text-gray-500 font-semibold font-mono flex-shrink-0">
                    {chat.time}
                  </span>
                </div>

                <div className="flex items-center gap-2 mt-1 justify-between">
                  <p className="text-[10px] text-gray-400 truncate flex-1 min-w-0 pr-2">
                    {chat.lastMessage}
                  </p>

                  {/* Badges */}
                  {chat.unreadCount > 0 && (
                    <span className="w-4 h-4 rounded-full bg-[#FF8A00] text-white font-mono text-[9px] font-black flex items-center justify-center flex-shrink-0">
                      {chat.unreadCount}
                    </span>
                  )}
                  {chat.matchBadge && (
                    <span className={`px-1.5 py-0.5 rounded text-[8px] font-extrabold uppercase border flex-shrink-0 ${
                      matchBadgeColors[chat.badgeColor]
                    }`}>
                      {chat.matchBadge}
                    </span>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}

        {filteredChats.length === 0 && (
          <div className="py-12 text-center text-gray-550 text-xs font-semibold">
            No conversations found.
          </div>
        )}
      </div>
    </div>
  );
}

export default ChatSidebar;
