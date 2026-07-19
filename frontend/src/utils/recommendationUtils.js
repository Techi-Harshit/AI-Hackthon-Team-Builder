export const calculateAverageCompatibility = (recommendations) => {
  if (!recommendations || recommendations.length === 0) return 0;
  const sum = recommendations.reduce((acc, rec) => acc + (rec.compatibilityScore || 0), 0);
  return Math.round(sum / recommendations.length);
};

export const calculateHighestCompatibility = (recommendations) => {
  if (!recommendations || recommendations.length === 0) return 0;
  return Math.max(...recommendations.map(rec => rec.compatibilityScore || 0));
};

export const calculateEligibleCandidatesCount = (recommendations) => {
  return recommendations ? recommendations.length : 0;
};

export const filterRecommendations = (recommendations, filters) => {
  if (!recommendations) return [];
  return recommendations.filter(rec => {
    // Search Candidate
    if (filters.search && !rec.name.toLowerCase().includes(filters.search.toLowerCase())) {
      return false;
    }
    // Preferred Role
    if (filters.preferredRole && rec.preferredRole !== filters.preferredRole) {
      return false;
    }
    // College
    if (filters.college && !rec.college.toLowerCase().includes(filters.college.toLowerCase())) {
      return false;
    }
    // Experience
    if (filters.experience && rec.experience !== filters.experience) {
      return false;
    }
    // Availability
    if (filters.availability && rec.availability !== filters.availability) {
      return false;
    }
    // Interested Domain (represented in commonInterests or general domains if present)
    if (filters.interestedDomain) {
      const matchDomain = (rec.commonInterests || []).some(interest =>
        interest.toLowerCase().includes(filters.interestedDomain.toLowerCase())
      );
      if (!matchDomain) return false;
    }
    // Slider constraints
    if ((rec.compatibilityScore || 0) < filters.minCompatibility) return false;
    if ((rec.trustScore || 0) < filters.minTrustScore) return false;
    if ((rec.profileCompletion || 0) < filters.minProfileCompletion) return false;

    return true;
  });
};

export const sortRecommendations = (recommendations, sortBy) => {
  if (!recommendations) return [];
  const sorted = [...recommendations];
  switch (sortBy) {
    case "Highest Compatibility":
      return sorted.sort((a, b) => (b.compatibilityScore || 0) - (a.compatibilityScore || 0));
    case "Highest Trust":
      return sorted.sort((a, b) => (b.trustScore || 0) - (a.trustScore || 0));
    case "Newest":
      // Higher profile completion or year
      return sorted.sort((a, b) => (b.year || 0) - (a.year || 0));
    case "Most Active":
      // Sort based on lastActive date
      return sorted.sort((a, b) => {
        const dateA = a.lastActive ? new Date(a.lastActive) : new Date(0);
        const dateB = b.lastActive ? new Date(b.lastActive) : new Date(0);
        return dateB - dateA;
      });
    case "Most Experienced":
      // Rank: Advanced > Intermediate > Beginner
      const rank = { Advanced: 3, Intermediate: 2, Beginner: 1 };
      return sorted.sort((a, b) => (rank[b.experience] || 0) - (rank[a.experience] || 0));
    default:
      return sorted;
  }
};
