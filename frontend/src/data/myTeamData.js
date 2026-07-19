// My Team Page Data

export const teamInfo = {
  name: "Code Warriors",
  badge: "Team Leader",
  description: "Building AI solutions for real world problems",
  tags: ["AI/ML", "Web Development", "Problem Solving"],
  createdDate: "May 10, 2024",
  hackathon: "Smart India Hackathon 2024",
  avatar: "🛡️",
  avatarBg: "from-purple-600 to-blue-600",
};

export const teamStats = [
  { label: "Team Compatibility", value: 92, type: "ring", subtext: "Excellent", color: "#22c55e" },
  { label: "Project Progress", value: 68, type: "ring", subtext: "On Track", color: "#a855f7" },
  { label: "Tasks Completed", value: "24 / 36", type: "text", subtext: "This Sprint" },
  { label: "Team Rank", value: "#14", type: "rank", subtext: "Campus Rank", icon: "🏆" },
];

export const teamMembers = [
  {
    id: 1,
    name: "Harshit Singh",
    role: "Full Stack Developer",
    isYou: true,
    avatar: 12,
    skills: ["React", "Node.js", "MongoDB"],
    status: "Team Leader",
    statusColor: "purple",
  },
  {
    id: 2,
    name: "Aman Raj",
    role: "Backend Developer",
    isYou: false,
    avatar: 33,
    skills: ["Node.js", "Express", "PostgreSQL"],
    status: "Active",
    statusColor: "emerald",
  },
  {
    id: 3,
    name: "Priya Sharma",
    role: "UI/UX Designer",
    isYou: false,
    avatar: 44,
    skills: ["Figma", "UI/UX", "Tailwind CSS"],
    status: "Active",
    statusColor: "emerald",
  },
  {
    id: 4,
    name: "Rohit Verma",
    role: "ML Engineer",
    isYou: false,
    avatar: 52,
    skills: ["Python", "TensorFlow", "Scikit-learn"],
    status: "Away",
    statusColor: "amber",
  },
  {
    id: 5,
    name: "Sneha Patel",
    role: "DevOps Engineer",
    isYou: false,
    avatar: 47,
    skills: ["Docker", "AWS", "CI/CD"],
    status: "Active",
    statusColor: "emerald",
  },
];

export const teamOverview = [
  { icon: "🏆", label: "Hackathon", value: "Smart India Hackathon 2024" },
  { icon: "👥", label: "Team Type", value: "Open Team" },
  { icon: "👁️", label: "Team Visibility", value: "Public" },
  { icon: "🔍", label: "Looking For", value: "AI/ML Engineer" },
  { icon: "📍", label: "Location", value: "India" },
];

export const recentActivities = [
  { icon: "🟢", text: 'Aman Raj joined the team', date: "May 22, 2024 • 10:30 AM" },
  { icon: "📝", text: 'New task "API Integration" created', date: "May 22, 2024 • 09:15 AM" },
  { icon: "📎", text: "Priya Sharma uploaded a file", date: "May 21, 2024 • 08:45 PM" },
  { icon: "✅", text: "Database schema finalized", date: "May 21, 2024 • 06:30 PM" },
  { icon: "💬", text: "Team meeting scheduled", date: "May 20, 2024 • 03:00 PM" },
];

export const teamDescription =
  'We are Code Warriors, a group of passionate developers and problem solvers working on AI driven solutions to improve real world experiences. Our goal is to innovate, collaborate and make an impact.';

export const sprintTasks = [
  { id: 1, title: "Frontend Dashboard UI", assignee: "Harshit", avatar: 12, progress: 90, priority: "High", priorityColor: "red" },
  { id: 2, title: "API Integration - Auth", assignee: "Aman", avatar: 33, progress: 75, priority: "High", priorityColor: "red" },
  { id: 3, title: "ML Model Training", assignee: "Rohit", avatar: 52, progress: 60, priority: "Medium", priorityColor: "amber" },
  { id: 4, title: "UI/UX Design System", assignee: "Priya", avatar: 44, progress: 100, priority: "Done", priorityColor: "emerald" },
  { id: 5, title: "CI/CD Pipeline Setup", assignee: "Sneha", avatar: 47, progress: 45, priority: "Medium", priorityColor: "amber" },
  { id: 6, title: "Database Optimization", assignee: "Aman", avatar: 33, progress: 30, priority: "Low", priorityColor: "blue" },
];

export const teamSkillsData = [
  { skill: "React", level: 95, members: 3 },
  { skill: "Node.js", level: 88, members: 2 },
  { skill: "Python", level: 82, members: 2 },
  { skill: "AI/ML", level: 75, members: 2 },
  { skill: "UI/UX", level: 70, members: 1 },
  { skill: "DevOps", level: 65, members: 1 },
  { skill: "MongoDB", level: 78, members: 2 },
  { skill: "AWS", level: 60, members: 1 },
];

export const upcomingDeadlines = [
  { id: 1, title: "Prototype Submission", date: "May 28, 2024", daysLeft: 6, icon: "🚀", urgent: true },
  { id: 2, title: "Presentation Deck", date: "May 30, 2024", daysLeft: 8, icon: "📊", urgent: false },
  { id: 3, title: "Final Submission", date: "Jun 5, 2024", daysLeft: 14, icon: "🏁", urgent: false },
];
