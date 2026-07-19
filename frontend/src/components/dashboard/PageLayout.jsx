import AnimatedBackground from "./AnimatedBackground";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

/**
 * PageLayout - Shared layout wrapper for all inner pages.
 * Provides consistent:
 *   - bg-[#050816] dark background
 *   - Volumetric cosmic orange + blue glows (matching landing page)
 *   - Sidebar + Topbar with correct activePage
 *   - Scrollable main content area
 */
function PageLayout({ children, activePage = "Dashboard", className = "" }) {
  return (
    <div className="relative min-h-screen bg-[#050816] text-white overflow-x-hidden">
      {/* Animated particle background */}
      <AnimatedBackground />

      {/* ── Volumetric Cosmic Glows (matching landing page) ── */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        {/* Orange glow – top left */}
        <div className="absolute left-[-15%] top-[8%]  w-[560px] h-[560px] bg-[#FF8A00]/7  rounded-full blur-[170px]" />
        {/* Blue glow – right middle */}
        <div className="absolute right-[-12%] top-[32%] w-[520px] h-[520px] bg-[#3B82F6]/9  rounded-full blur-[150px]" />
        {/* Orange glow – bottom left */}
        <div className="absolute left-[5%]  top-[65%] w-[500px] h-[500px] bg-[#FF8A00]/5  rounded-full blur-[140px]" />
        {/* Blue glow – bottom right */}
        <div className="absolute right-[5%]  top-[80%] w-[480px] h-[480px] bg-[#3B82F6]/7  rounded-full blur-[150px]" />
      </div>

      {/* Sidebar */}
      <Sidebar activePage={activePage} />

      {/* Main content */}
      <main className={`ml-72 relative z-10 min-h-screen ${className}`}>
        <Topbar />
        {children}
      </main>
    </div>
  );
}

export default PageLayout;
