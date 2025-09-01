import React from "react";
import Header from "../components/Header";
import Hero from "../components/Hero";
import Slideshow from "../components/Slideshow";
import Problem from "../components/Problem";
import Solution from "../components/Solution";
import HowItWorks from "../components/HowItWorks";
import Rewards from "../components/Rewards";
import Engagement from "../components/Engagement";
import Impact from "../components/Impact";
import Registration from "../components/Registration";
import Footer from "../components/Footer";
import ScheduleSection from "../components/ScheduleSection";

const HomePage: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Navigation */}
      <Header />

      {/* Hero Section */}
      <Hero />

      {/* Quick Actions Section */}


      {/* Slideshow Section */}
      <section className="py-16 bg-gradient-to-r from-green-100 to-blue-100">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-4xl font-extrabold text-green-700 mb-8 text-center drop-shadow-sm">
            How to Keep the Environment Clean
          </h2>
          <div className="overflow-hidden rounded-3xl shadow-xl">
            <Slideshow />
          </div>
        </div>
      </section>

      {/* Storytelling Sections */}
      <Problem />
      <Solution />
      <HowItWorks />

      {/* Rewards & Engagement */}
      <Rewards />
      <Engagement />
      <Impact />

      {/* Registration CTA */}
      <section className="py-16 bg-gradient-to-r from-green-200 via-green-100 to-blue-200">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-green-800 mb-6">
            Join GreenQuest Today 🌱
          </h2>
          <Registration />
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default HomePage;