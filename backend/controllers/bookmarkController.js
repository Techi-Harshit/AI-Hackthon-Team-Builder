const bookmarkService = require("../services/bookmarkService");
const { cleanBookmarkData } = require("../utils/bookmarkHelpers");

// POST /api/bookmarks/add
const add = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const {
      bookmarkType,
      itemId,
      itemName,
      itemImage,
      itemDescription,
      category,
      hackathonId,
      teamId,
      projectId,
      organizerId,
      companyId,
      profileId,
      skillName,
      status,
      tags,
      folderName
    } = req.body;

    if (!bookmarkType || !itemId || !itemName) {
      return res.status(400).json({ success: false, message: "bookmarkType, itemId, and itemName are required." });
    }

    const data = {
      bookmarkType,
      itemId,
      itemName,
      itemImage,
      itemDescription,
      category: category || "Favorites",
      hackathonId,
      teamId,
      projectId,
      organizerId,
      companyId,
      profileId,
      skillName,
      status,
      tags: tags || [],
      folderName
    };

    const saved = await bookmarkService.addBookmark(userId, data);
    res.status(201).json({ success: true, message: "Bookmark Added Successfully", bookmark: cleanBookmarkData(saved) });
  } catch (error) {
    console.error("Bookmark add error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// DELETE /api/bookmarks/remove/:id
const remove = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const { id } = req.params;

    const removed = await bookmarkService.removeBookmark(userId, id);
    if (!removed) {
      return res.status(404).json({ success: false, message: "Bookmark not found." });
    }

    res.status(200).json({ success: true, message: "Bookmark Removed Successfully" });
  } catch (error) {
    console.error("Bookmark remove error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/bookmarks/all
const all = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const list = await bookmarkService.getBookmarks(userId);
    res.status(200).json({ success: true, bookmarks: list.map(cleanBookmarkData) });
  } catch (error) {
    console.error("Bookmark all error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/bookmarks/status/:itemId
const statusCheck = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const { itemId } = req.params;

    const list = await bookmarkService.getBookmarks(userId, { itemId });
    const exists = list.length > 0;
    
    res.status(200).json({ 
      success: true, 
      bookmarked: exists, 
      bookmark: exists ? cleanBookmarkData(list[0]) : null 
    });
  } catch (error) {
    console.error("Bookmark status error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/bookmarks/stats
const stats = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const list = await bookmarkService.getBookmarks(userId);

    const counts = {
      hackathons: 0,
      teams: 0,
      projects: 0,
      skills: 0,
      companies: 0,
      profiles: 0,
      organizers: 0,
      opportunities: 0
    };

    list.forEach(b => {
      const type = b.bookmarkType;
      if (type === "hackathon") counts.hackathons++;
      else if (type === "team") counts.teams++;
      else if (type === "project") counts.projects++;
      else if (type === "skill") counts.skills++;
      else if (type === "company") counts.companies++;
      else if (type === "profile") counts.profiles++;
      else if (type === "organizer") counts.organizers++;
      else if (type === "opportunity") counts.opportunities++;
    });

    res.status(200).json({ 
      success: true, 
      counts,
      total: list.length
    });
  } catch (error) {
    console.error("Bookmark stats error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/bookmarks/recent
const recent = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const list = await bookmarkService.getBookmarks(userId);
    const sorted = list.slice(0, 10).map(cleanBookmarkData);
    res.status(200).json({ success: true, bookmarks: sorted });
  } catch (error) {
    console.error("Bookmark recent error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Type-specific filters
const getByType = (type) => async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const list = await bookmarkService.getBookmarks(userId, { bookmarkType: type });
    res.status(200).json({ success: true, bookmarks: list.map(cleanBookmarkData) });
  } catch (error) {
    console.error(`Bookmark type ${type} error:`, error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Folder specific controllers
const createFolder = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const { folderName, description } = req.body;

    if (!folderName) {
      return res.status(400).json({ success: false, message: "folderName is required." });
    }

    const folder = await bookmarkService.createFolder(userId, folderName, description);
    res.status(201).json({ success: true, message: "Folder Created Successfully", folder });
  } catch (error) {
    console.error("Folder create error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const deleteFolder = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const { folderName } = req.body;

    if (!folderName) {
      return res.status(400).json({ success: false, message: "folderName is required." });
    }

    const deleted = await bookmarkService.deleteFolder(userId, folderName);
    if (!deleted) {
      return res.status(404).json({ success: false, message: "Folder not found." });
    }

    res.status(200).json({ success: true, message: "Folder Deleted Successfully" });
  } catch (error) {
    console.error("Folder delete error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateFolder = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const { oldName, newName, description } = req.body;

    if (!oldName) {
      return res.status(400).json({ success: false, message: "oldName is required." });
    }

    const folder = await bookmarkService.updateFolder(userId, oldName, newName, description);
    res.status(200).json({ success: true, message: "Folder Updated Successfully", folder });
  } catch (error) {
    console.error("Folder update error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const addBookmarkToFolder = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const { folderName, bookmarkId } = req.body;

    if (!folderName || !bookmarkId) {
      return res.status(400).json({ success: false, message: "folderName and bookmarkId are required." });
    }

    const folder = await bookmarkService.addBookmarkToFolder(userId, folderName, bookmarkId);
    res.status(200).json({ success: true, message: "Moved Successfully", folder });
  } catch (error) {
    console.error("Folder add item error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const removeBookmarkFromFolder = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const { folderName, bookmarkId } = req.body;

    if (!folderName || !bookmarkId) {
      return res.status(400).json({ success: false, message: "folderName and bookmarkId are required." });
    }

    const folder = await bookmarkService.removeBookmarkFromFolder(userId, folderName, bookmarkId);
    res.status(200).json({ success: true, message: "Bookmark removed from folder successfully", folder });
  } catch (error) {
    console.error("Folder remove item error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const getFoldersList = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const folders = await bookmarkService.getFolders(userId);
    res.status(200).json({ success: true, folders });
  } catch (error) {
    console.error("Folders fetch error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  add,
  remove,
  all,
  statusCheck,
  stats,
  recent,
  hackathons: getByType("hackathon"),
  teams: getByType("team"),
  projects: getByType("project"),
  skills: getByType("skill"),
  organizers: getByType("organizer"),
  companies: getByType("company"),
  profiles: getByType("profile"),
  createFolder,
  deleteFolder,
  updateFolder,
  addBookmarkToFolder,
  removeBookmarkFromFolder,
  getFoldersList
};
