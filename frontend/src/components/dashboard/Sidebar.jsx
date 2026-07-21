import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  FaHome,
  FaUsers,
  FaTrophy,
  FaFileAlt,
  FaRobot,
  FaCog,
  FaRegBookmark,
  FaChartBar,
} from "react-icons/fa";

const menuItems = [
  { icon: <FaHome />, text: "Dashboard", path: "/dashboard" },
  { icon: <FaUsers />, text: "Discover Teams", path: "/discover-teams" },
  { icon: <FaTrophy />, text: "Hackathons", path: "/hackathons" },
  { icon: <FaRobot />, text: "AI Recommendations", path: "/ai-recommendations" },
  { icon: <FaFileAlt />, text: "My Journey", path: "/my-journey" },
  { icon: <FaUsers />, text: "My Team", path: "/my-team" },
  { icon: <FaRegBookmark />, text: "Bookmarks", path: "/bookmarks" },
  { icon: <FaChartBar />, text: "Leaderboard", path: "/leaderboard" },
  { icon: <FaCog />, text: "Settings", path: "/settings" },
];

function Sidebar({ activePage = "Dashboard" }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  return (
    <motion.aside
      initial={{ x: -80, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.7 }}
      className="
        fixed
        top-0
        left-0
        h-screen
        w-72
        bg-[#050816]/80
        backdrop-blur-xl
        border-r
        border-white/5
        z-50
        flex
        flex-col
      "
    >
      {/* Background Glow */}
      <div className="absolute top-0 left-0 w-72 h-72 bg-[#3B82F6]/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-0 w-72 h-72 bg-blue-600/10 rounded-full blur-3xl" />

      {/* Sticky Logo */}
      <div className="sticky top-0 z-30 bg-[#050816]/95 backdrop-blur-xl p-6 border-b border-white/5">
        <motion.div
          animate={{ y: [0, -5, 0] }}
          transition={{
            duration: 3,
            repeat: Infinity,
          }}
        >
          <h1 className="heading-font text-4xl font-extrabold bg-linear-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
            COSMOQ
          </h1>

          <p className="text-gray-400 text-sm mt-2">
            AI Powered Team Builder
          </p>
        </motion.div>
      </div>

      {/* Scrollable Area */}
      <div className="flex-1 overflow-y-auto sidebar-scroll p-6">
        
        {/* User Card */}
        <motion.div
          whileHover={{ scale: 1.03 }}
          className="
            mb-8
            p-4
            rounded-2xl
            bg-[#0e1222]/80
            border
            border-white/5
          "
        >
          <div className="flex items-center gap-3">
            <div className="relative">
              <img
                src={user?.avatar && (user.avatar.startsWith("http") || user.avatar.startsWith("data:")) ? user.avatar : (user?.avatar ? `https://i.pravatar.cc/100?img=${user.avatar}` : "https://i.pravatar.cc/100?img=12")}
                alt="user"
                className="w-12 h-12 rounded-full object-cover"
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
                  border
                  border-white/5
                "
              />
            </div>

            <div>
              <h3 className="font-semibold">{user?.name || "User"}</h3>

              <p className="text-xs text-gray-400">
                {user?.preferredRole || "Developer"}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Menu */}
        <div className="space-y-3">
          {[
            ...menuItems.slice(0, 1),
            ...(user?.role === "organizer"
              ? [{ icon: <FaChartBar />, text: "Organizer Panel", path: "/organizer/dashboard" }]
              : []),
            ...menuItems.slice(1)
          ].map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{
                delay: index * 0.08,
              }}
              whileHover={{
                scale: 1.04,
                x: 8,
              }}
              onClick={() => navigate(item.path)}
              className={`
                flex items-center justify-between p-4 rounded-2xl cursor-pointer
                transition-colors duration-200
                ${
                  item.text === activePage || (item.text === "Organizer Panel" && activePage === "OrganizerDashboard") || (item.text === "Admin Panel" && activePage === "AdminDashboard")
                    ? "bg-linear-to-r from-[#FF8A00]/25 to-[#3B82F6]/25 border border-[#FF8A00]/25"
                    : item.text === "AI Recommendations"
                      ? "bg-[#1a1032] border border-fuchsia-500/20 shadow-[0_0_26px_rgba(192,132,252,0.18)]"
                      : "hover:bg-[#0e1222]"
                }
              `}
            >
              <div className="flex items-center gap-4">
                <span className={`text-xl ${item.text === "AI Recommendations" ? "text-fuchsia-400" : "text-[#3B82F6]"}`}>
                  {item.icon}
                </span>

                <span className={`font-medium ${item.text === "AI Recommendations" ? "text-fuchsia-200" : ""}`}>
                  {item.text}
                </span>
              </div>

              {item.badge && (
                <span className="w-5 h-5 rounded-full bg-[#FF8A00] text-white font-mono text-[10px] font-black flex items-center justify-center">
                  {item.badge}
                </span>
              )}
            </motion.div>
          ))}
        </div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          className="mt-8 rounded-3xl p-5 bg-linear-to-br from-[#0e1222]/85 via-[#0e1222]/60 to-[#0e1222]/85 border border-white/5 relative overflow-hidden"
        >
          <div className="flex items-center gap-2 mb-3">
            <span className="text-amber-400 text-sm">👑</span>
            <h3 className="font-extrabold text-sm text-white heading-font">
              Upgrade to Pro
            </h3>
          </div>

          <ul className="space-y-2 text-gray-400 text-[11px] font-semibold mb-5">
            <li className="flex items-center gap-2">
              <span className="text-emerald-400 text-[10px]">✓</span> Advanced analytics
            </li>
            <li className="flex items-center gap-2">
              <span className="text-emerald-400 text-[10px]">✓</span> Detailed leaderboards
            </li>
            <li className="flex items-center gap-2">
              <span className="text-emerald-400 text-[10px]">✓</span> Priority visibility
            </li>
            <li className="flex items-center gap-2">
              <span className="text-emerald-400 text-[10px]">✓</span> Exclusive insights
            </li>
          </ul>

          <motion.button
            whileHover={{
              scale: 1.03,
              boxShadow: "0px 0px 20px rgba(168,85,247,0.45)",
            }}
            whileTap={{ scale: 0.97 }}
            className="w-full py-2.5 rounded-xl bg-linear-to-r from-purple-600 to-blue-600 text-white font-bold text-xs hover:from-purple-500 hover:to-blue-500 transition-all flex items-center justify-center gap-2"
          >
            Upgrade Now <span className="text-[10px]">→</span>
          </motion.button>
        </motion.div>
      </div>
    </motion.aside>
  );
}

export default Sidebar;
