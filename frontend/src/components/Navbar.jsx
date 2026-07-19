import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { HiMenuAlt3, HiX } from "react-icons/hi";
import { useAuth } from "../context/AuthContext";

function Navbar() {
  const navigate = useNavigate();
  const { demoLogin } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const handleGetStarted = async () => {
    const result = await demoLogin();
    if (result.success) navigate("/dashboard");
  };

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav className={`sticky top-0 z-50 transition-all duration-300 py-4 px-6 border-b border-white/5 ${
      isScrolled ? "bg-[#050816]/90 backdrop-blur-md shadow-[0_10px_30px_rgba(5,8,22,0.5)]" : "bg-transparent"
    }`}>
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <div 
          onClick={() => navigate("/")} 
          className="flex items-center cursor-pointer"
        >
          <span className="text-2xl font-black tracking-wider text-white hover:text-cyan-400 transition">
            COSMOQ
          </span>
        </div>

        {/* Center Menu (Capsule style) */}
        <div className="hidden md:flex items-center gap-8 px-6 py-2.5 rounded-full border border-white/8 bg-white/4 backdrop-blur-xl text-slate-300 font-medium text-xs tracking-wider">
          <a href="#features" className="hover:text-white transition">Features</a>
          <a href="#ai-matching" className="hover:text-white transition">AI Matching</a>
          <a href="#how-it-works" className="hover:text-white transition">How It Works</a>
          <a href="#hackathons" className="hover:text-white transition">Hackathons</a>
          <a href="#pricing" className="hover:text-white transition">Pricing</a>
        </div>

        {/* Right Get Started Button (Glassmorphic Glow style) */}
        <div className="hidden md:flex items-center gap-6">
          <button
            onClick={() => navigate("/login")}
            className="text-slate-400 hover:text-white transition text-xs font-semibold px-2 py-2 tracking-wider"
          >
            Login
          </button>
          
          <button
            onClick={handleGetStarted}
            className="
            relative
            px-6
            py-2.5
            rounded-full
            text-xs
            font-bold
            tracking-wider
            text-white
            bg-[#0e1222]/80
            backdrop-blur-md
            border
            border-cyan-500/35
            shadow-[0_0_15px_rgba(6,182,212,0.2),inset_0_1px_1px_rgba(255,255,255,0.15)]
            hover:border-cyan-400
            hover:shadow-[0_0_25px_rgba(6,182,212,0.6),inset_0_1px_2px_rgba(255,255,255,0.3)]
            hover:scale-105
            active:scale-95
            transition-all
            duration-300
            "
          >
            Click For Demo
          </button>
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden text-2xl text-white"
        >
          {isOpen ? <HiX /> : <HiMenuAlt3 />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden mt-4 border-t border-white/5 bg-[#050816]/95 px-4 py-6 rounded-2xl">
          <div className="flex flex-col gap-4 text-center font-medium text-slate-300">
            <a href="#features" onClick={() => setIsOpen(false)} className="hover:text-white py-2 border-b border-white/5">Features</a>
            <a href="#ai-matching" onClick={() => setIsOpen(false)} className="hover:text-white py-2 border-b border-white/5">AI Matching</a>
            <a href="#how-it-works" onClick={() => setIsOpen(false)} className="hover:text-white py-2 border-b border-white/5">How It Works</a>
            <a href="#hackathons" onClick={() => setIsOpen(false)} className="hover:text-white py-2 border-b border-white/5">Hackathons</a>
            <a href="#pricing" onClick={() => setIsOpen(false)} className="hover:text-white py-2 border-b border-white/5">Pricing</a>
            
            <div className="flex gap-4 justify-center mt-4">
              <button
                onClick={() => {
                  setIsOpen(false);
                  navigate("/login");
                }}
                className="px-6 py-2.5 border border-white/10 rounded-full w-full"
              >
                Login
              </button>
              <button
                onClick={() => {
                  setIsOpen(false);
                  handleGetStarted();
                }}
                className="px-6 py-2.5 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full w-full font-semibold"
              >
                Click For Demo
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}

export default Navbar;
