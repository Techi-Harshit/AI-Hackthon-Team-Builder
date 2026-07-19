import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  FaUsers,
  FaRobot,
  FaTrophy,
  FaHeart,
} from "react-icons/fa";
import api from "../../api/axios";
import { useAuth } from "../../context/AuthContext";

function StatsCards() {
  const { user } = useAuth();
  const [teamsCount, setTeamsCount] = useState(0);
  const [hacksCount, setHacksCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        if (!user) return;
        const res = await api.get("/teams");
        const allTeams = res.data?.teams || res.data || [];
        
        // Find teams where user is leader or member
        const userTeams = allTeams.filter(t => 
          (t.leader && (String(t.leader._id || t.leader) === String(user._id))) ||
          (t.members && t.members.some(m => String(m._id || m) === String(user._id)))
        );
        
        setTeamsCount(userTeams.length);
        
        // Get unique hackathons from user teams
        const uniqueHacks = new Set(userTeams.map(t => t.hackathonId).filter(Boolean));
        setHacksCount(uniqueHacks.size);
      } catch (err) {
        console.error("Error loading stats:", err);
      } finally {
        setLoading(false);
      }
    };
    loadStats();
  }, [user]);

  const statsList = [
    {
      title: "Teams Matched",
      value: loading ? "..." : teamsCount,
      icon: <FaUsers />,
      change: "Active matches",
    },
    {
      title: "AI Match Score",
      value: user?.profileCompletion ? `${user.profileCompletion}%` : "85%",
      icon: <FaRobot className="animate-pulse" />,
      change: "Synergy level",
    },
    {
      title: "Hackathons Joined",
      value: loading ? "..." : hacksCount,
      icon: <FaTrophy />,
      change: "Participating",
    },
    {
      title: "Trust Score",
      value: user?.trustScore ? `${user.trustScore}%` : "50%",
      icon: <FaHeart />,
      change: "AI verified",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
      {statsList.map((item, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            delay: index * 0.15,
          }}
          whileHover={{
            y: -10,
            scale: 1.03,
          }}
          className="
          relative
          overflow-hidden
          rounded-3xl
          p-6
          border border-white/5
          bg-[#0e1222]/70
          backdrop-blur-xl
          "
        >
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
            }}
            transition={{
              repeat: Infinity,
              duration: 4,
            }}
            className="
            absolute
            -top-10
            -right-10
            w-32
            h-32
            rounded-full
            bg-[#FF8A00]/10
            blur-3xl
            "
          />

          <div className="text-[#3B82F6] text-3xl">
            {item.icon}
          </div>

          <h3 className="mt-4 text-gray-400 text-sm">
            {item.title}
          </h3>

          <h2 className="text-4xl font-bold mt-2">
            {item.value}
          </h2>

          <p className="text-green-400 mt-3 text-xs">
            {item.change}
          </p>
        </motion.div>
      ))}
    </div>
  );
}

export default StatsCards;