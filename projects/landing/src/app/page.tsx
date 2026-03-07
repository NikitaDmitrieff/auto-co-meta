import Hero from "@/components/Hero";
import Features from "@/components/Features";
import CompareSection from "@/components/CompareSection";
import HowItWorks from "@/components/HowItWorks";
import LiveDemo from "@/components/LiveDemo";
import Agents from "@/components/Agents";
import Pricing from "@/components/Pricing";
import Waitlist from "@/components/Waitlist";
import GetStarted from "@/components/GetStarted";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <main className="bg-black">
      <Hero />
      <Features />
      <CompareSection />
      <HowItWorks />
      <LiveDemo />
      <Agents />
      <Pricing />
      <Waitlist />
      <GetStarted />
      <Footer />
    </main>
  );
}
