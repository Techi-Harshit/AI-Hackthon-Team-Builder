const express = require("express");

const router = express.Router();

const protect = require(
  "../middleware/authMiddleware"
);

const {
  createApplication,
  getTeamApplications,
  acceptApplication,
  rejectApplication,
} = require(
  "../controllers/applicationController"
);

router.post(
  "/",
  protect,
  createApplication
);

router.get(
  "/team/:teamId",
  protect,
  getTeamApplications
);

router.put(
  "/:id/accept",
  protect,
  acceptApplication
);

router.put(
  "/:id/reject",
  protect,
  rejectApplication
);

module.exports = router;