import { useState, useEffect } from "react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaCog,
  FaUser,
  FaBook,
  FaCode,
  FaBriefcase,
  FaLanguage,
  FaExternalLinkAlt,
  FaUpload,
  FaCheck,
  FaExclamationTriangle,
  FaPlus,
  FaTimes,
  FaLock,
  FaDownload,
  FaBan,
  FaSignOutAlt,
  FaGithub,
  FaLinkedin,
  FaGoogle,
  FaEllipsisV,
  FaTrophy,
  FaUsers,
  FaStar,
  FaEdit,
  FaEnvelope,
} from "react-icons/fa";
import Sidebar from "../components/dashboard/Sidebar";
import Topbar from "../components/dashboard/Topbar";
import AnimatedBackground from "../components/dashboard/AnimatedBackground";
import PageLayout from "../components/dashboard/PageLayout";

// List of suggested skills
const SUGGESTED_SKILLS = [
  "React",
  "Node.js",
  "MongoDB",
  "Python",
  "TypeScript",
  "Next.js",
  "Docker",
  "Git",
  "Kubernetes",
  "GraphQL",
  "Tailwind CSS",
  "AWS",
];

// List of interests options
const INTERESTS_OPTIONS = [
  "AI",
  "Healthcare",
  "FinTech",
  "EdTech",
  "Blockchain",
  "Cyber Security",
  "Web Development",
  "Mobile Development",
  "IoT",
  "Cloud Computing",
  "Open Source",
];

// List of language options
const LANGUAGES_OPTIONS = [
  "English",
  "Hindi",
  "Tamil",
  "Telugu",
  "Bengali",
  "Marathi",
  "Gujarati",
];

function Settings() {
  const { user, fetchProfile } = useAuth();
  const [activeTab, setActiveTab] = useState("Profile");
  const tabs = ["Profile", "Account", "Notifications", "Privacy", "Security", "Billing", "Display"];

  // Controlled states for every single field
  // Profile
  const [fullName, setFullName] = useState("Harshit Singh");
  const [username, setUsername] = useState("@harshitsingh");
  const [email, setEmail] = useState("harshit.singh@example.com");
  const [bio, setBio] = useState("Full Stack Developer | Passionate about building impactful solutions");
  const [location, setLocation] = useState("New Delhi, India");
  const [avatar, setAvatar] = useState("https://i.pravatar.cc/100?img=12");

  // Academic Information
  const [collegeName, setCollegeName] = useState("Delhi Technological University");
  const [branch, setBranch] = useState("Computer Science & Engineering");
  const [year, setYear] = useState("3rd");
  const [gradYear, setGradYear] = useState("2027");

  // Team Preferences
  const [preferredRole, setPreferredRole] = useState("Full Stack");
  const [experienceLevel, setExperienceLevel] = useState("Intermediate");
  const [availability, setAvailability] = useState("Anytime");

  // Hackathon Experience
  const [hackathonsParticipated, setHackathonsParticipated] = useState("12");
  const [hackathonsWins, setHackathonsWins] = useState("4");
  const [preferredTeamSize, setPreferredTeamSize] = useState("4");
  const [preferredProjectDomain, setPreferredProjectDomain] = useState("AI & FinTech");

  // Skills
  const [skills, setSkills] = useState([
    { name: "React", level: "Advanced" },
    { name: "Node.js", level: "Advanced" },
    { name: "MongoDB", level: "Intermediate" },
    { name: "Python", level: "Intermediate" },
    { name: "Tailwind CSS", level: "Advanced" },
    { name: "AWS", level: "Beginner" },
  ]);
  const [searchSkill, setSearchSkill] = useState("");
  const [skillLevel, setSkillLevel] = useState("Intermediate");

  // Interests (Multi-select)
  const [selectedInterests, setSelectedInterests] = useState([
    "AI",
    "Web Development",
    "Blockchain",
    "Cloud Computing",
  ]);

  // Languages (Multi-select)
  const [selectedLanguages, setSelectedLanguages] = useState(["English", "Hindi"]);

  // Social & Portfolio
  const [githubLink, setGithubLink] = useState("https://github.com/harshit-singh");
  const [linkedinLink, setLinkedinLink] = useState("https://linkedin.com/in/harshitsingh");
  const [portfolioWebsite, setPortfolioWebsite] = useState("https://harshitsingh.dev");
  const [resumeLink, setResumeLink] = useState("https://drive.google.com/file/d/resume");
  const [resumeName, setResumeName] = useState("Harshit_Resume.pdf");

  // Preferences Toggles
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [teamInvitations, setTeamInvitations] = useState(true);
  const [aiRecommendations, setAiRecommendations] = useState(true);
  const [marketingEmails, setMarketingEmails] = useState(false);

  // Status Notification
  const [notification, setNotification] = useState("");

  // Calculate AI Score dynamically
  const [aiScore, setAiScore] = useState(0);

  // Account / Privacy / Security / Display states
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");

  const [accentColor, setAccentColor] = useState(() => localStorage.getItem("accentColor") || "Orange");
  const [particleSpeed, setParticleSpeed] = useState(() => localStorage.getItem("particleSpeed") || "Normal");
  const [compactLayout, setCompactLayout] = useState(() => localStorage.getItem("compactLayout") === "true");

  const [profileVisibility, setProfileVisibility] = useState("Public");
  const [showHistory, setShowHistory] = useState(true);
  const [allowDM, setAllowDM] = useState(true);
  const [showAvailability, setShowAvailability] = useState(true);

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setPasswordError("New passwords do not match");
      return;
    }
    setPasswordError("");
    setPasswordSuccess("");
    try {
      await api.put("/users/profile", { currentPassword, newPassword });
      setPasswordSuccess("Password updated successfully!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setPasswordError(err.response?.data?.message || "Failed to update password");
    }
  };

  const handleSaveDisplay = (color, speed, compact) => {
    localStorage.setItem("accentColor", color);
    localStorage.setItem("particleSpeed", speed);
    localStorage.setItem("compactLayout", compact);
    setAccentColor(color);
    setParticleSpeed(speed);
    setCompactLayout(compact);
    setNotification("Display settings saved!");
    setTimeout(() => setNotification(""), 3000);
  };


  // Checklists for AI Readiness
  const isProfileComplete = fullName.trim() !== "" && email.trim() !== "" && bio.trim() !== "";
  const isGithubConnected = githubLink.trim() !== "";
  const isLinkedinConnected = linkedinLink.trim() !== "";
  const isSkillsAdded = skills.length > 0;
  const isInterestsAdded = selectedInterests.length > 0;
  const isAvailabilityAdded = availability !== "";
  const isPreferredRoleSelected = preferredRole !== "";
  const isExperienceAdded = experienceLevel !== "";
  const isResumeUploaded = resumeName !== null || resumeLink.trim() !== "";

  useEffect(() => {
    let score = 0;
    if (isProfileComplete) score += 15;
    if (isGithubConnected) score += 10;
    if (isLinkedinConnected) score += 10;
    if (isSkillsAdded) score += 15;
    if (isInterestsAdded) score += 15;
    if (isAvailabilityAdded) score += 10;
    if (isPreferredRoleSelected) score += 10;
    if (isExperienceAdded) score += 5;
    if (isResumeUploaded) score += 10;
    setAiScore(score);
  }, [
    isProfileComplete,
    isGithubConnected,
    isLinkedinConnected,
    isSkillsAdded,
    isInterestsAdded,
    isAvailabilityAdded,
    isPreferredRoleSelected,
    isExperienceAdded,
    isResumeUploaded,
  ]);

  // Skill Handlers
  const handleAddSkill = (skillName) => {
    const trimmed = skillName.trim();
    if (!trimmed) return;
    // Check if skill already exists
    if (skills.some((s) => s.name.toLowerCase() === trimmed.toLowerCase())) {
      setSearchSkill("");
      return;
    }
    setSkills([...skills, { name: trimmed, level: skillLevel }]);
    setSearchSkill("");
  };

  const handleRemoveSkill = (skillName) => {
    setSkills(skills.filter((s) => s.name !== skillName));
  };

  // Interests/Languages multi-select toggles
  const toggleInterest = (interest) => {
    if (selectedInterests.includes(interest)) {
      setSelectedInterests(selectedInterests.filter((i) => i !== interest));
    } else {
      setSelectedInterests([...selectedInterests, interest]);
    }
  };

  const toggleLanguage = (lang) => {
    if (selectedLanguages.includes(lang)) {
      setSelectedLanguages(selectedLanguages.filter((l) => l !== lang));
    } else {
      setSelectedLanguages([...selectedLanguages, lang]);
    }
  };

  // Resume Upload simulation
  const handleResumeUpload = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setResumeName(e.target.files[0].name);
      setNotification(`File "${e.target.files[0].name}" uploaded successfully!`);
      setTimeout(() => setNotification(""), 3000);
    }
  };

  const resetFields = (u) => {
    if (!u) return;
    setFullName(u.name || "");
    setEmail(u.email || "");
    setBio(u.bio || "");
    setLocation(u.location || "");
    setCollegeName(u.college || "");
    setBranch(u.branch || "");
    setYear(u.year ? `${u.year} Year` : "3rd");
    setPreferredRole(u.preferredRole || "Full Stack");
    setExperienceLevel(u.experience || "Intermediate");
    setAvailability(u.availability || "Anytime");
    setGithubLink(u.github || "");
    setLinkedinLink(u.linkedin || "");
    if (u.avatar) {
      setAvatar(u.avatar);
    } else {
      setAvatar("https://i.pravatar.cc/100?img=12");
    }
    if (u.skills && Array.isArray(u.skills)) {
      setSkills(u.skills.map(s => typeof s === 'string' ? { name: s, level: "Intermediate" } : s));
    } else {
      setSkills([]);
    }
    if (u.interests && Array.isArray(u.interests)) {
      setSelectedInterests(u.interests);
    } else {
      setSelectedInterests([]);
    }
  };

  useEffect(() => {
    if (user) {
      resetFields(user);
    }
  }, [user]);

  // Reset profile state
  const handleCancel = () => {
    resetFields(user);
    setNotification("Changes discarded.");
    setTimeout(() => setNotification(""), 3000);
  };

  const handleSaveChanges = async (e) => {
    e.preventDefault();
    try {
      const mappedSkills = skills.map(s => typeof s === 'object' ? s.name : s);
      
      let exp = "Intermediate";
      if (experienceLevel === "Beginner" || experienceLevel === "Intermediate" || experienceLevel === "Advanced") {
        exp = experienceLevel;
      }

      let yr = parseInt(year);
      if (isNaN(yr)) {
        if (year.includes("1")) yr = 1;
        else if (year.includes("2")) yr = 2;
        else if (year.includes("3")) yr = 3;
        else if (year.includes("4")) yr = 4;
        else yr = 3;
      }

      await api.put("/users/profile", {
        name: fullName,
        bio,
        location,
        college: collegeName,
        branch,
        year: yr,
        preferredRole,
        experience: exp,
        availability,
        skills: mappedSkills,
        interests: selectedInterests,
        github: githubLink,
        linkedin: linkedinLink,
        avatar,
      });

      setNotification("Profile changes saved successfully!");
      await fetchProfile();
      setTimeout(() => setNotification(""), 4000);
    } catch (error) {
      console.error("Error saving profile changes:", error);
      setNotification(error.response?.data?.message || "Failed to save changes. Please try again.");
      setTimeout(() => setNotification(""), 4000);
    }
  };

  // Filter suggested skills based on search
  const filteredSuggestions = SUGGESTED_SKILLS.filter(
    (skill) =>
      skill.toLowerCase().includes(searchSkill.toLowerCase()) &&
      !skills.some((s) => s.name.toLowerCase() === skill.toLowerCase())
  );

  return (
    <PageLayout activePage="Settings">

        <div className="p-6 sm:p-8">
          {/* Header */}
          <div className="rounded-3xl bg-[#0e1222]/40 backdrop-blur-xl border border-white/5 p-6 sm:p-8 flex items-center gap-4 mb-6 relative overflow-hidden">
            <div className="absolute -top-24 -left-24 w-80 h-80 bg-[#3B82F6]/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -right-24 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

            <div className="w-12 h-12 rounded-2xl bg-purple-500/20 border border-purple-500/35 flex items-center justify-center text-[#3B82F6] text-xl flex-shrink-0">
              <FaCog className="animate-spin-slow" />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold text-white heading-font">Settings</h1>
              <p className="text-xs sm:text-sm text-gray-400 mt-1">
                Manage your account, preferences and privacy.
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex gap-2 mb-6 overflow-x-auto scrollbar-hide border-b border-white/5 pb-3">
            {tabs.map((tab) => {
              const isActive = tab === activeTab;
              return (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-5 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all duration-300 relative border flex-shrink-0 ${
                    isActive
                      ? "text-white border-[#FF8A00]/25"
                      : "text-gray-400 hover:text-gray-200 border-white/5 bg-[#0e1222]/10 hover:bg-[#0e1222]/30"
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeSettingsTab"
                      className="absolute inset-0 bg-[#FF8A00]/25 rounded-xl"
                      transition={{ type: "spring", stiffness: 300, damping: 25 }}
                    />
                  )}
                  <span className="relative z-10 font-mono">{tab}</span>
                </button>
              );
            })}
          </div>

          {/* Notification Alert Banner */}
          <AnimatePresence>
            {notification && (
              <motion.div
                initial={{ opacity: 0, y: -15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="mb-6 p-4 rounded-xl bg-purple-950/40 border border-[#FF8A00]/25 text-cyan-300 text-xs font-bold font-mono flex items-center gap-2"
              >
                <span className="w-2 h-2 rounded-full bg-purple-400 animate-ping" />
                {notification}
              </motion.div>
            )}
          </AnimatePresence>

          {activeTab === "Profile" ? (
            /* Split layout: Form elements on left, Widget metrics cards on right */
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
              {/* Left Column - Form Panels */}
              <div className="xl:col-span-2 space-y-6">
                
                {/* 1. Profile Information */}
                <div className="rounded-3xl border border-white/5 bg-[#050816]/50 backdrop-blur-xl p-6 relative overflow-hidden group transition-all duration-300">
                  <div className="absolute inset-0 w-[200%] bg-gradient-to-r from-transparent via-white/2 to-transparent -translate-x-full group-hover:translate-x-1/2 transition-transform duration-1000 ease-out pointer-events-none" style={{ transform: "skewX(-25deg)" }} />
                  
                  <h3 className="font-extrabold text-white text-sm heading-font mb-6 flex items-center gap-2">
                    <FaUser className="text-[#3B82F6]" /> Profile Information
                  </h3>

                  <div className="flex flex-col md:flex-row gap-6 items-start">
                    {/* Avatar Upload Container */}
                    <div className="relative group/avatar self-center md:self-start">
                      <img
                        src={avatar}
                        alt="Profile avatar"
                        className="w-24 h-24 rounded-full border-2 border-white/5 object-cover"
                      />
                      <label className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-[#FF8A00] border border-purple-400 flex items-center justify-center cursor-pointer hover:bg-purple-500 transition-colors shadow-lg">
                        <FaEdit className="text-white text-xs" />
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            if (e.target.files && e.target.files[0]) {
                              const file = e.target.files[0];
                              const reader = new FileReader();
                              reader.onloadend = () => {
                                setAvatar(reader.result);
                                setNotification("Avatar updated. Click 'Save Changes' to save.");
                                setTimeout(() => setNotification(""), 3000);
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                        />
                      </label>
                    </div>

                    {/* Inputs stack */}
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                      <div>
                        <label className="block text-[10px] uppercase font-bold tracking-wider text-gray-500 mb-1.5 font-mono">
                          Full Name
                        </label>
                        <input
                          type="text"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          className="w-full bg-[#0e1222]/60 border border-white/5 hover:border-white/10 focus:border-purple-500 rounded-xl py-2.5 px-4 text-xs text-gray-300 font-semibold outline-none transition-colors"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] uppercase font-bold tracking-wider text-gray-500 mb-1.5 font-mono">
                          Username
                        </label>
                        <input
                          type="text"
                          value={username}
                          onChange={(e) => setUsername(e.target.value)}
                          className="w-full bg-[#0e1222]/60 border border-white/5 hover:border-white/10 focus:border-purple-500 rounded-xl py-2.5 px-4 text-xs text-gray-300 font-semibold outline-none transition-colors"
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-[10px] uppercase font-bold tracking-wider text-gray-500 mb-1.5 font-mono">
                          Email Address
                        </label>
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full bg-[#0e1222]/60 border border-white/5 hover:border-white/10 focus:border-purple-500 rounded-xl py-2.5 px-4 text-xs text-gray-300 font-semibold outline-none transition-colors"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] uppercase font-bold tracking-wider text-gray-500 mb-1.5 font-mono">
                          Location
                        </label>
                        <input
                          type="text"
                          value={location}
                          onChange={(e) => setLocation(e.target.value)}
                          className="w-full bg-[#0e1222]/60 border border-white/5 hover:border-white/10 focus:border-purple-500 rounded-xl py-2.5 px-4 text-xs text-gray-300 font-semibold outline-none transition-colors"
                        />
                      </div>

                      <div className="md:col-span-2">
                        <div className="flex justify-between items-center mb-1.5">
                          <label className="block text-[10px] uppercase font-bold tracking-wider text-gray-500 font-mono">
                            Bio
                          </label>
                          <span className="text-[10px] text-gray-500 font-bold font-mono">
                            {bio.length}/120
                          </span>
                        </div>
                        <textarea
                          maxLength={120}
                          value={bio}
                          onChange={(e) => setBio(e.target.value)}
                          className="w-full bg-[#0e1222]/60 border border-white/5 hover:border-white/10 focus:border-purple-500 rounded-xl py-2.5 px-4 text-xs text-gray-300 font-semibold outline-none transition-colors h-20 resize-none"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* 2. Academic Information */}
                <div className="rounded-3xl border border-white/5 bg-[#050816]/50 backdrop-blur-xl p-6 relative overflow-hidden group transition-all duration-300">
                  <h3 className="font-extrabold text-white text-sm heading-font mb-6 flex items-center gap-2">
                    <FaBook className="text-[#3B82F6]" /> Academic Information
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] uppercase font-bold tracking-wider text-gray-500 mb-1.5 font-mono">
                        College Name
                      </label>
                      <input
                        type="text"
                        value={collegeName}
                        onChange={(e) => setCollegeName(e.target.value)}
                        placeholder="E.g., Stanford University"
                        className="w-full bg-[#0e1222]/60 border border-white/5 hover:border-white/10 focus:border-purple-500 rounded-xl py-2.5 px-4 text-xs text-gray-300 font-semibold outline-none transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] uppercase font-bold tracking-wider text-gray-500 mb-1.5 font-mono">
                        Branch
                      </label>
                      <select
                        value={branch}
                        onChange={(e) => setBranch(e.target.value)}
                        className="w-full bg-[#0e1222]/60 border border-white/5 hover:border-white/10 focus:border-purple-500 rounded-xl py-2.5 px-4 text-xs text-gray-300 font-semibold outline-none transition-colors cursor-pointer"
                      >
                        <option value="Computer Science & Engineering">Computer Science & Engineering</option>
                        <option value="Information Technology">Information Technology</option>
                        <option value="Electronics & Communication">Electronics & Communication</option>
                        <option value="Electrical Engineering">Electrical Engineering</option>
                        <option value="Mechanical Engineering">Mechanical Engineering</option>
                        <option value="Civil Engineering">Civil Engineering</option>
                        <option value="Other">Other Branch</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] uppercase font-bold tracking-wider text-gray-500 mb-1.5 font-mono">
                        Year
                      </label>
                      <select
                        value={year}
                        onChange={(e) => setYear(e.target.value)}
                        className="w-full bg-[#0e1222]/60 border border-white/5 hover:border-white/10 focus:border-purple-500 rounded-xl py-2.5 px-4 text-xs text-gray-300 font-semibold outline-none transition-colors cursor-pointer"
                      >
                        <option value="1st">1st Year</option>
                        <option value="2nd">2nd Year</option>
                        <option value="3rd">3rd Year</option>
                        <option value="4th">4th Year</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] uppercase font-bold tracking-wider text-gray-500 mb-1.5 font-mono">
                        Graduation Year
                      </label>
                      <input
                        type="text"
                        value={gradYear}
                        onChange={(e) => setGradYear(e.target.value)}
                        placeholder="E.g., 2027"
                        className="w-full bg-[#0e1222]/60 border border-white/5 hover:border-white/10 focus:border-purple-500 rounded-xl py-2.5 px-4 text-xs text-gray-300 font-semibold outline-none transition-colors"
                      />
                    </div>
                  </div>
                </div>

                {/* 3. Team Preferences */}
                <div className="rounded-3xl border border-white/5 bg-[#050816]/50 backdrop-blur-xl p-6 relative overflow-hidden group transition-all duration-300">
                  <h3 className="font-extrabold text-white text-sm heading-font mb-6 flex items-center gap-2">
                    <FaBriefcase className="text-[#3B82F6]" /> Team Preferences
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-[10px] uppercase font-bold tracking-wider text-gray-500 mb-1.5 font-mono">
                        Preferred Role
                      </label>
                      <select
                        value={preferredRole}
                        onChange={(e) => setPreferredRole(e.target.value)}
                        className="w-full bg-[#0e1222]/60 border border-white/5 hover:border-white/10 focus:border-purple-500 rounded-xl py-2.5 px-4 text-xs text-gray-300 font-semibold outline-none transition-colors cursor-pointer"
                      >
                        <option value="Frontend">Frontend</option>
                        <option value="Backend">Backend</option>
                        <option value="Full Stack">Full Stack</option>
                        <option value="AI/ML">AI/ML</option>
                        <option value="UI/UX">UI/UX</option>
                        <option value="DevOps">DevOps</option>
                        <option value="Blockchain">Blockchain</option>
                        <option value="Mobile">Mobile</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] uppercase font-bold tracking-wider text-gray-500 mb-1.5 font-mono">
                        Experience Level
                      </label>
                      <select
                        value={experienceLevel}
                        onChange={(e) => setExperienceLevel(e.target.value)}
                        className="w-full bg-[#0e1222]/60 border border-white/5 hover:border-white/10 focus:border-purple-500 rounded-xl py-2.5 px-4 text-xs text-gray-300 font-semibold outline-none transition-colors cursor-pointer"
                      >
                        <option value="Beginner">Beginner</option>
                        <option value="Intermediate">Intermediate</option>
                        <option value="Advanced">Advanced</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] uppercase font-bold tracking-wider text-gray-500 mb-1.5 font-mono">
                        Availability
                      </label>
                      <select
                        value={availability}
                        onChange={(e) => setAvailability(e.target.value)}
                        className="w-full bg-[#0e1222]/60 border border-white/5 hover:border-white/10 focus:border-purple-500 rounded-xl py-2.5 px-4 text-xs text-gray-300 font-semibold outline-none transition-colors cursor-pointer"
                      >
                        <option value="Weekdays">Weekdays</option>
                        <option value="Weekend">Weekend</option>
                        <option value="Anytime">Anytime</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* 4. Hackathon Experience */}
                <div className="rounded-3xl border border-white/5 bg-[#050816]/50 backdrop-blur-xl p-6 relative overflow-hidden group transition-all duration-300">
                  <h3 className="font-extrabold text-white text-sm heading-font mb-6 flex items-center gap-2">
                    <FaTrophy className="text-[#3B82F6]" /> Hackathon Experience
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] uppercase font-bold tracking-wider text-gray-500 mb-1.5 font-mono">
                        Total Hackathons Participated
                      </label>
                      <input
                        type="number"
                        value={hackathonsParticipated}
                        onChange={(e) => setHackathonsParticipated(e.target.value)}
                        className="w-full bg-[#0e1222]/60 border border-white/5 hover:border-white/10 focus:border-purple-500 rounded-xl py-2.5 px-4 text-xs text-gray-300 font-semibold outline-none transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] uppercase font-bold tracking-wider text-gray-500 mb-1.5 font-mono">
                        Total Wins
                      </label>
                      <input
                        type="number"
                        value={hackathonsWins}
                        onChange={(e) => setHackathonsWins(e.target.value)}
                        className="w-full bg-[#0e1222]/60 border border-white/5 hover:border-white/10 focus:border-purple-500 rounded-xl py-2.5 px-4 text-xs text-gray-300 font-semibold outline-none transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] uppercase font-bold tracking-wider text-gray-500 mb-1.5 font-mono">
                        Preferred Team Size
                      </label>
                      <input
                        type="number"
                        value={preferredTeamSize}
                        onChange={(e) => setPreferredTeamSize(e.target.value)}
                        className="w-full bg-[#0e1222]/60 border border-white/5 hover:border-white/10 focus:border-purple-500 rounded-xl py-2.5 px-4 text-xs text-gray-300 font-semibold outline-none transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] uppercase font-bold tracking-wider text-gray-500 mb-1.5 font-mono">
                        Preferred Project Domain
                      </label>
                      <input
                        type="text"
                        value={preferredProjectDomain}
                        onChange={(e) => setPreferredProjectDomain(e.target.value)}
                        placeholder="E.g., AI, Web3, FinTech"
                        className="w-full bg-[#0e1222]/60 border border-white/5 hover:border-white/10 focus:border-purple-500 rounded-xl py-2.5 px-4 text-xs text-gray-300 font-semibold outline-none transition-colors"
                      />
                    </div>
                  </div>
                </div>

                {/* 5. Enhanced Skills Widget */}
                <div className="rounded-3xl border border-white/5 bg-[#050816]/50 backdrop-blur-xl p-6 relative overflow-hidden group transition-all duration-300">
                  <h3 className="font-extrabold text-white text-sm heading-font mb-2 flex items-center gap-2">
                    <FaCode className="text-[#3B82F6]" /> Skills
                  </h3>
                  <p className="text-[10px] text-gray-500 mb-4 font-semibold font-mono">
                    Search or select skills and define your proficiency.
                  </p>

                  {/* Add skill input & selection */}
                  <div className="flex flex-col md:flex-row gap-3 items-stretch mb-5">
                    <div className="relative flex-1">
                      <input
                        type="text"
                        placeholder="Search or type a skill..."
                        value={searchSkill}
                        onChange={(e) => setSearchSkill(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            handleAddSkill(searchSkill);
                          }
                        }}
                        className="w-full bg-[#0e1222]/60 border border-white/5 hover:border-white/10 focus:border-purple-500 rounded-xl py-2.5 px-4 text-xs text-gray-300 font-semibold outline-none transition-colors"
                      />

                      {/* Suggestions list popup */}
                      {searchSkill.trim() && filteredSuggestions.length > 0 && (
                        <div className="absolute top-full left-0 right-0 mt-2 bg-[#050816] border border-white/5 rounded-xl max-h-48 overflow-y-auto z-20 p-2 shadow-2xl">
                          {filteredSuggestions.map((sug) => (
                            <button
                              key={sug}
                              onClick={() => handleAddSkill(sug)}
                              className="w-full text-left px-3 py-2 text-xs text-gray-400 hover:text-white hover:bg-[#0e1222]/80 rounded-lg transition-colors font-semibold"
                            >
                              {sug}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Skill Level Selection */}
                    <div className="flex items-center gap-2">
                      <select
                        value={skillLevel}
                        onChange={(e) => setSkillLevel(e.target.value)}
                        className="bg-[#0e1222]/60 border border-white/5 hover:border-white/10 focus:border-purple-500 rounded-xl py-2.5 px-4 text-xs text-gray-300 font-semibold outline-none cursor-pointer"
                      >
                        <option value="Beginner">Beginner</option>
                        <option value="Intermediate">Intermediate</option>
                        <option value="Advanced">Advanced</option>
                      </select>

                      <button
                        onClick={() => handleAddSkill(searchSkill)}
                        className="px-4 py-2.5 bg-[#FF8A00] hover:bg-purple-500 rounded-xl text-white text-xs font-bold transition-all flex items-center gap-1.5"
                      >
                        <FaPlus className="text-3xs" /> Add
                      </button>
                    </div>
                  </div>

                  {/* Suggested Skills Fast Add */}
                  <div className="mb-4">
                    <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider font-mono mr-2">
                      Suggestions:
                    </span>
                    <div className="inline-flex flex-wrap gap-1.5 mt-2">
                      {SUGGESTED_SKILLS.filter(
                        (s) => !skills.some((sk) => sk.name.toLowerCase() === s.toLowerCase())
                      )
                        .slice(0, 5)
                        .map((sug) => (
                          <button
                            key={sug}
                            onClick={() => handleAddSkill(sug)}
                            className="text-[10px] px-2.5 py-1 rounded-lg border border-white/5 hover:border-[#FF8A00]/40 bg-[#0e1222]/30 hover:bg-purple-950/20 text-gray-400 hover:text-cyan-300 font-bold transition-all"
                          >
                            + {sug}
                          </button>
                        ))}
                    </div>
                  </div>

                  {/* Skills tags list */}
                  <div className="flex flex-wrap gap-2 mt-4">
                    {skills.map((skill) => (
                      <span
                        key={skill.name}
                        className="pl-3 pr-2 py-1.5 rounded-xl text-xs bg-[#0e1222]/80 text-slate-350 border border-white/5 flex items-center gap-2 group/tag hover:border-purple-500/40 transition-colors"
                      >
                        <span className="font-semibold">{skill.name}</span>
                        <span className="text-[9px] uppercase font-mono px-1.5 py-0.5 rounded bg-purple-500/15 border border-white/5 text-[#3B82F6] font-black">
                          {skill.level}
                        </span>
                        <button
                          onClick={() => handleRemoveSkill(skill.name)}
                          className="text-gray-500 hover:text-red-400 transition-colors"
                        >
                          <FaTimes className="text-3xs" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                {/* 6. Interests & Languages */}
                <div className="rounded-3xl border border-white/5 bg-[#050816]/50 backdrop-blur-xl p-6 relative overflow-hidden group transition-all duration-300">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Interests */}
                    <div>
                      <h3 className="font-extrabold text-white text-sm heading-font mb-1.5 flex items-center gap-2">
                        <span>🎯</span> Interests
                      </h3>
                      <p className="text-[10px] text-gray-500 mb-4 font-semibold font-mono">
                        Select domains you want to explore.
                      </p>

                      <div className="flex flex-wrap gap-1.5">
                        {INTERESTS_OPTIONS.map((interest) => {
                          const isSelected = selectedInterests.includes(interest);
                          return (
                            <button
                              key={interest}
                              onClick={() => toggleInterest(interest)}
                              className={`text-[10px] font-bold px-3 py-1.5 rounded-xl border transition-all flex items-center gap-1 ${
                                isSelected
                                  ? "bg-[#3B82F6]/15 border-purple-500 text-cyan-300"
                                  : "bg-[#0e1222]/30 border-white/5 hover:border-white/8 text-gray-400 hover:text-white"
                              }`}
                            >
                              {interest}
                              {isSelected && <FaTimes className="text-3xs ml-1" />}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Languages */}
                    <div>
                      <h3 className="font-extrabold text-white text-sm heading-font mb-1.5 flex items-center gap-2">
                        <FaLanguage className="text-[#3B82F6] text-lg" /> Languages
                      </h3>
                      <p className="text-[10px] text-gray-500 mb-4 font-semibold font-mono">
                        Languages you can communicate in.
                      </p>

                      <div className="flex flex-wrap gap-1.5">
                        {LANGUAGES_OPTIONS.map((lang) => {
                          const isSelected = selectedLanguages.includes(lang);
                          return (
                            <button
                              key={lang}
                              onClick={() => toggleLanguage(lang)}
                              className={`text-[10px] font-bold px-3 py-1.5 rounded-xl border transition-all flex items-center gap-1 ${
                                isSelected
                                  ? "bg-blue-600/20 border-blue-500 text-blue-300"
                                  : "bg-[#0e1222]/30 border-white/5 hover:border-white/8 text-gray-400 hover:text-white"
                              }`}
                            >
                              {lang}
                              {isSelected && <FaTimes className="text-3xs ml-1" />}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>

                {/* 7. Socials & Portfolio */}
                <div className="rounded-3xl border border-white/5 bg-[#050816]/50 backdrop-blur-xl p-6 relative overflow-hidden group transition-all duration-300">
                  <h3 className="font-extrabold text-white text-sm heading-font mb-6 flex items-center gap-2">
                    <FaExternalLinkAlt className="text-[#3B82F6] text-xs" /> Social & Portfolio
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] uppercase font-bold tracking-wider text-gray-500 mb-1.5 font-mono flex items-center gap-1.5">
                        <FaGithub className="text-gray-400" /> GitHub Link
                      </label>
                      <input
                        type="text"
                        value={githubLink}
                        onChange={(e) => setGithubLink(e.target.value)}
                        placeholder="https://github.com/your-username"
                        className="w-full bg-[#0e1222]/60 border border-white/5 hover:border-white/10 focus:border-purple-500 rounded-xl py-2.5 px-4 text-xs text-gray-300 font-semibold outline-none transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] uppercase font-bold tracking-wider text-gray-500 mb-1.5 font-mono flex items-center gap-1.5">
                        <FaLinkedin className="text-blue-400" /> LinkedIn Link
                      </label>
                      <input
                        type="text"
                        value={linkedinLink}
                        onChange={(e) => setLinkedinLink(e.target.value)}
                        placeholder="https://linkedin.com/in/your-username"
                        className="w-full bg-[#0e1222]/60 border border-white/5 hover:border-white/10 focus:border-purple-500 rounded-xl py-2.5 px-4 text-xs text-gray-300 font-semibold outline-none transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] uppercase font-bold tracking-wider text-gray-500 mb-1.5 font-mono">
                        Portfolio Website
                      </label>
                      <input
                        type="text"
                        value={portfolioWebsite}
                        onChange={(e) => setPortfolioWebsite(e.target.value)}
                        placeholder="https://yourwebsite.dev"
                        className="w-full bg-[#0e1222]/60 border border-white/5 hover:border-white/10 focus:border-purple-500 rounded-xl py-2.5 px-4 text-xs text-gray-300 font-semibold outline-none transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] uppercase font-bold tracking-wider text-gray-500 mb-1.5 font-mono">
                        Resume Link
                      </label>
                      <input
                        type="text"
                        value={resumeLink}
                        onChange={(e) => setResumeLink(e.target.value)}
                        placeholder="E.g., Google Drive link"
                        className="w-full bg-[#0e1222]/60 border border-white/5 hover:border-white/10 focus:border-purple-500 rounded-xl py-2.5 px-4 text-xs text-gray-300 font-semibold outline-none transition-colors"
                      />
                    </div>

                    {/* Resume Upload File Box */}
                    <div className="md:col-span-2 mt-2">
                      <label className="block text-[10px] uppercase font-bold tracking-wider text-gray-500 mb-2 font-mono">
                        Resume File Upload
                      </label>

                      <div className="flex flex-col sm:flex-row items-center gap-3 p-4 rounded-2xl bg-[#0e1222]/40 border border-dashed border-white/5 hover:border-[#FF8A00]/40 transition-colors">
                        <label className="flex items-center gap-2 px-4 py-2 bg-[#0e1222] hover:bg-slate-700 text-gray-350 hover:text-white rounded-xl text-xs font-bold cursor-pointer transition-colors border border-white/8">
                          <FaUpload className="text-[10px]" />
                          Upload PDF
                          <input
                            type="file"
                            accept=".pdf"
                            className="hidden"
                            onChange={handleResumeUpload}
                          />
                        </label>

                        <div className="text-center sm:text-left">
                          <p className="text-xs font-bold text-gray-300">
                            {resumeName ? resumeName : "No file selected"}
                          </p>
                          <p className="text-[9px] text-gray-500 font-semibold font-mono mt-0.5">
                            PDF format only (Max 5MB)
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Form Buttons */}
                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    onClick={handleCancel}
                    className="px-5 py-2.5 rounded-xl border border-white/5 hover:border-white/10 hover:bg-[#0e1222] text-gray-400 hover:text-white text-xs font-bold transition-all"
                  >
                    Cancel
                  </button>
                  <motion.button
                    whileHover={{ scale: 1.02, boxShadow: "0 0 20px rgba(168, 85, 247, 0.4)" }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleSaveChanges}
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white text-xs font-bold transition-all"
                  >
                    Save Changes
                  </motion.button>
                </div>

              </div>

              {/* Right Column - Side Widgets Cards */}
              <div className="space-y-6">
                
                {/* 1. AI Readiness Score Card */}
                <div className="rounded-3xl border border-white/5 bg-[#050816]/50 backdrop-blur-xl p-6 relative overflow-hidden group transition-all duration-300">
                  <div className="absolute inset-0 w-[200%] bg-gradient-to-r from-transparent via-white/2 to-transparent -translate-x-full group-hover:translate-x-1/2 transition-transform duration-1000 ease-out pointer-events-none" style={{ transform: "skewX(-25deg)" }} />

                  <h3 className="font-extrabold text-white text-sm heading-font mb-4">AI Profile Score</h3>

                  {/* Progress Gauge */}
                  <div className="flex items-center gap-5 mb-6">
                    <div className="relative w-18 h-18 flex items-center justify-center flex-shrink-0">
                      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 70 70">
                        {/* Circle background */}
                        <circle cx="35" cy="35" r="28" className="stroke-slate-850" strokeWidth="6" fill="transparent" />
                        {/* Circle progress filled */}
                        <motion.circle
                          cx="35"
                          cy="35"
                          r="28"
                          stroke="url(#aiScoreGradient)"
                          strokeWidth="6"
                          fill="transparent"
                          strokeDasharray={2 * Math.PI * 28}
                          initial={{ strokeDashoffset: 2 * Math.PI * 28 }}
                          animate={{ strokeDashoffset: 2 * Math.PI * 28 - (aiScore / 100) * (2 * Math.PI * 28) }}
                          transition={{ duration: 0.8 }}
                          strokeLinecap="round"
                        />
                        <defs>
                          <linearGradient id="aiScoreGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#c084fc" />
                            <stop offset="100%" stopColor="#6366f1" />
                          </linearGradient>
                        </defs>
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="font-black text-lg text-white font-mono">{aiScore}%</span>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-extrabold text-white text-xs">Profile Strength</h4>
                      <p className="text-[10px] text-gray-500 font-semibold mt-1">
                        {aiScore < 50 ? "Weak profile strength. Fill in more info!" :
                         aiScore < 80 ? "Good profile. Add a resume or social links for perfection." :
                         "Excellent AI-ready profile! Let matches fly in."}
                      </p>
                    </div>
                  </div>

                  {/* Completion list */}
                  <div className="space-y-2.5 border-t border-white/5/60 pt-4 text-[11px] font-semibold">
                    {[
                      { label: "Profile Completion", done: isProfileComplete },
                      { label: "GitHub Connected", done: isGithubConnected },
                      { label: "LinkedIn Connected", done: isLinkedinConnected },
                      { label: "Skills Added", done: isSkillsAdded },
                      { label: "Interests Added", done: isInterestsAdded },
                      { label: "Availability Added", done: isAvailabilityAdded },
                      { label: "Preferred Role Selected", done: isPreferredRoleSelected },
                      { label: "Experience Added", done: isExperienceAdded },
                      { label: "Resume Linked/Uploaded", done: isResumeUploaded },
                    ].map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between">
                        <span className={item.done ? "text-gray-300" : "text-gray-500"}>{item.label}</span>
                        {item.done ? (
                          <span className="w-4 h-4 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 text-3xs">
                            <FaCheck />
                          </span>
                        ) : (
                          <span className="w-4 h-4 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 text-3xs font-black">
                            !
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* 2. Trust Preview Card */}
                <div className="rounded-3xl border border-white/5 bg-[#050816]/50 backdrop-blur-xl p-6 relative overflow-hidden group transition-all duration-300">
                  <h3 className="font-extrabold text-white text-sm heading-font mb-4">Trust Preview Card</h3>

                  {/* Trust Score */}
                  <div className="p-4 rounded-2xl bg-[#0e1222]/40 border border-white/5 flex items-center justify-between mb-4">
                    <div>
                      <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider font-mono">
                        Trust Score
                      </span>
                      <h4 className="text-xl font-black text-white font-mono mt-0.5">50%</h4>
                    </div>
                    <span className="text-2xl">🛡️</span>
                  </div>

                  {/* Preview Metrics list */}
                  <div className="space-y-3 text-[11px] font-semibold text-gray-400">
                    <div className="flex justify-between items-center">
                      <span>Completed Hackathons</span>
                      <span className="text-white font-bold font-mono">0 (Preview)</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Average Rating</span>
                      <span className="text-white font-bold font-mono">N/A (Preview)</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Verified Accounts</span>
                      <span className="text-white font-bold font-mono">0 / 3 (Preview)</span>
                    </div>
                  </div>
                  <p className="text-[9px] text-gray-500 font-medium leading-relaxed mt-4 border-t border-white/5/60 pt-3">
                    * Values are read-only. Trust Score and ratings are calculated asynchronously by the backend verification engine.
                  </p>
                </div>

                {/* 3. Quick Actions */}
                <div className="rounded-3xl border border-white/5 bg-[#050816]/50 backdrop-blur-xl p-6 relative overflow-hidden group transition-all duration-300">
                  <h3 className="font-extrabold text-white text-sm heading-font mb-4">Quick Actions</h3>

                  <div className="space-y-2">
                    {[
                      { label: "Edit Profile", icon: <FaUser className="text-xs" /> },
                      { label: "Change Password", icon: <FaLock className="text-xs" /> },
                      { label: "Download My Data", icon: <FaDownload className="text-xs" /> },
                      { label: "Deactivate Account", icon: <FaBan className="text-xs" />, danger: true },
                      { label: "Log Out", icon: <FaSignOutAlt className="text-xs" />, danger: true },
                    ].map((action, idx) => (
                      <button
                        key={idx}
                        className={`w-full flex items-center justify-between p-3 rounded-2xl border transition-all text-xs font-semibold ${
                          action.danger
                            ? "bg-red-500/5 hover:bg-red-500/10 border-red-500/20 hover:border-red-500/40 text-red-400"
                            : "bg-[#0e1222]/30 hover:bg-[#0e1222]/60 border-white/5 hover:border-white/10 text-gray-300 hover:text-white"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          {action.icon}
                          <span>{action.label}</span>
                        </div>
                        <span className="text-[10px] text-gray-500 font-mono">→</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* 4. Connected Accounts */}
                <div className="rounded-3xl border border-white/5 bg-[#050816]/50 backdrop-blur-xl p-6 relative overflow-hidden group transition-all duration-300">
                  <h3 className="font-extrabold text-white text-sm heading-font mb-4">Connected Accounts</h3>

                  <div className="space-y-3">
                    {[
                      { provider: "GitHub", handle: "harshit-singh", icon: <FaGithub className="text-lg text-white" />, connected: true },
                      { provider: "LinkedIn", handle: "harshitsingh", icon: <FaLinkedin className="text-lg text-blue-400" />, connected: true },
                      { provider: "Google", handle: "harshit.singh@gmail.com", icon: <FaGoogle className="text-lg text-red-400" />, connected: true },
                    ].map((acc, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-3 rounded-2xl border border-white/5/60 bg-[#0e1222]/20 hover:bg-[#0e1222]/40 hover:border-white/5 transition-all"
                      >
                        <div className="flex items-center gap-3">
                          {acc.icon}
                          <div>
                            <h4 className="font-bold text-xs text-white leading-none">{acc.provider}</h4>
                            <span className="text-[9px] text-gray-500 font-bold font-mono mt-1 block">
                              {acc.handle}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase font-mono">
                            Connected
                          </span>
                          <button className="text-gray-500 hover:text-white transition-colors p-1">
                            <FaEllipsisV className="text-3xs" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </div>
          ) : activeTab === "Account" ? (
            <div className="space-y-6">
              <div className="rounded-3xl border border-white/5 bg-[#0e1222]/85 p-8 shadow-lg text-left">
                <h3 className="font-extrabold text-white text-lg heading-font mb-6">Account Settings</h3>
                <form onSubmit={handleSaveChanges} className="space-y-6">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Email Address</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-[#050816] border border-white/5 focus:border-[#3B82F6] rounded-xl py-3 px-4 text-xs md:text-sm text-slate-200 outline-none"
                    />
                  </div>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">College Name</label>
                      <input
                        type="text"
                        value={collegeName}
                        onChange={(e) => setCollegeName(e.target.value)}
                        className="w-full bg-[#050816] border border-white/5 focus:border-[#3B82F6] rounded-xl py-3 px-4 text-xs md:text-sm text-slate-200 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Branch</label>
                      <input
                        type="text"
                        value={branch}
                        onChange={(e) => setBranch(e.target.value)}
                        className="w-full bg-[#050816] border border-white/5 focus:border-[#3B82F6] rounded-xl py-3 px-4 text-xs md:text-sm text-slate-200 outline-none"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end pt-4 border-t border-slate-900">
                    <button
                      type="submit"
                      className="px-6 py-2.5 rounded-full text-xs font-bold tracking-wider text-white bg-[#FF8A00] border border-[#FF8A00] shadow-[0_0_15px_rgba(255,138,0,0.2)] hover:bg-[#ff9a22]"
                    >
                      Save Account Info
                    </button>
                  </div>
                </form>
              </div>

              {/* Danger Zone */}
              <div className="rounded-3xl border border-red-500/20 bg-red-950/5 p-8 text-left">
                <h3 className="font-extrabold text-red-400 text-lg heading-font mb-3">Danger Zone</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Deleting your account will wipe all user data, matching profiles, teams participation, and cannot be undone.
                </p>
                <button
                  onClick={() => {
                    if (window.confirm("Are you absolutely sure you want to delete your account? This action is irreversible.")) {
                      alert("Account deletion initiated.");
                    }
                  }}
                  className="mt-6 px-6 py-2.5 rounded-full text-xs font-bold bg-transparent border border-red-500/35 hover:border-red-500 text-red-400 hover:bg-red-500/10 transition-all"
                >
                  Delete Account
                </button>
              </div>
            </div>
          ) : activeTab === "Notifications" ? (
            <div className="rounded-3xl border border-white/5 bg-[#0e1222]/85 p-8 shadow-lg text-left">
              <h3 className="font-extrabold text-white text-lg heading-font mb-6">Notification Preferences</h3>
              <div className="space-y-4">
                {[
                  { id: "email", title: "Email Notifications", desc: "Receive updates about hackathons, team invites and messages.", val: emailNotifications, setter: setEmailNotifications },
                  { id: "invites", title: "Team Invitations", desc: "Get notified when someone invites you to their team.", val: teamInvitations, setter: setTeamInvitations },
                  { id: "ai", title: "AI Recommendations", desc: "Allow AI to suggest the best teams and opportunities for you.", val: aiRecommendations, setter: setAiRecommendations },
                  { id: "marketing", title: "Marketing Emails", desc: "Receive tips, updates and offers from COSMOQ.", val: marketingEmails, setter: setMarketingEmails },
                ].map((pref) => (
                  <div key={pref.id} className="flex items-center justify-between gap-4 p-3 rounded-2xl border border-white/5 bg-[#050816]/30">
                    <div>
                      <h4 className="font-extrabold text-xs text-white">{pref.title}</h4>
                      <p className="text-[10px] text-gray-500 font-semibold mt-0.5">{pref.desc}</p>
                    </div>
                    <button
                      onClick={() => pref.setter(!pref.val)}
                      className={`w-10 h-5 rounded-full p-0.5 transition-colors duration-300 flex items-center ${
                        pref.val ? "bg-[#FF8A00] justify-end" : "bg-[#0e1222] justify-start"
                      }`}
                    >
                      <motion.div layout className="w-4 h-4 rounded-full bg-white shadow-md" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ) : activeTab === "Privacy" ? (
            <div className="rounded-3xl border border-white/5 bg-[#0e1222]/85 p-8 shadow-lg text-left">
              <h3 className="font-extrabold text-white text-lg heading-font mb-6">Privacy Controls</h3>
              <div className="space-y-4">
                <div className="p-4 rounded-2xl border border-white/5 bg-[#050816]/30">
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Profile Visibility</label>
                  <select
                    value={profileVisibility}
                    onChange={(e) => setProfileVisibility(e.target.value)}
                    className="bg-[#050816] border border-white/5 rounded-xl py-2 px-3 text-xs text-slate-200 outline-none w-full"
                  >
                    <option value="Public">Public (Searchable by anyone)</option>
                    <option value="Private">Private (Only visible to team members)</option>
                  </select>
                </div>
                {[
                  { title: "Show Hackathon History", desc: "Allow other developers to view your completed events.", val: showHistory, setter: setShowHistory },
                  { title: "Allow Direct Messaging", desc: "Let recruiters and team leaders contact you directly.", val: allowDM, setter: setAllowDM },
                  { title: "Show Availability Status", desc: "Show 'Available for Teams' badge on search directories.", val: showAvailability, setter: setShowAvailability },
                ].map((pref, idx) => (
                  <div key={idx} className="flex items-center justify-between gap-4 p-3 rounded-2xl border border-white/5 bg-[#050816]/30">
                    <div>
                      <h4 className="font-extrabold text-xs text-white">{pref.title}</h4>
                      <p className="text-[10px] text-gray-500 font-semibold mt-0.5">{pref.desc}</p>
                    </div>
                    <button
                      onClick={() => pref.setter(!pref.val)}
                      className={`w-10 h-5 rounded-full p-0.5 transition-colors duration-300 flex items-center ${
                        pref.val ? "bg-[#FF8A00] justify-end" : "bg-[#0e1222] justify-start"
                      }`}
                    >
                      <motion.div layout className="w-4 h-4 rounded-full bg-white shadow-md" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ) : activeTab === "Security" ? (
            <div className="rounded-3xl border border-white/5 bg-[#0e1222]/85 p-8 shadow-lg text-left">
              <h3 className="font-extrabold text-white text-lg heading-font mb-6">Security & Password</h3>
              <form onSubmit={handleUpdatePassword} className="space-y-6">
                {passwordError && <div className="p-3 bg-red-500/10 border border-red-500/25 rounded-xl text-red-400 text-xs">{passwordError}</div>}
                {passwordSuccess && <div className="p-3 bg-green-500/10 border border-green-500/25 rounded-xl text-green-400 text-xs">{passwordSuccess}</div>}
                
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Current Password</label>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full bg-[#050816] border border-white/5 focus:border-[#3B82F6] rounded-xl py-3 px-4 text-xs md:text-sm text-slate-200 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">New Password</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full bg-[#050816] border border-white/5 focus:border-[#3B82F6] rounded-xl py-3 px-4 text-xs md:text-sm text-slate-200 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Confirm New Password</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full bg-[#050816] border border-white/5 focus:border-[#3B82F6] rounded-xl py-3 px-4 text-xs md:text-sm text-slate-200 outline-none"
                  />
                </div>
                <div className="flex justify-end pt-4 border-t border-slate-900">
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-full text-xs font-bold tracking-wider text-white bg-[#FF8A00] border border-[#FF8A00] shadow-[0_0_15px_rgba(255,138,0,0.2)] hover:bg-[#ff9a22]"
                  >
                    Update Password
                  </button>
                </div>
              </form>
            </div>
          ) : activeTab === "Display" ? (
            <div className="rounded-3xl border border-white/5 bg-[#0e1222]/85 p-8 shadow-lg text-left">
              <h3 className="font-extrabold text-white text-lg heading-font mb-6">Display Settings</h3>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-3">Primary Accent Theme</label>
                  <div className="flex gap-4">
                    {["Orange", "Cyan", "Emerald"].map((color) => (
                      <button
                        key={color}
                        onClick={() => handleSaveDisplay(color, particleSpeed, compactLayout)}
                        className={`px-4 py-2 rounded-xl text-xs font-bold border transition ${
                          accentColor === color
                            ? "bg-[#3B82F6]/10 border-[#3B82F6] text-white"
                            : "bg-[#050816] border-white/5 text-slate-400 hover:text-white"
                        }`}
                      >
                        {color} Accent
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-3">Background Particle Speed</label>
                  <div className="flex gap-4">
                    {["Slow", "Normal", "Fast", "Off"].map((speed) => (
                      <button
                        key={speed}
                        onClick={() => handleSaveDisplay(accentColor, speed, compactLayout)}
                        className={`px-4 py-2 rounded-xl text-xs font-bold border transition ${
                          particleSpeed === speed
                            ? "bg-[#3B82F6]/10 border-[#3B82F6] text-white"
                            : "bg-[#050816] border-white/5 text-slate-400 hover:text-white"
                        }`}
                      >
                        {speed} Speed
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between gap-4 p-3 rounded-2xl border border-white/5 bg-[#050816]/30">
                  <div>
                    <h4 className="font-extrabold text-xs text-white">Compact Layout Dashboard</h4>
                    <p className="text-[10px] text-gray-500 font-semibold mt-0.5">Toggle spacing compression for dashboard cards.</p>
                  </div>
                  <button
                    onClick={() => handleSaveDisplay(accentColor, particleSpeed, !compactLayout)}
                    className={`w-10 h-5 rounded-full p-0.5 transition-colors duration-300 flex items-center ${
                      compactLayout ? "bg-[#FF8A00] justify-end" : "bg-[#0e1222] justify-start"
                    }`}
                  >
                    <motion.div layout className="w-4 h-4 rounded-full bg-white shadow-md" />
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-3xl border border-white/5 bg-[#050816]/50 backdrop-blur-xl p-8 text-center min-h-[300px] flex flex-col justify-center items-center">
              <span className="text-3xl mb-3">⚙️</span>
              <h3 className="font-extrabold text-white text-base heading-font">{activeTab} Settings</h3>
            </div>
          )}

          {/* Preferences Settings Card (Visible below tab content for visual density matching the screen) */}
          {activeTab === "Profile" && (
            <div className="rounded-3xl border border-white/5 bg-[#050816]/50 backdrop-blur-xl p-6 relative overflow-hidden group transition-all duration-300 mt-6">
              <h3 className="font-extrabold text-white text-sm heading-font mb-6">Preferences</h3>

              <div className="space-y-4">
                {[
                  {
                    id: "email",
                    title: "Email Notifications",
                    desc: "Receive updates about hackathons, team invites and messages.",
                    val: emailNotifications,
                    setter: setEmailNotifications,
                    icon: <FaEnvelope className="text-xs" />,
                  },
                  {
                    id: "invites",
                    title: "Team Invitations",
                    desc: "Get notified when someone invites you to their team.",
                    val: teamInvitations,
                    setter: setTeamInvitations,
                    icon: <FaUsers className="text-xs" />,
                  },
                  {
                    id: "ai",
                    title: "AI Recommendations",
                    desc: "Allow AI to suggest the best teams and opportunities for you.",
                    val: aiRecommendations,
                    setter: setAiRecommendations,
                    icon: <FaPlus className="text-xs" />,
                  },
                  {
                    id: "marketing",
                    title: "Marketing Emails",
                    desc: "Receive tips, updates and offers from COSMOQ.",
                    val: marketingEmails,
                    setter: setMarketingEmails,
                    icon: <FaTrophy className="text-xs" />,
                  },
                ].map((pref) => (
                  <div key={pref.id} className="flex items-center justify-between gap-4 p-3 rounded-2xl border border-white/5/60 bg-[#050816]/20">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-[#0e1222] border border-white/5 flex items-center justify-center text-[#3B82F6]">
                        {pref.icon}
                      </div>
                      <div>
                        <h4 className="font-extrabold text-xs text-white">{pref.title}</h4>
                        <p className="text-[10px] text-gray-500 font-semibold mt-0.5 leading-relaxed">
                          {pref.desc}
                        </p>
                      </div>
                    </div>

                    {/* Toggle Switch */}
                    <button
                      onClick={() => pref.setter(!pref.val)}
                      className={`w-10 h-5 rounded-full p-0.5 transition-colors duration-300 flex items-center ${
                        pref.val ? "bg-[#FF8A00] justify-end" : "bg-[#0e1222] justify-start"
                      }`}
                    >
                      <motion.div
                        layout
                        className="w-4 h-4 rounded-full bg-white shadow-md"
                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                      />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
    </PageLayout>
  );
}

export default Settings;
