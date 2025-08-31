import React from 'react';
import { TreePine, Target, HelpCircle, Camera, Trophy, Lightbulb } from 'lucide-react';

const Engagement: React.FC = () => {
  const features = [
    {
      icon: TreePine,
      title: 'Eco Tree Growth',
      description: 'Watch your virtual tree grow as you maintain eco-friendly habits and reduce waste.'
    },
    {
      icon: Target,
      title: 'Weekly Challenges',
      description: 'Complete eco-missions like "Plastic-free week" or "DIY composting" for bonus points.'
    },
    {
      icon: HelpCircle,
      title: 'Eco Quiz Corner',
      description: 'Test your environmental knowledge and earn points for correct answers.'
    },
    {
      icon: Camera,
      title: 'Green Act Gallery',
      description: 'Share photos of your eco-friendly actions and inspire others in the community.'
    },
    {
      icon: Trophy,
      title: 'Neighborhood Battles',
      description: 'Compete with nearby localities for the "Green Zone" title and special recognition.'
    },
    {
      icon: Lightbulb,
      title: 'Daily Eco Tips',
      description: 'Receive personalized tips and reminders to maintain sustainable habits.'
    }
  ];

  return (
    <section id="engagement" className="py-20 bg-gradient-to-b from-green-50 to-white">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold text-green-600 mb-6">
            Engagement Features
          </h2>
          <div className="w-16 h-1 bg-gradient-to-r from-yellow-400 to-yellow-500 mx-auto mb-6 rounded-full"></div>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Stay motivated with interactive features designed to make environmental conservation fun and engaging.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-4 relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-400 to-green-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
              
              <div className="text-center">
                <feature.icon className="w-12 h-12 text-green-600 mx-auto mb-6 group-hover:scale-110 transition-all duration-500" />
                <h3 className="text-xl font-bold text-gray-800 mb-4">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Engagement;