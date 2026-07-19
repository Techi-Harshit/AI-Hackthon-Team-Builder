/**
 * Enterprise-Grade Teammate Compatibility & Recommendation Engine
 * Calculates multi-factor synergy using Jaccard indexes, vector-space skill alignments,
 * complementary role matrices, and trust index scoring.
 */

// Skill taxonomy maps specific tools to broader technology clusters for fuzzy matching
const SKILL_TAXONOMY = {
  frontend: ["react", "angular", "vue", "next.js", "html", "css", "javascript", "typescript", "tailwind", "bootstrap", "figma", "ui/ux", "frontend", "svelte"],
  backend: ["node.js", "express", "django", "flask", "fastapi", "spring boot", "ruby on rails", "golang", "java", "python", "php", "c#", "asp.net", "backend"],
  database: ["mongodb", "postgresql", "mysql", "redis", "sqlite", "oracle", "mariadb", "firebase", "cassandra", "sql", "nosql"],
  aiml: ["tensorflow", "pytorch", "scikit-learn", "keras", "openai", "huggingface", "pandas", "numpy", "python", "r", "nlp", "computer vision", "llm", "ai", "ml"],
  devops: ["docker", "kubernetes", "aws", "gcp", "azure", "jenkins", "git", "github actions", "ci/cd", "nginx", "linux"],
  mobile: ["react native", "flutter", "swift", "kotlin", "objective-c", "android", "ios", "mobile"]
};

// Map broad roles to preferred complementary domains
const COMPLEMENTARY_ROLES = {
  "frontend": ["backend", "full stack", "ui/ux", "mobile"],
  "backend": ["frontend", "full stack", "ai/ml", "devops"],
  "full stack": ["ai/ml", "ui/ux", "frontend", "backend", "devops"],
  "ai/ml": ["full stack", "backend", "frontend"],
  "ui/ux": ["frontend", "full stack", "mobile"],
  "mobile": ["backend", "full stack", "ui/ux"],
  "devops": ["backend", "full stack", "frontend"],
  "blockchain": ["backend", "full stack", "ai/ml"]
};

// Normalize skills to lowercase trimmed strings
const normalize = (str) => String(str || "").trim().toLowerCase();

/**
 * Calculates skill compatibility including fuzzy taxonomy overlap
 */
const evaluateSkillMatching = (candidateSkills = [], targetSkills = []) => {
  const candNorm = candidateSkills.map(normalize);
  const reqNorm = targetSkills.map(normalize);

  if (reqNorm.length === 0) return { score: 1.0, matched: [], missing: [] };

  let directMatches = [];
  let taxonomyMatches = [];
  let missing = [];

  reqNorm.forEach(req => {
    // 1. Direct string match
    if (candNorm.includes(req)) {
      directMatches.push(req);
      return;
    }

    // 2. Fuzzy taxonomy match (e.g. hackathon requires Node.js, user has Express)
    let taxonomyMatched = false;
    for (const group in SKILL_TAXONOMY) {
      const cluster = SKILL_TAXONOMY[group];
      if (cluster.includes(req)) {
        // Check if candidate has any other skill in the same cluster
        const common = candNorm.filter(c => cluster.includes(c));
        if (common.length > 0) {
          taxonomyMatches.push(req);
          taxonomyMatched = true;
          break;
        }
      }
    }

    if (!taxonomyMatched) {
      missing.push(req);
    }
  });

  // Direct matches are weighted at 100%, taxonomy matches at 75%
  const matchRatio = (directMatches.length + taxonomyMatches.length * 0.75) / reqNorm.length;
  
  return {
    score: Math.min(1.0, matchRatio),
    matched: [...directMatches, ...taxonomyMatches],
    missing
  };
};

/**
 * Computes deep compatibility score between a user profile and team setup
 */
const computeDeepSynergy = (user, team, hackathon, currentTeamRoles = []) => {
  // 1. Vector Space Skill Alignment (40 Points)
  const reqSkills = team?.requiredSkills?.length ? team.requiredSkills : (hackathon?.requiredSkills || []);
  const skillAnalysis = evaluateSkillMatching(user.skills || [], reqSkills);
  const skillScore = skillAnalysis.score * 40;

  // 2. Role Completeness & Synergy Index (20 Points)
  const userRole = normalize(user.preferredRole || "full stack");
  let roleScore = 10; // default middle

  if (currentTeamRoles.length > 0) {
    const rolesNorm = currentTeamRoles.map(normalize);
    const redundancyCount = rolesNorm.filter(r => r === userRole).length;
    
    if (redundancyCount > 0) {
      // Penalty for redundant role
      roleScore = Math.max(4, 15 - redundancyCount * 4);
    } else {
      // Synergy bonus for complementary roles
      const comps = COMPLEMENTARY_ROLES[userRole] || [];
      const hasComplement = rolesNorm.some(r => comps.includes(r));
      roleScore = hasComplement ? 20 : 15;
    }
  } else {
    // Single leader comparison
    const leaderRole = normalize(team?.leader?.preferredRole || "full stack");
    if (leaderRole !== userRole) {
      const comps = COMPLEMENTARY_ROLES[leaderRole] || [];
      roleScore = comps.includes(userRole) ? 20 : 14;
    } else {
      roleScore = 8; // direct duplicate
    }
  }

  // 3. Jaccard Index Interest Match (10 Points)
  const userInterests = (user.interests || user.interestedDomains || []).map(normalize);
  const teamInterests = [
    ...(team?.domain ? [team.domain] : []),
    ...(hackathon?.theme ? [hackathon.theme] : []),
    ...(hackathon?.category ? [hackathon.category] : []),
    ...(hackathon?.tags || [])
  ].map(normalize);

  let interestScore = 5;
  if (userInterests.length > 0 && teamInterests.length > 0) {
    const intersection = userInterests.filter(i => teamInterests.includes(i));
    const union = [...new Set([...userInterests, ...teamInterests])];
    interestScore = (intersection.length / union.length) * 10;
  }

  // 4. Experience Complementarity (10 Points)
  const expLevels = { "beginner": 1, "intermediate": 2, "advanced": 3 };
  const userExp = expLevels[normalize(user.experience)] || 1;
  const targetExp = expLevels[normalize(team?.experienceRequired)] || 2;
  let experienceScore = 5;
  
  if (userExp >= targetExp) {
    experienceScore = 10;
  } else if (targetExp - userExp === 1) {
    experienceScore = 7;
  } else {
    experienceScore = 4;
  }

  // 5. Trust Index & Completion Coefficients (20 Points)
  const trustMultiplier = (user.trustScore !== undefined ? user.trustScore : 50) / 100;
  const profileMultiplier = (user.profileCompletion || 0) / 100;
  const trustScoreValue = trustMultiplier * 10;
  const profileScoreValue = profileMultiplier * 10;

  // Compile final score
  const rawCompatibility = skillScore + roleScore + interestScore + experienceScore + trustScoreValue + profileScoreValue;
  const compatibilityScore = Math.max(25, Math.min(100, Math.round(rawCompatibility)));

  // Generate explainable logic
  let explainingStatements = [];
  if (skillAnalysis.matched.length > 0) {
    explainingStatements.push(`Matches essential technologies: ${skillAnalysis.matched.slice(0, 3).join(", ")}.`);
  } else {
    explainingStatements.push("Brings adjacent tools that expand technical capability.");
  }

  if (roleScore >= 18) {
    explainingStatements.push(`Perfect structural fit as a ${user.preferredRole || 'Developer'}.`);
  } else if (roleScore < 8) {
    explainingStatements.push("Adds overlapping skillsets to reinforce primary developers.");
  }

  return {
    compatibilityScore,
    matchedSkills: skillAnalysis.matched,
    missingSkills: skillAnalysis.missing,
    whyMatches: explainingStatements,
    scoreBreakdown: {
      skills: Math.round(skillScore),
      role: Math.round(roleScore),
      interest: Math.round(interestScore),
      experience: Math.round(experienceScore),
      trust: Math.round(trustScoreValue),
      profile: Math.round(profileScoreValue)
    }
  };
};

/**
 * Calculates overall team success metrics and ready status indices
 */
const evaluateTeamReadinessAndSuccess = (leader, members = [], hackathon) => {
  const reqSkills = hackathon?.requiredSkills || [];
  
  // Assemble complete team profiles
  const allTeamUsers = [leader, ...members].filter(Boolean);
  const combinedSkills = new Set();
  const roles = [];
  let totalExperience = 0;
  let totalProfileCompletion = 0;
  let totalTrustScore = 0;

  allTeamUsers.forEach(u => {
    if (u.skills) u.skills.forEach(s => combinedSkills.add(s));
    if (u.preferredRole) roles.push(u.preferredRole);
    
    const expMap = { "beginner": 1, "intermediate": 2, "advanced": 3 };
    totalExperience += expMap[normalize(u.experience)] || 1;
    totalProfileCompletion += u.profileCompletion || 0;
    totalTrustScore += u.trustScore !== undefined ? u.trustScore : 50;
  });

  const count = allTeamUsers.length;
  const avgExp = count ? totalExperience / count : 1;
  const avgProfile = count ? totalProfileCompletion / count : 50;
  const avgTrust = count ? totalTrustScore / count : 50;

  // 1. Skill Coverage Index
  const matched = reqSkills.filter(s => 
    Array.from(combinedSkills).some(ts => ts.toLowerCase() === s.toLowerCase())
  );
  const missing = reqSkills.filter(s => !matched.includes(s));
  const skillCoverageRatio = reqSkills.length ? matched.length / reqSkills.length : 1.0;

  // 2. Role Balanced Index (diverse roles prevent conflicts)
  const uniqueRoles = [...new Set(roles.map(normalize))];
  const roleBalanceRatio = count ? uniqueRoles.length / count : 1.0;

  // 3. Overall Readiness Score (Max 100)
  // Weighted: 40% Skills, 30% Roster Size/Completeness, 15% Experience, 15% Profile Setup
  const sizeFactor = Math.min(1.0, count / 4); // optimal team has 4 members
  const readinessRaw = (skillCoverageRatio * 40) + (sizeFactor * 30) + ((avgExp / 3) * 15) + ((avgProfile / 100) * 15);
  const readinessScore = Math.max(30, Math.min(100, Math.round(readinessRaw)));

  // 4. Winning Probability Index (Max 100)
  // Higher trust score, robust profiles, and minimal skill gaps boost probability
  const winRaw = readinessScore * 0.75 + (avgTrust / 100) * 15 + (roleBalanceRatio * 10);
  const winningProbability = Math.max(35, Math.min(95, Math.round(winRaw)));

  // 5. Success Prediction Summary statement
  let teamSuccessPrediction = "";
  if (missing.length === 0 && sizeFactor >= 0.75) {
    teamSuccessPrediction = "Excellent synergy. Full required skill coverage and a diverse balance of developer roles guarantees high-speed mockup delivery.";
  } else if (missing.length > 2) {
    teamSuccessPrediction = `Significant technology gaps detected in [${missing.slice(0, 2).join(", ")}]. Recruitment is crucial to avoid project delay.`;
  } else if (sizeFactor < 0.5) {
    teamSuccessPrediction = "Core profiles are skilled, but the team is currently understaffed. Recruit a complimentary role to unlock project capabilities.";
  } else {
    teamSuccessPrediction = "Good foundational balance. Roster is ready to divide milestones and prototype the submission.";
  }

  return {
    readinessScore,
    winningProbability,
    teamSuccessPrediction,
    matchedSkills: matched,
    missingSkills: missing,
    strongSkills: Array.from(combinedSkills).slice(0, 8),
    checklist: [
      { label: "Roster composition balanced", done: roleBalanceRatio >= 0.75 },
      { label: "Core technologies covered", done: missing.length === 0 },
      { label: "Sufficient team size (>=2 members)", done: count >= 2 },
      { label: "Optimal experience level", done: avgExp >= 2 },
      { label: "Profile completeness verified", done: avgProfile >= 70 }
    ],
    nextActions: [
      missing.length ? `Recruit a teammate strong in ${missing.slice(0, 2).join(" and ")}.` : "Select project design, freeze scope, and start coding.",
      count < 3 ? "Invite 1-2 builders from suggestions to complete your squad." : "Schedule a kickoff call to align on system architecture.",
      "Submit draft idea early to collect mentor feedback."
    ]
  };
};

module.exports = {
  computeDeepSynergy,
  evaluateTeamReadinessAndSuccess,
  evaluateSkillMatching
};
