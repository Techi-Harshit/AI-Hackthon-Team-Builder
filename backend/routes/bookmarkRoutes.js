const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");

const {
  add,
  remove,
  all,
  statusCheck,
  stats,
  recent,
  hackathons,
  teams,
  projects,
  skills,
  organizers,
  companies,
  profiles,
  createFolder,
  deleteFolder,
  updateFolder,
  addBookmarkToFolder,
  removeBookmarkFromFolder,
  getFoldersList
} = require("../controllers/bookmarkController");

// Bookmark CRUD routes
router.post("/add", protect, add);
router.delete("/remove/:id", protect, remove);
router.get("/all", protect, all);
router.get("/status/:itemId", protect, statusCheck);
router.get("/stats", protect, stats);
router.get("/recent", protect, recent);

// Categorized bookmark filters
router.get("/hackathons", protect, hackathons);
router.get("/teams", protect, teams);
router.get("/projects", protect, projects);
router.get("/skills", protect, skills);
router.get("/organizers", protect, organizers);
router.get("/companies", protect, companies);
router.get("/profiles", protect, profiles);

// Bookmark Folder routes
router.post("/folder/create", protect, createFolder);
router.delete("/folder/delete", protect, deleteFolder);
router.put("/folder/update", protect, updateFolder);
router.post("/folder/add-item", protect, addBookmarkToFolder);
router.delete("/folder/remove-item", protect, removeBookmarkFromFolder);
router.get("/folders", protect, getFoldersList);

module.exports = router;
