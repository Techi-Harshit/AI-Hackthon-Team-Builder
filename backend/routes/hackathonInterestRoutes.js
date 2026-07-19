const express = require("express");
const protect = require("../middleware/authMiddleware");
const controller = require("../controllers/hackathonInterestController");

const router = express.Router();
router.post("/", protect, controller.createInterest);
router.get("/my", protect, controller.getMyInterests);
router.get("/discover", protect, controller.discoverInterestedUsers);
router.delete("/:id", protect, controller.deleteInterest);
router.get("/check/:id", protect, controller.checkInterest);

module.exports = router;
