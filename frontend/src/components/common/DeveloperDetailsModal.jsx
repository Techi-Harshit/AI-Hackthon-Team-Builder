import { motion } from "framer-motion";
import {
  FaTimes,
  FaGithub,
  FaLinkedin,
  FaEnvelope,
  FaMapMarkerAlt,
  FaBriefcase,
  FaCheckCircle,
  FaShieldAlt,
  FaUserPlus,
} from "react-icons/fa";

function DeveloperDetailsModal({ developer, onClose, onInvite }) {
  if (!developer) return null;

  // Normalize details
  const name = developer.name || "Developer Profile";
  const role = developer.role || developer.preferredRole || "Software Developer";
  const bio = developer.bio || "Passionate software developer building scalable digital platforms.";
  const skills = developer.skills || ["React", "Node.js", "JavaScript"];
  const college = developer.college || "Delhi Technological University";
  const branch = developer.branch || "Computer Science";
  const yearStr = developer.year ? `${developer.year} Year` : "3rd Year";
  const availability = developer.availability || "Anytime";
  const experience = developer.experience || "Intermediate";
  const location = developer.location || "New Delhi, India";
  const github = developer.github || "https://github.com";
  const linkedin = developer.linkedin || "https://linkedin.com";
  const trustScore = developer.trustScore || 85;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
      />

      {/* Modal Card Body */}
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 30 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 30 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        className="
          relative
          w-full
          max-w-2xl
          bg-[#0e1222]/90
          backdrop-blur-2xl
          border
          border-white/8
          rounded-[32px]
          shadow-[0_25px_60px_rgba(5,8,22,0.85)]
          overflow-hidden
          z-10
          flex
          flex-col
          max-h-[90vh]
        "
      >
        {/* Background Ambient Glows */}
        <div className="absolute -top-32 -left-32 w-64 h-64 bg-[#3B82F6]/5 blur-3xl rounded-full pointer-events-none" />
        <div className="absolute -bottom-32 -right-32 w-64 h-64 bg-[#FF8A00]/5 blur-3xl rounded-full pointer-events-none" />

        {/* Modal Header */}
        <div className="p-6 border-b border-white/5 flex justify-between items-center relative z-10">
          <div className="flex items-center gap-3.5 text-left">
            <FaShieldAlt className="text-[#3B82F6] text-xl" />
            <h3 className="font-extrabold text-white text-base heading-font">Developer Profile details</h3>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#050816] hover:bg-slate-900 border border-white/5 flex items-center justify-center text-slate-400 hover:text-white transition"
          >
            <FaTimes />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-8 overflow-y-auto space-y-6 text-left relative z-10">
          
          {/* Avatar and Main profile banner */}
          <div className="flex flex-col sm:flex-row items-center gap-6 pb-6 border-b border-white/5">
            <img
              src={developer.avatar || `https://i.pravatar.cc/120?img=${developer.img || 12}`}
              alt=""
              className="w-24 h-24 rounded-full border-2 border-[#FF8A00]/40 p-0.5 object-cover"
            />
            <div className="text-center sm:text-left leading-tight">
              <h2 className="text-2xl font-black text-white flex items-center gap-2">
                {name}
                <FaCheckCircle className="text-sm text-blue-400" />
              </h2>
              <p className="text-xs text-[#3B82F6] font-bold mt-1.5">{role}</p>
              <div className="flex flex-wrap gap-2 mt-3 justify-center sm:justify-start text-[11px] text-slate-400">
                <span className="flex items-center gap-1.5">
                  <FaMapMarkerAlt className="text-slate-600" />
                  {location}
                </span>
                <span className="border-l border-white/5 h-3 my-auto mx-1" />
                <span className="flex items-center gap-1.5">
                  <FaBriefcase className="text-slate-600" />
                  {experience} Level
                </span>
              </div>
            </div>
          </div>

          {/* Bio block */}
          <div>
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2.5">About Developer</h4>
            <p className="text-slate-300 text-xs md:text-sm leading-relaxed">{bio}</p>
          </div>

          {/* Academic Profile */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl border border-white/5 bg-[#050816]/40">
              <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">University</span>
              <p className="text-xs font-bold text-slate-200 mt-1">{college}</p>
            </div>
            <div className="p-4 rounded-2xl border border-white/5 bg-[#050816]/40">
              <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Branch / Year</span>
              <p className="text-xs font-bold text-slate-200 mt-1">{branch} ({yearStr})</p>
            </div>
          </div>

          {/* Trust Score & Availability */}
          <div className="grid md:grid-cols-2 gap-6">
            
            {/* Trust Reliability Score */}
            <div className="p-4 rounded-2xl border border-white/5 bg-[#050816]/40 space-y-2">
              <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider text-slate-500">
                <span>Trust Score</span>
                <span className="text-green-400">{trustScore}%</span>
              </div>
              <div className="w-full h-2 bg-[#050816] rounded-full overflow-hidden">
                <div className="h-full bg-green-500 rounded-full" style={{ width: `${trustScore}%` }} />
              </div>
            </div>

            {/* Availability */}
            <div className="p-4 rounded-2xl border border-white/5 bg-[#050816]/40 flex items-center justify-between">
              <div>
                <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Commitment Availability</span>
                <p className="text-xs font-bold text-slate-200 mt-1">{availability}</p>
              </div>
              <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 px-2.5 py-1 rounded-full text-[9px] font-black uppercase font-mono tracking-wider">
                Active
              </span>
            </div>

          </div>

          {/* Skills & Interest list */}
          <div>
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2.5">Technology Stack</h4>
            <div className="flex flex-wrap gap-2">
              {skills.map((skill, idx) => (
                <span
                  key={idx}
                  className="bg-[#050816] border border-white/5 text-slate-300 px-3 py-1 rounded-xl text-xs font-medium"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>

        </div>

        {/* Modal Footer with social integrations & actions */}
        <div className="p-6 border-t border-white/5 bg-[#050816]/40 flex justify-between items-center relative z-10">
          
          {/* Social icons */}
          <div className="flex gap-4">
            <a href={github} target="_blank" rel="noreferrer" className="text-slate-400 hover:text-white text-xl transition-colors">
              <FaGithub />
            </a>
            <a href={linkedin} target="_blank" rel="noreferrer" className="text-slate-400 hover:text-[#3B82F6] text-xl transition-colors">
              <FaLinkedin />
            </a>
          </div>

          {/* Action buttons */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-5 py-2.5 rounded-full text-xs font-bold text-slate-400 hover:text-white transition"
            >
              Close
            </button>

            {onInvite && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  onInvite(developer);
                  onClose();
                }}
                className="
                  px-6
                  py-2.5
                  rounded-full
                  text-xs
                  font-bold
                  tracking-wider
                  text-white
                  bg-[#FF8A00]
                  border
                  border-[#FF8A00]
                  shadow-[0_0_15px_rgba(255,138,0,0.25)]
                  hover:bg-[#ff9a22]
                  hover:shadow-[0_0_20px_rgba(255,138,0,0.4)]
                  transition-all
                  flex
                  items-center
                  gap-1.5
                "
              >
                <FaUserPlus />
                <span>Invite to Team</span>
              </motion.button>
            )}
          </div>

        </div>
      </motion.div>
    </div>
  );
}

export default DeveloperDetailsModal;
