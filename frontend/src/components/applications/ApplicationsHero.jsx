import { motion } from "framer-motion";
import { applicationStats } from "../../data/applicationsData";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 25, scale: 0.9 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: "spring", stiffness: 200, damping: 15 },
  },
};

function ApplicationsHero() {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="mb-8"
    >
      <div className="flex items-start justify-between">
        {/* Left */}
        <div>
          <motion.h1
            variants={itemVariants}
            className="text-4xl lg:text-5xl font-bold flex items-center gap-3"
          >
            My Applications
            <motion.span
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
              className="text-3xl"
            >
              📋
            </motion.span>
          </motion.h1>
          <motion.p
            variants={itemVariants}
            className="text-gray-400 text-base mt-2"
          >
            Track all your team join requests and hackathon registrations in one
            place.
          </motion.p>
        </div>

        {/* Right - Stats */}
        <motion.div
          variants={containerVariants}
          className="hidden xl:flex items-center gap-3"
        >
          {applicationStats.map((stat, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              whileHover={{
                scale: 1.08,
                y: -5,
                transition: { type: "spring", stiffness: 400, damping: 12 },
              }}
              whileTap={{ scale: 0.95 }}
              className={`relative overflow-hidden flex items-center gap-3 px-4 py-3 rounded-xl bg-gradient-to-br ${stat.color} border ${stat.border} backdrop-blur-xl cursor-pointer group`}
            >
              {/* Hover shine */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"
              />

              <motion.span
                animate={{ scale: [1, 1.15, 1] }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: index * 0.3,
                }}
                className="text-lg"
              >
                {stat.icon}
              </motion.span>
              <div>
                <p className="text-xl font-bold text-white">{stat.value}</p>
                <p className="text-[10px] text-gray-400 whitespace-nowrap">
                  {stat.label}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </motion.div>
  );
}

export default ApplicationsHero;
