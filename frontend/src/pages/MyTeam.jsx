import { useState, useEffect } from "react";
import PageLayout from "../components/dashboard/PageLayout";
import MyTeamHero from "../components/team/MyTeamHero";
import TeamMembersSection from "../components/team/TeamMembersSection";
import SprintTasksSection from "../components/team/SprintTasksSection";
import TeamSkillsChart from "../components/team/TeamSkillsChart";
import TeamOverviewDetails from "../components/team/TeamOverviewDetails";
import UpcomingDeadlines from "../components/team/UpcomingDeadlines";
import TeamChatPreview from "../components/team/TeamChatPreview";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FaUsers, 
  FaArrowRight, 
  FaCheck, 
  FaTimes, 
  FaInbox, 
  FaExchangeAlt,
  FaRobot,
  FaCheckCircle,
  FaExclamationTriangle,
  FaBullhorn,
  FaLightbulb,
  FaComments,
  FaListAlt
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";

// Local Circular dial progression helper
function CircularProgressDial({ percentage, color, label, size = 110, strokeWidth = 8 }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
        <div className="absolute inset-1 rounded-full blur-md opacity-10" style={{ backgroundColor: color }} />
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
          <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="rgba(255, 255, 255, 0.03)" strokeWidth={strokeWidth} />
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1.2, ease: "easeOut" }}
          />
        </svg>
        <span className="absolute text-base font-black text-white">{percentage}%</span>
      </div>
      <span className="text-[10px] uppercase tracking-widest font-black text-slate-400 text-center leading-none mt-1.5">{label}</span>
    </div>
  );
}

function MyTeam() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [myTeams, setMyTeams] = useState([]);
  const [activeTeam, setActiveTeam] = useState(null);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState("");
  
  // Tab/Module switcher state
  const [activeModule, setActiveModule] = useState("dashboard"); // "dashboard", "chat", "members", "sprints"

  // AI-OS state variables
  const [teamAnalysis, setTeamAnalysis] = useState(null);
  const [analysisStep, setAnalysisStep] = useState(0);
  const [analysisLoading, setAnalysisLoading] = useState(false);

  const loadTeamData = async (preserveActiveId = null) => {
    try {
      if (!user) return;
      const teamsRes = await api.get("/teams");
      const rawTeams = teamsRes.data?.teams || teamsRes.data || [];
      const userTeams = rawTeams.filter((t) =>
        (t.leader && (String(t.leader._id || t.leader) === String(user._id))) ||
        (t.members && t.members.some((m) => String(m._id || m) === String(user._id)))
      );

      setMyTeams(userTeams);

      if (userTeams.length > 0) {
        let targetTeam = userTeams[0];
        if (preserveActiveId) {
          const matched = userTeams.find(t => t._id === preserveActiveId);
          if (matched) targetTeam = matched;
        } else if (activeTeam) {
          const matched = userTeams.find(t => t._id === activeTeam._id);
          if (matched) targetTeam = matched;
        }

        const detailsRes = await api.get(`/teams/${targetTeam._id}`);
        setActiveTeam(detailsRes.data);

        // Fetch populated team-wise AI analysis metrics
        try {
          const analysisRes = await api.get(`/ai/team-analysis/${detailsRes.data._id}`);
          setTeamAnalysis(analysisRes.data);
        } catch (err) {
          console.error("Error loading team AI analysis:", err);
        }

        const isLeader = detailsRes.data.leader && (detailsRes.data.leader._id === user._id || detailsRes.data.leader === user._id);
        if (isLeader) {
          const appsRes = await api.get(`/applications/team/${detailsRes.data._id}`);
          const leaderId = detailsRes.data.leader._id || detailsRes.data.leader;
          setApplications(appsRes.data.filter((app) => 
            app.status === "pending" &&
            app.userId &&
            (app.userId._id || app.userId) !== leaderId
          ));
        } else {
          setApplications([]);
        }
      } else {
        setActiveTeam(null);
        setApplications([]);
        setTeamAnalysis(null);
      }
    } catch (err) {
      console.error("Error loading team data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    window.scrollTo(0, 0);
    loadTeamData();
  }, [user]);

  // Dynamic Switch active team with loading checklist sequences
  const handleSwitchTeam = async (teamId) => {
    setAnalysisLoading(true);
    setAnalysisStep(0);
    
    const interval = setInterval(() => {
      setAnalysisStep(prev => {
        if (prev < 11) return prev + 1;
        return prev;
      });
    }, 380);

    try {
      await loadTeamData(teamId);
      clearInterval(interval);
      setAnalysisStep(12); // "Analysis Completed Successfully."
      setTimeout(() => {
        setAnalysisLoading(false);
      }, 600);
    } catch (err) {
      clearInterval(interval);
      setAnalysisLoading(false);
    }
  };

  const handleAccept = async (appId) => {
    try {
      await api.put(`/applications/${appId}/accept`);
      setToastMessage("Teammate accepted successfully!");
      setTimeout(() => setToastMessage(""), 3000);
      loadTeamData(activeTeam?._id);
    } catch (err) {
      console.error("Error accepting teammate:", err);
      alert("Failed to accept teammate.");
    }
  };

  const handleReject = async (appId) => {
    try {
      await api.put(`/applications/${appId}/reject`);
      setToastMessage("Request declined.");
      setTimeout(() => setToastMessage(""), 3000);
      loadTeamData(activeTeam?._id);
    } catch (err) {
      console.error("Error declining teammate:", err);
      alert("Failed to decline request.");
    }
  };

  const handleRemoveMember = async (memberId) => {
    if (!window.confirm("Are you sure you want to remove this member from the team?")) return;
    try {
      await api.put(`/teams/${activeTeam._id}/remove-member`, { memberId });
      setToastMessage("Member removed successfully!");
      setTimeout(() => setToastMessage(""), 3000);
      loadTeamData(activeTeam?._id);
    } catch (err) {
      console.error("Error removing member:", err);
      alert("Failed to remove member.");
    }
  };

  if (loading) {
    return (
      <PageLayout activePage="My Team">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="flex flex-col items-center gap-4">
            <div className="w-10 h-10 border-2 border-[#3B82F6]/30 border-t-[#3B82F6] rounded-full animate-spin" />
            <p className="text-slate-400 text-sm font-semibold">Loading team workspace...</p>
          </div>
        </div>
      </PageLayout>
    );
  }

  // Active Team Switch AI Scanning Animation View
  if (analysisLoading) {
    return (
      <PageLayout activePage="My Team">
        <div className="p-8 max-w-xl mx-auto flex flex-col justify-center min-h-[70vh]">
          <div className="p-8 rounded-3xl bg-[#0e1222]/80 border border-purple-500/20 backdrop-blur-xl space-y-6 shadow-[0_0_50px_rgba(168,85,247,0.1)] text-left">
            <div className="flex flex-col md:flex-row items-center gap-6 pb-4 border-b border-white/5">
              <div className="relative flex-shrink-0">
                <div className="w-16 h-16 rounded-full border-4 border-purple-500/20 border-t-purple-400 animate-spin" style={{ animationDuration: "1.2s" }} />
                <FaRobot className="absolute inset-0 m-auto text-purple-400 text-2xl animate-pulse" />
              </div>
              <div className="text-center md:text-left space-y-1">
                <h3 className="text-lg font-black text-white tracking-wide uppercase">AI Team Operating System</h3>
                <p className="text-xs text-slate-400 font-medium">Re-indexing RAG pipelines & Langchain synergy context...</p>
              </div>
            </div>

            <div className="space-y-3.5 text-left max-w-xl mx-auto">
              {[
                "Loading Team Members.....",
                "Reading Team Skills.....",
                "Reading Tasks.....",
                "Reading Hackathon Requirements.....",
                "Reading Team Health.....",
                "Finding Missing Skills.....",
                "Finding Missing Members.....",
                "Calculating Compatibility.....",
                "Calculating Winning Probability.....",
                "Calculating Hackathon Readiness.....",
                "Building AI Recommendations.....",
                "Building Graphs.....",
                "Analysis Completed Successfully."
              ].map((step, i) => {
                const isFinished = i < analysisStep;
                const isActive = i === analysisStep;
                
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0.3 }}
                    animate={{ 
                      opacity: isActive ? 1 : isFinished ? 0.75 : 0.25,
                      x: isActive ? 4 : 0
                    }}
                    className="flex items-center gap-3.5"
                  >
                    <div className={`w-4 h-4 rounded-full flex items-center justify-center border text-[8px] font-black transition-all ${
                      isFinished ? "bg-purple-500/10 border-purple-500/35 text-purple-400" :
                      isActive ? "bg-purple-500 border-purple-400 text-black animate-pulse" :
                      "bg-white/5 border-white/5 text-transparent"
                    }`}>
                      {isFinished ? "✓" : isActive ? "●" : ""}
                    </div>
                    <span className={`text-xs font-bold transition-all ${
                      isActive ? "text-purple-300 font-black tracking-wide" :
                      isFinished ? "text-slate-350" : "text-slate-650"
                    }`}>
                      {step}
                    </span>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout activePage="My Team">
      <div className="p-8">
        <AnimatePresence>
          {toastMessage && (
            <motion.div
              initial={{ opacity: 0, y: -40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -40 }}
              className="fixed top-6 right-6 z-50 bg-[#3B82F6] text-white px-6 py-3 rounded-2xl shadow-[0_0_20px_rgba(59,130,246,0.35)] text-xs font-bold font-mono uppercase tracking-wider"
            >
              {toastMessage}
            </motion.div>
          )}
        </AnimatePresence>

        {activeTeam ? (
          <>
            {/* Hero Card Banner */}
            <MyTeamHero team={activeTeam} />

            {/* Switch Team workspace selector */}
            {myTeams.length > 1 && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-3 mb-6 p-4 rounded-2xl border border-white/5 bg-[#0e1222]/40 backdrop-blur-md"
              >
                <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest shrink-0 select-none">
                  <FaExchangeAlt className="text-cyan-400 text-2xs animate-pulse" />
                  <span>Switch Team:</span>
                </div>

                <div className="flex flex-wrap gap-2.5">
                  {myTeams.map((team) => {
                    const isActive = team._id === activeTeam._id;
                    const avatar = team.teamName ? team.teamName.charAt(0).toUpperCase() : "T";
                    
                    return (
                      <motion.button
                        key={team._id}
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => handleSwitchTeam(team._id)}
                        className={`
                          px-4
                          py-2
                          rounded-xl
                          text-xs
                          font-bold
                          transition-all
                          duration-300
                          flex
                          items-center
                          gap-2
                          border
                          cursor-pointer
                          ${isActive
                            ? "bg-[#3B82F6]/10 border-[#3B82F6] text-white shadow-[0_0_15px_rgba(59,130,246,0.15)]"
                            : "bg-[#050816] border-white/5 text-slate-400 hover:text-white hover:border-white/10"
                          }
                        `}
                      >
                        <span className="w-5 h-5 rounded-lg bg-gradient-to-br from-purple-600 to-blue-500 flex items-center justify-center text-[10px] font-black text-white shrink-0">
                          {avatar}
                        </span>
                        <span>{team.teamName}</span>
                      </motion.button>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* Pinned Join Requests */}
            {activeTeam.leader && (activeTeam.leader._id === user._id || activeTeam.leader === user._id) && applications.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-3xl border border-white/5 bg-[#0e1222]/80 p-6 mb-8 text-left relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#FF8A00]/5 rounded-full blur-2xl pointer-events-none" />
                
                <h3 className="font-extrabold text-white text-base heading-font flex items-center gap-2 mb-4">
                  <FaInbox className="text-[#FF8A00] text-sm animate-bounce" />
                  Pending Join Requests ({applications.length})
                </h3>

                <div className="space-y-3">
                  {applications.map((app, idx) => {
                    const applicant = app.userId || {};
                    const appName = applicant.name || "Developer Profile";
                    const appRole = applicant.preferredRole || "Full Stack Developer";
                    
                    return (
                      <div
                        key={app._id || idx}
                        className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl border border-white/5 bg-[#050816]/40 hover:bg-[#050816]/75 transition"
                      >
                        <div className="flex items-center gap-3.5 w-full text-left">
                          <img
                            src={`https://api.dicebear.com/7.x/bottts/svg?seed=${appName}`}
                            alt=""
                            className="w-10 h-10 rounded-full border border-white/10"
                          />
                          <div>
                            <h4 className="font-bold text-xs text-white leading-tight">{appName}</h4>
                            <p className="text-[9px] text-[#3B82F6] font-bold mt-1 uppercase tracking-wider">{appRole}</p>
                            {app.message && (
                              <p className="text-[10px] text-gray-500 italic mt-1.5 leading-relaxed max-w-xl">
                                "{app.message}"
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2.5 shrink-0 ml-auto sm:ml-0">
                          <button
                            onClick={() => handleReject(app._id)}
                            className="p-2.5 rounded-xl bg-[#050816] hover:bg-red-500/10 border border-red-500/20 hover:border-red-500/40 text-red-400 transition cursor-pointer"
                            title="Decline Request"
                          >
                            <FaTimes className="text-3xs" />
                          </button>
                          <button
                            onClick={() => handleAccept(app._id)}
                            className="p-2.5 rounded-xl bg-[#FF8A00] hover:bg-[#ff9a22] border border-[#FF8A00] text-white transition flex items-center justify-center shadow-[0_0_10px_rgba(255,138,0,0.2)] cursor-pointer"
                            title="Accept Teammate"
                          >
                            <FaCheck className="text-3xs" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* Dynamic Master AI metrics dials (Replaced the static TeamStatsGrid completely to remove duplication!) */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 p-6 rounded-3xl border border-[#a855f7]/15 bg-[#0e1222]/40 backdrop-blur-xl mb-8 text-center relative overflow-hidden shadow-[0_0_30px_rgba(168,85,247,0.05)]">
              <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />
              <CircularProgressDial 
                percentage={teamAnalysis?.compatibilityScore || 92} 
                color="#a855f7" 
                label="Compatibility" 
              />
              <CircularProgressDial 
                percentage={teamAnalysis?.winningProbability || 91} 
                color="#22c55e" 
                label="Winning Odds" 
              />
              <CircularProgressDial 
                percentage={teamAnalysis?.hackathonReadiness || 94} 
                color="#eab308" 
                label="Readiness" 
              />
              <CircularProgressDial 
                percentage={teamAnalysis?.teamHealthScore || 96} 
                color="#ec4899" 
                label="Team Health" 
              />
            </div>

            {/* Tab navigation headers */}
            <div className="flex gap-4 border-b border-white/5 pb-2.5 mb-6 mt-4 text-left select-none">
              {[
                { id: "dashboard", label: "📊 AI Dashboard", icon: <FaRobot /> },
                { id: "chat", label: "💬 Squad Chat Room", icon: <FaComments /> },
                { id: "members", label: "👥 Squad Roster", icon: <FaUsers /> },
                { id: "sprints", label: "📋 Sprints & Tasks", icon: <FaListAlt /> }
              ].map(tab => {
                const isActive = activeModule === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveModule(tab.id)}
                    className={`pb-2 text-xs font-black transition-all relative flex items-center gap-2 cursor-pointer border-b-2 ${
                      isActive 
                        ? `text-cyan-400 border-cyan-400 font-bold` 
                        : "text-slate-400 hover:text-white border-transparent"
                    }`}
                  >
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Render selected workspace tab */}
            {activeModule === "dashboard" && teamAnalysis && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-left">
                {/* Project progress bars */}
                <div className="lg:col-span-2 p-6 rounded-3xl border border-white/5 bg-[#0e1222]/60 backdrop-blur-xl relative overflow-hidden shadow-xl flex flex-col justify-between">
                  <div className="absolute -top-12 -left-12 w-32 h-32 bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />
                  
                  <div className="mb-6">
                    <span className="px-3 py-1 rounded bg-purple-500/10 border border-purple-500/20 text-purple-400 text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 select-none">
                      <FaRobot className="animate-pulse text-purple-400" /> Dynamic Progress Analytics
                    </span>
                  </div>

                  <div className="space-y-6">
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs uppercase font-black text-slate-350">
                        <span>Project Completion Status</span>
                        <span className="text-cyan-400 font-mono">{teamAnalysis.projectCompletion || 82}%</span>
                      </div>
                      <div className="w-full h-2.5 bg-black/45 rounded-full overflow-hidden border border-white/5">
                        <div className="h-full bg-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.5)] transition-all duration-1000" style={{ width: `${teamAnalysis.projectCompletion || 82}%` }} />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-xs uppercase font-black text-slate-350">
                        <span>Missing Technology Gaps</span>
                        <span className="text-rose-400 font-mono">{teamAnalysis.missingSkillsCount || 2}</span>
                      </div>
                      <div className="w-full h-2.5 bg-black/45 rounded-full overflow-hidden border border-white/5">
                        <div className="h-full bg-rose-500 shadow-[0_0_10px_rgba(239,68,68,0.5)] transition-all duration-1000" style={{ width: `${Math.min(100, (teamAnalysis.missingSkillsCount || 2) * 33)}%` }} />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-xs uppercase font-black text-slate-350">
                        <span>Missing Team Member Slots</span>
                        <span className="text-amber-400 font-mono">{teamAnalysis.missingMembersCount || 1}</span>
                      </div>
                      <div className="w-full h-2.5 bg-black/45 rounded-full overflow-hidden border border-white/5">
                        <div className="h-full bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)] transition-all duration-1000" style={{ width: `${Math.min(100, (teamAnalysis.missingMembersCount || 1) * 33)}%` }} />
                      </div>
                    </div>
                  </div>

                  <div className="mt-8 pt-5 border-t border-white/5 flex flex-wrap gap-2 text-xs">
                    <span className="text-gray-400">Missing Gaps:</span>
                    {(teamAnalysis.missingSkills || []).map((s, i) => (
                      <span key={i} className="px-2 py-0.5 rounded bg-rose-500/10 border border-rose-500/20 text-rose-300 text-[10px] font-bold">{s}</span>
                    ))}
                    {(teamAnalysis.missingMembers || []).map((m, i) => (
                      <span key={i} className="px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20 text-amber-300 text-[10px] font-bold">{m}</span>
                    ))}
                  </div>
                </div>

                {/* AI TEAM COMMAND CENTER */}
                <div className="space-y-6">
                  <div className="p-6 rounded-3xl border border-white/5 bg-[#0e1222]/40 backdrop-blur-md flex flex-col justify-between shadow-xl">
                    <div>
                      <h3 className="text-xs uppercase tracking-widest font-black text-white flex items-center gap-2 mb-4">
                        <FaLightbulb className="text-yellow-400" /> AI Team Command Center
                      </h3>
                      
                      {/* Top actions mapping */}
                      <div className="space-y-2">
                        <span className="text-[8px] font-black uppercase text-slate-500 tracking-wider">Top Priority Actions</span>
                        <div className="space-y-1">
                          {(teamAnalysis.suggestions || []).slice(0, 3).map((act, idx) => (
                            <div key={idx} className="p-2 rounded-xl bg-black/40 border border-white/5 text-[10px] text-slate-300 font-bold flex items-center gap-2 select-none">
                              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                              {act}
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* AI Alerts listing */}
                      <div className="space-y-2 mt-4">
                        <span className="text-[8px] font-black uppercase text-slate-500 tracking-wider">Crucial Alerts</span>
                        <div className="flex flex-wrap gap-1.5">
                          {(teamAnalysis.alerts || []).map((alert, idx) => (
                            <span key={idx} className="px-2 py-0.5 rounded bg-rose-500/10 border border-rose-500/20 text-rose-300 text-[8px] font-black uppercase tracking-wide">
                              ⚠️ {alert}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Priority classifications */}
                    <div className="grid grid-cols-3 gap-2 mt-5 pt-4 border-t border-white/5 text-center text-[9px] uppercase font-black">
                      <div className="p-2 rounded bg-rose-500/5 border border-rose-500/10 text-rose-300">
                        <span className="block text-slate-500 tracking-widest mb-0.5">High</span>
                        <span className="truncate block font-bold">{teamAnalysis.priorities?.high || "Stack Missing"}</span>
                      </div>
                      <div className="p-2 rounded bg-amber-500/5 border border-amber-500/10 text-amber-300">
                        <span className="block text-slate-500 tracking-widest mb-0.5">Med</span>
                        <span className="truncate block font-bold">{teamAnalysis.priorities?.medium || "Improve APIs"}</span>
                      </div>
                      <div className="p-2 rounded bg-cyan-500/5 border border-cyan-500/10 text-cyan-300">
                        <span className="block text-slate-500 tracking-widest mb-0.5">Low</span>
                        <span className="truncate block font-bold">{teamAnalysis.priorities?.low || "Docs review"}</span>
                      </div>
                    </div>
                  </div>

                  {/* TEAM WISE AI NOTIFICATION SYSTEM */}
                  <div className="p-5 rounded-3xl border border-white/5 bg-[#0e1222]/40 backdrop-blur-md text-left">
                    <h3 className="text-xs uppercase tracking-widest font-black text-white flex items-center gap-2 mb-4">
                      <FaBullhorn className="text-purple-400" /> Team AI Notifications
                    </h3>
                    <div className="space-y-3 max-h-[160px] overflow-y-auto pr-1">
                      {(teamAnalysis.notifications || []).map((notif, idx) => (
                        <div key={idx} className="flex gap-2.5 items-start text-xs border-b border-white/5 pb-2.5 last:border-0 last:pb-0">
                          <span className="w-1.5 h-1.5 rounded-full bg-purple-400 shrink-0 mt-1.5" />
                          <p className="text-slate-300 font-bold leading-tight">{notif}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Full Width Chat Room Tab */}
            {activeModule === "chat" && (
              <div className="w-full">
                <TeamChatPreview team={activeTeam} />
              </div>
            )}

            {/* Roster & Members Tab */}
            {activeModule === "members" && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                  <TeamMembersSection team={activeTeam} onRemoveMember={handleRemoveMember} />
                </div>
                <div>
                  <TeamOverviewDetails team={activeTeam} />
                </div>
              </div>
            )}

            {/* Sprints, Milestones & Skills Chart Tab */}
            {activeModule === "sprints" && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                  <SprintTasksSection team={activeTeam} />
                </div>
                <div className="space-y-6">
                  <UpcomingDeadlines team={activeTeam} />
                  <TeamSkillsChart team={activeTeam} />
                </div>
              </div>
            )}
          </>
        ) : (
          /* No Active Team Fallback View */
          <div className="max-w-2xl mx-auto py-16 text-center text-slate-350">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ 1: 0 }}
              className="relative overflow-hidden rounded-3xl border border-white/5 bg-[#0e1222]/50 backdrop-blur-xl p-10 flex flex-col justify-center items-center"
            >
              <div className="absolute -top-16 -right-16 w-40 h-40 bg-[#FF8A00]/10 rounded-full blur-3xl" />
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl" />

              <div className="w-16 h-16 bg-[#3B82F6]/10 border border-[#3B82F6]/25 rounded-2xl flex items-center justify-center text-[#FF8A00] text-3xl mb-6 relative z-10">
                <FaUsers />
              </div>

              <h2 className="text-3xl font-extrabold text-white relative z-10 heading-font">No Active Team Found</h2>
              <p className="text-slate-400 text-sm mt-3.5 leading-relaxed max-w-md relative z-10">
                You are not part of any hackathon squad yet. You can create a new team or explore active teams recruiting developers.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 mt-8 w-full justify-center relative z-10">
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => navigate("/discover-teams")}
                  className="px-6 py-3 rounded-xl bg-[#0e1222] border border-white/5 hover:border-white/10 text-xs font-bold text-white transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Explore Active Teams</span>
                  <FaArrowRight className="text-3xs" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => navigate("/create-team")}
                  className="px-6 py-3 rounded-xl bg-[#FF8A00] border border-[#FF8A00] text-xs font-bold text-white transition flex items-center justify-center shadow-[0_0_15px_rgba(255,138,0,0.2)] cursor-pointer"
                >
                  Create a Team
                </motion.button>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </PageLayout>
  );
}

export default MyTeam;
