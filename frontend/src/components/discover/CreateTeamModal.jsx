import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import DeveloperDetailsModal from "../common/DeveloperDetailsModal";
import { FaTimes, FaUsers, FaCode, FaFolderOpen, FaPlusCircle } from "react-icons/fa";
import api from "../../api/axios";

function CreateTeamModal({ onClose, onSuccess, preselectedHackathonId = "", prefillData = null }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [hackathons, setHackathons] = useState([]);
  const [teamName, setTeamName] = useState(prefillData?.teamName || "");
  const [description, setDescription] = useState(prefillData?.description || "");
  const [hackathonId, setHackathonId] = useState(prefillData?.hackathonId || preselectedHackathonId);
  const [maxMembers, setMaxMembers] = useState(4);
  const [requiredRoles, setRequiredRoles] = useState(prefillData?.requiredRoles || []);
  const [roleInput, setRoleInput] = useState("");
  const [requiredSkills, setRequiredSkills] = useState(prefillData?.requiredSkills || []);
  const [skillInput, setSkillInput] = useState("");
  const [recommendedBuilders, setRecommendedBuilders] = useState([]);
  const [selectedBuilderIds, setSelectedBuilderIds] = useState([]);
  const [buildersLoading, setBuildersLoading] = useState(false);
  const [profileBuilder, setProfileBuilder] = useState(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Fetch hackathons list for binding options
  useEffect(() => {
    const fetchHackathons = async () => {
      try {
        const res = await api.get("/hackathons");
        const hacks = res.data.hackathons || res.data || [];
        setHackathons(hacks);
        // Pre-select if not already set
        if (!hackathonId && hacks.length > 0) {
          setHackathonId(hacks[0]._id || hacks[0].id);
        }
      } catch (err) {
        console.error("Error loading hackathons in team creator:", err);
      }
    };
    fetchHackathons();
  }, []);

  // Update selection if pre-selected changes
  useEffect(() => {
    if (preselectedHackathonId) {
      setHackathonId(preselectedHackathonId);
    }
  }, [preselectedHackathonId]);

  // Only candidates interested in this exact hackathon are shown. The server
  // ranks them against the event plus the skills and roles this team needs.
  useEffect(() => {
    if (!hackathonId) return;
    setBuildersLoading(true);
    api.get("/hackathon-interest/discover", {
      params: {
        hackathonId,
        limit: 12,
        skills: requiredSkills.join(","),
        roles: requiredRoles.join(","),
      },
    })
      .then((res) => {
        setRecommendedBuilders(res.data.builders || []);
        setSelectedBuilderIds([]);
      })
      .catch(() => setRecommendedBuilders([]))
      .finally(() => setBuildersLoading(false));
  }, [hackathonId, requiredSkills, requiredRoles]);

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

  const addRole = () => {
    const role = roleInput.trim();
    if (role && !requiredRoles.includes(role)) {
      setRequiredRoles([...requiredRoles, role]);
      setRoleInput("");
    }
  };

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
        requiredRoles,
        maxMembers: Number(maxMembers),
        status: "Open",
      };

      await api.post("/teams", payload);
      // Invitations preserve each builder's consent; accepted requests become
      // team members through the existing invitation workflow.
      await Promise.all(selectedBuilderIds.map((candidateId) =>
        api.post("/teams/invite", { hackathonId, candidateId }).catch(() => null)
      ));
      onSuccess();
      navigate(`/ai-recommendations/${hackathonId}`);
    } catch (err) {
      console.error("Error creating team:", err);
      setError(err.response?.data?.message || "Failed to create team. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ duration: 0.3 }}
        className="relative w-full max-w-lg max-h-[calc(100vh-2rem)] flex flex-col bg-[#0e1222]/90 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden shadow-2xl text-left"
      >
        {/* Glow Accents */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-[#FF8A00]/5 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="shrink-0 flex justify-between items-center p-6 pb-4 border-b border-white/5">
          <div>
            <h3 className="text-lg font-black text-white flex items-center gap-2">
              <span className="p-1 rounded bg-[#FF8A00]/10 text-[#FF8A00] text-xs">🚀</span>
              Create Hackathon Team
            </h3>
            <p className="text-[10px] text-gray-400 mt-0.5">
              Launch a recruiting team and let AI find perfect matching members.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition cursor-pointer"
          >
            <FaTimes />
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold">
            ⚠️ {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-6 py-4 space-y-4">
          {/* Team Name */}
          <div>
            <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">
              Team Name
            </label>
            <input
              type="text"
              required
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              placeholder="e.g. Cyber Guardians, Web3 Wizards"
              className="w-full px-4 py-2.5 rounded-xl bg-[#050816]/70 border border-white/5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#3B82F6] transition"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">
              Project / Team Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Explain what project idea you have or what domains you want to explore..."
              rows={3}
              className="w-full px-4 py-2.5 rounded-xl bg-[#050816]/70 border border-white/5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#3B82F6] transition resize-none"
            />
          </div>

          {/* Hackathon Selection */}
          <div>
            <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">
              Target Hackathon
            </label>
            <select
              value={hackathonId}
              onChange={(e) => setHackathonId(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-[#050816]/70 border border-white/5 text-xs text-white focus:outline-none focus:border-[#3B82F6] transition"
            >
              {hackathons.map((h) => (
                <option key={h._id || h.id} value={h._id || h.id} className="bg-[#0e1222] text-white">
                  {h.title}
                </option>
              ))}
            </select>
          </div>

          {/* Team Size Limit */}
          <div>
            <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">
              Max Roster Size ({maxMembers} builders)
            </label>
            <input
              type="range"
              min={2}
              max={6}
              value={maxMembers}
              onChange={(e) => setMaxMembers(Number(e.target.value))}
              className="w-full accent-[#3B82F6]"
            />
            <div className="flex justify-between text-[9px] text-gray-500 font-bold font-mono px-1">
              <span>2 members</span>
              <span>4 members</span>
              <span>6 members</span>
            </div>
          </div>

          {/* Skills Required Tags */}
          <div>
            <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">
              Required Roles
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={roleInput}
                onChange={(e) => setRoleInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addRole(); } }}
                placeholder="e.g. UI/UX Designer"
                className="flex-1 px-4 py-2.5 rounded-xl bg-[#050816]/70 border border-white/5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#3B82F6] transition"
              />
              <button type="button" onClick={addRole} className="px-4 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-bold transition">Add</button>
            </div>
            {requiredRoles.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2.5">
                {requiredRoles.map((role) => (
                  <button key={role} type="button" onClick={() => setRequiredRoles(requiredRoles.filter((item) => item !== role))} className="px-2.5 py-1 rounded-md text-[10px] bg-violet-500/10 text-violet-200 border border-violet-400/20">
                    {role} ×
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Skills Required Tags */}
          <div>
            <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">
              Required Technology Stack
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                placeholder="e.g. React, Solidity, Python..."
                className="flex-1 px-4 py-2.5 rounded-xl bg-[#050816]/70 border border-white/5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#3B82F6] transition"
              />
              <button
                type="button"
                onClick={addSkill}
                className="px-4 rounded-xl bg-[#3B82F6] hover:bg-blue-500 text-white text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer"
              >
                Add
              </button>
            </div>

            {/* Render Skill Tags */}
            {requiredSkills.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2.5 p-2 rounded-xl bg-[#050816]/30 border border-white/5">
                {requiredSkills.map((skill) => (
                  <span
                    key={skill}
                    className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[10px] bg-blue-500/10 text-cyan-300 border border-cyan-500/20 font-bold"
                  >
                    {skill}
                    <button
                      type="button"
                      onClick={() => removeSkill(skill)}
                      className="text-[9px] text-cyan-400 hover:text-red-400 ml-1 transition cursor-pointer"
                    >
                      ✕
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* AI-recommended interested builders */}
          <div className="border-t border-white/5 pt-4">
            <div className="flex items-start justify-between gap-3 mb-3">
              <div><h4 className="text-[11px] font-bold text-gray-300 uppercase tracking-wider">AI recommended members</h4><p className="text-[10px] text-gray-500 mt-1">Matches use this hackathon plus your required skills and roles. Requests are sent after launch.</p></div>
              <span className="text-[10px] font-bold text-cyan-300">{selectedBuilderIds.length} requests</span>
            </div>
            {buildersLoading ? <div className="h-16 rounded-xl bg-white/5 animate-pulse" /> : recommendedBuilders.length === 0 ? (
              <p className="rounded-xl border border-dashed border-white/10 p-3 text-[10px] text-gray-500">No other interested solo builders found for this hackathon yet.</p>
            ) : (
              <div className="max-h-56 overflow-y-auto space-y-2 pr-1">
                {recommendedBuilders.map((builder) => {
                  const selected = selectedBuilderIds.includes(builder.user._id);
                  return <div key={builder.interestId} className={`w-full p-3 rounded-xl border text-left transition flex items-center gap-3 ${selected ? "bg-cyan-500/10 border-cyan-400/35" : "bg-[#050816]/40 border-white/5"}`}>
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-600 to-blue-600 flex items-center justify-center text-xs font-black text-white">{builder.user.name?.[0] || "U"}</div>
                    <div className="min-w-0 flex-1"><p className="text-xs font-bold text-white truncate">{builder.user.name} <span className="text-cyan-300">• {builder.matchScore}% match</span></p><p className="text-[10px] text-gray-400 truncate">{builder.user.preferredRole || "Developer"} · {(builder.user.skills || []).slice(0, 2).join(", ")}</p></div>
                    <span className={`text-[9px] font-black ${(builder.user.trustScore || 0) >= 70 ? "text-emerald-300" : "text-amber-300"}`}>Trust {builder.user.trustScore ?? 50}</span>
                    <button type="button" onClick={() => setProfileBuilder(builder.user)} className="text-[10px] font-bold text-slate-300 hover:text-cyan-300">View</button>
                    <button type="button" onClick={() => setSelectedBuilderIds((current) => selected ? current.filter((id) => id !== builder.user._id) : [...current, builder.user._id])} className={`px-2.5 py-1.5 rounded-lg text-[10px] font-black ${selected ? "bg-cyan-500 text-white" : "bg-white/10 text-slate-200 hover:bg-white/15"}`}>{selected ? "Requested" : "Request"}</button>
                  </div>;
                })}
              </div>
            )}
          </div>

          {/* Team composition: creator is always included; selected builders
              remain invitations until they accept. */}
          <div className="border-t border-white/5 pt-4">
            <div className="flex items-center justify-between mb-3"><div><h4 className="text-[11px] font-bold text-gray-300 uppercase tracking-wider">Team members</h4><p className="text-[10px] text-gray-500 mt-1">Creator is already in the team. Requested matches join only after accepting.</p></div><span className="text-[10px] font-black text-cyan-300">1 + {selectedBuilderIds.length} requested</span></div>
            <div className="space-y-2">
              <div className="flex items-center gap-3 rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3"><div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-xs font-black text-white">{user?.name?.[0] || "Y"}</div><div className="flex-1"><p className="text-xs font-bold text-white">{user?.name || "You"}</p><p className="text-[10px] text-emerald-300">Team creator · already added</p></div><span className="text-[10px] font-black text-emerald-300">Trust {user?.trustScore ?? 50}</span></div>
              {recommendedBuilders.filter((builder) => selectedBuilderIds.includes(builder.user._id)).map((builder) => <div key={builder.user._id} className="flex items-center gap-3 rounded-xl border border-cyan-500/15 bg-cyan-500/5 p-3"><div className="w-8 h-8 rounded-lg bg-cyan-600 flex items-center justify-center text-xs font-black text-white">{builder.user.name?.[0] || "U"}</div><div className="flex-1"><p className="text-xs font-bold text-white">{builder.user.name}</p><p className="text-[10px] text-cyan-300">Request will be sent after launch</p></div><button type="button" onClick={() => setProfileBuilder(builder.user)} className="text-[10px] font-bold text-slate-300 hover:text-cyan-300">Profile</button><button type="button" onClick={() => setSelectedBuilderIds((current) => current.filter((id) => id !== builder.user._id))} className="text-[10px] font-bold text-rose-300">Remove</button></div>)}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-3 border-t border-white/5">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl text-xs font-bold bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition cursor-pointer text-center"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-[#FF8A00] to-[#FF8A00]/80 hover:from-amber-500 hover:to-[#FF8A00] text-white transition flex items-center justify-center gap-1 cursor-pointer"
            >
              {loading ? "Creating..." : "🚀 Launch Team"}
            </button>
          </div>
        </form>
      </motion.div>
      {profileBuilder && <DeveloperDetailsModal developer={profileBuilder} onClose={() => setProfileBuilder(null)} />}
    </div>
  );
}

export default CreateTeamModal;
