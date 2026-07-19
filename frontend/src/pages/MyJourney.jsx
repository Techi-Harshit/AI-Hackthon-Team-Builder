import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaTrophy,
  FaCalendarAlt,
  FaClock,
  FaUsers,
  FaRobot,
  FaArrowRight,
  FaTrashAlt,
  FaCheck,
  FaTimes,
  FaCrown,
} from "react-icons/fa";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import PageLayout from "../components/dashboard/PageLayout";

function MyJourney() {
  const navigate = useNavigate();
  const { user, fetchProfile } = useAuth();
  const [activeTab, setActiveTab] = useState("interested");
  const [loading, setLoading] = useState(true);
  
  // Data States
  const [interestedHackathons, setInterestedHackathons] = useState([]);
  const [myTeams, setMyTeams] = useState([]);
  const [invitations, setInvitations] = useState([]);

  const loadData = async () => {
    setLoading(true);
    try {
      // 1. Refresh profile first to get fresh interestedHackathons
      const profileRes = await api.get("/users/profile");
      setInterestedHackathons(profileRes.data.interestedHackathons || []);

      // 2. Fetch User's Teams
      const teamsRes = await api.get("/teams");
      const allTeams = teamsRes.data.teams || teamsRes.data || [];
      const userTeams = allTeams.filter((team) => {
        const leaderId = team.leader?._id || team.leader;
        const members = team.members || [];
        const isLeader = String(leaderId) === String(user?._id);
        const isMember = members.some(
          (m) => String(m?._id || m) === String(user?._id)
        );
        return isLeader || isMember;
      });
      setMyTeams(userTeams);

      // 3. Fetch Invitations
      const invitesRes = await api.get("/recommendations/my-invitations");
      setInvitations(invitesRes.data.invitations || []);
    } catch (err) {
      console.error("Failed to load Journey data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const handleRemoveInterest = async (hackathonId) => {
    if (!window.confirm("Are you sure you want to remove interest from this hackathon?")) return;
    try {
      await api.post(`/hackathons/${hackathonId}/interest`);
      await fetchProfile();
      await loadData();
    } catch (err) {
      console.error("Error removing interest:", err);
      alert("Failed to remove interest.");
    }
  };

  const handleAcceptInvite = async (inviteId) => {
    try {
      await api.put(`/recommendations/my-invitations/${inviteId}/accept`);
      alert("Successfully joined the team!");
      await loadData();
    } catch (err) {
      console.error("Error accepting invite:", err);
      alert(err.response?.data?.message || "Failed to accept invitation.");
    }
  };

  const handleRejectInvite = async (inviteId) => {
    if (!window.confirm("Are you sure you want to reject this team invitation?")) return;
    try {
      await api.put(`/recommendations/my-invitations/${inviteId}/reject`);
      alert("Invitation rejected.");
      await loadData();
    } catch (err) {
      console.error("Error rejecting invite:", err);
      alert("Failed to reject invitation.");
    }
  };

  return (
    <PageLayout activePage="My Journey">
      <div className="p-6 sm:p-8 max-w-7xl mx-auto text-left">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="heading-font text-3xl font-black bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
              My Journey 🗺️
            </h1>
            <p className="text-gray-400 text-xs mt-1.5 font-mono">
              Track your hackathon interests, team setups, and incoming recruitment invitations.
            </p>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="flex gap-2 border-b border-white/5 pb-3 mb-8 overflow-x-auto scrollbar-hide">
          <button
            onClick={() => setActiveTab("interested")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition font-mono ${
              activeTab === "interested"
                ? "bg-[#3B82F6]/15 text-white border border-[#3B82F6]/30 shadow-[0_0_15px_rgba(59,130,246,0.15)]"
                : "text-gray-400 hover:text-gray-200"
            }`}
          >
            <FaTrophy className="text-xs" />
            Interested Hackathons ({interestedHackathons.length})
          </button>
          <button
            onClick={() => setActiveTab("teams")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition font-mono ${
              activeTab === "teams"
                ? "bg-[#3B82F6]/15 text-white border border-[#3B82F6]/30 shadow-[0_0_15px_rgba(59,130,246,0.15)]"
                : "text-gray-400 hover:text-gray-200"
            }`}
          >
            <FaUsers className="text-xs" />
            My Teams ({myTeams.length})
          </button>
          <button
            onClick={() => setActiveTab("invitations")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition font-mono ${
              activeTab === "invitations"
                ? "bg-[#3B82F6]/15 text-white border border-[#3B82F6]/30 shadow-[0_0_15px_rgba(59,130,246,0.15)]"
                : "text-gray-400 hover:text-gray-200"
            }`}
          >
            <FaClock className="text-xs" />
            Invitations ({invitations.length})
          </button>
        </div>

        {/* Loading Spinner */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24">
            <div className="w-12 h-12 border-4 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin mb-4" />
            <p className="text-gray-500 text-xs font-mono">Syncing journey records...</p>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            {/* Interested Hackathons List */}
            {activeTab === "interested" && (
              <motion.div
                key="interested"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
              >
                {interestedHackathons.length === 0 ? (
                  <div className="col-span-full py-16 text-center border border-dashed border-white/5 rounded-2xl bg-[#0e1222]/10">
                    <p className="text-gray-500 text-sm font-semibold mb-2">No Interested Hackathons yet</p>
                    <button
                      onClick={() => navigate("/hackathons")}
                      className="px-4 py-2 bg-gradient-to-r from-[#FF8A00] to-[#FF8A00]/80 rounded-xl text-xs font-bold text-white shadow-lg"
                    >
                      Browse Catalog
                    </button>
                  </div>
                ) : (
                  interestedHackathons.map((hack, idx) => (
                    <motion.div
                      key={hack._id || hack.id}
                      whileHover={{ y: -5 }}
                      className="relative overflow-hidden rounded-2xl bg-[#0e1222]/55 border border-white/5 p-5 flex flex-col min-h-[300px]"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${hack.logoBg || "from-cyan-500 to-blue-500"} flex items-center justify-center text-lg`}>
                            {hack.logo || "🏆"}
                          </div>
                          <div>
                            <h3 className="font-bold text-white text-[14px] leading-tight line-clamp-1">{hack.title}</h3>
                            <p className="text-[10px] text-gray-400 mt-0.5">{hack.organizer}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => handleRemoveInterest(hack._id || hack.id)}
                          className="p-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition text-xs"
                          title="Remove Interest"
                        >
                          <FaTrashAlt />
                        </button>
                      </div>

                      <div className="space-y-2 mt-2 mb-6 text-2xs text-gray-400 font-mono">
                        <div className="flex items-center gap-2">
                          <span className="text-gray-500">Prize Pool:</span>
                          <span className="text-emerald-400 font-bold">{hack.prizePool || "$10,000"}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-gray-500">Mode/Format:</span>
                          <span className="text-white">{hack.mode || "Online"}</span>
                        </div>
                      </div>

                      <div className="flex flex-col gap-2 mt-auto pt-2">
                        <div className="flex gap-2">
                          <button
                            onClick={() => navigate(`/discover-teams?hackathonId=${hack._id || hack.id}`)}
                            className="flex-1 py-2 bg-[#3B82F6]/10 border border-[#3B82F6]/25 hover:bg-[#3B82F6]/20 text-white rounded-xl text-2xs font-bold transition text-center"
                          >
                            Discover Teams
                          </button>
                          <button
                            onClick={() => navigate(`/ai-recommendations/${hack._id || hack.id}`)}
                            className="flex-1 py-2 bg-gradient-to-r from-purple-600/30 to-blue-600/30 border border-purple-500/30 hover:from-purple-500/40 text-purple-200 rounded-xl text-2xs font-bold transition flex items-center justify-center gap-1"
                          >
                            <FaRobot className="text-[10px]" /> AI Matchmaker
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
              </motion.div>
            )}

            {/* My Teams List */}
            {activeTab === "teams" && (
              <motion.div
                key="teams"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
              >
                {myTeams.length === 0 ? (
                  <div className="col-span-full py-16 text-center border border-dashed border-white/5 rounded-2xl bg-[#0e1222]/10">
                    <p className="text-gray-500 text-sm font-semibold mb-2">You are not a member of any teams yet</p>
                    <button
                      onClick={() => navigate("/discover-teams")}
                      className="px-4 py-2 bg-[#3B82F6] hover:bg-[#3B82F6]/85 rounded-xl text-xs font-bold text-white shadow-lg"
                    >
                      Find Teammates
                    </button>
                  </div>
                ) : (
                  myTeams.map((team) => {
                    const isLeader = String(team.leader?._id || team.leader) === String(user?._id);
                    const membersCount = team.members ? team.members.length : 1;
                    return (
                      <motion.div
                        key={team._id}
                        whileHover={{ y: -5 }}
                        className="relative overflow-hidden rounded-2xl bg-[#0e1222]/55 border border-white/5 p-5 flex flex-col min-h-[255px]"
                      >
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h3 className="font-extrabold text-white text-base leading-tight flex items-center gap-1.5">
                              {team.teamName}
                              {isLeader && <FaCrown className="text-amber-400 text-xs" title="Team Leader" />}
                            </h3>
                            <span className="px-2 py-0.5 mt-1.5 inline-block rounded bg-[#3B82F6]/10 border border-[#3B82F6]/20 text-[9px] font-bold text-[#3B82F6] font-mono">
                              Members: {membersCount}/{team.maxMembers || 4}
                            </span>
                          </div>
                        </div>

                        <div className="space-y-1.5 text-2xs text-gray-400 font-mono mb-6">
                          <div>
                            <span className="text-gray-500">Hackathon Interest:</span>
                            <span className="ml-1.5 text-white font-bold">{team.hackathonName || "Smart India Hackathon 2026"}</span>
                          </div>
                          <div>
                            <span className="text-gray-500">Required Skills:</span>
                            <span className="ml-1.5 text-slate-350">
                              {(team.requiredSkills || []).slice(0, 3).join(", ") || "None"}
                            </span>
                          </div>
                        </div>

                        <button
                          onClick={() => navigate(`/my-team?teamId=${team._id}`)}
                          className="mt-auto w-full py-2.5 bg-[#FF8A00] border border-[#FF8A00] hover:bg-[#ff9a22] text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-lg"
                        >
                          View Team Dashboard <FaArrowRight className="text-[10px]" />
                        </button>
                      </motion.div>
                    );
                  })
                )}
              </motion.div>
            )}

            {/* Invitations List */}
            {activeTab === "invitations" && (
              <motion.div
                key="invitations"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-6"
              >
                {invitations.length === 0 ? (
                  <div className="col-span-full py-16 text-center border border-dashed border-white/5 rounded-2xl bg-[#0e1222]/10">
                    <p className="text-gray-500 text-sm font-semibold">No pending team invitations</p>
                  </div>
                ) : (
                  invitations.map((inv) => (
                    <motion.div
                      key={inv._id}
                      whileHover={{ scale: 1.01 }}
                      className="relative overflow-hidden rounded-2xl bg-[#0e1222]/55 border border-white/5 p-5 flex flex-col md:flex-row md:items-center justify-between gap-4"
                    >
                      <div className="text-left">
                        <div className="flex items-center gap-2">
                          <h4 className="font-extrabold text-white text-[15px]">{inv.teamName}</h4>
                          <span className="px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-[9px] font-black text-emerald-400 font-mono">
                            {inv.compatibilityScore || 85}% Match
                          </span>
                        </div>
                        <p className="text-2xs text-gray-400 mt-1 font-mono">
                          Leader: <span className="text-white font-bold">{inv.leaderName}</span> • Hackathon: <span className="text-white font-bold">{inv.hackathonName}</span>
                        </p>
                      </div>

                      <div className="flex gap-2 shrink-0">
                        <button
                          onClick={() => handleRejectInvite(inv._id)}
                          className="px-3.5 py-1.5 rounded-xl border border-red-500/20 bg-red-500/5 text-red-400 hover:bg-red-500/15 text-2xs font-bold transition flex items-center gap-1 cursor-pointer"
                        >
                          <FaTimes /> Reject
                        </button>
                        <button
                          onClick={() => handleAcceptInvite(inv._id)}
                          className="px-3.5 py-1.5 rounded-xl bg-emerald-500 border border-emerald-500 hover:bg-emerald-600 text-white text-2xs font-bold transition flex items-center gap-1 cursor-pointer shadow-[0_0_12px_rgba(16,185,129,0.3)]"
                        >
                          <FaCheck /> Accept
                        </button>
                      </div>
                    </motion.div>
                  ))
                )}
              </motion.div>
            )}
          </AnimatePresence>
        )}

      </div>
    </PageLayout>
  );
}

export default MyJourney;
