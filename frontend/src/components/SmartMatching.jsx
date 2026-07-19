import {
  FaBrain,
  FaUsers,
  FaBullseye,
  FaBalanceScale,
  FaCheck,
} from "react-icons/fa";

import {
  motion,
  useInView,
  animate,
} from "framer-motion";

import {
  useEffect,
  useRef,
  useState,
} from "react";

function SmartMatching() {
  const sectionRef = useRef(null);

  const isInView = useInView(sectionRef, {
    once: true,
    amount: 0.4,
  });

  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!isInView) return;

    const controls = animate(0, 88, {
      duration: 2.5,
      onUpdate(value) {
        setProgress(Math.round(value));
      },
    });

    return () => controls.stop();
  }, [isInView]);

  const radius = 55;
  const circumference = 2 * Math.PI * radius;

  const strokeDashoffset =
    circumference -
    (progress / 100) * circumference;

  return (
    <section
      ref={sectionRef}
      id="ai-matching"
      className="relative bg-transparent text-white py-24 overflow-hidden z-10"
    >
      {/* Glow Background */}

      <div className="absolute top-40 left-20 w-96 h-96 bg-[#3B82F6]/10 blur-[140px] rounded-full pointer-events-none"></div>

      <div className="absolute bottom-20 right-20 w-96 h-96 bg-cyan-600/10 blur-[140px] rounded-full pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center">

        {/* LEFT SIDE */}

        <motion.div
          initial={{
            opacity: 0,
            x: -60,
          }}
          whileInView={{
            opacity: 1,
            x: 0,
          }}
          viewport={{
            once: true,
            amount: 0.4,
          }}
          transition={{
            duration: 0.8,
          }}
        >
          <span className="text-cyan-400 border border-cyan-500/35 px-4 py-1.5 rounded-full text-xs tracking-wider bg-[#050816]/20">
            AI MATCHING
          </span>

          <h2 className="text-5xl lg:text-6xl font-bold mt-6 leading-tight">
            Smart Matching.
            <span className="block bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
              Better Teams.
            </span>
          </h2>

          <p className="text-slate-400 mt-6 text-lg max-w-xl">
            Our AI analyzes skills, experience,
            project history and hackathon goals
            to build the most compatible team.
          </p>

          <div className="grid sm:grid-cols-2 gap-8 mt-12">

            <motion.div
              initial={{
                opacity: 0,
                y: 40,
              }}
              whileInView={{
                opacity: 1,
                y: 0,
              }}
              viewport={{
                once: true,
                amount: 0.3,
              }}
              transition={{
                duration: 0.5,
              }}
              whileHover={{
                y: -8,
              }}
              className="flex gap-4"
            >
              <FaBrain className="text-[#FF8A00] text-3xl mt-1" />

              <div>
                <h3 className="font-semibold text-lg">
                  Skill Compatibility
                </h3>

                <p className="text-slate-400 text-sm mt-2">
                  Match teammates based on
                  technical expertise.
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{
                opacity: 0,
                y: 40,
              }}
              whileInView={{
                opacity: 1,
                y: 0,
              }}
              viewport={{
                once: true,
                amount: 0.3,
              }}
              transition={{
                duration: 0.5,
                delay: 0.1,
              }}
              whileHover={{
                y: -8,
              }}
              className="flex gap-4"
            >
              <FaUsers className="text-[#FF8A00] text-3xl mt-1" />

              <div>
                <h3 className="font-semibold text-lg">
                  Experience Level
                </h3>

                <p className="text-slate-400 text-sm mt-2">
                  Balance beginner and advanced
                  contributors.
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{
                opacity: 0,
                y: 40,
              }}
              whileInView={{
                opacity: 1,
                y: 0,
              }}
              viewport={{
                once: true,
                amount: 0.3,
              }}
              transition={{
                duration: 0.5,
                delay: 0.2,
              }}
              whileHover={{
                y: -8,
              }}
              className="flex gap-4"
            >
              <FaBullseye className="text-[#FF8A00] text-3xl mt-1" />

              <div>
                <h3 className="font-semibold text-lg">
                  Goal Alignment
                </h3>

                <p className="text-slate-400 text-sm mt-2">
                  Find teammates with similar
                  hackathon objectives.
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{
                opacity: 0,
                y: 40,
              }}
              whileInView={{
                opacity: 1,
                y: 0,
              }}
              viewport={{
                once: true,
                amount: 0.3,
              }}
              transition={{
                duration: 0.5,
                delay: 0.3,
              }}
              whileHover={{
                y: -8,
              }}
              className="flex gap-4"
            >
              <FaBalanceScale className="text-[#FF8A00] text-3xl mt-1" />

              <div>
                <h3 className="font-semibold text-lg">
                  Team Balance
                </h3>

                <p className="text-slate-400 text-sm mt-2">
                  Ensure every important role
                  is covered.
                </p>
              </div>
            </motion.div>

          </div>
        </motion.div>

                {/* RIGHT SIDE */}

        <motion.div
          initial={{
            opacity: 0,
            x: 60,
          }}
          whileInView={{
            opacity: 1,
            x: 0,
          }}
          viewport={{
            once: true,
            amount: 0.4,
          }}
          transition={{
            duration: 0.8,
          }}
          className="relative"
        >
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-[0_0_50px_rgba(168,85,247,0.15)]">

            <h3 className="text-3xl font-bold mb-2">
              AI Team Recommendation
            </h3>

            <p className="text-blue-400 text-sm mb-8">
              Google Solution Challenge 2026
            </p>

            <div className="grid md:grid-cols-2 gap-6">

              {/* PROFILE CARD */}

              <motion.div
                initial={{
                  opacity: 0,
                  y: 30,
                }}
                whileInView={{
                  opacity: 1,
                  y: 0,
                }}
                viewport={{
                  once: true,
                }}
                whileHover={{
                  y: -5,
                }}
                className="bg-[#050816]/45 border border-white/5/80 backdrop-blur-2xl rounded-3xl p-6 shadow-[0_0_20px_rgba(6,182,212,0.05)]"
              >
                <h4 className="text-slate-300 mb-4">
                  Your Profile
                </h4>

                <div className="flex items-center gap-4">

                  <div className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-500 to-purple-500"></div>

                  <div>
                    <h3 className="font-bold text-xl">
                      Kunal
                    </h3>

                    <p className="text-slate-400 text-sm">
                      Full Stack Developer
                    </p>
                  </div>

                </div>

                <div className="flex flex-wrap gap-2 mt-6">

                  <span className="bg-blue-500/20 text-blue-400 px-3 py-1 rounded-full text-sm">
                    React
                  </span>

                  <span className="bg-blue-500/20 text-blue-400 px-3 py-1 rounded-full text-sm">
                    Node.js
                  </span>

                  <span className="bg-blue-500/20 text-blue-400 px-3 py-1 rounded-full text-sm">
                    MongoDB
                  </span>

                  <span className="bg-blue-500/20 text-blue-400 px-3 py-1 rounded-full text-sm">
                    Python
                  </span>

                </div>
              </motion.div>

              {/* COMPATIBILITY CARD */}

              <motion.div
                initial={{
                  opacity: 0,
                  scale: 0.8,
                }}
                whileInView={{
                  opacity: 1,
                  scale: 1,
                }}
                viewport={{
                  once: true,
                }}
                transition={{
                  duration: 0.7,
                }}
                className="relative bg-[#050816]/45 border border-white/5/80 backdrop-blur-2xl rounded-3xl p-6 flex flex-col items-center justify-center shadow-[0_0_20px_rgba(6,182,212,0.05)]"
              >
                <svg
                  width="140"
                  height="140"
                  className="rotate-[-90deg]"
                >
                  <circle
                    cx="70"
                    cy="70"
                    r={radius}
                    stroke="#1e293b"
                    strokeWidth="10"
                    fill="transparent"
                  />

                  <circle
                    cx="70"
                    cy="70"
                    r={radius}
                    stroke="#a855f7"
                    strokeWidth="10"
                    fill="transparent"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                  />
                </svg>

                <div className="absolute text-center">
                  <h3 className="text-4xl font-bold">
                    {progress}%
                  </h3>

                  <p className="text-slate-400 text-sm">
                    Compatibility
                  </p>
                </div>
              </motion.div>

            </div>

            {/* TEAM MEMBERS */}

            <div className="mt-8">

              <h3 className="font-semibold text-xl mb-4">
                Recommended Team
              </h3>

              <div className="space-y-4">

                <motion.div
                  initial={{
                    opacity: 0,
                    x: 40,
                  }}
                  whileInView={{
                    opacity: 1,
                    x: 0,
                  }}
                  viewport={{
                    once: true,
                  }}
                  whileHover={{
                    scale: 1.02,
                    x: 8,
                  }}
                  className="bg-[#050816]/45 border border-white/5/80 backdrop-blur-xl rounded-2xl p-4 flex justify-between"
                >
                  <span>Harshit Keshari • ML Engineer</span>

                  <span className="text-green-400">
                    91%
                  </span>
                </motion.div>

                <motion.div
                  initial={{
                    opacity: 0,
                    x: 40,
                  }}
                  whileInView={{
                    opacity: 1,
                    x: 0,
                  }}
                  viewport={{
                    once: true,
                  }}
                  transition={{
                    delay: 0.1,
                  }}
                  whileHover={{
                    scale: 1.02,
                    x: 8,
                  }}
                  className="bg-[#050816]/45 border border-white/5/80 backdrop-blur-xl rounded-2xl p-4 flex justify-between"
                >
                  <span>Priya Sharma • UI/UX</span>

                  <span className="text-green-400">
                    87%
                  </span>
                </motion.div>

                <motion.div
                  initial={{
                    opacity: 0,
                    x: 40,
                  }}
                  whileInView={{
                    opacity: 1,
                    x: 0,
                  }}
                  viewport={{
                    once: true,
                  }}
                  transition={{
                    delay: 0.2,
                  }}
                  whileHover={{
                    scale: 1.02,
                    x: 8,
                  }}
                  className="bg-[#050816]/45 border border-white/5/80 backdrop-blur-xl rounded-2xl p-4 flex justify-between"
                >
                  <span>Rohit Kumar • DevOps</span>

                  <span className="text-green-400">
                    85%
                  </span>
                </motion.div>

              </div>

            </div>

            {/* MATCH CHECKS */}

            <div className="grid md:grid-cols-2 gap-4 mt-8">

              <div className="flex items-center gap-3">
                <FaCheck className="text-green-400" />
                <span>Skills Match</span>
              </div>

              <div className="flex items-center gap-3">
                <FaCheck className="text-green-400" />
                <span>Experience Match</span>
              </div>

              <div className="flex items-center gap-3">
                <FaCheck className="text-green-400" />
                <span>Goal Alignment</span>
              </div>

              <div className="flex items-center gap-3">
                <FaCheck className="text-green-400" />
                <span>Team Balance</span>
              </div>

            </div>

            <motion.button
              initial={{
                opacity: 0,
                y: 20,
              }}
              whileInView={{
                opacity: 1,
                y: 0,
              }}
              viewport={{
                once: true,
              }}
              transition={{
                duration: 0.6,
              }}
              whileHover={{
                scale: 1.03,
                boxShadow:
                  "0 0 30px rgba(168,85,247,0.5)",
              }}
              whileTap={{
                scale: 0.97,
              }}
              className="mt-8 w-full bg-[#050816]/40 hover:bg-[#0e1222]/60 border border-cyan-500/35 hover:border-cyan-400 hover:shadow-[0_0_20px_rgba(6,182,212,0.45)] transition-all py-4 rounded-full font-bold tracking-wider text-white"
            >
              View Team Details
            </motion.button>

          </div>
        </motion.div>

      </div>
    </section>
  );
}

export default SmartMatching;