import React from 'react';
import { Trash2, AlertTriangle, Ban, TrendingUp } from 'lucide-react';

const Problem: React.FC = () => {
  const problems = [
    {
      icon: Trash2,
      title: 'Open Dumping',
      description: 'Uncontrolled waste disposal polluting water bodies and soil, creating health risks for communities.'
    },
    {
      icon: AlertTriangle,
      title: 'Poor Segregation',
      description: 'Lack of awareness leads to mixed waste, making recycling difficult and reducing environmental impact.'
    },
    {
      icon: Ban,
      title: 'No Incentives',
      description: 'Limited motivation for sustainable practices, resulting in low participation in waste management initiatives.'
    },
    {
      icon: TrendingUp,
      title: 'Plastic Pollution',
      description: 'Excessive plastic usage without proper disposal methods, harming local ecosystems and wildlife.'
    }
  ];

  return (
    <section id="problem" className="py-20 bg-gradient-to-b from-gray-50 to-white relative">
      <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-green-500 to-gray-50"></div>
      
      <div className="relative max-w-6xl mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold text-green-600 mb-6">
            The Challenge We Face
          </h2>
          <div className="w-16 h-1 bg-gradient-to-r from-yellow-400 to-yellow-500 mx-auto mb-6 rounded-full"></div>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Rural communities struggle with waste management, leading to environmental degradation and health hazards. 
            Our solution addresses these critical issues.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {problems.map((problem, index) => (
            <div
              key={index}
              className="group bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-4 border border-red-100 relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-400 to-red-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
              
              <div className="text-center">
                <problem.icon className="w-16 h-16 text-red-500 mx-auto mb-6 group-hover:scale-110 group-hover:rotate-12 transition-all duration-500" />
                <h3 className="text-xl font-bold text-gray-800 mb-4">
                  {problem.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {problem.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Problem;