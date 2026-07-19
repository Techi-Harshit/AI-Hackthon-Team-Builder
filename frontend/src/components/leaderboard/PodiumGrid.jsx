import { motion } from "framer-motion";
import { FaTrophy, FaUsers, FaStar } from "react-icons/fa";

function PodiumCard({ team }) {
  if (!team) return null;
  const isFirst = team.rank === 1;

  // Set default avatars/colors if missing
  const avatar = team.avatar || (team.logo || (team.rank === 1 ? "🏆" : team.rank === 2 ? "🥈" : "🥉"));
  const avatarBg = team.avatarBg || (team.rank === 1 ? "from-yellow-600 to-amber-600" : team.rank === 2 ? "from-slate-600 to-zinc-600" : "from-amber-700 to-orange-700");

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ type: "spring", stiffness: 100, damping: 15, delay: team.rank * 0.08 }}
      whileHover={{ y: -6, borderColor: isFirst ? "rgba(168, 85, 247, 0.55)" : "rgba(168, 85, 247, 0.35)" }}
      className={`relative overflow-hidden rounded-3xl border border-white/5 bg-[#050816]/50 backdrop-blur-xl p-6 flex flex-col items-center justify-between cursor-pointer group transition-all duration-300 hover:shadow-[0_10px_30px_rgba(168,85,247,0.12)] ${
        isFirst ? "h-[330px] border-purple-500/25 md:-translate-y-4" : "h-[290px]"
      }`}
    >
      {/* Shiny diagonal reflection sweep */}
      <div
        className="absolute inset-0 w-[200%] bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-1/2 transition-transform duration-1000 ease-out pointer-events-none"
        style={{ transform: "skewX(-25deg)" }}
      />

      {/* Rank circle badge */}
      <div className={`absolute top-4 left-4 w-7 h-7 rounded-full border flex items-center justify-center text-xs font-black font-mono shadow-md ${
        team.rank === 1 ? "bg-amber-500 text-slate-950 border-amber-300" :
        team.rank === 2 ? "bg-slate-400 text-slate-950 border-slate-300" :
        "bg-amber-700 text-slate-950 border-amber-600"
      }`}>
        {team.rank}
      </div>

      {/* Avatar */}
      <div className="relative mt-2">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          className={`absolute -inset-1 rounded-2xl bg-gradient-to-r ${
            isFirst ? "from-purple-500 via-pink-500 to-blue-500" : "from-purple-500/40 to-blue-500/40"
          } blur-xs opacity-50`}
        />
        <div className={`relative w-16 h-16 rounded-2xl bg-gradient-to-br ${avatarBg} flex items-center justify-center text-3xl border border-white/10/35 shadow-inner`}>
          {avatar}
        </div>
      </div>

      {/* Info details */}
      <div className="text-center w-full mt-4">
        <h4 className="font-extrabold text-white text-base truncate group-hover:text-cyan-300 transition-colors">
          {team.name}
        </h4>
        <span className="inline-block mt-2 px-3 py-1 rounded-lg text-2xs font-extrabold uppercase font-mono bg-[#FF8A00]/10 text-cyan-300 border border-white/5">
          {team.xp} XP
        </span>
      </div>

      {/* Metrics Row */}
      <div className="flex items-center justify-around w-full border-t border-white/5 pt-4 mt-4 text-3xs font-semibold text-gray-400">
        <div className="flex flex-col items-center gap-1">
          <FaTrophy className="text-amber-400 text-2xs" />
          <span>{team.wins} Wins</span>
        </div>
        <div className="border-l border-white/5 h-6" />
        <div className="flex flex-col items-center gap-1">
          <FaUsers className="text-[#3B82F6] text-2xs" />
          <span>{team.membersCount || 1} Mem.</span>
        </div>
        <div className="border-l border-white/5 h-6" />
        <div className="flex flex-col items-center gap-1">
          <FaStar className="text-amber-400 text-2xs" />
          <span>{team.rating} Rat.</span>
        </div>
      </div>
    </motion.div>
  );
}

function PodiumGrid({ topThree }) {
  if (!topThree) return null;

  const t1 = topThree.rank1 ? { rank: 1, name: topThree.rank1.name, xp: topThree.rank1.totalXP, wins: topThree.rank1.wins, membersCount: topThree.rank1.members?.length || 1, rating: topThree.rank1.rating, avatar: topThree.rank1.avatar || "🏆" } : null;
  const t2 = topThree.rank2 ? { rank: 2, name: topThree.rank2.name, xp: topThree.rank2.totalXP, wins: topThree.rank2.wins, membersCount: topThree.rank2.members?.length || 1, rating: topThree.rank2.rating, avatar: topThree.rank2.avatar || "🥈" } : null;
  const t3 = topThree.rank3 ? { rank: 3, name: topThree.rank3.name, xp: topThree.rank3.totalXP, wins: topThree.rank3.wins, membersCount: topThree.rank3.members?.length || 1, rating: topThree.rank3.rating, avatar: topThree.rank3.avatar || "🥉" } : null;

  // Order: 2nd place, 1st place, 3rd place
  const podiumOrder = [t2, t1, t3].filter(Boolean);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end mb-8 mt-2">
      {podiumOrder.map((team) => (
        <PodiumCard key={team.rank} team={team} />
      ))}
    </div>
  );
}

export default PodiumGrid;
