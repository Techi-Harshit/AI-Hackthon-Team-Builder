import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { FaCode, FaUsers, FaTrophy } from "react-icons/fa";
import { useAuth } from "../context/AuthContext";

function CTA() {
  const navigate = useNavigate();
  const { demoLogin } = useAuth();

  const handleGetStarted = async () => {
    const result = await demoLogin();
    if (result.success) navigate("/dashboard");
  };

  return (
    <section className="bg-transparent py-32 overflow-hidden relative z-10 flex flex-col items-center">
      
      {/* Cinematic Dual Horizon Glow (Left: Orange, Right: Blue) */}
      {/* Orange Horizon Glow */}
      <div className="absolute left-[15%] bottom-[-150px] w-[500px] h-[300px] rounded-full bg-[#FF8A00]/15 blur-[120px] pointer-events-none z-0" />
      {/* Blue Horizon Glow */}
      <div className="absolute right-[15%] bottom-[-150px] w-[500px] h-[300px] rounded-full bg-[#3B82F6]/20 blur-[120px] pointer-events-none z-0" />

      <div className="max-w-6xl mx-auto px-6 w-full relative z-10">
        
        {/* Large dark glass container */}
        <div
          className="
            relative
            rounded-[40px]
            overflow-hidden
            bg-[#0e1222]/80
            border
            border-white/5
            backdrop-blur-2xl
            p-16
            shadow-[0_20px_50px_rgba(5,8,22,0.8),0_0_30px_rgba(59,130,246,0.02)]
            text-center
          "
        >
          {/* Subtle inside background highlights */}
          <div className="absolute -top-20 -left-20 w-72 h-72 bg-[#FF8A00]/5 blur-3xl rounded-full pointer-events-none" />
          <div className="absolute -bottom-20 -right-20 w-72 h-72 bg-[#3B82F6]/5 blur-3xl rounded-full pointer-events-none" />

          {/* Floating High-tech icons */}
          <motion.div
            animate={{ y: [0, -12, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-10 left-12 text-[#3B82F6]/20 text-4xl hidden md:block"
          >
            <FaCode />
          </motion.div>

          <motion.div
            animate={{ y: [0, -15, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="absolute bottom-10 left-20 text-slate-700/20 text-4xl hidden md:block"
          >
            <FaUsers />
          </motion.div>

          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-12 right-16 text-[#FF8A00]/20 text-4xl hidden md:block"
          >
            <FaTrophy />
          </motion.div>

          {/* Main Action Call */}
          <div className="relative z-10">
            <motion.h2
              animate={{ scale: [1, 1.01, 1] }}
              transition={{ duration: 5, repeat: Infinity }}
              className="text-4xl md:text-6xl font-extrabold tracking-tight text-white leading-tight"
            >
              Ready to Build Your <br />
              <span className="bg-gradient-to-r from-[#FF8A00] to-[#ffaa00] bg-clip-text text-transparent">Dream Team?</span>
            </motion.h2>

            <p className="text-[#A1A1AA] mt-6 text-sm md:text-base max-w-xl mx-auto leading-relaxed">
              Join thousands of developers already using AI-powered matching to discover hackathons, assemble compatible stack partners, and win challenges.
            </p>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleGetStarted}
              className="
                mt-10
                px-10
                py-4
                rounded-full
                font-bold
                text-sm
                tracking-wider
                text-white
                bg-[#FF8A00]
                border
                border-[#FF8A00]
                shadow-[0_0_20px_rgba(255,138,0,0.35)]
                hover:bg-[#ff9a22]
                hover:shadow-[0_0_30px_rgba(255,138,0,0.65)]
                transition-all
                duration-300
              "
            >
              Get Started Free
            </motion.button>
          </div>

        </div>

      </div>

    </section>
  );
}

export default CTA;
