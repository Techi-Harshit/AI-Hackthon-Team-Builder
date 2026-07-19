import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaTrophy, FaLightbulb, FaShieldAlt, FaPlus, FaUsers, FaCheckCircle, FaExclamationTriangle, FaCircleNotch, FaUserPlus, FaCheck } from "react-icons/fa";
import api from "../../api/axios";

// Circular dial helper for analytics
function CircularProgressDial({ percentage, color, label, subtext, size = 110, strokeWidth = 8 }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
        {/* Glow */}
        <div 
          className="absolute inset-2 rounded-full blur-lg opacity-25" 
          style={{ backgroundColor: color }}
        />
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="rgba(255, 255, 255, 0.03)"
            strokeWidth={strokeWidth}
          />
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
            transition={{ duration: 1.5, ease: "easeOut" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-xl font-black text-white">{percentage}%</span>
          <span className="text-[8px] text-gray-500 font-bold uppercase tracking-wider mt-0.5">{subtext}</span>
        </div>
      </div>
      <div className="text-center">
        <span className="text-xs font-bold text-gray-200 block">{label}</span>
      </div>
    </div>
  );
}

export default function TeamAICopilot({ team }) {
  const [hackathon, setHackathon] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [aiInsights, setAiInsights] = useState(null);
  const [loading, setLoading] = useState(true);
  const [invitedIds, setInvitedIds] = useState(new Set());
  const [inviteLoading, setInviteLoading] = useState(null);

  // Load Hackathon and suggested members matching the skills gap
  useEffect(() => {
    async function loadCopilotData() {
      if (!team) return;
      setLoading(true);
      try {
        const hackId = team.hackathonId || team.hackathon;
        const [hackRes, recRes, aiRes] = await Promise.all([
          api.get(`/hackathons/${hackId}`),
          api.get(`/recommendations/${hackId}`).catch(() => ({ data: { recommendations: [] } })),
          api.get(`/ai/matchmaking/${hackId}`).catch(() => null)
        ]);
        setHackathon(hackRes.data);
        setRecommendations(recRes.data?.recommendations || []);
        if (aiRes && aiRes.data) {
          setAiInsights(aiRes.data);
        }
      } catch (err) {
        console.error("Error loading AI Copilot details:", err);
      } finally {
        setLoading(false);
      }
    }
    loadCopilotData();
  }, [team]);

  if (loading) {
    return (
      <div className="p-16 text-center rounded-3xl bg-[#0e1222]/20 border border-white/5 flex flex-col items-center justify-center gap-4">
        <FaCircleNotch className="text-purple-500 text-3xl animate-spin" />
        <p className="text-slate-400 text-xs font-bold font-mono uppercase tracking-widest">
          AI Co-Pilot is analyzing team synergy...
        </p>
      </div>
    );
  }

  // Fallbacks
  const requiredSkills = hackathon?.requiredSkills?.length 
    ? hackathon.requiredSkills 
    : ["React", "Node.js", "Python", "ML", "UI/UX", "Docker"];
  
  const teamMembers = team?.members || [];
  const leaderSkills = team?.leader?.skills || ["React", "Node.js"];
  
  // Combine all team skills
  const combinedTeamSkills = new Set([...leaderSkills]);
  teamMembers.forEach(m => {
    if (m.skills) {
      m.skills.forEach(s => combinedTeamSkills.add(s));
    }
  });

  // Calculate Match & Gaps
  const matchedSkills = requiredSkills.filter(s => 
    Array.from(combinedTeamSkills).some(ts => ts.toLowerCase() === s.toLowerCase())
  );
  const missingSkills = requiredSkills.filter(s => !matchedSkills.includes(s));

  // Dynamic metrics
  const remaining = team.remainingSlots !== undefined ? team.remainingSlots : (team.maxMembers - teamMembers.length - 1);
  const total = team.maxMembers || 4;
  const rosterCount = teamMembers.length + 1;

  // Resolve values from OpenAI telemetry or local formulas
  const readiness = aiInsights?.readiness?.readinessScore !== undefined 
    ? aiInsights.readiness.readinessScore 
    : Math.round((rosterCount / total) * 60 + (matchedSkills.length / requiredSkills.length) * 40);

  const winProbability = aiInsights?.readiness?.winningProbability !== undefined 
    ? aiInsights.readiness.winningProbability 
    : Math.min(95, Math.max(40, Math.round(readiness * 0.8 + 15)));

  const successPrediction = aiInsights?.readiness?.teamSuccessPrediction || (
    missingSkills.length === 0
      ? "Your team structure has a solid core stack. With all skill gaps closed, the squad is perfectly optimized for full-cycle development and prototype delivery."
      : missingSkills.length > 2
      ? `Critical skill gaps identified in [${missingSkills.slice(0, 2).join(", ")}]. Adding members with these skills will dramatically improve project completion speed.`
      : `Minor gaps exist in [${missingSkills.join(", ")}]. Inviting specialized developers will secure optimal prototype deployment capabilities.`
  );

  // Filter recommendations to find suggested members filling the skill gaps
  const suggestedMembers = aiInsights?.recommendedMembers && aiInsights.recommendedMembers.length > 0
    ? aiInsights.recommendedMembers.slice(0, 3)
    : recommendations.filter(rec => 
        rec.skills && rec.skills.some(s => missingSkills.some(ms => ms.toLowerCase() === s.toLowerCase()))
      ).slice(0, 3);

  // Project Recommendations
  const projectRecommendations = aiInsights?.projectRecommendations && aiInsights.projectRecommendations.length > 0
    ? aiInsights.projectRecommendations
    : [
        {
          title: "Smart Sync Workspace",
          whyThisFits: `Collaborative developer dashboard built around ${Array.from(combinedTeamSkills).slice(0, 3).join(", ")}, optimizing workflow tracking.`,
          techStack: Array.from(combinedTeamSkills).slice(0, 3),
          roadmap: ["Validate core sprint needs", "Build real-time board", "Add AI summaries"],
          pitchAngle: "Empowers remote teams with single-source sprint visibility."
        },
        {
          title: "Automated Tech Auditor",
          whyThisFits: `Audit log parsing system using ML pipelines to detect development bottleneck and security compliance flags.`,
          techStack: ["Python", "Flask", "Docker"],
          roadmap: ["Parse audit logs", "Detect anomaly patterns", "Trigger compliance warnings"],
          pitchAngle: "Guarantees secure system integrations for scale."
        }
      ];

  const handleInvite = async (candidateId) => {
    setInviteLoading(candidateId);
    try {
      const hackId = team.hackathonId || team.hackathon;
      await api.post("/teams/invite", { hackathonId: hackId, candidateId });
      setInvitedIds(prev => new Set([...prev, candidateId]));
    } catch (err) {
      console.error(err);
      alert("Failed to send invitation.");
    } finally {
      setInviteLoading(null);
    }
  };

  return (
    <div className="space-y-8">
      {/* 1. Readiness & Probability dials */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center rounded-3xl border border-white/5 bg-[#0e1222]/20 backdrop-blur-xl p-8 text-left relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex justify-around md:col-span-2 border-b md:border-b-0 md:border-r border-white/5 pb-6 md:pb-0 md:pr-6">
          <CircularProgressDial 
            percentage={readiness} 
            color="#a855f7" 
            label="Hackathon Readiness" 
            subtext="Stack Score" 
          />
          <CircularProgressDial 
            percentage={winProbability} 
            color="#22c55e" 
            label="Winning Probability" 
            subtext="Win Rating" 
          />
        </div>

        <div className="space-y-2.5">
          <div className="flex items-center gap-2 text-xs font-bold text-purple-400 uppercase tracking-wider">
            <FaTrophy className="text-xs" />
            <span>Success Prediction</span>
          </div>
          <p className="text-xs font-medium text-gray-300 leading-relaxed">
            {successPrediction}
          </p>
          <div className="text-[10px] text-gray-500 font-semibold mt-2">
            Remaining slots: {remaining} out of {total} total
          </div>
        </div>
      </div>

      {/* 2. Skill Gap Detection */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="p-6 rounded-3xl border border-white/5 bg-[#0e1222]/20 backdrop-blur-xl text-left">
          <h3 className="text-sm font-extrabold text-white mb-4 flex items-center gap-2">
            <FaCheckCircle className="text-emerald-400" />
            Skills Covered ({matchedSkills.length})
          </h3>
          <div className="flex flex-wrap gap-2">
            {matchedSkills.map((skill, idx) => (
              <span 
                key={idx}
                className="px-2.5 py-1 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase tracking-wider"
              >
                {skill}
              </span>
            ))}
            {matchedSkills.length === 0 && (
              <span className="text-xs text-gray-500 italic">No required skills covered yet.</span>
            )}
          </div>
        </div>

        <div className="p-6 rounded-3xl border border-white/5 bg-[#0e1222]/20 backdrop-blur-xl text-left">
          <h3 className="text-sm font-extrabold text-white mb-4 flex items-center gap-2">
            <FaExclamationTriangle className="text-amber-400 animate-pulse" />
            Skill Gap Detected ({missingSkills.length})
          </h3>
          <div className="flex flex-wrap gap-2">
            {missingSkills.map((skill, idx) => (
              <span 
                key={idx}
                className="px-2.5 py-1 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[10px] font-black uppercase tracking-wider"
              >
                {skill}
              </span>
            ))}
            {missingSkills.length === 0 && (
              <span className="text-xs text-emerald-400 font-bold">✓ Fully covered! No skill gaps found.</span>
            )}
          </div>
        </div>
      </div>

      {/* 3. Suggested Members */}
      <div className="rounded-3xl border border-white/5 bg-[#0e1222]/20 backdrop-blur-xl p-6 text-left">
        <h3 className="text-base font-extrabold text-white mb-4 flex items-center gap-2">
          <FaUsers className="text-cyan-400" />
          Suggested Members to Close Gaps
        </h3>
        
        {suggestedMembers.length === 0 ? (
          <div className="p-8 text-center text-xs text-gray-500 border border-dashed border-white/5 rounded-2xl">
            No suggestions found matching the missing skill set. Search manually in Recommendations.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {suggestedMembers.map((rec) => {
              const hasInvited = invitedIds.has(rec.id);
              return (
                <div 
                  key={rec.id} 
                  className="p-4 rounded-2xl bg-[#030712]/30 border border-white/5 hover:border-white/10 transition flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center gap-2.5 mb-3">
                      <img 
                        src={rec.avatar || "https://api.dicebear.com/7.x/bottts/svg?seed=Teammate"} 
                        className="w-8 h-8 rounded-lg object-cover bg-black"
                        alt=""
                      />
                      <div>
                        <h4 className="font-bold text-xs text-white leading-none">{rec.name}</h4>
                        <span className="text-[8px] text-cyan-400 font-bold uppercase tracking-wider block mt-1">
                          {rec.preferredRole}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1 mb-4">
                      {rec.skills.slice(0, 3).map((s, i) => (
                        <span key={i} className="px-1.5 py-0.5 rounded bg-white/5 text-gray-400 text-[8px] font-bold">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={() => handleInvite(rec.id)}
                    disabled={hasInvited || inviteLoading === rec.id}
                    className={`w-full py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      hasInvited
                        ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 cursor-default"
                        : "bg-cyan-600 hover:bg-cyan-500 text-white shadow-md shadow-cyan-600/10"
                    }`}
                  >
                    {inviteLoading === rec.id ? (
                      <FaCircleNotch className="animate-spin text-xs" />
                    ) : hasInvited ? (
                      <>
                        <FaCheck className="text-2xs" />
                        <span>Invited</span>
                      </>
                    ) : (
                      <>
                        <FaUserPlus className="text-2xs" />
                        <span>Invite Teammate</span>
                      </>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 4. AI Project Recommendations */}
      <div className="rounded-3xl border border-white/5 bg-[#0e1222]/20 backdrop-blur-xl p-6 text-left">
        <h3 className="text-base font-extrabold text-white mb-4 flex items-center gap-2">
          <FaLightbulb className="text-amber-400" />
          AI Project Recommendations (Based on Team Skills)
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {projectRecommendations.map((project, idx) => (
            <div 
              key={idx} 
              className="p-5 rounded-2xl bg-[#030712]/30 border border-white/5 hover:border-purple-500/20 transition flex flex-col justify-between gap-4"
            >
              <div className="space-y-3">
                <div className="flex justify-between items-start">
                  <h4 className="font-extrabold text-sm text-white tracking-wide">{project.title}</h4>
                  {project.fitScore && (
                    <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[8px] font-black uppercase tracking-wider">
                      {project.fitScore}% Fit
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-gray-400 leading-relaxed">{project.whyThisFits || project.desc}</p>
                
                {project.techStack && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {project.techStack.map((tech) => (
                      <span key={tech} className="px-1.5 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/15 text-cyan-300 text-[8px] font-black font-mono">
                        {tech}
                      </span>
                    ))}
                  </div>
                )}

                {project.roadmap && (
                  <div className="mt-2 space-y-1">
                    {project.roadmap.map((step, sIdx) => (
                      <p key={sIdx} className="text-[10px] text-slate-400">
                        <span className="text-cyan-400 font-bold">{sIdx + 1}.</span> {step}
                      </p>
                    ))}
                  </div>
                )}

                {project.pitchAngle && (
                  <p className="mt-2 text-[10px] text-amber-300 bg-amber-500/5 border border-amber-500/10 rounded-lg p-2.5">
                    💡 Pitch Angle: {project.pitchAngle}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
