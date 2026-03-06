import Hero from "@/components/Hero";
import Features from "@/components/Features";
import HowItWorks from "@/components/HowItWorks";
import LiveDemo from "@/components/LiveDemo";
import Agents from "@/components/Agents";
import Pricing from "@/components/Pricing";
import GetStarted from "@/components/GetStarted";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <main className="bg-black">
      <Hero />
      <Features />
      <HowItWorks />
      <LiveDemo />
      <Agents />
      <Pricing />
      <GetStarted />
      <Footer />
    </main>
  );
}
