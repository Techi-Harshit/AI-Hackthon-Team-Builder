import { motion } from "framer-motion";
import HackathonCard from "./HackathonCard";

function HackathonsGrid({ hackathons = [], loading = false, error = "", setPage, hasMore = false, onInterestChange, onCreateTeam }) {
  if (loading && hackathons.length === 0) {
    return (
      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 animate-pulse text-left">
        {Array.from({ length: 6 }).map((_, idx) => (
          <div key={idx} className="relative overflow-hidden rounded-2xl bg-[#0e1222]/50 border border-white/5 p-5 flex flex-col min-h-[320px]">
            <div className="flex justify-between items-start mb-4">
              <div className="w-16 h-6 bg-white/5 rounded-full" />
              <div className="w-6 h-6 bg-white/5 rounded-full" />
            </div>
            <div className="flex items-start gap-3 mb-4">
              <div className="w-12 h-12 bg-white/5 rounded-xl shrink-0" />
              <div className="w-3/4 h-6 bg-white/5 rounded" />
            </div>
            <div className="w-1/2 h-4 bg-white/5 rounded mb-4" />
            <div className="space-y-2 mb-4">
              <div className="w-5/6 h-4 bg-white/5 rounded" />
              <div className="w-2/3 h-4 bg-white/5 rounded" />
            </div>
            <div className="w-full h-10 bg-white/5 rounded-xl mt-auto" />
          </div>
        ))}
      </div>
    );
  }

  if (error && hackathons.length === 0) {
    return (
      <div className="flex-1 text-center py-20 text-red-400 font-mono text-sm">
        {error}
      </div>
    );
  }

  if (hackathons.length === 0) {
    return (
      <div className="flex-1 text-center py-20 text-gray-500 font-medium border border-dashed border-white/5 rounded-2xl bg-[#0e1222]/10">
        No hackathons found matching the filter criteria.
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="flex-1 min-w-0"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {hackathons.map((hack, index) => (
          <HackathonCard key={hack._id || hack.id} hack={hack} index={index} onInterestChange={onInterestChange} onCreateTeam={onCreateTeam} />
        ))}
      </div>

      {hasMore && !loading && (
        <div className="flex justify-center mt-8">
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => setPage && setPage((p) => p + 1)}
            className="px-6 py-2.5 rounded-xl bg-[#0e1222] border border-cyan-500/35 hover:border-cyan-400 text-cyan-300 font-bold text-xs hover:bg-[#FF8A00]/10 transition"
          >
            Load More Events
          </motion.button>
        </div>
      )}
    </motion.div>
  );
}

export default HackathonsGrid;
