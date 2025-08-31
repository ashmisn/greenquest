import React from 'react';
import { Recycle } from 'lucide-react';

const Hero: React.FC = () => {
  const handleJoinClick = () => {
    const element = document.getElementById('join');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section id="home" className="relative min-h-screen bg-gradient-to-br from-green-600 to-green-500 text-white overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-10 w-32 h-32 bg-white rounded-full animate-pulse"></div>
        <div className="absolute top-40 right-20 w-24 h-24 bg-white rounded-full animate-pulse delay-1000"></div>
        <div className="absolute bottom-40 left-20 w-20 h-20 bg-white rounded-full animate-pulse delay-2000"></div>
        <div className="absolute bottom-20 right-40 w-28 h-28 bg-white rounded-full animate-pulse delay-500"></div>
      </div>

      {/* Floating Particles */}
      <div className="absolute inset-0">
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full opacity-60 animate-bounce"
            style={{
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 8}s`,
              animationDuration: `${4 + Math.random() * 4}s`
            }}
          />
        ))}
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 pt-32 pb-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <h1 className="text-5xl lg:text-6xl font-bold leading-tight animate-fade-in-up">
              Smart Rewards for{' '}
              <span className="bg-gradient-to-r from-yellow-300 to-yellow-400 bg-clip-text text-transparent">
                Smart Waste
              </span>{' '}
              Management
            </h1>
            
            <p className="text-xl lg:text-2xl text-green-100 leading-relaxed animate-fade-in-up delay-200">
              Transform your community's waste management with our innovative gamified platform. 
              Earn points, reduce plastic usage, and contribute to a sustainable future while enjoying real rewards.
            </p>
            
            <button
              onClick={handleJoinClick}
              className="inline-flex items-center gap-3 bg-gradient-to-r from-yellow-400 to-yellow-500 text-gray-900 px-8 py-4 rounded-2xl font-bold text-lg hover:shadow-2xl hover:scale-105 transition-all duration-300 animate-fade-in-up delay-400"
            >
              Start Your Green Journey
            </button>
          </div>

          <div className="flex justify-center animate-fade-in-right delay-300">
            <div className="relative">
              <div className="absolute inset-0 bg-white/20 rounded-full blur-3xl animate-pulse"></div>
              <Recycle className="relative w-64 h-64 text-white/90 animate-spin-slow drop-shadow-2xl" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;