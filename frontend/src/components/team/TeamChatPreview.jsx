import { motion, AnimatePresence } from "framer-motion";
import { useState, useRef, useEffect, useMemo } from "react";
import api from "../../api/axios";
import { useAuth } from "../../context/AuthContext";
import { 
  FaPaperPlane, 
  FaSmile, 
  FaSearch, 
  FaPaperclip, 
  FaVolumeUp, 
  FaFilePdf, 
  FaCheckDouble, 
  FaChevronRight, 
  FaReply, 
  FaThumbtack, 
  FaPoll, 
  FaGithub, 
  FaBullhorn, 
  FaBell 
} from "react-icons/fa";

// Team-wise dynamic initial seed messages
const chatSeeds = {
  alpha: [
    { id: 1, sender: "Aman Raj", avatar: 33, text: "Hey guys! Did we finalize the API endpoints for Auth?", time: "10:32 AM", isMe: false, replies: null },
    { id: 2, sender: "Priya Sharma", avatar: 44, text: "Yes, they are documented in the Figma workspace under designs.", time: "10:35 AM", isMe: false, replyTo: "Auth API endpoints" },
    { id: 3, sender: "You", avatar: 12, text: "Great. I will start the dashboard integration today.", time: "10:40 AM", isMe: true },
    { id: 4, type: "voice", sender: "Aman Raj", avatar: 33, duration: "0:18", time: "10:42 AM", isMe: false },
    { id: 5, type: "poll", question: "Finalize tech stack?", options: [
      { id: "a", text: "React + NestJS + Docker", votes: 3 },
      { id: "b", text: "NextJS + Flask + MongoDB", votes: 1 }
    ], totalVotes: 4, time: "10:45 AM" }
  ],
  ninjas: [
    { id: 1, sender: "Kabir Singh", avatar: 21, text: "Check out the latest github repository setup.", time: "09:15 AM", isMe: false },
    { id: 2, type: "github", repo: "hackninjas/sprint-core", link: "github.com/hackninjas/sprint-core", time: "09:16 AM", sender: "Kabir Singh", avatar: 21 },
    { id: 3, type: "pdf", fileName: "judging-rubric-v2.pdf", fileSize: "1.4 MB", time: "09:20 AM", sender: "Rohan Gupta", avatar: 22 },
    { id: 4, sender: "You", avatar: 12, text: "Awesome, I will review the judging rubric PDF now.", time: "09:25 AM", isMe: true }
  ]
};

const defaultSeed = [
  { id: 1, sender: "Builder Core", avatar: 15, text: "Welcome to your squad channel! Let's build a winner.", time: "08:00 AM", isMe: false },
  { id: 2, type: "announcement", text: "🔔 AI Alert: Flipkart GRID submission deadline in 2 days!", time: "08:02 AM" }
];

export default function TeamChatPreview({ team }) {
  const { user } = useAuth();
  const teamKey = team?.teamName?.toLowerCase().includes("alpha") ? "alpha" 
                  : team?.teamName?.toLowerCase().includes("ninja") ? "ninjas" 
                  : "default";
  
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [voicePlaying, setVoicePlaying] = useState(null);
  const [replyMessage, setReplyMessage] = useState(null);
  const [pinnedMessage, setPinnedMessage] = useState("📌 Pinned: Complete Github setup before tomorrow night.");
  
  const chatContainerRef = useRef(null);

  // Sync state when team changes
  useEffect(() => {
    async function fetchChats() {
      if (!team?._id) return;
      try {
        const res = await api.get(`/teams/${team._id}/chats`);
        if (res.data && res.data.chats) {
          const loaded = res.data.chats.map(c => ({
            ...c,
            id: c._id || c.id,
            isMe: String(c.senderId) === String(user?._id)
          }));
          setMessages(loaded);
        }
      } catch (err) {
        console.error("Error fetching team chats:", err);
      }
    }
    fetchChats();
    setInputValue("");
    setReplyMessage(null);
    setIsTyping(false);

    // Setup live polling every 3 seconds (WhatsApp Web style!)
    const interval = setInterval(fetchChats, 3000);
    return () => clearInterval(interval);
  }, [team?._id, user?._id]);

  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const payload = {
      text: inputValue,
      type: "text",
      replyTo: replyMessage ? replyMessage.text : null
    };

    try {
      const tempId = Date.now();
      setMessages(prev => [...prev, {
        id: tempId,
        sender: user?.name || "You",
        senderId: user?._id || "You",
        avatar: user?.avatar || "12",
        text: inputValue,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isMe: true,
        type: "text",
        replyTo: replyMessage ? replyMessage.text : null
      }]);
      setInputValue("");
      setReplyMessage(null);

      const res = await api.post(`/teams/${team._id}/chats`, payload);
      if (res.data && res.data.chat) {
        setMessages(prev => prev.map(m => m.id === tempId ? { 
          ...res.data.chat, 
          id: res.data.chat._id,
          isMe: true
        } : m));
      }
    } catch (err) {
      console.error("Error sending message:", err);
    }
  };

  // Poll Vote logic
  const handleVote = async (msgId, optionId) => {
    try {
      const res = await api.post(`/teams/${team._id}/chats/vote`, { chatId: msgId, optionId });
      if (res.data && res.data.chat) {
        setMessages(prev => prev.map(m => {
          if (m._id === msgId || m.id === msgId) {
            return { 
              ...res.data.chat, 
              id: res.data.chat._id,
              isMe: String(res.data.chat.senderId) === String(user?._id)
            };
          }
          return m;
        }));
      }
    } catch (err) {
      console.error("Error voting:", err);
    }
  };

  // Filter messages based on search
  const filteredMessages = useMemo(() => {
    if (!searchQuery.trim()) return messages;
    return messages.filter(m => 
      (m.text && m.text.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (m.sender && m.sender.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [messages, searchQuery]);

  return (
    <div className="rounded-3xl border border-white/5 bg-[#0e1222]/40 backdrop-blur-xl p-6 flex flex-col h-[520px] text-left relative overflow-hidden">
      {/* Background glow points */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />
      
      {/* Header bar */}
      <div className="flex items-center justify-between pb-3 border-b border-white/5 mb-3">
        <div>
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            {team?.teamName || "Squad Workspace"} Chat
          </h3>
          <span className="text-[9px] text-slate-500 uppercase tracking-widest font-black block mt-0.5">
            Discord + Slack + Whatsapp Operating System
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setShowSearch(!showSearch)} 
            type="button"
            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition cursor-pointer"
          >
            <FaSearch className="text-xs" />
          </button>
          <span className="px-2 py-1 rounded bg-white/5 border border-white/10 text-[9px] text-slate-400 font-mono">
            {teamKey === "alpha" ? "4" : teamKey === "ninjas" ? "3" : "2"} Online
          </span>
        </div>
      </div>

      {/* Pinned Announcement Bar */}
      {pinnedMessage && (
        <div className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/15 text-[10px] text-purple-300 flex items-center justify-between mb-3">
          <span className="flex items-center gap-2 font-bold truncate">
            <FaThumbtack className="shrink-0 text-purple-400" /> {pinnedMessage}
          </span>
          <button onClick={() => setPinnedMessage("")} className="text-slate-500 hover:text-white ml-2 text-2xs cursor-pointer">×</button>
        </div>
      )}

      {/* Search Input bar */}
      {showSearch && (
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search messages..."
          className="w-full mb-3 bg-[#050816]/80 border border-white/5 rounded-xl py-2 px-3 text-xs outline-none text-white transition-all placeholder:text-gray-600"
        />
      )}

      {/* Messages Feed area */}
      <div 
        ref={chatContainerRef} 
        className="flex-1 overflow-y-auto space-y-4 pr-2 mb-4 scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent"
      >
        <AnimatePresence initial={false}>
          {filteredMessages.map((msg) => {
            if (msg.type === "announcement") {
              return (
                <div key={msg.id} className="flex justify-center my-2 select-none">
                  <span className="px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-[9px] font-black uppercase tracking-wider flex items-center gap-1.5 animate-pulse">
                    <FaBullhorn /> {msg.text}
                  </span>
                </div>
              );
            }

            if (msg.type === "voice") {
              const isPlaying = voicePlaying === msg.id;
              return (
                <div key={msg.id} className="flex gap-2.5 max-w-[80%]">
                  <img src={`https://api.dicebear.com/7.x/bottts/svg?seed=${msg.sender}`} className="w-7 h-7 rounded-full border border-white/5 self-end" alt="" />
                  <div className="space-y-1">
                    <div className="p-3 rounded-2xl bg-[#050816]/80 border border-white/5 flex items-center gap-3">
                      <button 
                        onClick={() => setVoicePlaying(isPlaying ? null : msg.id)}
                        type="button"
                        className="w-7 h-7 rounded-full bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/30 flex items-center justify-center text-purple-400 cursor-pointer"
                      >
                        {isPlaying ? "■" : "▶"}
                      </button>
                      <div className="space-y-1">
                        <div className="flex items-center gap-1">
                          {[...Array(15)].map((_, idx) => (
                            <span 
                              key={idx} 
                              className={`w-0.5 rounded-full transition-all ${
                                isPlaying ? "h-4 bg-purple-400 animate-pulse" : "h-2 bg-slate-600"
                              }`} 
                              style={{ animationDelay: `${idx * 100}ms` }}
                            />
                          ))}
                        </div>
                        <span className="text-[8px] text-slate-500 block">Voice Note • {msg.duration}</span>
                      </div>
                    </div>
                    <span className="block text-[8px] text-gray-500">{msg.sender} • {msg.time}</span>
                  </div>
                </div>
              );
            }

            if (msg.type === "poll") {
              return (
                <div key={msg.id} className="p-4 rounded-2xl bg-indigo-950/10 border border-indigo-500/15 space-y-3 my-2 text-xs">
                  <div className="flex items-center gap-2 text-indigo-300 font-black uppercase tracking-wider text-[10px]">
                    <FaPoll /> SQUAD DECISION POLL
                  </div>
                  <h4 className="font-bold text-white">{msg.question}</h4>
                  <div className="space-y-2">
                    {msg.options.map(opt => {
                      const percent = msg.totalVotes > 0 ? Math.round((opt.votes / msg.totalVotes) * 100) : 0;
                      return (
                        <div 
                          key={opt.id}
                          onClick={() => handleVote(msg.id, opt.id)}
                          className="p-2.5 rounded-xl border border-white/5 bg-black/40 hover:bg-black/60 transition cursor-pointer relative overflow-hidden"
                        >
                          <div className="absolute top-0 bottom-0 left-0 bg-indigo-500/10 transition-all" style={{ width: `${percent}%` }} />
                          <div className="relative z-10 flex justify-between items-center text-[10px]">
                            <span className="font-bold text-slate-350">{opt.text}</span>
                            <span className="font-black text-indigo-400">{opt.votes} ({percent}%)</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <span className="block text-[8px] text-gray-500 italic">Total Votes Cast: {msg.totalVotes}</span>
                </div>
              );
            }

            if (msg.type === "pdf") {
              return (
                <div key={msg.id} className="flex gap-2.5 max-w-[80%]">
                  <img src={`https://api.dicebear.com/7.x/bottts/svg?seed=${msg.sender}`} className="w-7 h-7 rounded-full border border-white/5 self-end" alt="" />
                  <div className="space-y-1">
                    <div className="p-3 rounded-2xl bg-black/40 border border-rose-500/10 flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-rose-500/15 border border-rose-500/20 flex items-center justify-center text-rose-400">
                        <FaFilePdf className="text-sm" />
                      </div>
                      <div>
                        <h4 className="text-xs font-black text-white">{msg.fileName}</h4>
                        <span className="text-[8px] text-slate-500 block uppercase font-bold tracking-wider">{msg.fileSize} • PDF Document</span>
                      </div>
                    </div>
                    <span className="block text-[8px] text-gray-500">{msg.sender} • {msg.time}</span>
                  </div>
                </div>
              );
            }

            if (msg.type === "github") {
              return (
                <div key={msg.id} className="flex gap-2.5 max-w-[80%]">
                  <img src={`https://api.dicebear.com/7.x/bottts/svg?seed=${msg.sender}`} className="w-7 h-7 rounded-full border border-white/5 self-end" alt="" />
                  <div className="space-y-1">
                    <div className="p-3 rounded-2xl bg-black/40 border border-slate-500/10 flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-slate-500/15 border border-slate-500/20 flex items-center justify-center text-slate-300">
                        <FaGithub className="text-sm" />
                      </div>
                      <div>
                        <h4 className="text-xs font-black text-white">{msg.repo}</h4>
                        <a href={`https://${msg.link}`} target="_blank" rel="noreferrer" className="text-[8px] text-cyan-400 block hover:underline">
                          {msg.link}
                        </a>
                      </div>
                    </div>
                    <span className="block text-[8px] text-gray-500">{msg.sender} • {msg.time}</span>
                  </div>
                </div>
              );
            }

            return (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                className={`flex gap-2.5 max-w-[85%] ${msg.isMe ? "ml-auto flex-row-reverse" : ""}`}
              >
                {!msg.isMe && (
                  <img
                    src={`https://api.dicebear.com/7.x/bottts/svg?seed=${msg.sender}`}
                    alt=""
                    className="w-7 h-7 rounded-full border border-white/5 self-end mb-1"
                  />
                )}
                <div>
                  {/* Reply segment display */}
                  {msg.replyTo && (
                    <div className="px-3 py-1 bg-white/5 border-l-2 border-purple-500/50 rounded-t-xl text-[9px] text-slate-400 italic flex items-center gap-1">
                      <FaReply className="text-[8px]" /> replying to "{msg.replyTo}"
                    </div>
                  )}

                  <div className={`p-3 rounded-2xl text-xs leading-relaxed group relative ${
                    msg.isMe
                      ? "bg-gradient-to-br from-purple-600 to-blue-600 text-white rounded-br-none"
                      : "bg-[#050816]/80 text-slate-200 border border-white/5 rounded-bl-none"
                  }`}>
                    {msg.text}
                    
                    {/* Hover Reply icon */}
                    <button 
                      onClick={() => setReplyMessage(msg)}
                      type="button"
                      className="absolute -top-3 right-0 opacity-0 group-hover:opacity-100 p-1.5 rounded-lg bg-black border border-white/10 text-slate-400 hover:text-white transition cursor-pointer"
                    >
                      <FaReply className="text-[8px]" />
                    </button>
                  </div>
                  <span className={`block text-[8px] text-gray-500 mt-1 flex items-center gap-1 ${msg.isMe ? "justify-end text-right" : ""}`}>
                    {msg.isMe ? "Sent" : msg.sender} • {msg.time}
                    {msg.isMe && <FaCheckDouble className="text-cyan-400 text-[8px]" />}
                  </span>
                </div>
              </motion.div>
            );
          })}

          {/* Typing Indicator */}
          {isTyping && (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex gap-2.5 items-center text-gray-500 text-3xs font-semibold ml-1"
            >
              <div className="flex items-center gap-1 bg-[#050816]/50 px-2.5 py-1.5 rounded-full border border-white/5">
                <span className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
              <span className="text-[9px]">Teammate is typing...</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Reply Preview Bar */}
      {replyMessage && (
        <div className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/15 text-[10px] text-purple-300 flex items-center justify-between mb-2">
          <span className="truncate">Replying to: <i>"{replyMessage.text}"</i></span>
          <button onClick={() => setReplyMessage(null)} type="button" className="text-slate-500 hover:text-white ml-2 text-xs cursor-pointer">×</button>
        </div>
      )}

      {/* Input bar */}
      <form onSubmit={handleSend} className="relative mt-auto flex items-center gap-2">
        <button type="button" className="p-3 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 text-slate-400 transition cursor-pointer">
          <FaPaperclip className="text-xs" />
        </button>
        <div className="relative flex-1">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Send message to squad..."
            className="w-full bg-[#050816]/80 border border-white/5 rounded-2xl py-3 pl-4 pr-10 text-xs outline-none text-white transition-all focus:border-purple-500/80 focus:ring-1 focus:ring-purple-500/10 placeholder:text-gray-600"
          />
          <button type="button" className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white text-xs cursor-pointer">
            <FaSmile />
          </button>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          type="submit"
          className="p-3 rounded-2xl bg-gradient-to-r from-purple-600 to-blue-600 flex items-center justify-center text-white text-xs hover:shadow-[0_0_15px_rgba(168,85,247,0.3)] transition-all cursor-pointer border border-[#FF8A00]/25"
        >
          <FaPaperPlane />
        </motion.button>
      </form>
    </div>
  );
}
