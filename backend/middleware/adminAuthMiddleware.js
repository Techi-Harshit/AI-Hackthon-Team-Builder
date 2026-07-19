const jwt = require("jsonwebtoken");
const User = require("../models/User");

const adminProtect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];

      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || "harshit_hackteam_secret_2026"
      );

      if (global.dbMode === "json") {
        const { readCollection } = require("../utils/jsonDb");
        const users = readCollection("users");
        const user = users.find((u) => u._id === decoded.id);

        if (!user) {
          return res.status(401).json({ message: "Not authorized, user not found" });
        }

        if (user.role !== "admin") {
          return res.status(403).json({ message: "Not authorized as an admin" });
        }

        req.user = user;
        return next();
      }

      const user = await User.findById(decoded.id).select("-password");

      if (!user) {
        return res.status(401).json({ message: "Not authorized, user not found" });
      }

      if (user.role !== "admin") {
        return res.status(403).json({ message: "Not authorized as an admin" });
      }

      req.user = user;
      next();
    } catch (error) {
      console.error(error);
      res.status(401).json({ message: "Not authorized, token failed" });
    }
  }

  if (!token) {
    res.status(401).json({ message: "Not authorized, no token" });
  }
};

module.exports = adminProtect;
