// AI Recommendations Page Data

export const currentUser = {
  name: "Harshit Singh",
  role: "Full Stack Developer",
  avatar: 12,
  skills: ["React", "Node.js", "MongoDB", "Python", "Tailwind CSS"],
  extraSkillsCount: 3,
  lookingFor: "Team",
  overallMatch: 92,
};

export const recommendedTeammates = [
  {
    id: 1,
    name: "Aman Raj",
    matchStatus: "Best Match",
    statusColor: "emerald",
    role: "Backend Developer",
    avatar: 33,
    experience: "2.3 yrs Experience",
    status: "Available",
    skills: ["Node.js", "Express", "PostgreSQL", "AWS"],
    extraSkillsCount: 2,
    wins: 3,
    participations: 8,
    matchScore: 92,
    whyMatched: [
      "Complementary skills",
      "Similar hackathon goals",
      "Available for this hackathon",
    ],
  },
  {
    id: 2,
    name: "Priya Sharma",
    matchStatus: "Great Match",
    statusColor: "cyan",
    role: "UI/UX Designer",
    avatar: 44,
    experience: "1.8 yrs Experience",
    status: "Available",
    skills: ["Figma", "UI/UX", "Tailwind CSS", "Adobe XD"],
    extraSkillsCount: 1,
    wins: 2,
    participations: 6,
    matchScore: 89,
    whyMatched: [
      "Strong design sense",
      "Previous collaboration",
      "Available for this hackathon",
    ],
  },
  {
    id: 3,
    name: "Rohit Verma",
    matchStatus: "Good Match",
    statusColor: "amber",
    role: "ML Engineer",
    avatar: 52,
    experience: "2.7 yrs Experience",
    status: "Busy",
    skills: ["Python", "TensorFlow", "Scikit-learn", "OpenCV"],
    extraSkillsCount: 2,
    wins: 1,
    participations: 5,
    matchScore: 85,
    whyMatched: [
      "AI/ML expertise",
      "Problem solving skills",
      "Can join part-time",
    ],
  },
  {
    id: 4,
    name: "Sneha Patel",
    matchStatus: "Good Match",
    statusColor: "amber",
    role: "DevOps Engineer",
    avatar: 47,
    experience: "3.1 yrs Experience",
    status: "Available",
    skills: ["Docker", "Kubernetes", "AWS", "GitHub Actions"],
    extraSkillsCount: 3,
    wins: 4,
    participations: 10,
    matchScore: 82,
    whyMatched: [
      "Robust CI/CD skills",
      "High availability",
      "Strong system design",
    ],
  },
];

export const userPreferences = {
  lookingFor: "Team",
  preferredRoles: ["Full Stack Developer", "Backend Developer"],
  skillsHave: ["React.js", "MongoDB", "Python", "Tailwind CSS", "Git", "Docker"],
  hackathonPrefs: ["Open for All", "Online", "Prize Pool: Any"],
  availability: "Full Time (This Sprint)",
};

export const teamFitInsights = {
  skillsMatch: 95,
  goalsAlignment: 90,
  availability: 88,
  communicationStyle: 85,
  experienceLevel: 87,
};

export const recommendedTeams = [
  {
    id: 1,
    name: "DevDynamo",
    avatar: "⚡",
    avatarBg: "from-amber-600 to-red-600",
    hackathon: "Smart India Hackathon 2024",
    lookingFor: "Full Stack Developer",
    membersCount: 3,
    matchScore: 94,
    tags: ["React", "Express", "Hackathon Experienced"],
  },
  {
    id: 2,
    name: "Cyber Knights",
    avatar: "⚔️",
    avatarBg: "from-blue-600 to-indigo-600",
    hackathon: "Fintech Global Hack 2024",
    lookingFor: "Backend Developer",
    membersCount: 4,
    matchScore: 88,
    tags: ["Node.js", "SQL", "Security Enthusiasts"],
  },
];

export const skillGaps = [
  { skill: "Docker", trend: "+45% demand", level: 60, overlap: 90, status: "Partially Known" },
  { skill: "AWS Cloud", trend: "+60% demand", level: 30, overlap: 85, status: "Need to Learn" },
  { skill: "TypeScript", trend: "+80% demand", level: 75, overlap: 95, status: "Partially Known" },
];

export const aiTips = [
  "Consider adding skills like Docker, AWS or TypeScript to get even better matches.",
  "Completing details about past hackathons will boost your profile compatibility score by up to 15%.",
  "Updating your weekly timezone preferences improves matches with remote developers.",
];
