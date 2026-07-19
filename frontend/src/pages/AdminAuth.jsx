import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FaLock, FaEnvelope, FaUser, FaKey } from "react-icons/fa";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";
import AnimatedBackground from "../components/dashboard/AnimatedBackground";

function AdminAuth() {
  const navigate = useNavigate();
  const { fetchProfile } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    adminSecret: "",
  });

  const handleInputChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (isLogin) {
        // Admin Login
        const res = await api.post("/admin/login", {
          email: formData.email,
          password: formData.password,
        });

        localStorage.setItem("token", res.data.token);
        await fetchProfile();
        navigate("/admin/dashboard");
      } else {
        // Admin Register
        if (!formData.adminSecret) {
          setError("Admin Secret Key is required to register.");
          setLoading(false);
          return;
        }

        const res = await api.post("/admin/register", formData);
        alert(res.data.message || "Registration successful! You can now login.");
        setIsLogin(true);
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Authentication failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-[#050816] text-white flex items-center justify-center p-4">
      <AnimatedBackground />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 w-full max-w-md rounded-3xl bg-[#0e1222]/50 border border-white/5 p-8 backdrop-blur-xl shadow-2xl text-left"
      >
        {/* Glow behind box */}
        <div className="absolute -top-12 -left-12 w-32 h-32 bg-[#3B82F6]/10 rounded-full blur-2xl" />
        <div className="absolute -bottom-12 -right-12 w-32 h-32 bg-purple-600/10 rounded-full blur-2xl" />

        <div className="text-center mb-8">
          <span className="text-4xl block mb-3">🛡️</span>
          <h2 className="text-2xl font-black heading-font bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
            Admin Portal
          </h2>
          <p className="text-xs text-gray-500 mt-1">Authorized Administrative Access Only</p>
        </div>

        {/* Tab Toggle */}
        <div className="flex rounded-xl bg-[#050816]/80 p-1 mb-6 border border-white/5">
          <button
            onClick={() => { setIsLogin(true); setError(""); }}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition ${
              isLogin ? "bg-[#3B82F6]/20 text-white border border-[#3B82F6]/30" : "text-gray-400"
            }`}
          >
            Log In
          </button>
          <button
            onClick={() => { setIsLogin(false); setError(""); }}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition ${
              !isLogin ? "bg-[#3B82F6]/20 text-white border border-[#3B82F6]/30" : "text-gray-400"
            }`}
          >
            Register
          </button>
        </div>

        {/* Error Alert */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs mb-4 text-center"
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleAuthSubmit} className="space-y-4 text-xs">
          {!isLogin && (
            <div>
              <label className="text-gray-400 block mb-1">Name</label>
              <div className="relative">
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Admin Name"
                  required
                  className="w-full bg-[#050816]/80 border border-white/5 rounded-xl py-2.5 pl-9 pr-4 text-white outline-none focus:border-cyan-500 transition placeholder:text-gray-650"
                />
                <FaUser className="absolute left-3 top-3.5 text-gray-500" />
              </div>
            </div>
          )}

          <div>
            <label className="text-gray-400 block mb-1">Email</label>
            <div className="relative">
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="admin@domain.com"
                required
                className="w-full bg-[#050816]/80 border border-white/5 rounded-xl py-2.5 pl-9 pr-4 text-white outline-none focus:border-cyan-500 transition placeholder:text-gray-650"
              />
              <FaEnvelope className="absolute left-3 top-3.5 text-gray-500" />
            </div>
          </div>

          <div>
            <label className="text-gray-400 block mb-1">Password</label>
            <div className="relative">
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="••••••••"
                required
                className="w-full bg-[#050816]/80 border border-white/5 rounded-xl py-2.5 pl-9 pr-4 text-white outline-none focus:border-cyan-500 transition placeholder:text-gray-655"
              />
              <FaLock className="absolute left-3 top-3.5 text-gray-500" />
            </div>
          </div>

          {!isLogin && (
            <div>
              <label className="text-gray-400 block mb-1">Admin Secret Key</label>
              <div className="relative">
                <input
                  type="password"
                  name="adminSecret"
                  value={formData.adminSecret}
                  onChange={handleInputChange}
                  placeholder="Master Passcode"
                  required
                  className="w-full bg-[#050816]/80 border border-white/5 rounded-xl py-2.5 pl-9 pr-4 text-white outline-none focus:border-cyan-500 transition placeholder:text-gray-655"
                />
                <FaKey className="absolute left-3 top-3.5 text-gray-500" />
              </div>
            </div>
          )}

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 font-bold text-white shadow-lg hover:shadow-cyan-500/10 transition mt-6"
          >
            {loading ? "Authenticating..." : isLogin ? "Access Admin Console" : "Create Admin Account"}
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
}

export default AdminAuth;
