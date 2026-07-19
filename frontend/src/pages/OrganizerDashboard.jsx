import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaChartBar,
  FaFileAlt,
  FaEdit,
  FaCheckCircle,
  FaTimesCircle,
  FaPlus,
  FaEye,
  FaTrophy,
  FaDownload,
  FaToggleOn,
  FaToggleOff,
  FaEnvelope,
  FaProjectDiagram,
  FaTimes,
  FaArrowLeft,
  FaCheck,
} from "react-icons/fa";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";
import Topbar from "../components/dashboard/Topbar";
import Sidebar from "../components/dashboard/Sidebar";
import AnimatedBackground from "../components/dashboard/AnimatedBackground";

function OrganizerDashboard() {
  const { user, fetchProfile } = useAuth();
  const [stats, setStats] = useState(null);
  const [hacks, setHacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showWizard, setShowWizard] = useState(false);

  // Registrations Manager State
  const [selectedHack, setSelectedHack] = useState(null); // hackathon item to manage
  const [registrations, setRegistrations] = useState([]);
  const [regsLoading, setRegsLoading] = useState(false);

  // Form Wizard State
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    shortDescription: "",
    organizer: user?.name || "Global Host",
    theme: "Open Track",
    difficulty: "Intermediate",
    mode: "Online",
    prizePool: "",
    registrationDeadline: "",
    startDate: "",
    endDate: "",
    requiredSkills: "",
    contactEmail: user?.email || "",
    hackathonType: "Open",
    isCrossCollegeAllowed: true,
    eligibleYears: ["1st", "2nd", "3rd", "4th"],
    allowedColleges: "",
    communityName: "",
    teamSizeMin: 1,
    teamSizeMax: 4,
  });

  const fetchOrganizerData = async () => {
    try {
      const statsRes = await api.get("/hackathons/organizer/analytics");
      setStats(statsRes.data);

      const listRes = await api.get("/hackathons", { params: { status: undefined } });
      const mine = (listRes.data.hackathons || listRes.data || []).filter(
        (h) => String(h.createdBy) === String(user?._id)
      );
      setHacks(mine);
    } catch (err) {
      console.error("Error loading organizer analytics:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === "organizer") {
      fetchOrganizerData();
    } else {
      setLoading(false);
    }
  }, [user]);

  // Load registrations when selected
  useEffect(() => {
    if (selectedHack) {
      fetchRegistrations(selectedHack._id);
    }
  }, [selectedHack]);

  const fetchRegistrations = async (hackId) => {
    setRegsLoading(true);
    try {
      const res = await api.get(`/hackathons/${hackId}/registrations`);
      setRegistrations(res.data || []);
    } catch (err) {
      console.error("Error loading hackathon registrations:", err);
    } finally {
      setRegsLoading(false);
    }
  };

  const handleBecomeOrganizer = async () => {
    setLoading(true);
    try {
      await api.put("/users/profile", { role: "organizer" });
      await fetchProfile();
    } catch (err) {
      console.error("Error switching role:", err);
    }
  };

  const handleFormChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmitHackathon = async (status) => {
    if (!formData.title || !formData.description || !formData.prizePool) {
      alert("Title, Description, and Prize Pool are required.");
      return;
    }

    try {
      const skillsArray = formData.requiredSkills
        ? formData.requiredSkills.split(",").map((s) => s.trim())
        : [];

      const collegesArray = formData.allowedColleges
        ? formData.allowedColleges.split(",").map((c) => c.trim())
        : [];

      const body = {
        ...formData,
        requiredSkills: skillsArray,
        allowedColleges: collegesArray,
        status,
      };

      await api.post("/hackathons", body);
      alert(status === "Draft" ? "Draft saved successfully!" : "Submitted for admin review!");
      setShowWizard(false);
      fetchOrganizerData();
    } catch (err) {
      console.error("Error creating hackathon:", err);
      alert("Failed to submit hackathon.");
    }
  };

  // Toggle Controls
  const handleToggleRegistration = async (hackItem) => {
    const nextVal = !(hackItem.isRegistrationEnabled ?? true);
    try {
      await api.put(`/hackathons/${hackItem._id}/organizer-control`, {
        isRegistrationEnabled: nextVal,
      });
      // update state
      setHacks((prev) =>
        prev.map((h) => (h._id === hackItem._id ? { ...h, isRegistrationEnabled: nextVal } : h))
      );
      if (selectedHack?._id === hackItem._id) {
        setSelectedHack((prev) => ({ ...prev, isRegistrationEnabled: nextVal }));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleSubmission = async (hackItem) => {
    const nextVal = !(hackItem.isProjectSubmissionEnabled ?? false);
    try {
      await api.put(`/hackathons/${hackItem._id}/organizer-control`, {
        isProjectSubmissionEnabled: nextVal,
      });
      // update state
      setHacks((prev) =>
        prev.map((h) => (h._id === hackItem._id ? { ...h, isProjectSubmissionEnabled: nextVal } : h))
      );
      if (selectedHack?._id === hackItem._id) {
        setSelectedHack((prev) => ({ ...prev, isProjectSubmissionEnabled: nextVal }));
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Moderate Registration status
  const handleModerateReg = async (regId, status) => {
    try {
      await api.put(`/hackathons/registrations/${regId}/moderate`, { status });
      alert(`Registration updated to: ${status}`);
      if (selectedHack) {
        fetchRegistrations(selectedHack._id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // CSV Export Download
  const handleExportCsv = async (hackId) => {
    try {
      const response = await api.get(`/hackathons/${hackId}/export-csv`, {
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `registrations_${hackId}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error("Export error:", err);
      alert("Failed to export registrations.");
    }
  };

  // Message Leader Simulation
  const handleMessageLeader = (email) => {
    alert(`Message invitation sent to team leader email: ${email}`);
  };

  if (loading) {
    return (
      <div className="relative min-h-screen bg-[#050816] text-white flex items-center justify-center">
        <AnimatedBackground />
        <div className="text-center animate-pulse">
          <div className="w-12 h-12 rounded-full border-4 border-[#3B82F6]/30 border-t-[#3B82F6] animate-spin mx-auto mb-4" />
          <p className="text-gray-400 font-semibold">Loading Organizer Analytics...</p>
        </div>
      </div>
    );
  }

  // Not an organizer view
  if (user?.role !== "organizer") {
    return (
      <div className="relative min-h-screen bg-[#050816] text-white">
        <AnimatedBackground />
        <Sidebar activePage="OrganizerDashboard" />
        <main className="ml-72 relative z-10 min-h-screen flex items-center justify-center">
          <Topbar />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-8 max-w-md rounded-3xl bg-[#0e1222]/50 border border-white/5 backdrop-blur-md text-center"
          >
            <span className="text-4xl block mb-4">🚀</span>
            <h2 className="text-2xl font-bold text-white mb-3">Host a Hackathon</h2>
            <p className="text-gray-400 text-sm leading-relaxed mb-6">
              Create drafts, upload banners, customize problem tracks, track analytics, and manage registrant approvals.
            </p>
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              onClick={handleBecomeOrganizer}
              className="px-6 py-3 rounded-2xl bg-[#FF8A00] text-sm font-bold text-white shadow-lg shadow-[#FF8A00]/25 transition cursor-pointer"
            >
              Become an Organizer
            </motion.button>
          </motion.div>
        </main>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-[#050816] text-white">
      <AnimatedBackground />
      <Sidebar activePage="OrganizerDashboard" />

      <main className="ml-72 relative z-10 min-h-screen text-left">
        <Topbar />

        <div className="p-8 max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-extrabold text-white leading-tight">Organizer Dashboard</h1>
              <p className="text-gray-400 text-sm mt-1">Manage and track your upcoming and draft hackathons.</p>
            </div>
            {!selectedHack && (
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setShowWizard(true)}
                className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-purple-600 to-blue-600 font-bold text-sm text-white flex items-center gap-2 hover:shadow-[0_0_15px_rgba(168,85,247,0.3)] transition cursor-pointer"
              >
                <FaPlus /> Host Hackathon
              </motion.button>
            )}
          </div>

          <AnimatePresence mode="wait">
            {!selectedHack ? (
              <motion.div
                key="dashboard_home"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
              >
                {/* Statistics Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
                  <div className="p-5 rounded-2xl bg-[#0e1222]/40 border border-white/5 backdrop-blur-md flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block mb-1">Total Created</span>
                      <span className="text-2xl font-black text-white font-mono">{stats?.totalHackathons || 0}</span>
                    </div>
                    <span className="text-2xl text-purple-400">🏆</span>
                  </div>

                  <div className="p-5 rounded-2xl bg-[#0e1222]/40 border border-white/5 backdrop-blur-md flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block mb-1">Active Events</span>
                      <span className="text-2xl font-black text-emerald-400 font-mono">{stats?.activeHackathons || 0}</span>
                    </div>
                    <span className="text-2xl text-emerald-400">🔥</span>
                  </div>

                  <div className="p-5 rounded-2xl bg-[#0e1222]/40 border border-white/5 backdrop-blur-md flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block mb-1">Drafts</span>
                      <span className="text-2xl font-black text-cyan-400 font-mono">{stats?.draftHackathons || 0}</span>
                    </div>
                    <span className="text-2xl text-cyan-400">📝</span>
                  </div>

                  <div className="p-5 rounded-2xl bg-[#0e1222]/40 border border-white/5 backdrop-blur-md flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block mb-1">Under Review</span>
                      <span className="text-2xl font-black text-amber-400 font-mono">{stats?.pendingReview || 0}</span>
                    </div>
                    <span className="text-2xl text-amber-400">⏳</span>
                  </div>
                </div>

                {/* SaaS Analytics Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8 text-xs text-left">
                  {/* Left Column: Registrations and Trends */}
                  <div className="p-5 rounded-3xl bg-[#0e1222]/30 border border-white/5 space-y-4">
                    <h4 className="font-bold text-white text-sm mb-1">📈 Insights & Trends</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400">Duplicate Registrations Blocked:</span>
                        <span className="text-red-400 font-mono font-bold">2 Attempted</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400">Pending Invites:</span>
                        <span className="text-amber-400 font-mono font-bold">5 Pending</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400">Most Applied:</span>
                        <span className="text-cyan-400 font-bold font-mono">Healthcare Hackathon</span>
                      </div>
                    </div>
                  </div>

                  {/* Middle Column: Top Colleges & Communities */}
                  <div className="p-5 rounded-3xl bg-[#0e1222]/30 border border-white/5 space-y-4">
                    <h4 className="font-bold text-white text-sm mb-1">🏫 Institutes & Hubs</h4>
                    <div className="space-y-3">
                      <div>
                        <span className="text-[9px] text-gray-500 font-bold uppercase tracking-wider block mb-1">Top Colleges</span>
                        <div className="flex flex-wrap gap-1">
                          {["BHU", "IIT Kanpur", "NIT Trichy"].map((c, i) => (
                            <span key={i} className="px-2 py-0.5 rounded bg-slate-900 border border-white/5 text-gray-300 text-[10px]">{c}</span>
                          ))}
                        </div>
                      </div>
                      <div>
                        <span className="text-[9px] text-gray-500 font-bold uppercase tracking-wider block mb-1">Top Communities</span>
                        <div className="flex flex-wrap gap-1">
                          {["Google Developer Groups", "IEEE", "ACM"].map((c, i) => (
                            <span key={i} className="px-2 py-0.5 rounded bg-slate-900 border border-white/5 text-cyan-400 text-[10px]">{c}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Skills Hotspots */}
                  <div className="p-5 rounded-3xl bg-[#0e1222]/30 border border-white/5 space-y-4">
                    <h4 className="font-bold text-white text-sm mb-1">🔥 Top Registrant Skills</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400">React.js</span>
                        <span className="text-white font-mono font-bold">84%</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400">Node.js</span>
                        <span className="text-white font-mono font-bold">62%</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400">Docker</span>
                        <span className="text-white font-mono font-bold">40%</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Hackathons Table/List */}
                <div className="rounded-3xl border border-white/5 bg-[#0e1222]/20 p-6 backdrop-blur-md mb-8">
                  <h3 className="font-bold text-white text-base mb-4">Your Event List</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left">
                      <thead>
                        <tr className="border-b border-white/5 text-gray-500 font-bold uppercase tracking-wider">
                          <th className="pb-3">Title</th>
                          <th className="pb-3">Prize Pool</th>
                          <th className="pb-3">Status</th>
                          <th className="pb-3">Participants</th>
                          <th className="pb-3 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {hacks.length === 0 ? (
                          <tr>
                            <td colSpan={5} className="text-center py-6 text-gray-500">
                              You have not created any hackathons yet.
                            </td>
                          </tr>
                        ) : (
                          hacks.map((h, i) => (
                            <tr key={i} className="border-b border-white/5 last:border-0 hover:bg-white/1">
                              <td className="py-4 font-bold text-white">{h.title}</td>
                              <td className="py-4 font-mono font-bold text-emerald-400">{h.prizePool}</td>
                              <td className="py-4">
                                <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold border ${
                                  h.status === "Approved" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                                  h.status === "Pending Review" ? "bg-amber-500/10 text-amber-400 border-amber-500/20" :
                                  h.status === "Rejected" ? "bg-red-500/10 text-red-400 border-red-500/20" :
                                  "bg-slate-800/40 text-slate-400 border-white/5"
                                }`}>
                                  {h.status || "Draft"}
                                </span>
                              </td>
                              <td className="py-4 font-mono">{h.participants || 0}</td>
                              <td className="py-4 text-right">
                                {h.status === "Approved" ? (
                                  <button
                                    onClick={() => setSelectedHack(h)}
                                    className="px-3.5 py-1.5 rounded-xl bg-[#3B82F6]/10 border border-[#3B82F6]/25 hover:bg-[#3B82F6]/20 transition font-bold text-[11px] text-white flex items-center gap-1.5 ml-auto cursor-pointer"
                                  >
                                    <FaFileAlt /> Manage Registrations
                                  </button>
                                ) : (
                                  <span className="text-gray-500 italic">Moderation pending</span>
                                )}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="registrations_panel"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="space-y-6"
              >
                {/* Back button row */}
                <div className="flex items-center justify-between border-b border-white/5 pb-4">
                  <button
                    onClick={() => setSelectedHack(null)}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-white/5 text-xs text-gray-300 font-bold hover:text-white transition cursor-pointer"
                  >
                    <FaArrowLeft /> Back to Events
                  </button>
                  <h3 className="font-extrabold text-white text-base">{selectedHack.title}</h3>
                </div>

                {/* Configuration Toggles */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-xs">
                  <div className="p-4 rounded-xl bg-[#0e1222]/40 border border-white/5 flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-white mb-0.5">Toggle Registrations</h4>
                      <p className="text-[10px] text-gray-500">Allow users to apply</p>
                    </div>
                    <button
                      onClick={() => handleToggleRegistration(selectedHack)}
                      className="text-2xl text-cyan-400 cursor-pointer"
                    >
                      {(selectedHack.isRegistrationEnabled ?? true) ? <FaToggleOn /> : <FaToggleOff className="text-gray-650" />}
                    </button>
                  </div>

                  <div className="p-4 rounded-xl bg-[#0e1222]/40 border border-white/5 flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-white mb-0.5">Project Submissions</h4>
                      <p className="text-[10px] text-gray-500">Enable project uploads</p>
                    </div>
                    <button
                      onClick={() => handleToggleSubmission(selectedHack)}
                      className="text-2xl text-orange-400 cursor-pointer"
                    >
                      {selectedHack.isProjectSubmissionEnabled ? <FaToggleOn /> : <FaToggleOff className="text-gray-650" />}
                    </button>
                  </div>

                  <div className="p-4 rounded-xl bg-[#0e1222]/40 border border-white/5 flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-white mb-0.5">Export Database</h4>
                      <p className="text-[10px] text-gray-500">CSV file compilation</p>
                    </div>
                    <button
                      onClick={() => handleExportCsv(selectedHack._id)}
                      className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-purple-650 to-blue-650 font-bold text-white flex items-center gap-1.5 transition shadow-lg cursor-pointer"
                    >
                      <FaDownload /> Export CSV
                    </button>
                  </div>
                </div>

                {/* Registrants Table */}
                <div className="p-6 rounded-3xl bg-[#0e1222]/20 border border-white/5 backdrop-blur-md">
                  <h4 className="font-black text-white text-sm mb-4">Registration Applications</h4>
                  {regsLoading ? (
                    <div className="py-12 text-center text-gray-550 animate-pulse">Loading list...</div>
                  ) : registrations.length === 0 ? (
                    <div className="py-12 text-center text-gray-500">No registrations found for this event.</div>
                  ) : (
                    <div className="overflow-x-auto text-xs">
                      <table className="w-full text-left">
                        <thead>
                          <tr className="border-b border-white/5 text-gray-500 uppercase font-bold tracking-wider">
                            <th className="pb-3">Reg ID</th>
                            <th className="pb-3">Team Name</th>
                            <th className="pb-3">College</th>
                            <th className="pb-3">Leader</th>
                            <th className="pb-3">Status</th>
                            <th className="pb-3 text-right">Moderations</th>
                          </tr>
                        </thead>
                        <tbody>
                          {registrations.map((reg) => (
                            <tr key={reg._id} className="border-b border-white/5 last:border-0 hover:bg-white/1">
                              <td className="py-4 font-mono font-bold text-cyan-400">{reg.registrationId}</td>
                              <td className="py-4 font-extrabold text-white">
                                {reg.teamName || "Solo"}
                              </td>
                              <td className="py-4 text-gray-300">{reg.college}</td>
                              <td className="py-4">
                                <div>{reg.leaderDetails?.name}</div>
                                <div className="text-[10px] text-gray-550 font-mono mt-0.5">{reg.leaderDetails?.email}</div>
                              </td>
                              <td className="py-4">
                                <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                                  reg.status === "Registration Confirmed" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" :
                                  reg.status === "Project Submitted" ? "bg-purple-500/10 text-purple-400 border border-purple-500/20" :
                                  reg.status === "Rejected" ? "bg-red-500/10 text-red-400 border border-red-500/20" :
                                  "bg-[#3B82F6]/10 text-[#3B82F6]"
                                }`}>
                                  {reg.status}
                                </span>
                              </td>
                              <td className="py-4 text-right">
                                <div className="flex gap-1.5 justify-end">
                                  <button
                                    onClick={() => handleModerateReg(reg._id, "Registration Confirmed")}
                                    className="p-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/25 hover:bg-emerald-500/20 text-emerald-400 transition cursor-pointer"
                                    title="Confirm Registration"
                                  >
                                    <FaCheck />
                                  </button>
                                  <button
                                    onClick={() => handleModerateReg(reg._id, "Rejected")}
                                    className="p-1.5 rounded-lg bg-red-500/10 border border-red-500/25 hover:bg-red-500/20 text-red-400 transition cursor-pointer"
                                    title="Reject Registration"
                                  >
                                    <FaTimes />
                                  </button>
                                  <button
                                    onClick={() => handleMessageLeader(reg.leaderDetails?.email)}
                                    className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition cursor-pointer"
                                    title="Contact Leader"
                                  >
                                    <FaEnvelope />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* Creation Form Wizard Modal Overlay */}
      <AnimatePresence>
        {showWizard && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowWizard(false)}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl rounded-3xl bg-[#0e1222] border border-white/5 p-6 md:p-8 backdrop-blur-xl text-left overflow-y-auto max-h-[85vh] scrollbar-hide"
            >
              <h2 className="text-xl font-bold text-white mb-4">Host a Hackathon</h2>

              <div className="space-y-4 text-xs">
                {/* Row 1 */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-gray-400 block mb-1">Title</label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleFormChange}
                      placeholder="e.g. Smart India Hackathon"
                      className="w-full px-3 py-2.5 rounded-xl bg-[#050816]/70 border border-white/5 text-gray-200 placeholder-gray-600 focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                  <div>
                    <label className="text-gray-400 block mb-1">Prize Pool</label>
                    <input
                      type="text"
                      name="prizePool"
                      value={formData.prizePool}
                      onChange={handleFormChange}
                      placeholder="e.g. $10,000"
                      className="w-full px-3 py-2.5 rounded-xl bg-[#050816]/70 border border-white/5 text-gray-200 placeholder-gray-600 focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="text-gray-400 block mb-1">Description</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleFormChange}
                    placeholder="Provide details about tracks, timeline, guidelines..."
                    rows={4}
                    className="w-full px-3 py-2.5 rounded-xl bg-[#050816]/70 border border-white/5 text-gray-200 placeholder-gray-600 focus:outline-none focus:border-cyan-500"
                  />
                </div>

                {/* Short Description */}
                <div>
                  <label className="text-gray-400 block mb-1">Short Tagline</label>
                  <input
                    type="text"
                    name="shortDescription"
                    value={formData.shortDescription}
                    onChange={handleFormChange}
                    placeholder="Short description for preview cards..."
                    className="w-full px-3 py-2.5 rounded-xl bg-[#050816]/70 border border-white/5 text-gray-200 placeholder-gray-600 focus:outline-none focus:border-cyan-500"
                  />
                </div>

                {/* Timeline Row */}
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="text-gray-400 block mb-1">Registration Deadline</label>
                    <input
                      type="date"
                      name="registrationDeadline"
                      value={formData.registrationDeadline}
                      onChange={handleFormChange}
                      className="w-full px-3 py-2.5 rounded-xl bg-[#050816]/70 border border-white/5 text-gray-200 focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                  <div>
                    <label className="text-gray-400 block mb-1">Start Date</label>
                    <input
                      type="date"
                      name="startDate"
                      value={formData.startDate}
                      onChange={handleFormChange}
                      className="w-full px-3 py-2.5 rounded-xl bg-[#050816]/70 border border-white/5 text-gray-200 focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                  <div>
                    <label className="text-gray-400 block mb-1">End Date</label>
                    <input
                      type="date"
                      name="endDate"
                      value={formData.endDate}
                      onChange={handleFormChange}
                      className="w-full px-3 py-2.5 rounded-xl bg-[#050816]/70 border border-white/5 text-gray-200 focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                </div>

                {/* Form Row 3 */}
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="text-gray-400 block mb-1">Required Skills</label>
                    <input
                      type="text"
                      name="requiredSkills"
                      value={formData.requiredSkills}
                      onChange={handleFormChange}
                      placeholder="React, Node.js (comma-separated)"
                      className="w-full px-3 py-2.5 rounded-xl bg-[#050816]/70 border border-white/5 text-gray-200 placeholder-gray-650 focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                  <div>
                    <label className="text-gray-400 block mb-1">Mode</label>
                    <select
                      name="mode"
                      value={formData.mode}
                      onChange={handleFormChange}
                      className="w-full px-3 py-2.5 rounded-xl bg-[#050816]/70 border border-white/5 text-gray-400 focus:outline-none focus:border-cyan-500"
                    >
                      <option value="Online">Online</option>
                      <option value="Offline">Offline</option>
                      <option value="Hybrid">Hybrid</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-gray-400 block mb-1">Difficulty</label>
                    <select
                      name="difficulty"
                      value={formData.difficulty}
                      onChange={handleFormChange}
                      className="w-full px-3 py-2.5 rounded-xl bg-[#050816]/70 border border-white/5 text-gray-400 focus:outline-none focus:border-cyan-500"
                    >
                      <option value="Beginner">Beginner</option>
                      <option value="Intermediate">Intermediate</option>
                      <option value="Advanced">Advanced</option>
                    </select>
                  </div>
                </div>

                {/* Eligibility Config Section */}
                <div className="p-4 rounded-xl bg-[#050816]/75 border border-white/5 space-y-4">
                  <h4 className="font-extrabold text-cyan-400">Eligibility Constraints & Type</h4>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="text-gray-400 block mb-1">Hackathon Type</label>
                      <select
                        name="hackathonType"
                        value={formData.hackathonType}
                        onChange={handleFormChange}
                        className="w-full px-3 py-2.5 rounded-xl bg-[#0e1222] border border-white/5 text-gray-300 focus:outline-none"
                      >
                        <option value="Open">🌍 Open Hackathon</option>
                        <option value="Student">🎓 Student Hackathon</option>
                        <option value="College">🏫 College Hackathon</option>
                        <option value="Community">🌐 Community Hackathon</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-gray-400 block mb-1">Min Team Size</label>
                      <input
                        type="number"
                        name="teamSizeMin"
                        value={formData.teamSizeMin}
                        onChange={handleFormChange}
                        min={1}
                        className="w-full px-3 py-2.5 rounded-xl bg-[#0e1222] border border-white/5 text-gray-300 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-gray-400 block mb-1">Max Team Size</label>
                      <input
                        type="number"
                        name="teamSizeMax"
                        value={formData.teamSizeMax}
                        onChange={handleFormChange}
                        min={1}
                        className="w-full px-3 py-2.5 rounded-xl bg-[#0e1222] border border-white/5 text-gray-300 focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* DYNAMIC FIELD CONFIGS */}
                  {formData.hackathonType === "Open" && (
                    <div className="p-3.5 rounded-xl bg-[#0e1222]/40 text-gray-450 space-y-1.5 leading-normal">
                      <div className="flex items-center gap-2">
                        <span className="text-emerald-400">✔</span> Anyone can participate
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-emerald-400">✔</span> Cross College Teams Allowed
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-emerald-400">✔</span> Cross Organization Allowed
                      </div>
                    </div>
                  )}

                  {formData.hackathonType === "Student" && (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-gray-400 block mb-1">Allow Cross-College Teams</label>
                        <select
                          name="isCrossCollegeAllowed"
                          value={formData.isCrossCollegeAllowed ? "true" : "false"}
                          onChange={(e) => setFormData(prev => ({ ...prev, isCrossCollegeAllowed: e.target.value === "true" }))}
                          className="w-full px-3 py-2.5 rounded-xl bg-[#0e1222] border border-white/5 text-gray-300 focus:outline-none"
                        >
                          <option value="true">Yes, allow students from any institute</option>
                          <option value="false">No, require all members from same college</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-gray-400 block mb-1">Eligible Academic Years</label>
                        <div className="flex flex-wrap gap-3 mt-2">
                          {["1st", "2nd", "3rd", "4th"].map((yr) => {
                            const isChecked = formData.eligibleYears.includes(yr);
                            return (
                              <label key={yr} className="flex items-center gap-1.5 cursor-pointer text-gray-350 select-none text-[10px]">
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={(e) => {
                                    const nextYrs = e.target.checked 
                                      ? [...formData.eligibleYears, yr]
                                      : formData.eligibleYears.filter(y => y !== yr);
                                    setFormData(prev => ({ ...prev, eligibleYears: nextYrs }));
                                  }}
                                  className="accent-cyan-500"
                                />
                                {yr} Year
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  )}

                  {formData.hackathonType === "College" && (
                    <div>
                      <label className="text-gray-400 block mb-1">Allowed College List (comma-separated)</label>
                      <input
                        type="text"
                        name="allowedColleges"
                        value={formData.allowedColleges}
                        onChange={handleFormChange}
                        placeholder="BHU, IIT Kanpur, NIT Trichy"
                        className="w-full px-3 py-2.5 rounded-xl bg-[#0e1222] border border-white/5 text-gray-200 placeholder-gray-650 focus:outline-none focus:border-cyan-500"
                      />
                    </div>
                  )}

                  {formData.hackathonType === "Community" && (
                    <div>
                      <label className="text-gray-400 block mb-1">Community Association</label>
                      <select
                        name="communityName"
                        value={formData.communityName}
                        onChange={handleFormChange}
                        className="w-full px-3 py-2.5 rounded-xl bg-[#0e1222] border border-white/5 text-gray-300 focus:outline-none"
                      >
                        <option value="Google Developer Groups">Google Developer Groups</option>
                        <option value="IEEE">IEEE</option>
                        <option value="ACM">ACM</option>
                        <option value="AWS User Group">AWS User Group</option>
                        <option value="Microsoft Learn Student Ambassadors">Microsoft Learn Student Ambassadors</option>
                      </select>
                    </div>
                  )}
                </div>
              </div>

              {/* Footer CTA */}
              <div className="flex justify-end gap-3 mt-6 border-t border-white/5 pt-4">
                <button
                  onClick={() => setShowWizard(false)}
                  className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 transition text-gray-450"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleSubmitHackathon("Draft")}
                  className="px-4 py-2 rounded-xl bg-slate-800 border border-white/10 hover:border-cyan-500 transition text-white"
                >
                  Save Draft
                </button>
                <button
                  onClick={() => handleSubmitHackathon("Pending Review")}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold transition shadow-md shadow-[#3B82F6]/15"
                >
                  Publish for Review
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default OrganizerDashboard;
