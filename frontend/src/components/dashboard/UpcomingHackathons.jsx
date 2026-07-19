import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  FaUsers,
  FaCalendarAlt,
  FaTrophy,
  FaArrowRight,
} from "react-icons/fa";
import api from "../../api/axios";
import { useNavigate } from "react-router-dom";

function UpcomingHackathons() {
  const [hackathonsList, setHackathonsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const loadHackathons = async () => {
      try {
        const res = await api.get("/hackathons", { params: { limit: 3, sort: "newest" } });
        const list = Array.isArray(res.data) ? res.data : res.data.hackathons || [];
        setHackathonsList(list.slice(0, 3));
      } catch (err) {
        console.error("Error loading upcoming hackathons:", err);
      } finally {
        setLoading(false);
      }
    };
    loadHackathons();
  }, []);

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
      <div className="absolute top-0 right-0 w-48 h-48 bg-[#3B82F6]/10 rounded-full blur-3xl" />

      {/* Header */}
      <div className="flex justify-between items-center mb-8 relative z-10">
        <div>
          <h2 className="text-2xl font-bold page-title">
            Upcoming Hackathons
          </h2>

          <p className="text-sm text-slate-400 mt-1">
            Explore trending opportunities
          </p>
        </div>

        <button
          onClick={() => navigate("/hackathons")}
          className="
          px-4
          py-2
          rounded-xl
          bg-[#0e1222]
          hover:bg-[#FF8A00]
          transition
          "
        >
          View All
        </button>
      </div>

      <div className="space-y-5 relative z-10">
        {loading ? (
          <p className="text-slate-400 text-center py-8">Loading hackathons...</p>
        ) : hackathonsList.length === 0 ? (
          <p className="text-slate-400 text-center py-8">No upcoming hackathons found.</p>
        ) : (
          hackathonsList.map((hackathon, index) => (
            <motion.div
              key={hackathon._id || index}
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{
                delay: index * 0.15,
              }}
              whileHover={{
                scale: 1.02,
                y: -5,
              }}
              className="
              relative
              overflow-hidden
              rounded-3xl
              bg-[#0e1222]/75
              border
              border-white/5
              p-5
              "
            >
              {/* Shine Effect */}
              <motion.div
                animate={{
                  x: ["-100%", "250%"],
                }}
                transition={{
                  duration: 6,
                  repeat: Infinity,
                  ease: "linear",
                }}
                className="
                absolute
                inset-y-0
                w-20
                bg-gradient-to-r
                from-transparent
                via-purple-400/10
                to-transparent
                "
              />

              {/* Top Row */}
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-lg">
                    {hackathon.title}
                  </h3>

                  <div className="flex gap-2 mt-3 flex-wrap">
                    <span
                      className="
                      px-3
                      py-1
                      rounded-full
                      text-xs
                      bg-[#FF8A00]/10
                      text-cyan-300
                      border
                      border-white/5
                      "
                    >
                      {hackathon.badge || hackathon.mode || "Online"}
                    </span>

                    <span
                      className="
                      px-3
                      py-1
                      rounded-full
                      text-xs
                      bg-green-500/10
                      text-green-300
                      border
                      border-green-500/20
                      "
                    >
                      {hackathon.status || "Open"}
                    </span>
                  </div>
                </div>

                <div
                  className="
                  flex
                  items-center
                  gap-2
                  text-yellow-400
                  font-semibold
                  "
                >
                  <FaTrophy />
                  {hackathon.prize}
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4 mt-5">
                <div className="flex items-center gap-2 text-slate-400">
                  <FaUsers />
                  <span>{hackathon.participants || "1000+"} Participants</span>
                </div>

                <div className="flex items-center gap-2 text-slate-400">
                  <FaCalendarAlt />
                  <span>{hackathon.date}</span>
                </div>
              </div>

              {/* CTA */}
              <div className="flex justify-end mt-5">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate(`/hackathons/${hackathon._id || hackathon.id}`)}
                  className="
                  flex
                  items-center
                  gap-2
                  px-4
                  py-2
                  rounded-xl
                  bg-gradient-to-r
                  from-purple-500
                  to-blue-500
                  font-medium
                  "
                >
                  Register
                  <FaArrowRight />
                </motion.button>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </motion.div>
  );
}

export default UpcomingHackathons;
