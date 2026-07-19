import { useEffect, useState } from "react";
import { FaCheck, FaHeart } from "react-icons/fa";
import { AnimatePresence, motion } from "framer-motion";
import { createPortal } from "react-dom";
import api from "../../api/axios";
import { useAuth } from "../../context/AuthContext";

export default function InterestButton({ hackathonId, hackathon, initialInterested = false, initialInterestId = null, onChange, onCreateTeam }) {
  const { user, fetchProfile } = useAuth();
  const [isInterested, setIsInterested] = useState(initialInterested);
  const [interestId, setInterestId] = useState(initialInterestId);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [showChoice, setShowChoice] = useState(false);

  useEffect(() => {
    setIsInterested(initialInterested);
    setInterestId(initialInterestId);
  }, [initialInterested, initialInterestId]);

  useEffect(() => {
    if (!user?._id || !hackathonId) return;
    let active = true;
    api.get(`/hackathon-interest/check/${hackathonId}`)
      .then(({ data }) => {
        if (!active) return;
        setIsInterested(data.isInterested);
        setInterestId(data.interest?._id || null);
      })
      .catch(() => {});
    return () => { active = false; };
  }, [user?._id, hackathonId]);

  const updateParent = (nextInterested, nextInterestId) => {
    onChange?.({ hackathonId, isInterested: nextInterested, interestId: nextInterestId });
  };

  const saveInterest = async () => {
    if (isInterested) return { interestId };
    const { data } = await api.post("/hackathon-interest", { hackathonId });
    const id = data.interest?._id || null;
    setIsInterested(true);
    setInterestId(id);
    updateParent(true, id);
    fetchProfile();
    return { interestId: id };
  };

  const handleClick = async (event) => {
    event.stopPropagation();
    if (!user?._id) return setMessage("Sign in to mark interest.");
    if (!isInterested) return setShowChoice(true);

    setLoading(true);
    setMessage("");
    try {
        const id = interestId;
        if (!id) throw new Error("Interest record is unavailable. Please refresh and try again.");
        await api.delete(`/hackathon-interest/${id}`);
        setIsInterested(false);
        setInterestId(null);
        setMessage("Interest removed.");
        updateParent(false, null);
        fetchProfile();
    } catch (error) {
      const responseMessage = error.response?.data?.message;
      setMessage(responseMessage || error.message || "Could not update interest.");
      if (error.response?.status === 409) {
        const { data } = await api.get(`/hackathon-interest/check/${hackathonId}`);
        setIsInterested(data.isInterested);
        setInterestId(data.interest?._id || null);
      }
    } finally {
      setLoading(false);
    }
  };

  const chooseOnlyInterest = async () => {
    setLoading(true);
    setMessage("");
    try {
      await saveInterest();
      setMessage("Saved for later. AI recommendations are ready when you are.");
      setShowChoice(false);
    } catch (error) {
      setMessage(error.response?.data?.message || "Could not save interest.");
    } finally {
      setLoading(false);
    }
  };

  const chooseCreateTeam = async () => {
    setLoading(true);
    setMessage("");
    try {
      await saveInterest();
      setShowChoice(false);
      onCreateTeam?.(hackathon);
    } catch (error) {
      setMessage(error.response?.data?.message || "Could not save interest.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <button
        type="button"
        disabled={loading}
        onClick={handleClick}
        className={`w-full px-4 py-2.5 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 ${
          loading ? "opacity-60 cursor-wait" : "cursor-pointer"
        } ${isInterested
          ? "bg-rose-500/15 text-rose-300 border border-rose-400/35 hover:bg-rose-500/25"
          : "bg-gradient-to-r from-cyan-600 to-blue-600 text-white hover:from-cyan-500 hover:to-blue-500"}`}
      >
        {loading ? <span className="h-3.5 w-3.5 rounded-full border-2 border-current border-t-transparent animate-spin" /> : isInterested ? <FaCheck /> : <FaHeart />}
        <span>{loading ? "Updating…" : isInterested ? "Interested" : "Mark As Interest"}</span>
      </button>
      {message && <p role="status" className="mt-1.5 text-center text-[10px] text-slate-400">{message}</p>}
      {createPortal(<AnimatePresence>
        {showChoice && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={() => !loading && setShowChoice(false)}>
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 18 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 18 }}
              onClick={(event) => event.stopPropagation()}
              className="w-full max-w-md rounded-3xl border border-cyan-400/20 bg-[#0b1022] p-6 shadow-2xl text-center"
            >
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-500/10 text-cyan-300"><FaHeart /></div>
              <h3 className="text-xl font-black text-white">You’re interested!</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-400"><span className="font-bold text-white">{hackathon?.title || "This hackathon"}</span> is saved to your journey. What would you like to do next?</p>
              <div className="mt-6 space-y-3 text-left">
                <button type="button" disabled={loading} onClick={chooseCreateTeam} className="w-full rounded-2xl bg-gradient-to-r from-cyan-600 to-blue-600 p-4 text-left shadow-lg shadow-cyan-950/30 hover:from-cyan-500 hover:to-blue-500 transition disabled:opacity-50">
                  <span className="block text-sm font-black text-white">Create a team</span>
                  <span className="mt-1 block text-[11px] leading-relaxed text-cyan-100/75">Set roles and skills, then get AI-recommended members.</span>
                </button>
                <div className="flex items-center gap-3 py-0.5 text-[10px] font-bold uppercase tracking-widest text-slate-500"><span className="h-px flex-1 bg-white/10" />or<span className="h-px flex-1 bg-white/10" /></div>
                <button type="button" disabled={loading} onClick={chooseOnlyInterest} className="w-full rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-left hover:bg-white/[0.08] transition disabled:opacity-50">
                  <span className="block text-sm font-black text-white">Only mark as interest</span>
                  <span className="mt-1 block text-[11px] leading-relaxed text-slate-400">Keep it saved and explore recommendations whenever you’re ready.</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>, document.body)}
    </div>
  );
}
