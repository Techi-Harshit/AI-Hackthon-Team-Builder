function Footer() {
  return (
    <footer className="bg-transparent border-t border-white/5 text-white relative z-10 py-16 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10">
          
          {/* Column 1: Branding */}
          <div className="col-span-2 md:col-span-1 text-left">
            <h3 className="font-extrabold text-xl tracking-wider text-white">
              COSMOQ AI
            </h3>
            <p className="text-[#A1A1AA] text-xs md:text-sm mt-4 leading-relaxed max-w-xs">
              Next-generation matching engine for developers, project teams, and hackathon organizers.
            </p>
            <p className="text-slate-600 text-[10px] mt-8">
              &copy; {new Date().getFullYear()} COSMOQ. All rights reserved.
            </p>
          </div>

          {/* Column 2: Platform */}
          <div className="text-left">
            <h4 className="font-bold text-xs uppercase tracking-wider text-slate-300">
              Platform
            </h4>
            <ul className="space-y-3 mt-4 text-[#A1A1AA] text-xs md:text-sm">
              <li><a href="#overview" className="hover:text-white transition">Overview</a></li>
              <li><a href="#features" className="hover:text-white transition">Features</a></li>
              <li><a href="#ai-matching" className="hover:text-white transition">AI Matching</a></li>
              <li><a href="#hackathons" className="hover:text-white transition">Hackathons</a></li>
            </ul>
          </div>

          {/* Column 3: Resources */}
          <div className="text-left">
            <h4 className="font-bold text-xs uppercase tracking-wider text-slate-300">
              Resources
            </h4>
            <ul className="space-y-3 mt-4 text-[#A1A1AA] text-xs md:text-sm">
              <li><a href="#" className="hover:text-white transition">Documentation</a></li>
              <li><a href="#" className="hover:text-white transition">Developer Guides</a></li>
              <li><a href="#" className="hover:text-white transition">API Desk</a></li>
              <li><a href="#" className="hover:text-white transition">Help Center</a></li>
            </ul>
          </div>

          {/* Column 4: Company & Socials */}
          <div className="text-left">
            <h4 className="font-bold text-xs uppercase tracking-wider text-slate-300">
              Company
            </h4>
            <ul className="space-y-3 mt-4 text-[#A1A1AA] text-xs md:text-sm">
              <li><a href="#" className="hover:text-white transition">About Us</a></li>
              <li><a href="#" className="hover:text-white transition">Contact</a></li>
              <li><a href="https://github.com" className="hover:text-white transition">GitHub</a></li>
              <li><a href="https://twitter.com" className="hover:text-white transition">Twitter / X</a></li>
            </ul>
          </div>

        </div>
      </div>
    </footer>
  );
}

export default Footer;