import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { FaEnvelope, FaLock, FaEye, FaEyeSlash, FaGithub } from "react-icons/fa";
import { useAuth } from "../context/AuthContext";

function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const registered = location.state?.registered;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError("Please fill in all fields.");
      return;
    }
    
    setError("");
    const result = await login(email, password);
    if (result.success) {
      navigate("/dashboard");
    } else {
      setError(result.message);
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] flex items-center justify-center p-0 sm:p-6 md:p-12">
      {/* Outer Card Wrapper */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-5xl bg-white rounded-none sm:rounded-[32px] overflow-hidden flex min-h-[680px] shadow-[0_20px_60px_rgba(0,0,0,0.3)] border border-slate-100"
      >
        
        {/* Left Graphics Panel (Visible on md and up) */}
        <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-[#0c0d21] via-[#050816] to-[#1a0f30] p-10 flex-col justify-between relative overflow-hidden text-white border-r border-white/5">
          {/* Decorative Glowing Orbs */}
          <div className="absolute top-0 left-0 w-64 h-64 bg-[#3B82F6]/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 right-0 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(circle_at_center,#fff_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

          {/* Logo Header */}
          <div className="flex items-center gap-2.5 relative z-10 cursor-pointer" onClick={() => navigate("/")}>
            <span className="text-3xl font-black tracking-wider text-white">COSMOQ</span>
          </div>

          {/* Welcome Text block */}
          <div className="my-auto py-12 relative z-10">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-4xl lg:text-5xl font-black tracking-tight leading-tight mb-4"
            >
              Welcome <br />
              <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
                Back!
              </span>
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-slate-400 text-sm leading-relaxed max-w-sm"
            >
              Login to continue your journey and find the perfect team.
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
        <div className="w-full md:w-1/2 p-8 sm:p-12 lg:p-16 flex flex-col justify-center bg-white text-slate-800">
          <div className="w-full max-w-sm mx-auto">
            {/* Header Title */}
            <h3 className="text-2xl font-extrabold text-slate-900 tracking-tight">Login to your account</h3>
            <p className="text-slate-400 text-xs mt-1.5 font-medium">Welcome back! Please login to continue</p>

            {/* Error Message */}
            {error && (
              <div className="mt-4 p-3.5 rounded-xl bg-red-50 border border-red-100 text-red-500 text-xs font-bold font-mono">
                {error}
              </div>
            )}

            {/* Success Message */}
            {!error && registered && (
              <div className="mt-4 p-3.5 rounded-xl bg-green-50 border border-green-100 text-green-600 text-xs font-bold font-mono">
                Registration Successful! Please login to continue.
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4 mt-6">
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
                    className="w-full bg-slate-50 border border-slate-200 hover:border-slate-350 focus:border-purple-500 rounded-xl py-2.5 pl-10 pr-4 text-xs text-slate-800 font-semibold outline-none transition-colors placeholder:text-slate-400"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="block text-[10px] uppercase font-bold tracking-wider text-slate-400 font-mono">
                    Password
                  </label>
                  <a
                    href="#"
                    onClick={(e) => e.preventDefault()}
                    className="text-[10px] font-extrabold text-purple-600 hover:text-[#FF8A00] transition-colors font-mono"
                  >
                    Forgot Password?
                  </a>
                </div>
                <div className="relative">
                  <FaLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs" />
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setError("");
                    }}
                    className="w-full bg-slate-50 border border-slate-200 hover:border-slate-350 focus:border-purple-500 rounded-xl py-2.5 pl-10 pr-10 text-xs text-slate-800 font-semibold outline-none transition-colors placeholder:text-slate-400"
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

              {/* Submit */}
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                type="submit"
                className="w-full mt-2 py-3 rounded-xl bg-[#FF8A00] hover:bg-purple-500 text-white text-xs font-bold transition-all shadow-md shadow-[#3B82F6]/10 flex items-center justify-center gap-2"
              >
                Login
              </motion.button>
            </form>

            {/* Divider */}
            <div className="relative flex py-5 items-center">
              <div className="flex-grow border-t border-slate-100"></div>
              <span className="flex-shrink mx-4 text-slate-400 text-[10px] font-bold uppercase tracking-wider font-mono">
                or
              </span>
              <div className="flex-grow border-t border-slate-100"></div>
            </div>

            {/* Social Logins */}
            <div className="space-y-2.5">
              {/* Google */}
              <button
                type="button"
                onClick={() => navigate("/dashboard")}
                className="w-full flex items-center justify-center gap-2.5 py-2.5 rounded-xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-colors text-xs font-semibold text-slate-700"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#EA4335"
                    d="M12 5.04c1.66 0 3.2.57 4.38 1.69l3.27-3.27C17.68 1.54 14.98 1 12 1 7.35 1 3.37 3.68 1.39 7.56l3.89 3C6.22 7.56 8.87 5.04 12 5.04z"
                  />
                  <path
                    fill="#4285F4"
                    d="M23.49 12.27c0-.81-.07-1.59-.2-2.36H12v4.51h6.43c-.28 1.44-1.1 2.67-2.33 3.5l3.61 2.8c2.11-1.95 3.33-4.83 3.33-8.45z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.28 14.56c-.24-.72-.38-1.5-.38-2.31s.14-1.59.38-2.31l-3.89-3C.5 8.78 0 10.33 0 12s.5 3.22 1.39 4.75l3.89-3z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c3.24 0 5.95-1.08 7.93-2.91l-3.61-2.8c-1.1.74-2.51 1.18-4.32 1.18-3.13 0-5.78-2.52-6.73-5.52l-3.89 3C3.37 20.32 7.35 23 12 23z"
                  />
                </svg>
                Continue with Google
              </button>

              {/* GitHub */}
              <button
                type="button"
                onClick={() => navigate("/dashboard")}
                className="w-full flex items-center justify-center gap-2.5 py-2.5 rounded-xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-colors text-xs font-semibold text-slate-700"
              >
                <FaGithub className="text-sm text-slate-800" />
                Continue with GitHub
              </button>
            </div>

            {/* Footer */}
            <p className="mt-8 text-center text-xs text-slate-400 font-medium">
              Don't have an account?{" "}
              <button
                onClick={() => navigate("/register")}
                className="text-purple-600 hover:text-[#FF8A00] font-extrabold hover:underline"
              >
                Register
              </button>
            </p>
          </div>
        </div>

      </motion.div>
    </div>
  );
}

export default Login;
