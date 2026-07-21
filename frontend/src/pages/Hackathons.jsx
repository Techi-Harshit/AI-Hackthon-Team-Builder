import { useState, useEffect, useCallback } from "react";
import { AnimatePresence } from "framer-motion";
import PageLayout from "../components/dashboard/PageLayout";
import HackathonsHero from "../components/hackathons/HackathonsHero";
import HackathonsFilterTabs from "../components/hackathons/HackathonsFilterTabs";
import FilterBar from "../components/hackathons/FilterBar";
import HackathonsGrid from "../components/hackathons/HackathonsGrid";
import CreateTeamModal from "../components/discover/CreateTeamModal";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { FaCheck, FaTimes, FaDownload, FaUsers, FaCode, FaSlidersH } from "react-icons/fa";

function Hackathons() {
  const { user, fetchProfile } = useAuth();
  const [userTeams, setUserTeams] = useState([]);

  // My Hosted Hackathons Hub states
  const [myHostedHackathons, setMyHostedHackathons] = useState([]);
  const [selectedMyHack, setSelectedMyHack] = useState(null);
  const [myHackRegistrations, setMyHackRegistrations] = useState([]);
  const [showRegistrationsModal, setShowRegistrationsModal] = useState(false);
  const [moderatingId, setModeratingId] = useState(null);

  const fetchMyHostedHackathons = async () => {
    try {
      const res = await api.get("/hackathons", { params: { status: undefined } });
      const hacks = res.data.hackathons || res.data || [];
      const mine = hacks.filter(h => String(h.createdBy) === String(user?._id));
      setMyHostedHackathons(mine);
    } catch (err) {
      console.error("Error loading hosted hackathons:", err);
    }
  };

  const fetchUserTeams = async () => {
    try {
      const res = await api.get("/teams");
      const teams = res.data.teams || res.data || [];
      const mine = teams.filter((team) => {
        const leaderId = team.leader?._id || team.leader;
        const members = team.members || [];
        const isLeader = String(leaderId) === String(user?._id);
        const isMember = members.some((member) => String(member?._id || member) === String(user?._id));
        return isLeader || isMember;
      });
      setUserTeams(mine);
    } catch (err) {
      console.error("Error loading user teams:", err);
      setUserTeams([]);
    }
  };

  const handleViewTeams = async (hack) => {
    setSelectedMyHack(hack);
    setShowRegistrationsModal(true);
    try {
      const regRes = await api.get(`/hackathons/${hack._id || hack.id}/registrations`);
      setMyHackRegistrations(regRes.data || []);
    } catch (err) {
      console.error("Failed to load registrations:", err);
    }
  };

  useEffect(() => {
    if (user?._id) {
      fetchMyHostedHackathons();
      fetchUserTeams();
    }
  }, [user]);
  
  // Search & Filter state
  const [search, setSearch] = useState("");
  const [technology, setTechnology] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [mode, setMode] = useState("");
  const [location, setLocation] = useState("");
  const [hackathonType, setHackathonType] = useState("");
  const [status, setStatus] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [activeTab, setActiveTab] = useState("all");

  const [hackathons, setHackathons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [createTeamHackathon, setCreateTeamHackathon] = useState(null);

  // Debouncing search typing (450ms)
  const [debouncedSearch, setDebouncedSearch] = useState("");
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 450);
    return () => clearTimeout(handler);
  }, [search]);

  // Every new server-side filter starts a fresh result set.
  useEffect(() => {
    setPage(1);
  }, [technology, difficulty, mode, location, hackathonType, status, sortBy]);

  // Fetch hackathons from backend
  const fetchAllHackathons = useCallback(async (isLoadMore = false) => {
    setLoading(true);
    setError("");
    try {
      const params = {
        search: debouncedSearch,
        techStack: technology,
        difficulty,
        mode,
        location,
        type: hackathonType,
        status,
        sort: sortBy,
        page: isLoadMore ? page : 1,
        limit: 9
      };

      const res = await api.get("/hackathons", { params });
      
      const incoming = res.data.hackathons || res.data || [];

      if (isLoadMore) {
        setHackathons((prev) => {
          const existingIds = prev.map(p => p._id || p.id);
          const uniqueNew = incoming.filter(f => !existingIds.includes(f._id || f.id));
          return [...prev, ...uniqueNew];
        });
      } else {
        setHackathons(incoming);
      }

      setHasMore(res.data.hasMore || false);
    } catch (err) {
      console.error("Error loading hackathons catalog:", err);
      setError("Failed to load hackathons. Please try again later.");
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, technology, difficulty, mode, location, hackathonType, status, sortBy, page]);

  useEffect(() => {
    fetchAllHackathons(false);
  }, [debouncedSearch, technology, difficulty, mode, location, hackathonType, status, sortBy]);

  useEffect(() => {
    if (page > 1) {
      fetchAllHackathons(true);
    }
  }, [page]);

  const handleResetFilters = () => {
    setSearch("");
    setTechnology("");
    setDifficulty("");
    setMode("");
    setLocation("");
    setHackathonType("");
    setStatus("");
    setSortBy("newest");
    setActiveTab("all");
    setPage(1);
  };

  const handleInterestChange = ({ hackathonId, isInterested, interestId }) => {
    setHackathons((current) => current.map((item) => {
      if (String(item._id || item.id) !== String(hackathonId)) return item;
      const changed = Boolean(item.isInterested) !== isInterested;
      return {
        ...item,
        isInterested,
        interestId,
        interestCount: Math.max(0, (item.interestCount || 0) + (changed ? (isInterested ? 1 : -1) : 0))
      };
    }));
  };

  return (
    <PageLayout activePage="Hackathons">
        <div className="p-8 space-y-8">
          {/* Hero */}
          <HackathonsHero />

          {/* Filter Tabs & Content Stack */}
          <div className="space-y-6">
            <HackathonsFilterTabs
              activeTab={activeTab}
              onChangeTab={(tab) => { setActiveTab(tab); setStatus(tab === "all" ? "" : tab); setPage(1); }}
              sortBy={sortBy}
              onChangeSort={(sort) => { setSortBy(sort); setPage(1); }}
            />

            <FilterBar
              search={search}
              onChangeSearch={setSearch}
              technology={technology}
              onChangeTechnology={setTechnology}
              difficulty={difficulty}
              onChangeDifficulty={setDifficulty}
              mode={mode}
              onChangeMode={setMode}
              location={location}
              onChangeLocation={setLocation}
              status={status}
              onChangeStatus={(value) => { setStatus(value); setActiveTab(value || "all"); setPage(1); }}
              hackathonType={hackathonType}
              onChangeHackathonType={setHackathonType}
              onReset={handleResetFilters}
            />

            <HackathonsGrid
              hackathons={hackathons}
              loading={loading}
              error={error}
              page={page}
              setPage={setPage}
              hasMore={hasMore}
              onInterestChange={handleInterestChange}
              onCreateTeam={setCreateTeamHackathon}
            />
          </div>

          <AnimatePresence>
            {createTeamHackathon && (
              <CreateTeamModal
                preselectedHackathonId={createTeamHackathon._id || createTeamHackathon.id}
                prefillData={{
                  hackathonId: createTeamHackathon._id || createTeamHackathon.id,
                  requiredSkills: createTeamHackathon.techStack || createTeamHackathon.requiredSkills || []
                }}
                onClose={() => setCreateTeamHackathon(null)}
                onSuccess={() => setCreateTeamHackathon(null)}
              />
            )}
          </AnimatePresence>

          {/* MY HACKATHONS SECTION */}
          {user?._id && myHostedHackathons.length > 0 && (
            <div className="p-6 rounded-3xl bg-[#090d1f]/60 border border-white/5 backdrop-blur-xl relative overflow-hidden text-left">
              {/* Decorative accent glow */}
              <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-[#3B82F6]/5 to-[#F97316]/5 blur-3xl pointer-events-none" />

              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-lg font-black text-white flex items-center gap-2">
                    <span className="p-1.5 rounded-lg bg-[#F97316]/10 text-[#F97316] text-xs">🛠️</span>
                    MY Hosted Hackathons (Organizer Hub)
                  </h3>
                  <p className="text-xs text-gray-400 mt-1">
                    Manage registrations, approve/reject teams, and track live activity for events you host.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {myHostedHackathons.map((hack) => {
                  const registeredCount = hack.participants || "0";
                  return (
                    <div
                      key={hack._id || hack.id}
                      className="p-5 rounded-2xl bg-[#030712]/50 border border-white/5 hover:border-[#3B82F6]/20 transition flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex justify-between items-start mb-2">
                          <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider ${
                            hack.status === "Approved" || hack.status === "Published"
                              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/15"
                              : hack.status === "Pending Review"
                              ? "bg-amber-500/10 text-amber-400 border border-amber-500/15"
                              : "bg-gray-500/10 text-gray-400 border border-white/5"
                          }`}>
                            {hack.status || "Draft"}
                          </span>
                          <span className="text-[10px] text-gray-500 font-bold font-mono">
                            {hack.hackathonType || "Open"} Event
                          </span>
                        </div>

                        <h4 className="font-extrabold text-sm text-white line-clamp-1">{hack.title}</h4>
                        <p className="text-[10px] text-gray-400 mt-1 line-clamp-2 leading-relaxed">
                          {hack.description}
                        </p>

                        <div className="grid grid-cols-2 gap-3 mt-4 pt-3 border-t border-white/5 text-left">
                          <div>
                            <span className="text-[9px] text-gray-500 uppercase font-black block">Registrants</span>
                            <span className="text-xs font-bold text-cyan-400 flex items-center gap-1 mt-0.5">
                              <FaUsers className="text-[10px]" /> {registeredCount} Teams
                            </span>
                          </div>
                          <div>
                            <span className="text-[9px] text-gray-500 uppercase font-black block">Mode / Format</span>
                            <span className="text-xs font-bold text-white flex items-center gap-1 mt-0.5">
                              <FaCode className="text-[10px] text-gray-400" /> {hack.mode || "Online"}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-2 mt-5 pt-3 border-t border-white/5">
                        <button
                          onClick={async () => {
                            setSelectedMyHack(hack);
                            setShowRegistrationsModal(true);
                            try {
                              const regRes = await api.get(`/hackathons/${hack._id || hack.id}/registrations`);
                              setMyHackRegistrations(regRes.data);
                            } catch (err) {
                              console.error("Failed to load registrations:", err);
                            }
                          }}
                          className="flex-1 py-2 rounded-xl bg-[#3B82F6]/10 hover:bg-[#3B82F6]/20 border border-[#3B82F6]/20 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
                        >
                          <FaSlidersH className="text-[10px]" /> Manage Teams
                        </button>
                        <a
                          href={`${api.defaults.baseURL}/hackathons/${hack._id || hack.id}/export-csv`}
                          target="_blank"
                          rel="noreferrer"
                          className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 hover:text-white transition flex items-center justify-center"
                          title="Download CSV"
                        >
                          <FaDownload className="text-xs" />
                        </a>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}


        </div>

      <AnimatePresence>
        {showRegistrationsModal && selectedMyHack && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
            <div className="relative w-full max-w-4xl max-h-[85vh] bg-[#090d1f] border border-white/10 rounded-3xl overflow-hidden shadow-2xl flex flex-col">
              {/* Header */}
              <div className="p-6 border-b border-white/5 flex justify-between items-center bg-[#0d1226]">
                <div className="text-left">
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-black text-white">
                      {String(selectedMyHack.createdBy) === String(user?._id)
                        ? "Manage Registrations (Organizer Hub)"
                        : "Participating Teams & Members"}
                    </h3>
                    <span className="px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 text-[10px] font-bold">
                      {selectedMyHack.title}
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-400 mt-1 font-semibold">
                    {String(selectedMyHack.createdBy) === String(user?._id)
                      ? "Review incoming applications, view team profiles, and approve/reject candidates."
                      : "Browse all registered teams, their members, and stack information participating in this hackathon."}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setShowRegistrationsModal(false);
                    setSelectedMyHack(null);
                    setMyHackRegistrations([]);
                  }}
                  className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition cursor-pointer text-xs"
                >
                  ✕ Close
                </button>
              </div>

              {/* Body */}
              <div className="p-6 overflow-y-auto flex-1 space-y-4">
                {myHackRegistrations.length === 0 ? (
                  <div className="p-12 text-center text-gray-400 text-xs bg-[#030712]/40 rounded-2xl border border-white/5">
                    📭 No teams have registered for this hackathon yet.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {myHackRegistrations.map((reg) => (
                      <div
                        key={reg._id || reg.id}
                        className="p-5 rounded-2xl bg-[#030712]/50 border border-white/5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:border-white/10 transition text-left"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-extrabold text-sm text-white">
                              {reg.teamName || "Solo Registration"}
                            </span>
                            <span className={`px-1.5 py-0.5 rounded text-[8px] font-black uppercase ${
                              reg.status === "Approved"
                                ? "bg-emerald-500/10 text-emerald-400"
                                : reg.status === "Rejected"
                                ? "bg-red-500/10 text-red-400"
                                : "bg-amber-500/10 text-amber-400"
                            }`}>
                              {reg.status}
                            </span>
                          </div>

                          <div className="text-[10px] text-gray-400 space-y-0.5">
                            <p>Leader: <span className="text-white font-bold">{reg.leaderDetails?.name || "N/A"}</span> ({reg.leaderDetails?.email || "N/A"})</p>
                            <p>Phone: <span className="text-white font-mono">{reg.leaderDetails?.phone || "N/A"}</span> • College: <span className="text-cyan-400">{reg.college || "Global Institute"}</span></p>
                            {reg.memberDetails && reg.memberDetails.length > 0 && (
                              <p className="text-gray-500">
                                Members: {reg.memberDetails.map(m => `${m.name} (${m.role})`).join(", ")}
                              </p>
                            )}
                          </div>
                        </div>

                        {String(selectedMyHack.createdBy) === String(user?._id) && (
                          <div className="flex gap-2 w-full md:w-auto">
                            {reg.status !== "Approved" && (
                              <button
                                disabled={moderatingId !== null}
                                onClick={async () => {
                                  setModeratingId(reg._id);
                                  try {
                                    await api.put(`/hackathons/registrations/${reg._id || reg.id}/moderate`, { status: "Approved" });
                                    // Refresh local list
                                    setMyHackRegistrations(prev =>
                                      prev.map(r => {
                                        const rId = r._id || r.id;
                                        const targetId = reg._id || reg.id;
                                        return String(rId) === String(targetId) ? { ...r, status: "Approved" } : r;
                                      })
                                    );
                                    fetchMyHostedHackathons();
                                  } catch (err) {
                                    console.error("Moderation error:", err);
                                  } finally {
                                    setModeratingId(null);
                                  }
                                }}
                                className="flex-1 md:flex-initial px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-black flex items-center justify-center gap-1 transition cursor-pointer"
                              >
                                <FaCheck /> Approve
                              </button>
                            )}
                            {reg.status !== "Rejected" && (
                              <button
                                disabled={moderatingId !== null}
                                onClick={async () => {
                                  setModeratingId(reg._id);
                                  try {
                                    await api.put(`/hackathons/registrations/${reg._id || reg.id}/moderate`, { status: "Rejected" });
                                    // Refresh local list
                                    setMyHackRegistrations(prev =>
                                      prev.map(r => {
                                        const rId = r._id || r.id;
                                        const targetId = reg._id || reg.id;
                                        return String(rId) === String(targetId) ? { ...r, status: "Rejected" } : r;
                                      })
                                    );
                                    fetchMyHostedHackathons();
                                  } catch (err) {
                                    console.error("Moderation error:", err);
                                  } finally {
                                    setModeratingId(null);
                                  }
                                }}
                                className="flex-1 md:flex-initial px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white text-[10px] font-black flex items-center justify-center gap-1 transition cursor-pointer"
                              >
                                <FaTimes /> Reject
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>
    </PageLayout>
  );
}

export default Hackathons;
