import { motion } from "framer-motion";
import { useState } from "react";
import { applicationTabs } from "../../data/applicationsData";

function ApplicationsTabs() {
  const [activeTab, setActiveTab] = useState("team");

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
      className="border-b border-white/5 mb-6"
    >
      <div className="flex gap-1">
        {applicationTabs.map((tab) => (
          <motion.button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`relative px-5 py-3 text-sm font-medium transition-all duration-300 ${
              activeTab === tab.id
                ? "text-[#3B82F6]"
                : "text-gray-500 hover:text-gray-300"
            }`}
          >
            {activeTab === tab.id && (
              <motion.div
                layoutId="activeAppTab"
                className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-purple-500 to-blue-500 rounded-full"
                transition={{ type: "spring", bounce: 0.25, duration: 0.5 }}
              />
            )}
            <span className="relative z-10">{tab.label}</span>
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
}

export default ApplicationsTabs;
