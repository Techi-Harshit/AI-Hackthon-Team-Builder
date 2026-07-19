import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FaUser,
  FaEnvelope,
  FaLock,
  FaEye,
  FaEyeSlash,
  FaTag,
  FaTimes,
} from "react-icons/fa";
import { useAuth } from "../context/AuthContext";

function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState("");
  const [skills, setSkills] = useState([]);
  const [skillInput, setSkillInput] = useState("");
  const [agree, setAgree] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");

  const handleAddSkill = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const val = skillInput.trim();
      if (!val) return;
      if (!skills.includes(val)) {
        setSkills([...skills, val]);
      }
      setSkillInput("");
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    setSkills(skills.filter((s) => s !== skillToRemove));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!fullName.trim() || !email.trim() || !password.trim() || !confirmPassword.trim() || !role) {
      setError("Please fill in all required fields.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (!agree) {
      setError("You must agree to the Terms of Service and Privacy Policy.");
      return;
    }

    setError("");

    // Map frontend role to backend preferredRole enum
    let preferredRole = "Full Stack";
    if (role === "Frontend Developer") preferredRole = "Frontend";
    else if (role === "Backend Developer") preferredRole = "Backend";
    else if (role === "Full Stack Developer") preferredRole = "Full Stack";
    else if (role === "AI/ML Engineer") preferredRole = "AI/ML";
    else if (role === "UI/UX Designer") preferredRole = "UI/UX";
    else if (role === "DevOps Engineer") preferredRole = "DevOps";
    else if (role === "Mobile Developer") preferredRole = "Mobile";
    else if (role === "Blockchain Developer") preferredRole = "Blockchain";

    const userData = {
      name: fullName,
      email,
      password,
      skills,
      preferredRole,
    };

    const result = await register(userData);
    if (result.success) {
      navigate("/login", { state: { registered: true } });
    } else {
      setError(result.message);
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] flex items-center justify-center p-0 sm:p-6 md:p-12">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-5xl bg-white rounded-none sm:rounded-[32px] overflow-hidden flex min-h-[700px] shadow-[0_20px_60px_rgba(0,0,0,0.3)] border border-slate-100"
      >
        
        {/* Left Graphics Panel */}
        <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-[#0c0d21] via-[#050816] to-[#1a0f30] p-10 flex-col justify-between relative overflow-hidden text-white border-r border-white/5">
          {/* Glowing Orbs */}
          <div className="absolute top-0 left-0 w-64 h-64 bg-[#3B82F6]/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 right-0 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(circle_at_center,#fff_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

          {/* Logo Header */}
          <div className="flex items-center gap-2.5 relative z-10 cursor-pointer" onClick={() => navigate("/")}>
            <span className="text-3xl font-black tracking-wider text-white">COSMOQ</span>
          </div>

          {/* Title block */}
          <div className="my-auto py-12 relative z-10">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-4xl lg:text-5xl font-black tracking-tight leading-tight mb-4"
            >
              Build. <br />
              Collaborate. <br />
              <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
                Win Together.
              </span>
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-slate-400 text-sm leading-relaxed max-w-sm"
            >
              Join a community of innovators and build amazing projects together.
            </motion.p>
          </div>

          {/* Illustration Section */}
          <div className="relative w-full h-48 mt-auto flex items-center justify-center z-10">
            <img
              src="/auth_illustration.png"
              alt="Team collaboration illustration"
              className="w-full h-full object-contain pointer-events-none drop-shadow-[0_10px_20px_rgba(168,85,247,0.15)]"
            />
          </div>
        </div>

        {/* Right Form Panel */}
        <div className="w-full md:w-1/2 p-8 sm:p-12 flex flex-col justify-center bg-white text-slate-800 overflow-y-auto max-h-[90vh] md:max-h-none">
          <div className="w-full max-w-sm mx-auto my-auto">
            {/* Header Title */}
            <h3 className="text-2xl font-extrabold text-slate-900 tracking-tight">Create your account</h3>
            <p className="text-slate-400 text-xs mt-1.5 font-medium">Join the AI Hackathon community today</p>

            {/* Error Message */}
            {error && (
              <div className="mt-4 p-3.5 rounded-xl bg-red-50 border border-red-100 text-red-500 text-xs font-bold font-mono">
                {error}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-3.5 mt-5">
              {/* Full Name */}
              <div>
                <label className="block text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-1.5 font-mono">
                  Full Name
                </label>
                <div className="relative">
                  <FaUser className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs" />
                  <input
                    type="text"
                    placeholder="Enter your full name"
                    value={fullName}
                    onChange={(e) => {
                      setFullName(e.target.value);
                      setError("");
                    }}
                    className="w-full bg-slate-55 border border-slate-200 hover:border-slate-355 focus:border-purple-500 rounded-xl py-2 pl-10 pr-4 text-xs text-slate-800 font-semibold outline-none transition-colors placeholder:text-slate-405"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-1.5 font-mono">
                  Email
                </label>
                <div className="relative">
                  <FaEnvelope className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs" />
                  <input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setError("");
                    }}
                    className="w-full bg-slate-55 border border-slate-200 hover:border-slate-355 focus:border-purple-500 rounded-xl py-2 pl-10 pr-4 text-xs text-slate-800 font-semibold outline-none transition-colors placeholder:text-slate-405"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-1.5 font-mono">
                  Password
                </label>
                <div className="relative">
                  <FaLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs" />
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Create a password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setError("");
                    }}
                    className="w-full bg-slate-55 border border-slate-200 hover:border-slate-355 focus:border-purple-500 rounded-xl py-2 pl-10 pr-10 text-xs text-slate-800 font-semibold outline-none transition-colors placeholder:text-slate-405"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-650 transition-colors p-1"
                  >
                    {showPassword ? <FaEyeSlash className="text-xs" /> : <FaEye className="text-xs" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-1.5 font-mono">
                  Confirm Password
                </label>
                <div className="relative">
                  <FaLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs" />
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm your password"
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      setError("");
                    }}
                    className="w-full bg-slate-55 border border-slate-200 hover:border-slate-355 focus:border-purple-500 rounded-xl py-2 pl-10 pr-10 text-xs text-slate-800 font-semibold outline-none transition-colors placeholder:text-slate-405"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-650 transition-colors p-1"
                  >
                    {showConfirmPassword ? <FaEyeSlash className="text-xs" /> : <FaEye className="text-xs" />}
                  </button>
                </div>
              </div>

              {/* Role */}
              <div>
                <label className="block text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-1.5 font-mono">
                  Role
                </label>
                <div className="relative">
                  <FaUser className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs" />
                  <select
                    value={role}
                    onChange={(e) => {
                      setRole(e.target.value);
                      setError("");
                    }}
                    className="w-full bg-slate-55 border border-slate-200 hover:border-slate-355 focus:border-purple-500 rounded-xl py-2 pl-10 pr-4 text-xs text-slate-600 font-semibold outline-none transition-colors cursor-pointer"
                  >
                    <option value="">Select your role</option>
                    <option value="Frontend Developer">Frontend Developer</option>
                    <option value="Backend Developer">Backend Developer</option>
                    <option value="Full Stack Developer">Full Stack Developer</option>
                    <option value="AI/ML Engineer">AI/ML Engineer</option>
                    <option value="UI/UX Designer">UI/UX Designer</option>
                    <option value="DevOps Engineer">DevOps Engineer</option>
                    <option value="Mobile Developer">Mobile Developer</option>
                    <option value="Blockchain Developer">Blockchain Developer</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              {/* Skills (Enter to add) */}
              <div>
                <label className="block text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-1.5 font-mono">
                  Skills
                </label>
                <div className="relative">
                  <FaTag className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-[10px]" />
                  <input
                    type="text"
                    placeholder="Add your skills (e.g. React, Node.js, AI)"
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    onKeyDown={handleAddSkill}
                    className="w-full bg-slate-55 border border-slate-200 hover:border-slate-355 focus:border-purple-500 rounded-xl py-2 pl-10 pr-4 text-xs text-slate-800 font-semibold outline-none transition-colors placeholder:text-slate-405"
                  />
                </div>
                <p className="text-[9px] text-slate-400 font-medium font-mono mt-1">
                  Press Enter to add multiple skills
                </p>

                {/* Skill Chips List */}
                {skills.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {skills.map((s) => (
                      <span
                        key={s}
                        className="pl-2.5 pr-1.5 py-0.5 rounded-lg bg-purple-50 border border-purple-100 text-purple-600 text-[10px] font-bold flex items-center gap-1"
                      >
                        {s}
                        <button
                          type="button"
                          onClick={() => handleRemoveSkill(s)}
                          className="hover:text-red-500 transition-colors p-0.5"
                        >
                          <FaTimes className="text-[8px]" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Terms check */}
              <div className="flex items-start gap-2.5 py-1">
                <input
                  id="agree-checkbox"
                  type="checkbox"
                  checked={agree}
                  onChange={(e) => {
                    setAgree(e.target.checked);
                    setError("");
                  }}
                  className="mt-0.5 w-4 h-4 rounded text-purple-600 bg-slate-50 border-slate-200 focus:ring-purple-500 focus:ring-1 cursor-pointer"
                />
                <label htmlFor="agree-checkbox" className="text-[10px] text-slate-500 font-medium leading-relaxed cursor-pointer select-none">
                  I agree to the{" "}
                  <a href="#" className="text-purple-600 font-bold hover:underline" onClick={(e) => e.preventDefault()}>
                    Terms of Service
                  </a>{" "}
                  and{" "}
                  <a href="#" className="text-purple-600 font-bold hover:underline" onClick={(e) => e.preventDefault()}>
                    Privacy Policy
                  </a>
                </label>
              </div>

              {/* Submit */}
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                type="submit"
                className="w-full py-3 rounded-xl bg-[#FF8A00] hover:bg-purple-500 text-white text-xs font-bold transition-all shadow-md shadow-[#3B82F6]/10 flex items-center justify-center"
              >
                Create Account
              </motion.button>
            </form>

            {/* Footer */}
            <p className="mt-6 text-center text-xs text-slate-400 font-medium">
              Already have an account?{" "}
              <button
                onClick={() => navigate("/login")}
                className="text-purple-600 hover:text-[#FF8A00] font-extrabold hover:underline"
              >
                Login
              </button>
            </p>
          </div>
        </div>

      </motion.div>
    </div>
  );
}

export default Register;
