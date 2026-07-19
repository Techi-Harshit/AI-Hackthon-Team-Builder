import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FaBookmark, FaRegBookmark } from "react-icons/fa";
import api from "../../api/axios";
import toast from "react-hot-toast";

function BookmarkButton({
  itemId,
  bookmarkType,
  itemName,
  itemImage = "",
  itemDescription = "",
  category = "Favorites",
  tags = [],
  hackathonId = undefined,
  status = undefined,
  onToggle = null,
  className = ""
}) {
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let active = true;
    async function checkStatus() {
      if (!itemId) return;
      try {
        const res = await api.get(`/bookmarks/status/${itemId}`);
        if (active && res.data) {
          setIsBookmarked(res.data.bookmarked);
        }
      } catch (err) {
        console.error("Error checking bookmark status:", err);
      }
    }
    checkStatus();
    return () => {
      active = false;
    };
  }, [itemId]);

  const handleToggle = async (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (!itemId) return;

    setLoading(true);
    try {
      if (isBookmarked) {
        // Remove bookmark
        await api.delete(`/bookmarks/remove/${itemId}`);
        setIsBookmarked(false);
        toast.success("Bookmark Removed Successfully");
        if (onToggle) onToggle(itemId, false);
      } else {
        // Add bookmark
        const payload = {
          bookmarkType,
          itemId,
          itemName,
          itemImage,
          itemDescription,
          category,
          tags,
          hackathonId,
          status
        };
        await api.post("/bookmarks/add", payload);
        setIsBookmarked(true);
        toast.success("Bookmark Added Successfully");
        if (onToggle) onToggle(itemId, true);
      }
    } catch (err) {
      console.error("Error toggling bookmark:", err);
      toast.error(err.response?.data?.message || "Action failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.button
      whileHover={{ scale: 1.15 }}
      whileTap={{ scale: 0.9 }}
      onClick={handleToggle}
      disabled={loading}
      className={`p-2 rounded-xl bg-white/5 border border-white/10 hover:border-cyan-500/35 hover:bg-cyan-500/10 text-slate-400 hover:text-cyan-400 transition flex items-center justify-center ${className}`}
      title={isBookmarked ? "Remove Bookmark" : "Bookmark this"}
    >
      {isBookmarked ? (
        <FaBookmark className="text-cyan-400 animate-pulse" size={15} />
      ) : (
        <FaRegBookmark size={15} />
      )}
    </motion.button>
  );
}

export default BookmarkButton;
