import { useEffect, useState, useMemo, useCallback } from "react";
import * as service from "../services/recommendationService";
import {
  calculateAverageCompatibility,
  calculateHighestCompatibility,
  calculateEligibleCandidatesCount,
  filterRecommendations,
  sortRecommendations
} from "../utils/recommendationUtils";

const initialFilters = {
  search: "",
  preferredRole: "",
  college: "",
  experience: "",
  availability: "",
  interestedDomain: "",
  minCompatibility: 40,
  minTrustScore: 40,
  minProfileCompletion: 30
};

export const useRecommendations = (hackathonId) => {
  const [recommendations, setRecommendations] = useState([]);
  const [hackathon, setHackathon] = useState(null);
  const [team, setTeam] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [errorCode, setErrorCode] = useState("");
  const [filters, setFilters] = useState(initialFilters);
  const [sortBy, setSortBy] = useState("Highest Compatibility");

  const fetchData = useCallback(async () => {
    if (!hackathonId) return;
    setLoading(true);
    setError("");
    setErrorCode("");
    try {
      const recData = await service.getRecommendations(hackathonId);
      setRecommendations(recData.recommendations || []);
      setTeam(recData.team || null);
      setHackathon(recData.hackathon || null);
    } catch (err) {
      console.error(err);
      const errPayload = err.response?.data || {};
      setErrorCode(errPayload.errorCode || "SERVER_ERROR");
      setError(errPayload.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }, [hackathonId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const resetFilters = useCallback(() => {
    setFilters(initialFilters);
    setSortBy("Highest Compatibility");
  }, []);

  // Filtered & Sorted Recommendations
  const processedRecommendations = useMemo(() => {
    const filtered = filterRecommendations(recommendations, filters);
    return sortRecommendations(filtered, sortBy);
  }, [recommendations, filters, sortBy]);

  // Statistics
  const stats = useMemo(() => {
    return {
      averageCompatibility: calculateAverageCompatibility(recommendations),
      highestCompatibility: calculateHighestCompatibility(recommendations),
      eligibleCandidates: calculateEligibleCandidatesCount(recommendations),
      recommendedCount: recommendations.length
    };
  }, [recommendations]);

  return {
    recommendations,
    hackathon,
    team,
    loading,
    error,
    errorCode,
    filters,
    setFilters,
    sortBy,
    setSortBy,
    stats,
    filteredRecommendations: processedRecommendations,
    resetFilters,
    refetch: fetchData
  };
};
