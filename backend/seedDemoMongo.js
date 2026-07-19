require("dotenv").config();

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("./models/User");
const Hackathon = require("./models/Hackathon");
const Team = require("./models/Team");
const Application = require("./models/Application");
const HackathonInterest = require("./models/HackathonInterest");
const HackathonRegistration = require("./models/HackathonRegistration");
const RecommendationHistory = require("./models/RecommendationHistory");
const TeamMessage = require("./models/TeamMessage");
const Leaderboard = require("./models/Leaderboard");
const Bookmark = require("./models/Bookmark");
const BookmarkFolder = require("./models/BookmarkFolder");
const calculateCompatibility = require("./utils/calculateCompatibility");

const colleges = ["IIT Delhi", "IIT Bombay", "IIT Madras", "IIT Kanpur", "BITS Pilani", "IIIT Hyderabad", "NIT Trichy", "DTU", "VIT Vellore", "Manipal Institute of Technology", "Jadavpur University", "COEP Technological University"];
const names = ["Aarav Sharma", "Ananya Iyer", "Rohan Mehta", "Priya Nair", "Arjun Verma", "Kavya Reddy", "Ishaan Gupta", "Meera Joshi", "Vivaan Kapoor", "Diya Menon", "Aditya Rao", "Sneha Kulkarni", "Yash Malhotra", "Nisha Singh", "Kabir Bansal", "Aditi Chawla", "Dev Patel", "Riya Das", "Siddharth Jain", "Tanvi Shah"];
const roles = ["Frontend", "Backend", "Full Stack", "AI/ML", "UI/UX", "DevOps", "Blockchain", "Mobile"];
const domains = ["MERN Stack", "AI/ML", "Cloud Computing", "DevOps", "Cyber Security", "Flutter", "UI/UX", "Data Science"];
const skillSets = [["React", "JavaScript", "Tailwind CSS", "Figma"], ["Node.js", "Express", "MongoDB", "REST APIs"], ["React", "Node.js", "MongoDB", "TypeScript"], ["Python", "TensorFlow", "Pandas", "Machine Learning"], ["Figma", "User Research", "Prototyping", "Design Systems"], ["Docker", "Kubernetes", "AWS", "CI/CD"], ["Solidity", "Web3.js", "React", "Smart Contracts"], ["Flutter", "Dart", "Firebase", "Mobile UI"], ["Python", "SQL", "Power BI", "Data Visualization"], ["Linux", "Network Security", "OWASP", "Python"]];
const teamPrefixes = ["Byte", "Code", "Nova", "Pixel", "Cloud", "Quantum", "Stack", "Vision", "Data", "Secure"];
const teamSuffixes = ["Pioneers", "Builders", "Orbit", "Minds", "Squad", "Catalysts", "Crew", "Collective", "Labs", "Ninjas"];
const messageTexts = ["I have pushed the latest API changes. Please review the endpoints.", "Can we finalise the problem statement by tonight?", "I will prepare the Figma flow before our stand-up.", "The deployment pipeline is working on the staging branch.", "Great progress today. Let us split the remaining tasks for tomorrow.", "I added the dataset notes and evaluation metrics to the shared document.", "Please check the README and add your local setup steps.", "The hackathon mentor session starts at 7 PM, join if you can."];
const key = (userId, hackathonId) => `${userId}_${hackathonId}`;
const future = (days) => new Date(Date.now() + days * 24 * 60 * 60 * 1000);

async function cleanPreviousSeed() {
  const oldUsers = await User.find({ email: /@demo\.cosmoq\.in$/ }).select("_id").lean();
  const oldHackathons = await Hackathon.find({ slug: /^cosmoq-demo-/ }).select("_id").lean();
  const userIds = oldUsers.map((user) => user._id);
  const hackathonIds = oldHackathons.map((hackathon) => hackathon._id);
  const oldTeams = await Team.find({ $or: [{ leader: { $in: userIds } }, { hackathonId: { $in: hackathonIds } }] }).select("_id").lean();
  const teamIds = oldTeams.map((team) => team._id);

  await Promise.all([
    Application.deleteMany({ $or: [{ userId: { $in: userIds } }, { teamId: { $in: teamIds } }] }),
    HackathonInterest.deleteMany({ $or: [{ userId: { $in: userIds } }, { hackathonId: { $in: hackathonIds } }] }),
    HackathonRegistration.deleteMany({ $or: [{ userId: { $in: userIds } }, { hackathonId: { $in: hackathonIds } }, { teamId: { $in: teamIds } }] }),
    RecommendationHistory.deleteMany({ $or: [{ userId: { $in: userIds } }, { candidateId: { $in: userIds } }, { hackathonId: { $in: hackathonIds } }] }),
    TeamMessage.deleteMany({ teamId: { $in: teamIds } }),
    Leaderboard.deleteMany({ referenceId: { $in: [...userIds, ...teamIds] } }),
    Bookmark.deleteMany({ $or: [{ userId: { $in: userIds } }, { hackathonId: { $in: hackathonIds } }, { teamId: { $in: teamIds } }] }),
    BookmarkFolder.deleteMany({ userId: { $in: userIds } }),
  ]);
  await Team.deleteMany({ _id: { $in: teamIds } });
  await Hackathon.deleteMany({ _id: { $in: hackathonIds } });
  await User.deleteMany({ _id: { $in: userIds } });
}

async function seed() {
  if (!process.env.MONGO_URI) throw new Error("MONGO_URI is required to seed MongoDB.");
  await mongoose.connect(process.env.MONGO_URI);
  await cleanPreviousSeed();

  const password = await bcrypt.hash("Demo@123", 10);
  const userDocs = Array.from({ length: 100 }, (_, index) => {
    const role = roles[index % roles.length];
    const skills = skillSets[index % skillSets.length];
    const experience = ["Beginner", "Intermediate", "Advanced"][index % 3];
    return {
      name: `${names[index % names.length]} ${Math.floor(index / names.length) + 1}`,
      email: `student${String(index + 1).padStart(3, "0")}@demo.cosmoq.in`,
      password,
      college: colleges[index % colleges.length],
      branch: ["Computer Science", "Information Technology", "Electronics and Communication", "Artificial Intelligence and Data Science"][index % 4],
      year: (index % 4) + 1,
      skills,
      preferredRole: role,
      interests: [domains[index % domains.length], domains[(index + 3) % domains.length], "Hackathons"],
      interestedDomains: [domains[index % domains.length], domains[(index + 1) % domains.length]],
      availability: ["Weekdays", "Weekend", "Anytime"][index % 3],
      location: ["Bengaluru", "Delhi", "Mumbai", "Hyderabad", "Chennai", "Pune"][index % 6],
      github: `https://github.com/cosmoq-student-${index + 1}`,
      linkedin: `https://www.linkedin.com/in/cosmoq-student-${index + 1}`,
      resumeText: `Student developer focused on ${domains[index % domains.length]} and collaborative product building.`,
      bio: `Passionate ${role} student building practical technology for campus and community problems.`,
      experience,
      experienceLevel: experience,
      avatar: `https://i.pravatar.cc/300?img=${(index % 70) + 1}`,
      role: index % 17 === 0 ? "organizer" : "participant",
      lookingForTeam: index % 9 !== 0,
      trustScore: 58 + (index % 40),
      completedHackathons: index % 6,
      totalHackathons: 1 + (index % 8),
      totalXP: 250 + index * 37,
      rating: 3.8 + (index % 12) / 10,
      wins: index % 7 === 0 ? 1 : 0,
      hackathonsParticipated: 1 + (index % 7),
      hackathonsWon: index % 7 === 0 ? 1 : 0,
      projectsCompleted: 1 + (index % 5),
      profileViews: 20 + index * 3,
      profileCompletion: 100,
      badges: index % 7 === 0 ? ["Hackathon Winner"] : ["Active Builder"],
      region: "India",
      projects: [{ title: `${domains[index % domains.length]} Campus Project`, description: "A student-built prototype created for a campus problem statement." }],
    };
  });
  const users = await User.insertMany(userDocs);

  const hackathonDocs = Array.from({ length: 30 }, (_, index) => {
    const domain = domains[index % domains.length];
    const skills = skillSets[index % skillSets.length];
    const registrationDeadline = future(7 + index);
    const startDate = future(14 + index);
    return {
      title: `${["India", "Campus", "Future", "Build", "Innovate"][index % 5]} ${domain} Challenge ${2026 + Math.floor(index / 10)}`,
      slug: `cosmoq-demo-${index + 1}`,
      description: `A national student hackathon for building high-impact ${domain} solutions with mentors and industry judges.`,
      shortDescription: `Build a production-ready ${domain} project with India's student builder community.`,
      organizer: ["Microsoft Learn Student Ambassadors", "Google Developer Groups", "AWS User Group", "GitHub Campus Experts", "COSMOQ Community"][index % 5],
      category: domain,
      theme: `Solve real-world challenges using ${domain}.`,
      difficulty: ["Beginner", "Intermediate", "Advanced"][index % 3],
      mode: ["Online", "Hybrid", "Offline"][index % 3],
      onlineOffline: ["Online", "Hybrid", "Offline"][index % 3],
      location: ["Bengaluru", "Delhi", "Mumbai", "Hyderabad", "Chennai"][index % 5],
      registrationDeadline,
      startDate,
      endDate: future(16 + index),
      prizePool: `₹${(1 + (index % 8)) * 100000}`,
      prize: `₹${(1 + (index % 8)) * 100000}`,
      currency: "INR",
      teamSizeMin: 2,
      teamSizeMax: 3 + (index % 3),
      requiredSkills: skills,
      domains: [domain],
      techStack: skills,
      eligibility: "Open to undergraduate and postgraduate students in India.",
      problemStatements: [{ title: `${domain} for India`, description: `Build an inclusive and scalable ${domain} solution.` }],
      timeline: [{ title: "Registration closes", date: registrationDeadline, description: "Submit your team details." }, { title: "Hackathon begins", date: startDate, description: "Build and submit your solution." }],
      rules: ["Original work only", "Teams must meet the maximum size", "Submit before the deadline"],
      faqs: [{ question: "Can beginners participate?", answer: "Yes, all motivated students are welcome." }],
      judges: [{ name: "Radhika Menon", role: "Product Engineering Lead", avatar: "https://i.pravatar.cc/100?img=47" }],
      sponsors: [{ name: "COSMOQ", logo: "", tier: "Gold" }],
      contactEmail: `challenge${index + 1}@cosmoq.in`,
      website: "https://cosmoq.in",
      status: "Published",
      isFeatured: index % 5 === 0,
      isPinned: index % 10 === 0,
      isVerified: true,
      verified: true,
      badge: index % 5 === 0 ? "Featured" : "Open",
      badgeColor: index % 5 === 0 ? "purple" : "cyan",
      tags: [domain, skills[0], "Students"],
      hackathonType: "Student",
      isActive: true,
      lookingForMembers: true,
      createdBy: users[index % users.length]._id,
      approvedBy: users[(index + 1) % users.length]._id,
    };
  });
  const hackathons = await Hackathon.insertMany(hackathonDocs);

  const teamBlueprints = Array.from({ length: 50 }, (_, index) => ({
    hackathon: hackathons[index % hackathons.length],
    leader: users[index % users.length],
    memberIndexes: [(index + 11) % users.length, (index + 29) % users.length].filter((memberIndex) => memberIndex !== index % users.length),
  }));
  const interestPairs = new Set(teamBlueprints.map((blueprint) => key(blueprint.leader._id, blueprint.hackathon._id)));
  for (let index = 0; interestPairs.size < 150; index += 1) interestPairs.add(key(users[(index * 7 + 13) % users.length]._id, hackathons[(index * 11 + 5) % hackathons.length]._id));
  const interests = await HackathonInterest.insertMany([...interestPairs].map((pair, index) => {
    const [userId, hackathonId] = pair.split("_");
    const user = users.find((item) => String(item._id) === userId);
    const hackathon = hackathons.find((item) => String(item._id) === hackathonId);
    return { userId, hackathonId, hackathonName: hackathon.title, status: "Interested", skills: user.skills, role: user.preferredRole, experienceLevel: user.experience, interestedAt: future(-(index % 20)), isActive: true };
  }));
  const interestByPair = new Map(interests.map((interest) => [key(interest.userId, interest.hackathonId), interest]));

  const teams = await Team.insertMany(teamBlueprints.map((blueprint, index) => {
    const members = blueprint.memberIndexes.map((memberIndex) => users[memberIndex]._id);
    const hackathon = blueprint.hackathon;
    return {
      teamName: `${teamPrefixes[index % teamPrefixes.length]} ${teamSuffixes[index % teamSuffixes.length]}`,
      description: `A cross-college team building a practical ${hackathon.category} solution for ${hackathon.title}.`,
      hackathonId: hackathon._id,
      interestId: interestByPair.get(key(blueprint.leader._id, hackathon._id))._id,
      hackathonName: hackathon.title,
      leader: blueprint.leader._id,
      members,
      requiredSkills: hackathon.requiredSkills,
      requiredRoles: ["Frontend", "Backend", "AI/ML", "UI/UX"].slice(0, 2 + (index % 3)),
      maxMembers: hackathon.teamSizeMax,
      activityScore: 35 + (index % 60),
      profileViews: 20 + index * 6,
      messagesCount: 3 + (index % 12),
      membersCount: members.length + 1,
      currentMembers: members.length + 1,
      remainingSlots: Math.max(0, hackathon.teamSizeMax - members.length - 1),
      recruitmentStatus: hackathon.teamSizeMax - members.length - 1 <= 0 ? "Closed" : "Recruiting",
      teamCompletion: Math.round(((members.length + 1) / hackathon.teamSizeMax) * 100),
      requiredRole: roles[(index + 1) % roles.length],
      experienceRequired: ["Beginner", "Intermediate", "Advanced"][index % 3],
      domain: hackathon.category,
      meetingSchedule: ["Weekends, 6 PM", "Weekdays, 8 PM", "Flexible"][index % 3],
      status: index % 6 === 0 ? "Closed" : "Open",
      totalXP: 500 + index * 45,
      wins: index % 9 === 0 ? 1 : 0,
      rating: 3.9 + (index % 10) / 10,
      hackathonsParticipated: 1 + (index % 4),
      hackathonsWon: index % 9 === 0 ? 1 : 0,
      category: hackathon.category,
      region: "India",
      lookingForMembers: index % 6 !== 0,
      isRecruiting: index % 6 !== 0,
      visibility: "Public",
    };
  }));

  const registrationPairs = new Set();
  const registrationDocs = [];
  for (let index = 0; registrationDocs.length < 75; index += 1) {
    const team = teams[index % teams.length];
    const user = index < 50 ? users.find((item) => String(item._id) === String(team.leader)) : users[(index * 9 + 7) % users.length];
    const pair = key(user._id, team.hackathonId);
    if (registrationPairs.has(pair)) continue;
    registrationPairs.add(pair);
    registrationDocs.push({ hackathonId: team.hackathonId, userId: user._id, teamId: index < 50 ? team._id : undefined, registeredAsTeam: index < 50, registrationId: `COSMOQ-REG-${String(index + 1).padStart(4, "0")}`, teamName: index < 50 ? team.teamName : "", description: "Registered to build and collaborate during the hackathon.", college: user.college, country: "India", state: "Karnataka", city: user.location, leaderDetails: { name: user.name, email: user.email }, memberDetails: index < 50 ? (team.members || []).map((memberId) => { const member = users.find((item) => String(item._id) === String(memberId)); return { name: member.name, email: member.email, role: member.preferredRole, skills: member.skills, github: member.github, linkedin: member.linkedin, college: member.college, year: String(member.year), branch: member.branch, status: "Accepted" }; }) : [], status: index % 8 === 0 ? "Project Submission Pending" : "Registration Confirmed" });
  }
  const registrations = await HackathonRegistration.insertMany(registrationDocs);

  const applications = await Application.insertMany(Array.from({ length: 100 }, (_, index) => {
    const team = teams[index % teams.length];
    const excluded = new Set([String(team.leader), ...(team.members || []).map(String)]);
    const applicant = users.find((user) => !excluded.has(String(user._id)) && user.lookingForTeam) || users[(index + 35) % users.length];
    return { userId: applicant._id, teamId: team._id, message: `Hi, I would love to contribute my ${applicant.preferredRole} skills to ${team.teamName}.`, status: ["pending", "accepted", "rejected"][index % 3] };
  }));

  const recommendations = Array.from({ length: 300 }, (_, index) => {
    const team = teams[index % teams.length];
    const leader = users.find((user) => String(user._id) === String(team.leader));
    const excluded = new Set([String(team.leader), ...(team.members || []).map(String)]);
    const candidate = users.find((user) => !excluded.has(String(user._id))) || users[(index * 13 + 17) % users.length];
    const hackathon = hackathons.find((item) => String(item._id) === String(team.hackathonId));
    const teamRoles = (team.members || []).map((memberId) => users.find((user) => String(user._id) === String(memberId))?.preferredRole).filter(Boolean);
    const compatibility = calculateCompatibility(leader, { ...hackathon.toObject(), requiredSkills: team.requiredSkills }, candidate, teamRoles);
    return { userId: leader._id, candidateId: candidate._id, hackathonId: hackathon._id, compatibilityScore: compatibility.compatibilityScore, status: index % 7 === 0 ? "invited" : "viewed", feedback: index % 9 === 0 ? "Strong technical fit for this team." : "", rating: index % 9 === 0 ? 4 + (index % 2) : undefined };
  });
  await RecommendationHistory.insertMany(recommendations);

  await TeamMessage.insertMany(Array.from({ length: 200 }, (_, index) => {
    const team = teams[index % teams.length];
    const participantIds = [team.leader, ...(team.members || [])];
    const sender = users.find((user) => String(user._id) === String(participantIds[index % participantIds.length]));
    return { teamId: team._id, sender: sender.name, senderId: String(sender._id), avatar: sender.avatar, text: messageTexts[index % messageTexts.length], type: index % 19 === 0 ? "announcement" : "text", time: `${10 + (index % 10)}:${index % 2 ? "30" : "00"} ${index % 3 === 0 ? "PM" : "AM"}`, isMe: false };
  }));

  await Leaderboard.insertMany([...teams.slice(0, 25).map((team, index) => ({ type: "team", referenceId: team._id, currentRank: index + 1, lastMonthRank: Math.max(1, index + 2), seasonRank: index + 1, totalXP: team.totalXP, wins: team.wins, rating: team.rating, members: [team.leader, ...(team.members || [])], projectsCompleted: 1 + (index % 4), hackathonsWon: team.hackathonsWon, hackathonsParticipated: team.hackathonsParticipated, badges: index < 3 ? ["Top Team"] : ["Active Team"], category: team.category, region: "India", trend: index % 3 === 0 ? "+2" : "SAME", growthPercentage: 3 + index, season: 1, isActive: true })), ...users.slice(0, 25).map((user, index) => ({ type: "developer", referenceId: user._id, currentRank: index + 1, lastMonthRank: Math.max(1, index + 3), seasonRank: index + 1, totalXP: user.totalXP, wins: user.wins, rating: user.rating, members: [user._id], projectsCompleted: user.projectsCompleted, hackathonsWon: user.hackathonsWon, hackathonsParticipated: user.hackathonsParticipated, badges: user.badges, category: user.preferredRole, region: "India", trend: index % 4 === 0 ? "+3" : "SAME", growthPercentage: 2 + index, season: 1, isActive: true }))]);

  const folders = await BookmarkFolder.insertMany(Array.from({ length: 30 }, (_, index) => ({ userId: users[index]._id, folderName: ["AI & Data", "Hackathon Ideas", "Teams to Watch"][index % 3], description: "Saved opportunities for the next build sprint.", bookmarks: [] })));
  const bookmarks = await Bookmark.insertMany(Array.from({ length: 100 }, (_, index) => {
    const ownerIndex = index % 30;
    const round = Math.floor(index / 30);
    const useTeam = round % 2 === 1;
    const target = useTeam ? teams[(ownerIndex * 3 + round) % teams.length] : hackathons[(ownerIndex * 3 + round) % hackathons.length];
    return { userId: users[ownerIndex]._id, bookmarkType: useTeam ? "team" : "hackathon", itemId: String(target._id), itemName: useTeam ? target.teamName : target.title, itemDescription: useTeam ? target.description : target.shortDescription, category: folders[ownerIndex].folderName, teamId: useTeam ? target._id : undefined, hackathonId: useTeam ? undefined : target._id, tags: useTeam ? target.requiredSkills.slice(0, 2) : target.tags, folderName: folders[ownerIndex].folderName, status: "saved" };
  }));
  await Promise.all(folders.map((folder, index) => BookmarkFolder.updateOne({ _id: folder._id }, { $set: { bookmarks: bookmarks.filter((bookmark) => String(bookmark.userId) === String(users[index]._id)).map((bookmark) => bookmark._id) } })));

  const userHackathons = new Map(users.map((user) => [String(user._id), { registered: [], interested: [] }]));
  registrations.forEach((registration) => userHackathons.get(String(registration.userId)).registered.push(registration.hackathonId));
  interests.forEach((interest) => userHackathons.get(String(interest.userId)).interested.push(interest.hackathonId));
  await Promise.all(users.map((user) => User.updateOne({ _id: user._id }, { $set: { registeredHackathons: userHackathons.get(String(user._id)).registered, interestedHackathons: userHackathons.get(String(user._id)).interested } })));
  await Promise.all(hackathons.map((hackathon) => Hackathon.updateOne({ _id: hackathon._id }, { $set: { interestCount: interests.filter((interest) => String(interest.hackathonId) === String(hackathon._id)).length, teamCount: teams.filter((team) => String(team.hackathonId) === String(hackathon._id)).length, registeredTeams: teams.filter((team) => String(team.hackathonId) === String(hackathon._id)).map((team) => String(team._id)), participants: String(registrations.filter((registration) => String(registration.hackathonId) === String(hackathon._id)).length) } })));
  await Promise.all(teams.map((team) => Team.updateOne({ _id: team._id }, { $set: { applicationsCount: applications.filter((application) => String(application.teamId) === String(team._id)).length } })));

  console.log("MongoDB demo data seeded successfully.");
  await mongoose.disconnect();
}

seed().catch(async (error) => {
  console.error(error);
  await mongoose.disconnect();
  process.exit(1);
});
