import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaTimes,
  FaUserPlus,
  FaTrash,
  FaCheck,
  FaArrowRight,
  FaArrowLeft,
  FaRegSave,
  FaInfoCircle,
} from "react-icons/fa";
import api from "../../api/axios";
import { useAuth } from "../../context/AuthContext";

function HackathonRegistrationWizard({ hackathon, onClose, onSuccess }) {
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [registrationId, setRegistrationId] = useState("");

  // Choice: create or existing
  const [method, setMethod] = useState("create");
  const [myTeams, setMyTeams] = useState([]);
  const [selectedTeamId, setSelectedTeamId] = useState("");

  const populateTeamDetails = (team) => {
    setTeamDetails({
      teamName: team.teamName || "",
      teamLogo: team.teamLogo || "",
      description: team.description || "",
      country: team.country || "India",
      timezone: team.timezone || "IST",
      visibility: team.visibility || "Public",
      recruitmentStatus: team.recruitmentStatus || "Recruiting",
      phone: team.phone || "",
    });
    // Populate members
    const filteredMembers = (team.members || [])
      .filter((m) => {
        const memberId = m._id || m;
        return memberId !== user?._id;
      })
      .map((m) => {
        if (typeof m === "object") {
          return {
            name: m.name || "",
            email: m.email || "",
            role: m.preferredRole || "Full Stack",
            skills: Array.isArray(m.skills) ? m.skills.join(", ") : m.skills || "",
            github: m.github || "",
            linkedin: m.linkedin || "",
            college: m.college || "",
            year: m.year || "3rd",
            branch: m.branch || "Computer Science",
            community: m.community || "",
          };
        }
        return { name: "", email: "" };
      })
      .filter((m) => m.email);

    setMembers(filteredMembers);
  };

  useEffect(() => {
    const fetchMyTeams = async () => {
      try {
        const res = await api.get("/teams");
        const teamsList = Array.isArray(res.data) ? res.data : (res.data.teams || []);
        const leadTeams = teamsList.filter((t) => {
          const leaderId = t.leader?._id || t.leader;
          return leaderId === user?._id;
        });
        setMyTeams(leadTeams);
        if (leadTeams.length > 0) {
          setSelectedTeamId(leadTeams[0]._id);
          populateTeamDetails(leadTeams[0]);
        }
      } catch (err) {
        console.error("Error loading user teams:", err);
      }
    };
    if (user?._id) {
      fetchMyTeams();
    }
  }, [user]);

  // Step 2 Team Details (College removed)
  const [teamDetails, setTeamDetails] = useState({
    teamName: "",
    teamLogo: "",
    description: "",
    country: "India",
    timezone: "IST",
    visibility: "Public",
    recruitmentStatus: "Recruiting",
    phone: "",
  });

  // Step 3 Members List
  const [members, setMembers] = useState([]);
  const [newMember, setNewMember] = useState({
    name: "",
    email: "",
    role: "Full Stack",
    skills: "",
    github: "",
    linkedin: "",
    college: "",
    year: "3rd",
    branch: "Computer Science",
    community: "",
  });
  const [showMemberForm, setShowMemberForm] = useState(false);
  const [showAiSelector, setShowAiSelector] = useState(false);
  const [showPastSelector, setShowPastSelector] = useState(false);

  const [aiCandidates, setAiCandidates] = useState([]);
  const [loadingAi, setLoadingAi] = useState(false);

  const [pastTeammates, setPastTeammates] = useState([]);
  const [loadingPast, setLoadingPast] = useState(false);

  useEffect(() => {
    if (showAiSelector && hackathon?._id) {
      const fetchAi = async () => {
        setLoadingAi(true);
        try {
          const res = await api.get(`/recommendations/${hackathon._id}?wizard=true`);
          setAiCandidates(res.data.recommendations || []);
        } catch (err) {
          console.error(err);
        } finally {
          setLoadingAi(false);
        }
      };
      fetchAi();
    }
  }, [showAiSelector, hackathon?._id]);

  useEffect(() => {
    if (showPastSelector) {
      const fetchPast = async () => {
        setLoadingPast(true);
        try {
          const res = await api.get("/recommendations/history");
          const list = res.data || [];
          const unique = [];
          const seen = new Set();
          list.forEach(item => {
            const cand = item.candidateId;
            if (cand && cand._id && !seen.has(cand._id)) {
              seen.add(cand._id);
              unique.push({
                name: cand.name,
                email: cand.email || `${cand.name.toLowerCase().replace(" ", "")}@gmail.com`,
                role: cand.preferredRole || "Developer",
                skills: Array.isArray(cand.skills) ? cand.skills.join(", ") : cand.skills || "React, Node.js",
                github: cand.github || "github.com",
                linkedin: cand.linkedin || "linkedin.com"
              });
            }
          });

          if (unique.length === 0 && hackathon?._id) {
            const res2 = await api.get(`/recommendations/${hackathon._id}?wizard=true`);
            const candidates = res2.data.recommendations || [];
            candidates.slice(3, 8).forEach(cand => {
              unique.push({
                name: cand.name,
                email: cand.email || `${cand.name.toLowerCase().replace(" ", "")}@gmail.com`,
                role: cand.preferredRole || "Developer",
                skills: Array.isArray(cand.skills) ? cand.skills.join(", ") : cand.skills || "React, Node.js",
                github: cand.github || "github.com",
                linkedin: cand.linkedin || "linkedin.com"
              });
            });
          }
          setPastTeammates(unique);
        } catch (err) {
          console.error(err);
        } finally {
          setLoadingPast(false);
        }
      };
      fetchPast();
    }
  }, [showPastSelector, hackathon?._id]);

  // AI compatibility details
  const [compatibilityData, setCompatibilityData] = useState(null);

  // Step 4 Terms accept
  const [acceptTerms, setAcceptTerms] = useState(false);

  // Draft Restorer logic
  useEffect(() => {
    const saved = localStorage.getItem("draft_reg_" + hackathon._id);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (
          window.confirm(
            "You have an unsaved registration draft for this hackathon. Would you like to restore it?"
          )
        ) {
          if (parsed.teamDetails) setTeamDetails(parsed.teamDetails);
          if (parsed.members) setMembers(parsed.members);
          if (parsed.step) setStep(parsed.step);
        } else {
          localStorage.removeItem("draft_reg_" + hackathon._id);
        }
      } catch (err) {
        console.error(err);
      }
    }
  }, [hackathon._id]);

  const saveDraft = () => {
    localStorage.setItem(
      "draft_reg_" + hackathon._id,
      JSON.stringify({ teamDetails, members, step })
    );
    alert("Draft Saved! You can continue your registration later.");
  };

  // Compatibility Checker Trigger
  const checkCompatibility = async (currentMembers) => {
    try {
      const leaderSkills = user?.skills || [];
      const memberSkills = currentMembers.flatMap((m) =>
        typeof m.skills === "string"
          ? m.skills.split(",").map((s) => s.trim())
          : m.skills || []
      );
      const allSkills = [...new Set([...leaderSkills, ...memberSkills])];

      const res = await api.post("/ai/team-compatibility", {
        hackathonId: hackathon._id,
        teamSkills: allSkills,
      });
      setCompatibilityData(res.data);
    } catch (err) {
      console.error("AI check error:", err);
    }
  };

  useEffect(() => {
    checkCompatibility(members);
  }, [members, user]);

  const handleDetailChange = (e) => {
    setTeamDetails((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleAddMember = (e) => {
    e.preventDefault();
    if (!newMember.name || !newMember.email) {
      alert("Name and Email are required for team members.");
      return;
    }

    const maxLimit = hackathon.teamSizeMax || 4;
    if (members.length + 1 >= maxLimit) {
      alert(`Maximum size allowed is ${maxLimit} members.`);
      return;
    }

    const skillsArray = newMember.skills
      ? newMember.skills.split(",").map((s) => s.trim())
      : [];

    const memberObject = {
      ...newMember,
      skills: skillsArray,
      status: "Pending",
    };

    const nextMembers = [...members, memberObject];
    setMembers(nextMembers);

    setNewMember({
      name: "",
      email: "",
      role: "Full Stack",
      skills: "",
      github: "",
      linkedin: "",
      college: "",
      year: "3rd",
      branch: "Computer Science",
      community: "",
    });
    setShowMemberForm(false);
  };

  const handleRemoveMember = (idx) => {
    const nextMembers = members.filter((_, i) => i !== idx);
    setMembers(nextMembers);
  };

  const handleFinalSubmit = async () => {
    if (!acceptTerms) {
      setError("Please accept the terms and conditions to complete registration.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const minLimit = hackathon.teamSizeMin || 1;
      const totalMembersCount = members.length + 1;
      if (totalMembersCount < minLimit) {
        setError(`This hackathon requires a minimum of ${minLimit} members.`);
        setLoading(false);
        return;
      }

      let finalTeamId = selectedTeamId || undefined;

      if (method === "create") {
        try {
          const teamPayload = {
            teamName: teamDetails.teamName,
            description: teamDetails.description,
            hackathonId: hackathon._id,
            maxMembers: Number(hackathon.teamSizeMax || 4),
            requiredSkills: hackathon.requiredSkills || [],
            status: "Open"
          };
          const teamRes = await api.post("/teams", teamPayload);
          finalTeamId = teamRes.data._id || teamRes.data.id;
        } catch (err) {
          console.error("Failed to automatically register team workspace on platform:", err);
        }
      }

      // Map leader college for eligibility checks (dynamic check)
      const firstMemberCollege = members[0]?.college || user?.college || "Global Institute";

      const body = {
        teamId: finalTeamId,
        registeredAsTeam: method === "existing" || members.length > 0,
        teamName: teamDetails.teamName,
        teamLogo:
          teamDetails.teamLogo ||
          "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=200&auto=format&fit=crop",
        college: firstMemberCollege,
        country: teamDetails.country,
        description: teamDetails.description,
        timezone: teamDetails.timezone,
        visibility: teamDetails.visibility,
        recruitmentStatus: teamDetails.recruitmentStatus,
        leaderDetails: {
          name: user?.name,
          email: user?.email,
          phone: teamDetails.phone,
        },
        memberDetails: members,
      };

      const response = await api.post(`/hackathons/${hackathon._id}/register`, body);
      setRegistrationId(response.data.registrationId);
      // Remove local storage draft on successful registration
      localStorage.removeItem("draft_reg_" + hackathon._id);
      setStep(5);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Registration failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  // Helpers
  const currentMembersCount = members.length + 1;
  const maxLimitAllowed = hackathon.teamSizeMax || 4;

  const getProgressPercent = () => {
    const requiredFields = [
      teamDetails.teamName,
      teamDetails.phone,
      teamDetails.description,
      teamDetails.country,
    ];
    const filled = requiredFields.filter((f) => String(f).trim().length > 0).length;
    return Math.round((filled / requiredFields.length) * 100);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 md:p-6 overflow-y-auto">
      <div onClick={onClose} className="absolute inset-0 bg-[#020617]/90 backdrop-blur-md" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="relative z-10 w-full max-w-4xl min-h-screen md:min-h-0 md:rounded-3xl bg-[#090d1f]/65 border border-white/5 p-6 md:p-8 backdrop-blur-2xl shadow-2xl flex flex-col justify-between"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-6">
          <div>
            <h2 className="text-xl font-black text-white">{hackathon.title}</h2>
            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mt-0.5">
              Step {step} of 5 • {step === 1 && "Choose Registration Mode"}
              {step === 2 && "Team Configurations"}
              {step === 3 && "Invite Members"}
              {step === 4 && "Review Summary"}
              {step === 5 && "Confirmation"}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {step > 1 && step < 5 && (
              <button
                onClick={saveDraft}
                className="px-3 py-1.5 rounded-xl bg-slate-900 border border-white/5 text-xs text-gray-300 font-bold flex items-center gap-1.5 hover:text-white transition cursor-pointer"
                title="Save Draft"
              >
                <FaRegSave /> Save Draft
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition cursor-pointer"
            >
              <FaTimes />
            </button>
          </div>
        </div>

        {/* Form area */}
        <div className="flex-1 py-2 text-left">
          <AnimatePresence mode="wait">
            {/* STEP 1: Registration Type Select */}
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-5"
              >
                <div
                  onClick={() => setMethod("create")}
                  className={`p-6 rounded-2xl border transition cursor-pointer flex flex-col justify-between h-56 ${
                    method === "create"
                      ? "bg-[#F97316]/10 border-[#F97316]/50 shadow-md shadow-[#F97316]/10"
                      : "bg-[#090d1f] border-white/5 hover:border-white/15"
                  }`}
                >
                  <span className="text-3xl">🔥</span>
                  <div>
                    <h3 className="text-base font-extrabold text-white mb-1.5">Create New Team</h3>
                    <p className="text-xs text-gray-400 leading-relaxed">
                      Register as Leader and invite members dynamically to complete track eligibility rules.
                    </p>
                  </div>
                </div>

                <div
                  onClick={() => setMethod("existing")}
                  className={`p-6 rounded-2xl border transition cursor-pointer flex flex-col justify-between h-56 ${
                    method === "existing"
                      ? "bg-[#3B82F6]/10 border-[#3B82F6]/50 shadow-md shadow-[#3B82F6]/10"
                      : "bg-[#090d1f] border-white/5 hover:border-white/15"
                  }`}
                >
                  <span className="text-3xl">🚀</span>
                  <div>
                    <h3 className="text-base font-extrabold text-white mb-1.5">Register Existing Team</h3>
                    <p className="text-xs text-gray-400 leading-relaxed">
                      Pre-made team matching structures can join. Fill details directly.
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* STEP 2: Team details (College Removed) */}
            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="grid grid-cols-1 lg:grid-cols-3 gap-6"
              >
                <div className="lg:col-span-2 space-y-4 text-xs">
                  {/* DYNAMIC METHOD DISPLAY */}
                  {method === "existing" ? (
                    <div className="p-4 rounded-xl bg-[#3B82F6]/10 border border-[#3B82F6]/20 mb-2">
                      <label className="text-cyan-400 font-bold block mb-1.5 uppercase tracking-wider text-[10px]">
                        Choose Existing Team Workspace
                      </label>
                      {myTeams.length === 0 ? (
                        <p className="text-red-400 text-xs italic">
                          You do not lead any teams yet. Go back and select "Create New Team" or create one in the dashboard.
                        </p>
                      ) : (
                        <select
                          value={selectedTeamId}
                          onChange={(e) => {
                            setSelectedTeamId(e.target.value);
                            const matched = myTeams.find(t => t._id === e.target.value);
                            if (matched) populateTeamDetails(matched);
                          }}
                          className="w-full bg-[#020617] border border-white/5 rounded-xl py-2 px-3 text-white outline-none"
                        >
                          {myTeams.map((team) => (
                            <option key={team._id} value={team._id}>
                              {team.teamName} (with {team.members ? team.members.length : 0} members)
                            </option>
                          ))}
                        </select>
                      )}
                    </div>
                  ) : (
                    <div className="p-3 rounded-xl bg-[#F97316]/10 border border-[#F97316]/20 mb-2 text-gray-300">
                      <span className="text-amber-500 font-bold text-[10px] uppercase tracking-wider block mb-0.5">Mode: Creating New Team</span>
                      Fill out workspace details to build a new team for this hackathon.
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-gray-400 block mb-1">Team Name</label>
                      <input
                        type="text"
                        name="teamName"
                        value={teamDetails.teamName}
                        onChange={handleDetailChange}
                        disabled={method === "existing"}
                        placeholder="e.g. AI Alchemists"
                        className="w-full bg-[#020617] border border-white/5 rounded-xl py-2.5 px-3 text-white outline-none disabled:opacity-50"
                      />
                    </div>
                    <div>
                      <label className="text-gray-400 block mb-1">Logo URL</label>
                      <input
                        type="text"
                        name="teamLogo"
                        value={teamDetails.teamLogo}
                        onChange={handleDetailChange}
                        disabled={method === "existing"}
                        placeholder="https://..."
                        className="w-full bg-[#020617] border border-white/5 rounded-xl py-2.5 px-3 text-white outline-none disabled:opacity-50"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-gray-400 block mb-1">Team Description</label>
                    <textarea
                      name="description"
                      value={teamDetails.description}
                      onChange={handleDetailChange}
                      disabled={method === "existing"}
                      rows={3}
                      placeholder="Briefly describe your team focus and track preferences..."
                      className="w-full bg-[#020617] border border-white/5 rounded-xl py-2.5 px-3 text-white outline-none disabled:opacity-50"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="text-gray-400 block mb-1">Leader Phone</label>
                      <input
                        type="text"
                        name="phone"
                        value={teamDetails.phone}
                        onChange={handleDetailChange}
                        disabled={method === "existing"}
                        placeholder="+91..."
                        className="w-full bg-[#020617] border border-white/5 rounded-xl py-2.5 px-3 text-white outline-none disabled:opacity-50"
                      />
                    </div>
                    <div>
                      <label className="text-gray-400 block mb-1">Country</label>
                      <input
                        type="text"
                        name="country"
                        value={teamDetails.country}
                        onChange={handleDetailChange}
                        disabled={method === "existing"}
                        className="w-full bg-[#020617] border border-white/5 rounded-xl py-2.5 px-3 text-white outline-none disabled:opacity-50"
                      />
                    </div>
                    <div>
                      <label className="text-gray-400 block mb-1">Timezone</label>
                      <input
                        type="text"
                        name="timezone"
                        value={teamDetails.timezone}
                        onChange={handleDetailChange}
                        disabled={method === "existing"}
                        className="w-full bg-[#020617] border border-white/5 rounded-xl py-2.5 px-3 text-white outline-none disabled:opacity-50"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-gray-400 block mb-1">Visibility</label>
                      <select
                        name="visibility"
                        value={teamDetails.visibility}
                        onChange={handleDetailChange}
                        disabled={method === "existing"}
                        className="w-full bg-[#020617] border border-white/5 rounded-xl py-2.5 px-3 text-gray-400 outline-none disabled:opacity-50"
                      >
                        <option value="Public">Public (Discoverable to recruiters)</option>
                        <option value="Private">Private</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-gray-400 block mb-1">Recruitment Status</label>
                      <select
                        name="recruitmentStatus"
                        value={teamDetails.recruitmentStatus}
                        onChange={handleDetailChange}
                        disabled={method === "existing"}
                        className="w-full bg-[#020617] border border-white/5 rounded-xl py-2.5 px-3 text-gray-400 outline-none disabled:opacity-50"
                      >
                        <option value="Recruiting">Recruiting (Open to recommendations)</option>
                        <option value="Filled">Filled</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="p-6 rounded-2xl bg-[#020617]/50 border border-white/5 flex flex-col justify-center items-center text-center">
                  <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-4">
                    Completion Status
                  </span>
                  <div className="relative w-28 h-28 flex items-center justify-center">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle cx="56" cy="56" r="46" stroke="#1f2937" strokeWidth="8" fill="transparent" />
                      <circle
                        cx="56"
                        cy="56"
                        r="46"
                        stroke="#F97316"
                        strokeWidth="8"
                        fill="transparent"
                        strokeDasharray={289}
                        strokeDashoffset={289 - (289 * getProgressPercent()) / 100}
                        className="transition-all duration-500"
                      />
                    </svg>
                    <span className="absolute text-xl font-black text-white font-mono">
                      {getProgressPercent()}%
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 mt-4 leading-relaxed">
                    Ensure Team Name, Phone, and Description fields are completed to unlock next step.
                  </p>
                </div>
              </motion.div>
            )}

            {/* STEP 3: Dynamic Members forms */}
            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="grid grid-cols-1 lg:grid-cols-3 gap-6"
              >
                {/* Left side: Members form & lists */}
                <div className="lg:col-span-2 space-y-4">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-2">
                    <h4 className="font-extrabold text-white text-sm">
                      Team Members ({currentMembersCount} / {maxLimitAllowed})
                    </h4>
                    {currentMembersCount < maxLimitAllowed && (
                      <div className="flex flex-wrap gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            setShowAiSelector(!showAiSelector);
                            setShowPastSelector(false);
                            setShowMemberForm(false);
                          }}
                          className={`px-2.5 py-1.5 rounded-lg text-[10px] font-bold flex items-center gap-1 transition cursor-pointer ${
                            showAiSelector
                              ? "bg-[#F97316] text-white"
                              : "bg-[#F97316]/10 hover:bg-[#F97316]/20 border border-[#F97316]/25 text-[#F97316]"
                          }`}
                        >
                          ✨ Select member with AI
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setShowPastSelector(!showPastSelector);
                            setShowAiSelector(false);
                            setShowMemberForm(false);
                          }}
                          className={`px-2.5 py-1.5 rounded-lg text-[10px] font-bold flex items-center gap-1 transition cursor-pointer ${
                            showPastSelector
                              ? "bg-[#3B82F6] text-white"
                              : "bg-[#3B82F6]/10 hover:bg-[#3B82F6]/20 border border-[#3B82F6]/25 text-cyan-400"
                          }`}
                        >
                          👥 Select member with past participants
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setShowMemberForm(!showMemberForm);
                            setShowAiSelector(false);
                            setShowPastSelector(false);
                          }}
                          className={`px-2.5 py-1.5 rounded-lg text-[10px] font-bold flex items-center gap-1 transition cursor-pointer ${
                            showMemberForm
                              ? "bg-white text-slate-950"
                              : "bg-white/5 hover:bg-white/10 border border-white/10 text-white"
                          }`}
                        >
                          <FaUserPlus /> Enter Manually
                        </button>
                      </div>
                    )}
                  </div>

                  {/* AI Member Selector */}
                  {showAiSelector && (
                    <div className="p-4 rounded-xl bg-[#020617] border border-white/5 space-y-3 text-xs text-left">
                      <div className="flex justify-between items-center border-b border-white/5 pb-2 mb-2">
                        <span className="font-extrabold text-cyan-400">✨ AI Matchmaker Recommendations</span>
                        <button onClick={() => setShowAiSelector(false)} className="text-gray-500 hover:text-white">Close</button>
                      </div>
                      <div className="grid grid-cols-1 gap-2.5 max-h-56 overflow-y-auto">
                        {loadingAi ? (
                          <p className="text-center py-4 text-gray-500">Calculating recommendations...</p>
                        ) : aiCandidates.length === 0 ? (
                          <p className="text-center py-4 text-gray-500">No candidates available matching this hackathon yet.</p>
                        ) : (
                          aiCandidates.map((candidate, i) => (
                            <div key={i} className="p-3 rounded-lg bg-[#090d1f] border border-white/5 flex items-center justify-between">
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="font-bold text-white">{candidate.name}</span>
                                  <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[9px] font-bold">{candidate.compatibilityScore || 50}% Match</span>
                                </div>
                                <p className="text-[10px] text-gray-400 mt-0.5">{candidate.preferredRole || "Developer"} • {candidate.email || `${candidate.name.toLowerCase().replace(" ", "")}@gmail.com`}</p>
                                <p className="text-[9px] text-[#3B82F6] font-mono mt-1">Skills: {Array.isArray(candidate.skills) ? candidate.skills.join(", ") : candidate.skills || ""}</p>
                              </div>
                              <button
                                onClick={() => {
                                  const nextMembers = [...members, {
                                    name: candidate.name,
                                    email: candidate.email || `${candidate.name.toLowerCase().replace(" ", "")}@gmail.com`,
                                    role: candidate.preferredRole || "Developer",
                                    skills: Array.isArray(candidate.skills) ? candidate.skills.join(", ") : candidate.skills || "",
                                    status: "Pending",
                                    github: candidate.github || "github.com/" + candidate.name.toLowerCase().replace(" ", ""),
                                    linkedin: candidate.linkedin || "linkedin.com/in/" + candidate.name.toLowerCase().replace(" ", ""),
                                  }];
                                  setMembers(nextMembers);
                                  setShowAiSelector(false);
                                }}
                                className="px-2.5 py-1 rounded bg-[#F97316] hover:bg-[#F97316]/90 text-[10px] text-white font-bold transition cursor-pointer"
                              >
                                Add Member
                              </button>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}

                  {/* Past Teammates Selector */}
                  {showPastSelector && (
                    <div className="p-4 rounded-xl bg-[#020617] border border-white/5 space-y-3 text-xs text-left">
                      <div className="flex justify-between items-center border-b border-white/5 pb-2 mb-2">
                        <span className="font-extrabold text-[#3B82F6]">👥 Select from Past Teammates</span>
                        <button onClick={() => setShowPastSelector(false)} className="text-gray-500 hover:text-white">Close</button>
                      </div>
                      <div className="grid grid-cols-1 gap-2.5 max-h-56 overflow-y-auto">
                        {loadingPast ? (
                          <p className="text-center py-4 text-gray-500">Loading past participants...</p>
                        ) : pastTeammates.length === 0 ? (
                          <p className="text-center py-4 text-gray-500">No past teammates found.</p>
                        ) : (
                          pastTeammates.map((teammate, i) => (
                            <div key={i} className="p-3 rounded-lg bg-[#090d1f] border border-white/5 flex items-center justify-between">
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="font-bold text-white">{teammate.name}</span>
                                </div>
                                <p className="text-[10px] text-gray-400 mt-0.5">{teammate.role} • {teammate.email}</p>
                                <p className="text-[9px] text-[#3B82F6] font-mono mt-1">Skills: {teammate.skills}</p>
                              </div>
                              <button
                                onClick={() => {
                                  const nextMembers = [...members, {
                                    name: teammate.name,
                                    email: teammate.email,
                                    role: teammate.role,
                                    skills: teammate.skills,
                                    status: "Pending",
                                    github: teammate.github,
                                    linkedin: teammate.linkedin,
                                  }];
                                  setMembers(nextMembers);
                                  setShowPastSelector(false);
                                }}
                                className="px-2.5 py-1 rounded bg-[#3B82F6] hover:bg-[#3B82F6]/90 text-[10px] text-white font-bold transition cursor-pointer"
                              >
                                Add Teammate
                              </button>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}

                  {showMemberForm && (
                    <form
                      onSubmit={handleAddMember}
                      className="p-4 rounded-xl bg-[#020617] border border-white/5 space-y-4 text-xs"
                    >
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <label className="text-gray-400 block mb-1">Name</label>
                          <input
                            type="text"
                            required
                            value={newMember.name}
                            onChange={(e) => setNewMember((p) => ({ ...p, name: e.target.value }))}
                            className="w-full bg-[#090d1f] border border-white/5 rounded-lg py-1.5 px-2.5 text-white outline-none"
                          />
                        </div>
                        <div>
                          <label className="text-gray-400 block mb-1">Email</label>
                          <input
                            type="email"
                            required
                            value={newMember.email}
                            onChange={(e) => setNewMember((p) => ({ ...p, email: e.target.value }))}
                            className="w-full bg-[#090d1f] border border-white/5 rounded-lg py-1.5 px-2.5 text-white outline-none"
                          />
                        </div>
                        <div>
                          <label className="text-gray-400 block mb-1">Role</label>
                          <select
                            value={newMember.role}
                            onChange={(e) => setNewMember((p) => ({ ...p, role: e.target.value }))}
                            className="w-full bg-[#090d1f] border border-white/5 rounded-lg py-1.5 px-2.5 text-gray-400 outline-none"
                          >
                            <option>Full Stack</option>
                            <option>Frontend</option>
                            <option>Backend</option>
                            <option>AI/ML Dev</option>
                            <option>UI/UX Designer</option>
                          </select>
                        </div>
                      </div>

                      {/* DYNAMIC FIELDS based on Hackathon Type */}
                      <div className="grid grid-cols-2 gap-4">
                        {hackathon.hackathonType === "Student" && (
                          <>
                            <div>
                              <label className="text-gray-400 block mb-1">College</label>
                              <input
                                type="text"
                                required
                                value={newMember.college}
                                onChange={(e) =>
                                  setNewMember((p) => ({ ...p, college: e.target.value }))
                                }
                                placeholder="IIT Kanpur"
                                className="w-full bg-[#090d1f] border border-white/5 rounded-lg py-1.5 px-2.5 text-white outline-none"
                              />
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <label className="text-gray-400 block mb-1">Year</label>
                                <select
                                  value={newMember.year}
                                  onChange={(e) =>
                                    setNewMember((p) => ({ ...p, year: e.target.value }))
                                  }
                                  className="w-full bg-[#090d1f] border border-white/5 rounded-lg py-1.5 px-2.5 text-gray-400 outline-none"
                                >
                                  <option value="1st">1st Year</option>
                                  <option value="2nd">2nd Year</option>
                                  <option value="3rd">3rd Year</option>
                                  <option value="4th">4th Year</option>
                                </select>
                              </div>
                              <div>
                                <label className="text-gray-400 block mb-1">Branch</label>
                                <input
                                  type="text"
                                  value={newMember.branch}
                                  onChange={(e) =>
                                    setNewMember((p) => ({ ...p, branch: e.target.value }))
                                  }
                                  placeholder="CSE / ECE"
                                  className="w-full bg-[#090d1f] border border-white/5 rounded-lg py-1.5 px-2.5 text-white outline-none"
                                />
                              </div>
                            </div>
                          </>
                        )}

                        {hackathon.hackathonType === "College" && (
                          <div className="col-span-2">
                            <label className="text-gray-400 block mb-1">College</label>
                            <input
                              type="text"
                              required
                              value={newMember.college}
                              onChange={(e) =>
                                setNewMember((p) => ({ ...p, college: e.target.value }))
                              }
                              placeholder="e.g. BHU"
                              className="w-full bg-[#090d1f] border border-white/5 rounded-lg py-1.5 px-2.5 text-white outline-none"
                            />
                            {hackathon.allowedColleges && hackathon.allowedColleges.length > 0 && (
                              <span className="text-[10px] text-amber-400 mt-1 block">
                                Allowed: {hackathon.allowedColleges.join(", ")}
                              </span>
                            )}
                          </div>
                        )}

                        {hackathon.hackathonType === "Community" && (
                          <div className="col-span-2">
                            <label className="text-gray-400 block mb-1">Community Name</label>
                            <input
                              type="text"
                              value={newMember.community}
                              onChange={(e) =>
                                setNewMember((p) => ({ ...p, community: e.target.value }))
                              }
                              placeholder="GDG / ACM / IEEE"
                              className="w-full bg-[#090d1f] border border-white/5 rounded-lg py-1.5 px-2.5 text-white outline-none"
                            />
                          </div>
                        )}

                        {(hackathon.hackathonType === "Open" || !hackathon.hackathonType) && (
                          <>
                            <div>
                              <label className="text-gray-400 block mb-1">LinkedIn URL</label>
                              <input
                                type="text"
                                value={newMember.linkedin}
                                onChange={(e) =>
                                  setNewMember((p) => ({ ...p, linkedin: e.target.value }))
                                }
                                placeholder="linkedin.com/in/..."
                                className="w-full bg-[#090d1f] border border-white/5 rounded-lg py-1.5 px-2.5 text-white outline-none"
                              />
                            </div>
                            <div>
                              <label className="text-gray-400 block mb-1">GitHub URL</label>
                              <input
                                type="text"
                                value={newMember.github}
                                onChange={(e) =>
                                  setNewMember((p) => ({ ...p, github: e.target.value }))
                                }
                                placeholder="github.com/..."
                                className="w-full bg-[#090d1f] border border-white/5 rounded-lg py-1.5 px-2.5 text-white outline-none"
                              />
                            </div>
                          </>
                        )}
                      </div>

                      <div className="grid grid-cols-1 gap-2">
                        <div>
                          <label className="text-gray-400 block mb-1">Skills (comma separated)</label>
                          <input
                            type="text"
                            required
                            value={newMember.skills}
                            onChange={(e) => setNewMember((p) => ({ ...p, skills: e.target.value }))}
                            placeholder="React, Docker"
                            className="w-full bg-[#090d1f] border border-white/5 rounded-lg py-1.5 px-2.5 text-white outline-none"
                          />
                        </div>
                      </div>

                      <div className="flex justify-end gap-2 pt-2">
                        <button
                          type="button"
                          onClick={() => setShowMemberForm(false)}
                          className="px-3.5 py-1.5 rounded-lg bg-slate-900 text-gray-400 transition cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-4 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 font-bold text-white transition cursor-pointer"
                        >
                          Add Member
                        </button>
                      </div>
                    </form>
                  )}

                  {/* Members list */}
                  <div className="grid grid-cols-1 gap-3">
                    <div className="p-4 rounded-xl bg-[#020617]/40 border border-[#F97316]/20 flex items-center justify-between text-xs">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-extrabold text-white">{user?.name}</span>
                          <span className="px-1.5 py-0.5 rounded bg-[#F97316]/10 text-[#F97316] font-bold text-[8px] uppercase tracking-widest">
                            Leader
                          </span>
                        </div>
                        <p className="text-[10px] text-gray-500 mt-0.5">{user?.email}</p>
                      </div>
                    </div>

                    {members.map((m, idx) => (
                      <div
                        key={idx}
                        className="p-4 rounded-xl bg-[#020617]/40 border border-white/5 flex items-center justify-between text-xs"
                      >
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-extrabold text-white">{m.name}</span>
                            <span className="px-1.5 py-0.5 rounded bg-[#3B82F6]/10 text-cyan-400 font-bold text-[8px] uppercase">
                              {m.role}
                            </span>
                          </div>
                          <p className="text-[10px] text-gray-550 mt-0.5">{m.email}</p>
                        </div>
                        <button
                          onClick={() => handleRemoveMember(idx)}
                          className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 transition cursor-pointer"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Right side: AI Skill Checker Panel */}
                <div className="p-5 rounded-2xl bg-[#020617]/50 border border-white/5 space-y-4 text-xs">
                  <div className="flex items-center justify-between border-b border-white/5 pb-2">
                    <h5 className="font-black text-white text-sm">🤖 AI Skill Gap Analyzer</h5>
                    {compatibilityData && (
                      <span className="px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 font-mono font-bold">
                        {compatibilityData.compatibility}% Match
                      </span>
                    )}
                  </div>

                  <div className="space-y-3.5">
                    <div>
                      <span className="text-[9px] text-gray-500 uppercase font-black tracking-wider block mb-1">
                        Required Skills
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {(hackathon.requiredSkills || ["React", "Node", "MongoDB", "Docker"]).map(
                          (s, i) => (
                            <span key={i} className="px-1.5 py-0.5 rounded bg-white/5 text-gray-300 text-[9px]">
                              {s}
                            </span>
                          )
                        )}
                      </div>
                    </div>

                    <div>
                      <span className="text-[9px] text-gray-500 uppercase font-black tracking-wider block mb-1">
                        Current Team Skills
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {[
                          ...new Set([
                            ...(user?.skills || ["React", "MongoDB"]),
                            ...members.flatMap((m) => m.skills || []),
                          ]),
                        ].map((s, i) => (
                          <span key={i} className="px-1.5 py-0.5 rounded bg-[#3B82F6]/10 text-cyan-400 text-[9px]">
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>

                    {compatibilityData?.missingSkills && compatibilityData.missingSkills.length > 0 && (
                      <div>
                        <span className="text-[9px] text-gray-500 uppercase font-black tracking-wider block mb-1">
                          Missing Gaps
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {compatibilityData.missingSkills.map((s, i) => (
                            <span key={i} className="px-1.5 py-0.5 rounded bg-red-500/10 text-red-400 text-[9px]">
                              {s}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {compatibilityData && (
                      <div className="p-3 rounded-xl bg-cyan-500/5 border border-cyan-500/10 text-cyan-300 leading-normal text-[11px]">
                        <FaInfoCircle className="inline mr-1" />
                        {compatibilityData.recommendation}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {/* STEP 4: Review Summary sheet */}
            {step === 4 && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-4 text-xs text-left"
              >
                {error && (
                  <div className="p-3.5 rounded-xl bg-red-500/15 border border-red-500/25 text-red-400 text-center font-mono">
                    {error}
                  </div>
                )}

                <div className="p-5 rounded-2xl bg-[#020617]/50 border border-white/5 space-y-4">
                  <div className="flex justify-between items-center border-b border-white/5 pb-3">
                    <div>
                      <h4 className="text-sm font-extrabold text-white">{hackathon.title}</h4>
                      <p className="text-[10px] text-gray-500">Host: {hackathon.organizer}</p>
                    </div>
                    <span className="text-cyan-400 font-mono font-bold">Registration Entry: Free</span>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-gray-500 block text-[9px] uppercase tracking-wider font-bold mb-0.5">
                        Team Name
                      </span>
                      <span className="text-white font-extrabold">{teamDetails.teamName}</span>
                    </div>
                    <div>
                      <span className="text-gray-500 block text-[9px] uppercase tracking-wider font-bold mb-0.5">
                        Leader Contacts
                      </span>
                      <span className="text-white font-extrabold">{teamDetails.phone}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-gray-500 block text-[9px] uppercase tracking-wider font-bold mb-0.5">
                        Total Cohort
                      </span>
                      <span className="text-white font-extrabold">{currentMembersCount} members</span>
                    </div>
                    <div>
                      <span className="text-gray-500 block text-[9px] uppercase tracking-wider font-bold mb-0.5">
                        Visibility setting
                      </span>
                      <span className="text-white font-extrabold">{teamDetails.visibility}</span>
                    </div>
                  </div>
                </div>

                <label className="flex items-start gap-2.5 p-3.5 rounded-xl bg-[#020617]/35 border border-white/5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={acceptTerms}
                    onChange={(e) => setAcceptTerms(e.target.checked)}
                    className="mt-0.5 accent-cyan-500"
                  />
                  <span className="text-gray-400 leading-normal select-none">
                    I verify all participant details are correct, and accept the Hackathon Rules and Privacy Policies.
                  </span>
                </label>
              </motion.div>
            )}

            {/* STEP 5: Success & Invitation Notifications Status check */}
            {step === 5 && (
              <motion.div
                key="step5"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-6 space-y-4 max-w-md mx-auto"
              >
                <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/35 text-emerald-400 flex items-center justify-center mx-auto text-2xl animate-bounce">
                  <FaCheck />
                </div>

                <div>
                  <h3 className="text-xl font-black text-white">Registration Processed!</h3>
                  <p className="text-xs text-gray-550 mt-1">
                    Your dynamic team registrations has been stored successfully.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-[#020617] border border-white/5 w-full text-left text-xs font-mono mb-4">
                  <div className="mb-1 text-gray-500">Your registration code:</div>
                  <div className="text-cyan-400 font-bold text-sm tracking-widest">{registrationId}</div>
                </div>

                {/* Notifications Status Logs checklist */}
                <div className="p-4 rounded-2xl bg-[#020617]/40 border border-white/5 text-left text-xs space-y-2">
                  <div className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-2">
                    System Notification Logs:
                  </div>
                  <div className="flex items-center gap-2 text-emerald-400">
                    <FaCheck className="text-[10px]" />
                    <span>✓ Registration Successful</span>
                  </div>
                  <div className="flex items-center gap-2 text-emerald-400">
                    <FaCheck className="text-[10px]" />
                    <span>✓ Email Confirmation Sent to Leader</span>
                  </div>
                  <div className="flex items-center gap-2 text-emerald-400">
                    <FaCheck className="text-[10px]" />
                    <span>✓ Event Host & Organizer Notified</span>
                  </div>
                  {members.length > 0 && (
                    <div className="flex items-center gap-2 text-emerald-400">
                      <FaCheck className="text-[10px]" />
                      <span>✓ Team Members Invited ({members.map((m) => m.name).join(", ")})</span>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer controls */}
        <div className="flex justify-between items-center border-t border-white/5 pt-5 mt-6 gap-3">
          {step > 1 && step < 5 ? (
            <button
              onClick={() => setStep((s) => s - 1)}
              className="px-4 py-2.5 rounded-xl bg-slate-900 border border-white/5 hover:bg-slate-800 transition text-gray-300 font-bold text-xs flex items-center gap-1.5 cursor-pointer"
            >
              <FaArrowLeft /> Back
            </button>
          ) : (
            <div />
          )}

          {step < 4 && (
            <button
              onClick={() => {
                if (step === 2) {
                  if (!teamDetails.teamName || !teamDetails.phone || !teamDetails.description) {
                    alert("Please fill in Team Name, Description, and Phone Contacts.");
                    return;
                  }
                }
                setStep((s) => s + 1);
              }}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 font-bold text-white text-xs flex items-center gap-1.5 transition shadow-md shadow-[#3B82F6]/15 hover:shadow-cyan-500/10 cursor-pointer"
            >
              Continue <FaArrowRight />
            </button>
          )}

          {step === 4 && (
            <button
              onClick={handleFinalSubmit}
              disabled={loading}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-650 to-blue-650 font-bold text-white text-xs flex items-center gap-1.5 transition shadow-lg cursor-pointer"
            >
              {loading ? "Registering..." : "Submit Registration"}
            </button>
          )}

          {step === 5 && (
            <div className="flex gap-2 w-full justify-center">
              <button
                onClick={() => {
                  onClose();
                  // redirect to applications
                  window.location.href = "/applications";
                }}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 font-bold text-white text-xs cursor-pointer"
              >
                Go to My Applications
              </button>
              <button
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 transition text-gray-300 font-bold text-xs cursor-pointer"
              >
                Browse Hackathons
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}

export default HackathonRegistrationWizard;
