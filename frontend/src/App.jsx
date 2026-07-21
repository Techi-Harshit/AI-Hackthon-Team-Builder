import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import DiscoverTeams from "./pages/DiscoverTeams";
import Hackathons from "./pages/Hackathons";
import MyJourney from "./pages/MyJourney";
import MyTeam from "./pages/MyTeam";
import AIRecommendations from "./pages/AIRecommendations";
import Bookmarks from "./pages/Bookmarks";
import Leaderboard from "./pages/Leaderboard";
import Settings from "./pages/Settings";
import Login from "./pages/Login";
import Register from "./pages/Register";
import HackathonDetails from "./pages/HackathonDetails";
import ErrorBoundary from "./components/common/ErrorBoundary";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050816] flex items-center justify-center text-white">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Protected Routes */}
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/discover-teams" element={<ProtectedRoute><ErrorBoundary><DiscoverTeams /></ErrorBoundary></ProtectedRoute>} />
          <Route path="/hackathons" element={<ProtectedRoute><Hackathons /></ProtectedRoute>} />
          <Route path="/hackathons/:id" element={<ProtectedRoute><HackathonDetails /></ProtectedRoute>} />
          <Route path="/applications" element={<ProtectedRoute><MyJourney /></ProtectedRoute>} />
          <Route path="/my-journey" element={<ProtectedRoute><MyJourney /></ProtectedRoute>} />
          <Route path="/my-team" element={<ProtectedRoute><MyTeam /></ProtectedRoute>} />
          <Route path="/create-team" element={<Navigate to="/discover-teams" replace />} />
          <Route path="/ai-recommendations" element={<ProtectedRoute><AIRecommendations /></ProtectedRoute>} />
          <Route path="/ai-recommendations/:hackathonId" element={<ProtectedRoute><AIRecommendations /></ProtectedRoute>} />
          <Route path="/bookmarks" element={<ProtectedRoute><Bookmarks /></ProtectedRoute>} />
          <Route path="/leaderboard" element={<ProtectedRoute><Leaderboard /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;