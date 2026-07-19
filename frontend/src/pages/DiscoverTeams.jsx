import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import Sidebar from "../components/dashboard/Sidebar";
import Topbar from "../components/dashboard/Topbar";
import AnimatedBackground from "../components/dashboard/AnimatedBackground";
import HeroSection from "../components/discover/HeroSection";
import FilterTabs from "../components/discover/FilterTabs";
import TeamCardsSection from "../components/discover/TeamCardsSection";
import AIInsightsSection from "../components/discover/AIInsightsSection";
import TopSkillsSection from "../components/discover/TopSkillsSection";
import ActiveHackathonsSection from "../components/discover/ActiveHackathonsSection";
import CTABanner from "../components/discover/CTABanner";
import TeamDetailsModal from "../components/discover/TeamDetailsModal";
import InterestedBuildersSection from "../components/discover/InterestedBuildersSection";
import DeveloperDetailsModal from "../components/common/DeveloperDetailsModal";
import CreateTeamModal from "../components/discover/CreateTeamModal";
import api from "../api/axios";
import { motion, AnimatePresence } from "framer-motion";

function DiscoverTeams() {
console.log("[DiscoverTeams] Component rendering");
const [teams, setTeams] = useState([]);
const [selectedTeam, setSelectedTeam] = useState(null);
const [activeTab, setActiveTab] = useState("recommended");
const [renderError, setRenderError] = useState(null);
const [builders, setBuilders] = useState([]);
const [buildersLoading, setBuildersLoading] = useState(true);
const [selectedBuilder, setSelectedBuilder] = useState(null);
const [showCreateTeam, setShowCreateTeam] = useState(false);
const [inviteTarget, setInviteTarget] = useState(null);
const [selectedInvite, setSelectedInvite] = useState(null);
const [sendingInvite, setSendingInvite] = useState(false);

// Search & Filter state
const [searchInput, setSearchInput] = useState("");
const [search, setSearch] = useState("");
const [technology, setTechnology] = useState("");
const [domain, setDomain] = useState("");
const [experience, setExperience] = useState("");

// Pagination & Loading state
const [page, setPage] = useState(1);
const [loading, setLoading] = useState(false);
const [hasMore, setHasMore] = useState(false);
const [error, setError] = useState(null);

const [searchParams] = useSearchParams();
const queryTeamId = searchParams.get("teamId");

// Debounce search input
useEffect(() => {
const handler = setTimeout(() => {
setSearch(searchInput);
}, 400);
return () => clearTimeout(handler);
}, [searchInput]);

// Main Fetcher function
const fetchTeamsData = async (reset = false) => {
  console.log("[DiscoverTeams] Starting fetchTeamsData, reset:", reset);
  setLoading(true);
  setError(null);
  try {
    const currentPage = reset ? 1 : page;
    if (reset) {
      setPage(1);
    }

    let url = "/teams";
    if (activeTab === "active") url = "/teams/most-active";
    else if (activeTab === "new") url = "/teams/new";
    else if (activeTab === "high-match") url = "/teams/high-match";

    console.log("[DiscoverTeams] Fetching from URL:", url, "with params");
    
    const params = {
      page: currentPage,
      limit: 6,
      search: search || undefined,
      technology: technology || undefined,
      domain: domain || undefined,
      experience: experience || undefined,
    };
    
    console.log("[DiscoverTeams] Request params:", params);

    const res = await api.get(url, { params });
    
    console.log("[DiscoverTeams] API Response received:", res.status, res.data);

    const newTeams = res.data.teams || res.data || [];
    const pagination = res.data.pagination || {};
    
    console.log("[DiscoverTeams] Extracted teams:", newTeams.length, "teams");

    if (reset) {
      setTeams(newTeams);
    } else {
      setTeams((prev) => {
        // Avoid duplicate keys
        const existingIds = new Set(prev.map(t => t._id || t.id));
        const filteredNew = newTeams.filter(t => !existingIds.has(t._id || t.id));
        return [...prev, ...filteredNew];
      });
    }

    setHasMore(pagination.hasMore || false);
    console.log("[DiscoverTeams] Teams set successfully");
  } catch (err) {
    console.error("[DiscoverTeams] Error fetching teams:", err);
    console.error("[DiscoverTeams] Error details:", {
      message: err.message,
      status: err.response?.status,
      data: err.response?.data
    });
    setError("Failed to load teams. Please try again.");
    setRenderError(null);
  } finally {
    setLoading(false);
    console.log("[DiscoverTeams] fetchTeamsData complete");
  }
};

// Fetch when tab or filter changes
useEffect(() => {
  console.log("[DiscoverTeams] useEffect triggered - filters changed");
  fetchTeamsData(true);
}, [activeTab, search, technology, domain, experience]);

// Fetch when page increments
useEffect(() => {
if (page > 1) {
fetchTeamsData(false);
}
}, [page]);

useEffect(() => {
  api.get("/hackathon-interest/discover", { params: { limit: 9 } })
    .then((res) => setBuilders(res.data.builders || []))
    .catch((err) => console.error("Unable to load interested builders:", err))
    .finally(() => setBuildersLoading(false));
}, []);

const inviteBuilder = async (builder) => {
  setSendingInvite(true);
  try {
    await api.post("/teams/invite", { hackathonId: builder.hackathon._id, candidateId: builder.user._id });
    setBuilders((current) => current.filter((item) => item.interestId !== builder.interestId));
    setInviteTarget(null);
    setSelectedInvite(null);
  } catch (err) {
    setError(err.response?.data?.message || "Unable to send invitation. Create or open a recruiting team for this hackathon first.");
  } finally {
    setSendingInvite(false);
  }
};

const openInviteDialog = (builder) => {
  const options = builders.filter((item) => String(item.user._id) === String(builder.user._id));
  setInviteTarget({ builder, options });
  setSelectedInvite(options.find((item) => item.canInvite) || null);
};

// Handle URL redirect query check
useEffect(() => {
if (queryTeamId && teams.length > 0) {
const match = teams.find((t) => t._id === queryTeamId || String(t.id) === String(queryTeamId));
if (match) {
const formattedMatch = {
...match,
name: match.teamName || match.name,
description: match.description || "Building high quality product prototypes.",
skills: match.requiredSkills || match.skills || ["React", "Node.js"],
match: match.matchScore || match.match || 88,
avatar: match.teamName ? match.teamName.charAt(0).toUpperCase() : "🛡️",
members: match.members || [],
};
setSelectedTeam(formattedMatch);
}
}
}, [queryTeamId, teams]);

return (
<div className="relative min-h-screen bg-[#050816] text-white">
{/* Particle Background */}
<AnimatedBackground />

{/* Sidebar */}
<Sidebar activePage="Discover Teams" />

{/* Main Content */}
<main className="ml-72 relative z-10 min-h-screen">
<Topbar />

<div className="p-8">
{/* Show render error if exists */}
{renderError && (
<div className="mb-8 p-4 rounded-xl bg-red-500/20 border border-red-500/50 text-red-300 font-mono text-sm">
<strong>Component Error:</strong> {renderError}
</div>
)}

{/* Hero */}
<HeroSection onCreateTeamClick={() => setShowCreateTeam(true)} />

{/* Filter Tabs */}
<FilterTabs activeTab={activeTab} onChangeTab={setActiveTab} />

{/* Search & Filter Toolbar */}
<div className="grid grid-cols-1 md:grid-cols-5 gap-3 p-4 mb-6 rounded-2xl bg-[#0e1222]/40 backdrop-blur-xl border border-white/5 animate-fade-in text-left">
{/* Search Input */}
<div className="md:col-span-2 relative">
<input
type="text"
value={searchInput}
onChange={(e) => setSearchInput(e.target.value)}
placeholder="Search teams by name or description..."
className="w-full px-4 py-2.5 pl-10 rounded-xl bg-[#050816]/60 border border-white/5 text-sm text-gray-250 placeholder-gray-500 focus:outline-none focus:border-[#3B82F6] transition-colors"
/>
<span className="absolute left-3.5 top-3 text-slate-500">🔍</span>
</div>

{/* Tech filter */}
<select
value={technology}
onChange={(e) => setTechnology(e.target.value)}
className="px-3 py-2.5 rounded-xl bg-[#050816]/60 border border-white/5 text-sm text-gray-400 focus:outline-none focus:border-[#3B82F6]"
>
<option value="">All Technologies</option>
<option value="react">React</option>
<option value="node">Node.js</option>
<option value="python">Python</option>
<option value="java">Java</option>
<option value="aws">AWS</option>
<option value="figma">Figma</option>
<option value="docker">Docker</option>
<option value="kubernetes">Kubernetes</option>
</select>

{/* Domain filter */}
<select
value={domain}
onChange={(e) => setDomain(e.target.value)}
className="px-3 py-2.5 rounded-xl bg-[#050816]/60 border border-white/5 text-sm text-gray-400 focus:outline-none focus:border-[#3B82F6]"
>
<option value="">All Domains</option>
<option value="Web Development">Web Development</option>
<option value="AI/ML">AI/ML</option>
<option value="Blockchain">Blockchain</option>
<option value="Mobile Development">Mobile Development</option>
</select>

{/* Experience filter */}
<select
value={experience}
onChange={(e) => setExperience(e.target.value)}
className="px-3 py-2.5 rounded-xl bg-[#050816]/60 border border-white/5 text-sm text-gray-400 focus:outline-none focus:border-[#3B82F6]"
>
<option value="">All Experience Levels</option>
<option value="Beginner">Beginner</option>
<option value="Intermediate">Intermediate</option>
<option value="Advanced">Advanced</option>
</select>
</div>

{/* Error state */}
{error && (
<div className="mb-8 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-semibold">
{error}
</div>
)}

{/* Team Cards - Horizontal Scroll */}
<TeamCardsSection
teams={teams}
onViewTeam={setSelectedTeam}
loading={loading}
activeTab={activeTab}
/>

<InterestedBuildersSection
builders={builders}
loading={buildersLoading}
onView={setSelectedBuilder}
onInvite={openInviteDialog}
/>

{/* Load More Pagination */}
{hasMore && !loading && (
<div className="flex justify-center mt-4 mb-8">
<motion.button
whileHover={{ scale: 1.04 }}
whileTap={{ scale: 0.96 }}
onClick={() => setPage((prev) => prev + 1)}
className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 text-xs font-bold text-white hover:from-purple-500 hover:to-blue-500 transition shadow-[0_0_15px_rgba(168,85,247,0.25)]"
>
Load More Teams
</motion.button>
</div>
)}

{/* Bottom Grid: AI Insights | Top Skills | Active Hackathons */}
<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
<AIInsightsSection />
<TopSkillsSection />
<ActiveHackathonsSection />
</div>

{/* CTA Banner */}
<CTABanner />
</div>
</main>

{/* Visual Charts Modal Overlay */}
<AnimatePresence>
{selectedTeam && (
<TeamDetailsModal
team={selectedTeam}
onClose={() => setSelectedTeam(null)}
/>
)}
{selectedBuilder && (
<DeveloperDetailsModal
developer={selectedBuilder.user}
onClose={() => setSelectedBuilder(null)}
onInvite={() => inviteBuilder(selectedBuilder)}
/>
)}
{inviteTarget && (
<div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
  <div className="w-full max-w-md rounded-3xl bg-[#0e1222] border border-white/10 p-6 shadow-2xl text-left">
    <h3 className="text-lg font-black text-white">Send team invitation</h3>
    <p className="mt-2 text-xs text-slate-400">Choose your team for <span className="font-bold text-white">{inviteTarget.builder.user.name}</span>. Only teams built for hackathons where they are interested are listed.</p>
    <div className="mt-5 space-y-2">
      {inviteTarget.options.map((option) => <button key={option.interestId} type="button" disabled={!option.canInvite} onClick={() => setSelectedInvite(option)} className={`w-full rounded-xl border p-3 text-left transition ${selectedInvite?.interestId === option.interestId ? "border-cyan-400/50 bg-cyan-500/10" : "border-white/5 bg-[#050816]/50"} ${!option.canInvite ? "opacity-50 cursor-not-allowed" : "hover:border-white/15"}`}><span className="block text-xs font-bold text-white">{option.team?.teamName || "No eligible team"}</span><span className="mt-1 block text-[10px] text-cyan-300">{option.hackathon.title}</span><span className="mt-1 block text-[10px] text-slate-400">{option.canInvite ? `${option.team.memberCount}/${option.team.maxMembers} members · open slot available` : option.team ? "This team is full or not recruiting" : "Create a team for this hackathon first"}</span></button>)}
    </div>
    <div className="mt-5 flex gap-3"><button type="button" onClick={() => { setInviteTarget(null); setSelectedInvite(null); }} className="flex-1 rounded-xl bg-white/5 py-2.5 text-xs font-bold text-slate-300">Cancel</button><button type="button" disabled={!selectedInvite || sendingInvite} onClick={() => inviteBuilder(selectedInvite)} className="flex-1 rounded-xl bg-cyan-600 hover:bg-cyan-500 disabled:bg-white/10 disabled:text-slate-500 py-2.5 text-xs font-bold text-white">{sendingInvite ? "Sending…" : "Send request"}</button></div>
  </div>
</div>
)}
{showCreateTeam && (
<CreateTeamModal
onClose={() => setShowCreateTeam(false)}
onSuccess={() => setShowCreateTeam(false)}
/>
)}
</AnimatePresence>
</div>
);
}

export default DiscoverTeams;
