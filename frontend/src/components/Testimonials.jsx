import { motion } from "framer-motion";
import { FaQuoteLeft } from "react-icons/fa";

function Testimonials() {
  const reviews = [
    {
      name: "Aman Singh",
      role: "ML Engineer",
      review: "Found an amazing team and won my first hackathon. The AI stack compatibility prediction is incredibly accurate.",
      avatar: "https://i.pravatar.cc/100?img=33",
    },
    {
      name: "Priya Sharma",
      role: "UI/UX Designer",
      review: "Finding a designer who codes is tough. The role matching filter instantly paired me with developers who understood Figma.",
      avatar: "https://i.pravatar.cc/100?img=44",
    },
    {
      name: "Rohit Kumar",
      role: "Backend Dev",
      review: "Collaborating inside the live workspace before registering saved us hours of coordinate alignments.",
      avatar: "https://i.pravatar.cc/100?img=60",
    },
    {
      name: "Vikram Malhotra",
      role: "Full Stack Dev",
      review: "Our team had a huge gap in Python skills. The automated gap analysis recommended Kunal, and we ended up winning the challenge.",
      avatar: "https://i.pravatar.cc/100?img=12",
    },
  ];

  return (
    <section className="bg-transparent py-24 overflow-hidden relative z-10">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Header */}
        <div className="text-center mb-16">
          <span className="text-[#3B82F6] border border-[#3B82F6]/25 px-4 py-1.5 rounded-full text-xs tracking-wider bg-white/2 inline-block mb-4">
            REVIEWS
          </span>
          <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight">
            Loved by <span className="bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">Hackers Worldwide</span>
          </h2>
          <p className="text-slate-400 mt-4 text-xs md:text-sm max-w-xl mx-auto leading-relaxed">
            See how developers are using our AI recommendations to build dream teams and ship projects.
          </p>
        </div>

        {/* Infinite Slider Wrapper */}
        <div className="relative w-full">
          <motion.div
            className="flex gap-6 w-max"
            animate={{
              x: ["0%", "-50%"],
            }}
            transition={{
              duration: 30,
              repeat: Infinity,
              ease: "linear",
            }}
          >
            {[...reviews, ...reviews].map((review, index) => (
              <motion.div
                key={index}
                whileHover={{
                  y: -6,
                  borderColor: "rgba(255, 255, 255, 0.15)",
                }}
                className="
                  w-[340px]
                  bg-[#0e1222]/80
                  backdrop-blur-xl
                  border
                  border-white/5
                  rounded-3xl
                  p-8
                  relative
                  shrink-0
                  cursor-pointer
                  transition-all
                  duration-300
                  shadow-[0_10px_25px_rgba(5,8,22,0.45)]
                "
              >
                {/* Quote Icon overlay */}
                <FaQuoteLeft className="absolute top-6 right-8 text-white/5 text-4xl" />

                {/* Review Text */}
                <p className="text-slate-300 text-xs md:text-sm leading-relaxed relative z-10">
                  "{review.review}"
                </p>

                {/* Developer Profile Info */}
                <div className="flex items-center gap-3 mt-8 relative z-10 border-t border-white/5/60 pt-4">
                  <img
                    src={review.avatar}
                    alt={review.name}
                    className="w-9 h-9 rounded-full object-cover border border-[#FF8A00]/25"
                  />
                  <div className="text-left leading-tight">
                    <h4 className="text-white text-xs font-bold">{review.name}</h4>
                    <p className="text-[#3B82F6] text-[10px] font-semibold mt-0.5">{review.role}</p>
                  </div>
                </div>

              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}

export default Testimonials;