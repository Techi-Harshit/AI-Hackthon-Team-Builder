import { useState, useEffect, useMemo } from "react";
import PageLayout from "../components/dashboard/PageLayout";
import BookmarksHero from "../components/bookmarks/BookmarksHero";
import BookmarksCategories from "../components/bookmarks/BookmarksCategories";
import SavedHackathons from "../components/bookmarks/SavedHackathons";
import SavedTeams from "../components/bookmarks/SavedTeams";
import BookmarksOverview from "../components/bookmarks/BookmarksOverview";
import MyFolders from "../components/bookmarks/MyFolders";
import RecentlyBookmarked from "../components/bookmarks/RecentlyBookmarked";
import api from "../api/axios";
import toast from "react-hot-toast";
import { FaTrash, FaBookmark, FaFolder } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

function Bookmarks() {
  const [bookmarks, setBookmarks] = useState([]);
  const [stats, setStats] = useState({ total: 0, counts: {} });
  const [folders, setFolders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter states
  const [searchValue, setSearchValue] = useState("");
  const [activeType, setActiveType] = useState("all");
  const [activeFolder, setActiveFolder] = useState(null);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      const [bRes, sRes, fRes] = await Promise.all([
        api.get("/bookmarks/all"),
        api.get("/bookmarks/stats"),
        api.get("/bookmarks/folders")
      ]);

      setBookmarks(bRes.data.bookmarks || []);
      setStats(sRes.data || { total: 0, counts: {} });
      setFolders(fRes.data.folders || []);
    } catch (err) {
      console.error("Error loading bookmarks list:", err);
      toast.error("Failed to load bookmarks.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchAllData();
  }, []);

  // Remove Bookmark Handler
  const handleRemoveBookmark = async (itemId) => {
    try {
      await api.delete(`/bookmarks/remove/${itemId}`);
      toast.success("Bookmark Removed Successfully");
      // Reload stats and bookmarks list
      fetchAllData();
    } catch (err) {
      console.error("Error removing bookmark:", err);
      toast.error("Could not remove bookmark.");
    }
  };

  // Folder Management Handlers
  const handleCreateFolder = async (folderName) => {
    try {
      await api.post("/bookmarks/folder/create", { folderName });
      toast.success("Folder Created Successfully");
      fetchAllData();
    } catch (err) {
      console.error("Error creating folder:", err);
      toast.error(err.response?.data?.message || "Could not create folder.");
    }
  };

  const handleDeleteFolder = async (folderName) => {
    try {
      await api.delete("/bookmarks/folder/delete", { data: { folderName } });
      toast.success("Folder Deleted Successfully");
      fetchAllData();
      if (activeFolder === folderName) {
        setActiveFolder(null);
      }
    } catch (err) {
      console.error("Error deleting folder:", err);
      toast.error("Could not delete folder.");
    }
  };

  const handleMoveToFolder = async (folderName, bookmarkId) => {
    try {
      await api.post("/bookmarks/folder/add-item", { folderName, bookmarkId });
      toast.success("Moved Successfully");
      fetchAllData();
    } catch (err) {
      console.error("Error moving item to folder:", err);
      toast.error("Could not move bookmark.");
    }
  };

  // Dynamic filter processing with useMemo
  const filteredBookmarks = useMemo(() => {
    let list = bookmarks;

    // Filter by type selection
    if (activeType && activeType !== "all") {
      list = list.filter(b => b.bookmarkType === activeType);
    }

    // Filter by folderName selection
    if (activeFolder) {
      // Find the folder object to map item IDs
      const targetFolder = folders.find(f => f.folderName === activeFolder);
      if (targetFolder) {
        const itemIdsInFolder = (targetFolder.bookmarks || []).map(b => String(b._id || b));
        list = list.filter(b => itemIdsInFolder.includes(String(b.id || b._id)));
      } else {
        list = [];
      }
    }

    // Search query mapping
    if (searchValue.trim()) {
      const q = searchValue.toLowerCase().trim();
      list = list.filter(b =>
        b.itemName?.toLowerCase().includes(q) ||
        b.itemDescription?.toLowerCase().includes(q) ||
        (b.tags || []).some(t => t.toLowerCase().includes(q))
      );
    }

    return list;
  }, [bookmarks, activeType, activeFolder, searchValue, folders]);

  // Extract subsets for cards
  const savedHackathonsList = useMemo(() => {
    return filteredBookmarks.filter(b => b.bookmarkType === "hackathon");
  }, [filteredBookmarks]);

  const savedTeamsList = useMemo(() => {
    return filteredBookmarks.filter(b => b.bookmarkType === "team");
  }, [filteredBookmarks]);

  // Generic items grid list for projects, skills, companies, profiles etc.
  const savedOtherList = useMemo(() => {
    return filteredBookmarks.filter(b => b.bookmarkType !== "hackathon" && b.bookmarkType !== "team");
  }, [filteredBookmarks]);

  const recentList = useMemo(() => {
    return bookmarks.slice(0, 10);
  }, [bookmarks]);

  return (
    <PageLayout activePage="Bookmarks">
      <div className="p-8">
        {/* Header Title Hero Section */}
        <BookmarksHero
          searchValue={searchValue}
          onSearchChange={setSearchValue}
          activeFilter={activeType}
          onFilterClick={setActiveType}
        />

        {/* Bookmarks dynamic categories pills */}
        <BookmarksCategories
          stats={stats}
          activeType={activeType}
          onTypeChange={(type) => {
            setActiveType(type);
            setActiveFolder(null); // Reset folder filter when changing type
          }}
        />

        {loading ? (
          <div className="flex items-center justify-center min-h-[40vh]">
            <div className="w-10 h-10 border-2 border-[#3B82F6]/30 border-t-[#3B82F6] rounded-full animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-4">
            
            {/* Left Column (Saved list outputs) */}
            <div className="lg:col-span-2 space-y-8">
              
              {/* Folder Breadcrumb Indicator */}
              {activeFolder && (
                <div className="flex items-center justify-between p-4 rounded-2xl bg-[#FF8A00]/10 border border-[#FF8A00]/25 text-left">
                  <div className="flex items-center gap-2">
                    <FaFolder className="text-[#FF8A00]" />
                    <span className="text-xs font-bold text-gray-250 font-mono">
                      Active Folder: <span className="text-cyan-300">{activeFolder}</span>
                    </span>
                  </div>
                  <button
                    onClick={() => setActiveFolder(null)}
                    className="text-2xs text-[#3B82F6] hover:text-cyan-300 font-mono"
                  >
                    Clear Filter
                  </button>
                </div>
              )}

              {/* Saved Hackathons scroller list */}
              {(activeType === "all" || activeType === "hackathon") && (
                <SavedHackathons
                  bookmarks={savedHackathonsList}
                  onRemove={handleRemoveBookmark}
                />
              )}

              {/* Saved Teams row list */}
              {(activeType === "all" || activeType === "team") && (
                <SavedTeams
                  bookmarks={savedTeamsList}
                  onRemove={handleRemoveBookmark}
                />
              )}

              {/* Generic listing grid for remaining types */}
              {savedOtherList.length > 0 && (
                <div className="space-y-4 text-left">
                  <h3 className="text-lg font-bold text-white heading-font flex items-center gap-2">
                    <span>Saved Other Items</span>
                    <span className="text-xs bg-[#0e1222] text-slate-350 px-2 py-0.5 rounded-md font-mono">
                      {savedOtherList.length}
                    </span>
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {savedOtherList.map((item) => (
                      <motion.div
                        key={item.id}
                        whileHover={{ y: -4, borderColor: "rgba(168, 85, 247, 0.45)" }}
                        className="rounded-2xl border border-white/5 bg-[#050816]/50 p-4 flex flex-col justify-between group relative overflow-hidden transition-all duration-300"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-lg">
                              {item.bookmarkType === "skill" ? "🎯" : item.bookmarkType === "profile" ? "👤" : "💼"}
                            </div>
                            <div className="min-w-0">
                              <h4 className="font-extrabold text-white text-xs sm:text-sm truncate group-hover:text-cyan-300 transition-colors">
                                {item.itemName}
                              </h4>
                              <span className="inline-block mt-0.5 px-1.5 py-0.5 rounded text-[8px] font-extrabold uppercase bg-purple-500/10 text-cyan-300 border border-white/5">
                                {item.bookmarkType}
                              </span>
                            </div>
                          </div>

                          <motion.button
                            whileHover={{ scale: 1.15 }}
                            onClick={() => handleRemoveBookmark(item.itemId)}
                            className="text-cyan-400 hover:text-red-400 transition-colors"
                            title="Remove Bookmark"
                          >
                            <FaBookmark className="text-xs" />
                          </motion.button>
                        </div>

                        {item.itemDescription && (
                          <p className="text-[10px] text-gray-400 mt-3 truncate">{item.itemDescription}</p>
                        )}

                        {/* Folder placement dropdown selection */}
                        <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-2xs">
                          <span className="text-gray-500 font-mono">Move to Folder:</span>
                          <select
                            onChange={(e) => {
                              if (e.target.value) {
                                handleMoveToFolder(e.target.value, item.id);
                                e.target.value = "";
                              }
                            }}
                            className="bg-[#050816] border border-white/5 text-gray-300 rounded-lg px-2 py-1 outline-none text-2xs max-w-[120px] font-mono"
                          >
                            <option value="">Select Folder</option>
                            {folders.map(f => (
                              <option key={f._id} value={f.folderName}>{f.folderName}</option>
                            ))}
                          </select>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {/* Global Empty State Indicator */}
              {filteredBookmarks.length === 0 && (
                <div className="rounded-3xl border border-white/5 bg-[#050816]/30 p-12 text-center flex flex-col items-center justify-center min-h-[250px] relative overflow-hidden">
                  <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 mb-3">
                    🔍
                  </div>
                  <h4 className="text-sm font-bold text-gray-250 mb-1">No Saved Bookmarks Found</h4>
                  <p className="text-2xs text-slate-500 max-w-xs leading-relaxed">
                    Try adjusting your search filters or browse pages to bookmark items.
                  </p>
                </div>
              )}

            </div>

            {/* Right Column (Overview, Folder directories, Recently saved list) */}
            <div className="space-y-6">
              {/* Dynamic Overview Doughnut Chart */}
              <BookmarksOverview stats={stats} />

              {/* Folders Management Lists */}
              <MyFolders
                folders={folders}
                activeFolder={activeFolder}
                onSelectFolder={setActiveFolder}
                onCreateFolder={handleCreateFolder}
                onDeleteFolder={handleDeleteFolder}
              />

              {/* Recently saved bookmarks */}
              <RecentlyBookmarked
                bookmarks={recentList}
                onRemove={handleRemoveBookmark}
              />
            </div>

          </div>
        )}
      </div>
    </PageLayout>
  );
}

export default Bookmarks;
