import { useState, useEffect, useCallback } from "react";
import PageLayout from "../components/dashboard/PageLayout";
import LeaderboardHero from "../components/leaderboard/LeaderboardHero";
import LeaderboardTabs from "../components/leaderboard/LeaderboardTabs";
import PodiumGrid from "../components/leaderboard/PodiumGrid";
import LeaderboardTable from "../components/leaderboard/LeaderboardTable";
import LeaderboardFilters from "../components/leaderboard/LeaderboardFilters";
import YourRankCard from "../components/leaderboard/YourRankCard";
import LeaderboardInsights from "../components/leaderboard/LeaderboardInsights";
import api from "../api/axios";
import { FaSearch, FaSync, FaTrophy, FaUsers, FaGlobe } from "react-icons/fa";
import { motion } from "framer-motion";

function Leaderboard() {
  const [activeTab, setActiveTab] = useState("team");
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState({ timePeriod: "thisMonth" });

  const [loading, setLoading] = useState(false);
  const [recalculating, setRecalculating] = useState(false);
  const [items, setItems] = useState([]);
  const [topThree, setTopThree] = useState({ rank1: null, rank2: null, rank3: null });
  const [stats, setStats] = useState({ totalTeams: 0, totalDevelopers: 0, totalHackathons: 0, activeParticipants: 0, currentSeason: 1 });
  const [insights, setInsights] = useState({});
  const [myRank, setMyRank] = useState(null);
  const [pagination, setPagination] = useState({});

  // Fetch Stats, Insights, and User Team Rank
  const fetchAuxiliaryData = useCallback(async () => {
    try {
      const [statsRes, insightsRes, myRankRes] = await Promise.all([
        api.get("/leaderboard/stats"),
        api.get("/leaderboard/insights"),
        api.get("/leaderboard/my-team").catch(() => ({ data: { myRank: null } }))
      ]);

      if (statsRes.data?.success) setStats(statsRes.data);
      if (insightsRes.data?.success) setInsights(insightsRes.data.insights);
      if (myRankRes.data?.success) setMyRank(myRankRes.data.myRank);
    } catch (err) {
      console.error("Failed to load auxiliary leaderboard data:", err);
    }
  }, []);

  // Fetch Rankings List & Podium
  const fetchRankings = useCallback(async () => {
    setLoading(true);
    try {
      // Determine if searching or filtering
      let listRes;
      if (searchQuery) {
        listRes = await api.get("/leaderboard/search", {
          params: { q: searchQuery }
        });
        setItems(listRes.data?.items || []);
        setPagination({ total: (listRes.data?.items || []).length, page: 1, pages: 1 });
      } else {
        listRes = await api.get("/leaderboard/filter", {
          params: {
            type: activeTab,
            page,
            category: filters.category,
            region: filters.region,
            period: filters.timePeriod
          }
        });
        if (listRes.data?.success) {
          setItems(listRes.data.items || []);
          setPagination(listRes.data.pagination || {});
        }
      }

      // Fetch Top 3 podium items
      const podiumRes = await api.get("/leaderboard/top3", {
        params: { type: activeTab }
      });
      if (podiumRes.data?.success) {
        setTopThree({
          rank1: podiumRes.data.rank1,
          rank2: podiumRes.data.rank2,
          rank3: podiumRes.data.rank3
        });
      }
    } catch (err) {
      console.error("Failed to load rankings:", err);
    } finally {
      setLoading(false);
    }
  }, [activeTab, page, searchQuery, filters]);

  // Initial Fetch & on Parameter Change
  useEffect(() => {
    fetchAuxiliaryData();
  }, [fetchAuxiliaryData]);

  useEffect(() => {
    fetchRankings();
  }, [fetchRankings]);

  // Manual Trigger Force Recalculate ranks
  const handleForceRecalculate = async () => {
    setRecalculating(true);
    try {
      const res = await api.post("/leaderboard/recalculate");
      if (res.data?.success) {
        fetchRankings();
        fetchAuxiliaryData();
      }
    } catch (err) {
      console.error("Failed to trigger recalculation:", err);
    } finally {
      setRecalculating(false);
    }
  };

  return (
    <PageLayout activePage="Leaderboard">
      <div className="p-6 sm:p-8">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-4xl font-extrabold page-title text-left">Leaderboard</h1>
            <p className="text-slate-500 mt-1 text-sm text-left">Top performing builders ranked by score, wins & contributions.</p>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            {/* Search Input bar */}
            <div className="relative flex-1 md:w-64">
              <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 text-xs" />
              <input
                type="text"
                placeholder="Search name..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setPage(1);
                }}
                className="w-full bg-[#0e1222]/50 hover:bg-[#0e1222]/80 focus:bg-[#0e1222]/80 border border-white/5 focus:border-[#FF8A00] rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-gray-500 outline-none transition-all font-mono"
              />
            </div>

            {/* Recalculate button */}
            <button
              onClick={handleForceRecalculate}
              disabled={recalculating}
              className="px-3.5 py-2.5 rounded-xl bg-purple-600/20 border border-purple-500/20 text-purple-300 text-xs font-bold flex items-center gap-2 hover:bg-purple-600/30 transition-all font-mono disabled:opacity-50"
            >
              <FaSync className={`text-[10px] ${recalculating ? "animate-spin" : ""}`} />
              <span>Sync</span>
            </button>
          </div>
        </div>

        {/* Statistics Widgets Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {/* Teams Stat */}
          <motion.div
            whileHover={{ y: -4, borderColor: "rgba(59,130,246,0.3)" }}
            className="rounded-2xl border border-white/5 bg-gradient-to-br from-[#0e1222]/50 via-[#050816]/70 to-[#0e1222]/30 p-4 text-left flex items-center justify-between gap-3 transition-all duration-300 shadow-md group"
          >
            <div>
              <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider font-mono">Teams</span>
              <h3 className="text-xl font-black text-white mt-1 font-mono">{stats.totalTeams}</h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 group-hover:bg-blue-500/20 transition-all duration-300">
              <FaUsers className="text-sm" />
            </div>
          </motion.div>

          {/* Developers Stat */}
          <motion.div
            whileHover={{ y: -4, borderColor: "rgba(168,85,247,0.3)" }}
            className="rounded-2xl border border-white/5 bg-gradient-to-br from-[#0e1222]/50 via-[#050816]/70 to-[#0e1222]/30 p-4 text-left flex items-center justify-between gap-3 transition-all duration-300 shadow-md group"
          >
            <div>
              <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider font-mono">Developers</span>
              <h3 className="text-xl font-black text-white mt-1 font-mono">{stats.totalDevelopers}</h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 group-hover:bg-purple-500/20 transition-all duration-300">
              <FaUsers className="text-sm text-purple-300" />
            </div>
          </motion.div>

          {/* Hackathons Stat */}
          <motion.div
            whileHover={{ y: -4, borderColor: "rgba(236,72,153,0.3)" }}
            className="rounded-2xl border border-white/5 bg-gradient-to-br from-[#0e1222]/50 via-[#050816]/70 to-[#0e1222]/30 p-4 text-left flex items-center justify-between gap-3 transition-all duration-300 shadow-md group"
          >
            <div>
              <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider font-mono">Hackathons</span>
              <h3 className="text-xl font-black text-white mt-1 font-mono">{stats.totalHackathons}</h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-pink-500/10 border border-pink-500/20 flex items-center justify-center text-pink-400 group-hover:bg-pink-500/20 transition-all duration-300">
              <FaTrophy className="text-xs" />
            </div>
          </motion.div>

          {/* Current Season Stat */}
          <motion.div
            whileHover={{ y: -4, borderColor: "rgba(249,115,22,0.3)" }}
            className="rounded-2xl border border-white/5 bg-gradient-to-br from-[#0e1222]/50 via-[#050816]/70 to-[#0e1222]/30 p-4 text-left flex items-center justify-between gap-3 transition-all duration-300 shadow-md group"
          >
            <div>
              <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider font-mono">Current Season</span>
              <h3 className="text-xl font-black text-orange-400 mt-1 font-mono">Season {stats.currentSeason}</h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400 group-hover:bg-orange-500/20 transition-all duration-300">
              <FaGlobe className="text-xs text-orange-300" />
            </div>
          </motion.div>
        </div>

        <LeaderboardHero />
        
        {/* Tabs Bar */}
        <LeaderboardTabs activeTab={activeTab} onChange={(val) => {
          setActiveTab(val);
          setPage(1);
        }} />

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
          <div className="xl:col-span-2 space-y-6">
            {/* Podium grid */}
            <PodiumGrid topThree={topThree} />

            {/* Main ranks table */}
            <LeaderboardTable
              items={items}
              pagination={pagination}
              activeType={activeTab}
              onPageChange={(p) => setPage(p)}
            />
          </div>
          <div className="space-y-6">
            {/* Filter sidebar details */}
            <LeaderboardFilters
              onApply={(f) => {
                setFilters(f);
                setPage(1);
              }}
              onReset={() => {
                setFilters({ timePeriod: "thisMonth" });
                setPage(1);
              }}
            />
            {/* Personal ranks card */}
            <YourRankCard myRank={myRank} />

            {/* Insights panel */}
            <LeaderboardInsights insights={insights} />
          </div>
        </div>
      </div>
    </PageLayout>
  );
}

export default Leaderboard;
