import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaUsers,
  FaCheck,
  FaTimes,
  FaStar,
  FaBookOpen,
  FaShieldAlt,
  FaClipboardList,
  FaUserCheck,
  FaUserLock,
  FaCheckCircle,
  FaTimesCircle,
  FaExclamationTriangle,
  FaTrash,
} from "react-icons/fa";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";
import Topbar from "../components/dashboard/Topbar";
import Sidebar from "../components/dashboard/Sidebar";
import AnimatedBackground from "../components/dashboard/AnimatedBackground";

function AdminDashboard() {
  const { user, fetchProfile } = useAuth();
  const [stats, setStats] = useState(null);
  const [hacks, setHacks] = useState([]);
  const [organizers, setOrganizers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeSubTab, setActiveSubTab] = useState("pending_events"); 
  // "pending_events", "active_events", "organizers", "reported_spam"

  // Rejection Dialog State
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [selectedHackId, setSelectedHackId] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");

  // Mock spam & reports for demo purposes
  const [reports, setReports] = useState({
    reportedHackathons: [
      { id: "h1", title: "Free Crypto Looters Hack", reporter: "Aditya G.", reason: "Suspicious website link" },
    ],
    reportedUsers: [
      { id: "u1", name: "spam_bot_99", email: "bot99@spam.com", reason: "Posting commercial links in lobbies" },
    ],
    spamFlags: [
      { id: "s1", item: "Draft Hackathon Title: 'Test Event 123'", trigger: "Duplicate descriptions detected" },
    ],
  });

  const fetchAdminData = async () => {
    try {
      const analyticsRes = await api.get("/hackathons/admin/analytics");
      setStats(analyticsRes.data);

      const listRes = await api.get("/hackathons", { params: { status: undefined } });
      setHacks(listRes.data.hackathons || listRes.data || []);

      const orgsRes = await api.get("/admin/organizers");
      setOrganizers(orgsRes.data || []);
    } catch (err) {
      console.error("Error loading admin dashboard diagnostics:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === "admin") {
      fetchAdminData();
    } else {
      setLoading(false);
    }
  }, [user]);

  const handleBecomeAdmin = async () => {
    setLoading(true);
    try {
      await api.put("/users/profile", { role: "admin" });
      await fetchProfile();
    } catch (err) {
      console.error("Error switching role:", err);
    }
  };

  const handleApprove = async (id) => {
    try {
      await api.put(`/hackathons/${id}/approve`);
      alert("Hackathon Approved Successfully!");
      fetchAdminData();
    } catch (err) {
      console.error("Error approving hackathon:", err);
      alert("Failed to approve.");
    }
  };

  const handleRejectSubmit = async () => {
    if (!rejectionReason.trim()) {
      alert("Rejection reason is required.");
      return;
    }

    try {
      await api.put(`/hackathons/${selectedHackId}/reject`, { rejectionReason });
      alert("Hackathon Rejected.");
      setShowRejectDialog(false);
      setRejectionReason("");
      fetchAdminData();
    } catch (err) {
      console.error("Error rejecting hackathon:", err);
      alert("Failed to reject.");
    }
  };

  const handleToggleFeature = async (id) => {
    try {
      await api.put(`/hackathons/${id}/feature`);
      alert("Featured status updated!");
      fetchAdminData();
    } catch (err) {
      console.error("Error updating featured status:", err);
    }
  };

  const handleToggleVerifyOrganizer = async (orgId) => {
    try {
      const res = await api.put(`/admin/organizers/${orgId}/verify`);
      alert(res.data.isVerified ? "Organizer verified successfully!" : "Organizer verification revoked.");
      fetchAdminData();
    } catch (err) {
      console.error("Error toggling organizer verification:", err);
    }
  };

  const handleRemoveSpam = (id, type) => {
    alert(`Item removed from platform successfully.`);
    if (type === "hackathon") {
      setReports(prev => ({
        ...prev,
        reportedHackathons: prev.reportedHackathons.filter(h => h.id !== id)
      }));
    } else if (type === "user") {
      setReports(prev => ({
        ...prev,
        reportedUsers: prev.reportedUsers.filter(u => u.id !== id)
      }));
    } else {
      setReports(prev => ({
        ...prev,
        spamFlags: prev.spamFlags.filter(s => s.id !== id)
      }));
    }
  };

  if (loading) {
    return (
      <div className="relative min-h-screen bg-[#050816] text-white flex items-center justify-center">
        <AnimatedBackground />
        <div className="text-center animate-pulse">
          <div className="w-12 h-12 rounded-full border-4 border-[#3B82F6]/30 border-t-[#3B82F6] animate-spin mx-auto mb-4" />
          <p className="text-gray-400 font-semibold">Loading Admin Analytics...</p>
        </div>
      </div>
    );
  }

  // Not an admin view
  if (user?.role !== "admin") {
    return (
      <div className="relative min-h-screen bg-[#050816] text-white">
        <AnimatedBackground />
        <Sidebar activePage="Dashboard" />
        <main className="ml-72 relative z-10 min-h-screen flex items-center justify-center">
          <Topbar />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-8 max-w-md rounded-3xl bg-[#0e1222]/50 border border-white/5 backdrop-blur-md text-center"
          >
            <span className="text-4xl block mb-4">🛡️</span>
            <h2 className="text-2xl font-bold text-white mb-3">Admin Portal</h2>
            <p className="text-gray-400 text-sm leading-relaxed mb-6">
              Review organizer submissions, verify hosts, feature events, and moderate community hackathons.
            </p>
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              onClick={handleBecomeAdmin}
              className="px-6 py-3 rounded-2xl bg-[#3B82F6] text-sm font-bold text-white shadow-lg shadow-[#3B82F6]/25 transition cursor-pointer"
            >
              Become an Admin
            </motion.button>
          </motion.div>
        </main>
      </div>
    );
  }

  // Filter hackathon categories
  const pendingHacks = hacks.filter((h) => h.status === "Pending Review");
  const activeHacks = hacks.filter((h) => h.status === "Approved" || h.status === "Published" || h.status === "Open");
  const featuredHacks = hacks.filter((h) => h.isFeatured);

  // Filter Organizers
  const pendingOrgs = organizers.filter((o) => !o.isVerified);
  const verifiedOrgs = organizers.filter((o) => o.isVerified);

  return (
    <div className="relative min-h-screen bg-[#050816] text-white">
      <AnimatedBackground />
      <Sidebar activePage="AdminDashboard" />

      <main className="ml-72 relative z-10 min-h-screen text-left">
        <Topbar />

        <div className="p-8 max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-extrabold text-white leading-tight">Admin Moderation Console</h1>
            <p className="text-gray-400 text-sm mt-1">Review organizer listings, manage platforms security, and verify credentials.</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
            <div className="p-5 rounded-2xl bg-[#0e1222]/40 border border-white/5 backdrop-blur-md flex items-center justify-between">
              <div>
                <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block mb-1">Total Users</span>
                <span className="text-2xl font-black text-white font-mono">{stats?.totalUsers || 0}</span>
              </div>
              <span className="text-2xl text-purple-400"><FaUsers /></span>
            </div>

            <div className="p-5 rounded-2xl bg-[#0e1222]/40 border border-white/5 backdrop-blur-md flex items-center justify-between">
              <div>
                <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block mb-1">Verified Hosts</span>
                <span className="text-2xl font-black text-cyan-400 font-mono">{verifiedOrgs.length}</span>
              </div>
              <span className="text-2xl text-cyan-400"><FaShieldAlt /></span>
            </div>

            <div className="p-5 rounded-2xl bg-[#0e1222]/40 border border-white/5 backdrop-blur-md flex items-center justify-between">
              <div>
                <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block mb-1">Active Events</span>
                <span className="text-2xl font-black text-emerald-400 font-mono">{stats?.activeHackathons || 0}</span>
              </div>
              <span className="text-2xl text-emerald-400"><FaBookOpen /></span>
            </div>

            <div className="p-5 rounded-2xl bg-[#0e1222]/40 border border-white/5 backdrop-blur-md flex items-center justify-between">
              <div>
                <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block mb-1">Pending Approval</span>
                <span className="text-2xl font-black text-amber-400 font-mono">{stats?.pendingReview || 0}</span>
              </div>
              <span className="text-2xl text-amber-400"><FaClipboardList /></span>
            </div>
          </div>

          {/* SVG Analytics Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <div className="rounded-3xl border border-white/5 bg-[#0e1222]/20 p-6 backdrop-blur-md">
              <h4 className="font-bold text-sm text-white mb-4">User Growth Trend</h4>
              <div className="h-44 w-full flex items-end">
                <svg className="w-full h-full" viewBox="0 0 400 150">
                  <path
                    d="M 10 120 Q 80 90, 150 70 T 290 40 T 390 10"
                    fill="none"
                    stroke="url(#grad1)"
                    strokeWidth="4"
                  />
                  <defs>
                    <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#a855f7" />
                      <stop offset="100%" stopColor="#3b82f6" />
                    </linearGradient>
                  </defs>
                  <circle cx="10" cy="120" r="4" fill="#a855f7" />
                  <circle cx="150" cy="70" r="4" fill="#8b5cf6" />
                  <circle cx="290" cy="40" r="4" fill="#6366f1" />
                  <circle cx="390" cy="10" r="4" fill="#3b82f6" />
                </svg>
              </div>
              <div className="flex justify-between text-[10px] text-gray-500 font-bold uppercase mt-2">
                <span>Month 1</span>
                <span>Month 2</span>
                <span>Month 3</span>
                <span>Month 4</span>
              </div>
            </div>

            <div className="rounded-3xl border border-white/5 bg-[#0e1222]/20 p-6 backdrop-blur-md flex flex-col justify-between">
              <h4 className="font-bold text-sm text-white mb-4">Event Distribution</h4>
              <div className="flex justify-around items-center h-32">
                <div className="flex flex-col items-center gap-1">
                  <div className="w-8 h-20 bg-gradient-to-t from-purple-600 to-indigo-500 rounded-lg" />
                  <span className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">AI/ML (55%)</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <div className="w-8 h-12 bg-gradient-to-t from-cyan-600 to-blue-500 rounded-lg" />
                  <span className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Web3 (30%)</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <div className="w-8 h-8 bg-gradient-to-t from-emerald-600 to-teal-500 rounded-lg" />
                  <span className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Design (15%)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Sub Navigation Tabs */}
          <div className="flex gap-2 border-b border-white/5 pb-3 mb-6 overflow-x-auto">
            <button
              onClick={() => setActiveSubTab("pending_events")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                activeSubTab === "pending_events"
                  ? "bg-[#3B82F6]/15 text-white border border-[#3B82F6]/30"
                  : "text-gray-450 hover:text-gray-200"
              }`}
            >
              Pending Reviews ({pendingHacks.length})
            </button>
            <button
              onClick={() => setActiveSubTab("active_events")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                activeSubTab === "active_events"
                  ? "bg-[#3B82F6]/15 text-white border border-[#3B82F6]/30"
                  : "text-gray-450 hover:text-gray-200"
              }`}
            >
              Approved Catalog ({activeHacks.length})
            </button>
            <button
              onClick={() => setActiveSubTab("organizers")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                activeSubTab === "organizers"
                  ? "bg-[#3B82F6]/15 text-white border border-[#3B82F6]/30"
                  : "text-gray-450 hover:text-gray-200"
              }`}
            >
              Host Verification ({organizers.length})
            </button>
            <button
              onClick={() => setActiveSubTab("reported_spam")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                activeSubTab === "reported_spam"
                  ? "bg-[#3B82F6]/15 text-white border border-[#3B82F6]/30"
                  : "text-gray-450 hover:text-gray-200"
              }`}
            >
              Reported & Spam Logs
            </button>
          </div>

          {/* Tab Contents */}
          <div className="rounded-3xl border border-white/5 bg-[#0e1222]/20 p-6 backdrop-blur-md">
            <AnimatePresence mode="wait">
              {activeSubTab === "pending_events" && (
                <motion.div
                  key="pending_events"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  className="space-y-4 text-xs"
                >
                  <h3 className="font-bold text-white text-base mb-2">Pending Approvals</h3>
                  {pendingHacks.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">
                      No hackathons are pending review at this moment.
                    </div>
                  ) : (
                    pendingHacks.map((hack, idx) => (
                      <div
                        key={hack._id || idx}
                        className="p-5 rounded-2xl bg-[#0e1222]/50 border border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4"
                      >
                        <div className="text-left">
                          <h4 className="font-extrabold text-white text-sm mb-1">{hack.title}</h4>
                          <p className="text-[11px] text-gray-400">
                            Hosted by <span className="text-cyan-400 font-bold">{hack.organizer}</span> • Prize: {hack.prizePool}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleApprove(hack._id)}
                            className="px-3.5 py-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/35 text-emerald-400 font-bold flex items-center gap-1.5 transition cursor-pointer"
                          >
                            <FaCheck /> Approve
                          </button>
                          <button
                            onClick={() => {
                              setSelectedHackId(hack._id);
                              setShowRejectDialog(true);
                            }}
                            className="px-3.5 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/35 text-red-400 font-bold flex items-center gap-1.5 transition cursor-pointer"
                          >
                            <FaTimes /> Reject
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </motion.div>
              )}

              {activeSubTab === "active_events" && (
                <motion.div
                  key="active_events"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  className="space-y-4 text-xs"
                >
                  <h3 className="font-bold text-white text-base mb-2">Approved Hackathons</h3>
                  {activeHacks.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">
                      No approved hackathons available.
                    </div>
                  ) : (
                    activeHacks.map((hack, idx) => (
                      <div
                        key={hack._id || idx}
                        className="p-5 rounded-2xl bg-[#0e1222]/50 border border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4"
                      >
                        <div className="text-left">
                          <h4 className="font-extrabold text-white text-sm mb-1">{hack.title}</h4>
                          <p className="text-[11px] text-gray-400">
                            Hosted by <span className="text-cyan-400 font-bold">{hack.organizer}</span> • Status: {hack.status}
                          </p>
                        </div>
                        <button
                          onClick={() => handleToggleFeature(hack._id)}
                          className={`px-4 py-2 rounded-xl font-bold flex items-center gap-1.5 transition cursor-pointer border ${
                            hack.isFeatured
                              ? "bg-amber-500/20 border-amber-500/40 text-amber-300"
                              : "bg-[#0e1222] border-white/5 text-gray-455 hover:text-white"
                          }`}
                        >
                          <FaStar /> {hack.isFeatured ? "Featured" : "Feature"}
                        </button>
                      </div>
                    ))
                  )}
                </motion.div>
              )}

              {activeSubTab === "organizers" && (
                <motion.div
                  key="organizers"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  className="space-y-6 text-xs"
                >
                  {/* Pending Hosts Verification */}
                  <div>
                    <h3 className="font-bold text-white text-sm mb-3">Pending Host Verifications ({pendingOrgs.length})</h3>
                    {pendingOrgs.length === 0 ? (
                      <div className="p-4 rounded-xl bg-slate-950/20 text-gray-550 italic text-center">
                        No pending hosts. All current hosts are verified.
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {pendingOrgs.map((org) => (
                          <div key={org._id} className="p-4 rounded-xl bg-[#0e1222]/50 border border-white/5 flex items-center justify-between">
                            <div>
                              <h4 className="font-bold text-white text-xs">{org.name}</h4>
                              <p className="text-[10px] text-gray-500 font-mono mt-0.5">{org.email}</p>
                            </div>
                            <button
                              onClick={() => handleToggleVerifyOrganizer(org._id)}
                              className="px-3 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/25 text-emerald-400 font-bold transition cursor-pointer"
                            >
                              Verify Host
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Verified Hosts Checklist */}
                  <div className="border-t border-white/5 pt-5">
                    <h3 className="font-bold text-white text-sm mb-3">Verified Organizer Accounts ({verifiedOrgs.length})</h3>
                    {verifiedOrgs.length === 0 ? (
                      <div className="p-4 rounded-xl bg-slate-950/20 text-gray-550 italic text-center">
                        No verified hosts logged on platform.
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {verifiedOrgs.map((org) => (
                          <div key={org._id} className="p-4 rounded-xl bg-[#0e1222]/30 border border-white/5 flex items-center justify-between">
                            <div>
                              <h4 className="font-bold text-white text-xs flex items-center gap-1">
                                {org.name} <FaCheckCircle className="text-emerald-400 text-[10px]" />
                              </h4>
                              <p className="text-[10px] text-gray-500 font-mono mt-0.5">{org.email}</p>
                            </div>
                            <button
                              onClick={() => handleToggleVerifyOrganizer(org._id)}
                              className="px-3 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 border border-red-500/25 text-red-400 font-bold transition cursor-pointer"
                            >
                              Revoke Verify
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {activeSubTab === "reported_spam" && (
                <motion.div
                  key="reported_spam"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  className="space-y-6 text-xs text-left"
                >
                  {/* Reported Hackathons */}
                  <div>
                    <h3 className="font-bold text-white text-sm mb-3 flex items-center gap-1.5">
                      <FaExclamationTriangle className="text-red-400" /> Reported Hackathons
                    </h3>
                    {reports.reportedHackathons.length === 0 ? (
                      <div className="p-4 rounded-xl bg-slate-950/20 text-gray-550 italic">No reported hackathons.</div>
                    ) : (
                      <div className="space-y-3">
                        {reports.reportedHackathons.map((rep) => (
                          <div key={rep.id} className="p-4 rounded-xl bg-red-500/5 border border-red-500/10 flex items-center justify-between">
                            <div>
                              <h4 className="font-extrabold text-white text-xs">{rep.title}</h4>
                              <p className="text-[10px] text-gray-400 mt-1">Reporter: {rep.reporter} • Reason: {rep.reason}</p>
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleRemoveSpam(rep.id, "hackathon")}
                                className="px-3 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 border border-red-500/25 text-red-400 font-bold cursor-pointer"
                              >
                                Remove Spam
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Reported Users */}
                  <div className="border-t border-white/5 pt-5">
                    <h3 className="font-bold text-white text-sm mb-3 flex items-center gap-1.5">
                      <FaExclamationTriangle className="text-orange-400" /> Reported Users
                    </h3>
                    {reports.reportedUsers.length === 0 ? (
                      <div className="p-4 rounded-xl bg-slate-950/20 text-gray-550 italic">No reported users.</div>
                    ) : (
                      <div className="space-y-3">
                        {reports.reportedUsers.map((rep) => (
                          <div key={rep.id} className="p-4 rounded-xl bg-orange-500/5 border border-orange-500/10 flex items-center justify-between">
                            <div>
                              <h4 className="font-bold text-white text-xs">{rep.name}</h4>
                              <p className="text-[10px] text-gray-550 font-mono mt-0.5">{rep.email}</p>
                              <p className="text-[10px] text-gray-400 mt-1">Reason: {rep.reason}</p>
                            </div>
                            <button
                              onClick={() => handleRemoveSpam(rep.id, "user")}
                              className="px-3 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 border border-red-500/25 text-red-400 font-bold cursor-pointer"
                            >
                              Ban User
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Spam Flags */}
                  <div className="border-t border-white/5 pt-5">
                    <h3 className="font-bold text-white text-sm mb-3 flex items-center gap-1.5">
                      🛡️ Spam Filter Logs (AI Detected)
                    </h3>
                    {reports.spamFlags.length === 0 ? (
                      <div className="p-4 rounded-xl bg-slate-950/20 text-gray-550 italic">No suspicious logs detected by AI filter.</div>
                    ) : (
                      <div className="space-y-3">
                        {reports.spamFlags.map((flag) => (
                          <div key={flag.id} className="p-4 rounded-xl bg-slate-900/50 border border-white/5 flex items-center justify-between">
                            <div>
                              <h4 className="font-semibold text-gray-300 text-xs">{flag.item}</h4>
                              <p className="text-[10px] text-red-400 font-bold mt-1">AI Flag: {flag.trigger}</p>
                            </div>
                            <button
                              onClick={() => handleRemoveSpam(flag.id, "flag")}
                              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition cursor-pointer"
                              title="Dismiss Alert"
                            >
                              <FaTrash className="text-xs" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </main>

      {/* Rejection Modal Overlay */}
      <AnimatePresence>
        {showRejectDialog && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div onClick={() => setShowRejectDialog(false)} className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-md rounded-2xl bg-[#0e1222] border border-white/5 p-6 backdrop-blur-xl text-left"
            >
              <h3 className="font-bold text-white text-base mb-3">Reject Hackathon</h3>
              <p className="text-gray-400 text-xs leading-relaxed mb-4">
                Please enter a reason for rejecting this submission. The organizer will see this feedback.
              </p>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Reason (e.g. Invalid links, incomplete track descriptions...)"
                rows={3}
                className="w-full px-3 py-2 text-xs rounded-xl bg-[#050816]/70 border border-white/5 text-gray-200 placeholder-gray-600 focus:outline-none focus:border-cyan-500"
              />
              <div className="flex justify-end gap-2.5 mt-4">
                <button
                  onClick={() => setShowRejectDialog(false)}
                  className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 transition text-gray-450 text-xs"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRejectSubmit}
                  className="px-4 py-2 rounded-xl bg-red-650 hover:bg-red-500 text-white font-bold transition text-xs"
                >
                  Submit Rejection
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default AdminDashboard;
