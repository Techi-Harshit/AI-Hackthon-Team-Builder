const mongoose = require("mongoose");
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, ".env") });

const User = require("./models/User");
const Team = require("./models/Team");
const connectDB = require("./config/db");

const HACKATHON_ID = new mongoose.Types.ObjectId();

const teamTemplates = [
  {
    teamName: "CosmoQ Catalysts",
    description: "Building AI-enabled collaboration tooling for hackathon teams.",
    requiredSkills: ["React", "Node.js", "AI/ML"],
    requiredRole: "Full Stack",
    experienceRequired: "Intermediate",
    domain: "AI/ML",
    meetingSchedule: "Flexible",
    category: "AI/ML",
  },
  {
    teamName: "Hackathon Heroes",
    description: "Designing a streamlined team discovery experience.",
    requiredSkills: ["UI/UX", "JavaScript", "Figma"],
    requiredRole: "Frontend",
    experienceRequired: "Intermediate",
    domain: "Web Development",
    meetingSchedule: "Weekend",
    category: "Web Development",
  },
  {
    teamName: "Data Dynamo Squad",
    description: "Creating smart analytics for team performance tracking.",
    requiredSkills: ["Python", "Data Analysis", "MongoDB"],
    requiredRole: "Backend",
    experienceRequired: "Intermediate",
    domain: "Data Science",
    meetingSchedule: "Weekdays",
    category: "Data Science",
  },
  {
    teamName: "DevOps Dreamers",
    description: "Automating team deployment workflows using CI/CD.",
    requiredSkills: ["DevOps", "Docker", "Kubernetes"],
    requiredRole: "DevOps",
    experienceRequired: "Intermediate",
    domain: "DevOps",
    meetingSchedule: "Flexible",
    category: "DevOps",
  },
  {
    teamName: "Mobile Makers",
    description: "Crafting cross-platform mobile apps for hackathon success.",
    requiredSkills: ["React Native", "Flutter", "APIs"],
    requiredRole: "Mobile",
    experienceRequired: "Intermediate",
    domain: "Mobile",
    meetingSchedule: "Weekend",
    category: "Mobile",
  },
];

const generateTeamPayload = (template, leader, members) => ({
  teamName: template.teamName,
  description: template.description,
  hackathonId: HACKATHON_ID,
  leader: leader._id,
  members: [leader._id, ...members.map((m) => m._id)],
  requiredSkills: template.requiredSkills,
  maxMembers: members.length + 1,
  activityScore: Math.floor(Math.random() * 50) + 50,
  profileViews: Math.floor(Math.random() * 200) + 50,
  applicationsCount: Math.floor(Math.random() * 10),
  messagesCount: Math.floor(Math.random() * 20),
  membersCount: members.length + 1,
  hackathonsParticipated: Math.floor(Math.random() * 3),
  lastActiveAt: new Date(Date.now() - Math.floor(Math.random() * 7) * 24 * 3600 * 1000),
  requiredRole: template.requiredRole,
  experienceRequired: template.experienceRequired,
  domain: template.domain,
  meetingSchedule: template.meetingSchedule,
  status: "Open",
  remainingSlots: Math.max(0, template.maxMembers - members.length - 1),
  recruitmentStatus: "Recruiting",
  requiredRoles: [template.requiredRole],
  teamCompletion: Math.round(((members.length + 1) / (members.length + 1)) * 100),
  totalXP: Math.floor(Math.random() * 500),
  wins: Math.floor(Math.random() * 5),
  rating: parseFloat((Math.random() * 4 + 1).toFixed(1)),
  category: template.category,
  region: "India",
  activeStatus: "Active",
  lookingForMembers: members.length + 1 < 4,
  currentMembers: members.length + 1,
  teamStatus: "Active",
  isRecruiting: members.length + 1 < 4,
  visibility: "Public",
});

const run = async () => {
  await connectDB();
  console.log("Connected to MongoDB.");

  const users = await User.find({ email: /test\.user\./ }).sort({ createdAt: 1 }).lean();
  if (users.length < 20) {
    console.error("Need at least 20 seeded test users. Found:", users.length);
    process.exit(1);
  }

  const existingTeams = await Team.find({ teamName: { $regex: /CosmoQ|Hackathon Heroes|Data Dynamo|DevOps Dreamers|Mobile Makers/ } });
  if (existingTeams.length > 0) {
    console.log("Found existing seed teams, skipping creation.");
    process.exit(0);
  }

  const usedUserIds = new Set();
  const makeMemberGroup = (count) => {
    const members = [];
    for (const user of users) {
      if (usedUserIds.has(String(user._id))) continue;
      members.push(user);
      usedUserIds.add(String(user._id));
      if (members.length === count) break;
    }
    return members;
  };

  const teams = [];
  let teamIndex = 0;

  while (usedUserIds.size < 20 && teamIndex < teamTemplates.length) {
    const leader = users.find((u) => !usedUserIds.has(String(u._id)));
    if (!leader) break;
    usedUserIds.add(String(leader._id));

    const members = makeMemberGroup(2);
    const template = teamTemplates[teamIndex % teamTemplates.length];
    const teamPayload = generateTeamPayload(template, leader, members);
    teams.push(teamPayload);
    teamIndex += 1;
  }

  if (teams.length === 0) {
    console.error("No teams created. Please verify user data.");
    process.exit(1);
  }

  await Team.insertMany(teams);
  console.log(`Created ${teams.length} teams with unique members.`);
  process.exit(0);
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
