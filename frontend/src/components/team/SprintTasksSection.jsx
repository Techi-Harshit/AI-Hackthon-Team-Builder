import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { FaCheckCircle, FaRegCircle } from "react-icons/fa";

const priorityColors = {
  high: "text-red-300 bg-red-500/10 border-red-500/25 shadow-red-500/10",
  medium: "text-amber-300 bg-amber-500/10 border-amber-500/25 shadow-amber-500/10",
  low: "text-blue-300 bg-blue-500/10 border-blue-500/25 shadow-blue-500/10",
  done: "text-emerald-300 bg-emerald-500/10 border-emerald-500/25 shadow-emerald-500/10",
};

function SprintTasksSection({ team }) {
  const [tasks, setTasks] = useState([]);
  const [filter, setFilter] = useState("all");

  // Generate dynamic tasks based on team structure
  useEffect(() => {
    if (!team) return;

    const displayMembers = [];
    const seenIds = new Set();
    
    if (team.leader) {
      displayMembers.push(team.leader);
      seenIds.add(String(team.leader._id || team.leader.id || team.leader));
    }
    
    if (team.members) {
      team.members.forEach(m => {
        if (m && m._id && !seenIds.has(String(m._id))) {
          displayMembers.push(m);
          seenIds.add(String(m._id));
        }
      });
    }

    const generated = [];
    let taskId = 1;

    displayMembers.forEach(member => {
      const role = (member.preferredRole || member.role || "Developer").toLowerCase();
      const name = member.name || "Developer";

      if (role.includes("frontend") || role.includes("design") || role.includes("full")) {
        generated.push({
          id: taskId++,
          title: "Build UI Mockups & Tailwind Design System Tokens",
          assignee: name,
          avatar: member.avatar,
          priority: "done",
          progress: 100
        });
        generated.push({
          id: taskId++,
          title: "Frontend Dashboard UI Layout Integration",
          assignee: name,
          avatar: member.avatar,
          priority: "high",
          progress: 90
        });
      }
      if (role.includes("backend") || role.includes("full") || role.includes("devops")) {
        generated.push({
          id: taskId++,
          title: "Setup Auth API Express JWT Token Handling",
          assignee: name,
          avatar: member.avatar,
          priority: "high",
          progress: 75
        });
        generated.push({
          id: taskId++,
          title: "Database Optimization & Schema Definition",
          assignee: name,
          avatar: member.avatar,
          priority: "low",
          progress: 30
        });
      }
      if (role.includes("ai") || role.includes("ml") || role.includes("data") || role.includes("science")) {
        generated.push({
          id: taskId++,
          title: "ML Model Training & Parameter Tuning Pipeline",
          assignee: name,
          avatar: member.avatar,
          priority: "medium",
          progress: 60
        });
        generated.push({
          id: taskId++,
          title: "AI Recommendation Engine Gemini API Integration",
          assignee: name,
          avatar: member.avatar,
          priority: "high",
          progress: 45
        });
      }
      if (role.includes("devops") || role.includes("cloud")) {
        generated.push({
          id: taskId++,
          title: "CI/CD Pipeline Setup & Dockerization Configs",
          assignee: name,
          avatar: member.avatar,
          priority: "medium",
          progress: 45
        });
      }
    });

    // Fallbacks
    if (generated.length === 0) {
      generated.push({
        id: 1,
        title: "Define core product features roadmap",
        assignee: "Squad Core",
        avatar: "",
        priority: "medium",
        progress: 60
      });
    }

    setTasks(generated);
  }, [team]);

  const toggleTaskCompletion = (taskId) => {
    setTasks(
      tasks.map((task) => {
        if (task.id === taskId) {
          const isDone = task.priority === "done";
          return {
            ...task,
            progress: isDone ? 50 : 100,
            priority: isDone ? "medium" : "done"
          };
        }
        return task;
      })
    );
  };

  const filteredTasks = tasks.filter((task) => {
    if (filter === "all") return true;
    if (filter === "in-progress") return task.priority !== "done";
    if (filter === "completed") return task.priority === "done";
    return true;
  });

  return (
    <div className="rounded-3xl border border-white/5 bg-[#0e1222]/20 backdrop-blur-xl p-6 mb-8 text-left">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h3 className="text-xl font-bold text-white heading-font">Sprint Tasks</h3>
          <p className="text-xs text-gray-400 mt-1">Track sprint deliverables, assignee progress, and task statuses.</p>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1.5 bg-[#050816]/60 p-1 rounded-xl border border-white/5 self-start select-none">
          {["all", "in-progress", "completed"].map((type) => (
            <button
              key={type}
              onClick={() => setFilter(type)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all duration-300 relative cursor-pointer ${
                filter === type ? "text-white" : "text-gray-400 hover:text-gray-200"
              }`}
            >
              {filter === type && (
                <motion.div
                  layoutId="activeTaskTab"
                  className="absolute inset-0 bg-[#0e1222] rounded-lg border border-white/10"
                  transition={{ type: "spring", stiffness: 350, damping: 25 }}
                />
              )}
              <span className="relative z-10">{type.replace("-", " ")}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Task List */}
      <div className="space-y-4">
        <AnimatePresence mode="popLayout">
          {filteredTasks.map((task) => {
            const isCompleted = task.priority === "done";

            return (
              <motion.div
                key={task.id}
                layout
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ type: "spring", stiffness: 200, damping: 20 }}
                className={`relative overflow-hidden rounded-2xl border p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all duration-300 group ${
                  isCompleted
                    ? "border-emerald-500/20 bg-emerald-500/2 hover:border-emerald-500/30"
                    : "border-white/5 bg-[#050816]/40 hover:border-slate-800 hover:bg-[#0e1222]/10"
                }`}
              >
                {/* Left - Title + Checkbox */}
                <div className="flex items-start gap-3.5 flex-1 min-w-0">
                  <motion.button
                    whileHover={{ scale: 1.15 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => toggleTaskCompletion(task.id)}
                    className={`mt-0.5 text-lg flex-shrink-0 transition-colors cursor-pointer ${
                      isCompleted ? "text-emerald-400" : "text-gray-500 hover:text-[#3B82F6]"
                    }`}
                  >
                    {isCompleted ? <FaCheckCircle /> : <FaRegCircle />}
                  </motion.button>
                  <div className="min-w-0 space-y-2">
                    <h4 className={`text-sm font-bold truncate transition-all ${
                      isCompleted ? "text-gray-500 line-through" : "text-white group-hover:text-cyan-300"
                    }`}>
                      {task.title}
                    </h4>
                    
                    {/* Progress Bar */}
                    <div className="flex items-center gap-3">
                      <div className="w-24 h-1 bg-black/40 rounded-full overflow-hidden">
                        <div 
                          className={`h-full transition-all duration-500 ${isCompleted ? 'bg-emerald-500' : 'bg-purple-500'}`} 
                          style={{ width: `${task.progress}%` }} 
                        />
                      </div>
                      <span className="text-[10px] font-mono text-gray-500">{task.progress}% Done</span>
                    </div>
                  </div>
                </div>

                {/* Right - Assignee + Priority Badge */}
                <div className="flex items-center gap-4 shrink-0 sm:ml-0 ml-7 select-none">
                  {/* Assignee Avatar Card */}
                  <div className="flex items-center gap-2">
                    <img
                      src={task.avatar && (task.avatar.startsWith("http") || task.avatar.startsWith("data:")) ? task.avatar : `https://api.dicebear.com/7.x/bottts/svg?seed=${task.assignee}`}
                      alt={task.assignee}
                      className="w-6 h-6 rounded-full bg-slate-900 border border-white/10"
                    />
                    <span className="text-xs text-gray-400 font-bold">{task.assignee}</span>
                  </div>

                  {/* Priority Badge */}
                  <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border shadow-sm ${
                    priorityColors[task.priority] || priorityColors.medium
                  }`}>
                    {task.priority}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default SprintTasksSection;
