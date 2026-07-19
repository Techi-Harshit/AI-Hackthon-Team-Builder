import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaChevronDown } from "react-icons/fa";

function FAQ() {
  const [openIdx, setOpenIdx] = useState(null);

  const faqs = [
    {
      q: "How does the AI teammate matching engine calculate compatibility?",
      a: "Our algorithm calculates compatibility by evaluating several dimensions: technical stack overlap (e.g. matching a React developer with a Node developer to form a complete product stack), timezone preferences, communication habits, past project completions, and project goal alignment.",
    },
    {
      q: "Can I use the platform for any hackathon listed online?",
      a: "Yes! While some hackathons partner with us directly to streamline registrations, you can create a custom team profile for any global hackathon listed on Devpost, MLH, Devfolio, or individual host websites, and match with team members.",
    },
    {
      q: "Is there a way to communicate with matches before inviting them?",
      a: "Absolutely. Once the AI suggests a compatible match, you can open a secure chat directly within the app. This allows you to align on project ideas, stack requirements, and roles before making a final team commitment.",
    },
    {
      q: "What does the Skill Gap Analysis do?",
      a: "If you have a partial team of 2-3 members, the Skill Gap Analysis reads the requirements of the hackathon and lists missing technical skill categories. It then prioritizes search results for developers who possess those specific missing technologies.",
    },
    {
      q: "What is the difference between Pro and Organizer plans?",
      a: "The Pro plan is for individual developers to unlock unlimited matching recommendations, gap evaluations, and pre-match chat capabilities. The Organizer plan is for hackathon hosts to list challenges, export registration spreadsheets, and manage team submissions.",
    },
  ];

  const toggleFAQ = (idx) => {
    setOpenIdx(openIdx === idx ? null : idx);
  };

  return (
    <section className="bg-transparent py-24 px-6 relative z-10">
      <div className="max-w-4xl mx-auto w-full">
        {/* Header */}
        <div className="text-center mb-16">
          <span className="text-[#FF8A00] border border-[#FF8A00]/25 px-4 py-1.5 rounded-full text-xs tracking-wider bg-white/2 inline-block mb-4">
            QUESTIONS
          </span>
          <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight">
            Frequently Asked <span className="bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">Questions</span>
          </h2>
          <p className="text-slate-400 mt-4 text-xs md:text-sm max-w-xl mx-auto leading-relaxed">
            Everything you need to know about team matching, skill analysis, and billing options.
          </p>
        </div>

        {/* FAQ Accordion List */}
        <div className="space-y-4">
          {faqs.map((faq, idx) => {
            const isOpen = openIdx === idx;
            return (
              <div
                key={idx}
                className="bg-[#0e1222] border border-white/5 rounded-2xl overflow-hidden transition-all duration-300"
              >
                {/* Header Question Bar */}
                <button
                  onClick={() => toggleFAQ(idx)}
                  className="w-full py-5 px-6 flex justify-between items-center text-left text-white hover:bg-white/2 transition-colors duration-200"
                >
                  <span className="font-bold text-xs md:text-sm tracking-wide mr-4">
                    {faq.q}
                  </span>
                  <motion.div
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                    className="text-slate-400 text-xs md:text-sm shrink-0"
                  >
                    <FaChevronDown />
                  </motion.div>
                </button>

                {/* Answer unfolding panel */}
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      key="content"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                      className="overflow-hidden"
                    >
                      <div className="pb-6 px-6 pt-2 border-t border-white/5/60 text-slate-400 text-xs md:text-sm leading-relaxed">
                        {faq.a}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default FAQ;
