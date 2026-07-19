import { motion } from "framer-motion";

function AnimatedBackground() {
  const dots = Array.from({ length: 25 }, (_, i) => ({
    id: i,
    left: `${(i * 4) % 100}%`,
    top: `${(i * 7) % 100}%`,
    duration: 4 + (i % 6),
  }));

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      
      {/* Glow 1 */}
      <motion.div
        animate={{
          x: [0, 150, 0],
          y: [0, 100, 0],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: "linear",
        }}
        className="absolute top-20 left-20 w-96 h-96 rounded-full bg-[#3B82F6]/15 blur-3xl"
      />

      {/* Glow 2 */}
      <motion.div
        animate={{
          x: [0, -200, 0],
          y: [0, -120, 0],
        }}
        transition={{
          duration: 18,
          repeat: Infinity,
          ease: "linear",
        }}
        className="absolute bottom-20 right-20 w-[500px] h-[500px] rounded-full bg-cyan-500/20 blur-3xl"
      />

      {/* Floating Dots */}
      {dots.map((dot) => (
        <motion.div
          key={dot.id}
          initial={{
            opacity: 0.2,
          }}
          animate={{
            y: [0, -100],
            opacity: [0.2, 1, 0.2],
          }}
          transition={{
            duration: dot.duration,
            repeat: Infinity,
          }}
          className="absolute w-2 h-2 bg-white rounded-full"
          style={{
            left: dot.left,
            top: dot.top,
          }}
        />
      ))}

      {/* Grid */}
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />
    </div>
  );
}

export default AnimatedBackground;