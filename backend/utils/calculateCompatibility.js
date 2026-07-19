const WEIGHTS = require("../constants/recommendationWeights");

const calculateCompatibility = (user, hackathon, candidate, teamRoles = []) => {
  let skillsScore = 0;
  let roleScore = 0;
  let interestsScore = 0;
  let experienceScore = 0;
  let trustScoreValue = 0;
  let hackathonsScore = 0;
  let availabilityScore = 0;
  let profileScore = 0;
  let activityScore = 0;

  // 1. Skill Match (35 Points)
  const reqSkills = hackathon.requiredSkills || [];
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

    // Extra skills are candidate skills not required by the hackathon
    candSkills.forEach(cs => {
      const isReq = reqSkills.some(rs => rs.toLowerCase() === cs.toLowerCase());
      if (!isReq) {
        extraSkills.push(cs);
      }
    });

    const skillPct = matchedSkills.length / reqSkills.length;
    skillsScore = skillPct * WEIGHTS.skills;
  } else {
    // If no required skills on hackathon, default to candidate having maximum score
    skillsScore = WEIGHTS.skills;
    extraSkills = [...candSkills];
  }

  // 2. Role Compatibility (15 Points)
  const userRole = user.preferredRole || "Full Stack";
  const candRole = candidate.preferredRole || "Full Stack";

  // If candidate is already in the team roles, score is low
  if (teamRoles.length > 0) {
    if (teamRoles.some(r => r.toLowerCase() === candRole.toLowerCase())) {
      roleScore = 5; // redundant role on team
    } else {
      roleScore = WEIGHTS.role; // completes missing role
    }
  } else {
    // Fall back to comparing against leader role
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
        roleScore = WEIGHTS.role;
      } else {
        roleScore = 10;
      }
    } else {
      roleScore = 5;
    }
  }

  // 3. Interest Match (10 Points)
  const userInterests = user.interests || [];
  const candInterests = candidate.interests || [];
  const commonInterests = userInterests.filter(i => 
    candInterests.some(ci => ci.toLowerCase() === i.toLowerCase())
  );
  if (userInterests.length > 0) {
    const interestPct = commonInterests.length / userInterests.length;
    interestsScore = interestPct * WEIGHTS.interests;
  } else {
    interestsScore = WEIGHTS.interests;
  }

  // 4. Experience Match (10 Points)
  const expLevels = { "beginner": 1, "intermediate": 2, "advanced": 3 };
  const userExp = expLevels[(user.experience || "Beginner").toLowerCase()] || 1;
  const candExp = expLevels[(candidate.experience || "Beginner").toLowerCase()] || 1;

  if (candExp === userExp || candExp === userExp + 1) {
    experienceScore = WEIGHTS.experience; // same or one level higher
  } else if (candExp > userExp + 1) {
    experienceScore = 8; // two levels higher
  } else if (candExp === userExp - 1) {
    experienceScore = 6; // one level lower
  } else {
    experienceScore = 3; // two levels lower
  }

  // 5. Trust Score (10 Points)
  const trust = candidate.trustScore !== undefined ? candidate.trustScore : 50;
  trustScoreValue = (trust / 100) * WEIGHTS.trust;

  // 6. Completed Hackathons (5 Points)
  const completed = candidate.completedHackathons || 0;
  hackathonsScore = Math.min(WEIGHTS.hackathons, completed);

  // 7. Availability (5 Points)
  const userAvail = (user.availability || "Anytime").toLowerCase();
  const candAvail = (candidate.availability || "Anytime").toLowerCase();
  if (candAvail === "anytime" || userAvail === "anytime" || candAvail === userAvail) {
    availabilityScore = WEIGHTS.availability;
  } else {
    availabilityScore = 3;
  }

  // 8. Profile Completion (5 Points)
  const comp = candidate.profileCompletion || 0;
  profileScore = (comp / 100) * WEIGHTS.profileCompletion;

  // 9. Recent Activity (5 Points)
  const lastActiveDate = candidate.lastActive ? new Date(candidate.lastActive) : new Date();
  const diffTime = Math.abs(new Date() - lastActiveDate);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays <= 7) {
    activityScore = WEIGHTS.activity;
  } else if (diffDays <= 30) {
    activityScore = 3;
  } else {
    activityScore = 1;
  }

  // Final compatibility score
  const compatibilityScore = Math.round(
    skillsScore +
    roleScore +
    interestsScore +
    experienceScore +
    trustScoreValue +
    hackathonsScore +
    availabilityScore +
    profileScore +
    activityScore
  );

  return {
    compatibilityScore: Math.min(100, compatibilityScore),
    scoreBreakdown: {
      skills: Math.round(skillsScore),
      role: Math.round(roleScore),
      interest: Math.round(interestsScore),
      experience: Math.round(experienceScore),
      trust: Math.round(trustScoreValue),
      hackathons: Math.round(hackathonsScore),
      availability: Math.round(availabilityScore),
      profile: Math.round(profileScore),
      activity: Math.round(activityScore)
    },
    matchedSkills,
    missingSkills,
    extraSkills,
    commonInterests,
    recommendedRole: candRole
  };
};

module.exports = calculateCompatibility;
