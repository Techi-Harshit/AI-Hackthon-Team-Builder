import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { userPreferences } from "../../data/recommendationsData";
import { FaEdit, FaTimes, FaSave, FaCheck } from "react-icons/fa";

function PreferencesCard() {
  const [isEditing, setIsEditing] = useState(false);
  const [preferences, setPreferences] = useState(userPreferences);
  const [tempRoles, setTempRoles] = useState(preferences.preferredRoles);

  const availableRoles = ["Full Stack Developer", "Backend Developer", "Frontend Developer", "ML Engineer", "UI/UX Designer"];

  const handleRoleToggle = (role) => {
    if (tempRoles.includes(role)) {
      setTempRoles(tempRoles.filter((r) => r !== role));
    } else {
      setTempRoles([...tempRoles, role]);
    }
  };

  const handleSave = () => {
    setPreferences({
      ...preferences,
      preferredRoles: tempRoles,
    });
    setIsEditing(false);
  };

  return (
    <div className="rounded-3xl border border-white/5 bg-[#0e1222]/20 backdrop-blur-xl p-6 mb-6 relative overflow-hidden">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-lg font-bold text-white heading-font">Your Preferences</h3>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            setTempRoles(preferences.preferredRoles);
            setIsEditing(true);
          }}
          className="text-2xs font-semibold text-[#3B82F6] hover:text-cyan-300 transition-colors uppercase tracking-wider flex items-center gap-1"
        >
          <FaEdit />
          Edit
        </motion.button>
      </div>

      <div className="space-y-4 text-xs">
        <div>
          <span className="block text-gray-500 font-bold uppercase tracking-wider text-4xs">Looking For</span>
          <span className="block text-gray-200 mt-1 font-semibold">{preferences.lookingFor}</span>
        </div>

        <div>
          <span className="block text-gray-500 font-bold uppercase tracking-wider text-4xs">Preferred Roles</span>
          <div className="flex flex-wrap gap-1.5 mt-1.5">
            {preferences.preferredRoles.map((role, idx) => (
              <span
                key={idx}
                className="px-2.5 py-1 rounded-lg bg-[#FF8A00]/10 text-cyan-300 border border-white/5 font-semibold"
              >
                {role}
              </span>
            ))}
          </div>
        </div>

        <div>
          <span className="block text-gray-500 font-bold uppercase tracking-wider text-4xs">Skills You Have</span>
          <div className="flex flex-wrap gap-1.5 mt-1.5">
            {preferences.skillsHave.map((skill, idx) => (
              <span
                key={idx}
                className="px-2 py-0.5 rounded bg-[#050816]/80 text-slate-400 border border-white/5"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>

        <div>
          <span className="block text-gray-500 font-bold uppercase tracking-wider text-4xs">Hackathon Preferences</span>
          <div className="flex flex-wrap gap-1.5 mt-1.5">
            {preferences.hackathonPrefs.map((pref, idx) => (
              <span
                key={idx}
                className="px-2 py-0.5 rounded bg-[#050816]/80 text-slate-400 border border-white/5"
              >
                {pref}
              </span>
            ))}
          </div>
        </div>

        <div>
          <span className="block text-gray-500 font-bold uppercase tracking-wider text-4xs">Availability</span>
          <span className="block text-gray-250 mt-1 font-semibold">{preferences.availability}</span>
        </div>
      </div>

      {/* Slide-in Preference Editor Modal */}
      <AnimatePresence>
        {isEditing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-[#050816]/95 backdrop-blur-md p-6 flex flex-col justify-between z-30"
          >
            <div>
              <div className="flex items-center justify-between border-b border-white/5 pb-3 mb-4">
                <h4 className="font-bold text-white text-sm heading-font">Edit Preferences</h4>
                <button
                  onClick={() => setIsEditing(false)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <FaTimes />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <span className="block text-gray-500 font-bold uppercase tracking-wider text-4xs mb-2">
                    Preferred Roles
                  </span>
                  <div className="space-y-1.5">
                    {availableRoles.map((role) => {
                      const isChecked = tempRoles.includes(role);
                      return (
                        <div
                          key={role}
                          onClick={() => handleRoleToggle(role)}
                          className={`flex items-center justify-between p-2.5 rounded-xl border text-xs cursor-pointer select-none transition-all ${
                            isChecked
                              ? "bg-[#3B82F6]/15 border-purple-500 text-white"
                              : "bg-[#0e1222] border-white/5 text-gray-450 hover:border-white/10"
                          }`}
                        >
                          <span>{role}</span>
                          <span className={`w-4 h-4 rounded border flex items-center justify-center text-3xs ${
                            isChecked ? "bg-purple-500 border-purple-400 text-white" : "border-white/10"
                          }`}>
                            {isChecked && <FaCheck />}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-3 border-t border-white/5 pt-4 mt-auto">
              <button
                onClick={() => setIsEditing(false)}
                className="flex-1 py-2 rounded-xl bg-[#0e1222] hover:bg-slate-850 border border-white/5 text-xs font-bold text-gray-350 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="flex-1 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 border border-[#FF8A00]/25 text-xs font-bold text-white flex items-center justify-center gap-1.5 shadow-lg shadow-[#3B82F6]/10 hover:shadow-[#3B82F6]/20 transition-all"
              >
                <FaSave />
                Save Changes
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default PreferencesCard;
