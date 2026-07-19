const express = require("express");

const router = express.Router();
const protect = require("../middleware/authMiddleware");
const { optionalProtect } = require("../middleware/authMiddleware");

const {
  createHackathon,
  getHackathons,
  getHackathonById,
  registerForHackathon,
  toggleBookmarkHackathon,
  getOrganizerAnalytics,
  getAdminAnalytics,
  approveHackathon,
  rejectHackathon,
  toggleFeaturedHackathon,
  getMyRegistrations,
  submitProject,
  toggleOrganizerControl,
  getHackathonRegistrations,
  moderateRegistration,
  exportRegistrationsCsv,
  toggleInterest
} = require("../controllers/hackathonController");

router.post("/", protect, createHackathon);

router.get("/", optionalProtect, getHackathons);

router.get("/organizer/analytics", protect, getOrganizerAnalytics);

router.get("/admin/analytics", protect, getAdminAnalytics);

router.get("/user/registrations", protect, getMyRegistrations);

router.get("/:id", getHackathonById);

router.post("/:id/register", protect, registerForHackathon);

router.post("/:id/interest", protect, toggleInterest);

router.post("/:id/bookmark", protect, toggleBookmarkHackathon);

router.put("/:id/approve", protect, approveHackathon);

router.put("/:id/reject", protect, rejectHackathon);

router.put("/:id/feature", protect, toggleFeaturedHackathon);

router.put("/:id/organizer-control", protect, toggleOrganizerControl);

router.get("/:id/registrations", protect, getHackathonRegistrations);

router.put("/registrations/:id/moderate", protect, moderateRegistration);

router.get("/:id/export-csv", protect, exportRegistrationsCsv);

router.post("/registrations/:id/project", protect, submitProject);
module.exports = router;
