import PageLayout from "../components/dashboard/PageLayout";
import ProfileProgress from "../components/dashboard/ProfileProgress";
import StatsCards from "../components/dashboard/StatsCards";
import RecommendedTeams from "../components/dashboard/RecommendedTeams";
import UpcomingHackathons from "../components/dashboard/UpcomingHackathons";
import RecentActivity from "../components/dashboard/RecentActivity";
import SkillMatchChart from "../components/dashboard/SkillMatchChart";
import { useAuth } from "../context/AuthContext";

function Dashboard() {
  const { user } = useAuth();
  return (
    <PageLayout activePage="Dashboard">
      <div className="p-8">
        {/* Greeting Header */}
        <div className="mb-8">
          <h1 className="text-5xl font-extrabold leading-tight">
            <span className="page-title">Welcome back, </span>
            <span className="text-[#FF8A00]">{user?.name || "Builder"}!</span>
            <span className="ml-2">👋</span>
          </h1>
          <p className="text-slate-500 mt-2 text-base">
            Here's what's happening with your hackathon journey today.
          </p>
        </div>

        <ProfileProgress />
        <StatsCards />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
          <RecommendedTeams />
          <UpcomingHackathons />
        </div>

        <div className="grid lg:grid-cols-3 gap-6 mt-8">
          <div className="lg:col-span-2">
            <RecentActivity />
          </div>
          <div className="lg:col-span-1">
            <SkillMatchChart />
          </div>
        </div>
      </div>
    </PageLayout>
  );
}

export default Dashboard;
