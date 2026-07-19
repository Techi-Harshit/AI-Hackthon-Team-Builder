import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  FaBell,
  FaMoon,
  FaSearch,
  FaChevronDown,
  FaCheck,
  FaTimes,
  FaSpinner,
  FaEnvelope,
} from "react-icons/fa";
import api from "../../api/axios";

function Topbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [processingId, setProcessingId] = useState(null);
  const [processedActions, setProcessedActions] = useState({});
  const dropdownRef = useRef(null);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // Fetch Notifications
  const fetchNotifications = async (silent = false) => {
    try {
      if (!user) return;
      if (!silent) setLoading(true);
      const res = await api.get("/users/notifications");
      const list = Array.isArray(res.data) ? res.data : [];
      setNotifications(list);
      setUnreadCount(list.filter((n) => !n.read).length);
    } catch (err) {
      console.error("Error fetching notifications:", err);
    } finally {
      setLoading(false);
    }
  };

  // Poll notifications every 8 seconds
  useEffect(() => {
    fetchNotifications(true);
    const interval = setInterval(() => {
      fetchNotifications(true);
    }, 8000);
    return () => clearInterval(interval);
  }, [user]);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleBellClick = async () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      // Mark all as read when opening dropdown
      try {
        await api.put("/users/notifications/read");
        setUnreadCount(0);
        // Refresh local array values
        setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      } catch (err) {
        console.error("Error marking notifications as read:", err);
      }
    }
  };

  const handleAction = async (notificationId, applicationId, action) => {
    setProcessingId(notificationId);
    try {
      if (action === "accept") {
        await api.put(`/applications/${applicationId}/accept`);
        setProcessedActions((prev) => ({ ...prev, [notificationId]: "Accepted" }));
      } else {
        await api.put(`/applications/${applicationId}/reject`);
        setProcessedActions((prev) => ({ ...prev, [notificationId]: "Declined" }));
      }
      // Mark specific notification as read in database
      await api.put("/users/notifications/read", { notificationId });
      // Update local state list
      setNotifications((prev) =>
        prev.map((n) => (n._id === notificationId ? { ...n, read: true } : n))
      );
    } catch (err) {
      console.error(`Error performing application ${action}:`, err);
      alert(err.response?.data?.message || `Failed to ${action} request.`);
    } finally {
      setProcessingId(null);
    }
  };

  const handleDeleteNotification = async (notificationId, event) => {
    // Prevent triggering mark all as read or closing dropdown
    if (event) event.stopPropagation();
    
    try {
      await api.delete(`/users/notifications/${notificationId}`);
      // Remove from local list state
      setNotifications((prev) => prev.filter((n) => n._id !== notificationId));
      // Re-calculate unread count
      setNotifications((prevList) => {
        setUnreadCount(prevList.filter((n) => !n.read).length);
        return prevList;
      });
    } catch (err) {
      console.error("Error deleting notification:", err);
    }
  };

  return (
    <motion.header
      initial={{ y: -60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="
        sticky
        top-0
        z-40
        backdrop-blur-xl
        bg-[#050816]/70
        border-b
        border-white/5
      "
    >
      <div className="flex items-center justify-between px-8 py-5">
        
        {/* Search */}
        <div className="relative">
          <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />

          <input
            type="text"
            placeholder="Search hackathons, teams, skills..."
            className="
              w-[420px]
              bg-[#0e1222]/80
              border
              border-white/5
              rounded-2xl
              py-3
              pl-12
              pr-4
              outline-none
              text-white
              transition-all
              duration-300
              focus:border-purple-500
              focus:ring-2
              focus:ring-purple-500/20
            "
          />
        </div>

        {/* Right Side */}
        <div className="flex items-center gap-6">
          
          {/* Theme */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className="
              w-11
              h-11
              rounded-xl
              bg-[#0e1222]
              border
              border-white/5
              flex
              items-center
              justify-center
            "
          >
            <FaMoon className="text-lg text-white" />
          </motion.button>

          {/* Notification Button and Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleBellClick}
              className="
                relative
                w-11
                h-11
                rounded-xl
                bg-[#0e1222]
                border
                border-white/5
                flex
                items-center
                justify-center
                cursor-pointer
              "
            >
              <FaBell className="text-lg text-white" />

              {unreadCount > 0 && (
                <span
                  className="
                    absolute
                    -top-1
                    -right-1
                    min-w-[18px]
                    h-[18px]
                    px-1.5
                    rounded-full
                    bg-red-500
                    text-[10px]
                    font-black
                    text-white
                    flex
                    items-center
                    justify-center
                    animate-pulse
                  "
                >
                  {unreadCount}
                </span>
              )}
            </motion.button>

            {/* Premium Glassmorphic Dropdown Menu */}
            <AnimatePresence>
              {isOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 15 }}
                  className="absolute right-0 mt-3 w-80 sm:w-96 rounded-2xl bg-[#0e1222]/95 border border-white/5 backdrop-blur-xl shadow-2xl p-4 overflow-hidden z-50 text-left"
                >
                  {/* Glowing highlights */}
                  <div className="absolute -top-12 -left-12 w-32 h-32 bg-[#FF8A00]/5 rounded-full blur-2xl pointer-events-none" />
                  <div className="absolute -bottom-12 -right-12 w-32 h-32 bg-[#3B82F6]/5 rounded-full blur-2xl pointer-events-none" />

                  <div className="flex justify-between items-center pb-3 border-b border-white/5 relative z-10">
                    <h4 className="text-sm font-bold page-title flex items-center gap-1.5">
                      <FaBell className="text-xs text-[#FF8A00]" /> Notifications
                    </h4>
                    {unreadCount > 0 && (
                      <span className="text-[10px] font-bold text-cyan-400 bg-cyan-400/10 px-2 py-0.5 rounded-full">
                        {unreadCount} new
                      </span>
                    )}
                  </div>

                  {/* List container */}
                  <div className="max-h-[360px] overflow-y-auto mt-2 space-y-2 relative z-10 sidebar-scroll">
                    {loading ? (
                      <div className="py-12 flex justify-center items-center">
                        <FaSpinner className="animate-spin text-[#3B82F6] text-xl" />
                      </div>
                    ) : notifications.length === 0 ? (
                      <div className="py-12 text-center text-slate-500 text-xs flex flex-col items-center gap-2">
                        <div className="w-12 h-12 rounded-full bg-slate-900 border border-white/5 flex items-center justify-center text-slate-500 text-lg mb-1 animate-pulse">
                          🔔
                        </div>
                        <h5 className="font-extrabold text-white text-sm">No new notifications</h5>
                        <p className="px-6 text-[10px] leading-relaxed text-slate-400">
                          You are completely all caught up! Incoming requests or invitations will show up here.
                        </p>
                      </div>
                    ) : (
                      notifications.map((n) => {
                        const status = processedActions[n._id];
                        return (
                          <div
                            key={n._id}
                            className={`p-3.5 rounded-xl border transition-all duration-300 relative group ${
                              !n.read 
                                ? "bg-white/3 border-[#3B82F6]/15 hover:bg-white/5" 
                                : "bg-[#050816]/30 border-white/2 hover:bg-[#050816]/50"
                            }`}
                          >
                            {/* Dismiss Notification Button */}
                            <button
                              onClick={(e) => handleDeleteNotification(n._id, e)}
                              className="absolute top-2.5 right-2.5 w-5 h-5 rounded-full flex items-center justify-center text-xs text-slate-500 hover:bg-white/5 hover:text-white transition opacity-0 group-hover:opacity-100 cursor-pointer"
                              title="Dismiss"
                            >
                              &times;
                            </button>

                            <div className="flex items-start gap-3">
                              <div className="w-9 h-9 rounded-full bg-slate-800 border border-white/5 overflow-hidden flex-shrink-0 flex items-center justify-center text-xs font-bold text-white uppercase font-sans">
                                {n.fromUserAvatar ? (
                                  <img src={`https://i.pravatar.cc/100?img=${n.fromUserAvatar}`} className="w-full h-full object-cover" alt="" />
                                ) : (
                                  n.fromUserName?.charAt(0) || "👤"
                                )}
                              </div>

                              <div className="flex-1 min-w-0 pr-4">
                                <p className="text-[11px] sm:text-xs text-white leading-relaxed font-medium">
                                  {n.message}
                                </p>
                                <span className="text-[9px] text-slate-500 font-mono mt-1 block">
                                  {n.createdAt ? new Date(n.createdAt).toLocaleDateString() : "Just now"}
                                </span>

                                {/* Handle Action Buttons */}
                                {n.type === "join_request" && n.applicationId && (
                                  <div className="mt-3 flex items-center gap-2">
                                    {status ? (
                                      <span
                                        className={`text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded-md flex items-center gap-1 ${
                                          status === "Accepted"
                                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                            : "bg-red-500/10 text-red-400 border border-red-500/20"
                                        }`}
                                      >
                                        {status === "Accepted" ? <FaCheck /> : <FaTimes />} {status}
                                      </span>
                                    ) : (
                                      <>
                                        <button
                                          disabled={processingId === n._id}
                                          onClick={() => handleAction(n._id, n.applicationId, "accept")}
                                          className="px-2.5 py-1 rounded-md bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-black flex items-center gap-1 transition cursor-pointer disabled:opacity-50"
                                        >
                                          {processingId === n._id ? (
                                            <FaSpinner className="animate-spin" />
                                          ) : (
                                            <FaCheck />
                                          )}{" "}
                                          Approve
                                        </button>
                                        <button
                                          disabled={processingId === n._id}
                                          onClick={() => handleAction(n._id, n.applicationId, "reject")}
                                          className="px-2.5 py-1 rounded-md bg-[#0e1222] border border-white/5 hover:bg-red-950/20 hover:border-red-500/20 hover:text-red-400 text-slate-400 text-[10px] font-black flex items-center gap-1 transition cursor-pointer disabled:opacity-50"
                                        >
                                          {processingId === n._id ? (
                                            <FaSpinner className="animate-spin" />
                                          ) : (
                                            <FaTimes />
                                          )}{" "}
                                          Decline
                                        </button>
                                      </>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* User Profile */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            onClick={handleLogout}
            title="Click to logout"
            className="
              flex
              items-center
              gap-3
              cursor-pointer
              bg-[#0e1222]/80
              border
              border-white/5
              rounded-2xl
              px-3
              py-2
            "
          >
            <div className="relative">
              <img
                src={user?.avatar && (user.avatar.startsWith("http") || user.avatar.startsWith("data:")) ? user.avatar : (user?.avatar ? `https://i.pravatar.cc/100?img=${user.avatar}` : "https://i.pravatar.cc/100?img=12")}
                alt="profile"
                className="w-11 h-11 rounded-full object-cover"
              />

              <span
                className="
                  absolute
                  bottom-0
                  right-0
                  w-3
                  h-3
                  rounded-full
                  bg-green-500
                  border-2
                  border-slate-950
                "
              />
            </div>

            <div>
              <h3 className="font-semibold text-white">
                {user?.name || "User"}
              </h3>

              <p className="text-xs text-gray-400">
                {user?.preferredRole || "Member"}
              </p>
            </div>

            <FaChevronDown className="text-gray-400" />
          </motion.div>
        </div>
      </div>
    </motion.header>
  );
}

export default Topbar;