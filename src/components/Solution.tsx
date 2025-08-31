import React from 'react';
import { Brain, Gamepad2, Smartphone, Users, BarChart3, Leaf } from 'lucide-react';

const Solution: React.FC = () => {
  const solutions = [
    {
      icon: Leaf,
      title: 'Smart Tracking',
      description: 'Each household gets unique identification for easy tracking of waste collection patterns and eco-friendly behavior.'
    },
    {
      icon: Brain,
      title: 'AI-Powered Analytics',
      description: 'Machine learning algorithms monitor waste reduction trends and reward consistent eco-friendly behavior.'
    },
    {
      icon: Gamepad2,
      title: 'Gamified Experience',
      description: 'Earn points, unlock achievements, and compete with neighbors while contributing to environmental conservation.'
    },
    {
      icon: Smartphone,
      title: 'Digital Platform',
      description: 'User-friendly mobile interface accessible to all community members, regardless of technical expertise.'
    },
    {
      icon: Users,
      title: 'Community Engagement',
      description: 'Foster local partnerships and create a culture of environmental responsibility through collective action.'
    },
    {
      icon: BarChart3,
      title: 'Real-time Analytics',
      description: 'Comprehensive dashboards for officials to monitor progress and make data-driven decisions.'
    }
  ];

  return (
    <section id="solution" className="py-20 bg-white">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold text-green-600 mb-6">
            Our Revolutionary Solution
          </h2>
          <div className="w-16 h-1 bg-gradient-to-r from-yellow-400 to-yellow-500 mx-auto mb-6 rounded-full"></div>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            GreenQuest combines technology, gamification, and community engagement to create a sustainable waste management ecosystem.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {solutions.map((solution, index) => (
            <div
              key={index}
              className="group bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-4 border-t-4 border-green-500 relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-green-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              
              <div className="relative text-center">
                <solution.icon className="w-16 h-16 text-green-600 mx-auto mb-6 group-hover:scale-110 group-hover:drop-shadow-lg transition-all duration-500" />
                <h3 className="text-xl font-bold text-gray-800 mb-4">
                  {solution.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {solution.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Solution;