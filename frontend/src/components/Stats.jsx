import { useState, useEffect, useRef } from "react";
import { motion, useInView } from "framer-motion";
import { FaUsers, FaTrophy } from "react-icons/fa";
import { MdGroups } from "react-icons/md";
import { HiTrendingUp } from "react-icons/hi";

function Stats() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  const [developers, setDevelopers] = useState(0);
  const [teams, setTeams] = useState(0);
  const [hackathons, setHackathons] = useState(0);
  const [success, setSuccess] = useState(0);

  useEffect(() => {
    if (!isInView) return;

    const interval = setInterval(() => {
      setDevelopers((prev) => {
        if (prev >= 15000) return 15000;
        return prev + 300;
      });

      setTeams((prev) => {
        if (prev >= 3500) return 3500;
        return prev + 70;
      });

      setHackathons((prev) => {
        if (prev >= 600) return 600;
        return prev + 12;
      });

      setSuccess((prev) => {
        if (prev >= 98) return 98;
        return prev + 2;
      });
    }, 20);

    return () => clearInterval(interval);
  }, [isInView]);

  const stats = [
    {
      icon: <FaUsers size={28} className="text-[#3B82F6]" />,
      number: `${(developers / 1000).toFixed(0)}K+`,
      text: "Developers",
    },
    {
      icon: <MdGroups size={28} className="text-[#FF8A00]" />,
      number: `${teams.toLocaleString()}+`,
      text: "Teams Created",
    },
    {
      icon: <FaTrophy size={28} className="text-[#3B82F6]" />,
      number: `${hackathons}+`,
      text: "Hackathons",
    },
    {
      icon: <HiTrendingUp size={28} className="text-[#FF8A00]" />,
      number: `${success}%`,
      text: "Match Success",
    },
  ];

  return (
    <section className="bg-transparent px-6 pb-20 relative z-10">
      <div
        ref={ref}
        className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6"
      >
        {stats.map((item, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{
              duration: 0.6,
              delay: index * 0.1,
            }}
            whileHover={{
              y: -5,
              borderColor: "rgba(255, 255, 255, 0.15)",
              boxShadow: index % 2 === 0 ? "0 0 25px rgba(59, 130, 246, 0.15)" : "0 0 25px rgba(255, 138, 0, 0.15)"
            }}
            className="
              bg-[#0e1222]
              border
              border-white/5
              rounded-2xl
              p-6
              md:p-8
              text-center
              shadow-[0_10px_30px_rgba(5,8,22,0.4)]
              transition-all
              duration-300
            "
          >
            <div className="flex justify-center mb-4">
              {item.icon}
            </div>

            <h2 className="text-white text-3xl md:text-4xl font-extrabold tracking-tight">
              {item.number}
            </h2>

            <p className="text-slate-400 mt-2 text-xs md:text-sm font-medium tracking-wide uppercase">
              {item.text}
            </p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

export default Stats;