import api from "../api/axios";

export const getRecommendations = async (hackathonId, page = 1, limit = 10) => {
  const res = await api.get(`/recommendations/${hackathonId}`, {
    params: { page, limit }
  });
  return res.data;
};

export const getHackathon = async (hackathonId) => {
  const res = await api.get(`/hackathons/${hackathonId}`);
  return res.data;
};

export const inviteCandidate = async (hackathonId, candidateId) => {
  const res = await api.post("/teams/invite", {
    hackathonId,
    candidateId
  });
  return res.data;
};

export const getMatchmakingInsights = async (hackathonId) => {
  const res = await api.get(`/ai/matchmaking/${hackathonId}`);
  return res.data;
};
