import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  FaUsers,
  FaArrowRight,
  FaBrain,
  FaCheck,
} from "react-icons/fa";
import api from "../../api/axios";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

function RecommendedTeams() {
  const { user } = useAuth();
  const [teamsList, setTeamsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [joiningId, setJoiningId] = useState(null);
  const [successId, setSuccessId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const loadTeams = async () => {
      try {
        // The server calculates and sorts the match score using the current
        // user's skills, so this card never relies on static demo data.
        const res = await api.get("/teams/recommendations");
        setTeamsList((Array.isArray(res.data) ? res.data : res.data.teams || []).slice(0, 3));
      } catch (err) {
        console.error("Error loading recommended teams:", err);
      } finally {
        setLoading(false);
      }
    };
    if (user) {
      loadTeams();
    }
  }, [user]);

  const handleJoinTeam = async (teamId) => {
    setJoiningId(teamId);
    try {
      await api.post("/applications", {
        teamId,
        message: "Hi, I would love to join your team and contribute my skills!",
      });
      setSuccessId(teamId);
      setTimeout(() => {
        setSuccessId(null);
      }, 4000);
    } catch (err) {
      console.error("Error applying to team:", err);
      alert(err.response?.data?.message || "Failed to apply to team.");
    } finally {
      setJoiningId(null);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.7 }}
      className="
      relative
      overflow-hidden
      bg-[#0e1222]/70
      backdrop-blur-xl
      border
      border-white/5
      rounded-3xl
      p-6
      "
    >
      {/* Glow Background */}
      <div className="absolute -top-20 -right-20 w-52 h-52 bg-[#3B82F6]/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-40 h-40 bg-blue-600/10 rounded-full blur-3xl" />

      {/* Header */}
      <div className="flex justify-between items-center mb-8 relative z-10">
        <div>
          <h2 className="text-2xl font-bold page-title">
            AI Recommended Teams
          </h2>

          <p className="text-sm text-slate-400 mt-1">
            Teams matched using AI skill analysis
          </p>
        </div>

        <motion.button
          whileHover={{
            scale: 1.05,
          }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate("/discover-teams")}
          className="
          px-4
          py-2
          rounded-xl
          bg-[#0e1222]
          hover:bg-[#FF8A00]
          transition
          "
        >
          View All
        </motion.button>
      </div>

      {/* Team Cards */}
      <div className="space-y-5 relative z-10">
        {loading ? (
          <p className="text-slate-400 text-center py-8">Loading recommendations...</p>
        ) : teamsList.length === 0 ? (
          <p className="text-slate-400 text-center py-8">No recommended teams found.</p>
        ) : (
          teamsList.map((team, index) => {
            const matchScore = team.matchScore ?? 0;
            return (
              <motion.div
                key={team._id || index}
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{
                  duration: 0.5,
                  delay: index * 0.15,
                }}
                whileHover={{
                  scale: 1.02,
                  y: -4,
                }}
                className="
                relative
                overflow-hidden
                rounded-3xl
                border
                border-white/5
                bg-[#0e1222]/65
                p-5
                "
              >
                {/* Moving Shine */}
                <motion.div
                  animate={{
                    x: ["-100%", "300%"],
                  }}
                  transition={{
                    duration: 6,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                  className="
                  absolute
                  inset-y-0
                  w-20
                  bg-gradient-to-r
                  from-transparent
                  via-purple-400/10
                  to-transparent
                  "
                />

                <div className="flex justify-between items-start">
                  <div>
                    {/* AI Badge */}
                    <div
                      className="
                      inline-flex
                      items-center
                      gap-2
                      px-3
                      py-1
                      rounded-full
                      bg-[#FF8A00]/10
                      border
                      border-white/5
                      text-xs
                      text-cyan-300
                      mb-3
                      "
                    >
                      <FaBrain />
                      AI Match
                    </div>

                    <h3 className="text-xl font-bold">
                      {team.teamName}
                    </h3>

                    <div className="flex flex-wrap gap-2 mt-3">
                      {(team.requiredSkills || []).map((skill, i) => (
                        <motion.span
                          key={i}
                          whileHover={{
                            scale: 1.08,
                          }}
                          className="
                          px-3
                          py-1
                          rounded-full
                          text-xs
                          bg-[#FF8A00]/10
                          text-cyan-300
                          border
                          border-white/5
                          "
                        >
                          {skill}
                        </motion.span>
                      ))}
                    </div>

                    {/* Members */}
                    <div className="flex items-center gap-2 mt-4">
                      <FaUsers className="text-slate-400" />

                      <span className="text-sm text-slate-400">
                        {team.membersCount ?? team.members?.length ?? 1} Team Members
                      </span>
                    </div>
                  </div>

                  {/* Match Ring */}
                  <motion.div
                    whileHover={{
                      rotate: 360,
                    }}
                    transition={{
                      duration: 1,
                    }}
                    className="
                    relative
                    w-20
                    h-20
                    rounded-full
                    border-4
                    border-green-500
                    flex
                    items-center
                    justify-center
                    font-bold
                    text-lg
                    shadow-[0_0_25px_rgba(34,197,94,0.35)]
                    "
                  >
                    {matchScore}%
                  </motion.div>
                </div>

                {/* Avatars */}
                <div className="flex justify-between items-center mt-5">
                  <div className="flex -space-x-3">
                    {[1, 2, 3].map((img) => (
                      <motion.img
                        whileHover={{
                          y: -5,
                          scale: 1.1,
                        }}
                        key={img}
                        src={`https://i.pravatar.cc/50?img=${img + (index * 3)}`}
                        alt=""
                        className="
                        w-11
                        h-11
                        rounded-full
                        border-2
                        border-white/5
                        "
                      />
                    ))}
                  </div>

                  <div className="flex gap-3">
                    <motion.button
                      whileHover={{
                        scale: 1.05,
                      }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => navigate(`/discover-teams?teamId=${team._id}`)}
                      className="
                      px-4
                      py-2
                      rounded-xl
                      border
                      border-white/10
                      hover:border-purple-500
                      transition
                      "
                    >
                      View Team
                    </motion.button>

                    <motion.button
                      whileHover={{
                        scale: 1.05,
                      }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleJoinTeam(team._id)}
                      disabled={joiningId === team._id || successId === team._id}
                      className={`
                      flex
                      items-center
                      gap-2
                      px-4
                      py-2
                      rounded-xl
                      bg-gradient-to-r
                      ${successId === team._id 
                        ? "from-green-500 to-emerald-600 font-semibold" 
                        : "from-purple-500 to-blue-500"}
                      `}
                    >
                      {successId === team._id ? (
                        <>
                          Request sent
                          <FaCheck />
                        </>
                      ) : joiningId === team._id ? (
                        "Sending..."
                      ) : (
                        <>
                          Join Team
                          <FaArrowRight />
                        </>
                      )}
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            );
          })
        )}
      </div>
    </motion.div>
  );
}

export default RecommendedTeams;
