import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaArrowLeft,
  FaUsers,
  FaPlusCircle,
  FaTrophy,
  FaCode,
  FaList,
} from "react-icons/fa";
import Sidebar from "../components/dashboard/Sidebar";
import Topbar from "../components/dashboard/Topbar";
import AnimatedBackground from "../components/dashboard/AnimatedBackground";
import api from "../api/axios";

function CreateTeam() {
  const navigate = useNavigate();
  const [hackathons, setHackathons] = useState([]);
  const [teamName, setTeamName] = useState("");
  const [description, setDescription] = useState("");
  const [hackathonId, setHackathonId] = useState("");
  const [maxMembers, setMaxMembers] = useState(4);
  const [requiredSkills, setRequiredSkills] = useState([]);
  const [skillInput, setSkillInput] = useState("");
  
  // States
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  // Fetch hackathons
  useEffect(() => {
    const fetchHackathons = async () => {
      try {
        const res = await api.get("/hackathons");
        setHackathons(res.data || []);
        if (res.data && res.data.length > 0) {
          setHackathonId(res.data[0]._id);
        }
      } catch (err) {
        console.error("Error fetching hackathons:", err);
      }
    };
    fetchHackathons();
  }, []);

  // Handle skills tags
  const addSkill = (e) => {
    e.preventDefault();
    const cleanSkill = skillInput.trim();
    if (cleanSkill && !requiredSkills.includes(cleanSkill)) {
      setRequiredSkills([...requiredSkills, cleanSkill]);
      setSkillInput("");
    }
  };

  const removeSkill = (skillToRemove) => {
    setRequiredSkills(requiredSkills.filter((s) => s !== skillToRemove));
  };

  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!teamName.trim()) {
      setError("Team name is required");
      return;
    }
    if (!hackathonId) {
      setError("Please select a hackathon");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const payload = {
        teamName,
        description,
        hackathonId,
        requiredSkills,
        maxMembers: Number(maxMembers),
        status: "Open",
      };

      await api.post("/teams", payload);
      setSuccess(true);
      
      // Redirect after 2 seconds
      setTimeout(() => {
        navigate("/my-team");
      }, 2000);
    } catch (err) {
      console.error("Error creating team:", err);
      setError(err.response?.data?.message || "Failed to create team. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-[#050816] text-white">
      {/* Background Orbs */}
      <AnimatedBackground />

      {/* Sidebar */}
      <Sidebar activePage="My Team" />

      {/* Main Content */}
      <main className="ml-72 relative z-10 min-h-screen">
        <Topbar />

        <div className="p-8 max-w-3xl">
          {/* Back link */}
          <button
            onClick={() => navigate("/dashboard")}
            className="flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-white transition mb-6"
          >
            <FaArrowLeft />
            <span>Back to Dashboard</span>
          </button>

          {/* Header Title */}
          <div className="mb-10 text-left">
            <h1 className="text-4xl font-extrabold tracking-tight">Create Workspace Team</h1>
            <p className="text-slate-400 text-xs md:text-sm mt-2">
              Launch a project team, list required skills, and match with recommended developers.
            </p>
          </div>

          {/* Form Card wrapper */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="bg-[#0e1222] border border-white/5 rounded-3xl p-8 shadow-[0_20px_50px_rgba(5,8,22,0.65)] relative overflow-hidden"
          >
            {/* Visual glows inside form card */}
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-[#FF8A00]/5 blur-3xl rounded-full pointer-events-none" />
            <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-[#3B82F6]/5 blur-3xl rounded-full pointer-events-none" />

            <AnimatePresence mode="wait">
              {success ? (
                /* Success Screen state */
                <motion.div
                  key="success"
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  className="py-12 flex flex-col items-center text-center"
                >
                  <div className="w-16 h-16 rounded-full bg-green-500/10 border border-green-500/30 flex items-center justify-center text-green-400 text-3xl mb-6 shadow-[0_0_20px_rgba(34,197,94,0.2)]">
                    ✓
                  </div>
                  <h3 className="text-2xl font-bold text-white">Team Created Successfully!</h3>
                  <p className="text-slate-400 text-xs md:text-sm mt-2">
                    Redirecting you to your team workspace portal...
                  </p>
                </motion.div>
              ) : (
                /* Standard Form view */
                <form key="form" onSubmit={handleSubmit} className="space-y-6 text-left relative z-10">
                  {error && (
                    <div className="p-4 bg-red-500/10 border border-red-500/25 rounded-xl text-red-400 text-xs font-semibold">
                      {error}
                    </div>
                  )}

                  {/* Team Name */}
                  <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-widest mb-2.5">
                      Team Name
                    </label>
                    <div className="relative">
                      <FaUsers className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-xs" />
                      <input
                        type="text"
                        placeholder="e.g. Lambda Hackers"
                        value={teamName}
                        onChange={(e) => setTeamName(e.target.value)}
                        className="w-full bg-[#050816] border border-white/5 hover:border-white/10 focus:border-[#3B82F6] rounded-xl py-3 pl-11 pr-4 text-xs md:text-sm text-slate-200 outline-none transition-colors"
                      />
                    </div>
                  </div>

                  {/* Hackathon Selection */}
                  <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-widest mb-2.5">
                      Hackathon Event
                    </label>
                    <div className="relative">
                      <FaTrophy className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-xs" />
                      <select
                        value={hackathonId}
                        onChange={(e) => setHackathonId(e.target.value)}
                        className="w-full bg-[#050816] border border-white/5 hover:border-white/10 focus:border-[#3B82F6] rounded-xl py-3 pl-11 pr-4 text-xs md:text-sm text-slate-200 outline-none transition-colors appearance-none"
                      >
                        {hackathons.map((hack) => (
                          <option key={hack._id} value={hack._id}>
                            {hack.title}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-widest mb-2.5">
                      Project Description
                    </label>
                    <div className="relative">
                      <FaList className="absolute left-4 top-4 text-slate-500 text-xs" />
                      <textarea
                        rows="3"
                        placeholder="Describe your hackathon project concept, goals, and who you are looking to recruit..."
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="w-full bg-[#050816] border border-white/5 hover:border-white/10 focus:border-[#3B82F6] rounded-xl py-3 pl-11 pr-4 text-xs md:text-sm text-slate-200 outline-none transition-colors resize-none"
                      />
                    </div>
                  </div>

                  {/* Grid fields: Max members and skills */}
                  <div className="grid md:grid-cols-2 gap-6">
                    {/* Max Members */}
                    <div>
                      <label className="block text-xs font-bold text-slate-300 uppercase tracking-widest mb-2.5">
                        Max Members Count
                      </label>
                      <select
                        value={maxMembers}
                        onChange={(e) => setMaxMembers(e.target.value)}
                        className="w-full bg-[#050816] border border-white/5 hover:border-white/10 focus:border-[#3B82F6] rounded-xl py-3 px-4 text-xs md:text-sm text-slate-200 outline-none transition-colors"
                      >
                        <option value="2">2 members</option>
                        <option value="3">3 members</option>
                        <option value="4">4 members</option>
                        <option value="5">5 members</option>
                        <option value="6">6 members</option>
                      </select>
                    </div>

                    {/* Skill inputs */}
                    <div>
                      <label className="block text-xs font-bold text-slate-300 uppercase tracking-widest mb-2.5">
                        Add Required Skill
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="e.g. React"
                          value={skillInput}
                          onChange={(e) => setSkillInput(e.target.value)}
                          className="w-full bg-[#050816] border border-white/5 hover:border-white/10 focus:border-[#3B82F6] rounded-xl py-3 px-4 text-xs md:text-sm text-slate-200 outline-none transition-colors"
                        />
                        <button
                          type="button"
                          onClick={addSkill}
                          className="px-4 py-3 bg-[#3B82F6] hover:bg-[#2563EB] text-white rounded-xl text-xs font-bold transition-colors"
                        >
                          Add
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Skills tags list */}
                  {requiredSkills.length > 0 && (
                    <div className="pt-2">
                      <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Required Stack Tags</span>
                      <div className="flex flex-wrap gap-2">
                        {requiredSkills.map((skill, idx) => (
                          <span
                            key={idx}
                            className="bg-[#050816] border border-white/5 text-[#3B82F6] text-xs px-3 py-1 rounded-full flex items-center gap-2"
                          >
                            <span>{skill}</span>
                            <button
                              type="button"
                              onClick={() => removeSkill(skill)}
                              className="text-red-400 hover:text-red-500 font-bold"
                            >
                              ×
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Submit Button */}
                  <div className="pt-4 border-t border-slate-900/60 flex justify-end">
                    <button
                      type="submit"
                      disabled={loading}
                      className="
                        px-8
                        py-3.5
                        rounded-full
                        text-xs
                        font-bold
                        tracking-wider
                        text-white
                        bg-[#FF8A00]
                        border
                        border-[#FF8A00]
                        shadow-[0_0_20px_rgba(255,138,0,0.35)]
                        hover:bg-[#ff9a22]
                        hover:shadow-[0_0_30px_rgba(255,138,0,0.65)]
                        disabled:opacity-50
                        transition-all
                        duration-300
                        flex
                        items-center
                        gap-2
                      "
                    >
                      {loading ? (
                        <>
                          <div className="animate-spin rounded-full h-3.5 w-3.5 border-t-2 border-b-2 border-white"></div>
                          <span>Creating...</span>
                        </>
                      ) : (
                        <>
                          <FaPlusCircle />
                          <span>Create Team</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </main>
    </div>
  );
}

export default CreateTeam;
