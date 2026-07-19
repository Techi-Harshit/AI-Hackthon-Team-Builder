const express = require("express");
const cors = require ("cors");
const app =express();
const userRoutes=require("./routes/userRoutes");
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, ".env") });
const connectDB = require("./config/db");
app.use(cors());
app.use(express.json());
app.use("/api/users", userRoutes);
const hackathonRoutes = require(
  "./routes/hackathonRoutes"
);
app.use(
  "/api/hackathons",
  hackathonRoutes
);
app.use("/api/hackathon-interest", require("./routes/hackathonInterestRoutes"));

const teamRoutes = require(
  "./routes/teamRoutes"
);

app.use("/api/teams", teamRoutes);

const applicationRoutes = require(
  "./routes/applicationRoutes"
);

app.use(
  "/api/applications",
  applicationRoutes
);

const adminRoutes = require("./routes/adminRoutes");
app.use("/api/admin", adminRoutes);

const aiRoutes = require("./routes/aiRoutes");
app.use("/api/ai", aiRoutes);

const recommendationRoutes = require("./routes/recommendationRoutes");
app.use("/api/recommendations", recommendationRoutes);

const bookmarkRoutes = require("./routes/bookmarkRoutes");
app.use("/api/bookmarks", bookmarkRoutes);

const leaderboardRoutes = require("./routes/leaderboardRoutes");
app.use("/api/leaderboard", leaderboardRoutes);

app.get("/",(req,res)=>{
    res.send("Hack Team Backend Running");
});

const port = 5000;

const { initLeaderboardCron } = require("./cron/updateLeaderboard");

connectDB().then(() => {
  app.listen(port, () => {
    console.log(`Server Running on Port ${port}`);
    initLeaderboardCron();
  });
});



