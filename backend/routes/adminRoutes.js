const express = require("express");
const router = express.Router();

const {
  registerAdmin,
  loginAdmin,
  getAdminProfile,
  getOrganizers,
  toggleVerifyOrganizer,
} = require("../controllers/adminController");

const adminProtect = require("../middleware/adminAuthMiddleware");

router.post("/register", registerAdmin);
router.post("/login", loginAdmin);
router.get("/profile", adminProtect, getAdminProfile);
router.get("/organizers", adminProtect, getOrganizers);
router.put("/organizers/:id/verify", adminProtect, toggleVerifyOrganizer);

module.exports = router;
