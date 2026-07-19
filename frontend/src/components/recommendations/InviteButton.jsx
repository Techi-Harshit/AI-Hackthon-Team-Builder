import React, { useState } from "react";
import { FaUserPlus, FaCheckCircle, FaSpinner } from "react-icons/fa";
import { inviteCandidate } from "../../services/recommendationService";

export default function InviteButton({ hackathonId, candidateId }) {
  const [loading, setLoading] = useState(false);
  const [invited, setInvited] = useState(false);

  const handleInvite = async () => {
    if (invited || loading) return;
    setLoading(true);
    try {
      await inviteCandidate(hackathonId, candidateId);
      setInvited(true);
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to send team invitation.");
    } finally {
      setLoading(false);
    }
  };

  if (invited) {
    return (
      <button
        disabled
        className="px-3 py-1.5 rounded-xl text-[10px] font-black flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 cursor-default"
      >
        <FaCheckCircle /> Invite Sent ✓
      </button>
    );
  }

  return (
    <button
      disabled={loading}
      onClick={handleInvite}
      className="px-3 py-1.5 rounded-xl text-[10px] font-black flex items-center gap-1.5 bg-[#F97316] hover:bg-orange-500 text-white cursor-pointer transition shrink-0"
    >
      {loading ? (
        <>
          <FaSpinner className="animate-spin" /> Sending...
        </>
      ) : (
        <>
          <FaUserPlus /> Invite to Team
        </>
      )}
    </button>
  );
}
