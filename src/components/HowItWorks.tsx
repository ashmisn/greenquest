import React from 'react';
import { UserPlus, Split, Recycle, Star } from 'lucide-react';

const HowItWorks: React.FC = () => {
  const steps = [
    {
      number: 1,
      icon: UserPlus,
      title: 'Register & Get Started',
      description: 'Sign up and receive your unique household identification for tracking your eco-friendly journey.'
    },
    {
      number: 2,
      icon: Split,
      title: 'Segregate Waste',
      description: 'Separate plastic, eco-friendly, and organic waste in designated bins for proper disposal.'
    },
    {
      number: 3,
      icon: Recycle,
      title: 'Collection & Tracking',
      description: 'Volunteers collect waste and log collection data to track your environmental contributions.'
    },
    {
      number: 4,
      icon: Star,
      title: 'Earn Points & Rewards',
      description: 'Accumulate points for proper segregation and redeem for real benefits in your community.'
    }
  ];

  return (
    <section id="how-it-works" className="py-20 bg-gradient-to-b from-gray-50 to-green-50">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold text-green-600 mb-6">
            How GreenQuest Works
          </h2>
          <div className="w-16 h-1 bg-gradient-to-r from-yellow-400 to-yellow-500 mx-auto mb-6 rounded-full"></div>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Our simple 4-step process makes waste management engaging and rewarding for everyone.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div
              key={index}
              className="group relative bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:scale-105 border border-green-100"
            >
              <div className="absolute -top-5 left-1/2 transform -translate-x-1/2 w-10 h-10 bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-full flex items-center justify-center font-bold text-gray-900 text-lg shadow-lg">
                {step.number}
              </div>
              
              <div className="text-center pt-4">
                <step.icon className="w-14 h-14 text-green-600 mx-auto mb-6 group-hover:scale-110 group-hover:rotate-12 transition-all duration-500" />
                <h3 className="text-xl font-bold text-gray-800 mb-4">
                  {step.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;