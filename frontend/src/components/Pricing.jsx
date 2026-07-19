import { motion } from "framer-motion";
import { FaCheck } from "react-icons/fa";

function Pricing() {
  const plans = [
    {
      name: "Free",
      price: "$0",
      desc: "For developers looking to join existing teams and discover hackathons.",
      features: [
        "Discover global hackathons",
        "Join active developer teams",
        "Basic search filters",
        "Standard member profile",
      ],
      cta: "Get Started",
      featured: false,
    },
    {
      name: "Pro",
      price: "$12",
      desc: "For active hackers wanting AI matchmaker suggestions and stack optimizations.",
      features: [
        "Everything in Free",
        "Unlimited AI teammate matches",
        "Automated stack skill gap analysis",
        "Secure pre-matching messaging",
        "Verified developer badge",
      ],
      cta: "Upgrade to Pro",
      featured: true,
    },
    {
      name: "Organizer",
      price: "$49",
      desc: "For hackathon hosts looking to coordinate registrations and teams creation.",
      features: [
        "Host and list hackathons",
        "View developer stack matrices",
        "Export participant teams profiles",
        "Featured hackathon listing",
        "Prioritized partner matching",
      ],
      cta: "Contact Sales",
      featured: false,
    },
  ];

  return (
    <section id="pricing" className="bg-transparent py-24 px-6 relative z-10">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <span className="text-cyan-400 border border-[#3B82F6]/25 px-4 py-1.5 rounded-full text-xs tracking-wider bg-white/2 inline-block mb-4">
            PRICING
          </span>
          <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight">
            Flexible Plans for <span className="bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">Every Need</span>
          </h2>
          <p className="text-slate-400 mt-4 text-xs md:text-sm max-w-xl mx-auto leading-relaxed">
            Choose the right level of AI assistance to optimize your collaborative hackathon projects.
          </p>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid md:grid-cols-3 gap-8 items-stretch max-w-5xl mx-auto">
          {plans.map((plan, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              whileHover={{
                y: -6,
                borderColor: plan.featured ? "rgba(59, 130, 246, 0.4)" : "rgba(255, 255, 255, 0.15)",
                boxShadow: plan.featured ? "0 15px 35px rgba(59,130,246,0.12)" : "0 10px 25px rgba(5,8,22,0.4)"
              }}
              className={`
                bg-[#0e1222]
                border
                rounded-3xl
                p-8
                flex
                flex-col
                justify-between
                transition-all
                duration-300
                relative
                ${plan.featured ? "border-[#3B82F6] shadow-[0_15px_30px_rgba(59,130,246,0.06)]" : "border-white/5"}
              `}
            >
              {plan.featured && (
                <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-[#3B82F6] text-white text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-widest shadow-md">
                  Most Popular
                </span>
              )}

              <div>
                <h3 className="text-white text-xl font-bold">{plan.name}</h3>
                <div className="mt-4 flex items-baseline text-white">
                  <span className="text-4xl md:text-5xl font-black tracking-tight">{plan.price}</span>
                  <span className="text-slate-400 text-sm ml-2">/ month</span>
                </div>
                <p className="text-slate-400 text-xs md:text-sm mt-4 leading-relaxed">{plan.desc}</p>

                {/* Features List */}
                <ul className="mt-8 space-y-3.5">
                  {plan.features.map((feature, fIdx) => (
                    <li key={fIdx} className="flex items-start gap-3 text-xs md:text-sm text-slate-300">
                      <FaCheck className="text-[#3B82F6] text-[10px] shrink-0 mt-1" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Action CTA Button */}
              <button
                className={`
                  mt-8
                  w-full
                  py-3
                  rounded-full
                  text-xs
                  font-bold
                  tracking-wider
                  transition-all
                  duration-300
                  ${plan.featured
                    ? "bg-[#3B82F6] hover:bg-[#2563EB] text-white shadow-[0_0_20px_rgba(59,130,246,0.3)] hover:shadow-[0_0_30px_rgba(59,130,246,0.6)]"
                    : "bg-[#050816]/40 hover:bg-[#0e1222]/60 text-slate-300 hover:text-white border border-white/5 hover:border-white/10"
                  }
                `}
              >
                {plan.cta}
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Pricing;
