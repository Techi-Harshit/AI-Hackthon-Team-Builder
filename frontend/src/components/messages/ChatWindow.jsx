import { motion, AnimatePresence } from "framer-motion";
import { useState, useRef, useEffect } from "react";
import { FaPhoneAlt, FaVideo, FaInfoCircle, FaPaperclip, FaSmile, FaPaperPlane, FaCheckDouble } from "react-icons/fa";

function ChatWindow({ chat, onSendMessage }) {
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollContainerRef = useRef(null);

  const scrollToBottom = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [chat?.messages, isTyping]);

  if (!chat) {
    return (
      <div className="rounded-3xl border border-white/5 bg-[#0e1222]/10 backdrop-blur-xl p-8 flex flex-col items-center justify-center h-[700px] text-center">
        <div className="w-16 h-16 rounded-full bg-[#FF8A00]/10 border border-white/5 flex items-center justify-center text-[#3B82F6] text-2xl mb-4">
          💬
        </div>
        <h3 className="font-bold text-white text-base heading-font">Select a conversation</h3>
        <p className="text-xs text-gray-500 mt-1 max-w-xs">
          Choose a teammate or channel from the inbox on the left to start collaborating.
        </p>
      </div>
    );
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    onSendMessage(chat.id, inputValue);
    setInputValue("");

    // Simulate auto-typing reply from candidate
    setTimeout(() => {
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
        onSendMessage(chat.id, `Thanks for the details! Let's schedule our sync-up.`, true);
      }, 2500);
    }, 1500);
  };

  return (
    <div className="rounded-3xl border border-white/5 bg-[#0e1222]/10 backdrop-blur-xl p-5 flex flex-col h-[700px]">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-4 border-b border-white/5/60 mb-4 flex-shrink-0">
        <div className="flex items-center gap-4 min-w-0">
          <div className="relative">
            <img
              src={typeof chat.avatar === "string" && chat.avatar.startsWith("http") ? chat.avatar : `https://i.pravatar.cc/100?img=${chat.avatar}`}
              alt={chat.name}
              className="w-12 h-12 rounded-xl border border-white/5"
            />
            {chat.online && (
              <span className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-slate-950 bg-green-500 animate-pulse" />
            )}
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-extrabold text-white text-sm sm:text-base truncate">{chat.name}</h3>
              {chat.online && (
                <span className="px-2 py-0.5 rounded text-[8px] font-extrabold bg-emerald-500/15 text-emerald-450 border border-emerald-500/25">
                  Online
                </span>
              )}
            </div>
            <p className="text-3xs text-gray-500 font-semibold mt-0.5 truncate">{chat.role}</p>

            {chat.skills && (
              <div className="flex flex-wrap gap-1 mt-1.5">
                {chat.skills.slice(0, 4).map((skill, idx) => (
                  <span
                    key={idx}
                    className="px-1.5 py-0.5 rounded text-[8px] bg-[#050816]/80 text-cyan-300 border border-white/5 font-bold"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right utility buttons */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {[<FaPhoneAlt />, <FaVideo />, <FaInfoCircle />].map((icon, idx) => (
            <motion.button
              key={idx}
              whileHover={{ scale: 1.05, borderColor: "rgba(168, 85, 247, 0.4)" }}
              whileTap={{ scale: 0.95 }}
              className="w-9 h-9 rounded-xl bg-[#050816]/80 border border-white/5 flex items-center justify-center text-gray-400 hover:text-[#3B82F6] transition-all"
            >
              {icon}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Messages area */}
      <div
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto space-y-4 pr-1 mb-4 sidebar-scroll"
      >
        <div className="flex items-center justify-center my-4">
          <span className="text-[10px] text-gray-500 bg-[#050816]/50 border border-white/5 px-3 py-1 rounded-full font-extrabold uppercase tracking-widest font-mono">
            Today
          </span>
        </div>

        <AnimatePresence initial={false}>
          {chat.messages.map((msg) => {
            const isMe = msg.sender === "me";

            return (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ type: "spring", stiffness: 220, damping: 18 }}
                className={`flex gap-2.5 max-w-[75%] ${isMe ? "ml-auto flex-row-reverse" : ""}`}
              >
                {!isMe && (
                  <img
                    src={typeof chat.avatar === "string" && chat.avatar.startsWith("http") ? chat.avatar : `https://i.pravatar.cc/80?img=${chat.avatar}`}
                    alt=""
                    className="w-7 h-7 rounded-full border border-white/5 self-end mb-1"
                  />
                )}

                <div>
                  <div className={`p-3 rounded-2xl text-xs leading-relaxed ${
                    isMe
                      ? "bg-gradient-to-br from-purple-600 to-blue-600 text-white rounded-br-none"
                      : "bg-[#050816]/85 text-slate-200 border border-white/5 rounded-bl-none"
                  }`}>
                    {msg.text}
                  </div>

                  <div className={`flex items-center gap-1 mt-1 text-[9px] text-gray-550 ${isMe ? "justify-end" : ""}`}>
                    <span>{msg.time}</span>
                    {isMe && <FaCheckDouble className="text-[#3B82F6]" />}
                  </div>
                </div>
              </motion.div>
            );
          })}

          {/* Typing Indicator bubbles */}
          {isTyping && (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex gap-2.5 items-center text-gray-500 text-3xs font-semibold ml-1"
            >
              <img
                src={typeof chat.avatar === "string" && chat.avatar.startsWith("http") ? chat.avatar : `https://i.pravatar.cc/80?img=${chat.avatar}`}
                alt=""
                className="w-6 h-6 rounded-full border border-white/5"
              />
              <div className="flex items-center gap-1 bg-[#050816]/50 px-2.5 py-1.5 rounded-full border border-white/5">
                <span className="w-1 h-1 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="w-1 h-1 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="w-1 h-1 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
              <span className="font-mono">{chat.name} is typing...</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Input panel editor */}
      <form onSubmit={handleSubmit} className="relative mt-auto flex-shrink-0">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-2 text-gray-500">
          <motion.button
            whileHover={{ scale: 1.1, color: "#c084fc" }}
            type="button"
            className="hover:text-[#3B82F6] transition-colors"
          >
            <FaPaperclip className="text-xs" />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1, color: "#c084fc" }}
            type="button"
            className="hover:text-[#3B82F6] transition-colors"
          >
            <FaSmile className="text-xs" />
          </motion.button>
        </div>

        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Type a message..."
          className="w-full bg-[#050816]/80 border border-white/5 rounded-2xl py-3.5 pl-14 pr-14 text-xs outline-none text-white transition-all focus:border-purple-500/80 focus:ring-1 focus:ring-purple-500/10 placeholder:text-gray-650"
        />

        <motion.button
          whileHover={{ scale: 1.05, boxShadow: "0 0 10px rgba(168,85,247,0.4)" }}
          whileTap={{ scale: 0.95 }}
          type="submit"
          className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 flex items-center justify-center text-white text-xs border border-[#FF8A00]/25 transition-all"
        >
          <FaPaperPlane className="text-2xs" />
        </motion.button>
      </form>
    </div>
  );
}

export default ChatWindow;
