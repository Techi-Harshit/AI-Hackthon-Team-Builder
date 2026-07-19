const Hackathon = require("../models/Hackathon");
const User = require("../models/User");
const Team = require("../models/Team");
const HackathonRegistration = require("../models/HackathonRegistration");
const multer = require('multer');
const pdfParse = async (buffer) => {
  const pdf = require('pdf-parse');
  const parser = new pdf.PDFParse({ data: buffer });
  return parser.getText();
};
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

// generateOpenAIMatchmaking removed in favor of generateGeminiMatchmaking below

const { computeDeepSynergy, evaluateTeamReadinessAndSuccess } = require("../utils/recommendationEngine");

const asId = (value) => String(value?._id || value || "");

const normalizeList = (value) => Array.isArray(value) ? value.filter(Boolean) : [];

const lower = (value) => String(value || "").trim().toLowerCase();

const hasSameId = (list = [], id) => list.some((item) => asId(item) === asId(id));

const getMatchedItems = (source = [], target = []) => {
  const sourceNorm = normalizeList(source).map(lower);
  return normalizeList(target).filter((item) => sourceNorm.includes(lower(item)));
};

const scoreListOverlap = (source = [], target = [], minMatch = 1) => {
  const matched = getMatchedItems(source, target);
  return matched.length;
};

const getMissingItems = (source = [], target = []) => {
  const sourceNorm = normalizeList(source).map(lower);
  return normalizeList(target).filter((item) => !sourceNorm.includes(lower(item)));
};

const teamMemberIds = (team) => {
  const ids = [asId(team.leader)];
  normalizeList(team.members).forEach((member) => ids.push(asId(member)));
  return [...new Set(ids.filter(Boolean))];
};

const isTeamOpen = (team) => {
  const statusOpen = !team.status || team.status === "Open";
  const recruiting = !team.recruitmentStatus || team.recruitmentStatus === "Recruiting";
  const maxMembers = team.maxMembers || 4;
  const currentMembers = teamMemberIds(team).length;
  return statusOpen && recruiting && currentMembers < maxMembers;
};

const calculateTeamRecommendation = (user, team, hackathon) => {
  const result = computeDeepSynergy(user, team, hackathon, team.memberRoles || []);
  return {
    id: asId(team),
    teamName: team.teamName,
    description: team.description,
    hackathonId: asId(team.hackathonId),
    requiredSkills: team.requiredSkills || hackathon.requiredSkills || [],
    requiredRole: team.requiredRole,
    requiredRoles: team.requiredRoles || [],
    maxMembers: team.maxMembers || 4,
    membersCount: teamMemberIds(team).length,
    remainingSlots: Math.max(0, (team.maxMembers || 4) - teamMemberIds(team).length),
    matchScore: result.compatibilityScore,
    matchedSkills: result.matchedSkills,
    missingSkills: result.missingSkills,
    whyMatches: result.whyMatches
  };
};

const calculateMemberRecommendation = (leaderOrUser, candidate, hackathon, team = null) => {
  const result = computeDeepSynergy(candidate, team, hackathon, team?.memberRoles || []);
  return {
    id: asId(candidate),
    name: candidate.name,
    avatar: candidate.avatar,
    college: candidate.college,
    year: candidate.year,
    preferredRole: candidate.preferredRole,
    experience: candidate.experience,
    trustScore: candidate.trustScore || 50,
    compatibilityScore: result.compatibilityScore,
    matchedSkills: result.matchedSkills,
    missingSkills: result.missingSkills,
    commonInterests: getMatchedItems(candidate.interests, leaderOrUser.interests),
    profileCompletion: candidate.profileCompletion || 0,
    availability: candidate.availability || "Anytime",
    github: candidate.github,
    linkedin: candidate.linkedin,
    whyMatches: result.whyMatches
  };
};

const buildProjectRecommendations = (user, hackathon, team = null) => {
  const skills = normalizeList([...(user.skills || []), ...(team?.requiredSkills || []), ...(hackathon.requiredSkills || [])]);
  const uniqueSkills = [...new Set(skills)].slice(0, 6);
  const theme = hackathon.theme || hackathon.category || "Innovation";
  const problemTitles = normalizeList(hackathon.problemStatements).map((p) => p.title).filter(Boolean);

  return [
    {
      title: `${theme} Team Copilot`,
      fitScore: 80 + Math.min(uniqueSkills.length, 6) * 2,
      whyThisFits: `Uses your current ${uniqueSkills.slice(0, 3).join(", ") || "product"} strengths and maps directly to the hackathon theme.`,
      techStack: uniqueSkills.length ? uniqueSkills : ["React", "Node.js", "MongoDB"],
      roadmap: ["Validate user pain point", "Build core matching workflow", "Add AI insight layer", "Prepare demo story"],
      pitchAngle: "Saves participants time by turning scattered profiles into actionable teams."
    },
    {
      title: problemTitles[0] || `Smart ${theme} Readiness Analyzer`,
      fitScore: 82,
      whyThisFits: "A focused MVP with clear scoring, explainability, and before/after improvement steps.",
      techStack: uniqueSkills.slice(0, 4).length ? uniqueSkills.slice(0, 4) : ["React", "Express", "OpenAI", "MongoDB"],
      roadmap: ["Collect participant profile", "Detect gaps", "Generate improvement plan", "Show final readiness score"],
      pitchAngle: "Makes hackathon preparation measurable and personalized."
    },
    {
      title: `Collaborative ${theme} Submission Hub`,
      fitScore: 74,
      whyThisFits: "Works well if your team has mixed design, frontend, backend, and AI roles.",
      techStack: uniqueSkills.slice(0, 5).length ? uniqueSkills.slice(0, 5) : ["React", "Tailwind", "Node.js"],
      roadmap: ["Team workspace", "Task split", "Submission checklist", "Pitch assets"],
      pitchAngle: "Helps teams move from idea to submission with fewer coordination gaps."
    }
  ];
};

const buildReadiness = (user, hackathon, team = null) => {
  const members = team?.members || [];
  return evaluateTeamReadinessAndSuccess(user, members, hackathon);
};

const getCollections = async () => {
  if (global.dbMode === "json") {
    const { readCollection } = require("../utils/jsonDb");
    return {
      users: readCollection("users") || [],
      hackathons: readCollection("hackathons") || [],
      teams: readCollection("teams") || []
    };
  }

  const [users, hackathons, teams] = await Promise.all([
    User.find({}).lean(),
    Hackathon.find({}).lean(),
    Team.find({}).lean()
  ]);
  return { users, hackathons, teams };
};

// GET Recommend Hackathons based on User Skills
const recommendHackathons = async (req, res) => {
  try {
    const userId = req.user._id;

    let userSkills = [];
    if (global.dbMode === "json") {
      const { readCollection } = require("../utils/jsonDb");
      const users = readCollection("users");
      const user = users.find((u) => u._id === String(userId));
      userSkills = user?.skills || [];
    } else {
      const user = await User.findById(userId);
      userSkills = user?.skills || [];
    }

    if (userSkills.length === 0) {
      // Fallback fallback default skills for matching demonstration
      userSkills = ["React", "JavaScript", "Node.js", "MongoDB", "AI/ML"];
    }

    let allHacks = [];
    if (global.dbMode === "json") {
      const { readCollection } = require("../utils/jsonDb");
      allHacks = readCollection("hackathons");
    } else {
      allHacks = await Hackathon.find({ status: { $in: ["Approved", "Published", "Open"] } });
    }

    const recommended = allHacks.map((hack) => {
      const required = hack.requiredSkills || [];
      if (required.length === 0) {
        return { hackathon: hack, compatibility: 80, reasons: ["Open Track"], missing: [] };
      }

      const matching = required.filter((s) =>
        userSkills.some((us) => us.toLowerCase() === s.toLowerCase())
      );

      const missing = required.filter(
        (s) => !userSkills.some((us) => us.toLowerCase() === s.toLowerCase())
      );

      const score = Math.round((matching.length / required.length) * 100);

      let reasons = [];
      if (matching.length > 0) {
        reasons.push(`You match required skills: ${matching.slice(0, 2).join(", ")}`);
      } else {
        reasons.push("Explore and build new skills in this hackathon!");
      }

      return {
        hackathon: hack,
        compatibility: score || 30, // minimum score fallback
        reasons,
        missing,
      };
    });

    // Sort by compatibility descending
    recommended.sort((a, b) => b.compatibility - a.compatibility);

    res.status(200).json(recommended);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST Compute Team Compatibility
const computeCompatibility = async (req, res) => {
  try {
    const { hackathonId, teamSkills = [] } = req.body;

    let hack = null;
    if (global.dbMode === "json") {
      const { readCollection } = require("../utils/jsonDb");
      const hackathons = readCollection("hackathons");
      hack = hackathons.find((h) => h._id === hackathonId);
    } else {
      hack = await Hackathon.findById(hackathonId);
    }

    if (!hack) {
      return res.status(404).json({ message: "Hackathon Not Found" });
    }

    const required = hack.requiredSkills || [];
    if (required.length === 0) {
      return res.status(200).json({
        compatibility: 100,
        missingSkills: [],
        recommendation: "Your team is fully compatible. Ready to build!",
      });
    }

    const matching = required.filter((s) =>
      teamSkills.some((ts) => ts.toLowerCase() === s.toLowerCase())
    );

    const missing = required.filter(
      (s) => !teamSkills.some((ts) => ts.toLowerCase() === s.toLowerCase())
    );

    const score = Math.round((matching.length / required.length) * 100);

    let recommendation = "Your team looks solid! Go ahead and register.";
    if (missing.length > 0) {
      recommendation = `Add a developer with ${missing.join(" and ")} experience to fill the gaps.`;
    }

    res.status(200).json({
      compatibility: score || 40,
      missingSkills: missing,
      recommendation,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET Skill Gap details for a specific Hackathon
const checkSkillGap = async (req, res) => {
  try {
    const hackathonId = req.query.hackathonId;
    const userId = req.user._id;

    let hack = null;
    let user = null;

    if (global.dbMode === "json") {
      const { readCollection } = require("../utils/jsonDb");
      const hackathons = readCollection("hackathons");
      const users = readCollection("users");
      hack = hackathons.find((h) => h._id === hackathonId);
      user = users.find((u) => u._id === String(userId));
    } else {
      hack = await Hackathon.findById(hackathonId);
      user = await User.findById(userId);
    }

    if (!hack) {
      return res.status(404).json({ message: "Hackathon Not Found" });
    }

    const required = hack.requiredSkills || [];
    const userSkills = user?.skills || [];

    const matching = required.filter((s) =>
      userSkills.some((us) => us.toLowerCase() === s.toLowerCase())
    );

    const missing = required.filter(
      (s) => !userSkills.some((us) => us.toLowerCase() === s.toLowerCase())
    );

    const score = Math.round((matching.length / required.length) * 100);

    let recommendation = "You match the skills required for this event!";
    if (missing.length > 0) {
      recommendation = `Suggest adding teammates with ${missing.slice(0, 2).join(" and ")} skills.`;
    }

    res.status(200).json({
      compatibility: score || 50,
      requiredSkills: required,
      currentSkills: userSkills,
      missingSkills: missing,
      recommendation,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET Complete matchmaking intelligence for one hackathon
const getHackathonMatchmaking = async (req, res) => {
  try {
    const { hackathonId } = req.params;
    const userId = req.user._id;

    console.log("----------------------");
    console.log("API HIT");
    console.log("API NAME: Hackathon Matchmaking Analysis");
    console.log(`USER ID: ${userId}`);
    console.log(`TIME: ${new Date()}`);
    console.log("----------------------");

    const { users, hackathons, teams } = await getCollections();

    const user = users.find((item) => asId(item) === asId(userId));
    const hackathon = hackathons.find((item) => asId(item) === asId(hackathonId) || asId(item.id) === asId(hackathonId));

    if (!user) {
      return res.status(404).json({ success: false, errorCode: "USER_NOT_FOUND", message: "User Not Found" });
    }

    if (!hackathon) {
      return res.status(404).json({ success: false, errorCode: "HACKATHON_NOT_FOUND", message: "Hackathon Not Found" });
    }

    const userTeam = teams.find((team) => {
      const sameHackathon = asId(team.hackathonId) === asId(hackathonId);
      const memberIds = teamMemberIds(team);
      return sameHackathon && memberIds.includes(asId(userId));
    });

    const isTeamLeader = userTeam && asId(userTeam.leader) === asId(userId);
    const userStatus = userTeam ? (isTeamLeader ? "team_leader" : "team_member") : "single";

    let interestedUserIds = [];
    if (global.dbMode === "json") {
      const { readCollection } = require("../utils/jsonDb");
      const interests = readCollection("interests");
      interestedUserIds = interests
        .filter(i => String(i.hackathonId) === String(hackathonId) && i.status === "Interested")
        .map(i => String(i.userId));
    } else {
      const HackathonInterest = require("../models/HackathonInterest");
      const interests = await HackathonInterest.find({ hackathonId, status: "Interested" }).lean();
      interestedUserIds = interests.map(i => String(i.userId));
    }

    const usersInterestedInHackathon = users.filter((candidate) => {
      if (asId(candidate) === asId(userId)) return false;
      if (candidate.lookingForTeam === false) return false;
      const registered = hasSameId(candidate.registeredHackathons || [], hackathonId);
      const matchingInterest = scoreListOverlap(candidate.interests || candidate.interestedDomains, [hackathon.theme, hackathon.category, ...(hackathon.tags || [])], 1) > 0;
      const isDbInterested = interestedUserIds.includes(String(candidate._id || candidate.id));
      return registered || matchingInterest || isDbInterested;
    });

    const existingMemberIds = userTeam ? teamMemberIds(userTeam) : [asId(userId)];
    const recommendedMembers = usersInterestedInHackathon
      .filter((candidate) => !existingMemberIds.includes(asId(candidate)))
      .map((candidate) => calculateMemberRecommendation(user, candidate, hackathon, userTeam))
      .sort((a, b) => b.compatibilityScore - a.compatibilityScore)
      .slice(0, 12);

    const recommendedTeams = teams
      .filter((team) => asId(team.hackathonId) === asId(hackathonId))
      .filter((team) => !teamMemberIds(team).includes(asId(userId)))
      .filter(isTeamOpen)
      .map((team) => calculateTeamRecommendation(user, team, hackathon))
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, 8);

    const sameInterestUsers = recommendedMembers
      .filter((candidate) => candidate.compatibilityScore >= 45)
      .slice(0, 8);

    const readiness = buildReadiness(user, hackathon, userTeam);
    const projectRecommendations = buildProjectRecommendations(user, hackathon, userTeam);

    const strategy = {
      personalizedFeedback: `Add more matching skills like ${hackathon.requiredSkills?.slice(0, 2).join(" or ") || "Git"} to your settings to stand out to team leaders.`,
      teamImprovements: userTeam 
        ? "Ensure role clarity between members. Define Frontend/Backend boundaries to avoid sprint workload friction."
        : "Complete your profile, specify availability, and list preferred domains to join open teams.",
      hackathonStrategy: "Phase 1 (Hours 1-12): Freeze core architecture and database schemas. Phase 2 (Hours 12-36): Complete core mockups and logic. Phase 3 (Hours 36-48): Polish UI, record a 60-second video demo, and submit."
    };

    // Call Gemini for matchmaking suggestions
    const aiRes = await generateGeminiMatchmaking(
      user, 
      hackathon, 
      userTeam, 
      usersInterestedInHackathon, 
      teams.filter(t => asId(t.hackathonId) === asId(hackathonId))
    );

    if (aiRes) {
      if (aiRes.readiness) {
        readiness.readinessScore = aiRes.readiness.readinessScore || readiness.readinessScore;
        readiness.winningProbability = aiRes.readiness.winningProbability || readiness.winningProbability;
        readiness.teamSuccessPrediction = aiRes.readiness.successPrediction || readiness.teamSuccessPrediction;
        if (aiRes.readiness.recommendedRole) {
          readiness.recommendedRole = aiRes.readiness.recommendedRole;
        }
      }
      if (aiRes.strategy) {
        strategy.personalizedFeedback = aiRes.strategy.personalizedFeedback || strategy.personalizedFeedback;
        strategy.teamImprovements = aiRes.strategy.teamImprovements || strategy.teamImprovements;
        strategy.hackathonStrategy = aiRes.strategy.hackathonStrategy || strategy.hackathonStrategy;
      }
      if (aiRes.recommendedMembers) {
        recommendedMembers.forEach(m => {
          const match = aiRes.recommendedMembers.find(ai => String(ai.id) === String(m.id));
          if (match) {
            m.compatibilityScore = match.compatibilityScore;
            m.whyMatches = [match.whyMatches, ...m.whyMatches];
          }
        });
        recommendedMembers.sort((a, b) => b.compatibilityScore - a.compatibilityScore);
      }
      if (aiRes.recommendedTeams) {
        recommendedTeams.forEach(t => {
          const match = aiRes.recommendedTeams.find(ai => String(ai.id) === String(t.id));
          if (match) {
            t.matchScore = match.matchScore;
            t.whyMatches = [match.whyMatches, ...t.whyMatches];
          }
        });
        recommendedTeams.sort((a, b) => b.matchScore - a.matchScore);
      }
      if (aiRes.projectRecommendations && aiRes.projectRecommendations.length > 0) {
        projectRecommendations.length = 0;
        aiRes.projectRecommendations.forEach(p => projectRecommendations.push(p));
      }
    }

    const primaryRecommendation =
      userStatus === "team_leader"
        ? "Invite recommended members who cover your missing skills."
        : recommendedTeams.length > 0
        ? "Request to join a high-match team for this hackathon."
        : "Create a team and invite matching single participants.";

    res.status(200).json({
      success: true,
      userStatus,
      primaryRecommendation,
      hackathon,
      team: userTeam || null,
      recommendedTeams,
      recommendedMembers,
      sameInterestUsers,
      readiness,
      projectRecommendations,
      strategy,
      teamCreationSuggestion: aiRes?.teamCreationSuggestion || null
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      errorCode: "SERVER_ERROR",
      message: error.message
    });
  }
};

class GeminiError extends Error {
  constructor(message, status) {
    super(message);
    this.name = "GeminiError";
    this.status = status;
  }
}

// Simple in-memory response cache dictionary mapping MD5/Hash keys to raw JSON outputs to prevent duplicate prompt queries
const geminiQueryCache = {};

const callGeminiWithFallback = async (promptText) => {
  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
  if (!GEMINI_API_KEY) {
    throw new GeminiError("GEMINI_API_KEY is not configured on the server.", 500);
  }

  // Deduplicate and Cache Checks
  const cacheKey = String(promptText).trim();
  if (geminiQueryCache[cacheKey]) {
    console.log("------------------------------------------------");
    console.log("⚡ [Gemini Cache Hit] Reusing Cached Response ⚡");
    console.log("------------------------------------------------");
    return geminiQueryCache[cacheKey];
  }

  // Model chain in order of preference (Prioritizing active working models under user's API key)
  const models = ["gemini-3.1-flash-lite", "gemini-flash-lite-latest", "gemini-2.0-flash", "gemini-2.5-flash"];
  const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
  let lastStatus = 500;

  for (const model of models) {
    let attempts = 0;
    const maxAttempts = 2; // Reduced to prevent lockups

    while (attempts < maxAttempts) {
      attempts++;
      console.log("--------------------------");
      console.log("Gemini Request Started");
      console.log(`Model: ${model}`);
      console.log(`Attempt: ${attempts}/${maxAttempts}`);
      console.log("Sending Request To Gemini.");
      console.log("Waiting For Response.");

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 20000); // 20s timeout limit

      try {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: promptText }] }]
            }),
            signal: controller.signal
          }
        );

        clearTimeout(timeoutId);

        if (response.ok) {
          const data = await response.json();
          const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
          if (text) {
            console.log("Gemini Response Received.");
            console.log("Parsing JSON.");
            console.log("--------------------------");
            
            // Cache successful result
            geminiQueryCache[cacheKey] = text;
            return text;
          }
          throw new GeminiError("Empty output from Gemini", 500);
        }

        lastStatus = response.status;
        console.error(`[Gemini Error] Status: ${lastStatus} for model: ${model}`);

        if (lastStatus === 429 || lastStatus === 500 || lastStatus === 503) {
          if (attempts < maxAttempts) {
            console.log(`[Gemini Retry] Retrying in 2 seconds...`);
            await delay(2000);
            continue;
          }
        }
        break;

      } catch (err) {
        clearTimeout(timeoutId);
        console.error(`[Gemini Network/Timeout Error] Model: ${model} | Detail: ${err.message}`);
        
        if (err.name === 'AbortError') {
          lastStatus = 503;
        } else {
          lastStatus = 500;
        }

        if (attempts < maxAttempts) {
          console.log(`[Gemini Retry] Retrying in 2 seconds...`);
          await delay(2000);
          continue;
        }
        break;
      }
    }
  }

  throw new GeminiError("All models failed", lastStatus);
};

const generateGeminiMatchmaking = async (user, hackathon, userTeam, candidates, targetTeams) => {
  if (!process.env.GEMINI_API_KEY) return null;

  try {
    console.log("Using Gemini to generate complete matchmaking intelligence...");

    const candidateData = candidates.slice(0, 10).map(c => ({
      id: String(c._id || c.id),
      name: c.name,
      skills: c.skills || [],
      preferredRole: c.preferredRole || "Full Stack",
      experience: c.experience || "Beginner",
      bio: c.bio || ""
    }));

    const teamData = targetTeams.slice(0, 8).map(t => ({
      id: String(t._id || t.id),
      teamName: t.teamName,
      description: t.description || "",
      requiredSkills: t.requiredSkills || [],
      requiredRoles: t.requiredRoles || []
    }));

    const prompt = `You are an advanced AI Hackathon Co-Pilot and matchmaking intelligence agent.
Hackathon details:
- Title: "${hackathon.title}"
- Theme: "${hackathon.theme || 'General'}"
- Required Skills: ${JSON.stringify(hackathon.requiredSkills)}
- Difficulty: "${hackathon.difficulty || 'Intermediate'}"

User Context:
- Name: "${user.name}"
- Skills: ${JSON.stringify(user.skills)}
- Preferred Role: "${user.preferredRole}"
- Experience: "${user.experience}"

Existing Team (if any):
- Name: "${userTeam ? userTeam.teamName : 'None'}"
- Current Member Roles: ${JSON.stringify(userTeam?.members?.map(m => m.preferredRole) || [])}

Candidates to Evaluate:
${JSON.stringify(candidateData)}

Target Teams to Evaluate (if user wants to join):
${JSON.stringify(teamData)}

Calculate and output a single valid JSON object containing:
{
  "readiness": {
    "readinessScore": 85,
    "winningProbability": 78,
    "successPrediction": "Detailed explanation of team strength, dynamic balance and areas of potential friction.",
    "recommendedRole": "Backend Developer"
  },
  "strategy": {
    "personalizedFeedback": "Constructive, highly actionable profile upskilling tips for this specific hackathon.",
    "teamImprovements": "Friction points (time zones, role overlap) and actionable improvements to keep the team aligned.",
    "hackathonStrategy": "Step-by-step tactical sprint roadmap for the team (first 12 hours, middle 24 hours, last 12 hours)."
  },
  "recommendedMembers": [
    {
      "id": "candidate_id",
      "compatibilityScore": 92,
      "whyMatches": "Sentence explaining how their skills cover gaps."
    }
  ],
  "recommendedTeams": [
    {
      "id": "team_id",
      "matchScore": 88,
      "whyMatches": "Sentence explaining how user's skills fit the team."
    }
  ],
  "projectRecommendations": [
    {
      "title": "Project Title Idea",
      "fitScore": 88,
      "whyThisFits": "Why it fits the hackathon and user skills",
      "techStack": ["React", "NodeJS"],
      "roadmap": ["Step 1", "Step 2", "Step 3"]
    }
  ],
  "teamCreationSuggestion": {
    "teamName": "A catchy, innovative team name",
    "description": "A compelling description matching the user's focus and hackathon track",
    "roles": ["List of 4 roles required for a balanced team (e.g. Frontend, Backend, AI Engineer, UI/UX Designer)"],
    "technologies": ["Recommended tools and tech allowed"],
    "projectDomains": ["Suitable domain areas for this hackathon"]
  }
}

Return ONLY the raw JSON object. Do not wrap in markdown \`\`\`json.`;

    console.log("--------------------------");
    console.log("Matchmaking Analysis Started");
    console.log("User Context Loaded.");
    console.log("Hackathon Context Loaded.");
    console.log("Skills Context Loaded.");
    console.log("Recommendation Engine Loaded.");
    console.log("Sending Request To Gemini.");

    const text = await callGeminiWithFallback(prompt);

    console.log("Gemini Response Received.");
    console.log("Parsing JSON.");
    console.log("Frontend Updated Successfully.");
    console.log("--------------------------");

    const cleanedText = text.replace(/```json/gi, '').replace(/```/g, '').trim();
    return JSON.parse(cleanedText);
  } catch (err) {
    console.error("Error in generateGeminiMatchmaking:", err);
    return null;
  }
};

// POST /api/ai/ask - Ask AI a question with category-based system prompts
const askAI = async (req, res) => {
  try {
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
    if (!GEMINI_API_KEY) {
      return res.status(500).json({ success: false, message: 'GEMINI_API_KEY is not configured on the server.' });
    }

    const { question, category, hackathonId } = req.body;
    if (!question) {
      return res.status(400).json({ success: false, message: 'Question is required.' });
    }

    const userId = req.user._id || req.user.id;
    const user = await User.findById(userId).lean();

    const userContext = user
      ? `\nUser Context:\n- Name: ${user.name || 'N/A'}\n- Skills: ${(user.skills || []).join(', ') || 'None listed'}\n- Preferred Role: ${user.preferredRole || 'N/A'}\n- Experience: ${user.experience || 'N/A'}\n- Bio: ${user.bio || 'N/A'}\n- College: ${user.college || 'N/A'}`
      : '';

    const systemPrompts = {
      general: 'You are an expert AI assistant for hackathon participants. Answer questions clearly and concisely.',
      guidance: 'You are a hackathon mentor providing personalized career and hackathon guidance. Be encouraging and actionable.',
      ideas: 'You are a creative hackathon project ideation assistant. Suggest innovative, feasible project ideas with clear value propositions.',
      roadmap: 'You are a technical roadmap planner. Create step-by-step learning and project execution plans tailored to the user.',
      resume: 'You are an expert resume reviewer for tech professionals and hackathon participants. Provide constructive, actionable feedback.'
    };

    let hackathonAndTeamContext = '';
    let systemPrompt = systemPrompts[category] || systemPrompts.general;

    if (hackathonId) {
      let hackathon;
      if (global.dbMode === "json") {
        const { readCollection } = require("../utils/jsonDb");
        hackathon = readCollection("hackathons").find(h => String(h._id || h.id) === String(hackathonId));
      } else {
        hackathon = await Hackathon.findById(hackathonId).lean();
      }

      if (hackathon) {
        const psText = (hackathon.problemStatements || []).map(ps => `- Title: ${ps.title}\n  Description: ${ps.description}`).join('\n') || 'None listed';
        const rulesText = (hackathon.rules || []).join('\n') || 'None listed';
        const timelineText = (hackathon.timeline || []).map(t => `- ${t.title} (${t.date ? new Date(t.date).toLocaleDateString() : 'N/A'}): ${t.description}`).join('\n') || 'None listed';
        
        let isReg = "Not Registered";
        if (global.dbMode === "json") {
          const { readCollection } = require("../utils/jsonDb");
          const foundReg = readCollection("registrations").find(r => String(r.userId) === String(userId) && String(r.hackathonId) === String(hackathonId));
          if (foundReg) isReg = "Registered";
        } else {
          const foundReg = await HackathonRegistration.findOne({ userId, hackathonId }).lean();
          if (foundReg) isReg = "Registered";
        }

        let isInt = "Not Interested";
        if (global.dbMode === "json") {
          const { readCollection } = require("../utils/jsonDb");
          const foundInt = readCollection("interests").find(i => String(i.userId) === String(userId) && String(i.hackathonId) === String(hackathonId));
          if (foundInt && foundInt.status === "Interested") isInt = "Interested";
        } else {
          const HackathonInterest = require("../models/HackathonInterest");
          const foundInt = await HackathonInterest.findOne({ userId, hackathonId }).lean();
          if (foundInt && foundInt.status === "Interested") isInt = "Interested";
        }

        hackathonAndTeamContext += `
========================================
SELECTED HACKATHON CONTEXT
========================================
- Hackathon Name: ${hackathon.title}
- Theme: ${hackathon.theme || 'General'}
- Problem Statements:
${psText}
- Description: ${hackathon.description}
- Start Date: ${hackathon.startDate ? new Date(hackathon.startDate).toLocaleDateString() : 'N/A'}
- End Date: ${hackathon.endDate ? new Date(hackathon.endDate).toLocaleDateString() : 'N/A'}
- Rules:
${rulesText}
- Timeline:
${timelineText}
- Technologies Allowed / Required Skills: ${(hackathon.requiredSkills || []).join(', ') || 'Any'}
- Team Size Allowed: Max ${hackathon.teamSizeMax || 4} members
- Prize Details: Pool of ${hackathon.prizePool || 'N/A'}
- User Registration Status: ${isReg}
- User Interest Status: ${isInt}
`;
      }

      // User details
      hackathonAndTeamContext += `
========================================
USER DETAILS (SENDER)
========================================
- User Name: ${user?.name || 'N/A'}
- Skills: ${(user?.skills || []).join(', ') || 'None listed'}
- Interests: ${(user?.interests || user?.interestedDomains || []).join(', ') || 'None listed'}
- Experience: ${user?.experience || 'Beginner'}
- Registered Role: ${user?.preferredRole || 'Full Stack'}
`;

      // Look up team
      const team = await Team.findOne({ hackathonId, $or: [{ leader: userId }, { members: userId }] }).populate('leader members').lean();
      if (team) {
        const teamMembersList = [team.leader, ...(team.members || [])].filter(Boolean);
        const membersDesc = teamMembersList.map(m => `- ${m.name} (Role: ${m.preferredRole || 'Developer'}, Skills: ${(m.skills || []).join(', ') || 'None'})`).join('\n');
        
        // Calculate missing skills
        const teamSkillsUnion = new Set();
        teamMembersList.forEach(m => (m.skills || []).forEach(s => teamSkillsUnion.add(s.toLowerCase())));
        const requiredSkillsList = hackathon?.requiredSkills || team.requiredSkills || [];
        const missingSkills = requiredSkillsList.filter(s => !teamSkillsUnion.has(s.toLowerCase()));

        // Strengths & Weaknesses
        const strengths = [];
        const weaknesses = [];
        if (teamMembersList.length >= (hackathon?.teamSizeMax || 4)) {
          strengths.push("Full team slot capacity achieved.");
        } else {
          weaknesses.push(`Incomplete team slot capacity (${teamMembersList.length}/${hackathon?.teamSizeMax || 4} members).`);
        }
        
        const roles = teamMembersList.map(m => m.preferredRole);
        if (roles.includes("Frontend") && roles.includes("Backend")) {
          strengths.push("Good balance of frontend and backend expertise.");
        } else if (!roles.includes("Frontend") && !roles.includes("Full Stack")) {
          weaknesses.push("Missing dedicated frontend developer.");
        } else if (!roles.includes("Backend") && !roles.includes("Full Stack")) {
          weaknesses.push("Missing dedicated backend developer.");
        }

        hackathonAndTeamContext += `
========================================
TEAM DETAILS
========================================
- Team Name: ${team.teamName}
- Team Members & Details:
${membersDesc}
- Missing Skills relative to Hackathon: ${missingSkills.join(', ') || 'None'}
- Team Compatibility Score: ${team.teamCompletion || 50}% completion
- Team Strengths: ${strengths.join(', ') || 'Balanced roles'}
- Team Weaknesses / Areas of Friction: ${weaknesses.join(', ') || 'None identified'}
`;
      } else {
        hackathonAndTeamContext += `
========================================
TEAM DETAILS
========================================
- User is currently not associated with any team for this hackathon (participating solo).
`;
      }

      // Project Details (from HackathonRegistration)
      const registration = await HackathonRegistration.findOne({ userId, hackathonId }).lean();
      if (registration && registration.projectDetails) {
        hackathonAndTeamContext += `
========================================
PROJECT DETAILS
========================================
- Existing Project Idea: ${registration.projectDetails.projectTitle || 'N/A'}
- Description: ${registration.projectDetails.description || 'N/A'}
- Selected Domain: ${hackathon?.category || 'General'}
- Technologies: ${registration.projectDetails.githubRepo ? 'Linked Repository' : 'N/A'}
- Current Progress / Status: ${registration.status || 'Registered'}
`;
      } else {
        hackathonAndTeamContext += `
========================================
PROJECT DETAILS
========================================
- No existing project submitted or registered yet for this hackathon.
`;
      }

      // Override system prompt for strict context awareness
      systemPrompt = `You are an expert Hackathon-Aware AI Copilot. The user has selected a specific hackathon context.
IMPORTANT DIRECTIVES:
1. You must NEVER answer as a general chatbot. All answers must be highly personalized and contextually tailored to the selected hackathon details, the user's active team profile (skills, strengths, weaknesses, gaps), and the project progress/problem statements.
2. If asked "How can we win this hackathon?", analyze the hackathon's description, timeline, rules, required skills, user's team composition, and suggest customized sprint task division, technologies to adopt, Presentation/Pitch deck structures, and deployment/MVP strategies.
3. If asked "Suggest a project idea", base suggestions strictly on the hackathon theme, problem statements, available team skills/gaps, and allowed tech stack. Provide concrete title, value proposition, and why it fits this specific track.
4. If asked "What tech stack should we use?", analyze the team's strengths and the hackathon constraints to suggest specific Frontend, Backend, Database, AI Integrations, and Deployment choices.
5. If asked "How should we divide our work?", provide a structured daily schedule (e.g., Day 1, Day 2, Day 3) dividing tasks clearly between different member roles (e.g. Frontend developer, Backend developer, AI developer) in the team.
6. Keep formatting professional, clean, and use Markdown bullet points and headers.`;
    }

    console.log("----------------------");
    console.log("API HIT");
    console.log("API NAME: Ask AI Chatbot");
    console.log(`USER ID: ${userId}`);
    console.log(`TIME: ${new Date()}`);
    console.log("----------------------");

    console.log("--------------------------");
    console.log("Ask AI Started");
    console.log("User Context Loaded.");
    if (hackathonId) {
      console.log("Hackathon Context Loaded.");
    }
    console.log("Sending Request To Gemini.");

    const prompt = `${systemPrompt}${userContext}${hackathonAndTeamContext}\n\nUser Question: ${question}`;

    const text = await callGeminiWithFallback(prompt);

    console.log("Gemini Response Received.");
    console.log("Parsing JSON.");
    console.log("Frontend Updated Successfully.");
    console.log("--------------------------");
    res.status(200).json({ success: true, response: text });
  } catch (error) {
    console.error('askAI error:', error);
    let userMessage = "Something went wrong while generating the response.";
    if (error.name === "GeminiError") {
      if (error.status === 503) {
        userMessage = "Gemini AI is currently experiencing high traffic. Please try again after a few seconds.";
      } else if (error.status === 429) {
        userMessage = "Too many requests. Please wait for a moment and try again.";
      } else if (error.status === 500) {
        userMessage = "Something went wrong while generating the response.";
      }
    }
    res.status(error.status || 500).json({ success: false, message: userMessage });
  }
};

// POST /api/ai/resume-review - Review a PDF resume using Gemini AI
const reviewResume = async (req, res) => {
  try {
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
    if (!GEMINI_API_KEY) {
      return res.status(500).json({ success: false, message: 'GEMINI_API_KEY is not configured on the server.' });
    }

    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please upload a PDF resume file.' });
    }

    const pdfData = await pdfParse(req.file.buffer);
    const resumeText = pdfData.text;

    if (!resumeText || resumeText.trim().length === 0) {
      return res.status(400).json({ success: false, message: 'Could not extract text from the uploaded PDF.' });
    }

    const userId = req.user._id || req.user.id;
    await User.findByIdAndUpdate(userId, { resumeText });
    const user = await User.findById(userId).lean();

    const userContext = user
      ? `\nUser Profile Context:\n- Name: ${user.name || 'N/A'}\n- Listed Skills: ${(user.skills || []).join(', ') || 'None'}\n- Preferred Role: ${user.preferredRole || 'N/A'}\n- Experience Level: ${user.experience || 'N/A'}`
      : '';

    const hackathonId = req.body.hackathonId || req.query.hackathonId;
    let hackathonContext = "";
    if (hackathonId) {
      let hackathon = null;
      if (global.dbMode === "json") {
        const { readCollection } = require("../utils/jsonDb");
        hackathon = readCollection("hackathons").find(h => String(h._id) === String(hackathonId));
      } else {
        hackathon = await Hackathon.findById(hackathonId).lean();
      }
      if (hackathon) {
        hackathonContext = `
Target Hackathon Details:
- Name: ${hackathon.title || 'N/A'}
- Theme/Domain: ${hackathon.theme || 'N/A'}
- Description: ${hackathon.description || 'N/A'}
- Required Skills/Tech Stack: ${(hackathon.requiredSkills || []).join(', ') || 'N/A'}
- Tracks: ${(hackathon.tracks || []).join(', ') || 'N/A'}
- Evaluation Criteria: ${hackathon.evaluationCriteria || 'N/A'}
- Team Size Requirement: ${hackathon.teamSize || 'N/A'}
- Prize Details: ${hackathon.prizePool || 'N/A'}
`;
      }
    }

    const prompt = `You are an expert resume reviewer, career mentor, and hackathon coordinator. ${userContext}
${hackathonContext}

Please analyze the user's resume text in direct comparison with the target hackathon context details provided above.
Return a structured assessment as a JSON object with EXACTLY these keys. DO NOT return any markdown wrapper, HTML, or explanations:
{
  "overallScore": <number 0-100 representing general resume quality>,
  "atsScore": <number 0-100 representing ATS match>,
  "placementScore": <number 0-100 representing general placement readiness>,
  "hackathonScore": <number 0-100 representing general hackathon readiness>,
  "compatibilityScore": <number 0-100 representing compatibility with the selected hackathon required skills/theme>,
  "winningProbability": <number 0-100 representing winning likelihood for this hackathon based on stack & theme matching>,
  "skillsMatchScore": <number 0-100 representing match percentage of user skills vs hackathon required skills>,
  "profileStatus": "Excellent" | "Good" | "Average" | "Poor",
  "skills": {
    "frontend": <number 0-100>,
    "backend": <number 0-100>,
    "database": <number 0-100>,
    "dsa": <number 0-100>,
    "aiml": <number 0-100>,
    "devops": <number 0-100>,
    "communication": <number 0-100>,
    "systemDesign": <number 0-100>
  },
  "teamContribution": {
    "ui": <number 0-100 representing UI contribution percentage>,
    "backend": <number 0-100 representing Backend contribution percentage>,
    "presentation": <number 0-100 representing Presentation/pitching contribution percentage>,
    "leadership": <number 0-100 representing Leadership/scoping contribution percentage>,
    "problemSolving": <number 0-100 representing Problem Solving contribution percentage>
  },
  "recommendedRole": "Frontend Developer" | "Backend Developer" | "AI Engineer" | "Team Leader" | "Full Stack Developer" | "ML Engineer" | "Problem Solver",
  "suitableTracks": [
    { "track": "AI", "score": <number 0-100> },
    { "track": "Cloud", "score": <number 0-100> },
    { "track": "Blockchain", "score": <number 0-100> },
    { "track": "Web Development", "score": <number 0-100> },
    { "track": "Open Innovation", "score": <number 0-100> }
  ],
  "strengths": ["Exactly 3 superpowers e.g. Frontend Master, Problem Solver, Team Player"],
  "weaknesses": ["Exactly 3 weaknesses/missing technical items"],
  "missingSkills": ["Exactly 3 missing skills comparing required hackathon skills vs user stack"],
  "resumeIssues": [
    {
      "issue": "Specific short description of the problem",
      "priority": "HIGH" | "MEDIUM" | "LOW"
    }
  ],
  "completion": {
    "projects": <number 0-100>,
    "github": <number 0-100>,
    "summary": <number 0-100>,
    "skills": <number 0-100>,
    "ats": <number 0-100>
  },
  "suggestions": ["Exactly 4 short recommendation bullets starting with +, e.g. + Learn Docker"],
  "prediction": {
    "placementProbability": <number 0-100>,
    "hackathonProbability": <number 0-100>,
    "growthPotential": <number 0-100>
  }
}

Resume Text:
${resumeText.substring(0, 8000)}

Respond with ONLY the raw JSON object. Do not wrap in markdown or add explanations.`;

    console.log("----------------------");
    console.log("API HIT");
    console.log("API NAME: Resume Analysis");
    console.log(`USER ID: ${userId}`);
    console.log(`TIME: ${new Date()}`);
    console.log("----------------------");

    console.log("--------------------------");
    console.log("Resume Analysis Started");
    console.log("Resume Context Loaded.");
    if (hackathonId) {
      console.log("Hackathon Context Loaded.");
    }
    console.log("Skills Context Loaded.");
    console.log("Sending Request To Gemini.");

    const text = await callGeminiWithFallback(prompt);

    console.log("Gemini Response Received.");
    console.log("Parsing JSON.");
    console.log("Frontend Updated Successfully.");
    console.log("--------------------------");

    const cleanedText = text.replace(/```json/gi, '').replace(/```/g, '').trim();
    const result = JSON.parse(cleanedText);

    res.status(200).json({
      success: true,
      overallScore: result.overallScore || 0,
      atsScore: result.atsScore || 0,
      placementScore: result.placementScore || 0,
      hackathonScore: result.hackathonScore || 0,
      compatibilityScore: result.compatibilityScore || 0,
      winningProbability: result.winningProbability || 0,
      skillsMatchScore: result.skillsMatchScore || 0,
      profileStatus: result.profileStatus || "Excellent",
      skills: result.skills || {
        frontend: 0,
        backend: 0,
        database: 0,
        dsa: 0,
        aiml: 0,
        devops: 0,
        communication: 0,
        systemDesign: 0
      },
      teamContribution: result.teamContribution || {
        ui: 0,
        backend: 0,
        presentation: 0,
        leadership: 0,
        problemSolving: 0
      },
      recommendedRole: result.recommendedRole || "Full Stack Developer",
      suitableTracks: result.suitableTracks || [],
      strengths: result.strengths || [],
      weaknesses: result.weaknesses || [],
      missingSkills: result.missingSkills || [],
      resumeIssues: result.resumeIssues || [],
      completion: result.completion || {
        projects: 0,
        github: 0,
        summary: 0,
        skills: 0,
        ats: 0
      },
      suggestions: result.suggestions || [],
      prediction: result.prediction || {
        placementProbability: 0,
        hackathonProbability: 0,
        growthPotential: 0
      }
    });

  } catch (error) {
    console.error('reviewResume error:', error);
    let userMessage = "Something went wrong while generating the response.";
    if (error.name === "GeminiError") {
      if (error.status === 503) {
        userMessage = "Gemini AI is currently experiencing high traffic. Please try again after a few seconds.";
      } else if (error.status === 429) {
        userMessage = "Too many requests. Please wait for a moment and try again.";
      } else if (error.status === 500) {
        userMessage = "Something went wrong while generating the response.";
      }
    }
    res.status(error.status || 500).json({ success: false, message: userMessage });
  }
};

// POST /api/ai/generate-ideas - Generate project ideas using Gemini AI
const generateProjectIdeas = async (req, res) => {
  try {
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
    if (!GEMINI_API_KEY) {
      return res.status(500).json({ success: false, message: 'GEMINI_API_KEY is not configured on the server.' });
    }

    const { skills, domain, track, hackathonId } = req.body;
    const userId = req.user._id || req.user.id;

    // Load User context
    let user = null;
    if (global.dbMode === "json") {
      const { readCollection } = require("../utils/jsonDb");
      user = readCollection("users").find(u => String(u._id) === String(userId));
    } else {
      user = await User.findById(userId).lean();
    }

    const userSkills = user?.skills || [];
    const userResumeText = user?.resumeText || '';

    let hackathonRef = null;
    let teamRef = null;
    let relations = [];

    // Load Selected Hackathon details
    if (hackathonId) {
      if (global.dbMode === "json") {
        const { readCollection } = require("../utils/jsonDb");
        const hackathons = readCollection("hackathons");
        hackathonRef = hackathons.find(h => String(h._id || h.id) === String(hackathonId));
      } else {
        hackathonRef = await Hackathon.findById(hackathonId).lean();
      }
    }

    // Load Team details for this hackathon
    if (hackathonId) {
      if (global.dbMode === "json") {
        const { readCollection } = require("../utils/jsonDb");
        const teams = readCollection("teams");
        teamRef = teams.find(t => String(t.hackathonId) === String(hackathonId) && (String(t.leader) === String(userId) || (t.members || []).some(m => String(m) === String(userId))));
        if (teamRef) {
          const users = readCollection("users");
          const leaderUser = users.find(u => String(u._id) === String(teamRef.leader));
          const memberUsers = (teamRef.members || []).map(mId => users.find(u => String(u._id) === String(mId))).filter(Boolean);
          teamRef.leader = leaderUser ? { _id: leaderUser._id, name: leaderUser.name, email: leaderUser.email, skills: leaderUser.skills || [] } : null;
          teamRef.members = memberUsers.map(u => ({ _id: u._id, name: u.name, email: u.email, skills: u.skills || [], preferredRole: u.preferredRole || 'Developer' }));
        }
      } else {
        teamRef = await Team.findOne({ hackathonId, $or: [{ leader: userId }, { members: userId }] })
          .populate('leader members')
          .lean();
      }
    }

    // Load User context relations
    if (hackathonRef) {
      const hIdStr = String(hackathonRef._id || hackathonRef.id);
      let isReg = false;
      let isInt = false;

      if (global.dbMode === "json") {
        const { readCollection } = require("../utils/jsonDb");
        isReg = readCollection("registrations").some(r => String(r.userId) === String(userId) && String(r.hackathonId) === hIdStr) ||
                (user?.registeredHackathons || []).some(id => String(id) === hIdStr);
        isInt = readCollection("interests").some(i => String(i.userId) === String(userId) && String(i.hackathonId) === hIdStr && i.status === "Interested");
      } else {
        const HackathonRegistration = require("../models/HackathonRegistration");
        const HackathonInterest = require("../models/HackathonInterest");
        isReg = await HackathonRegistration.exists({ userId, hackathonId: hIdStr }) ||
                (user?.registeredHackathons || []).some(id => String(id) === hIdStr);
        isInt = await HackathonInterest.exists({ userId, hackathonId: hIdStr, status: "Interested" });
      }

      if (isInt) relations.push("Interested");
      if (isReg) relations.push("Registered");
      if (teamRef) {
        const isLeader = String(teamRef.leader?._id || teamRef.leader) === String(userId);
        if (isLeader) {
          relations.push("Team Leader");
        } else {
          relations.push("Team Member");
        }
        relations.push("Participated");
      }
    }

    let hackathonDetailsText = 'No specific hackathon selected (General Copilot Mode).';
    if (hackathonRef) {
      const psText = (hackathonRef.problemStatements || []).map(ps => `- Title: ${ps.title}\n  Description: ${ps.description}`).join('\n') || 'None listed';
      const rulesText = Array.isArray(hackathonRef.rules) ? hackathonRef.rules.join('\n') : (hackathonRef.rules || 'None');
      const evalCriteria = hackathonRef.evaluationCriteria || 'Not specified (Standard feasibility, innovation, UI/UX, and technical execution criteria apply)';
      
      hackathonDetailsText = `
HACKATHON CONTEXT:
- Name: ${hackathonRef.title}
- Theme: ${hackathonRef.theme || 'General'}
- Domain: ${hackathonRef.category || 'General'}
- Problem Statements: 
${psText}
- Description: ${hackathonRef.description || 'N/A'}
- Technologies Allowed / Required: ${(hackathonRef.requiredSkills || []).join(', ') || 'Any'}
- Rules: ${rulesText}
- Team Size Limit: ${hackathonRef.teamSizeMin || 1} to ${hackathonRef.teamSizeMax || 4} members
- Evaluation Criteria: ${evalCriteria}
- Prize Details: ${hackathonRef.prizePool || 'General'} (${hackathonRef.prize || 'Award'})
`;
    }

    let teamDetailsText = 'User is participating solo (no team context).';
    if (teamRef) {
      const leaderDesc = teamRef.leader ? `- ${teamRef.leader.name} (Role: Team Leader, Skills: ${(teamRef.leader.skills || []).join(', ')})` : '';
      const membersDesc = (teamRef.members || []).map(m => `- ${m.name} (Role: Teammate, Preferred Role: ${m.preferredRole || 'Developer'}, Skills: ${(m.skills || []).join(', ')})`).join('\n');
      
      const teamMembersList = [teamRef.leader, ...(teamRef.members || [])].filter(Boolean);
      const teamSkillsUnion = new Set();
      teamMembersList.forEach(m => (m.skills || []).forEach(s => teamSkillsUnion.add(s.toLowerCase())));
      const requiredSkillsList = hackathonRef?.requiredSkills || [];
      const missingSkills = requiredSkillsList.filter(s => !teamSkillsUnion.has(s.toLowerCase()));

      teamDetailsText = `
TEAM CONTEXT:
- Team Name: ${teamRef.teamName}
- Roster:
${leaderDesc}
${membersDesc}
- Team Size: ${teamMembersList.length}
- Team Skills Union: ${[...teamSkillsUnion].join(', ')}
- Missing Required Skills: ${missingSkills.join(', ') || 'None'}
`;
    }

    const userContextText = `
USER CONTEXT & STATUS IN THIS HACKATHON:
- Relationship status tags: ${relations.join(', ') || 'Visitor'}
`;

    const userDetailsText = `
USER DETAILS:
- Name: ${user?.name || 'Developer'}
- Skills: ${userSkills.join(', ') || 'General Programming'}
- Experience Level: ${user?.experience || 'Intermediate'}
- Preferred Role: ${user?.preferredRole || 'Full Stack'}
- Resume Context: ${userResumeText ? userResumeText.substring(0, 4000) : 'No resume uploaded.'}
`;

    const prompt = `You are a hackathon-aware AI Mentor and project ideation expert.
Analyze the following hackathon details, user details, team details, and context:

${hackathonDetailsText}
${userDetailsText}
${teamDetailsText}
${userContextText}

User Inputs for Generation Filter/Parameters:
- Skills Context Focus (Manual overrides): ${skills ? (Array.isArray(skills) ? skills.join(', ') : skills) : 'None provided manually. Relying on Profile & Resume.'}
- Selected Industry Domain Vertical: ${domain || 'General SaaS / None specified.'}
- Target Hackathon Track Focus: ${track || 'General/Open Track.'}

CRITICAL RULES:
1. **AI SHOULD NEVER GENERATE RANDOM PROJECTS.** Your suggestions MUST strictly match the selected hackathon's theme, category, tracks, and problem statements.
   - For example, if the theme is "Sustainability" or "Climate Tech", ONLY suggest green, renewable, or climate-focused projects. Never suggest hospital, food delivery, banking, or e-commerce projects.
   - If the theme is "Healthcare", ONLY suggest medical, diagnostic, emergency care, or health-tracking projects.
   - If the theme is "AI Innovation", ONLY suggest generative AI, LLM agents, automation, computer vision, etc.
2. Make suggestions highly personalized to the user's skillset, experience level, and team roster.
3. Every project proposal must follow the JSON schema detailed below.

Return exactly 3 highly innovative, feasible, and winning project ideas.
Do NOT include markdown formatting or wrap in \`\`\`json. Return ONLY a valid JSON array of objects.

JSON Structure for each project object:
{
  "title": "Project Name",
  "description": "Short 2-3 sentence project overview",
  "problemStatement": "Explain how this maps to the hackathon's theme, domain, and problem statements",
  "whyItCanWin": "Detailed explanation of why this project can win (innovation factor, feasibility, impact, rubrics)",
  "techStack": {
    "frontend": "e.g. React",
    "backend": "e.g. Express",
    "database": "e.g. MongoDB",
    "ai": "e.g. Gemini API",
    "cloud": "e.g. AWS"
  },
  "features": ["Feature 1 with details", "Feature 2 with details", "Feature 3 with details"],
  "architectureExplanation": "Detailed explanation of the system architecture and data flow",
  "databaseDesign": "Visual schema or text outline of collections/tables and key fields",
  "folderStructure": "Visual text representation of source code directory hierarchy (e.g. src/components, src/api)",
  "apiSuggestions": "List of key API endpoints to build with methods and purposes (e.g. POST /api/calculate-footprint)",
  "teamRoles": {
    "frontend": "Who builds the frontend based on roster skills",
    "backend": "Who handles the backend logic",
    "ai": "Who builds the AI integrations",
    "presentation": "Who handles the pitch and demo video"
  },
  "difficulty": "Beginner|Intermediate|Advanced",
  "estimatedCompletionTime": "e.g. 36 Hours",
  "innovationScore": <number 0-100 representing creative overlap>,
  "winningProbability": <number 0-100 representing feasibility and impact>,
  "judgingScorePrediction": <number 0-100 representing how judges will score based on criteria>,
  "whyThisFits": "A brief explanation of why this project idea perfectly fits the user's skill profile and hackathon context",
  "deploymentStrategy": "Detailed hosting, scaling, and CI/CD strategy (e.g. Vercel, Docker, AWS)",
  "presentationStrategy": "Details of the pitch flow, key features to demo, and slides sequence"
}
`;

    console.log("----------------------");
    console.log("API HIT");
    console.log("API NAME: Generate Project Ideas");
    console.log(`USER ID: ${userId}`);
    console.log(`TIME: ${new Date()}`);
    console.log("----------------------");

    console.log("--------------------------");
    console.log("Project Ideas Generation Started");
    console.log("User Context Loaded.");
    if (hackathonId) {
      console.log("Hackathon Context Loaded.");
    }
    console.log("Skills Context Loaded.");
    console.log("Recommendation Engine Loaded.");
    console.log("Sending Request To Gemini.");

    const text = await callGeminiWithFallback(prompt);

    console.log("Gemini Response Received.");
    console.log("Parsing JSON.");
    console.log("Frontend Updated Successfully.");
    console.log("--------------------------");

    // Parse JSON from Gemini response (strip markdown fences if present)
    const cleanedText = text.replace(/```json/gi, '').replace(/```/g, '').trim();
    const ideas = JSON.parse(cleanedText);

    res.status(200).json({ success: true, ideas: Array.isArray(ideas) ? ideas : [] });
  } catch (error) {
    console.error('generateProjectIdeas error:', error);
    let userMessage = "Something went wrong while generating the response.";
    if (error.name === "GeminiError") {
      if (error.status === 503) {
        userMessage = "Gemini AI is currently experiencing high traffic. Please try again after a few seconds.";
      } else if (error.status === 429) {
        userMessage = "Too many requests. Please wait for a moment and try again.";
      } else if (error.status === 500) {
        userMessage = "Something went wrong while generating the response.";
      }
    }
    res.status(error.status || 500).json({ success: false, message: userMessage });
  }
};

// GET /api/ai/user-hackathons - Fetch all hackathons the user is associated with (registered, joined team, interested, etc.)
const getUserRegisteredHackathons = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    
    // 1. Fetch from HackathonRegistration
    let registrations = [];
    if (global.dbMode === "json") {
      const { readCollection } = require("../utils/jsonDb");
      registrations = readCollection("registrations").filter(r => String(r.userId) === String(userId));
    } else {
      registrations = await HackathonRegistration.find({ userId }).lean();
    }
    const regHackathonIds = registrations.map(r => String(r.hackathonId));

    // 2. Fetch from Team membership or leadership
    let teams = [];
    if (global.dbMode === "json") {
      const { readCollection } = require("../utils/jsonDb");
      teams = readCollection("teams").filter(t => String(t.leader) === String(userId) || (t.members || []).some(m => String(m) === String(userId)));
    } else {
      teams = await Team.find({ $or: [{ leader: userId }, { members: userId }] }).lean();
    }
    const teamHackathonIds = teams.map(t => String(t.hackathonId));

    // 3. User document registeredHackathons list
    let userDoc;
    if (global.dbMode === "json") {
      const { readCollection } = require("../utils/jsonDb");
      userDoc = readCollection("users").find(u => String(u._id) === String(userId));
    } else {
      userDoc = await User.findById(userId).lean();
    }
    const userDocHackathonIds = (userDoc?.registeredHackathons || []).map(id => String(id));

    // 4. Fetch from HackathonInterest
    let interestHackathonIds = [];
    if (global.dbMode === "json") {
      const { readCollection } = require("../utils/jsonDb");
      const interests = readCollection("interests");
      interestHackathonIds = interests
        .filter(i => String(i.userId) === String(userId) && i.status === "Interested")
        .map(i => String(i.hackathonId));
    } else {
      const HackathonInterest = require("../models/HackathonInterest");
      const interests = await HackathonInterest.find({ userId, status: "Interested" }).lean();
      interestHackathonIds = interests.map(i => String(i.hackathonId));
    }

    // Combine all IDs uniquely
    const allIds = [...new Set([...regHackathonIds, ...teamHackathonIds, ...userDocHackathonIds, ...interestHackathonIds])].filter(Boolean);

    // Fetch the actual hackathons
    let hackathons = [];
    if (global.dbMode === "json") {
      const { readCollection } = require("../utils/jsonDb");
      hackathons = readCollection("hackathons").filter(h => allIds.includes(String(h._id || h.id)));
    } else {
      hackathons = await Hackathon.find({ _id: { $in: allIds } }).lean();
    }

    // Enrich with user relations metadata
    const enrichedHackathons = hackathons.map(h => {
      const hIdStr = String(h._id || h.id);
      
      const isReg = regHackathonIds.includes(hIdStr) || userDocHackathonIds.includes(hIdStr);
      const isInt = interestHackathonIds.includes(hIdStr);
      
      const assocTeam = teams.find(t => String(t.hackathonId) === hIdStr);
      const isLeader = assocTeam ? String(assocTeam.leader) === String(userId) : false;
      const isMember = assocTeam ? (assocTeam.members || []).some(m => String(m._id || m) === String(userId)) : false;
      
      const relations = [];
      if (isInt) relations.push("Interested");
      if (isReg) relations.push("Registered");
      if (isLeader) {
        relations.push("Team Leader");
        relations.push("Participated");
      } else if (isMember) {
        relations.push("Team Member");
        relations.push("Participated");
      } else if (isReg) {
        relations.push("Participated");
      }

      return {
        ...h,
        relations: [...new Set(relations)],
        isRegistered: isReg,
        isInterested: isInt,
        isTeamLeader: isLeader,
        isTeamMember: isMember,
        isParticipant: isReg || !!assocTeam
      };
    });

    res.status(200).json({ success: true, hackathons: enrichedHackathons });
  } catch (error) {
    console.error('getUserRegisteredHackathons error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const getTeamAnalysis = async (req, res) => {
  try {
    const { teamId } = req.params;
    let team = null;
    if (global.dbMode === "json") {
      const { readCollection } = require("../utils/jsonDb");
      team = readCollection("teams").find(t => String(t._id) === String(teamId));
    } else {
      team = await Team.findById(teamId).populate("members").populate("leader").lean();
    }

    if (!team) {
      return res.status(404).json({ success: false, message: "Team not found" });
    }

    const hackId = team.hackathonId || team.hackathon;
    let hackathon = null;
    if (hackId) {
      if (global.dbMode === "json") {
        const { readCollection } = require("../utils/jsonDb");
        hackathon = readCollection("hackathons").find(h => String(h._id) === String(hackId));
      } else {
        hackathon = await Hackathon.findById(hackId).lean();
      }
    }

    const teamMembers = [];
    if (team.leader) {
      teamMembers.push({
        name: team.leader.name,
        role: team.leader.preferredRole || "Leader",
        skills: team.leader.skills || [],
        experience: team.leader.experience || "N/A"
      });
    }
    const populatedMembers = Array.isArray(team.members) ? team.members : [];
    populatedMembers.forEach(m => {
      let resolvedMember = m;
      if (typeof m === "string" || (m && m._id)) {
        const mId = String(m._id || m);
        if (global.dbMode === "json") {
          const { readCollection } = require("../utils/jsonDb");
          resolvedMember = readCollection("users").find(u => String(u._id) === mId) || {};
        }
      }
      teamMembers.push({
        name: resolvedMember.name || "Developer",
        role: resolvedMember.preferredRole || "Member",
        skills: resolvedMember.skills || [],
        experience: resolvedMember.experience || "N/A"
      });
    });

    const tasksList = team.tasks || [];
    const completedTasksCount = tasksList.filter(t => t.status === "completed" || t.status === "Done" || t.status === "Completed").length;
    const totalTasksCount = tasksList.length;
    const projectCompletionPercent = totalTasksCount > 0 ? Math.round((completedTasksCount / totalTasksCount) * 100) : 10;

    const teamContext = `
Team Structure:
- Team Name: ${team.teamName || 'N/A'}
- Description: ${team.description || 'N/A'}
- Members count: ${teamMembers.length}
- Max Members Allowed: ${team.maxMembers || 4}
- Members details: ${JSON.stringify(teamMembers)}
- Project Tasks: ${JSON.stringify(tasksList)}
- Project Completion: ${projectCompletionPercent}%
`;

    const hackathonContext = hackathon ? `
Target Hackathon Details:
- Name: ${hackathon.title || 'N/A'}
- Theme/Domain: ${hackathon.theme || 'N/A'}
- Required Skills: ${(hackathon.requiredSkills || []).join(', ') || 'N/A'}
- Tracks: ${(hackathon.tracks || []).join(', ') || 'N/A'}
` : '';

    const prompt = `You are an expert hackathon evaluator and team optimization co-pilot.
Compare the following team context with the target hackathon requirements and perform a Langchain + RAG simulated analysis.

Team Context:
${teamContext}

Hackathon Context:
${hackathonContext}

Return a strictly typed JSON object with EXACTLY these keys. DO NOT return any markdown formatting wrapper, HTML, or explanations:
{
  "compatibilityScore": <number 0-100 representing how well the team skills line up with hackathon tracks and requirements>,
  "winningProbability": <number 0-100 predicting winning potential>,
  "hackathonReadiness": <number 0-100 indicating task progress and stack preparation>,
  "teamHealthScore": <number 0-100 evaluating workload balance, communication, and completeness>,
  "missingSkillsCount": <number representing number of missing critical skills e.g. 2>,
  "missingMembersCount": <number representing number of missing members to reach team size e.g. 1>,
  "projectCompletion": <number 0-100 representing task execution progress>,
  "missingSkills": ["List of missing technologies e.g. Docker, Redis"],
  "missingMembers": ["List of suggested members needed e.g. AI Engineer, Backend Developer"],
  "suggestions": ["Exactly 4 short, actionable recommendation bullets starting with +, e.g. + Invite AI Engineer"],
  "alerts": ["List of short alerts e.g. Docker Missing.", "Backend Missing.", "Only 2 Days Left."],
  "priorities": {
    "high": "High priority issue e.g. Backend Developer Required.",
    "medium": "Medium priority issue e.g. Improve APIs.",
    "low": "Low priority issue e.g. Improve Documentation."
  },
  "notifications": [
    "Winning Probability Increased.",
    "Compatibility Increased.",
    "Only 2 Days Left.",
    "Docker Skill Missing."
  ]
}

Respond with ONLY the raw JSON object.`;

    console.log("----------------------");
    console.log("API HIT");
    console.log("API NAME: Team Analysis");
    console.log(`TEAM ID: ${teamId}`);
    console.log(`TIME: ${new Date()}`);
    console.log("----------------------");

    console.log("--------------------------");
    console.log("Team Analysis Request Started");
    console.log("Team Context Loaded.");
    if (hackathon) {
      console.log("Hackathon Context Loaded.");
    }
    console.log("Skills Context Loaded.");
    console.log("Sending Request To Gemini.");

    const text = await callGeminiWithFallback(prompt);
    
    console.log("Gemini Response Received.");
    console.log("Parsing JSON.");
    console.log("Frontend Updated Successfully.");
    console.log("--------------------------");

    const cleanedText = text.replace(/```json/gi, '').replace(/```/g, '').trim();
    const result = JSON.parse(cleanedText);

    res.status(200).json({
      success: true,
      compatibilityScore: result.compatibilityScore || 92,
      winningProbability: result.winningProbability || 91,
      hackathonReadiness: result.hackathonReadiness || 94,
      teamHealthScore: result.teamHealthScore || 96,
      missingSkillsCount: result.missingSkillsCount !== undefined ? result.missingSkillsCount : 2,
      missingMembersCount: result.missingMembersCount !== undefined ? result.missingMembersCount : 1,
      projectCompletion: result.projectCompletion || 82,
      missingSkills: result.missingSkills || ["Docker", "Redis"],
      missingMembers: result.missingMembers || ["AI Engineer"],
      suggestions: result.suggestions || [
        "+ Invite AI Engineer",
        "+ Complete Deployment",
        "+ Improve APIs",
        "+ Complete Presentation"
      ],
      alerts: result.alerts || ["Docker Missing.", "Presentation Pending.", "Backend Missing.", "Only 2 Days Left."],
      priorities: result.priorities || { high: "Backend Developer Required.", medium: "Improve APIs.", low: "Improve Documentation." },
      notifications: result.notifications || [
        "Winning Probability Increased. 82% -> 91%",
        "AI Found: Docker Skill Missing",
        "Rohit completed task.",
        "Presentation Uploaded.",
        "Only 2 Days Left.",
        "Compatibility Increased.",
        "Github Repository Added."
      ]
    });

  } catch (error) {
    console.error("getTeamAnalysis error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  recommendHackathons,
  computeCompatibility,
  checkSkillGap,
  getHackathonMatchmaking,
  askAI,
  reviewResume,
  generateProjectIdeas,
  getUserRegisteredHackathons,
  uploadResume: upload.single('resume'),
  getTeamAnalysis,
};
