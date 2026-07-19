require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const User = require("./models/User");
const Hackathon = require("./models/Hackathon");
const Team = require("./models/Team");

const { readCollection, writeCollection } = require("./utils/jsonDb");

// 1. Mock Users Data
const mockUsersData = [
  {
    name: "Rohan Gupta",
    email: "rohan.gupta@gmail.com",
    preferredRole: "Backend",
    skills: ["Node.js", "Express", "PostgreSQL", "Redis", "Docker"],
    interests: ["Finance", "Payment Systems", "Performance Tuning"],
    experience: "Advanced",
    college: "Delhi Technological University",
    year: 4,
    branch: "Computer Science",
    bio: "Passionate backend engineer who builds high-throughput microservices. Docker lover.",
    availability: "Anytime",
    trustScore: 88,
    profileCompletion: 90,
    lookingForTeam: true,
  },
  {
    name: "Ananya Sharma",
    email: "ananya.sharma@gmail.com",
    preferredRole: "Frontend",
    skills: ["React", "TypeScript", "Tailwind CSS", "Next.js", "Redux"],
    interests: ["UI/UX", "Web3", "SaaS Analytics"],
    experience: "Intermediate",
    college: "IIT Bombay",
    year: 3,
    branch: "Electrical Engineering",
    bio: "Frontend dev focusing on sleek animations, clean components, and intuitive UX flows.",
    availability: "Weekdays",
    trustScore: 92,
    profileCompletion: 85,
    lookingForTeam: true,
  },
  {
    name: "Kabir Verma",
    email: "kabir.verma@gmail.com",
    preferredRole: "AI/ML",
    skills: ["Python", "PyTorch", "TensorFlow", "Pandas", "NLP", "OpenAI API"],
    interests: ["AI Analytics", "Healthcare", "Large Language Models"],
    experience: "Advanced",
    college: "IIIT Hyderabad",
    year: 3,
    branch: "Artificial Intelligence",
    bio: "ML Research Intern. Building agentic workflows and fine-tuning transformer models.",
    availability: "Anytime",
    trustScore: 85,
    profileCompletion: 95,
    lookingForTeam: true,
  },
  {
    name: "Simran Kaur",
    email: "simran.kaur@gmail.com",
    preferredRole: "UI/UX",
    skills: ["Figma", "Adobe XD", "CSS", "HTML", "Framer Motion"],
    interests: ["Sustainability", "Mobile Apps", "Interactive Design"],
    experience: "Intermediate",
    college: "NIFT Delhi",
    year: 4,
    branch: "Design",
    bio: "Designing interfaces that tell stories. 2x hackathon winner in design categories.",
    availability: "Weekend",
    trustScore: 90,
    profileCompletion: 80,
    lookingForTeam: true,
  },
  {
    name: "Aditya Sen",
    email: "aditya.sen@gmail.com",
    preferredRole: "Full Stack",
    skills: ["Next.js", "Go", "MongoDB", "Redis", "TypeScript", "Docker"],
    interests: ["CyberSecurity", "Cloud Tech", "SaaS Platforms"],
    experience: "Advanced",
    college: "BITS Pilani",
    year: 4,
    branch: "Information Systems",
    bio: "Full stack wizard who builds scalable web apps from idea to deployment in 24 hours.",
    availability: "Anytime",
    trustScore: 95,
    profileCompletion: 100,
    lookingForTeam: true,
  },
  {
    name: "Riya Das",
    email: "riya.das@gmail.com",
    preferredRole: "Mobile",
    skills: ["Flutter", "Dart", "Firebase", "iOS", "Android", "Swift"],
    interests: ["HealthTech", "Social Networking", "E-commerce"],
    experience: "Intermediate",
    college: "VIT Vellore",
    year: 3,
    branch: "Computer Science",
    bio: "Building cross-platform mobile apps with native feels and fluid user transitions.",
    availability: "Weekdays",
    trustScore: 84,
    profileCompletion: 78,
    lookingForTeam: true,
  },
  {
    name: "Devansh Joshi",
    email: "devansh.joshi@gmail.com",
    preferredRole: "DevOps",
    skills: ["Docker", "Kubernetes", "AWS", "CI/CD", "Nginx", "GitHub Actions"],
    interests: ["Infrastructure", "Cloud Security", "Automation Systems"],
    experience: "Advanced",
    college: "NSUT Delhi",
    year: 4,
    branch: "Instrumentation Control",
    bio: "Keeping servers alive and automating testing-deployment pipelines. Infrastructure as code enthusiast.",
    availability: "Anytime",
    trustScore: 91,
    profileCompletion: 88,
    lookingForTeam: true,
  },
  {
    name: "Meera Nair",
    email: "meera.nair@gmail.com",
    preferredRole: "AI/ML",
    skills: ["Python", "Scikit-Learn", "Computer Vision", "OpenCV", "TensorFlow"],
    interests: ["Climate Tech", "Object Detection", "Smart Agriculture"],
    experience: "Intermediate",
    college: "SRM University",
    year: 3,
    branch: "Software Engineering",
    bio: "Using computer vision models to solve sustainability and smart agriculture problems.",
    availability: "Weekend",
    trustScore: 87,
    profileCompletion: 83,
    lookingForTeam: true,
  },
  {
    name: "Yash Singhal",
    email: "yash.singhal@gmail.com",
    preferredRole: "Blockchain",
    skills: ["Solidity", "Rust", "Ethereum", "Web3.js", "Hardhat", "Go"],
    interests: ["DeFi", "Smart Contracts", "DAOs"],
    experience: "Advanced",
    college: "IIT Delhi",
    year: 4,
    branch: "Mathematics & Computing",
    bio: "Auditing smart contracts and building decentralized finance products. Gas optimization nerd.",
    availability: "Anytime",
    trustScore: 89,
    profileCompletion: 92,
    lookingForTeam: true,
  },
  {
    name: "Sneha Iyer",
    email: "sneha.iyer@gmail.com",
    preferredRole: "Backend",
    skills: ["Java", "Spring Boot", "MySQL", "Docker", "REST APIs", "AWS"],
    interests: ["CyberSecurity", "Authentication Protocols", "Cloud Architecture"],
    experience: "Intermediate",
    college: "RVCE Bangalore",
    year: 3,
    branch: "Information Science",
    bio: "Strong Spring Boot developer focusing on JWT auth protocols and cloud database management.",
    availability: "Weekdays",
    trustScore: 86,
    profileCompletion: 84,
    lookingForTeam: true,
  }
];

// 2. Mock Hackathons Data
const mockHackathonsData = [
  {
    title: "EthIndia Web3 Hackathon",
    description: "The biggest Web3 and Ethereum hackathon in India. Build decentralized finance, DAO management tools, or NFT utility layers.",
    theme: "Blockchain & Decentralization",
    organizer: "Devfolio Community",
    requiredSkills: ["Solidity", "Ethereum", "Web3.js", "React", "Rust"],
    prizePool: "₹5,00,000",
    status: "Approved",
    teamSizeMin: 2,
    teamSizeMax: 4,
    difficulty: "Advanced",
    category: "Blockchain",
    tags: ["DeFi", "DAOs", "Ethereum", "NFTs"],
    badge: "Registration Open",
    badgeColor: "amber",
    logo: "⛓️",
    logoBg: "from-amber-500 to-orange-600",
    verified: true,
    date: "Dec 18 - Dec 20, 2026",
    mode: "Offline",
    participants: 1200,
    startDate: new Date("2026-12-18"),
    endDate: new Date("2026-12-20"),
    registrationDeadline: new Date("2026-12-17")
  },
  {
    title: "FinTech Innovation Summit",
    description: "Build robust payment integrations, micro-investment tools, security layers, or SaaS dashboards centered around core FinTech APIs.",
    theme: "Finance & Micro-payments",
    organizer: "Razorpay Devs",
    requiredSkills: ["Node.js", "Express", "PostgreSQL", "React", "Redis"],
    prizePool: "₹3,50,000",
    status: "Approved",
    teamSizeMin: 2,
    teamSizeMax: 4,
    difficulty: "Intermediate",
    category: "Finance",
    tags: ["Payments", "Security", "SaaS", "APIs"],
    badge: "Registration Open",
    badgeColor: "blue",
    logo: "💳",
    logoBg: "from-blue-500 to-indigo-600",
    verified: true,
    date: "Jan 12 - Jan 14, 2027",
    mode: "Hybrid",
    participants: 650,
    startDate: new Date("2027-01-12"),
    endDate: new Date("2027-01-14"),
    registrationDeadline: new Date("2027-01-11")
  },
  {
    title: "HealthTech AI Hackathon",
    description: "Leverage machine learning, computer vision, and LLM diagnostics to improve healthcare patient tracking, diagnosis speeds, and care.",
    theme: "AI Diagnostics & Care Systems",
    organizer: "Apollo Health",
    requiredSkills: ["Python", "TensorFlow", "React", "Node.js", "MongoDB"],
    prizePool: "₹4,00,000",
    status: "Approved",
    teamSizeMin: 2,
    teamSizeMax: 4,
    difficulty: "Advanced",
    category: "AI/ML",
    tags: ["Diagnostics", "LLMs", "Care", "Mobile App"],
    badge: "Registration Open",
    badgeColor: "green",
    logo: "🩺",
    logoBg: "from-emerald-500 to-cyan-500",
    verified: true,
    date: "Jan 22 - Jan 24, 2027",
    mode: "Online",
    participants: 400,
    startDate: new Date("2027-01-22"),
    endDate: new Date("2027-01-24"),
    registrationDeadline: new Date("2027-01-21")
  },
  {
    title: "GreenPlanet Sustainability Hack",
    description: "Harness technology to fight climate change. Build smart carbon offset calculators, green energy grid simulations, or tracking networks.",
    theme: "Climate Tech & Green Tech",
    organizer: "World Wildlife Fund",
    requiredSkills: ["React", "CSS", "Python", "Flask", "Figma"],
    prizePool: "₹2,50,000",
    status: "Approved",
    teamSizeMin: 2,
    teamSizeMax: 4,
    difficulty: "Beginner",
    category: "Sustainability",
    tags: ["GreenEnergy", "ClimateTech", "CarbonFootprint"],
    badge: "Registration Open",
    badgeColor: "green",
    logo: "🌱",
    logoBg: "from-green-500 to-emerald-600",
    verified: false,
    date: "Feb 05 - Feb 07, 2027",
    mode: "Online",
    participants: 300,
    startDate: new Date("2027-02-05"),
    endDate: new Date("2027-02-07"),
    registrationDeadline: new Date("2027-02-04")
  },
  {
    title: "CyberShield Security Hackathon",
    description: "Cloud penetration challenges, automation security configurations, CI/CD audits, and penetration tests in AWS sandbox scenarios.",
    theme: "Cloud & Penetration Audits",
    organizer: "AWS Security India",
    requiredSkills: ["Docker", "Kubernetes", "AWS", "Bash", "Java"],
    prizePool: "₹6,00,000",
    status: "Approved",
    teamSizeMin: 2,
    teamSizeMax: 4,
    difficulty: "Advanced",
    category: "DevOps",
    tags: ["CloudSecurity", "Infrastructure", "CI/CD"],
    badge: "Registration Open",
    badgeColor: "blue",
    logo: "🛡️",
    logoBg: "from-slate-700 to-indigo-900",
    verified: true,
    date: "Feb 18 - Feb 20, 2027",
    mode: "Offline",
    participants: 500,
    startDate: new Date("2027-02-18"),
    endDate: new Date("2027-02-20"),
    registrationDeadline: new Date("2027-02-17")
  }
];

async function seedMongoDB() {
  console.log("Connecting to MongoDB...");
  if (!process.env.MONGO_URI) {
    console.log("No MONGO_URI env set. Skipping MongoDB seeding.");
    return null;
  }
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected to MongoDB! Seeding data...");

  // Hashing password for all mock users
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash("hackteam123", salt);

  const seededUsers = [];
  for (const uData of mockUsersData) {
    let user = await User.findOne({ email: uData.email });
    if (!user) {
      user = new User({
        ...uData,
        password: hashedPassword,
        role: "user",
      });
      await user.save();
      console.log(`Seeded User: ${user.name}`);
    } else {
      console.log(`User already exists: ${user.name}`);
    }
    seededUsers.push(user);
  }

  const seededHackathons = [];
  for (const hData of mockHackathonsData) {
    let hackathon = await Hackathon.findOne({ title: hData.title });
    if (!hackathon) {
      hackathon = new Hackathon(hData);
      await hackathon.save();
      console.log(`Seeded Hackathon: ${hackathon.title}`);
    } else {
      console.log(`Hackathon already exists: ${hackathon.title}`);
    }
    seededHackathons.push(hackathon);
  }

  // Register some users for the hackathons
  for (const u of seededUsers) {
    const randomHacks = seededHackathons.slice(0, 3);
    u.registeredHackathons = randomHacks.map(h => h._id);
    await u.save();
  }

  // Seed Mock Teams
  const mockTeamsData = [
    {
      teamName: "Web3 Builders India",
      description: "Building a decentralized gas-less micro-lending pool for rural micro-enterprises.",
      leader: seededUsers.find(u => u.preferredRole === "Blockchain")._id,
      members: [seededUsers.find(u => u.preferredRole === "Backend")._id],
      hackathonId: seededHackathons.find(h => h.category === "Blockchain")._id,
      requiredSkills: ["Solidity", "Web3.js", "React"],
      maxMembers: 4,
      recruitmentStatus: "Recruiting",
      status: "Open"
    },
    {
      teamName: "RoboMed Diagnostics",
      description: "Developing automated vision analysis of medical scans using computer vision models.",
      leader: seededUsers.find(u => u.preferredRole === "AI/ML" && u.name === "Kabir Verma")._id,
      members: [seededUsers.find(u => u.preferredRole === "Mobile")._id],
      hackathonId: seededHackathons.find(h => h.category === "AI/ML")._id,
      requiredSkills: ["Python", "TensorFlow", "Figma"],
      maxMembers: 4,
      recruitmentStatus: "Recruiting",
      status: "Open"
    },
    {
      teamName: "EcoTrackers",
      description: "Interactive dashboard calculating smart carbon offset indexes for daily commuters.",
      leader: seededUsers.find(u => u.preferredRole === "UI/UX")._id,
      members: [seededUsers.find(u => u.preferredRole === "Frontend")._id],
      hackathonId: seededHackathons.find(h => h.category === "Sustainability")._id,
      requiredSkills: ["React", "CSS", "Python"],
      maxMembers: 4,
      recruitmentStatus: "Recruiting",
      status: "Open"
    }
  ];

  for (const tData of mockTeamsData) {
    let team = await Team.findOne({ teamName: tData.teamName });
    if (!team) {
      team = new Team(tData);
      await team.save();
      console.log(`Seeded Team: ${team.teamName}`);
    } else {
      console.log(`Team already exists: ${team.teamName}`);
    }
  }

  await mongoose.connection.close();
  console.log("MongoDB connection closed.");
}

function seedJSONDB() {
  console.log("Seeding JSON Database...");
  try {
    const users = readCollection("users") || [];
    const hackathons = readCollection("hackathons") || [];
    const teams = readCollection("teams") || [];

    const seededUsers = [];
    for (const uData of mockUsersData) {
      let user = users.find(u => u.email === uData.email);
      if (!user) {
        user = {
          _id: new Date().getTime().toString() + Math.random().toString(36).substr(2, 5),
          ...uData,
          password: "cleartext_seed_password",
          role: "user",
          registeredHackathons: []
        };
        users.push(user);
        console.log(`JSON Seeded User: ${user.name}`);
      }
      seededUsers.push(user);
    }

    const seededHackathons = [];
    for (const hData of mockHackathonsData) {
      let hack = hackathons.find(h => h.title === hData.title);
      if (!hack) {
        hack = {
          _id: new Date().getTime().toString() + Math.random().toString(36).substr(2, 5),
          ...hData
        };
        hackathons.push(hack);
        console.log(`JSON Seeded Hackathon: ${hack.title}`);
      }
      seededHackathons.push(hack);
    }

    // Register some users for the hackathons in JSON
    for (const u of seededUsers) {
      const randomHacks = seededHackathons.slice(0, 3);
      u.registeredHackathons = randomHacks.map(h => h._id);
    }

    // Seed Mock Teams
    const mockTeamsData = [
      {
        teamName: "Web3 Builders India",
        description: "Building a decentralized gas-less micro-lending pool for rural micro-enterprises.",
        leader: seededUsers.find(u => u.preferredRole === "Blockchain")._id,
        members: [seededUsers.find(u => u.preferredRole === "Backend")._id],
        hackathonId: seededHackathons.find(h => h.category === "Blockchain")._id,
        requiredSkills: ["Solidity", "Web3.js", "React"],
        maxMembers: 4,
        recruitmentStatus: "Recruiting",
        status: "Open"
      },
      {
        teamName: "RoboMed Diagnostics",
        description: "Developing automated vision analysis of medical scans using computer vision models.",
        leader: seededUsers.find(u => u.preferredRole === "AI/ML" && u.name === "Kabir Verma")._id,
        members: [seededUsers.find(u => u.preferredRole === "Mobile")._id],
        hackathonId: seededHackathons.find(h => h.category === "AI/ML")._id,
        requiredSkills: ["Python", "TensorFlow", "Figma"],
        maxMembers: 4,
        recruitmentStatus: "Recruiting",
        status: "Open"
      },
      {
        teamName: "EcoTrackers",
        description: "Interactive dashboard calculating smart carbon offset indexes for daily commuters.",
        leader: seededUsers.find(u => u.preferredRole === "UI/UX")._id,
        members: [seededUsers.find(u => u.preferredRole === "Frontend")._id],
        hackathonId: seededHackathons.find(h => h.category === "Sustainability")._id,
        requiredSkills: ["React", "CSS", "Python"],
        maxMembers: 4,
        recruitmentStatus: "Recruiting",
        status: "Open"
      }
    ];

    for (const tData of mockTeamsData) {
      let team = teams.find(t => t.teamName === tData.teamName);
      if (!team) {
        team = {
          _id: new Date().getTime().toString() + Math.random().toString(36).substr(2, 5),
          ...tData
        };
        teams.push(team);
        console.log(`JSON Seeded Team: ${team.teamName}`);
      }
    }

    writeCollection("users", users);
    writeCollection("hackathons", hackathons);
    writeCollection("teams", teams);

    console.log("JSON Database seeded successfully!");
  } catch (err) {
    console.error("JSON Seeding failed:", err.message);
  }
}

async function start() {
  await seedMongoDB();
  seedJSONDB();
  console.log("\nAll Database Seeding Tasks Completed Successfully!");
}

start();
