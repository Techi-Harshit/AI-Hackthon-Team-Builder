import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaTrophy,
  FaUsers,
  FaChevronLeft,
  FaBookmark,
  FaShareAlt,
  FaClock,
  FaAward,
  FaLightbulb,
  FaGavel,
  FaQuestionCircle,
  FaUserTie,
  FaPaperPlane,
  FaExternalLinkAlt,
} from "react-icons/fa";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";
import Topbar from "../components/dashboard/Topbar";
import Sidebar from "../components/dashboard/Sidebar";
import AnimatedBackground from "../components/dashboard/AnimatedBackground";
import HackathonRegistrationWizard from "../components/hackathons/HackathonRegistrationWizard";

const tabItems = [
  { id: "overview", label: "Overview", icon: <FaAward /> },
  { id: "problems", label: "Problems", icon: <FaLightbulb /> },
  { id: "timeline", label: "Timeline", icon: <FaCalendarAlt /> },
  { id: "rules", label: "Rules & FAQ", icon: <FaGavel /> },
  { id: "judges", label: "Judges & Sponsors", icon: <FaUserTie /> },
];

function HackathonDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, fetchProfile } = useAuth();
  const [hack, setHack] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [skillGap, setSkillGap] = useState(null);
  const [showWizard, setShowWizard] = useState(false);
  const [comments, setComments] = useState([
    { author: "Amit Sharma", text: "Is there any age restriction for this hackathon?", time: "2 hours ago" },
    { author: "Pooja Patel", text: "Can we build Web3 projects under the Open Track?", time: "5 hours ago" }
  ]);
  const [newComment, setNewComment] = useState("");

  useEffect(() => {
    const fetchHackDetails = async () => {
      try {
        const res = await api.get(`/hackathons/${id}`);
        setHack(res.data);
        if (user && res.data.bookmarks) {
          setBookmarked(res.data.bookmarks.includes(user._id));
        }
      } catch (err) {
        console.error("Error loading hackathon details:", err);
      } finally {
        setLoading(false);
      }
    };

    const fetchSkillGap = async () => {
      try {
        const res = await api.get(`/ai/skill-gap`, { params: { hackathonId: id } });
        setSkillGap(res.data);
      } catch (err) {
        console.error("Error loading skill gaps:", err);
      }
    };

    fetchHackDetails();
    if (user) {
      fetchSkillGap();
    }
  }, [id, user]);

  const isRegistered = user?.registeredHackathons?.includes(id);

  const handleRegister = async () => {
    if (isRegistered || registering) return;
    setShowWizard(true);
  };

  const handleBookmark = async () => {
    try {
      const res = await api.post(`/hackathons/${id}/bookmark`);
      setBookmarked(res.data.isBookmarked);
    } catch (err) {
      console.error("Error bookmarking hackathon:", err);
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    alert("Hackathon link copied to clipboard!");
  };

  const postComment = (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    setComments((prev) => [
      ...prev,
      { author: user?.name || "Anonymous", text: newComment, time: "Just now" }
    ]);
    setNewComment("");
  };

  if (loading) {
    return (
      <div className="relative min-h-screen bg-[#050816] text-white flex items-center justify-center">
        <AnimatedBackground />
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400 font-bold">Loading Hackathon Details...</p>
        </div>
      </div>
    );
  }

  if (!hack) {
    return (
      <div className="relative min-h-screen bg-[#050816] text-white flex items-center justify-center">
        <AnimatedBackground />
        <div className="text-center">
          <p className="text-red-400 text-lg font-bold mb-4">Hackathon Not Found</p>
          <button onClick={() => navigate("/hackathons")} className="px-5 py-2.5 rounded-xl bg-slate-900 border border-white/10 hover:border-cyan-500 transition">
            Back to Catalog
          </button>
        </div>
      </div>
    );
  }

  // Calculate remaining registration time
  const timeRemaining = () => {
    const diff = new Date(hack.registrationDeadline || hack.endDate) - new Date();
    if (diff <= 0) return "Registration Closed";
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    return `${days}d ${hours}h left`;
  };

  return (
    <div className="relative min-h-screen bg-[#050816] text-white">
      <AnimatedBackground />
      <Sidebar activePage="Hackathons" />

      <main className="ml-72 relative z-10 min-h-screen text-left">
        <Topbar />

        <div className="p-8 max-w-7xl mx-auto">
          {/* Back Button */}
          <button
            onClick={() => navigate("/hackathons")}
            className="flex items-center gap-2 text-sm text-gray-400 hover:text-white mb-6 transition"
          >
            <FaChevronLeft />
            Back to Hackathons
          </button>

          {/* Hero Header Card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative overflow-hidden rounded-3xl bg-[#0e1222]/50 backdrop-blur-xl border border-white/5 p-8 mb-8"
          >
            <div className="absolute top-0 right-0 w-72 h-72 bg-[#3B82F6]/10 rounded-full blur-3xl" />

            <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-center justify-between relative z-10">
              <div className="flex gap-5 items-center">
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${hack.logoBg || "from-purple-600 to-blue-600"} flex items-center justify-center text-3xl font-bold shrink-0`}>
                  {hack.logo || "🏆"}
                </div>
                <div>
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <h1 className="text-2xl lg:text-3xl font-extrabold text-white leading-tight">
                      {hack.title}
                    </h1>
                    {hack.isFeatured && (
                      <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[9px] font-black uppercase">
                        Featured
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-cyan-400 font-bold mt-1">Organized by {hack.organizer}</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3">
                {hack.website && (
                  <motion.a
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.96 }}
                    href={hack.website}
                    target="_blank"
                    rel="noreferrer"
                    className="px-5 py-3 rounded-2xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-sm transition flex items-center gap-2 shadow-[0_0_15px_rgba(6,182,212,0.2)]"
                  >
                    Visit website <FaExternalLinkAlt className="text-xs" />
                  </motion.a>
                )}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleBookmark}
                  className={`p-3 rounded-2xl border text-sm transition flex items-center justify-center ${
                    bookmarked
                      ? "bg-pink-500/10 border-pink-500/30 text-pink-400"
                      : "bg-[#0e1222]/85 border-white/5 text-gray-400 hover:text-white"
                  }`}
                >
                  <FaBookmark />
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleShare}
                  className="p-3 rounded-2xl bg-[#0e1222]/85 border border-white/5 text-gray-400 hover:text-white text-sm transition"
                >
                  <FaShareAlt />
                </motion.button>

                <motion.button
                  whileHover={!isRegistered && !registering ? { scale: 1.04 } : {}}
                  whileTap={!isRegistered && !registering ? { scale: 0.96 } : {}}
                  onClick={handleRegister}
                  disabled={isRegistered || registering}
                  className={`px-6 py-3 rounded-2xl font-bold text-sm transition shadow-[0_0_15px_rgba(59,130,246,0.25)] ${
                    isRegistered
                      ? "bg-emerald-500/15 border border-emerald-500/35 text-emerald-400 cursor-default"
                      : "bg-[#FF8A00] border border-[#FF8A00] text-white hover:bg-[#ff9a22]"
                  }`}
                >
                  {isRegistered ? "✓ Registered" : registering ? "Registering..." : "Register Now"}
                </motion.button>
              </div>
            </div>

            {/* Quick Details Banner */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 pt-6 border-t border-white/5 text-slate-400">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-widest text-slate-500 block mb-1">Prize Pool</span>
                <span className="text-lg font-black text-emerald-400 font-mono">{hack.prizePool || "$10,000"}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold tracking-widest text-slate-500 block mb-1">Deadline</span>
                <span className="text-sm font-semibold text-white flex items-center gap-1.5 mt-1">
                  <FaClock className="text-cyan-400 text-xs" />
                  {timeRemaining()}
                </span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold tracking-widest text-slate-500 block mb-1">Format</span>
                <span className="text-sm font-semibold text-white flex items-center gap-1.5 mt-1">
                  <FaMapMarkerAlt className="text-cyan-400 text-xs" />
                  {hack.mode || "Online"}
                </span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold tracking-widest text-slate-500 block mb-1">Registrants</span>
                <span className="text-sm font-semibold text-white flex items-center gap-1.5 mt-1">
                  <FaUsers className="text-cyan-400 text-xs" />
                  {hack.participants || "0"} Joined
                </span>
              </div>
            </div>
          </motion.div>

          {/* Navigation Tabs */}
          <div className="flex gap-2 border-b border-white/5 pb-3 mb-6 overflow-x-auto scrollbar-hide">
            {tabItems.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition ${
                  activeTab === tab.id
                    ? "bg-[#3B82F6]/15 text-white border border-[#3B82F6]/30"
                    : "text-gray-400 hover:text-gray-200"
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Contents */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  transition={{ duration: 0.3 }}
                  className="rounded-3xl border border-white/5 bg-[#0e1222]/30 p-6 backdrop-blur-md min-h-[300px]"
                >
                  {/* Overview tab */}
                  {activeTab === "overview" && (
                    <div>
                      <h2 className="text-xl font-bold text-white mb-4">About Hackathon</h2>
                      <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-line mb-6">
                        {hack.description}
                      </p>

                      <h3 className="text-xs uppercase font-extrabold text-slate-500 tracking-wider mb-2">Required Skills</h3>
                      <div className="flex flex-wrap gap-2 mb-6">
                        {(hack.requiredSkills || ["React", "Node.js", "MongoDB", "AI/ML"]).map((skill, i) => (
                          <span key={i} className="px-3 py-1 rounded-full text-xs font-semibold bg-[#3B82F6]/10 text-cyan-400 border border-[#3B82F6]/20 uppercase">
                            {skill}
                          </span>
                        ))}
                      </div>

                      <h3 className="text-xs uppercase font-extrabold text-slate-500 tracking-wider mb-2">Eligibility Criteria</h3>
                      <p className="text-gray-400 text-xs leading-normal">
                        {hack.eligibility || "All developers, designers, students, and engineers globally are eligible to participate."}
                      </p>
                    </div>
                  )}

                  {/* Problem Statements tab */}
                  {activeTab === "problems" && (
                    <div>
                      <h2 className="text-xl font-bold text-white mb-4">Problem Statements & Tracks</h2>
                      {(hack.problemStatements && hack.problemStatements.length > 0) ? (
                        <div className="space-y-4">
                          {hack.problemStatements.map((track, i) => (
                            <div key={i} className="p-4 rounded-2xl bg-[#050816]/40 border border-white/5">
                              <h3 className="font-extrabold text-cyan-300 text-sm mb-1.5">{track.title}</h3>
                              <p className="text-xs text-gray-400 leading-relaxed">{track.description}</p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="p-4 rounded-2xl bg-[#050816]/40 border border-white/5 text-gray-400 text-xs">
                          📝 Open Track: Developers can build any software solution solving real-world challenges in Education, Healthcare, Sustainability, or Fintech.
                        </div>
                      )}
                    </div>
                  )}

                  {/* Timeline tab */}
                  {activeTab === "timeline" && (
                    <div>
                      <h2 className="text-xl font-bold text-white mb-6">Schedule & Timeline</h2>
                      <div className="relative border-l border-white/5 pl-6 ml-3 space-y-6">
                        {(hack.timeline && hack.timeline.length > 0) ? (
                          hack.timeline.map((event, i) => (
                            <div key={i} className="relative">
                              <span className="absolute -left-[30px] top-1.5 w-3 h-3 rounded-full bg-cyan-500 ring-4 ring-[#050816]" />
                              <h3 className="font-bold text-white text-sm">{event.title}</h3>
                              <span className="text-[10px] text-cyan-400 font-bold block mt-0.5">
                                {new Date(event.date).toLocaleDateString()}
                              </span>
                              <p className="text-xs text-gray-400 mt-1">{event.description}</p>
                            </div>
                          ))
                        ) : (
                          <>
                            <div className="relative">
                              <span className="absolute -left-[30px] top-1.5 w-3 h-3 rounded-full bg-cyan-500 ring-4 ring-[#050816]" />
                              <h3 className="font-bold text-white text-sm">Registration Starts</h3>
                              <span className="text-[10px] text-cyan-400 font-bold block mt-0.5">Today</span>
                              <p className="text-xs text-gray-400 mt-1">Submit your team and bio details to join the event pool.</p>
                            </div>
                            <div className="relative">
                              <span className="absolute -left-[30px] top-1.5 w-3 h-3 rounded-full bg-amber-500 ring-4 ring-[#050816]" />
                              <h3 className="font-bold text-white text-sm">Hacking Commences</h3>
                              <span className="text-[10px] text-amber-400 font-bold block mt-0.5">
                                {new Date(hack.startDate).toLocaleDateString()}
                              </span>
                              <p className="text-xs text-gray-400 mt-1">Hacking officially begins! Mentors session starts in chat lobbies.</p>
                            </div>
                            <div className="relative">
                              <span className="absolute -left-[30px] top-1.5 w-3 h-3 rounded-full bg-red-500 ring-4 ring-[#050816]" />
                              <h3 className="font-bold text-white text-sm">Submission Deadline</h3>
                              <span className="text-[10px] text-red-400 font-bold block mt-0.5">
                                {new Date(hack.endDate).toLocaleDateString()}
                              </span>
                              <p className="text-xs text-gray-400 mt-1">Submit video pitches and source code repository links before deadline.</p>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Rules & FAQ tab */}
                  {activeTab === "rules" && (
                    <div className="space-y-6">
                      <div>
                        <h2 className="text-xl font-bold text-white mb-3">Event Rules</h2>
                        <ul className="list-disc pl-5 space-y-2 text-xs text-gray-300">
                          {hack.rules && hack.rules.length > 0 ? (
                            hack.rules.map((rule, idx) => <li key={idx}>{rule}</li>)
                          ) : (
                            <>
                              <li>Teams must consist of 1 to 4 members.</li>
                              <li>All code must be written during the hacking period. Plagiarism leads to disqualification.</li>
                              <li>API libraries and open-source packages are permitted.</li>
                            </>
                          )}
                        </ul>
                      </div>
                      <div className="border-t border-white/5 pt-5">
                        <h2 className="text-xl font-bold text-white mb-3">Frequently Asked Questions</h2>
                        <div className="space-y-3">
                          {hack.faqs && hack.faqs.length > 0 ? (
                            hack.faqs.map((faq, idx) => (
                              <div key={idx} className="p-3.5 rounded-xl bg-[#050816]/40 border border-white/5">
                                <h4 className="font-bold text-white text-xs mb-1">Q: {faq.question}</h4>
                                <p className="text-[11px] text-gray-400">A: {faq.answer}</p>
                              </div>
                            ))
                          ) : (
                            <>
                              <div className="p-3.5 rounded-xl bg-[#050816]/40 border border-white/5">
                                <h4 className="font-bold text-white text-xs mb-1">Q: Is participation free?</h4>
                                <p className="text-[11px] text-gray-400">A: Yes! Registration and participation are completely free.</p>
                              </div>
                              <div className="p-3.5 rounded-xl bg-[#050816]/40 border border-white/5">
                                <h4 className="font-bold text-white text-xs mb-1">Q: Can I participate individually?</h4>
                                <p className="text-[11px] text-gray-400">A: Yes, individuals can register and pitch alone or find teammates.</p>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Judges & Sponsors tab */}
                  {activeTab === "judges" && (
                    <div className="space-y-6">
                      <div>
                        <h2 className="text-xl font-bold text-white mb-4">Judges Panel</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {hack.judges && hack.judges.length > 0 ? (
                            hack.judges.map((j, idx) => (
                              <div key={idx} className="flex items-center gap-3 p-3 rounded-2xl bg-[#050816]/40 border border-white/5">
                                <img src={j.avatar || "https://i.pravatar.cc/100?img=12"} alt="" className="w-10 h-10 rounded-full object-cover" />
                                <div>
                                  <h4 className="font-bold text-white text-xs">{j.name}</h4>
                                  <span className="text-[10px] text-cyan-400 font-bold block">{j.role}</span>
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="col-span-2 text-gray-400 text-xs">
                              Panel members will be revealed closer to the kick-off date.
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="border-t border-white/5 pt-5">
                        <h2 className="text-xl font-bold text-white mb-4">Sponsors</h2>
                        <div className="flex flex-wrap gap-4 items-center">
                          {hack.sponsors && hack.sponsors.length > 0 ? (
                            hack.sponsors.map((s, idx) => (
                              <div key={idx} className="px-4 py-2.5 rounded-xl bg-[#050816]/50 border border-white/5 flex items-center justify-center font-bold text-xs text-slate-300">
                                {s.name} <span className="ml-1.5 text-[8px] bg-amber-500/10 text-amber-400 border border-amber-500/20 px-1 py-0.5 rounded">{s.tier}</span>
                              </div>
                            ))
                          ) : (
                            <div className="text-gray-400 text-xs">
                              Global partners details will be listed soon.
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Right column: Discussion Board */}
            <div className="col-span-1 space-y-6">
              {/* Eligibility Info Card */}
              <div className="rounded-3xl border border-white/5 bg-[#0e1222]/30 p-6 backdrop-blur-md text-left space-y-4">
                <h3 className="font-bold text-white text-base mb-2">🎯 Eligibility</h3>
                <div className="space-y-3 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-500 font-bold uppercase text-[9px] w-24">Type:</span>
                    <span className="text-white font-semibold">
                      {hack.hackathonType === "Student" && "🎓 Student Event"}
                      {hack.hackathonType === "College" && "🏫 College Event"}
                      {hack.hackathonType === "Community" && "🌐 Community Event"}
                      {(hack.hackathonType === "Open" || !hack.hackathonType) && "🌍 Open Event"}
                    </span>
                  </div>

                  {hack.hackathonType === "Student" && (
                    <>
                      <div className="flex items-center gap-2">
                        <span className="text-gray-500 font-bold uppercase text-[9px] w-24">Cross-College:</span>
                        <span className="text-white font-semibold">{hack.isCrossCollegeAllowed ? "Allowed" : "Not Allowed"}</span>
                      </div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-gray-500 font-bold uppercase text-[9px] w-24">Years Eligible:</span>
                        <span className="text-white font-semibold">{(hack.eligibleYears || []).join(", ")}</span>
                      </div>
                    </>
                  )}

                  {hack.hackathonType === "College" && (
                    <div className="flex flex-col gap-1">
                      <span className="text-gray-500 font-bold uppercase text-[9px]">Allowed Colleges:</span>
                      <div className="flex flex-wrap gap-1.5 mt-1">
                        {(hack.allowedColleges || []).map((c, i) => (
                          <span key={i} className="px-2 py-0.5 rounded bg-slate-900 border border-white/5 text-gray-300 text-[10px]">
                            {c}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {hack.hackathonType === "Community" && (
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500 font-bold uppercase text-[9px] w-24">Community:</span>
                      <span className="text-cyan-400 font-semibold">{hack.communityName || "Any"}</span>
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    <span className="text-gray-500 font-bold uppercase text-[9px] w-24">Team Size:</span>
                    <span className="text-white font-semibold">{hack.teamSizeMin || 1} - {hack.teamSizeMax || 4} Members</span>
                  </div>
                </div>
              </div>

              {/* AI Diagnostic Check Card */}
              {skillGap && (
                <div className="rounded-3xl border border-white/5 bg-[#0e1222]/30 p-6 backdrop-blur-md text-left space-y-4">
                  <div className="flex justify-between items-center mb-1">
                    <h3 className="font-bold text-white text-base">🤖 AI Matching</h3>
                    <span className={`px-2 py-0.5 rounded font-mono font-bold text-xs ${
                      skillGap.compatibility > 75 ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                    }`}>
                      {skillGap.compatibility}% Match
                    </span>
                  </div>

                  <div className="text-xs space-y-3">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-gray-500 font-bold uppercase text-[9px] block mb-1">Required Skills</span>
                        <div className="flex flex-wrap gap-1">
                          {(skillGap.requiredSkills || []).map((s, i) => (
                            <span key={i} className="px-1.5 py-0.5 rounded bg-white/5 text-gray-300 text-[9px]">{s}</span>
                          ))}
                        </div>
                      </div>
                      <div>
                        <span className="text-gray-500 font-bold uppercase text-[9px] block mb-1">Your Skills</span>
                        <div className="flex flex-wrap gap-1">
                          {(skillGap.currentSkills || []).slice(0, 5).map((s, i) => (
                            <span key={i} className="px-1.5 py-0.5 rounded bg-[#3B82F6]/10 text-cyan-400 text-[9px]">{s}</span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {skillGap.missingSkills && skillGap.missingSkills.length > 0 && (
                      <div>
                        <span className="text-gray-500 font-bold uppercase text-[9px] block mb-1">Missing Competencies</span>
                        <div className="flex flex-wrap gap-1">
                          {skillGap.missingSkills.map((s, i) => (
                            <span key={i} className="px-1.5 py-0.5 rounded bg-red-500/10 text-red-400 text-[9px]">{s}</span>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="p-3 rounded-xl bg-cyan-500/5 border border-cyan-500/10 text-cyan-300 leading-normal text-[11px]">
                      {skillGap.recommendation}
                    </div>
                  </div>
                </div>
              )}

              <div className="rounded-3xl border border-white/5 bg-[#0e1222]/30 p-6 backdrop-blur-md">
                <h3 className="font-bold text-white text-base mb-4 flex items-center gap-2">
                  <span>💬</span> Lobbies & Discussion
                </h3>

                <form onSubmit={postComment} className="mb-5 flex gap-2">
                  <input
                    type="text"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Ask organizer a question..."
                    className="flex-1 px-3 py-2 text-xs rounded-xl bg-[#050816]/70 border border-white/5 text-gray-200 placeholder-gray-500 focus:outline-none focus:border-cyan-500 transition"
                  />
                  <button type="submit" className="p-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 transition text-white cursor-pointer">
                    <FaPaperPlane className="text-xs" />
                  </button>
                </form>

                <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                  {comments.map((c, i) => (
                    <div key={i} className="p-3 rounded-2xl bg-[#050816]/40 border border-white/5 text-xs text-left">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-bold text-slate-350">{c.author}</span>
                        <span className="text-[9px] text-gray-500">{c.time}</span>
                      </div>
                      <p className="text-gray-400 leading-normal text-[11px]">{c.text}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Organizer Profile Contact Card */}
              <div className="rounded-3xl border border-white/5 bg-[#0e1222]/30 p-6 backdrop-blur-md text-left">
                <h3 className="font-bold text-white text-base mb-3">Host Information</h3>
                <div className="space-y-2 text-xs text-gray-400">
                  <p><span className="text-gray-500 font-bold block mb-0.5">SUPPORT EMAIL</span> {hack.contactEmail || "contact@org.hackathon"}</p>
                  {hack.website && (
                    <p><span className="text-gray-500 font-bold block mb-0.5">WEBSITE</span> <a href={hack.website} target="_blank" rel="noreferrer" className="text-cyan-400 hover:underline">{hack.website}</a></p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <AnimatePresence>
        {showWizard && (
          <HackathonRegistrationWizard
            hackathon={hack}
            onClose={() => setShowWizard(false)}
            onSuccess={() => {
              fetchProfile();
              setShowWizard(false);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

export default HackathonDetails;
