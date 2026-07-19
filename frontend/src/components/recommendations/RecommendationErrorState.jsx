import React from "react";
import { useNavigate } from "react-router-dom";
import { FaRegTimesCircle, FaSyncAlt, FaExclamationTriangle, FaUsers, FaArrowLeft } from "react-icons/fa";

export default function RecommendationErrorState({ error, errorCode, onRetry }) {
  const navigate = useNavigate();

  let title = "Error Encountered";
  let message = error || "Failed to load teammate recommendations. Please try again later.";
  let icon = <FaRegTimesCircle className="text-red-500 text-4xl" />;

  // 1. TEAM_NOT_FOUND
  if (errorCode === "TEAM_NOT_FOUND") {
    return (
      <div className="p-16 text-center rounded-3xl bg-[#0e1222]/20 border border-white/5 flex flex-col items-center justify-center gap-5 max-w-2xl mx-auto shadow-xl">
        <FaExclamationTriangle className="text-amber-500 text-4xl animate-pulse" />
        <h3 className="text-base font-black text-white">Team Required</h3>
        <p className="text-xs text-gray-400 max-w-sm mx-auto">
          You must create or join a team for this hackathon before finding teammates.
        </p>
        <div className="flex gap-3 justify-center mt-2">
          <button
            onClick={() => navigate("/my-team")}
            className="px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-md"
          >
            Create Team First
          </button>
          <button
            onClick={() => navigate("/hackathons")}
            className="px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 text-xs font-bold transition cursor-pointer"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  // 1b. NOT_TEAM_LEADER
  if (errorCode === "NOT_TEAM_LEADER") {
    return (
      <div className="p-16 text-center rounded-3xl bg-[#0e1222]/20 border border-white/5 flex flex-col items-center justify-center gap-5 max-w-2xl mx-auto shadow-xl">
        <FaRegTimesCircle className="text-red-500 text-4xl" />
        <h3 className="text-base font-black text-white">Access Denied</h3>
        <p className="text-xs text-gray-400 max-w-sm mx-auto">
          Only the team leader can access AI Recommendations.
        </p>
        <button
          onClick={() => navigate("/my-team")}
          className="px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-md mt-2"
        >
          <FaUsers /> Go To My Team
        </button>
      </div>
    );
  }

  // 1c. TEAM_NOT_RECRUITING
  if (errorCode === "TEAM_NOT_RECRUITING") {
    return (
      <div className="p-16 text-center rounded-3xl bg-[#0e1222]/20 border border-white/5 flex flex-col items-center justify-center gap-5 max-w-2xl mx-auto shadow-xl">
        <FaExclamationTriangle className="text-orange-500 text-4xl" />
        <h3 className="text-base font-black text-white">Not Recruiting</h3>
        <p className="text-xs text-gray-400 max-w-sm mx-auto">
          This team is not currently recruiting new members.
        </p>
        <button
          onClick={() => navigate("/my-team")}
          className="px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-md mt-2"
        >
          <FaUsers /> Go To My Team
        </button>
      </div>
    );
  }

  // 1d. TEAM_FULL
  if (errorCode === "TEAM_FULL") {
    return (
      <div className="p-16 text-center rounded-3xl bg-[#0e1222]/20 border border-white/5 flex flex-col items-center justify-center gap-5 max-w-2xl mx-auto shadow-xl">
        <FaExclamationTriangle className="text-emerald-500 text-4xl" />
        <h3 className="text-base font-black text-white">Team Full</h3>
        <p className="text-xs text-gray-400 max-w-sm mx-auto">
          This team is already full. No open slots remaining.
        </p>
        <button
          onClick={() => navigate("/my-team")}
          className="px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-md mt-2"
        >
          <FaUsers /> Go To My Team
        </button>
      </div>
    );
  }

  // 2. USER_NOT_REGISTERED
  if (errorCode === "USER_NOT_REGISTERED") {
    return (
      <div className="p-16 text-center rounded-3xl bg-[#0e1222]/20 border border-white/5 flex flex-col items-center justify-center gap-5 max-w-2xl mx-auto shadow-xl">
        <FaRegTimesCircle className="text-red-500 text-4xl" />
        <h3 className="text-base font-black text-white">Registration Required</h3>
        <p className="text-xs text-gray-400 max-w-sm mx-auto">
          You must register for this hackathon before using AI Recommendations.
        </p>
        <div className="flex gap-3 justify-center mt-2">
          <button
            onClick={() => navigate("/hackathons")}
            className="px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-md"
          >
            <FaArrowLeft /> Go To Hackathons
          </button>
          <button
            onClick={() => navigate("/hackathons")}
            className="px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 text-xs font-bold transition cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  // 3. HACKATHON_NOT_FOUND
  if (errorCode === "HACKATHON_NOT_FOUND") {
    return (
      <div className="p-16 text-center rounded-3xl bg-[#0e1222]/20 border border-white/5 flex flex-col items-center justify-center gap-5 max-w-2xl mx-auto shadow-xl">
        <FaExclamationTriangle className="text-orange-500 text-4xl" />
        <h3 className="text-base font-black text-white">Hackathon Not Found</h3>
        <p className="text-xs text-gray-400 max-w-sm mx-auto">
          The requested hackathon could not be found. Try selecting another hackathon.
        </p>
        <button
          onClick={() => navigate("/hackathons")}
          className="px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-md mt-2"
        >
          <FaArrowLeft /> Back To Hackathons
        </button>
      </div>
    );
  }

  // 4. UNAUTHORIZED
  if (errorCode === "UNAUTHORIZED") {
    title = "Session Expired";
    message = "You are not authorized to view this page. Please log in again.";
  }

  // 5. SERVER / NETWORK ERROR
  return (
    <div className="p-16 text-center rounded-3xl bg-[#0e1222]/20 border border-white/5 flex flex-col items-center justify-center gap-4 max-w-2xl mx-auto shadow-xl">
      {icon}
      <h3 className="text-base font-black text-white">{title}</h3>
      <p className="text-xs text-gray-400 max-w-sm mx-auto">{message}</p>
      
      {onRetry && errorCode !== "UNAUTHORIZED" && (
        <button
          onClick={onRetry}
          className="px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold transition flex items-center gap-2 cursor-pointer shadow-md mt-2"
        >
          <FaSyncAlt /> Retry
        </button>
      )}
    </div>
  );
}
