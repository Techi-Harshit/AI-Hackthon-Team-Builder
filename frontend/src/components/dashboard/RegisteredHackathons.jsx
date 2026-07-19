import { motion } from "framer-motion";
import { FaCalendarAlt, FaTrophy, FaArrowRight, FaCheckCircle } from "react-icons/fa";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

function RegisteredHackathons() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const registeredList = user?.registeredHackathons || [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.7 }}
      className="
      relative
      overflow-hidden
      bg-[#0e1222]/70
      backdrop-blur-xl
      border
      border-white/5
      rounded-3xl
      p-6
      "
    >
      {/* Background Glow */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-[#FF8A00]/5 rounded-full blur-3xl" />

      {/* Header */}
      <div className="flex justify-between items-center mb-6 relative z-10">
        <div>
          <h2 className="text-2xl font-bold page-title">My Interested Hackathons</h2>
          <p className="text-sm text-slate-400 mt-1">Hackathons you marked interest in</p>
        </div>
        
        {registeredList.length > 0 && (
          <button
            onClick={() => navigate("/hackathons")}
            className="px-4 py-2 rounded-xl bg-[#0e1222] border border-white/5 text-xs font-bold hover:bg-white/2 hover:border-white/10 transition"
          >
            Explore More
          </button>
        )}
      </div>

      {/* List */}
      <div className="space-y-4 relative z-10 text-left">
        {registeredList.length === 0 ? (
          <div className="text-center py-10 border border-dashed border-white/5 rounded-2xl bg-[#050816]/40">
            <p className="text-slate-400 text-xs md:text-sm">You haven't marked interest in any hackathons yet.</p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate("/hackathons")}
              className="
                mt-4
                px-5
                py-2
                rounded-xl
                bg-gradient-to-r
                from-[#FF8A00]
                to-amber-500
                text-white
                text-xs
                font-bold
                shadow-[0_0_15px_rgba(255,138,0,0.2)]
                hover:shadow-[0_0_20px_rgba(255,138,0,0.4)]
                transition-all
                inline-flex
                items-center
                gap-2
              "
            >
              <span>Browse Hackathons</span>
              <FaArrowRight />
            </motion.button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {registeredList.map((hack, idx) => (
              <motion.div
                key={hack._id || idx}
                whileHover={{ y: -3, borderColor: "rgba(59, 130, 246, 0.2)" }}
                className="p-4 rounded-2xl bg-[#050816]/50 border border-white/5 flex items-start gap-4 justify-between"
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-600 to-blue-500 flex items-center justify-center text-md font-bold text-white flex-shrink-0">
                    {hack.logo || "🏆"}
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-white">{hack.title}</h3>
                    <div className="flex items-center gap-1.5 mt-1.5 text-[10px] text-slate-400">
                      <FaCalendarAlt className="text-slate-600" />
                      <span>{hack.date || "Dec 15, 2026"}</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-end justify-between h-full gap-2">
                  <span className="bg-green-500/10 text-green-400 border border-green-500/20 px-2 py-0.5 rounded-full text-[9px] font-bold flex items-center gap-1">
                    <FaCheckCircle className="text-[8px]" />
                    Interested
                  </span>
                  
                  <span className="text-[10px] font-bold text-[#FF8A00]">
                    {hack.prize || hack.prizePool || "TBD"}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}

export default RegisteredHackathons;
