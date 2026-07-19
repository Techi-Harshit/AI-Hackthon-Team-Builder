import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FaUserPlus, FaCheck, FaUsers } from "react-icons/fa";
import api from "../../api/axios";

const defaultGradients = [
  "from-blue-600 to-cyan-500",
  "from-[#FF8A00] to-amber-500",
  "from-purple-600 to-pink-500",
  "from-emerald-600 to-teal-500",
];

function RecommendedTeams() {
  const [teams, setTeams] = useState([]);
  const [joinedIds, setJoinedIds] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch AI recommended teams from backend
  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        const res = await api.get("/teams/recommendations");
        setTeams(res.data || []);
      } catch (err) {
        console.error("Error fetching recommended teams:", err);
      } finally {
        setLoading(false);
      }
    };
    
    const fetchJoinedApplications = async () => {
      try {
        // Fetch current user's applications if any, to keep sync
        const res = await api.get("/applications");
        if (res.data) {
          const appliedTeamIds = res.data.map((app) => app.teamId?._id || app.teamId);
          setJoinedIds(appliedTeamIds);
        }
      } catch (err) {
        console.error("Error fetching applications:", err);
      }
    };

    fetchRecommendations();
    fetchJoinedApplications();
  }, []);

  const handleJoinRequest = async (teamId) => {
    try {
      await api.post("/applications", {
        teamId,
        message: "Hi, I would like to join your team!",
      });
      setJoinedIds([...joinedIds, teamId]);
    } catch (err) {
      console.error("Error submitting join request:", err);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", stiffness: 100 },
    },
  };

  if (loading) {
    return (
      <div className="py-10 text-center text-slate-400">
        Calculating compatibility matches...
      </div>
    );
  }

  if (teams.length === 0) {
    return (
      <div className="py-10 text-center text-slate-400 bg-[#0e1222]/30 border border-white/5 rounded-3xl p-6">
        No compatible matching teams seeking members at this time.
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-white heading-font">Recommended Teams for You</h3>
        <span className="text-2xs font-semibold text-gray-500 font-mono">Based on your tech stack skills</span>
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-30px" }}
        className="grid grid-cols-1 md:grid-cols-2 gap-5"
      >
        {teams.map((team, idx) => {
          const hasRequested = joinedIds.includes(team._id);
          const gradient = defaultGradients[idx % defaultGradients.length];
          const avatarLetter = team.teamName ? team.teamName.charAt(0).toUpperCase() : "T";

          return (
            <motion.div
              key={team._id}
              variants={itemVariants}
              whileHover={{ y: -4, borderColor: "rgba(59, 130, 246, 0.25)" }}
              className="relative overflow-hidden rounded-3xl border border-white/5 bg-[#0e1222]/70 backdrop-blur-xl p-5 flex flex-col justify-between gap-4 group"
            >
              {/* Top row */}
              <div className="flex items-start gap-3.5">
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center text-xl font-black text-white border border-white/8 flex-shrink-0 group-hover:scale-105 transition-transform`}>
                  {avatarLetter}
                </div>

                <div className="min-w-0 text-left">
                  <h4 className="font-extrabold text-white text-sm sm:text-base truncate group-hover:text-cyan-300 transition-colors">
                    {team.teamName}
                  </h4>
                  <span className="block text-[8px] text-gray-500 font-bold uppercase tracking-wider mt-1.5">
                    Hackathon event
                  </span>
                  <span className="block text-3xs font-semibold text-blue-300 mt-0.5 truncate">
                    {team.hackathonName}
                  </span>
                </div>
              </div>

              {/* Description */}
              <p className="text-slate-400 text-xs text-left leading-relaxed line-clamp-2">
                {team.description || "No description provided."}
              </p>

              {/* Tags & Meta details */}
              <div className="flex flex-wrap gap-1 mt-1">
                {(team.requiredSkills || []).map((tag, tagIdx) => (
                  <span
                    key={tagIdx}
                    className="px-2 py-0.5 rounded text-[9px] bg-[#050816]/80 text-slate-400 border border-white/5"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {/* Details & Action */}
              <div className="flex items-center justify-between border-t border-white/5 mt-2 pt-4">
                <div className="flex items-center gap-3">
                  <div className="text-left">
                    <span className="block text-[8px] text-gray-500 font-bold uppercase tracking-wider">Seeking</span>
                    <span className="block text-3xs font-bold text-gray-200 mt-0.5">
                      {team.requiredSkills && team.requiredSkills.length > 0 ? team.requiredSkills[0] : "Teammate"}
                    </span>
                  </div>
                  <div className="border-l border-white/5 h-6" />
                  <div className="flex items-center gap-1 text-3xs text-gray-400 font-bold">
                    <FaUsers className="text-[#3B82F6]" />
                    {team.membersCount} / {team.maxMembers} Members
                  </div>
                </div>

                <div className="flex items-center gap-3 text-right">
                  <div>
                    <span className="block text-[8px] text-gray-500 font-bold uppercase tracking-wider">Compatibility</span>
                    <span className="block text-xs font-black text-emerald-400 font-mono mt-0.5">{team.matchScore}%</span>
                  </div>

                  <motion.button
                    whileHover={!hasRequested ? { scale: 1.05 } : {}}
                    whileTap={!hasRequested ? { scale: 0.95 } : {}}
                    onClick={() => handleJoinRequest(team._id)}
                    disabled={hasRequested}
                    className={`p-2.5 rounded-xl border text-xs flex items-center justify-center transition-colors ${
                      hasRequested
                        ? "bg-emerald-500/15 border border-emerald-500/35 text-emerald-400 cursor-default"
                        : "bg-[#050816]/80 border border-white/5 hover:border-white/10 text-gray-400 hover:text-cyan-300"
                    }`}
                    title={hasRequested ? "Request Pending" : "Request to Join"}
                  >
                    {hasRequested ? <FaCheck className="text-3xs" /> : <FaUserPlus className="text-3xs" />}
                  </motion.button>
                </div>
              </div>
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
}

export default RecommendedTeams;
