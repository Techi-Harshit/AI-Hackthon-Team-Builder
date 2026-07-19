import { motion } from "framer-motion";
import {
  FaUserCheck,
  FaEye,
  FaTrophy,
  FaUsers,
} from "react-icons/fa";

const activities = [
  {
    icon: <FaUserCheck />,
    title: "Aman Patel",
    desc: "accepted your team invitation",
    time: "2 hours ago",
    color: "text-green-400",
  },
  {
    icon: <FaEye />,
    title: "Priya Sharma",
    desc: "viewed your profile",
    time: "5 hours ago",
    color: "text-[#3B82F6]",
  },
  {
    icon: <FaTrophy />,
    title: "Google Solution Challenge",
    desc: "application shortlisted",
    time: "1 day ago",
    color: "text-yellow-400",
  },
  {
    icon: <FaUsers />,
    title: "AI Innovators",
    desc: "new team match found",
    time: "1 day ago",
    color: "text-blue-400",
  },
];

function RecentActivity() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 80 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="
      bg-[#0e1222]/70
      backdrop-blur-xl
      border
      border-white/5
      rounded-3xl
      p-6
      "
    >
      <h2 className="text-xl font-bold mb-6">
        Recent Activity
      </h2>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        {activities.map((item, index) => (
          <motion.div
            key={index}
            initial={{
              opacity: 0,
              y: 50,
            }}
            whileInView={{
              opacity: 1,
              y: 0,
            }}
            viewport={{ once: true }}
            transition={{
              delay: index * 0.12,
            }}
            whileHover={{
              y: -8,
            }}
            className="
            relative
            overflow-hidden
            rounded-2xl
            bg-[#050816]/70
            border
            border-white/5
            p-5
            "
          >
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
              }}
              className={`text-2xl ${item.color}`}
            >
              {item.icon}
            </motion.div>

            <h3 className="font-semibold mt-4">
              {item.title}
            </h3>

            <p className="text-sm text-slate-400 mt-2">
              {item.desc}
            </p>

            <p className="text-xs text-slate-500 mt-4">
              {item.time}
            </p>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

export default RecentActivity;