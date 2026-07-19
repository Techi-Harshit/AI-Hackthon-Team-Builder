const calculateCompatibility = (user, hackathon, candidate, teamRoles = []) => {
  let skillsScore = 0;
  let roleScore = 0;
  let experienceScore = 0;
  let trustScoreValue = 0;
  let hackathonsScore = 0;
  let availabilityScore = 0;
  let profileScore = 0;
  let activityScore = 0;

  // 1. Skill Match (30 Points)
  const reqSkills = hackathon.requiredSkills || hackathon.techStack || [];
  const candSkills = candidate.skills || [];
  
  let matchedSkills = [];
  let missingSkills = [];
  let extraSkills = [];
  
  if (reqSkills.length > 0) {
    reqSkills.forEach(s => {
      const match = candSkills.some(cs => cs.toLowerCase() === s.toLowerCase());
      if (match) {
        matchedSkills.push(s);
      } else {
        missingSkills.push(s);
      }
    });

    candSkills.forEach(cs => {
      const isReq = reqSkills.some(rs => rs.toLowerCase() === cs.toLowerCase());
      if (!isReq) {
        extraSkills.push(cs);
      }
    });

    const skillPct = matchedSkills.length / reqSkills.length;
    skillsScore = skillPct * 30;
  } else {
    // If no required skills on hackathon, default to candidate having maximum score
    skillsScore = 30;
    extraSkills = [...candSkills];
  }

  // 2. Role Compatibility (20 Points)
  const userRole = user.preferredRole || "Full Stack";
  const candRole = candidate.preferredRole || "Full Stack";

  if (teamRoles.length > 0) {
    if (teamRoles.some(r => r.toLowerCase() === candRole.toLowerCase())) {
      roleScore = 5; // redundant role on team
    } else {
      roleScore = 20; // completes missing role
    }
  } else {
    // Fall back to leader role
    if (userRole.toLowerCase() !== candRole.toLowerCase()) {
      const complementaryPairs = {
        "frontend": ["backend", "full stack", "ui/ux", "mobile"],
        "backend": ["frontend", "full stack", "ai/ml", "devops", "blockchain"],
        "full stack": ["ai/ml", "ui/ux", "frontend", "backend"],
        "ai/ml": ["full stack", "backend", "frontend"],
        "ui/ux": ["frontend", "full stack", "mobile"],
        "mobile": ["backend", "full stack", "ui/ux"],
        "devops": ["backend", "full stack", "frontend"],
        "blockchain": ["backend", "full stack", "ai/ml"]
      };

      const complements = complementaryPairs[userRole.toLowerCase()] || [];
      if (complements.includes(candRole.toLowerCase())) {
        roleScore = 20;
      } else {
        roleScore = 12;
      }
    } else {
      roleScore = 5;
    }
  }

  // 3. Experience Match (10 Points)
  const expLevels = { "beginner": 1, "intermediate": 2, "advanced": 3 };
  const userExp = expLevels[(user.experience || "Beginner").toLowerCase()] || 1;
  const candExp = expLevels[(candidate.experience || "Beginner").toLowerCase()] || 1;

  if (candExp === userExp || candExp === userExp + 1) {
    experienceScore = 10;
  } else if (candExp > userExp + 1) {
    experienceScore = 8;
  } else if (candExp === userExp - 1) {
    experienceScore = 6;
  } else {
    experienceScore = 3;
  }

  // 4. Availability Match (10 Points)
  const userAvail = (user.availability || "Anytime").toLowerCase();
  const candAvail = (candidate.availability || "Anytime").toLowerCase();
  if (candAvail === "anytime" || userAvail === "anytime" || candAvail === userAvail) {
    availabilityScore = 10;
  } else {
    availabilityScore = 5;
  }

  // 5. Completed Hackathons (15 Points)
  const completed = candidate.completedHackathons || 0;
  hackathonsScore = Math.min(15, completed * 5); // 3 completed hackathons gets full 15 points

  // 6. Profile Completion (5 Points)
  const comp = candidate.profileCompletion || 0;
  profileScore = (comp / 100) * 5;

  // 7. Trust Score (5 Points)
  const trust = candidate.trustScore !== undefined ? candidate.trustScore : 50;
  trustScoreValue = (trust / 100) * 5;

  // 8. Recent Activity (5 Points)
  const lastActiveDate = candidate.lastActive ? new Date(candidate.lastActive) : new Date();
  const diffTime = Math.abs(new Date() - lastActiveDate);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays <= 7) {
    activityScore = 5;
  } else if (diffDays <= 30) {
    activityScore = 3;
  } else {
    activityScore = 1;
  }

  // Final compatibility score
  const compatibilityScore = Math.round(
    skillsScore +
    roleScore +
    experienceScore +
    availabilityScore +
    hackathonsScore +
    profileScore +
    trustScoreValue +
    activityScore
  );

  return {
    compatibilityScore: Math.min(100, compatibilityScore),
    scoreBreakdown: {
      skills: Math.round(skillsScore),
      role: Math.round(roleScore),
      experience: Math.round(experienceScore),
      availability: Math.round(availabilityScore),
      hackathons: Math.round(hackathonsScore),
      profile: Math.round(profileScore),
      trust: Math.round(trustScoreValue),
      activity: Math.round(activityScore)
    },
    matchedSkills,
    missingSkills,
    extraSkills,
    recommendedRole: candRole
  };
};

module.exports = {
  calculateCompatibility
};
