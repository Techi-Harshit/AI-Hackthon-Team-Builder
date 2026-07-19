import { motion } from "framer-motion";
import { FaGraduationCap, FaUsers } from "react-icons/fa";

function TeamSkillsChart({ team }) {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
      },
    },
  };

  const barVariants = {
    hidden: { width: 0 },
    visible: (level) => ({
      width: `${level}%`,
      transition: { duration: 1, ease: "easeOut" },
    }),
  };

  // 1. Gather all team members (leader + members) dynamically
  const displayMembers = [];
  const seenIds = new Set();
  
  if (team?.leader) {
    displayMembers.push(team.leader);
    seenIds.add(String(team.leader._id || team.leader.id || team.leader));
  }
  
  if (team?.members) {
    team.members.forEach(m => {
      if (m && m._id && !seenIds.has(String(m._id))) {
        displayMembers.push(m);
        seenIds.add(String(m._id));
      }
    });
  }

  // 2. Aggregate all skills dynamically
  const skillCounts = {};
  displayMembers.forEach(member => {
    const skills = member.skills || [];
    skills.forEach(s => {
      const skillName = s.trim();
      if (!skillCounts[skillName]) {
        skillCounts[skillName] = { count: 0, skill: skillName };
      }
      skillCounts[skillName].count += 1;
    });
  });

  // 3. Compute relative levels based on member coverage ratio
  const totalCount = displayMembers.length || 1;
  const teamSkillsData = Object.values(skillCounts).map(item => ({
    skill: item.skill,
    members: item.count,
    level: Math.min(100, Math.round((item.count / totalCount) * 100))
  })).sort((a, b) => b.level - a.level).slice(0, 8); // Top 8 skills

  // Fallback defaults if no team skills found
  const finalSkills = teamSkillsData.length > 0 ? teamSkillsData : [
    { skill: "React", members: 1, level: 90 },
    { skill: "Node.js", members: 1, level: 85 },
    { skill: "Python", members: 1, level: 80 }
  ];

  return (
    <div className="rounded-3xl border border-white/5 bg-[#0e1222]/20 backdrop-blur-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-white heading-font flex items-center gap-2">
            <FaGraduationCap className="text-[#3B82F6] text-lg" />
            Skills Distribution
          </h3>
          <p className="text-xs text-gray-400 mt-1">Combined squad expertise levels across technical domains.</p>
        </div>
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-50px" }}
        className="space-y-4"
      >
        {finalSkills.map((item, index) => (
          <div key={index} className="space-y-1.5 group">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-gray-200 group-hover:text-cyan-300 transition-colors">
                {item.skill}
              </span>
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1.5 text-gray-400 bg-[#050816]/60 px-2 py-0.5 rounded-md border border-white/5 font-medium">
                  <FaUsers className="text-[#3B82F6] text-3xs" />
                  {item.members} {item.members === 1 ? "member" : "members"}
                </span>
                <span className="font-bold text-[#3B82F6] font-mono">
                  {item.level}%
                </span>
              </div>
            </div>

            <div className="w-full bg-[#050816]/80 rounded-xl h-4 overflow-hidden border border-white/5 flex items-center p-[2px] relative">
              <motion.div
                custom={item.level}
                variants={barVariants}
                className="h-full rounded-lg bg-gradient-to-r from-purple-600 via-pink-500 to-blue-500 shadow-[0_0_12px_rgba(168,85,247,0.35)] relative overflow-hidden"
              >
                <motion.div
                  animate={{ x: ["-100%", "200%"] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
                />
              </motion.div>
            </div>
          </div>
        ))}
      </motion.div>
    </div>
  );
}

export default TeamSkillsChart;
