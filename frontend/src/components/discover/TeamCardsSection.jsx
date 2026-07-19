import { motion } from "framer-motion";
import { useRef } from "react";
import { FaBookmark, FaChevronRight, FaChevronLeft } from "react-icons/fa";
import { discoverTeams } from "../../data/discoverTeamsData";
import BookmarkButton from "../bookmarks/BookmarkButton";

const badgeStyles = {
  purple: "bg-purple-500/20 text-cyan-300 border-[#FF8A00]/25",
  green: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
  cyan: "bg-cyan-500/20 text-cyan-300 border-cyan-500/30",
  amber: "bg-amber-500/20 text-amber-300 border-amber-500/30",
};

const dotStyles = {
  purple: "bg-purple-400",
  green: "bg-emerald-400",
  cyan: "bg-cyan-400",
  amber: "bg-amber-400",
};

function TeamCardsSection({ teams = [], onViewTeam, loading = false, activeTab = "recommended" }) {
  const scrollRef = useRef(null);

  const formattedLiveTeams = (teams || []).filter(Boolean).map((t) => {
    let badgeText = "Actively Recruiting";
    let badgeColor = "cyan";
    let avatarBg = "from-purple-600 to-blue-600";

    if (activeTab === "high-match" || t.matchScore >= 70) {
      badgeText = "High Match";
      badgeColor = "purple";
      avatarBg = "from-pink-600 to-purple-600";
    } else if (t.isNew) {
      badgeText = "New Team";
      badgeColor = "amber";
      avatarBg = "from-yellow-600 to-orange-600";
    } else if (t.activityScore > 40) {
      badgeText = "Most Active";
      badgeColor = "green";
      avatarBg = "from-emerald-600 to-teal-600";
    }

    const membersCount = t.members ? t.members.length : 1;

    return {
      ...t,
      id: t._id || t.id,
      name: t.teamName || t.name,
      description: t.description || "Building high quality product prototypes.",
      skills: t.requiredSkills || t.skills || ["React", "Node.js"],
      match: t.matchScore || t.match || 85,
      badge: badgeText,
      badgeColor: badgeColor,
      avatar: (t.teamName && typeof t.teamName === "string" && t.teamName.length > 0)
        ? t.teamName.charAt(0).toUpperCase()
        : (t.name && typeof t.name === "string" && t.name.length > 0)
        ? t.name.charAt(0).toUpperCase()
        : "🛡️",
      avatarBg: avatarBg,
      members: t.members || [],
      extraMembers: Math.max(0, membersCount - 3),
      maxMembers: t.maxMembers || 4,
    };
  });

  const displayTeams = formattedLiveTeams;

  const scroll = (dir) => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({
        left: dir === "left" ? -340 : 340,
        behavior: "smooth",
      });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.7 }}
      className="relative mb-8"
    >
      {/* Scroll Arrows */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => scroll("left")}
        className="absolute -left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-[#0e1222]/90 border border-white/10 flex items-center justify-center text-white hover:border-[#FF8A00] transition"
      >
        <FaChevronLeft />
      </motion.button>

      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => scroll("right")}
        className="absolute -right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-[#0e1222]/90 border border-white/10 flex items-center justify-center text-white hover:border-[#FF8A00] transition"
      >
        <FaChevronRight />
      </motion.button>

      {/* Scrollable Cards */}
      <div
        ref={scrollRef}
        className="flex gap-5 overflow-x-auto scrollbar-hide pb-4 px-2 w-full"
      >
        {loading && displayTeams.length === 0 ? (
          // Render loading skeletons
          Array.from({ length: 4 }).map((_, idx) => (
            <div key={idx} className="min-w-[300px] max-w-[300px] rounded-2xl border border-white/5 bg-[#0e1222]/30 p-6 flex flex-col justify-between animate-pulse text-left shrink-0">
              <div>
                <div className="flex justify-between items-start mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-white/5" />
                  <div className="w-24 h-6 rounded-full bg-white/5" />
                </div>
                <div className="w-3/4 h-5 rounded bg-white/5 mb-3" />
                <div className="w-full h-12 rounded bg-white/5 mb-6" />
              </div>
              <div className="border-t border-white/5 pt-4">
                <div className="flex justify-between items-center">
                  <div className="flex -space-x-2">
                    <div className="w-8 h-8 rounded-full bg-white/5" />
                    <div className="w-8 h-8 rounded-full bg-white/5" />
                    <div className="w-8 h-8 rounded-full bg-white/5" />
                  </div>
                  <div className="w-24 h-8 rounded-xl bg-white/5" />
                </div>
              </div>
            </div>
          ))
        ) : displayTeams.length === 0 ? (
          <div className="w-full text-center py-10 border border-dashed border-white/5 rounded-2xl bg-[#0e1222]/25">
            <p className="text-slate-400 text-xs md:text-sm">No recruiting teams found matching the filters.</p>
          </div>
        ) : (
          displayTeams.map((team, index) => {
            const badgeColor = team.badgeColor || "purple";
            const displaySkills = team.skills || [];
            const displayMembers = team.members || [];

            return (
              <motion.div
                key={team.id || index}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ scale: 1.03, y: -8 }}
                className="relative overflow-hidden min-w-[300px] max-w-[300px] rounded-2xl bg-[#0e1222]/70 backdrop-blur-xl border border-white/5 p-5 flex flex-col cursor-pointer group text-left shrink-0"
              >
                {/* Moving Shine */}
                <motion.div
                  animate={{ x: ["-100%", "400%"] }}
                  transition={{
                    duration: 5,
                    repeat: Infinity,
                    ease: "linear",
                    repeatDelay: 3,
                  }}
                  className="absolute inset-y-0 w-16 bg-gradient-to-r from-transparent via-white/5 to-transparent"
                />

                {/* Top Row - Badge + Bookmark */}
                <div className="flex justify-between items-start mb-4">
                  <div
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${badgeStyles[badgeColor] || badgeStyles.purple}`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${dotStyles[badgeColor] || dotStyles.purple}`}
                    />
                    {team.badge}
                  </div>
                  {team.activityScore > 60 && (
                    <span className="text-[10px] bg-blue-500/20 text-blue-300 border border-blue-500/30 px-2 py-0.5 rounded-md font-bold uppercase tracking-wider">
                      Verified ✓
                    </span>
                  )}
                  <BookmarkButton
                    itemId={team.id || team._id}
                    bookmarkType="team"
                    itemName={team.name}
                    itemImage=""
                    itemDescription={team.description || "Active Team"}
                  />
                </div>

                {/* Team Avatar + Info */}
                <div className="flex items-center gap-3 mb-3">
                  <div
                    className={`w-12 h-12 rounded-xl bg-gradient-to-br ${team.avatarBg || "from-purple-600 to-blue-600"} flex items-center justify-center text-xl font-bold text-white shrink-0`}
                  >
                    {team.avatar || "🛡️"}
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-bold text-white text-base truncate">{team.name}</h3>
                    <p className="text-xs text-gray-400 truncate">{team.description}</p>
                  </div>
                </div>

                {/* Stats & Capacity */}
                <div className="flex flex-wrap gap-2.5 my-2 text-[10px] text-slate-400 font-bold border-b border-white/5 pb-2.5">
                  <span className="flex items-center gap-1">
                    👥 {displayMembers.length}/{team.maxMembers} Joined
                  </span>
                  {team.activityScore !== undefined && (
                    <span className="text-amber-400">
                      🔥 Score: {Math.round(team.activityScore)}
                    </span>
                  )}
                  {team.applicationsCount > 0 && (
                    <span className="text-cyan-400">
                      📩 {team.applicationsCount} Apps
                    </span>
                  )}
                </div>

                {/* Compatibility explanation */}
                {team.whyMatches && (
                  <div className="mb-3 text-[10px] text-cyan-300 font-medium bg-cyan-950/20 border border-cyan-500/10 p-2 rounded-lg leading-normal">
                    🎯 {team.whyMatches}
                  </div>
                )}

                 {/* Matching & Missing Skills */}
                {Array.isArray(team.matchingSkills) && team.matchingSkills.length > 0 && (
                  <div className="mb-3 text-left">
                    <span className="text-[9px] text-slate-500 font-bold block mb-1">MATCHING SKILLS</span>
                    <div className="flex flex-wrap gap-1">
                      {team.matchingSkills.map((s, idx) => (
                        <span key={idx} className="px-2 py-0.5 rounded text-[8px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 font-semibold uppercase">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {Array.isArray(team.missingSkills) && team.missingSkills.length > 0 && (
                  <div className="mb-3 text-left">
                    <span className="text-[9px] text-slate-500 font-bold block mb-1">MISSING SKILLS</span>
                    <div className="flex flex-wrap gap-1">
                      {team.missingSkills.map((s, idx) => (
                        <span key={idx} className="px-2 py-0.5 rounded text-[8px] bg-red-500/5 text-slate-400 border border-white/5 font-semibold uppercase">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Standard Required Skills (if not on High Match) */}
                {!team.matchingSkills && (
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {Array.isArray(displaySkills) && displaySkills.slice(0, 3).map((skill, i) => (
                      <span
                        key={i}
                        className="px-2.5 py-1 rounded-lg text-[10px] bg-[#0e1222]/80 text-slate-350 border border-white/5"
                      >
                        {skill}
                      </span>
                    ))}
                    {Array.isArray(displaySkills) && displaySkills.length > 3 && (
                      <span className="px-2.5 py-1 rounded-lg text-[10px] bg-[#0e1222]/80 text-gray-500 border border-white/5">
                        +{displaySkills.length - 3} more
                      </span>
                    )}
                  </div>
                )}

                {/* Members Avatars */}
                <div className="flex items-center gap-2 mb-4 mt-auto">
                  <div className="flex -space-x-2">
                    {(displayMembers || []).filter(Boolean).slice(0, 3).map((member, i) => {
                      const isObj = typeof member === "object" && member !== null;
                      const imgIdx = isObj ? (member.avatar || member.img || (i * 3 + 12)) : (i * 3 + 12);
                      const avatarSrc = isObj && member.avatar && (member.avatar.startsWith("http") || member.avatar.startsWith("data:"))
                        ? member.avatar
                        : `https://i.pravatar.cc/40?img=${imgIdx}`;
                      return (
                        <img
                          key={i}
                          src={avatarSrc}
                          alt=""
                          className="w-7 h-7 rounded-full border-2 border-[#0e1222] object-cover"
                        />
                      );
                    })}
                  </div>
                  {team.extraMembers > 0 && (
                    <span className="text-xs text-slate-400">
                      +{team.extraMembers} more
                    </span>
                  )}
                </div>

                {/* Bottom - Match + View Button */}
                <div className="flex items-center justify-between pt-2.5 border-t border-slate-900/60">
                  <span className="font-bold text-emerald-400 text-sm">
                    {team.match}% Match
                  </span>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => onViewTeam(team)}
                    className="px-4 py-2 rounded-xl bg-[#0e1222] border border-[#3B82F6]/35 text-xs font-semibold text-white hover:border-[#3B82F6] hover:shadow-lg hover:shadow-[#3B82F6]/25 transition"
                  >
                    View Team
                  </motion.button>
                </div>
              </motion.div>
            );
          })
        )}
      </div>
    </motion.div>
  );
}

export default TeamCardsSection;
