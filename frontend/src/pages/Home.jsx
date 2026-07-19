import { motion } from "framer-motion";
import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import Stats from "../components/Stats";
import Features from "../components/Features";
import SmartMatching from "../components/SmartMatching";
import HowItWorks from "../components/HowItWorks";
import DashboardShowcase from "../components/DashboardShowcase";
import HackathonCards from "../components/HackathonCards";
import TopDevelopers from "../components/TopDevelopers";
import Testimonials from "../components/Testimonials";
import Pricing from "../components/Pricing";
import FAQ from "../components/FAQ";
import About from "../components/About";
import CTA from "../components/CTA";
import Footer from "../components/Footer";

const revealVariants = {
  hidden: { opacity: 0, y: 70 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: {
      type: "spring",
      stiffness: 45,
      damping: 18,
      mass: 0.8
    }
  }
};

function ScrollSection({ children }) {
  return (
    <motion.div
      variants={revealVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.1 }}
      className="w-full relative"
    >
      {children}
    </motion.div>
  );
}

function Home() {
  return (
    <div className="bg-[#050816] text-white min-h-screen relative overflow-hidden font-sans">
      
      {/* Volumetric Cosmic Background Glows */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        {/* Features area: Orange Glow */}
        <div className="absolute left-[-15%] top-[18%] w-[580px] h-[580px] bg-[#FF8A00]/8 rounded-full blur-[170px]" />
        
        {/* SmartMatching area: Blue Glow */}
        <div className="absolute right-[-12%] top-[32%] w-[550px] h-[550px] bg-[#3B82F6]/10 rounded-full blur-[150px]" />

        {/* DashboardShowcase area: Orange Glow */}
        <div className="absolute left-[5%] top-[48%] w-[500px] h-[500px] bg-[#FF8A00]/6 rounded-full blur-[140px]" />

        {/* TopDevelopers area: Blue Glow */}
        <div className="absolute right-[5%] top-[65%] w-[500px] h-[500px] bg-[#3B82F6]/8 rounded-full blur-[150px]" />

        {/* Pricing/FAQ area: Orange Glow */}
        <div className="absolute left-[-5%] top-[82%] w-[580px] h-[580px] bg-[#FF8A00]/8 rounded-full blur-[160px]" />
      </div>

      <Navbar />
      
      <Hero />
      
      <ScrollSection>
        <Stats />
      </ScrollSection>
      
      <ScrollSection>
        <Features />
      </ScrollSection>
      
      <ScrollSection>
        <SmartMatching />
      </ScrollSection>
      
      <ScrollSection>
        <HowItWorks />
      </ScrollSection>
      
      <ScrollSection>
        <DashboardShowcase />
      </ScrollSection>
      
      <ScrollSection>
        <HackathonCards />
      </ScrollSection>
      
      <ScrollSection>
        <TopDevelopers />
      </ScrollSection>
      
      <ScrollSection>
        <Testimonials />
      </ScrollSection>
      
      <ScrollSection>
        <Pricing />
      </ScrollSection>
      
      <ScrollSection>
        <FAQ />
      </ScrollSection>
      
      <ScrollSection>
        <About />
      </ScrollSection>
      
      <ScrollSection>
        <CTA />
      </ScrollSection>
      
      <Footer />
    </div>
  );
}

export default Home;