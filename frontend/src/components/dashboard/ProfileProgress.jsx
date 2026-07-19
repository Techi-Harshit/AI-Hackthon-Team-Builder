import { useState, useEffect } from "react";
import { motion as motionFramer } from "framer-motion";
import {
  FaGithub,
  FaLinkedin,
  FaArrowRight,
  FaCheckCircle,
  FaBrain,
  FaExclamationTriangle,
} from "react-icons/fa";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

function ProfileProgress() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Dynamic conditions
  const isBasicInfoAdded = !!(user?.name && user?.bio);
  const isSkillsAdded = !!(user?.skills && user?.skills.length > 0);
  const isGithubConnected = !!(user?.github && user?.github.trim() !== "");

  // Calculate dynamic progress
  let progress = 20; // base score for registering
  if (isBasicInfoAdded) progress += 20;
  if (user?.college) progress += 20;
  if (isSkillsAdded) progress += 20;
  if (isGithubConnected) progress += 10;
  if (user?.linkedin) progress += 10;

  const stats = [
    { value: user?.skills?.length || 0, label: "Skills" },
    { value: user?.totalHackathons || 0, label: "Projects" },
    { value: `${user?.trustScore || 50}%`, label: "Match Score" },
    { value: "8", label: "Applications" },
  ];

  return (
    <motionFramer.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.7 }}
      className="
      relative
      overflow-hidden
      mt-8
      rounded-3xl
      border
      border-white/5
      bg-gradient-to-r
      from-purple-950/40
      via-slate-950
      to-blue-950/40
      backdrop-blur-xl
      "
    >
      {/* Background Glow */}
      <div className="absolute -top-20 left-10 w-72 h-72 bg-[#3B82F6]/10 rounded-full blur-3xl" />
      <div className="absolute -bottom-20 right-10 w-72 h-72 bg-blue-600/10 rounded-full blur-3xl" />

      {/* Shine Effect */}
      <motionFramer.div
        animate={{
          x: ["-100%", "300%"],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "linear",
        }}
        className="
        absolute
        inset-y-0
        w-24
        bg-gradient-to-r
        from-transparent
        via-white/5
        to-transparent
        "
      />

      <div className="relative z-10 p-8">
        <div className="grid lg:grid-cols-[180px_1fr_260px] gap-8 items-center">

          {/* Progress Circle */}
          <div className="flex justify-center">
            <div className="relative">
              <svg
                className="w-40 h-40 -rotate-90"
                viewBox="0 0 120 120"
              >
                <circle
                  cx="60"
                  cy="60"
                  r="52"
                  stroke="#1e293b"
                  strokeWidth="10"
                  fill="transparent"
                />

                <motionFramer.circle
                  cx="60"
                  cy="60"
                  r="52"
                  stroke="#a855f7"
                  strokeWidth="10"
                  fill="transparent"
                  strokeLinecap="round"
                  strokeDasharray={327}
                  initial={{ strokeDashoffset: 327 }}
                  whileInView={{
                    strokeDashoffset:
                      327 - (327 * progress) / 100,
                  }}
                  viewport={{ once: true }}
                  transition={{ duration: 2 }}
                />
              </svg>

              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-4xl font-bold">
                  {progress}%
                </span>

                <span className="text-sm text-slate-400">
                  Complete
                </span>
              </div>
            </div>
          </div>

          {/* Center Content */}
          <div>
            <h2 className="text-4xl font-bold">
              Complete Your Profile
            </h2>

            <p className="text-slate-400 mt-3 text-lg">
              Increase visibility and unlock better AI team matches.
            </p>

            {/* AI Insight */}
            <div
              className="
              mt-4
              inline-flex
              items-center
              gap-2
              px-4
              py-2
              rounded-full
              bg-[#FF8A00]/10
              border
              border-white/5
              text-cyan-300
              text-sm
              "
            >
              <FaBrain />
              {isGithubConnected 
                ? "AI verifies your dynamic profile score is on track!" 
                : "AI suggests adding GitHub to increase matches by 18%"}
            </div>

            {/* Progress Bar */}
            <div className="mt-6">
              <div className="flex justify-between mb-2 text-sm">
                <span>Profile Completion</span>
                <span>{progress}%</span>
              </div>

              <div className="h-3 rounded-full bg-[#0e1222] overflow-hidden">
                <motionFramer.div
                  initial={{ width: 0 }}
                  whileInView={{ width: `${progress}%` }}
                  viewport={{ once: true }}
                  transition={{ duration: 1.5 }}
                  className="
                  h-full
                  bg-gradient-to-r
                  from-purple-500
                  to-blue-500
                  "
                />
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6">
              {stats.map((item, index) => (
                <motionFramer.div
                  key={index}
                  whileHover={{
                    y: -4,
                    scale: 1.03,
                  }}
                  className="
                  rounded-2xl
                  bg-[#0e1222]/70
                  border
                  border-white/5
                  p-4
                  text-center
                  "
                >
                  <h3 className="text-2xl font-bold text-cyan-300">
                    {item.value}
                  </h3>

                  <p className="text-xs text-slate-400 mt-1">
                    {item.label}
                  </p>
                </motionFramer.div>
              ))}
            </div>
          </div>

          {/* Right Section */}
          <div>
            <div className="space-y-3">

              {/* Basic Info Check */}
              <div className={`flex items-center justify-between p-3 rounded-xl bg-[#0e1222]/60 border ${isBasicInfoAdded ? "border-white/5" : "border-yellow-500/20"}`}>
                <div className="flex items-center gap-3">
                  {isBasicInfoAdded ? (
                    <FaCheckCircle className="text-green-500" />
                  ) : (
                    <FaExclamationTriangle className="text-yellow-400" />
                  )}
                  <span>Basic Info</span>
                </div>
                {!isBasicInfoAdded && <span className="text-yellow-400 text-sm">Pending</span>}
              </div>

              {/* Skills Check */}
              <div className={`flex items-center justify-between p-3 rounded-xl bg-[#0e1222]/60 border ${isSkillsAdded ? "border-white/5" : "border-yellow-500/20"}`}>
                <div className="flex items-center gap-3">
                  {isSkillsAdded ? (
                    <FaCheckCircle className="text-green-500" />
                  ) : (
                    <FaExclamationTriangle className="text-yellow-400" />
                  )}
                  <span>Skills Added</span>
                </div>
                {!isSkillsAdded && <span className="text-yellow-400 text-sm">Pending</span>}
              </div>

              {/* GitHub Check */}
              <div className={`flex items-center justify-between p-3 rounded-xl bg-[#0e1222]/60 border ${isGithubConnected ? "border-white/5" : "border-yellow-500/20"}`}>
                <div className="flex items-center gap-3">
                  {isGithubConnected ? (
                    <FaCheckCircle className="text-green-500" />
                  ) : (
                    <FaExclamationTriangle className="text-yellow-400" />
                  )}
                  <span>GitHub Profile</span>
                </div>
                {!isGithubConnected && <span className="text-yellow-400 text-sm">Pending</span>}
              </div>
            </div>

            {/* Social */}
            <div className="flex gap-3 mt-5">
              <a 
                href={user?.github || "/settings"} 
                target={user?.github ? "_blank" : "_self"}
                rel="noreferrer"
                className="p-3 rounded-xl bg-[#0e1222] border border-white/5 hover:border-purple-500 transition text-white"
              >
                <FaGithub />
              </a>

              <a 
                href={user?.linkedin || "/settings"} 
                target={user?.linkedin ? "_blank" : "_self"}
                rel="noreferrer"
                className="p-3 rounded-xl bg-[#0e1222] border border-white/5 hover:border-blue-500 transition text-white"
              >
                <FaLinkedin />
              </a>
            </div>

            {/* Buttons */}
            <div className="space-y-3 mt-5">
              <motionFramer.button
                whileHover={{
                  scale: 1.03,
                  boxShadow:
                    "0px 0px 25px rgba(168,85,247,0.4)",
                }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate("/settings")}
                className="
                w-full
                py-3
                rounded-xl
                bg-gradient-to-r
                from-purple-500
                to-blue-500
                font-semibold
                flex
                items-center
                justify-center
                gap-2
                "
              >
                Complete Profile
                <FaArrowRight />
              </motionFramer.button>

              <button
                onClick={() => navigate("/recommendations")}
                className="
                w-full
                py-3
                rounded-xl
                border
                border-white/10
                hover:border-purple-500
                transition
                "
              >
                View Recommendations
              </button>
            </div>
          </div>

        </div>
      </div>
    </motionFramer.div>
  );
}

export default ProfileProgress;