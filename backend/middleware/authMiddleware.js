const jwt = require("jsonwebtoken");
const User = require("../models/User");

const protect = async (req, res, next) => {
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
          return res.status(401).json({
            message: "Not Authorized",
          });
        }
        const { password, ...userWithoutPassword } = user;
        req.user = userWithoutPassword;
        return next();
      }

      req.user = await User.findById(decoded.id).select(
        "-password"
      );

      next();
    } catch (error) {
      return res.status(401).json({
        message: "Not Authorized",
      });
    }
  }

  if (!token) {
    return res.status(401).json({
      message: "No Token",
    });
  }
};

// Catalog endpoints remain public, but can enrich results for a signed-in user.
const optionalProtect = async (req, res, next) => {
  const authorization = req.headers.authorization;
  if (!authorization || !authorization.startsWith("Bearer ")) return next();

  try {
    const token = authorization.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "harshit_hackteam_secret_2026");
    if (global.dbMode === "json") {
      const { readCollection } = require("../utils/jsonDb");
      const user = (readCollection("users") || []).find((item) => item._id === decoded.id);
      if (user) {
        const { password, ...userWithoutPassword } = user;
        req.user = userWithoutPassword;
      }
    } else {
      req.user = await User.findById(decoded.id).select("-password");
    }
  } catch (_) {
    // An invalid optional token must not make the public catalog unavailable.
  }
  next();
};

module.exports = protect;
module.exports.optionalProtect = optionalProtect;
