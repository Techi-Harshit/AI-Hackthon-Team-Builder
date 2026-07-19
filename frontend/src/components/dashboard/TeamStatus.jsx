import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  FaUsers,
  FaCheckCircle,
  FaCode,
  FaPalette,
  FaRobot,
  FaArrowRight,
  FaBolt,
  FaTrophy,
  FaPlusCircle,
} from "react-icons/fa";
import api from "../../api/axios";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

function TeamStatus() {
  const { user } = useAuth();
  const [activeTeam, setActiveTeam] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const loadTeamStatus = async () => {
      try {
        if (!user) return;
        const res = await api.get("/teams");
        const allTeams = res.data?.teams || res.data || [];
        
        // Find team where user is leader or member
        const myTeam = allTeams.find(t => 
          (t.leader && (String(t.leader._id || t.leader) === String(user._id))) ||
          (t.members && t.members.some(m => String(m._id || m) === String(user._id)))
        );
        
        if (myTeam) {
          setActiveTeam(myTeam);
        }
      } catch (err) {
        console.error("Error loading team status:", err);
      } finally {
        setLoading(false);
      }
    };
    loadTeamStatus();
  }, [user]);

  if (loading) {
    return (
      <div className="bg-[#0e1222]/70 backdrop-blur-xl border border-white/5 rounded-3xl p-8 text-center text-slate-400">
        Loading team status...
      </div>
    );
  }

  // If the user has no team
  if (!activeTeam) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 60 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.7 }}
        className="
        relative
        overflow-hidden
        rounded-3xl
        bg-[#0e1222]/50
        backdrop-blur-xl
        border
        border-white/5/80
        p-8
        text-center
        "
      >
        {/* Glow */}
        <div className="absolute -top-16 -right-16 w-40 h-40 bg-[#FF8A00]/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl" />

        <div className="relative z-10 py-6 max-w-lg mx-auto">
          <div className="w-16 h-16 bg-[#FF8A00]/10 border border-[#FF8A00]/25 rounded-2xl flex items-center justify-center text-[#3B82F6] text-3xl mx-auto mb-6">
            <FaUsers />
          </div>
          <h2 className="text-3xl font-extrabold text-white">No Active Team</h2>
          <p className="text-slate-400 text-md mt-3 leading-relaxed">
            You are not part of any hackathon team yet. Recruit teammates for your project or apply to join existing teams using skill matching!
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate("/discover-teams")}
              className="
              px-6
              py-3
              rounded-xl
              bg-gradient-to-r
              from-purple-500
              to-blue-500
              font-semibold
              flex
              items-center
              justify-center
              gap-2
              "
            >
              Explore Teams
              <FaArrowRight />
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate("/create-team")}
              className="
              px-6
              py-3
              rounded-xl
              border
              border-white/10
              hover:border-[#FF8A00]
              transition
              font-semibold
              flex
              items-center
              justify-center
              gap-2
              "
            >
              Create Team
              <FaPlusCircle />
            </motion.button>
          </div>
        </div>
      </motion.div>
    );
  }

  const memberCount = activeTeam.members?.length || 1;
  const maxMembers = activeTeam.maxMembers || 6;
  const completion = Math.round((memberCount / maxMembers) * 100);

  const stats = [
    {
      icon: <FaUsers />,
      value: `${memberCount}/${maxMembers}`,
      label: "Members",
      color: "text-blue-400",
    },
    {
      icon: <FaCheckCircle />,
      value: "87%", // compatibility simulation
      label: "Compatibility",
      color: "text-green-400",
    },
    {
      icon: <FaTrophy />,
      value: user?.hackathonsWins || "3",
      label: "Wins",
      color: "text-yellow-400",
    },
    {
      icon: <FaBolt />,
      value: user?.totalHackathons || "12",
      label: "Projects",
      color: "text-[#3B82F6]",
    },
  ];

  const openRoles = (activeTeam.requiredSkills || []).map((skill, index) => ({
    role: skill,
    icon: <FaCode />,
    color: index % 3 === 0 ? "text-blue-400" : index % 3 === 1 ? "text-pink-400" : "text-[#3B82F6]"
  }));

  return (
    <motion.div
      initial={{ opacity: 0, y: 60 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.7 }}
      className="
      relative
      overflow-hidden
      rounded-3xl
      bg-[#0e1222]/70
      backdrop-blur-xl
      border
      border-white/5
      p-5
      h-fit
      "
    >
      {/* Glow */}
      <div className="absolute -top-16 -right-16 w-40 h-40 bg-[#FF8A00]/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl" />

      {/* Header */}
      <div className="relative z-10 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold page-title">
            Team: {activeTeam.teamName}
          </h2>

          <p className="text-slate-400 text-sm mt-1">
            Active team health and recruitment overview
          </p>
        </div>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => navigate(`/discover-teams?teamId=${activeTeam._id || activeTeam.id}`)}
          className="
            px-4
            py-2
            rounded-xl
            bg-[#050816]
            border
            border-cyan-500/35
            hover:border-cyan-400
            text-cyan-400
            hover:text-white
            hover:bg-[#FF8A00]/10
            text-xs
            font-bold
            transition-all
            duration-300
          "
        >
          View Team
        </motion.button>
      </div>

      {/* Team Strength */}
      <div className="mt-6 relative z-10">
        <div className="flex justify-between mb-2">
          <span className="text-sm text-slate-400">
            Team Slot Completion
          </span>

          <span className="font-semibold">
            {completion}%
          </span>
        </div>

        <div className="h-3 rounded-full bg-[#0e1222] overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            whileInView={{ width: `${completion}%` }}
            viewport={{ once: true }}
            transition={{ duration: 1.5 }}
            className="
            h-full
            rounded-full
            bg-gradient-to-r
            from-purple-500
            via-pink-500
            to-blue-500
            "
          />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 mt-6 relative z-10">
        {stats.map((item, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1 }}
            whileHover={{
              y: -6,
              boxShadow:
                "0px 0px 20px rgba(168,85,247,0.15)",
            }}
            className="
            rounded-2xl
            bg-[#050816]/60
            border
            border-white/5
            p-4
            "
          >
            <div className={`${item.color} text-xl`}>
              {item.icon}
            </div>

            <h3 className="text-2xl font-bold mt-3">
              {item.value}
            </h3>

            <p className="text-xs text-slate-400 mt-1">
              {item.label}
            </p>
          </motion.div>
        ))}
      </div>

      {/* Open Roles */}
      {openRoles.length > 0 && (
        <div className="mt-7 relative z-10">
          <h3 className="font-semibold mb-4">
            Required Skills / Roles
          </h3>

          <div className="grid gap-3">
            {openRoles.map((role, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{
                  x: 6,
                }}
                className="
                flex
                items-center
                justify-between
                rounded-xl
                border
                border-white/5
                bg-[#0e1222]/65
                p-3
                "
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`text-lg ${role.color}`}
                  >
                    {role.icon}
                  </span>

                  <span>{role.role}</span>
                </div>

                <span
                  className="
                  px-2
                  py-1
                  rounded-full
                  text-xs
                  bg-yellow-500/10
                  text-yellow-400
                  "
                >
                  Needed
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* AI Insight */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.4 }}
        className="
        mt-6
        rounded-2xl
        p-4
        bg-gradient-to-r
        from-purple-500/10
        to-blue-500/10
        border
        border-white/5
        relative
        z-10
        "
      >
        <h4 className="font-semibold text-cyan-300">
          AI Insight
        </h4>

        <p className="text-sm text-slate-300 mt-2">
          {openRoles.length > 0 
            ? `Recruiting a developer with skills in "${openRoles[0].role}" will maximize your team's success potential.`
            : "Your team is fully staffed! Start allocating project roles to maximize performance."}
        </p>
      </motion.div>

      {/* Buttons */}
      <motion.button
        whileHover={{
          scale: 1.03,
          boxShadow:
            "0px 0px 25px rgba(168,85,247,0.35)",
        }}
        whileTap={{ scale: 0.95 }}
        onClick={() => navigate("/ai-recommendations")}
        className="
        mt-5
        w-full
        py-3
        rounded-xl
        bg-gradient-to-r
        from-purple-500
        to-blue-500
        font-semibold
        flex
        items-center
        justify-center
        gap-2
        "
      >
        Recruit Members
        <FaArrowRight />
      </motion.button>

      <motion.button
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => navigate("/create-team")}
        className="
        mt-3
        w-full
        py-3
        rounded-xl
        border
        border-white/5
        bg-[#050816]/65
        hover:bg-[#0e1222]
        font-semibold
        flex
        items-center
        justify-center
        gap-2
        transition-all
        "
      >
        Create a Team
      </motion.button>
    </motion.div>
  );
}

export default TeamStatus;