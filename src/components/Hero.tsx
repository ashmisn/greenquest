// src/components/Hero.tsx
import React, { useState } from 'react';
import { Recycle, ArrowRight, Calendar, X } from 'lucide-react';
import ScheduleSection from './ScheduleSection';

interface HeroProps {
  title?: string;
  subtitle?: string;
  heroIconSize?: number;
  scheduleMaxHeight?: string;
}

const Hero: React.FC<HeroProps> = ({
  title = "Recycling, Reimagined.",
  subtitle = "Our platform simplifies sustainability. Effortlessly track local collection schedules, understand your environmental impact, and help build a cleaner, greener Vallichira together.",
  heroIconSize = 280,
  scheduleMaxHeight = "3000px",
}) => {
  const [isScheduleOpen, setIsScheduleOpen] = useState(false);

  const handleToggleSchedule = () => setIsScheduleOpen(prev => !prev);

  const handleJoinClick = () => {
    const element = document.getElementById('join');
    if (element) element.scrollIntoView({ behavior: 'smooth' });
  };

  // Dynamic background blobs
  const blobs = [
    { top: "0", left: "-4", bg: "bg-green-500", delay: "" },
    { top: "0", right: "-4", bg: "bg-teal-500", delay: "animation-delay-2000" },
    { bottom: "-8", left: "20", bg: "bg-green-400", delay: "animation-delay-4000" },
  ];

  return (
    <>
      <section id="home" className="relative min-h-screen bg-green-800 text-white overflow-hidden">
        {/* Background Blobs */}
        {blobs.map((blob, i) => (
          <div
            key={i}
            className={`absolute ${blob.top ? `top-${blob.top}` : ""} ${blob.bottom ? `-bottom-${blob.bottom}` : ""} ${blob.left ? `left-${blob.left}` : ""} ${blob.right ? `-right-${blob.right}` : ""} w-96 h-96 ${blob.bg} rounded-full mix-blend-screen filter blur-3xl opacity-40 animate-blob ${blob.delay}`}
          />
        ))}

        <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
          <div className="grid lg:grid-cols-2 gap-16 items-center max-w-6xl w-full">
            
            {/* Left Side: Glass Card */}
            <div 
              className="space-y-6 bg-white/10 backdrop-blur-lg rounded-3xl p-8 md:p-10 border border-white/20 shadow-2xl animate-fade-in-up"
              style={{ animationFillMode: 'backwards' }}
            >
              <h1 className="text-5xl lg:text-6xl font-bold tracking-tight text-white">{title}</h1>
              <p className="text-xl text-green-100 leading-relaxed">{subtitle}</p>

              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <button
                  onClick={handleJoinClick}
                  className="group inline-flex items-center justify-center gap-2 px-6 py-3 bg-white text-green-700 rounded-xl font-semibold text-lg shadow-lg hover:bg-gray-100 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
                >
                  Start Your Journey
                  <ArrowRight className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
                </button>

                <button
                  onClick={handleToggleSchedule}
                  aria-controls="schedule-section"
                  aria-expanded={isScheduleOpen}
                  className="group inline-flex items-center justify-center gap-2 px-6 py-3 bg-transparent border-2 border-white/80 text-white rounded-xl font-semibold text-lg hover:bg-white/10 transition-all duration-300"
                >
                  {isScheduleOpen ? <><X className="w-5 h-5" /> Hide Schedule</> : <><Calendar className="w-5 h-5" /> View Schedule</>}
                </button>
              </div>
            </div>

            {/* Right Side: Hero Icon */}
            <div 
              className="hidden lg:flex justify-center animate-fade-in-right"
              style={{ animationDelay: '0.3s', animationFillMode: 'backwards' }}
            >
              <Recycle size={heroIconSize} className="text-white opacity-50 drop-shadow-2xl" />
            </div>
          </div>
        </div>
      </section>

      {/* Expanding Schedule Section */}
      <div
        id="schedule-section"
        className={`transition-all duration-700 ease-in-out overflow-hidden ${isScheduleOpen ? `max-h-[${scheduleMaxHeight}] opacity-100` : "max-h-0 opacity-0"}`}
      >
        <ScheduleSection />
      </div>
    </>
  );
};

export default Hero;
