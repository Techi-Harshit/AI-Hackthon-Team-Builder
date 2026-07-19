const express = require("express");
const router = express.Router();

const {
  registerUser,
  loginUser,
  demoLogin,
  getProfile,
  updateProfile,
  getNotifications,
  markNotificationsRead,
  deleteNotification,
} = require("../controllers/userController");

const protect = require("../middleware/authMiddleware");

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/demo-login", demoLogin);

router.get("/profile", protect, getProfile);
router.put("/profile", protect, updateProfile);

router.get("/notifications", protect, getNotifications);
router.put("/notifications/read", protect, markNotificationsRead);
router.delete("/notifications/:notificationId", protect, deleteNotification);

module.exports = router;
