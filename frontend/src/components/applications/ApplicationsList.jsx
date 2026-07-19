import { motion } from "framer-motion";
import ApplicationRow from "./ApplicationRow";
import { applications } from "../../data/applicationsData";

function ApplicationsList() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, delay: 0.5 }}
      className="space-y-4"
    >
      {applications.map((app, index) => (
        <ApplicationRow key={app.id} app={app} index={index} />
      ))}
    </motion.div>
  );
}

export default ApplicationsList;
