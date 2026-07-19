import { useRef } from "react";
import { motion } from "framer-motion";
import { FaChevronLeft, FaChevronRight, FaPaperPlane, FaUserCircle } from "react-icons/fa";

export default function InterestedBuildersSection({ builders = [], loading = false, onView, onInvite }) {
  const scrollRef = useRef(null);

  const scroll = (direction) => {
    scrollRef.current?.scrollBy({
      left: direction === "left" ? -360 : 360,
      behavior: "smooth",
    });
  };

  return (
    <section className="mb-10 rounded-3xl border border-white/5 bg-[#0e1222]/35 p-5 md:p-6 text-left">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between mb-5">
        <div>
          <h2 className="text-lg font-black text-white">Interested solo builders</h2>
          <p className="text-xs text-slate-400 mt-1">People who marked interest and are available for a hackathon team.</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-fit rounded-full bg-cyan-500/10 px-3 py-1 text-[10px] font-bold text-cyan-300 border border-cyan-500/20">AI-ranked matches</span>
          <button type="button" aria-label="Scroll interested builders left" onClick={() => scroll("left")} className="w-8 h-8 rounded-full border border-white/10 bg-[#050816]/70 text-slate-300 hover:text-white hover:border-cyan-400/40 transition flex items-center justify-center"><FaChevronLeft /></button>
          <button type="button" aria-label="Scroll interested builders right" onClick={() => scroll("right")} className="w-8 h-8 rounded-full border border-white/10 bg-[#050816]/70 text-slate-300 hover:text-white hover:border-cyan-400/40 transition flex items-center justify-center"><FaChevronRight /></button>
        </div>
      </div>
      <div ref={scrollRef} className="flex gap-4 overflow-x-auto scrollbar-hide pb-2 snap-x snap-mandatory">
        {loading ? Array.from({ length: 3 }).map((_, index) => <div key={index} className="h-52 min-w-[320px] md:min-w-[350px] rounded-2xl bg-white/5 animate-pulse shrink-0" />) : builders.map((builder) => {
          const person = builder.user;
          return (
            <motion.div key={builder.interestId} whileHover={{ y: -4 }} className="min-w-[320px] md:min-w-[350px] max-w-[350px] rounded-2xl border border-white/5 bg-[#050816]/55 p-4 flex flex-col shrink-0 snap-start">
              <div className="flex items-start justify-between gap-3">
                <div className="flex gap-3 min-w-0">
                  {person.avatar ? <img src={person.avatar} alt="" className="w-11 h-11 rounded-xl object-cover" /> : <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-cyan-600 to-blue-600 flex items-center justify-center text-white font-black">{person.name?.[0] || "U"}</div>}
                  <div className="min-w-0"><h3 className="font-black text-sm text-white truncate">{person.name}</h3><p className="text-[11px] text-cyan-300 font-bold">{person.preferredRole || "Developer"}</p></div>
                </div>
                <span className="text-[10px] font-black text-emerald-300 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-2 py-1">{builder.matchScore}% match</span>
              </div>
              <p className="mt-3 text-[11px] text-slate-400 line-clamp-2">Interested in <span className="text-slate-200 font-semibold">{builder.hackathon?.title}</span></p>
              <div className="mt-2 flex items-center justify-between text-[10px]"><span className="text-slate-500">Trust score</span><span className={`font-black ${(person.trustScore || 0) >= 70 ? "text-emerald-300" : "text-amber-300"}`}>{person.trustScore ?? 50}/100</span></div>
              <div className="mt-3 flex flex-wrap gap-1.5">{(person.skills || []).slice(0, 3).map((skill) => <span key={skill} className="px-2 py-1 rounded-md bg-white/5 border border-white/5 text-[9px] font-bold text-slate-300">{skill}</span>)}</div>
              <div className="mt-auto pt-4 flex gap-2">
                <button onClick={() => onView(builder)} className="flex-1 rounded-xl border border-white/10 py-2 text-[11px] font-bold text-slate-300 hover:text-white hover:border-cyan-400/35 transition flex justify-center items-center gap-1"><FaUserCircle /> Details</button>
                <button title="Choose a hackathon for this invitation" onClick={() => onInvite(builder)} className="flex-1 rounded-xl bg-cyan-600 hover:bg-cyan-500 py-2 text-[11px] font-bold text-white transition flex justify-center items-center gap-1"><FaPaperPlane /> Invite</button>
            </div>
          </motion.div>
          );
        })}
        {!loading && builders.length === 0 && <div className="w-full rounded-2xl border border-dashed border-white/10 p-6 text-center text-xs text-slate-400">Create a recruiting team for a hackathon to see AI-ranked interested solo builders here.</div>}
      </div>
    </section>
  );
}
