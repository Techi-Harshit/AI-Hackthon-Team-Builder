import { useEffect, useMemo, useState, useRef, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import {
  FaArrowLeft,
  FaBolt,
  FaBullseye,
  FaChartLine,
  FaCheckCircle,
  FaCode,
  FaLightbulb,
  FaPaperPlane,
  FaRobot,
  FaSearch,
  FaShieldAlt,
  FaUserPlus,
  FaUsers,
  FaCloudUploadAlt,
  FaRocket,
  FaGraduationCap,
  FaBook,
  FaBriefcase,
  FaTimes,
  FaPlus,
  FaExclamationTriangle,
  FaStar,
  FaCompass,
  FaFileAlt,
  FaDatabase,
  FaLink,
  FaCopy,
  FaDownload,
  FaSave,
} from "react-icons/fa";
import PageLayout from "../components/dashboard/PageLayout";
import api from "../api/axios";
import { getMatchmakingInsights, inviteCandidate } from "../services/recommendationService";
import { useAuth } from "../context/AuthContext";

/* ─── Helpers ─── */
const scoreColor = (score = 0) => {
  if (score >= 80) return "text-emerald-400 border-emerald-500/20 bg-emerald-500/10";
  if (score >= 60) return "text-cyan-400 border-cyan-500/20 bg-cyan-500/10";
  if (score >= 40) return "text-amber-400 border-amber-500/20 bg-amber-500/10";
  return "text-red-400 border-red-500/20 bg-red-500/10";
};

const formatAIText = (text) => {
  if (!text) return null;
  return text.split("\n").map((line, i) => {
    // Bold
    line = line.replace(/\*\*(.*?)\*\*/g, '<strong class="text-white font-bold">$1</strong>');
    // Inline code
    line = line.replace(/`([^`]+)`/g, '<code class="px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-300 text-[11px] font-mono">$1</code>');
    // Bullet
    if (line.trim().startsWith("- ") || line.trim().startsWith("* ")) {
      return (
        <p key={i} className="flex gap-2 text-sm text-slate-300 leading-relaxed pl-2 text-left">
          <span className="text-cyan-400 mt-1 shrink-0">•</span>
          <span dangerouslySetInnerHTML={{ __html: line.replace(/^[\s]*[-*]\s/, "") }} />
        </p>
      );
    }
    // Numbered
    const numMatch = line.match(/^(\d+)\.\s(.*)/);
    if (numMatch) {
      return (
        <p key={i} className="flex gap-2 text-sm text-slate-300 leading-relaxed pl-2 text-left">
          <span className="text-amber-400 font-black shrink-0">{numMatch[1]}.</span>
          <span dangerouslySetInnerHTML={{ __html: numMatch[2] }} />
        </p>
      );
    }
    // Heading
    if (line.trim().startsWith("###")) {
      return <h4 key={i} className="text-base font-black text-white mt-3 mb-1 text-left">{line.replace(/^#+\s/, "")}</h4>;
    }
    if (line.trim().startsWith("##")) {
      return <h3 key={i} className="text-lg font-black text-white mt-4 mb-1 text-left">{line.replace(/^#+\s/, "")}</h3>;
    }
    if (line.trim() === "") return <br key={i} />;
    return <p key={i} className="text-sm text-slate-300 leading-relaxed text-left" dangerouslySetInnerHTML={{ __html: line }} />;
  });
};

/* ─── Circular Progress ─── */
function CircularScore({ score = 0, size = 120, strokeWidth = 8, label = "Score", displayValue }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const color = score >= 80 ? "#10b981" : score >= 60 ? "#06b6d4" : score >= 40 ? "#f59e0b" : "#ef4444";

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} strokeWidth={strokeWidth} fill="none" stroke="rgba(255,255,255,0.05)" />
        <motion.circle
          cx={size / 2} cy={size / 2} r={radius} strokeWidth={strokeWidth} fill="none"
          stroke={color} strokeLinecap="round"
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          style={{ strokeDasharray: circumference }}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-2xl font-black text-white">{displayValue !== undefined ? displayValue : score}</span>
        <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">{label}</span>
      </div>
    </div>
  );
}

/* ─── Original Matchmaking UI Components ─── */
function ScoreCard({ title, value, subtitle, icon }) {
  return (
    <div className={`p-5 rounded-2xl border ${scoreColor(value)} text-left`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[10px] uppercase tracking-wider font-black opacity-70">{title}</p>
          <h3 className="text-3xl font-black text-white mt-1">{value || 0}%</h3>
          <p className="text-xs text-slate-400 mt-1 leading-relaxed">{subtitle}</p>
        </div>
        <div className="p-3 rounded-xl bg-white/5 text-lg">{icon}</div>
      </div>
    </div>
  );
}

function Pill({ children, tone = "cyan" }) {
  const tones = {
    cyan: "bg-cyan-500/10 text-cyan-300 border-cyan-500/15",
    green: "bg-emerald-500/10 text-emerald-300 border-emerald-500/15",
    amber: "bg-amber-500/10 text-amber-300 border-amber-500/15",
    slate: "bg-white/5 text-slate-300 border-white/10",
  };
  return (
    <span className={`px-2 py-1 rounded-lg border text-[10px] font-bold ${tones[tone] || tones.cyan}`}>
      {children}
    </span>
  );
}

function Section({ title, subtitle, icon, children, action }) {
  return (
    <section className="p-6 rounded-2xl bg-[#0e1222]/50 border border-white/5 backdrop-blur-xl text-left">
      <div className="flex items-start justify-between gap-4 mb-5">
        <div>
          <h2 className="text-base font-black text-white flex items-center gap-2">
            <span className="text-cyan-400">{icon}</span>
            {title}
          </h2>
          {subtitle && <p className="text-xs text-slate-400 mt-1 leading-relaxed">{subtitle}</p>}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

function TeamCard({ team, onJoin }) {
  return (
    <motion.div
      whileHover={{ y: -3 }}
      className="p-5 rounded-2xl bg-[#030712]/55 border border-white/5 hover:border-cyan-500/25 transition flex flex-col gap-4"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-black text-white">{team.teamName}</h3>
          <p className="text-xs text-slate-500 mt-1 line-clamp-2">{team.description || "Open team for this hackathon."}</p>
        </div>
        <div className={`px-3 py-2 rounded-xl border text-sm font-black ${scoreColor(team.matchScore)}`}>
          {team.matchScore}%
        </div>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {(team.requiredSkills || []).slice(0, 5).map((skill) => (
          <Pill key={skill} tone="slate">{skill}</Pill>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-400">
        <div className="p-3 rounded-xl bg-white/5">
          <span className="block text-slate-500 font-bold">Slots</span>
          <span className="text-white font-black">{team.membersCount}/{team.maxMembers}</span>
        </div>
        <div className="p-3 rounded-xl bg-white/5">
          <span className="block text-slate-500 font-bold">Role Need</span>
          <span className="text-white font-black">{team.requiredRole || "Flexible"}</span>
        </div>
      </div>
      <div className="space-y-1">
        {(team.whyMatches || []).slice(0, 3).map((reason) => (
          <p key={reason} className="text-[11px] text-slate-400 flex gap-2">
            <FaCheckCircle className="text-emerald-400 mt-0.5 shrink-0" />
            {reason}
          </p>
        ))}
      </div>
      <button
        onClick={() => onJoin(team)}
        className="mt-auto py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-black flex items-center justify-center gap-2 transition"
      >
        <FaPaperPlane /> Request to Join
      </button>
    </motion.div>
  );
}

function MemberCard({ member, hackathonId }) {
  const [inviting, setInviting] = useState(false);

  const handleInvite = async () => {
    try {
      setInviting(true);
      await inviteCandidate(hackathonId, member.id);
      toast.success(`Invite sent to ${member.name}`);
    } catch (error) {
      toast.error(error.response?.data?.message || "Could not send invite");
    } finally {
      setInviting(false);
    }
  };

  return (
    <motion.div
      whileHover={{ y: -3 }}
      className="p-5 rounded-2xl bg-[#030712]/55 border border-white/5 hover:border-purple-500/25 transition flex flex-col gap-4"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex gap-3 min-w-0">
          <img
            src={member.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${member.name || "member"}`}
            alt={member.name}
            className="w-11 h-11 rounded-xl bg-[#0e1222] border border-white/5 object-cover"
          />
          <div className="min-w-0">
            <h3 className="text-sm font-black text-white truncate">{member.name}</h3>
            <p className="text-[11px] text-cyan-400 font-bold">{member.preferredRole}</p>
            <p className="text-[10px] text-slate-500 truncate">{member.college || "Independent builder"}</p>
          </div>
        </div>
        <div className={`px-3 py-2 rounded-xl border text-sm font-black ${scoreColor(member.compatibilityScore)}`}>
          {member.compatibilityScore}%
        </div>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {(member.matchedSkills || []).slice(0, 4).map((skill) => (
          <Pill key={skill} tone="green">{skill}</Pill>
        ))}
        {(member.matchedSkills || []).length === 0 && <Pill tone="amber">Upskill candidate</Pill>}
      </div>
      <div className="space-y-1">
        {(member.whyMatches || []).slice(0, 3).map((reason) => (
          <p key={reason} className="text-[11px] text-slate-400 flex gap-2">
            <FaCheckCircle className="text-emerald-400 mt-0.5 shrink-0" />
            {reason}
          </p>
        ))}
      </div>
      <button
        onClick={handleInvite}
        disabled={inviting}
        className="mt-auto py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-60 text-white text-xs font-black flex items-center justify-center gap-2 transition"
      >
        <FaUserPlus /> {inviting ? "Inviting..." : "Invite Member"}
      </button>
    </motion.div>
  );
}

function ProjectCard({ project }) {
  return (
    <div className="p-5 rounded-2xl bg-[#030712]/55 border border-white/5 text-left">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-black text-white">{project.title}</h3>
          <p className="text-xs text-slate-400 mt-2 leading-relaxed">{project.whyThisFits}</p>
        </div>
        <div className={`px-3 py-2 rounded-xl border text-sm font-black ${scoreColor(project.fitScore)}`}>
          {project.fitScore}%
        </div>
      </div>
      <div className="flex flex-wrap gap-1.5 mt-4">
        {(project.techStack || []).map((tech) => (
          <Pill key={tech} tone="cyan">{tech}</Pill>
        ))}
      </div>
      <div className="mt-4 space-y-1">
        {(project.roadmap || []).map((step, index) => (
          <p key={step} className="text-[11px] text-slate-400">
            <span className="text-cyan-400 font-black">{index + 1}.</span> {step}
          </p>
        ))}
      </div>
      <p className="mt-4 text-[11px] text-amber-300 bg-amber-500/10 border border-amber-500/15 rounded-xl p-3">
        Pitch angle: {project.pitchAngle}
      </p>
    </div>
  );
}

/* ─── Static config arrays ─── */
const QUICK_PROMPTS = [
  "How to win a hackathon?",
  "Best tech stack for beginners?",
  "How to form a great team?",
  "Tips for a winning pitch?",
  "How to manage time in 48hrs?",
  "Top mistakes to avoid?",
];

const CATEGORIES = [
  { id: "general", label: "General Questions", icon: <FaCompass /> },
  { id: "guidance", label: "Hackathon Guidance", icon: <FaGraduationCap /> },
  { id: "ideas", label: "Project Ideas", icon: <FaLightbulb /> },
  { id: "roadmap", label: "Learning Roadmap", icon: <FaBook /> },
  { id: "resume", label: "Resume Review", icon: <FaBriefcase /> },
];

const DOMAINS = [
  "HealthTech", "FinTech", "EdTech", "AI/ML", "Web3",
  "Gaming", "SaaS", "Social Impact", "IoT", "Cybersecurity",
];

/* ─── Main Component ─── */
export default function AIRecommendations() {
  const { hackathonId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState(hackathonId ? "matchmaking" : "ask");

  // Matchmaking states
  const [insights, setInsights] = useState(null);
  const [insightsLoading, setInsightsLoading] = useState(Boolean(hackathonId));
  const [insightsError, setInsightsError] = useState("");
  const [search, setSearch] = useState("");

  // Ask AI state
  const [activeCategory, setActiveCategory] = useState("general");
  const [question, setQuestion] = useState("");
  const [askLoading, setAskLoading] = useState(false);
  const [messages, setMessages] = useState([]);
  const messagesEndRef = useRef(null);

  // Resume state
  const [resumeFile, setResumeFile] = useState(null);
  const [resumeLoading, setResumeLoading] = useState(false);
  const [resumeResult, setResumeResult] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);
  const [analysisStep, setAnalysisStep] = useState(0);

  const analysisSteps = [
    "Loading Hackathon Details....",
    "Reading Required Skills....",
    "Reading Hackathon Tracks....",
    "Reading Evaluation Criteria....",
    "Resume Uploaded Successfully....",
    "Extracting Resume Data....",
    "Finding Technical Skills....",
    "Finding Projects....",
    "Finding ATS Keywords....",
    "Finding Missing Skills....",
    "Calculating Hackathon Compatibility....",
    "Calculating Winning Probability....",
    "Calculating Team Contribution....",
    "Finding Best Suitable Role....",
    "Finding Best Suitable Track....",
    "Generating AI Recommendations....",
    "Building Resume DNA....",
    "Building Skill Galaxy....",
    "Analysis Completed Successfully."
  ];

  // Ideas state
  const [ideaMode, setIdeaMode] = useState("skills");
  const [customSkills, setCustomSkills] = useState([]);
  const [skillInput, setSkillInput] = useState("");
  const [selectedDomain, setSelectedDomain] = useState("AI/ML");
  const [hackathonInput, setHackathonInput] = useState("");
  const [selectedTrack, setSelectedTrack] = useState("");
  const [customTrack, setCustomTrack] = useState("");
  
  const recommendedTracks = useMemo(() => {
    if (!hackathonId || !insights?.hackathon) return [];
    const theme = (insights.hackathon.theme || "").toLowerCase();
    const title = (insights.hackathon.title || "").toLowerCase();
    
    if (theme.includes("sustainability") || theme.includes("climate") || theme.includes("green") || title.includes("sustain") || title.includes("green")) {
      return ["Green Tech", "Renewable Energy", "Smart Waste Management", "Carbon Tracking", "Sustainable Farming"];
    }
    if (theme.includes("health") || theme.includes("medical") || title.includes("health") || title.includes("medical")) {
      return ["AI in Healthcare", "Telemedicine", "Mental Health", "Hospital Management", "Medical Analytics"];
    }
    if (theme.includes("web3") || theme.includes("blockchain") || theme.includes("crypto") || title.includes("eth") || title.includes("web3")) {
      return ["Blockchain", "NFTs", "DAOs", "Smart Contracts", "DeFi", "Payments"];
    }
    if (theme.includes("ai") || theme.includes("intelligence") || theme.includes("machine") || title.includes("ai ") || title.includes("innovation")) {
      return ["Generative AI", "AI Agents", "NLP", "Computer Vision", "Robotics"];
    }
    if (theme.includes("security") || theme.includes("cyber") || title.includes("security") || title.includes("cyber")) {
      return ["Cloud Audits", "Penetration Testing", "Zero Trust Architecture", "Threat Detection", "Cryptography"];
    }
    if (theme.includes("space") || theme.includes("universe") || theme.includes("ar") || theme.includes("vr") || title.includes("universe") || title.includes("virtual")) {
      return ["Metaspace Systems", "AR/VR Navigation", "Simulated Environments", "Spatial Audio", "Haptic Integration"];
    }
    return ["Web Development", "Mobile Applications", "AI Automation", "Data Science", "Open Innovation"];
  }, [hackathonId, insights]);

  const [ideas, setIdeas] = useState([]);
  const [ideasLoading, setIdeasLoading] = useState(false);
  const [selectedBlueprint, setSelectedBlueprint] = useState(null);
  const [savedIdeas, setSavedIdeas] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("saved_ideas") || "[]");
    } catch {
      return [];
    }
  });
  const [bookmarkedIdeas, setBookmarkedIdeas] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("bookmarked_ideas") || "[]");
    } catch {
      return [];
    }
  });

  // Auto-generate welcome messages
  useEffect(() => {
    if (hackathonId && insights?.hackathon) {
      setMessages([
        {
          sender: "ai",
          text: `Hello ${user?.name || "Builder"}! I am your AI Copilot for **${insights.hackathon.title}**.

I have loaded your complete profile, teammates, and project registration details.

Ask me anything like:
- **"How can we win this hackathon?"** (Sprint layouts, judging criteria, presentation strategy)
- **"Suggest a project idea"** (Based strictly on theme, statements, and team skills)
- **"What tech stack should we use?"** (Specific Frontend, Backend, Database, AI recommendations)
- **"How should we divide our work?"** (Structured Daily Sprints tailored to team roles)`
        }
      ]);
    } else {
      setMessages([
        {
          sender: "ai",
          text: `Hello ${user?.name || "Builder"}! I am your General AI Copilot.

Ask me any general questions about hackathon preparation, choosing technical roadmaps, or resume guidelines!`
        }
      ]);
    }
  }, [hackathonId, insights, user]);

  // Auto-scroll logic
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, askLoading]);

  const [allHackathons, setAllHackathons] = useState([]);

  const fetchHackathons = async () => {
    try {
      const res = await api.get("/ai/user-hackathons");
      const list = res.data.hackathons || res.data || [];
      setAllHackathons(list);
    } catch (err) {
      console.error("Error fetching registered hackathons:", err);
    }
  };

  const handleToggleInterest = async () => {
    if (!hackathonId) return;
    try {
      const { data } = await api.post(`/hackathons/${hackathonId}/interest`);
      if (data.success) {
        toast.success(data.isInterested ? "Marked as Interested!" : "Removed from Interested list");
        fetchHackathons();
        loadInsights();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not toggle interest status");
    }
  };

  useEffect(() => {
    fetchHackathons();
  }, [user]);

  const loadInsights = async () => {
    if (!hackathonId) {
      setInsights(null);
      return;
    }
    try {
      setInsightsLoading(true);
      setInsightsError("");
      const data = await getMatchmakingInsights(hackathonId);
      setInsights(data);
    } catch (err) {
      setInsightsError(err.response?.data?.message || "Unable to load AI matchmaking insights.");
    } finally {
      setInsightsLoading(false);
    }
  };

  useEffect(() => {
    loadInsights();
    setResumeResult(null);
    setResumeFile(null);
    if (hackathonId) {
      setActiveTab("matchmaking");
    } else {
      setActiveTab("ask");
    }
  }, [hackathonId]);

  const currentHackathon = useMemo(() => {
    return allHackathons.find(h => String(h._id || h.id) === String(hackathonId));
  }, [allHackathons, hackathonId]);

  const filteredMembers = useMemo(() => {
    const list = insights?.recommendedMembers || [];
    const term = search.trim().toLowerCase();
    if (!term) return list;
    return list.filter((member) =>
      [member.name, member.preferredRole, member.college, ...(member.matchedSkills || [])]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(term))
    );
  }, [insights, search]);

  const handleJoinTeam = async (team) => {
    try {
      await api.post("/applications", {
        teamId: team.id,
        message: `I am interested in joining ${team.teamName} for this hackathon.`
      });
      toast.success(`Join request sent to ${team.teamName}`);
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not send join request");
    }
  };

  /* ─── Ask AI ─── */
  const handleAsk = async () => {
    const userPrompt = question.trim();
    if (!userPrompt) return toast.error("Please enter a question");
    
    const userMsg = { sender: "user", text: userPrompt };
    setMessages((prev) => [...prev, userMsg]);
    setQuestion("");
    
    try {
      setAskLoading(true);
      const { data } = await api.post("/ai/ask", { question: userPrompt, category: activeCategory, hackathonId });
      const aiMsg = { sender: "ai", text: data.response };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      const errMsg = { sender: "ai", text: `Sorry, I encountered an error: ${err.response?.data?.message || err.message || "Request failed"}` };
      setMessages((prev) => [...prev, errMsg]);
    } finally {
      setAskLoading(false);
    }
  };

  /* ─── Resume Review ─── */
  const handleFileDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer?.files?.[0] || e.target?.files?.[0];
    if (file && file.type === "application/pdf") {
      setResumeFile(file);
      setResumeResult(null);
    } else {
      toast.error("Please upload a PDF file");
    }
  }, []);

  const handleResumeUpload = async () => {
    if (!resumeFile) return toast.error("Please select a PDF file first");
    
    let intervalId;
    try {
      setResumeLoading(true);
      setResumeResult(null);
      setAnalysisStep(0);
      
      intervalId = setInterval(() => {
        setAnalysisStep((prev) => {
          if (prev < 17) return prev + 1;
          return prev;
        });
      }, 700);

      const formData = new FormData();
      formData.append("resume", resumeFile);
      if (hackathonId) {
        formData.append("hackathonId", hackathonId);
      }
      const { data } = await api.post("/ai/resume-review", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      
      clearInterval(intervalId);
      setAnalysisStep(18); // "Analysis Completed Successfully."
      
      setTimeout(() => {
        setResumeResult(data);
        setResumeLoading(false);
      }, 800);

    } catch (err) {
      if (intervalId) clearInterval(intervalId);
      setResumeLoading(false);
      const msg = err.response?.data?.message || "Something went wrong while analyzing your resume. Please try again.";
      toast.error(msg, { duration: 5000, style: { background: '#1e293b', color: '#f1f5f9', border: '1px solid rgba(239,68,68,0.2)' } });
    }
  };

  const handleCopyReport = () => {
    if (!resumeResult) return;
    const reportText = `RESUME AI AUDIT REPORT
====================================
File: ${resumeFile?.name || "N/A"}
Generated: ${new Date().toLocaleString()}

SCORES OVERVIEW
- Overall Quality Score: ${resumeResult.overallScore || 0}/100
- ATS Matching Score: ${resumeResult.atsScore || 0}/100
- Placement Readiness Score: ${resumeResult.placementReadinessScore || 0}/10
- Hackathon Readiness Score: ${resumeResult.hackathonScore || 0}/100
- DSA Readiness Score: ${resumeResult.dsaReadinessScore || 0}/10
- Communication Score: ${resumeResult.communicationScore || 0}/10
- Profile Strength Score: ${resumeResult.profileStrengthScore || 0}/100

TECHNICAL SKILLS RATING
- Frontend: ${resumeResult.techSkillsAnalysis?.frontend || 0}%
- Backend: ${resumeResult.techSkillsAnalysis?.backend || 0}%
- AI/ML: ${resumeResult.techSkillsAnalysis?.aiml || 0}%
- Database: ${resumeResult.techSkillsAnalysis?.database || 0}%
- Deployment: ${resumeResult.techSkillsAnalysis?.deployment || 0}%
- Problem Solving: ${resumeResult.techSkillsAnalysis?.problemSolving || 0}%

STRENGTHS
${(resumeResult.strengths || []).map(s => `- ${s}`).join("\n") || "No major strengths identified."}

WEAKNESSES / GAPS
${(resumeResult.weaknesses || []).map(w => `- ${w}`).join("\n") || "No major weaknesses identified."}

MISSING SKILLS
${(resumeResult.missingSkills || []).map(ms => `- ${ms}`).join("\n") || "None."}

PROJECT ANALYSES
${(resumeResult.projectAnalysis || []).map(p => `- ${p.title} (Complexity: ${p.complexity}, Innovation: ${p.innovation}, Scalability: ${p.scalability}, Relevance: ${p.industryRelevance}): ${p.critique}`).join("\n") || "No projects analyzed."}

RESUME IMPROVEMENTS
- Summary: ${resumeResult.resumeImprovements?.summary || "N/A"}
- Projects Section: ${resumeResult.resumeImprovements?.projects || "N/A"}
- Skills Section: ${resumeResult.resumeImprovements?.skillsSection || "N/A"}
- Formatting: ${resumeResult.resumeImprovements?.formatting || "N/A"}
- ATS Optimisation: ${resumeResult.resumeImprovements?.atsOptimisation || "N/A"}

PLACEMENT RECOMMENDATIONS
- Suitable Roles: ${(resumeResult.placementRecommendations?.suitableRoles || []).join(", ") || "N/A"}
- Expected Packages: ${(resumeResult.placementRecommendations?.expectedPackages || []).join(", ") || "N/A"}

HACKATHON ANALYSIS
- Can Win: ${resumeResult.hackathonAnalysis?.canWin || "N/A"}
- Missing Hackathon Skills: ${(resumeResult.hackathonAnalysis?.missingSkills || []).join(", ") || "N/A"}
- Projects to Build: ${(resumeResult.hackathonAnalysis?.projectsToBuild || []).join(", ") || "N/A"}
- Suitable Hackathons: ${(resumeResult.hackathonAnalysis?.suitableHackathons || []).join(", ") || "N/A"}

DEVELOPMENT ROADMAP
- 30 Days Action Plan: ${resumeResult.learningRoadmap?.plan30Days || "N/A"}
- 60 Days Action Plan: ${resumeResult.learningRoadmap?.plan60Days || "N/A"}
- 90 Days Action Plan: ${resumeResult.learningRoadmap?.plan90Days || "N/A"}
- 6 Months Action Plan: ${resumeResult.learningRoadmap?.plan6Months || "N/A"}

AI SUGGESTIONS
- Skills to Acquire: ${(resumeResult.aiSuggestions?.skillsToLearn || []).join(", ") || "N/A"}
- Target Projects to Build: ${(resumeResult.aiSuggestions?.projectsToBuild || []).join(", ") || "N/A"}`;

    navigator.clipboard.writeText(reportText);
    toast.success("Audit report copied to clipboard!");
  };

  const handleDownloadReport = () => {
    if (!resumeResult) return;
    
    const reportText = `RESUME AI AUDIT REPORT
====================================
File: ${resumeFile?.name || "N/A"}
Generated: ${new Date().toLocaleString()}

SCORES OVERVIEW
- Overall Quality Score: ${resumeResult.overallScore || 0}/100
- ATS Matching Score: ${resumeResult.atsScore || 0}/100
- Placement Readiness Score: ${resumeResult.placementReadinessScore || 0}/10
- Hackathon Readiness Score: ${resumeResult.hackathonScore || 0}/100
- DSA Readiness Score: ${resumeResult.dsaReadinessScore || 0}/10
- Communication Score: ${resumeResult.communicationScore || 0}/10
- Profile Strength Score: ${resumeResult.profileStrengthScore || 0}/100

TECHNICAL SKILLS RATING
- Frontend: ${resumeResult.techSkillsAnalysis?.frontend || 0}%
- Backend: ${resumeResult.techSkillsAnalysis?.backend || 0}%
- AI/ML: ${resumeResult.techSkillsAnalysis?.aiml || 0}%
- Database: ${resumeResult.techSkillsAnalysis?.database || 0}%
- Deployment: ${resumeResult.techSkillsAnalysis?.deployment || 0}%
- Problem Solving: ${resumeResult.techSkillsAnalysis?.problemSolving || 0}%

STRENGTHS
${(resumeResult.strengths || []).map(s => `- ${s}`).join("\n") || "No major strengths identified."}

WEAKNESSES / GAPS
${(resumeResult.weaknesses || []).map(w => `- ${w}`).join("\n") || "No major weaknesses identified."}

MISSING SKILLS
${(resumeResult.missingSkills || []).map(ms => `- ${ms}`).join("\n") || "None."}

PROJECT ANALYSES
${(resumeResult.projectAnalysis || []).map(p => `- ${p.title} (Complexity: ${p.complexity}, Innovation: ${p.innovation}, Scalability: ${p.scalability}, Relevance: ${p.industryRelevance}): ${p.critique}`).join("\n") || "No projects analyzed."}

RESUME IMPROVEMENTS
- Summary: ${resumeResult.resumeImprovements?.summary || "N/A"}
- Projects Section: ${resumeResult.resumeImprovements?.projects || "N/A"}
- Skills Section: ${resumeResult.resumeImprovements?.skillsSection || "N/A"}
- Formatting: ${resumeResult.resumeImprovements?.formatting || "N/A"}
- ATS Optimisation: ${resumeResult.resumeImprovements?.atsOptimisation || "N/A"}

PLACEMENT RECOMMENDATIONS
- Suitable Roles: ${(resumeResult.placementRecommendations?.suitableRoles || []).join(", ") || "N/A"}
- Expected Packages: ${(resumeResult.placementRecommendations?.expectedPackages || []).join(", ") || "N/A"}

HACKATHON ANALYSIS
- Can Win: ${resumeResult.hackathonAnalysis?.canWin || "N/A"}
- Missing Hackathon Skills: ${(resumeResult.hackathonAnalysis?.missingSkills || []).join(", ") || "N/A"}
- Projects to Build: ${(resumeResult.hackathonAnalysis?.projectsToBuild || []).join(", ") || "N/A"}
- Suitable Hackathons: ${(resumeResult.hackathonAnalysis?.suitableHackathons || []).join(", ") || "N/A"}

DEVELOPMENT ROADMAP
- 30 Days Action Plan: ${resumeResult.learningRoadmap?.plan30Days || "N/A"}
- 60 Days Action Plan: ${resumeResult.learningRoadmap?.plan60Days || "N/A"}
- 90 Days Action Plan: ${resumeResult.learningRoadmap?.plan90Days || "N/A"}
- 6 Months Action Plan: ${resumeResult.learningRoadmap?.plan6Months || "N/A"}

AI SUGGESTIONS
- Skills to Acquire: ${(resumeResult.aiSuggestions?.skillsToLearn || []).join(", ") || "N/A"}
- Target Projects to Build: ${(resumeResult.aiSuggestions?.projectsToBuild || []).join(", ") || "N/A"}`;

    const element = document.createElement("a");
    const file = new Blob([reportText], { type: 'text/plain;charset=utf-8' });
    element.href = URL.createObjectURL(file);
    element.download = `${resumeFile?.name || "resume"}_ai_audit_report.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    toast.success("Audit report downloaded successfully!");
  };

  /* ─── Generate Ideas ─── */
  const handleGenerateIdeas = async () => {
    try {
      setIdeasLoading(true);
      setIdeas([]);
      const body = {
        skills: customSkills.length ? customSkills : undefined,
        domain: selectedDomain || undefined,
        track: selectedTrack || customTrack || hackathonInput || undefined,
        hackathonId: hackathonId || undefined
      };
      const { data } = await api.post("/ai/generate-ideas", body);
      setIdeas(data.ideas || []);
    } catch (err) {
      const msg = err.response?.data?.message || "Something went wrong while generating ideas. Please try again.";
      toast.error(msg, { duration: 5000, style: { background: '#1e293b', color: '#f1f5f9', border: '1px solid rgba(239,68,68,0.2)' } });
    } finally {
      setIdeasLoading(false);
    }
  };

  const handleCopyIdea = (idea) => {
    const text = `
# Project Idea: ${idea.title}
**Problem Solved:** ${idea.problemStatement}
**Difficulty:** ${idea.difficulty} | **Winning Odds:** ${idea.winningProbability}% | **Innovation Score:** ${idea.innovationScore}/100 | **Judging Alignment:** ${idea.judgingScorePrediction || 90}/100

## Tech Stack
- Frontend: ${idea.techStack?.frontend || "N/A"}
- Backend: ${idea.techStack?.backend || "N/A"}
- Database: ${idea.techStack?.database || "N/A"}
- AI: ${idea.techStack?.ai || "N/A"}
- Cloud: ${idea.techStack?.cloud || "N/A"}

## Why It Can Win
${idea.whyItCanWin || ""}

## Fit Analysis
${idea.whyThisFits || ""}

## Key Features
${(idea.features || []).map(f => `- ${f}`).join("\n")}

## System Architecture
${idea.architectureExplanation || ""}

## Folder Directory Tree
${idea.folderStructure || ""}

## Database Design & Schemas
${idea.databaseDesign || ""}

## API Endpoints Suggested
${idea.apiSuggestions || ""}

## Deployment Strategy
${idea.deploymentStrategy || ""}

## Presentation & Pitching Sequence
${idea.presentationStrategy || ""}
`;
    navigator.clipboard.writeText(text.trim());
    toast.success("Project Blueprint copied to clipboard as Markdown! 📋", {
      style: { background: '#0e1222', border: '1px solid rgba(245,158,11,0.2)', color: '#fff' }
    });
  };

  const handleSaveIdea = (idea) => {
    setSavedIdeas((prev) => {
      const exists = prev.some(item => item.title === idea.title);
      let updated;
      if (exists) {
        updated = prev.filter(item => item.title !== idea.title);
        toast.error("Removed project from Saved list.", {
          style: { background: '#0e1222', border: '1px solid rgba(239,68,68,0.2)', color: '#fff' }
        });
      } else {
        updated = [...prev, idea];
        toast.success("Project saved successfully! 💾", {
          style: { background: '#0e1222', border: '1px solid rgba(16,185,129,0.2)', color: '#fff' }
        });
      }
      localStorage.setItem("saved_ideas", JSON.stringify(updated));
      return updated;
    });
  };

  const handleBookmarkIdea = (idea) => {
    setBookmarkedIdeas((prev) => {
      const exists = prev.some(item => item.title === idea.title);
      let updated;
      if (exists) {
        updated = prev.filter(item => item.title !== idea.title);
        toast.error("Bookmark removed.", {
          style: { background: '#0e1222', border: '1px solid rgba(239,68,68,0.2)', color: '#fff' }
        });
      } else {
        updated = [...prev, idea];
        toast.success("Project idea bookmarked! 🔖", {
          style: { background: '#0e1222', border: '1px solid rgba(245,158,11,0.2)', color: '#fff' }
        });
      }
      localStorage.setItem("bookmarked_ideas", JSON.stringify(updated));
      return updated;
    });
  };

  const handleDownloadPDF = (idea) => {
    const reportText = `====================================================
PROJECT IDEATION BLUEPRINT: ${idea.title.toUpperCase()}
====================================================
Winning Odds: ${idea.winningProbability || 0}%
Innovation Score: ${idea.innovationScore || 0}/100
Judging Predicted Score: ${idea.judgingScorePrediction || 90}/100
Difficulty Level: ${idea.difficulty || "Intermediate"}
Estimated Completion Time: ${idea.estimatedCompletionTime || "36 Hours"}

PROBLEM SOLVED:
${idea.problemStatement}

WHY THIS PROJECT CAN WIN:
${idea.whyItCanWin || "N/A"}

AI FIT EVALUATION:
${idea.whyThisFits || "N/A"}

TECHNOLOGY STACK:
- Frontend: ${idea.techStack?.frontend || "N/A"}
- Backend: ${idea.techStack?.backend || "N/A"}
- Database: ${idea.techStack?.database || "N/A"}
- AI: ${idea.techStack?.ai || "N/A"}
- Cloud: ${idea.techStack?.cloud || "N/A"}

KEY FEATURES:
${(idea.features || []).map((f, i) => `${i + 1}. ${f}`).join("\n")}

SYSTEM ARCHITECTURE:
${idea.architectureExplanation}

FOLDER STRUCTURE DIRECTORY:
${idea.folderStructure}

DATABASE SCHEMAS & DESIGN:
${idea.databaseDesign}

SUGGESTED API ENDPOINTS:
${idea.apiSuggestions}

DEPLOYMENT STRATEGY:
${idea.deploymentStrategy}

PRESENTATION / pitch strategy:
${idea.presentationStrategy}

TEAM ROLES & ASSIGNMENTS:
- Frontend: ${idea.teamRoles?.frontend || "N/A"}
- Backend: ${idea.teamRoles?.backend || "N/A"}
- AI/ML: ${idea.teamRoles?.ai || "N/A"}
- Pitch/Presentation: ${idea.teamRoles?.presentation || "N/A"}
`;

    const element = document.createElement("a");
    const file = new Blob([reportText], { type: 'text/plain;charset=utf-8' });
    element.href = URL.createObjectURL(file);
    element.download = `${idea.title.toLowerCase().replace(/\s+/g, "_")}_technical_blueprint.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    toast.success("Detailed Technical Blueprint downloaded! 📥", {
      style: { background: '#0e1222', border: '1px solid rgba(16,185,129,0.2)', color: '#fff' }
    });
  };

  const addSkill = () => {
    const s = skillInput.trim();
    if (s && !customSkills.includes(s)) {
      setCustomSkills([...customSkills, s]);
      setSkillInput("");
    }
  };

  const iconVariants = {
    idle: {},
    hover: (id) => {
      if (id === "ask") return { y: [0, -4, 0], transition: { repeat: Infinity, duration: 1.5, ease: "easeInOut" } };
      if (id === "resume") return { scale: 1.15, filter: "brightness(1.2)" };
      if (id === "ideas") return { scale: [1, 1.15, 1], transition: { repeat: Infinity, duration: 1.5 } };
      if (id === "matchmaking") return { scale: 1.15 };
      return {};
    }
  };

  const activeStyles = {
    cyan: {
      border: "border-cyan-500/40 bg-cyan-950/15",
      shadow: "shadow-[0_0_30px_rgba(6,182,212,0.25)]",
      text: "text-cyan-300",
      accent: "text-cyan-400 bg-cyan-500/10 border-cyan-500/20"
    },
    purple: {
      border: "border-purple-500/40 bg-purple-950/15",
      shadow: "shadow-[0_0_30px_rgba(168,85,247,0.25)]",
      text: "text-purple-300",
      accent: "text-purple-400 bg-purple-500/10 border-purple-500/20"
    },
    green: {
      border: "border-emerald-500/40 bg-emerald-950/15",
      shadow: "shadow-[0_0_30px_rgba(16,185,129,0.25)]",
      text: "text-emerald-300",
      accent: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
    },
    amber: {
      border: "border-amber-500/40 bg-amber-950/15",
      shadow: "shadow-[0_0_30px_rgba(245,158,11,0.25)]",
      text: "text-amber-300",
      accent: "text-amber-400 bg-amber-500/10 border-amber-500/20"
    }
  };

  // Build Tab Config dynamically based on hackathonId parameter
  const tabs = [
    ...(hackathonId ? [{
      id: "matchmaking",
      label: "Team Matchmaking",
      desc: "Intelligent synergy matcher to build the ultimate team.",
      icon: <FaUsers />,
      color: "cyan",
      badges: ["Smart Matching", "AI Recommended"]
    }] : []),
    {
      id: "ask",
      label: "Ask AI",
      desc: "AI mentor powered by Gemini for instant hackathon queries.",
      icon: <FaRobot />,
      color: "purple",
      badges: ["AI Mentor", "Personalized Guidance"]
    },
    {
      id: "resume",
      label: "Resume Review",
      desc: "Instant ATS & hackathon-readiness resume parser.",
      icon: <FaFileAlt />,
      color: "green",
      badges: ["AI Powered", "Gemini Analysis"]
    },
    {
      id: "ideas",
      label: "Project Ideas",
      desc: "Hackathon-specific, highly tailored project blueprints.",
      icon: <FaLightbulb />,
      color: "amber",
      badges: ["Hackathon Aware", "Gemini Powered"]
    },
  ];

  const glowColors = {
    cyan: "rgba(6,182,212,0.15)",
    purple: "rgba(168,85,247,0.15)",
    green: "rgba(16,185,129,0.15)",
    amber: "rgba(245,158,11,0.15)"
  };

  return (
    <PageLayout activePage="AI Recommendations">
      <div className="p-8 max-w-7xl mx-auto space-y-6 relative z-10">

        {/* Back Link */}
        <button
          onClick={() => navigate("/hackathons")}
          className="text-xs text-slate-400 hover:text-white font-bold flex items-center gap-2"
        >
          <FaArrowLeft /> Back to Hackathons
        </button>

        {/* ─── Hero Banner ─── */}
        <div className="p-7 rounded-2xl bg-gradient-to-r from-[#111936]/90 via-[#08111f]/90 to-[#0b2330]/90 border border-white/5 text-left overflow-hidden relative">
          <div className="absolute right-0 top-0 w-72 h-72 bg-cyan-500/10 blur-3xl pointer-events-none" />
          <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-cyan-500/20 bg-cyan-500/10 text-cyan-300 text-[10px] font-black uppercase tracking-wider mb-4">
                <FaRobot /> AI Recommendations Hub
              </div>
              <h1 className="text-3xl font-black text-white">
                {insights?.hackathon?.title || "AI Recommendations & Copilot"}
              </h1>
              <p className="text-sm text-slate-400 mt-2 leading-relaxed">
                {insights?.primaryRecommendation || "Ask career questions, analyze resume skill gaps, generate projects, or search matched teams."}
              </p>
              {hackathonId ? (
                <div className="flex flex-wrap gap-2 mt-4">
                  {currentHackathon?.relations && currentHackathon.relations.map(rel => {
                    const tone = rel === "Registered" ? "green" : rel === "Interested" ? "amber" : rel.startsWith("Team") ? "cyan" : "slate";
                    return <Pill key={rel} tone={tone}>{rel}</Pill>;
                  })}
                  {!currentHackathon?.relations?.length && (
                    <Pill tone="slate">Participant</Pill>
                  )}
                  <Pill tone="slate">{insights?.hackathon?.theme || "General"} theme</Pill>
                  {insights?.readiness?.recommendedRole && (
                    <Pill tone="green">🤖 Recommended Role: {insights.readiness.recommendedRole}</Pill>
                  )}
                </div>
              ) : (
                <div className="flex flex-wrap gap-2 mt-4">
                  <Pill tone="cyan">Status: General Copilot</Pill>
                  <Pill tone="slate">Omni-Channel Mode</Pill>
                </div>
              )}
            </div>

            {/* Hackathon Select Dropdown */}
            <div className="shrink-0 flex flex-col gap-2 min-w-[250px] md:self-center">
              <label className="text-[10px] uppercase font-black tracking-wider text-slate-400">Select Hackathon Context</label>
              <div className="flex gap-2">
                <select
                  value={hackathonId || ""}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val) {
                      navigate(`/ai-recommendations/${val}`);
                    } else {
                      navigate("/ai-recommendations");
                    }
                  }}
                  className="flex-1 bg-[#030712]/90 text-xs font-bold text-white border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-purple-500 transition-colors cursor-pointer"
                >
                  <option value="">General AI Copilot Mode</option>
                  {allHackathons.map((h) => {
                    const relationLabel = h.relations && h.relations.length > 0 ? ` (${h.relations[0]})` : "";
                    return (
                      <option key={h._id || h.id} value={h._id || h.id}>
                        {h.title}{relationLabel}
                      </option>
                    );
                  })}
                </select>
                
                {hackathonId && (
                  <button
                    onClick={handleToggleInterest}
                    title={currentHackathon?.isInterested ? "Unmark Interest" : "Mark As Interested"}
                    className={`p-3.5 rounded-xl text-xs font-black flex items-center justify-center transition border cursor-pointer ${
                      currentHackathon?.isInterested
                        ? "bg-amber-500/10 hover:bg-amber-500/20 border-amber-500/35 text-amber-300"
                        : "bg-white/5 hover:bg-white/10 border-white/10 text-slate-300"
                    }`}
                  >
                    <FaStar className={currentHackathon?.isInterested ? "text-amber-400" : "text-slate-400"} />
                  </button>
                )}
              </div>
              {allHackathons.length === 0 && (
                <span className="text-[10px] text-amber-500/90 font-black tracking-wide mt-1 block">
                  You have not registered or marked interest in any hackathons yet.
                </span>
              )}
            </div>
          </div>
        </div>

        {/* AI Modules Premium Header */}
        <div className="space-y-2 text-center max-w-2xl mx-auto pt-6 pb-2">
          <h2 className="text-xl md:text-2xl font-black bg-gradient-to-r from-cyan-400 via-purple-400 to-amber-400 bg-clip-text text-transparent uppercase tracking-wider">
            AI Powered Recommendation Modules
          </h2>
          <p className="text-xs text-slate-400 leading-relaxed font-medium">
            Discover intelligent team matching, personalized AI guidance, resume analysis and hackathon aware project recommendations.
          </p>
        </div>

        {/* ─── Premium Modules Selector Grid ─── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            const style = activeStyles[tab.color];
            
            return (
              <motion.div
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                whileHover={{ y: -4, scale: 1.015 }}
                whileTap={{ scale: 0.985 }}
                initial="idle"
                animate={isActive ? "active" : "idle"}
                className={`p-5 rounded-3xl border backdrop-blur-2xl transition-all duration-300 flex flex-col gap-4 text-left cursor-pointer relative overflow-hidden select-none ${
                  isActive
                    ? `${style.border} ${style.shadow}`
                    : "bg-[#0e1222]/40 border-white/5 hover:border-white/10 hover:bg-[#0e1222]/70 shadow-[0_4px_25px_rgba(0,0,0,0.5)]"
                }`}
              >
                {/* Active Tab Floating Animations */}
                {isActive && tab.id === "matchmaking" && (
                  <>
                    {[...Array(6)].map((_, idx) => (
                      <motion.div
                        key={idx}
                        className="absolute w-1 h-1 rounded-full bg-cyan-400 pointer-events-none"
                        style={{
                          top: `${15 + (idx * 12)}%`,
                          left: `${20 + (Math.sin(idx) * 30 + 30)}%`,
                        }}
                        animate={{
                          y: [0, -10, 0],
                          opacity: [0.15, 0.85, 0.15],
                          scale: [1, 1.4, 1],
                        }}
                        transition={{
                          duration: 2 + (idx % 2),
                          repeat: Infinity,
                          delay: idx * 0.3,
                        }}
                      />
                    ))}
                  </>
                )}

                {isActive && tab.id === "resume" && (
                  <motion.div
                    className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-emerald-400 to-transparent pointer-events-none"
                    animate={{
                      top: ["12%", "88%", "12%"]
                    }}
                    transition={{
                      duration: 2.2,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  />
                )}

                {/* Glow Light effects inside cards */}
                <div className={`absolute -top-10 -right-10 w-24 h-24 rounded-full blur-3xl pointer-events-none transition-all duration-500 ${
                  isActive ? `bg-${tab.color}-500/20` : "bg-white/5"
                }`} />

                {/* Icon Container */}
                <div className="flex justify-between items-start">
                  <div className="relative">
                    {isActive && tab.id === "ask" && (
                      <span className="absolute inset-0 rounded-full border border-purple-500/35 animate-ping opacity-75 pointer-events-none" style={{ animationDuration: '2.5s' }} />
                    )}
                    {isActive && tab.id === "ideas" && (
                      <motion.div
                        className="absolute -inset-2 bg-amber-500/15 rounded-full blur-xs pointer-events-none"
                        animate={{ scale: [1, 1.25, 1], opacity: [0.4, 0.8, 0.4] }}
                        transition={{ duration: 1.8, repeat: Infinity }}
                      />
                    )}
                    <motion.div
                      variants={iconVariants}
                      custom={tab.id}
                      className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg border transition-colors ${
                        isActive
                          ? `bg-${tab.color}-500/10 border-${tab.color}-500/20 ${style.text}`
                          : "bg-white/5 border-white/5 text-slate-400"
                      }`}
                    >
                      {tab.icon}
                    </motion.div>
                  </div>
                  
                  {/* Badges Stack */}
                  <div className="flex flex-col gap-1 items-end">
                    {tab.badges.map((b, idx) => (
                      <span
                        key={idx}
                        className={`px-2 py-0.5 rounded-full border text-[8px] font-black uppercase tracking-wider ${
                          isActive
                            ? style.accent
                            : "bg-white/5 border-white/5 text-slate-500"
                        }`}
                      >
                        {b}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Content text */}
                <div className="space-y-1">
                  <h3 className={`text-sm font-black tracking-wide flex items-center gap-1 ${
                    isActive ? "text-white" : "text-slate-350"
                  }`}>
                    {tab.label}
                    {isActive && tab.id === "ask" && (
                      <motion.span
                        animate={{ opacity: [0, 1, 0] }}
                        transition={{ repeat: Infinity, duration: 0.8 }}
                        className="inline-block w-1.5 h-3.5 bg-purple-400 ml-0.5 align-middle"
                      />
                    )}
                  </h3>
                  <p className="text-[11px] text-slate-500 leading-relaxed font-medium">
                    {tab.desc}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* ─── Tab Content Views ─── */}
        <AnimatePresence mode="wait">

          {/* ════════ MATCHMAKING VIEW ════════ */}
          {activeTab === "matchmaking" && hackathonId && (
            <motion.div key="matchmaking" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }} className="space-y-6">
              {insightsLoading ? (
                <div className="p-12 rounded-2xl bg-[#0e1222]/40 border border-white/5 text-center text-slate-400">
                  Loading AI matchmaking insights...
                </div>
              ) : insightsError ? (
                <div className="p-12 rounded-2xl bg-red-500/10 border border-red-500/20 text-center">
                  <p className="text-red-300 text-sm font-bold">{insightsError}</p>
                  <button onClick={loadInsights} className="mt-4 px-5 py-2 rounded-xl bg-red-600 text-white text-xs font-black">
                    Retry
                  </button>
                </div>
              ) : insights ? (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                    <ScoreCard title="Compatibility Score" value={insights.readiness?.compatibilityScore} subtitle="Profile and hackathon fit" icon={<FaBullseye />} />
                    <ScoreCard title="Readiness Score" value={insights.readiness?.readinessScore} subtitle="How ready you are to participate" icon={<FaShieldAlt />} />
                    <ScoreCard
                      title="Team Success Rate"
                      value={
                        typeof insights.readiness?.teamSuccessPrediction === "number"
                          ? insights.readiness.teamSuccessPrediction
                          : (insights.readiness?.winningProbability || insights.readiness?.readinessScore || 85)
                      }
                      subtitle="Estimated execution synergy"
                      icon={<FaChartLine />}
                    />
                    <ScoreCard title="Winning Probability" value={insights.readiness?.winningProbability} subtitle="Estimated winning readiness, not a guarantee" icon={<FaBolt />} />
                  </div>

                  {insights.readiness?.teamSuccessPrediction && typeof insights.readiness.teamSuccessPrediction === 'string' && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-6 rounded-2xl border border-amber-500/15 bg-gradient-to-r from-amber-500/5 via-[#0e1222]/40 to-transparent text-left space-y-2.5 relative overflow-hidden"
                    >
                      <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-2xl pointer-events-none" />
                      <div className="flex items-center gap-2 text-amber-400 text-xs font-black uppercase tracking-wider">
                        <FaChartLine className="animate-pulse" /> AI Synergy & Execution Analysis
                      </div>
                      <p className="text-xs text-slate-350 leading-relaxed font-medium">
                        {insights.readiness.teamSuccessPrediction}
                      </p>
                    </motion.div>
                  )}

                  <Section
                    title="Skill Gap Detection"
                    subtitle="AI compares your available skills with this hackathon's required skills."
                    icon={<FaCode />}
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 rounded-2xl bg-[#030712]/55 border border-white/5">
                        <p className="text-[10px] uppercase tracking-wider text-emerald-400 font-black mb-3">Strong skills</p>
                        <div className="flex flex-wrap gap-2">
                          {(insights.readiness?.strongSkills || []).length
                            ? insights.readiness.strongSkills.map((skill) => <Pill key={skill} tone="green">{skill}</Pill>)
                            : <p className="text-xs text-slate-500">Add skills in Settings to improve matches.</p>}
                        </div>
                      </div>
                      <div className="p-4 rounded-2xl bg-[#030712]/55 border border-white/5">
                        <p className="text-[10px] uppercase tracking-wider text-amber-400 font-black mb-3">Missing skills</p>
                        <div className="flex flex-wrap gap-2">
                          {(insights.readiness?.missingSkills || []).length
                            ? insights.readiness.missingSkills.map((skill) => <Pill key={skill} tone="amber">{skill}</Pill>)
                            : <p className="text-xs text-emerald-400">No major skill gaps detected.</p>}
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4">
                      {(insights.readiness?.nextActions || []).map((action) => (
                        <div key={action} className="p-4 rounded-2xl bg-cyan-500/5 border border-cyan-500/10 text-xs text-slate-300">
                          {action}
                        </div>
                      ))}
                    </div>
                  </Section>

                  {insights.userStatus === "single" && insights.teamCreationSuggestion && (
                    <Section
                      title="Create Team For This Hackathon"
                      subtitle="Get ahead by starting a new team with AI-suggested templates."
                      icon={<FaRocket className="text-amber-400 animate-pulse" />}
                    >
                      <div className="p-6 rounded-2xl bg-gradient-to-br from-[#1b1c31]/95 via-[#0e1222]/95 to-[#0b2330]/95 border border-amber-500/20 relative overflow-hidden flex flex-col gap-4 text-left shadow-[0_0_30px_rgba(245,158,11,0.05)]">
                        <div className="absolute right-0 top-0 w-48 h-48 bg-amber-500/5 blur-3xl pointer-events-none" />
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                          <div className="space-y-3">
                            <div>
                              <span className="text-[10px] uppercase font-black text-amber-400 tracking-wider">AI Suggested Team Name</span>
                              <h4 className="text-lg font-black text-white mt-0.5">{insights.teamCreationSuggestion.teamName}</h4>
                            </div>
                            <div>
                              <span className="text-[10px] uppercase font-black text-slate-500 tracking-wider">Description</span>
                              <p className="text-xs text-slate-300 mt-1 leading-relaxed">{insights.teamCreationSuggestion.description}</p>
                            </div>
                            <div className="grid grid-cols-2 gap-4 pt-2">
                              <div>
                                <span className="text-[10px] uppercase font-black text-slate-500 tracking-wider block mb-1">Recommended Size</span>
                                <span className="text-xs text-white font-extrabold bg-white/5 border border-white/10 px-2.5 py-1 rounded-lg">4 Members</span>
                              </div>
                              <div>
                                <span className="text-[10px] uppercase font-black text-slate-500 tracking-wider block mb-1">Project Domains</span>
                                <div className="flex flex-wrap gap-1">
                                  {(insights.teamCreationSuggestion.projectDomains || []).map((dom, idx) => (
                                    <span key={idx} className="text-[9px] font-black text-cyan-300 bg-cyan-500/10 border border-cyan-500/20 px-2 py-0.5 rounded uppercase tracking-wider">{dom}</span>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="space-y-3 lg:border-l lg:border-white/5 lg:pl-6">
                            <div>
                              <span className="text-[10px] uppercase font-black text-slate-500 tracking-wider">Required Roles</span>
                              <div className="flex flex-wrap gap-1.5 mt-1.5">
                                {(insights.teamCreationSuggestion.roles || []).map((role, idx) => (
                                  <Pill key={idx} tone="purple">{role}</Pill>
                                ))}
                              </div>
                            </div>
                            <div>
                              <span className="text-[10px] uppercase font-black text-slate-500 tracking-wider">Recommended Technologies</span>
                              <div className="flex flex-wrap gap-1.5 mt-1.5">
                                {(insights.teamCreationSuggestion.technologies || []).map((tech, idx) => (
                                  <Pill key={idx} tone="cyan">{tech}</Pill>
                                ))}
                              </div>
                            </div>
                            <div>
                              <span className="text-[10px] uppercase font-black text-slate-500 tracking-wider">Missing Skills (Skill Gap)</span>
                              <div className="flex flex-wrap gap-1.5 mt-1.5">
                                {(insights.readiness?.missingSkills || []).length ? (
                                  insights.readiness.missingSkills.map((skill) => <Pill key={skill} tone="amber">{skill}</Pill>)
                                ) : (
                                  <span className="text-xs text-emerald-400">None detected!</span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-t border-white/5 pt-4 mt-2 gap-4">
                          <p className="text-xs text-slate-400 leading-normal max-w-lg">
                            Ready to lead? Click below to instantly launch this team profile and begin inviting co-builders!
                          </p>
                          <button
                            onClick={() => {
                              navigate(`/teams`, {
                                state: {
                                  prefill: {
                                    teamName: insights.teamCreationSuggestion.teamName,
                                    description: insights.teamCreationSuggestion.description,
                                    hackathonId: hackathonId,
                                    requiredSkills: insights.teamCreationSuggestion.technologies,
                                    requiredRoles: insights.teamCreationSuggestion.roles
                                  }
                                }
                              });
                            }}
                            className="px-6 py-2.5 rounded-xl bg-amber-500 text-slate-950 text-xs font-black hover:bg-amber-400 transition cursor-pointer flex items-center gap-1.5 self-end sm:self-auto"
                          >
                            <FaPlus /> Create Team Button
                          </button>
                        </div>
                      </div>
                    </Section>
                  )}

                  {insights.userStatus !== "team_leader" && (
                    <Section
                      title="AI Team Recommendations"
                      subtitle="Best open teams for this hackathon based on skills, role, availability, and open slots."
                      icon={<FaUsers />}
                    >
                      {(insights.recommendedTeams || []).length ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                          {insights.recommendedTeams.map((team) => (
                            <TeamCard key={team.id} team={team} onJoin={handleJoinTeam} />
                          ))}
                        </div>
                      ) : (
                        <div className="p-8 rounded-2xl bg-[#030712]/45 border border-dashed border-white/10 text-center text-slate-400">
                          No open team found yet. Create a team and invite matching members below.
                        </div>
                      )}
                    </Section>
                  )}

                  <Section
                    title={insights.userStatus === "team_leader" ? "AI Member Recommendations" : "Same Hackathon Builders"}
                    subtitle={insights.userStatus === "team_leader"
                      ? "Invite individual members who can fill your team's missing skills and roles."
                      : "Users interested in the same hackathon who may be good co-founders for a new team."}
                    icon={<FaUserPlus />}
                    action={
                      <div className="relative w-64">
                        <input
                          value={search}
                          onChange={(event) => setSearch(event.target.value)}
                          placeholder="Search role, skill, name..."
                          className="w-full bg-[#030712]/70 border border-white/10 rounded-xl py-2 pl-8 pr-3 text-xs text-white focus:outline-none focus:border-cyan-500"
                        />
                        <FaSearch className="absolute left-3 top-2.5 text-[10px] text-slate-500" />
                      </div>
                    }
                  >
                    {filteredMembers.length ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                        {filteredMembers.map((member) => (
                          <MemberCard key={member.id} member={member} hackathonId={hackathonId} />
                        ))}
                      </div>
                    ) : (
                      <div className="p-8 rounded-2xl bg-[#030712]/45 border border-dashed border-white/10 text-center text-slate-400">
                        No matching users found. Ask participants to mark interest or complete profiles.
                      </div>
                    )}
                  </Section>

                  <Section
                    title="AI Project Recommendations (Original)"
                    subtitle="Project ideas shaped around hackathon theme, required skills, and team readiness."
                    icon={<FaLightbulb />}
                  >
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                      {(insights.projectRecommendations || []).map((project) => (
                        <ProjectCard key={project.title} project={project} />
                      ))}
                    </div>
                  </Section>

                  {insights?.strategy && (
                    <Section
                      title="🤖 AI Strategy Room"
                      subtitle="Gemini analysis on strategy, team improvements, and personalized profile matching improvements."
                      icon={<FaRobot className="animate-pulse text-purple-400" />}
                    >
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="p-5 rounded-2xl bg-[#030712]/55 border border-white/5 relative overflow-hidden flex flex-col gap-3 text-left">
                          <span className="px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 text-[8px] font-black uppercase tracking-wider w-max">
                            Personalized Feedback
                          </span>
                          <h4 className="font-extrabold text-sm text-white mt-1">Profile Optimization</h4>
                          <p className="text-xs text-slate-300 leading-relaxed italic">
                            "{insights.strategy.personalizedFeedback}"
                          </p>
                        </div>

                        <div className="p-5 rounded-2xl bg-[#030712]/55 border border-white/5 relative overflow-hidden flex flex-col gap-3 text-left">
                          <span className="px-2 py-0.5 rounded bg-purple-500/10 text-purple-400 text-[8px] font-black uppercase tracking-wider w-max">
                            Team Improvements
                          </span>
                          <h4 className="font-extrabold text-sm text-white mt-1">Friction Points & Alignment</h4>
                          <p className="text-xs text-slate-300 leading-relaxed italic">
                            "{insights.strategy.teamImprovements}"
                          </p>
                        </div>

                        <div className="p-5 rounded-2xl bg-[#030712]/55 border border-white/5 relative overflow-hidden flex flex-col gap-3 text-left">
                          <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 text-[8px] font-black uppercase tracking-wider w-max">
                            Hackathon Strategy
                          </span>
                          <h4 className="font-extrabold text-sm text-white mt-1">Tactical Sprint Roadmap</h4>
                          <p className="text-xs text-slate-300 leading-relaxed">
                            {insights.strategy.hackathonStrategy}
                          </p>
                        </div>
                      </div>
                    </Section>
                  )}
                </>
              ) : null}
            </motion.div>
          )}

          {/* ════════ ASK AI VIEW ════════ */}
          {activeTab === "ask" && (
            <motion.div key="ask" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }} className="space-y-5">
              
              {/* Category selectors */}
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map((cat) => (
                  <motion.button
                    key={cat.id}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setActiveCategory(cat.id)}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all duration-300 border ${
                      activeCategory === cat.id
                        ? "bg-purple-500/15 text-purple-300 border-purple-500/30 shadow-[0_0_15px_rgba(168,85,247,0.15)]"
                        : "bg-[#0e1222]/50 text-slate-500 border-white/5 hover:text-slate-300 hover:border-white/10"
                    }`}
                  >
                    {cat.icon} {cat.label}
                  </motion.button>
                ))}
              </div>

              {/* Chat Thread Container */}
              <div className="p-6 rounded-2xl bg-[#0e1222]/50 border border-white/5 backdrop-blur-xl h-[620px] flex flex-col justify-between">
                
                {/* Scrollable Conversation History */}
                <div className="flex-1 overflow-y-auto pr-2 space-y-4 mb-4 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                  {messages.map((msg, index) => (
                    <div key={index} className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
                      <div className={`p-4 rounded-2xl max-w-[85%] text-left relative group ${
                        msg.sender === "user"
                          ? "bg-purple-600/20 border border-purple-500/25 text-white rounded-br-none shadow-[0_0_15px_rgba(168,85,247,0.1)]"
                          : "bg-[#030712]/60 border border-white/5 text-slate-300 rounded-bl-none"
                      }`}>
                        
                        {/* Header metadata */}
                        <div className="flex items-center gap-1.5 mb-2 text-[9px] uppercase tracking-wider font-black text-slate-500 select-none">
                          {msg.sender === "user" ? (
                            <span>You</span>
                          ) : (
                            <>
                              <FaRobot className="text-purple-400" />
                              <span className="text-purple-400">AI Copilot</span>
                            </>
                          )}
                        </div>

                        {/* Text Content */}
                        <div className="space-y-1.5 text-sm leading-relaxed whitespace-pre-line">
                          {msg.sender === "user" ? msg.text : formatAIText(msg.text)}
                        </div>

                        {/* Copy Option for AI messages */}
                        {msg.sender === "ai" && (
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(msg.text);
                              toast.success("Response copied!");
                            }}
                            className="absolute right-3 top-3 px-2 py-1 rounded bg-white/5 border border-white/5 hover:border-purple-500/30 hover:bg-purple-500/10 text-[9px] font-black text-slate-500 hover:text-purple-300 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer uppercase tracking-wider"
                          >
                            Copy
                          </button>
                        )}
                      </div>
                    </div>
                  ))}

                  {/* Typing Indicator */}
                  {askLoading && (
                    <div className="flex justify-start">
                      <div className="p-4 rounded-2xl bg-[#030712]/60 border border-white/5 text-slate-300 rounded-bl-none max-w-[80%] text-left">
                        <div className="flex items-center gap-2 mb-2 text-[9px] uppercase tracking-wider font-black text-purple-400 select-none">
                          <FaRobot className="animate-spin" />
                          <span>AI Copilot is typing...</span>
                        </div>
                        <div className="flex gap-1 py-1.5 items-center">
                          <span className="w-2.5 h-2.5 rounded-full bg-purple-500/40 animate-bounce" style={{ animationDelay: "0ms" }} />
                          <span className="w-2.5 h-2.5 rounded-full bg-purple-500/40 animate-bounce" style={{ animationDelay: "150ms" }} />
                          <span className="w-2.5 h-2.5 rounded-full bg-purple-500/40 animate-bounce" style={{ animationDelay: "300ms" }} />
                        </div>
                      </div>
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>

                {/* Bottom Input Area */}
                <div className="p-4 rounded-2xl bg-[#030712]/55 border border-white/5 space-y-3">
                  <textarea
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleAsk(); } }}
                    placeholder={hackathonId ? "Ask how to win, project ideas, stack recommendations, work divisions..." : "Ask general hackathon and prep guidance..."}
                    rows={3}
                    className="w-full bg-transparent border-0 outline-none focus:ring-0 text-sm text-white placeholder-slate-600 resize-none focus:outline-none"
                  />
                  <div className="flex items-center justify-between gap-4 border-t border-white/5 pt-3">
                    <div className="flex flex-wrap gap-1.5 flex-1 select-none">
                      {QUICK_PROMPTS.map((prompt) => (
                        <button
                          key={prompt}
                          onClick={() => setQuestion(prompt)}
                          className="px-2.5 py-1.5 rounded-lg bg-white/5 border border-white/5 text-[10px] text-slate-500 hover:text-purple-400 hover:border-purple-500/20 transition-all cursor-pointer"
                        >
                          {prompt}
                        </button>
                      ))}
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={handleAsk}
                      disabled={askLoading}
                      className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-xs font-black flex items-center gap-2 hover:shadow-[0_0_20px_rgba(168,85,247,0.25)] transition-all disabled:opacity-50 shrink-0 cursor-pointer"
                    >
                      <FaPaperPlane /> Send
                    </motion.button>
                  </div>
                </div>

              </div>
            </motion.div>
          )}

          {/* ════════ RESUME VIEW ════════ */}
          {activeTab === "resume" && (
            <motion.div key="resume" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }} className="space-y-5">
              <motion.div
                whileHover={{ scale: 1.01 }}
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleFileDrop}
                className={`p-12 rounded-2xl border-2 border-dashed text-center cursor-pointer transition-all duration-300 backdrop-blur-xl ${
                  isDragging
                    ? "border-emerald-400 bg-emerald-500/10 shadow-[0_0_30px_rgba(16,185,129,0.2)]"
                    : resumeFile
                    ? "border-emerald-500/30 bg-emerald-500/5"
                    : "border-white/10 bg-[#0e1222]/40 hover:border-emerald-500/30 hover:bg-emerald-500/5"
                }`}
              >
                <input ref={fileInputRef} type="file" accept=".pdf" className="hidden" onChange={handleFileDrop} />
                <FaCloudUploadAlt className={`text-5xl mx-auto mb-4 ${isDragging ? "text-emerald-400" : resumeFile ? "text-emerald-400" : "text-slate-600"}`} />
                {resumeFile ? (
                  <div>
                    <p className="text-sm font-bold text-emerald-400">{resumeFile.name}</p>
                    <p className="text-xs text-slate-500 mt-1">{(resumeFile.size / 1024).toFixed(1)} KB • Ready to analyze</p>
                  </div>
                ) : (
                  <div>
                    <p className="text-sm font-bold text-slate-400">Drop your PDF resume here or click to browse</p>
                    <p className="text-xs text-slate-600 mt-1">Supports PDF files up to 5MB</p>
                  </div>
                )}
              </motion.div>

              {resumeFile && !resumeLoading && !resumeResult && (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleResumeUpload}
                  className="w-full py-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-sm font-bold flex items-center justify-center gap-2 hover:shadow-[0_0_25px_rgba(16,185,129,0.3)] transition-all"
                >
                  <FaRocket /> Review Resume with Gemini AI
                </motion.button>
              )}

              {resumeLoading && (
                <div className="p-8 rounded-3xl bg-[#0e1222]/80 border border-emerald-500/20 backdrop-blur-xl space-y-6 relative overflow-hidden shadow-[0_0_50px_rgba(16,185,129,0.1)]">
                  <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-emerald-400 to-transparent animate-pulse" />
                  
                  <div className="flex flex-col md:flex-row items-center gap-6 pb-4 border-b border-white/5">
                    <div className="relative flex-shrink-0">
                      <div className="w-16 h-16 rounded-full border-4 border-emerald-500/20 border-t-emerald-400 animate-spin" style={{ animationDuration: "1.2s" }} />
                      <FaRobot className="absolute inset-0 m-auto text-emerald-400 text-2xl animate-pulse" />
                    </div>
                    <div className="text-center md:text-left space-y-1">
                      <h3 className="text-lg font-black text-white tracking-wide uppercase">Gemini AI Career Scanner</h3>
                      <p className="text-xs text-slate-400 font-medium">Running real-time analysis on your technical roadmap...</p>
                    </div>
                  </div>

                  <div className="space-y-3.5 text-left max-w-xl mx-auto">
                    {analysisSteps.map((step, i) => {
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
                            isFinished ? "bg-emerald-500/10 border-emerald-500/35 text-emerald-400" :
                            isActive ? "bg-emerald-500 border-emerald-400 text-black animate-pulse" :
                            "bg-white/5 border-white/5 text-transparent"
                          }`}>
                            {isFinished ? "✓" : isActive ? "●" : ""}
                          </div>
                          <span className={`text-xs font-bold transition-all ${
                            isActive ? "text-emerald-300 font-black tracking-wide" :
                            isFinished ? "text-slate-350" : "text-slate-600"
                          }`}>
                            {step}
                          </span>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              )}

              {resumeResult && (
                <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="space-y-8 text-left">
                  
                  {/* =========================================================
                      SECTION 1 : RESUME DNA ANALYSIS (HACKATHON AWARE)
                      ========================================================= */}
                  <div className="p-6 rounded-3xl bg-[#0e1222]/60 border border-emerald-500/10 relative overflow-hidden shadow-2xl">
                    <div className="absolute -top-24 -left-24 w-48 h-48 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
                    
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
                      {/* Left: DNA Scanner & Meters */}
                      <div className="flex flex-col gap-4">
                        <div className="flex justify-between items-center">
                          <span className="px-3 py-1 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase tracking-wider animate-pulse flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> RESUME DNA SCANNER
                          </span>
                          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                            STATUS: <span className="text-emerald-400">{resumeResult.profileStatus ? `${resumeResult.profileStatus.toUpperCase()} PROFILE` : "EXCELLENT PROFILE"}</span>
                          </span>
                        </div>
                        
                        {/* DNA Helix Visualization */}
                        <div className="flex justify-center items-center h-36 relative overflow-hidden bg-black/35 rounded-2xl border border-emerald-500/10 shadow-[inner_0_0_20px_rgba(16,185,129,0.05)]">
                          <div className="flex gap-3 h-24 w-full px-6">
                            {[...Array(12)].map((_, i) => (
                              <div key={i} className="flex flex-col items-center justify-between h-full w-1.5 relative">
                                <motion.div
                                  className="w-2 h-2 rounded-full bg-emerald-400 absolute"
                                  animate={{ y: [0, 80, 0] }}
                                  transition={{ duration: 2.5, repeat: Infinity, delay: i * 0.18, ease: "easeInOut" }}
                                />
                                <div className="w-[1px] h-full bg-emerald-500/15" />
                                <motion.div
                                  className="w-2 h-2 rounded-full bg-cyan-400 absolute"
                                  animate={{ y: [80, 0, 80] }}
                                  transition={{ duration: 2.5, repeat: Infinity, delay: i * 0.18, ease: "easeInOut" }}
                                />
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Profile Strength & AI Confidence meters */}
                        <div className="space-y-2">
                          <div className="space-y-1">
                            <div className="flex justify-between text-[10px] uppercase font-black tracking-wider text-slate-400">
                              <span>Profile Strength</span>
                              <span className="text-emerald-400">{Math.floor(((resumeResult.overallScore || 0) + (resumeResult.hackathonScore || 0) + (resumeResult.compatibilityScore || 0)) / 3)}%</span>
                            </div>
                            <div className="w-full h-1 bg-black/45 rounded-full overflow-hidden">
                              <div className="h-full bg-emerald-500" style={{ width: `${Math.floor(((resumeResult.overallScore || 0) + (resumeResult.hackathonScore || 0) + (resumeResult.compatibilityScore || 0)) / 3)}%` }} />
                            </div>
                          </div>

                          <div className="space-y-1">
                            <div className="flex justify-between text-[10px] uppercase font-black tracking-wider text-slate-400">
                              <span>AI Confidence</span>
                              <span className="text-cyan-400">{Math.floor(((resumeResult.atsScore || 0) + (resumeResult.placementScore || 0)) / 2)}%</span>
                            </div>
                            <div className="w-full h-1 bg-black/45 rounded-full overflow-hidden">
                              <div className="h-full bg-cyan-500" style={{ width: `${Math.floor(((resumeResult.atsScore || 0) + (resumeResult.placementScore || 0)) / 2)}%` }} />
                            </div>
                          </div>
                        </div>

                        <p className="text-xs text-slate-400 italic text-center">
                          ⚡ AI Analysis: <span className="text-emerald-400 font-bold uppercase tracking-wider">
                            {resumeResult.hackathonScore >= 80 ? "Hackathon Ready" : resumeResult.placementScore >= 80 ? "Placement Ready" : "Frontend Ready"}
                          </span>
                        </p>
                      </div>

                      {/* Right: Scores Cards Grid */}
                      <div className="lg:col-span-2 grid grid-cols-2 md:grid-cols-4 gap-4 w-full">
                        {[
                          { title: "Resume Score", score: resumeResult.overallScore || 0, color: "emerald", label: "Overall" },
                          { title: "ATS Score", score: resumeResult.atsScore || 0, color: "cyan", label: "ATS Matching" },
                          { title: "Placement Score", score: resumeResult.placementScore || 0, color: "purple", label: "Job Ready" },
                          { title: "Hackathon Score", score: resumeResult.hackathonScore || 0, color: "amber", label: "Contest Ready" },
                          { title: "Compatibility Score", score: resumeResult.compatibilityScore || 0, color: "rose", label: "Hackathon Fit" },
                          { title: "Winning Probability", score: resumeResult.winningProbability || 0, color: "teal", label: "Win odds" },
                          { title: "Skills Match Score", score: resumeResult.skillsMatchScore || 0, color: "indigo", label: "Skills Match" },
                          { title: "Team Contribution", score: Math.max(70, Math.floor(((resumeResult.teamContribution?.ui || 0) + (resumeResult.teamContribution?.backend || 0) + (resumeResult.teamContribution?.presentation || 0) + (resumeResult.teamContribution?.leadership || 0) + (resumeResult.teamContribution?.problemSolving || 0)) / 5)), color: "purple", label: "Value Score" },
                        ].map((item, idx) => (
                          <motion.div
                            key={idx}
                            whileHover={{ y: -3, scale: 1.025 }}
                            className="p-4 rounded-2xl bg-[#0e1222]/80 border border-white/5 flex flex-col items-center justify-center gap-2.5 transition-all duration-300 hover:border-emerald-500/20"
                          >
                            <CircularScore
                              score={item.score}
                              size={75}
                              strokeWidth={5}
                              label={item.label}
                              displayValue={`${item.score}%`}
                            />
                            <span className="text-[9px] uppercase tracking-widest font-black text-slate-400 mt-0.5 text-center leading-none">{item.title}</span>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* =========================================================
                      SECTION 2 : SKILL GALAXY & TECH STACK COMPARISON
                      ========================================================= */}
                  <div className="p-6 rounded-3xl bg-[#0e1222]/60 border border-white/5 relative overflow-hidden shadow-2xl">
                    <h3 className="text-xs uppercase tracking-widest font-black text-white flex items-center gap-2 mb-6">
                      <FaCompass className="text-indigo-400" /> Interactive Skill Galaxy & Required Skills Comparison
                    </h3>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                      {/* Skill Galaxy Orbital central layout */}
                      <div className="relative h-64 bg-black/45 rounded-2xl border border-white/5 flex items-center justify-center overflow-hidden col-span-1 lg:col-span-2">
                        <div className="absolute w-44 h-44 rounded-full border border-white/5 animate-spin" style={{ animationDuration: "12s" }} />
                        <div className="absolute w-28 h-28 rounded-full border border-white/5 animate-spin" style={{ animationDuration: "8s", animationDirection: "reverse" }} />
                        
                        <motion.div
                          className="w-8 h-8 rounded-full bg-gradient-to-r from-emerald-400 to-indigo-500 flex items-center justify-center text-[8px] font-black text-white shadow-[0_0_20px_rgba(16,185,129,0.4)] relative z-10"
                          animate={{ scale: [1, 1.15, 1] }}
                          transition={{ repeat: Infinity, duration: 2.5 }}
                        >
                          AI
                        </motion.div>

                        {/* Floating Skill Constellations */}
                        {[
                          { name: "Frontend", x: -55, y: -45, color: "bg-cyan-400" },
                          { name: "Backend", x: 60, y: -30, color: "bg-purple-400" },
                          { name: "DSA", x: -40, y: 55, color: "bg-amber-400" },
                          { name: "Database", x: 65, y: 45, color: "bg-rose-400" },
                        ].map((node, index) => (
                          <motion.div
                            key={index}
                            className="absolute flex flex-col items-center gap-1 cursor-pointer"
                            style={{ x: node.x, y: node.y }}
                            whileHover={{ scale: 1.1 }}
                          >
                            <span className={`w-2.5 h-2.5 rounded-full ${node.color} shadow-[0_0_10px_rgba(255,255,255,0.2)]`} />
                            <span className="text-[8px] font-black uppercase text-slate-400 tracking-wider bg-[#030712]/95 px-1.5 py-0.5 rounded border border-white/5">{node.name}</span>
                          </motion.div>
                        ))}
                      </div>

                      {/* Skills Progress & Overlaps */}
                      <div className="col-span-1 lg:col-span-2 space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {[
                            { name: "Frontend", value: resumeResult.skills?.frontend || 0, color: "from-cyan-400 to-blue-500" },
                            { name: "Backend", value: resumeResult.skills?.backend || 0, color: "from-indigo-400 to-purple-500" },
                            { name: "DSA", value: resumeResult.skills?.dsa || 0, color: "from-amber-400 to-yellow-500" },
                            { name: "Database", value: resumeResult.skills?.database || 0, color: "from-purple-400 to-pink-500" },
                            { name: "AI/ML", value: resumeResult.skills?.aiml || 0, color: "from-rose-400 to-red-500" },
                            { name: "DevOps", value: resumeResult.skills?.devops || 0, color: "from-teal-400 to-emerald-500" },
                            { name: "Communication Skills", value: resumeResult.skills?.communication || 0, color: "from-emerald-400 to-teal-500" },
                            { name: "System Design", value: resumeResult.skills?.systemDesign || 0, color: "from-sky-400 to-cyan-500" },
                          ].map((item, idx) => {
                            const badge = item.value >= 90 ? "Master" : item.value >= 75 ? "Expert" : "Proficient";
                            return (
                              <div key={idx} className="p-3.5 rounded-xl bg-white/5 border border-white/5 space-y-1.5">
                                <div className="flex justify-between items-center">
                                  <span className="text-xs font-black text-slate-350">{item.name}</span>
                                  <span className="px-1.5 py-0.5 rounded bg-white/5 text-slate-400 text-[8px] font-black uppercase">{badge}</span>
                                </div>
                                <div className="flex items-center gap-3">
                                  <div className="w-full h-1.5 bg-black/40 rounded-full overflow-hidden">
                                    <motion.div
                                      initial={{ width: 0 }}
                                      animate={{ width: `${item.value}%` }}
                                      transition={{ duration: 1, delay: idx * 0.08 }}
                                      className={`h-full bg-gradient-to-r ${item.color}`}
                                    />
                                  </div>
                                  <span className="text-[10px] text-slate-400 font-black">{item.value}%</span>
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        {/* Hackathon Skills Match Comparison Box */}
                        <div className="p-4 rounded-2xl bg-indigo-950/10 border border-indigo-500/15 space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-[10px] uppercase tracking-wider font-black text-indigo-300">Target Technology Alignment</span>
                            <span className="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 text-[9px] font-black">{resumeResult.skillsMatchScore || 0}% Skills Match</span>
                          </div>

                          <div className="flex flex-wrap gap-2 items-center">
                            <span className="text-[10px] text-slate-400 font-bold">Missing Skills for selected track:</span>
                            {(resumeResult.missingSkills || []).map((sk, index) => (
                              <span key={index} className="px-2.5 py-1 rounded bg-rose-500/15 border border-rose-500/25 text-rose-300 text-[9px] font-black tracking-wide uppercase">
                                {sk}
                              </span>
                            ))}
                            {(resumeResult.missingSkills || []).length === 0 && (
                              <span className="text-[10px] text-emerald-400 font-bold">✓ Profile satisfies all track requirements!</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* =========================================================
                      SECTION 3 : AI PROBLEM SCANNER (NO LONG EXPLANATIONS)
                      ========================================================= */}
                  <div className="p-6 rounded-3xl bg-[#0e1222]/60 border border-white/5 relative overflow-hidden shadow-2xl text-left">
                    <div className="flex justify-between items-center mb-5">
                      <h3 className="text-xs uppercase tracking-widest font-black text-white flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" /> AI Resume Scanner Interface
                      </h3>
                      <span className="px-2.5 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 text-[10px] font-black uppercase">
                        🔍 Scanning Completed • {(resumeResult.resumeIssues || []).length} Issues Found
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                      {[
                        { title: "High Priority", color: "rose", list: (resumeResult.resumeIssues || []).filter(item => {
                            const name = (item.issue || "").toLowerCase();
                            if (name.includes("ats") && (resumeResult.atsScore || 0) >= 95) return false;
                            if (name.includes("ats") && (resumeResult.atsScore || 0) < 50) return true;
                            return item.priority === "HIGH";
                          })
                        },
                        { title: "Medium Priority", color: "amber", list: (resumeResult.resumeIssues || []).filter(item => {
                            const name = (item.issue || "").toLowerCase();
                            if (name.includes("ats") && (resumeResult.atsScore || 0) >= 95) return false;
                            if (name.includes("ats") && (resumeResult.atsScore || 0) < 50) return false;
                            return item.priority === "MEDIUM";
                          })
                        },
                        { title: "Low Priority", color: "cyan", list: (resumeResult.resumeIssues || []).filter(item => {
                            const name = (item.issue || "").toLowerCase();
                            if (name.includes("ats") && (resumeResult.atsScore || 0) >= 95) return false;
                            return item.priority === "LOW";
                          })
                        }
                      ].map((grp, gIdx) => {
                        const border = grp.color === "rose" ? "border-rose-500/15 bg-rose-950/10" : grp.color === "amber" ? "border-amber-500/15 bg-amber-950/10" : "border-cyan-500/15 bg-cyan-950/10";
                        const badge = grp.color === "rose" ? "bg-rose-500/20 border-rose-500/30 text-rose-300" : grp.color === "amber" ? "bg-amber-500/20 border-amber-500/30 text-amber-300" : "bg-cyan-500/20 border-cyan-500/30 text-cyan-300";
                        
                        return (
                          <div key={gIdx} className={`p-5 rounded-2xl border space-y-4 ${border}`}>
                            <span className={`px-2 py-0.5 rounded border text-[9px] font-black uppercase tracking-wider ${badge}`}>
                              {grp.title}
                            </span>
                            
                            <div className="space-y-3">
                              {grp.list.map((issue, idx) => (
                                <div key={idx} className="p-3.5 rounded-xl bg-black/45 border border-white/5 flex justify-between items-center gap-4">
                                  <div>
                                    <h4 className="text-xs font-black text-white">{issue.issue}</h4>
                                    <span className={`text-[8px] font-black uppercase mt-1 block text-${grp.color}-400`}>
                                      {issue.priority} SEVERITY
                                    </span>
                                  </div>
                                  <button className={`px-2.5 py-1.5 rounded-lg border text-[9px] font-black transition cursor-pointer bg-${grp.color}-500/15 border-${grp.color}-500/20 text-${grp.color}-300 hover:bg-${grp.color}-500/25`}>
                                    Improve
                                  </button>
                                </div>
                              ))}
                              
                              {grp.list.length === 0 && (
                                <p className="text-[10px] text-slate-500 italic">No issues flagged in this bracket.</p>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* =========================================================
                      SECTION 4 : PROFILE SUPER POWERS & TEAM CONTRIBUTION
                      ========================================================= */}
                  <div className="p-6 rounded-3xl bg-[#0e1222]/60 border border-white/5 relative overflow-hidden shadow-2xl">
                    <h3 className="text-xs uppercase tracking-widest font-black text-white flex items-center gap-2 mb-5">
                      <FaStar className="text-yellow-400" /> Profile Super Powers & Team Contribution
                    </h3>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      {/* Dynamic Achievement Badges */}
                      <div className="lg:col-span-2 space-y-5">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {(() => {
                            const unlockedBadges = [];
                            if ((resumeResult.skills?.frontend || 0) >= 90) {
                              unlockedBadges.push({ title: "Frontend Master", rank: "Gold Badge", color: "from-amber-400 to-yellow-600", desc: "Advanced DOM & state UI skills" });
                            }
                            if ((resumeResult.skills?.dsa || 0) >= 75) {
                              unlockedBadges.push({ title: "Problem Solver", rank: "Gold Badge", color: "from-amber-400 to-yellow-600", desc: "Robust data structure analysis" });
                            }
                            if ((resumeResult.skills?.communication || 0) >= 80) {
                              unlockedBadges.push({ title: "Team Player", rank: "Silver Badge", color: "from-slate-350 to-slate-500", desc: "Excellent integration synergy" });
                            }
                            if ((resumeResult.skills?.backend || 0) >= 50) {
                              unlockedBadges.push({ title: "Fast Learner", rank: "Silver Badge", color: "from-slate-350 to-slate-500", desc: "Swift project adaptation" });
                            }
                            if ((resumeResult.skills?.systemDesign || 0) >= 60) {
                              unlockedBadges.push({ title: "Leadership Skills", rank: "Bronze Badge", color: "from-amber-700 to-amber-900", desc: "Project scoping alignment" });
                            }
                            if ((resumeResult.skills?.aiml || 0) >= 60) {
                              unlockedBadges.push({ title: "Creative Thinker", rank: "Bronze Badge", color: "from-amber-700 to-amber-900", desc: "Out-of-box track architecture" });
                            }
                            if ((resumeResult.hackathonScore || 0) >= 90) {
                              unlockedBadges.push({ title: "Hackathon Ready", rank: "Gold Special", color: "from-purple-400 to-indigo-600 animate-pulse", desc: "Elite contest contender" });
                            }

                            return unlockedBadges.map((badge, idx) => (
                              <motion.div
                                key={idx}
                                whileHover={{ y: -3, scale: 1.02 }}
                                className="p-4 rounded-2xl bg-black/40 border border-white/5 flex items-center gap-4 hover:border-amber-500/20 transition-all select-none"
                              >
                                <div className={`w-11 h-11 rounded-full bg-gradient-to-br ${badge.color} flex items-center justify-center text-white text-xs font-black shadow-[0_0_15px_rgba(245,158,11,0.1)]`}>
                                  🏆
                                </div>
                                <div>
                                  <h4 className="text-xs font-black text-white">{badge.title}</h4>
                                  <span className="text-[8px] font-black uppercase text-slate-500 tracking-wider block mt-0.5">
                                    {badge.rank} • {badge.desc}
                                  </span>
                                </div>
                              </motion.div>
                            ));
                          })()}
                        </div>

                        {/* Recommended Role dynamic card */}
                        <div className="p-4 rounded-2xl bg-[#030712]/50 border border-emerald-500/25 flex items-center justify-between">
                          <div className="space-y-1">
                            <span className="text-[9px] uppercase tracking-wider font-black text-emerald-450 block">AI Recommended Role</span>
                            <h4 className="text-sm font-black text-white tracking-wide uppercase">{resumeResult.recommendedRole || "Full Stack Developer"}</h4>
                          </div>
                          <span className="px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-450 text-[10px] font-black uppercase">
                            Best Match
                          </span>
                        </div>
                      </div>

                      {/* Team Contribution Scorecard */}
                      <div className="p-5 rounded-2xl bg-black/35 border border-white/5 space-y-4 flex flex-col justify-between">
                        <div>
                          <span className="text-[9px] uppercase tracking-widest font-black text-slate-500">Value Proposition</span>
                          <h4 className="text-xs font-black text-white mt-1">Predicted Team Contribution</h4>
                        </div>
                        
                        <div className="space-y-3">
                          {[
                            { name: "UI Contribution", score: resumeResult.teamContribution?.ui || 90, color: "from-cyan-400 to-blue-500" },
                            { name: "Backend Contribution", score: resumeResult.teamContribution?.backend || 80, color: "from-indigo-400 to-purple-500" },
                            { name: "Presentation/Pitch", score: resumeResult.teamContribution?.presentation || 85, color: "from-amber-400 to-yellow-500" },
                            { name: "Leadership", score: resumeResult.teamContribution?.leadership || 70, color: "from-purple-400 to-pink-500" },
                            { name: "Problem Solving", score: resumeResult.teamContribution?.problemSolving || 75, color: "from-emerald-400 to-teal-500" },
                          ].map((item, idx) => (
                            <div key={idx} className="space-y-1">
                              <div className="flex justify-between text-[10px] font-black text-slate-350">
                                <span>{item.name}</span>
                                <span>{item.score}%</span>
                              </div>
                              <div className="w-full h-1 bg-black/45 rounded-full overflow-hidden">
                                <div className={`h-full bg-gradient-to-r ${item.color}`} style={{ width: `${item.score}%` }} />
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Map layout indicator */}
                        <div className="flex justify-between items-center text-[8px] text-slate-500 font-black tracking-wider uppercase mt-1">
                          <span>Synergy Forecast</span>
                          <span className="text-emerald-400 font-black">Ready</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* =========================================================
                      SECTION 5 : AI RESUME BUILDER
                      ========================================================= */}
                  <div className="p-6 rounded-3xl bg-[#0e1222]/60 border border-white/5 relative overflow-hidden shadow-2xl text-left">
                    <h3 className="text-xs uppercase tracking-widest font-black text-white flex items-center gap-2 mb-5">
                      <FaBriefcase className="text-cyan-400" /> Resume Profile Completeness System
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                      {[
                        { name: "Resume Completion", value: resumeResult.completion?.projects ? Math.min(100, Math.floor((resumeResult.completion.projects + resumeResult.completion.skills + resumeResult.completion.ats) / 3)) : 78 },
                        { name: "Projects Completion", value: resumeResult.completion?.projects || 45 },
                        { name: "ATS Optimization", value: resumeResult.completion?.ats || 65 },
                        { name: "Github Profile", value: resumeResult.completion?.github || 35 },
                        { name: "Skills Section", value: resumeResult.completion?.skills || 90 },
                        { name: "Summary Section", value: resumeResult.completion?.summary || 80 },
                      ].map((item, idx) => (
                        <div key={idx} className="p-5 rounded-2xl bg-black/40 border border-white/5 flex flex-col justify-between gap-4">
                          <div className="flex justify-between items-center gap-3">
                            <span className="text-xs font-black text-white">{item.name}</span>
                            <span className="text-xs font-black text-slate-400">{item.value}%</span>
                          </div>
                          
                          <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${item.value}%` }}
                              className="h-full bg-gradient-to-r from-cyan-400 to-indigo-500"
                            />
                          </div>

                          <div className="grid grid-cols-4 gap-1 mt-2">
                            <button className="py-1 rounded bg-white/5 hover:bg-white/10 text-[9px] font-black text-slate-350 transition uppercase cursor-pointer">
                              Improve
                            </button>
                            <button className="py-1 rounded bg-white/5 hover:bg-white/10 text-[9px] font-black text-slate-350 transition uppercase cursor-pointer">
                              Preview
                            </button>
                            <button className="py-1 rounded bg-white/5 hover:bg-white/10 text-[9px] font-black text-slate-350 transition uppercase cursor-pointer">
                              Regen
                            </button>
                            <button className="py-1 rounded bg-white/5 hover:bg-white/10 text-[9px] font-black text-slate-350 transition uppercase cursor-pointer">
                              Copy
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* =========================================================
                      SECTION 6 : AI CO PILOT (SUITABLE TRACKS NEON METERS)
                      ========================================================= */}
                  <div className="p-6 rounded-3xl bg-[#0e1222]/60 border border-white/5 relative overflow-hidden shadow-2xl text-left">
                    <h3 className="text-xs uppercase tracking-widest font-black text-white flex items-center gap-2 mb-5">
                      <FaRobot className="text-purple-400 animate-pulse" /> AI Co-Pilot Growth & Track Compatibility
                    </h3>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
                      {/* Metric Growth Cards */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 col-span-1 lg:col-span-2">
                        <div className="p-5 rounded-2xl bg-black/40 border border-white/5 space-y-3">
                          <span className="text-[9px] uppercase tracking-widest font-black text-slate-500 block">Placement Forecast</span>
                          <div className="flex items-baseline gap-2">
                            <span className="text-3xl font-black text-white">{resumeResult.prediction?.placementProbability || 82}%</span>
                            <span className="text-xs text-emerald-450 font-black">
                              {resumeResult.prediction?.placementProbability >= 85 ? "▲ Strong Placement Odds" : "▲ Ready"}
                            </span>
                          </div>
                          <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                            <div className="h-full bg-emerald-500" style={{ width: `${resumeResult.prediction?.placementProbability || 82}%` }} />
                          </div>
                        </div>

                        <div className="p-5 rounded-2xl bg-black/40 border border-white/5 space-y-3">
                          <span className="text-[9px] uppercase tracking-widest font-black text-slate-500 block">Hackathon Scorecard</span>
                          <div className="flex items-baseline gap-2">
                            <span className="text-3xl font-black text-white">{resumeResult.prediction?.hackathonProbability || 91}%</span>
                            <span className="text-xs text-purple-450 font-black">▲ High Synergy</span>
                          </div>
                          <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                            <div className="h-full bg-purple-500" style={{ width: `${resumeResult.prediction?.hackathonProbability || 91}%` }} />
                          </div>
                        </div>

                        {/* Profile Growth Projection Graph */}
                        <div className="p-5 rounded-2xl bg-black/40 border border-white/5 space-y-3 col-span-1 md:col-span-2 flex flex-col justify-between">
                          <div className="flex justify-between items-center">
                            <span className="text-[9px] uppercase tracking-widest font-black text-slate-500">Synergy Growth Target</span>
                            <span className="text-[10px] text-emerald-400 font-black uppercase">
                              Growth Potential: +{(resumeResult.prediction?.growthPotential || 95) - (resumeResult.overallScore || 65)}%
                            </span>
                          </div>
                          
                          <div className="flex items-center gap-4 my-2">
                            <span className="text-xs text-slate-400">Current: {resumeResult.overallScore || 65}%</span>
                            <div className="w-full h-2.5 bg-black/55 rounded-full relative overflow-hidden">
                              <div className="absolute top-0 bottom-0 left-0 bg-slate-600" style={{ width: `${resumeResult.overallScore || 65}%` }} />
                              <motion.div
                                initial={{ width: `${resumeResult.overallScore || 65}%` }}
                                animate={{ width: `${resumeResult.prediction?.growthPotential || 92}%` }}
                                className="absolute top-0 bottom-0 left-0 bg-emerald-500"
                                transition={{ duration: 1.5, repeat: Infinity, repeatType: "reverse" }}
                              />
                            </div>
                            <span className="text-xs text-emerald-400 font-black">
                              {resumeResult.prediction?.growthPotential > 90 ? `Future Potential: ${resumeResult.prediction.growthPotential}%` : `Target: ${resumeResult.prediction?.growthPotential}%`}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Dynamic Neon Suitable Tracks meters */}
                      <div className="p-5 rounded-2xl bg-[#030712]/50 border border-purple-500/10 space-y-4">
                        <span className="text-[9px] uppercase tracking-widest font-black text-slate-500 block">Suitable Tracks & Fit</span>
                        <div className="space-y-3">
                          {(resumeResult.suitableTracks || []).map((t, idx) => (
                            <div key={idx} className="space-y-1">
                              <div className="flex justify-between text-[10px] font-bold">
                                <span className="text-slate-300">{t.track}</span>
                                <span className="text-emerald-400 font-black">{t.score}%</span>
                              </div>
                              <div className="w-full h-1 bg-black/40 rounded-full overflow-hidden">
                                <div className="h-full bg-emerald-500" style={{ width: `${t.score}%` }} />
                              </div>
                            </div>
                          ))}
                          {(resumeResult.suitableTracks || []).length === 0 && (
                            <>
                              <div className="space-y-1">
                                <div className="flex justify-between text-[10px] font-bold">
                                  <span className="text-slate-300">AI</span>
                                  <span className="text-emerald-400 font-black">95%</span>
                                </div>
                                <div className="w-full h-1 bg-black/40 rounded-full overflow-hidden"><div className="h-full bg-emerald-500" style={{ width: "95%" }} /></div>
                              </div>
                              <div className="space-y-1">
                                <div className="flex justify-between text-[10px] font-bold">
                                  <span className="text-slate-300">Web Development</span>
                                  <span className="text-emerald-400 font-black">97%</span>
                                </div>
                                <div className="w-full h-1 bg-black/40 rounded-full overflow-hidden"><div className="h-full bg-emerald-500" style={{ width: "97%" }} /></div>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Suggestions list (Max 4 suggestions) */}
                    <div className="p-5 rounded-2xl bg-black/35 border border-white/5 space-y-3 mt-6">
                      <span className="text-[9px] uppercase tracking-widest font-black text-slate-500 block">AI Micro Recommendations</span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                        {(resumeResult.suggestions || []).slice(0, 4).map((sug, idx) => (
                          <div key={idx} className="p-3 rounded-xl bg-[#030712]/75 border border-white/5 text-xs text-slate-300 font-bold flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                            {sug.startsWith("+") ? sug : `+ ${sug}`}
                          </div>
                        ))}
                        {(resumeResult.suggestions || []).length === 0 && (
                          <>
                            <div className="p-3 rounded-xl bg-[#030712]/75 border border-white/5 text-xs text-slate-300 font-bold flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />+ Add Projects</div>
                            <div className="p-3 rounded-xl bg-[#030712]/75 border border-white/5 text-xs text-slate-300 font-bold flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />+ Learn Docker</div>
                            <div className="p-3 rounded-xl bg-[#030712]/75 border border-white/5 text-xs text-slate-300 font-bold flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />+ Improve ATS</div>
                            <div className="p-3 rounded-xl bg-[#030712]/75 border border-white/5 text-xs text-slate-300 font-bold flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />+ Improve DSA</div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* =========================================================
                      SECTION 7 : DOWNLOAD CENTER
                      ========================================================= */}
                  <div className="flex flex-wrap items-center justify-center gap-4 pt-6 border-t border-white/5">
                    <motion.button
                      whileHover={{ scale: 1.025, y: -2 }}
                      whileTap={{ scale: 0.975 }}
                      onClick={handleDownloadReport}
                      className="px-5 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-xs font-black flex items-center gap-2 hover:shadow-[0_0_15px_rgba(16,185,129,0.25)] transition-all cursor-pointer"
                    >
                      <FaDownload /> Download PDF Report
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.025, y: -2 }}
                      whileTap={{ scale: 0.975 }}
                      onClick={handleCopyReport}
                      className="px-5 py-3 rounded-xl bg-[#030712]/60 border border-white/10 text-slate-350 hover:text-white text-xs font-black flex items-center gap-2 transition-all cursor-pointer"
                    >
                      <FaSave /> Save Analysis
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.025, y: -2 }}
                      whileTap={{ scale: 0.975 }}
                      className="px-5 py-3 rounded-xl bg-[#030712]/60 border border-white/10 text-slate-350 hover:text-white text-xs font-black flex items-center gap-2 transition-all cursor-pointer"
                    >
                      <FaLink /> Share Analysis
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.025, y: -2 }}
                      whileTap={{ scale: 0.975 }}
                      onClick={handleResumeUpload}
                      className="px-5 py-3 rounded-xl bg-[#030712]/60 border border-white/10 text-slate-350 hover:text-amber-400 text-xs font-black flex items-center gap-2 transition-all cursor-pointer"
                    >
                      <FaRocket /> Re-generate Analysis
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.025, y: -2 }}
                      whileTap={{ scale: 0.975 }}
                      className="px-5 py-3 rounded-xl bg-[#030712]/60 border border-white/10 text-slate-350 hover:text-cyan-400 text-xs font-black flex items-center gap-2 transition-all cursor-pointer"
                    >
                      <FaFileAlt /> View Full Report
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.025, y: -2 }}
                      whileTap={{ scale: 0.975 }}
                      onClick={() => { setResumeFile(null); setResumeResult(null); }}
                      className="px-5 py-3 rounded-xl bg-[#030712]/60 border border-rose-500/20 text-rose-300 hover:bg-rose-500/10 text-xs font-black flex items-center gap-2 transition-all cursor-pointer"
                    >
                      Re-upload Resume PDF
                    </motion.button>
                  </div>

                </motion.div>
              )}
            </motion.div>
          )}
          {activeTab === "ideas" && (
            <motion.div key="ideas" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }} className="space-y-5">
              <div className="flex gap-2">
                {[
                  { id: "skills", label: "Skills Context", icon: <FaCode /> },
                  { id: "domain", label: "Industry Domain", icon: <FaCompass /> },
                  { id: "hackathon", label: "Hackathon Track", icon: <FaGraduationCap /> },
                ].map((mode) => (
                  <motion.button
                    key={mode.id}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => setIdeaMode(mode.id)}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-bold border transition-all duration-300 ${
                      ideaMode === mode.id
                        ? "bg-amber-500/15 text-amber-300 border-amber-500/25 shadow-[0_0_15px_rgba(245,158,11,0.15)]"
                        : "bg-[#0e1222]/50 text-slate-500 border-white/5 hover:text-slate-300"
                    }`}
                  >
                    {mode.icon} {mode.label}
                  </motion.button>
                ))}
              </div>

              <div className="p-6 rounded-2xl bg-[#0e1222]/50 border border-white/5 backdrop-blur-xl space-y-4">
                {ideaMode === "skills" && (
                  <div className="space-y-3">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block text-left">Custom Skillset Context (Press Enter to Add)</label>
                    <div className="flex gap-2">
                      <input
                        value={skillInput}
                        onChange={(e) => setSkillInput(e.target.value)}
                        onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addSkill(); } }}
                        placeholder="e.g. React Native, Node.js, Web3.js..."
                        className="flex-1 bg-[#030712]/60 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-amber-500/50 transition-colors"
                      />
                      <button onClick={addSkill} className="p-3 rounded-xl bg-amber-500/15 border border-amber-500/25 text-amber-400 hover:bg-amber-500/25 transition">
                        <FaPlus />
                      </button>
                    </div>
                    {customSkills.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {customSkills.map((s) => (
                          <span key={s} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-bold">
                            {s}
                            <FaTimes className="cursor-pointer hover:text-red-400 transition" onClick={() => setCustomSkills(customSkills.filter((x) => x !== s))} />
                          </span>
                        ))}
                      </div>
                    )}
                    <div className="p-3.5 rounded-xl bg-[#030712]/40 border border-white/5 text-[11px] text-slate-450 leading-normal text-left">
                      💡 <strong>Active Context:</strong>{" "}
                      {customSkills.length > 0
                        ? "Using the manually entered skills above to guide generation."
                        : "No manual skills entered. The AI will automatically analyze your resume skills, profile skills, and team composition skills."}
                    </div>
                  </div>
                )}

                {ideaMode === "domain" && (
                  <div className="space-y-3">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block text-left">Select Industry Domain</label>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                      {DOMAINS.map((d) => (
                        <button
                          key={d}
                          onClick={() => setSelectedDomain(d)}
                          className={`py-2.5 rounded-xl text-xs font-bold border transition-all ${
                            selectedDomain === d
                              ? "bg-amber-500/15 text-amber-300 border-amber-500/25"
                              : "bg-[#030712]/50 text-slate-500 border-white/5 hover:text-slate-300"
                          }`}
                        >
                          {d}
                        </button>
                      ))}
                    </div>
                    <p className="text-[10px] text-slate-500 text-left mt-1">Note: Industry Domain specifies the market sector/domain and never overrides the core hackathon theme.</p>
                  </div>
                )}

                {ideaMode === "hackathon" && (
                  <div className="space-y-4 text-left">
                    {hackathonId && recommendedTracks.length > 0 && (
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                          AI Recommended Tracks (Select One)
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {recommendedTracks.map((track) => (
                            <button
                              key={track}
                              onClick={() => {
                                setSelectedTrack(track);
                                setCustomTrack("");
                              }}
                              className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                                selectedTrack === track
                                  ? "bg-amber-500/15 text-amber-300 border-amber-500/25 shadow-[0_0_10px_rgba(245,158,11,0.15)]"
                                  : "bg-[#030712]/45 text-slate-400 border-white/5 hover:text-slate-300"
                              }`}
                            >
                              {track}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                        {hackathonId ? "Or Specify Custom Track / Theme Override" : "Specify Custom Track / Theme"}
                      </label>
                      <input
                        value={customTrack}
                        onChange={(e) => {
                          setCustomTrack(e.target.value);
                          setSelectedTrack("");
                        }}
                        placeholder="e.g. Peer-to-peer carbon trading, VR-guided medical therapy..."
                        className="w-full bg-[#030712]/60 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-amber-500/50 transition-colors"
                      />
                    </div>
                  </div>
                )}

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleGenerateIdeas}
                  disabled={ideasLoading}
                  className="w-full py-4 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 text-white text-sm font-bold flex items-center justify-center gap-2 hover:shadow-[0_0_25px_rgba(245,158,11,0.3)] transition-all disabled:opacity-50"
                >
                  <FaRocket /> {ideasLoading ? "Conceptualizing Project Tracks..." : "Generate Project Ideas"}
                </motion.button>
              </div>

              {ideasLoading && (
                <div className="p-8 rounded-2xl bg-[#0e1222]/60 border border-amber-500/15 backdrop-blur-xl space-y-6">
                  <div className="flex items-center justify-center gap-3 mb-4">
                    <div className="relative">
                      <div className="w-12 h-12 rounded-full border-2 border-amber-500/30 border-t-amber-400 animate-spin" />
                      <FaRocket className="absolute inset-0 m-auto text-amber-400 text-lg animate-pulse" />
                    </div>
                    <div className="text-left">
                      <p className="text-white font-bold text-sm">Gemini AI is crafting project ideas...</p>
                      <p className="text-slate-500 text-xs">Analyzing context & generating blueprints</p>
                    </div>
                  </div>
                  <div className="space-y-3 text-left">
                    {["Loading hackathon context...", "Analyzing team skills...", "Generating innovative concepts...", "Building technical blueprints...", "Estimating winning probabilities..."].map((step, i) => (
                      <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.5 }} className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                        <span className="text-xs text-slate-400">{step}</span>
                      </motion.div>
                    ))}
                  </div>
                  <div className="grid grid-cols-3 gap-3 mt-4">
                    {[1,2,3].map(i => (
                      <div key={i} className="h-24 rounded-xl bg-white/5 animate-pulse" />
                    ))}
                  </div>
                </div>
              )}
              {!ideasLoading && ideas.length > 0 && (
                <div className="space-y-6">
                  {/* Ideas Grid */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                    {ideas.map((idea, i) => {
                      const isBookmarked = bookmarkedIdeas.some(item => item.title === idea.title);
                      const isSaved = savedIdeas.some(item => item.title === idea.title);
                      
                      return (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, y: 30 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.12 }}
                          whileHover={{ y: -6, scale: 1.01 }}
                          className="p-6 rounded-3xl bg-[#0e1222]/60 border border-white/5 hover:border-amber-500/25 backdrop-blur-2xl transition-all relative overflow-hidden text-left flex flex-col gap-4 shadow-lg group"
                        >
                          {/* Radial Glow */}
                          <div className="absolute -top-12 -right-12 w-32 h-32 bg-amber-500/10 rounded-full blur-3xl pointer-events-none transition-all group-hover:bg-amber-500/20" />
                          
                          <div className="relative z-10 flex flex-col gap-4 flex-1">
                            {/* Card Top: Win Odds & Actions */}
                            <div className="flex justify-between items-center gap-3">
                              <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-black uppercase tracking-wider border border-emerald-500/15">
                                🎯 {idea.winningProbability || 85}% Win Odds
                              </span>
                              
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={(e) => { e.stopPropagation(); handleCopyIdea(idea); }}
                                  title="Copy Pitch Markdown"
                                  className="w-7 h-7 rounded-lg bg-white/5 border border-white/5 hover:border-amber-500/30 hover:bg-white/10 text-slate-400 hover:text-amber-300 transition flex items-center justify-center text-xs"
                                >
                                  <FaCopy />
                                </button>
                                <button
                                  onClick={(e) => { e.stopPropagation(); handleBookmarkIdea(idea); }}
                                  title="Bookmark"
                                  className={`w-7 h-7 rounded-lg border transition flex items-center justify-center text-xs ${
                                    isBookmarked
                                      ? "bg-amber-500/10 border-amber-500/30 text-amber-300"
                                      : "bg-white/5 border-white/5 hover:border-amber-500/30 hover:bg-white/10 text-slate-400 hover:text-amber-300"
                                  }`}
                                >
                                  <FaStar />
                                </button>
                                <button
                                  onClick={(e) => { e.stopPropagation(); handleSaveIdea(idea); }}
                                  title="Save Idea"
                                  className={`w-7 h-7 rounded-lg border transition flex items-center justify-center text-xs ${
                                    isSaved
                                      ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                                      : "bg-white/5 border-white/5 hover:border-emerald-500/30 hover:bg-white/10 text-slate-400 hover:text-emerald-300"
                                  }`}
                                >
                                  <FaSave />
                                </button>
                                <button
                                  onClick={(e) => { e.stopPropagation(); handleDownloadPDF(idea); }}
                                  title="Download Pitch Report"
                                  className="w-7 h-7 rounded-lg bg-white/5 border border-white/5 hover:border-cyan-500/30 hover:bg-white/10 text-slate-400 hover:text-cyan-300 transition flex items-center justify-center text-xs"
                                >
                                  <FaDownload />
                                </button>
                              </div>
                            </div>

                            {/* Project Title */}
                            <div>
                              <h3 className="text-base font-black bg-gradient-to-r from-amber-200 via-amber-300 to-orange-300 bg-clip-text text-transparent group-hover:from-white group-hover:to-amber-300 transition-colors">
                                {idea.title}
                              </h3>
                              <p className="text-[10px] text-slate-500 font-semibold mt-0.5">{idea.difficulty || "Intermediate"} Level • {idea.estimatedCompletionTime || "36 Hours"}</p>
                            </div>

                            {/* Problem Solved */}
                            <div>
                              <p className="text-[9px] text-slate-500 uppercase font-black tracking-widest">Problem Solved</p>
                              <p className="text-xs text-slate-350 mt-1 leading-relaxed line-clamp-3">{idea.problemStatement}</p>
                            </div>

                            {/* Tech Stack Pills */}
                            <div>
                              <p className="text-[9px] text-slate-500 uppercase font-black tracking-widest mb-1.5">Stack Components</p>
                              <div className="flex flex-wrap gap-1">
                                {idea.techStack?.frontend && <span className="px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 text-[9px] font-bold">FE: {idea.techStack.frontend}</span>}
                                {idea.techStack?.backend && <span className="px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-[9px] font-bold">BE: {idea.techStack.backend}</span>}
                                {idea.techStack?.database && <span className="px-2 py-0.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/20 text-[9px] font-bold">DB: {idea.techStack.database}</span>}
                                {idea.techStack?.ai && <span className="px-2 py-0.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20 text-[9px] font-bold">AI: {idea.techStack.ai}</span>}
                                {idea.techStack?.cloud && <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[9px] font-bold">Cloud: {idea.techStack.cloud}</span>}
                              </div>
                            </div>

                            {/* Score bars */}
                            <div className="grid grid-cols-2 gap-4 pt-1.5 border-t border-white/5">
                              <div>
                                <div className="flex justify-between text-[9px] text-slate-400 uppercase font-black tracking-wider mb-1">
                                  <span>Innovation</span>
                                  <span>{idea.innovationScore || 90}%</span>
                                </div>
                                <div className="w-full h-1 bg-white/5 rounded overflow-hidden">
                                  <div className="h-full bg-amber-500" style={{ width: `${idea.innovationScore || 90}%` }} />
                                </div>
                              </div>
                              <div>
                                <div className="flex justify-between text-[9px] text-slate-400 uppercase font-black tracking-wider mb-1">
                                  <span>Judging Score</span>
                                  <span>{idea.judgingScorePrediction || 88}%</span>
                                </div>
                                <div className="w-full h-1 bg-white/5 rounded overflow-hidden">
                                  <div className="h-full bg-indigo-500" style={{ width: `${idea.judgingScorePrediction || 88}%` }} />
                                </div>
                              </div>
                            </div>

                            {/* Fit Summary */}
                            {idea.whyThisFits && (
                              <div className="text-[10px] text-emerald-400 bg-emerald-950/20 border border-emerald-500/10 p-2.5 rounded-xl leading-normal">
                                💡 <strong>Fit Analysis: </strong>{idea.whyThisFits}
                              </div>
                            )}

                            {/* Launch Blueprint CTA */}
                            <button
                              onClick={() => setSelectedBlueprint(idea)}
                              className="mt-auto py-2.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/25 border border-amber-500/25 text-amber-300 text-xs font-black flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                            >
                              <FaCompass /> View Technical Blueprint
                            </button>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>

                  {/* Visual blueprint overlay modal */}
                  {selectedBlueprint && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
                      <motion.div
                        initial={{ scale: 0.95, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        className="bg-[#0e1222]/95 border border-white/10 rounded-[32px] max-w-4xl w-full p-8 space-y-6 max-h-[90vh] overflow-y-auto shadow-2xl relative text-left"
                      >
                        {/* Background Accents */}
                        <div className="absolute -top-32 -left-32 w-72 h-72 bg-amber-500/5 blur-3xl rounded-full pointer-events-none" />
                        <div className="absolute -bottom-32 -right-32 w-72 h-72 bg-purple-500/5 blur-3xl rounded-full pointer-events-none" />

                        {/* Close button */}
                        <button
                          onClick={() => setSelectedBlueprint(null)}
                          className="absolute top-6 right-6 w-8 h-8 rounded-full bg-white/5 hover:bg-slate-900 border border-white/5 flex items-center justify-center text-slate-400 hover:text-white transition cursor-pointer"
                        >
                          <FaTimes />
                        </button>

                        {/* Modal Header */}
                        <div className="space-y-3">
                          <div className="flex flex-wrap gap-2 items-center">
                            <span className="px-3 py-1 rounded bg-amber-500/15 border border-amber-500/20 text-amber-400 text-[10px] font-black uppercase tracking-wider">
                              ⭐ {selectedBlueprint.winningProbability || 90}% Win Odds
                            </span>
                            <span className="px-3 py-1 rounded bg-purple-500/15 border border-purple-500/20 text-purple-400 text-[10px] font-black uppercase tracking-wider">
                              ⚡ {selectedBlueprint.innovationScore || 90}/100 Innovation
                            </span>
                            <span className="px-3 py-1 rounded bg-indigo-500/15 border border-indigo-500/20 text-indigo-400 text-[10px] font-black uppercase tracking-wider">
                              📊 {selectedBlueprint.judgingScorePrediction || 88}/100 Judging Predictor
                            </span>
                          </div>
                          
                          <h2 className="text-xl md:text-2xl font-black text-white bg-gradient-to-r from-amber-300 via-amber-200 to-orange-300 bg-clip-text text-transparent">
                            {selectedBlueprint.title}
                          </h2>
                          <p className="text-xs text-slate-400 leading-relaxed">{selectedBlueprint.description}</p>
                          
                          {/* Why win pitch */}
                          {selectedBlueprint.whyItCanWin && (
                            <div className="p-3.5 rounded-xl border border-amber-500/20 bg-amber-950/20 text-xs text-amber-300 leading-normal">
                              🎯 <strong>Why this project can win:</strong> "{selectedBlueprint.whyItCanWin}"
                            </div>
                          )}
                        </div>

                        {/* Quick Toolbar */}
                        <div className="flex flex-wrap gap-3 p-4 rounded-2xl bg-white/5 border border-white/5">
                          <button onClick={() => handleCopyIdea(selectedBlueprint)} className="px-4 py-2 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 text-slate-300 hover:text-white text-xs font-bold flex items-center gap-1.5 transition">
                            <FaCopy /> Copy Markdown
                          </button>
                          <button onClick={() => handleBookmarkIdea(selectedBlueprint)} className={`px-4 py-2 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition ${
                            bookmarkedIdeas.some(item => item.title === selectedBlueprint.title)
                              ? "bg-amber-500/10 border-amber-500/30 text-amber-300"
                              : "bg-white/5 border-white/5 hover:bg-white/10 text-slate-300 hover:text-amber-300"
                          }`}>
                            <FaStar /> Bookmark
                          </button>
                          <button onClick={() => handleSaveIdea(selectedBlueprint)} className={`px-4 py-2 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition ${
                            savedIdeas.some(item => item.title === selectedBlueprint.title)
                              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                              : "bg-white/5 border-white/5 hover:bg-white/10 text-slate-300 hover:text-emerald-300"
                          }`}>
                            <FaSave /> Save Project
                          </button>
                          <button onClick={() => handleDownloadPDF(selectedBlueprint)} className="px-4 py-2 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 text-slate-300 hover:text-cyan-400 text-xs font-bold flex items-center gap-1.5 transition">
                            <FaDownload /> Download Report
                          </button>
                        </div>

                        {/* Details Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          {/* Architecture Explanation */}
                          <div className="p-5 rounded-2xl bg-[#030712]/50 border border-white/5 space-y-2.5 flex flex-col col-span-2 text-left">
                            <h4 className="text-xs uppercase tracking-widest font-black text-white flex items-center gap-2">
                              <FaCompass className="text-amber-400" /> Architecture & Data Flow
                            </h4>
                            <p className="text-xs text-slate-350 leading-relaxed whitespace-pre-line flex-1">{selectedBlueprint.architectureExplanation}</p>
                          </div>

                          {/* Key Features */}
                          <div className="p-5 rounded-2xl bg-[#030712]/50 border border-white/5 space-y-2.5 flex flex-col text-left">
                            <h4 className="text-xs uppercase tracking-widest font-black text-white flex items-center gap-2">
                              <FaBolt className="text-yellow-400" /> Core Features
                            </h4>
                            <ul className="space-y-2 text-xs text-slate-350 pl-4 list-disc flex-1">
                              {(selectedBlueprint.features || []).map((feat, idx) => (
                                <li key={idx} className="leading-relaxed">{feat}</li>
                              ))}
                            </ul>
                          </div>
                        </div>

                        {/* Specs Code Viewports */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {/* Directory tree */}
                          <div className="p-5 rounded-2xl bg-[#030712]/50 border border-white/5 space-y-2.5 text-left">
                            <h4 className="text-xs uppercase tracking-widest font-black text-white flex items-center gap-2">
                              <FaCode className="text-cyan-400" /> Directory Structure
                            </h4>
                            <pre className="text-[10px] text-cyan-300/80 font-mono bg-[#030712] p-4 rounded-xl overflow-x-auto border border-white/5 leading-relaxed max-h-[220px] overflow-y-auto">
                              {selectedBlueprint.folderStructure}
                            </pre>
                          </div>

                          {/* Database Schemas */}
                          <div className="p-5 rounded-2xl bg-[#030712]/50 border border-white/5 space-y-2.5 text-left">
                            <h4 className="text-xs uppercase tracking-widest font-black text-white flex items-center gap-2">
                              <FaDatabase className="text-purple-400" /> Database schemas
                            </h4>
                            <pre className="text-[10px] text-purple-300/80 font-mono bg-[#030712] p-4 rounded-xl overflow-x-auto border border-white/5 leading-relaxed max-h-[220px] overflow-y-auto">
                              {selectedBlueprint.databaseDesign}
                            </pre>
                          </div>
                        </div>

                        {/* API Suggestions */}
                        <div className="p-5 rounded-2xl bg-[#030712]/50 border border-white/5 space-y-2.5 text-left">
                          <h4 className="text-xs uppercase tracking-widest font-black text-white flex items-center gap-2">
                            <FaLink className="text-emerald-400" /> Suggested API Endpoints
                          </h4>
                          <pre className="text-[10px] text-emerald-300/80 font-mono bg-[#030712] p-4 rounded-xl overflow-x-auto border border-white/5 leading-relaxed max-h-[220px] overflow-y-auto">
                            {selectedBlueprint.apiSuggestions}
                          </pre>
                        </div>

                        {/* Strategies Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-left">
                          <div className="p-5 rounded-2xl bg-[#030712]/50 border border-white/5 space-y-1.5">
                            <span className="text-[9px] uppercase tracking-widest font-black text-slate-500">Deployment Plan</span>
                            <p className="text-xs text-slate-350 leading-relaxed">{selectedBlueprint.deploymentStrategy}</p>
                          </div>
                          <div className="p-5 rounded-2xl bg-[#030712]/50 border border-white/5 space-y-1.5">
                            <span className="text-[9px] uppercase tracking-widest font-black text-slate-500">Presentation flow</span>
                            <p className="text-xs text-slate-350 leading-relaxed">{selectedBlueprint.presentationStrategy}</p>
                          </div>
                          <div className="p-5 rounded-2xl bg-[#030712]/50 border border-white/5 space-y-1.5">
                            <span className="text-[9px] uppercase tracking-widest font-black text-slate-500">Judging rubrics fit</span>
                            <p className="text-xs text-slate-350 leading-relaxed">{selectedBlueprint.judgingCriteriaAnalysis}</p>
                          </div>
                        </div>

                        {/* Team Roles Breakdown */}
                        <div className="p-5 rounded-2xl bg-[#030712]/50 border border-white/5 space-y-3.5 text-left">
                          <h4 className="text-xs uppercase tracking-widest font-black text-white flex items-center gap-2">
                            <FaBriefcase className="text-blue-400" /> Team Role Division
                          </h4>
                          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                            <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                              <span className="text-[8px] font-black uppercase text-cyan-400">Frontend Dev</span>
                              <p className="text-xs text-slate-350 mt-1">{selectedBlueprint.teamRoles?.frontend || "N/A"}</p>
                            </div>
                            <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                              <span className="text-[8px] font-black uppercase text-indigo-400">Backend Architect</span>
                              <p className="text-xs text-slate-350 mt-1">{selectedBlueprint.teamRoles?.backend || "N/A"}</p>
                            </div>
                            <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                              <span className="text-[8px] font-black uppercase text-purple-400">AI Engineer</span>
                              <p className="text-xs text-slate-350 mt-1">{selectedBlueprint.teamRoles?.ai || "N/A"}</p>
                            </div>
                            <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                              <span className="text-[8px] font-black uppercase text-amber-400">Presenter/pitcher</span>
                              <p className="text-xs text-slate-350 mt-1">{selectedBlueprint.teamRoles?.presentation || "N/A"}</p>
                            </div>
                          </div>
                        </div>

                        <div className="flex justify-end pt-4 border-t border-white/5">
                          <button
                            onClick={() => setSelectedBlueprint(null)}
                            className="px-6 py-3 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 text-xs font-bold text-slate-300 transition cursor-pointer"
                          >
                            Close Blueprint
                          </button>
                        </div>
                      </motion.div>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </PageLayout>
  );
}
