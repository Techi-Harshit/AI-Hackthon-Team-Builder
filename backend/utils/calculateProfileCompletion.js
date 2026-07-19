const calculateProfileCompletion = (user) => {
  if (!user) return 0;

  const baseFields = [
    "avatar",
    "college",
    "branch",
    "year",
    "preferredRole",
    "bio",
    "github",
    "linkedin",
    "location",
    "experience",
    "availability"
  ];

  let filledCount = 0;
  baseFields.forEach(field => {
    if (user[field] !== undefined && user[field] !== null && user[field] !== "") {
      filledCount++;
    }
  });

  if (user.skills && user.skills.length > 0) filledCount++;
  if (user.interests && user.interests.length > 0) filledCount++;
  if (user.interestedDomains && user.interestedDomains.length > 0) filledCount++;

  const totalFields = baseFields.length + 3; // 14 fields total
  return Math.round((filledCount / totalFields) * 100);
};

module.exports = calculateProfileCompletion;
