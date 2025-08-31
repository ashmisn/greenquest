import React from 'react';
import { Zap, CreditCard, Droplets, ShoppingCart, GraduationCap, Award } from 'lucide-react';

const Rewards: React.FC = () => {
  const rewards = [
    { icon: Zap, title: 'Electricity Bill Discounts' },
    { icon: CreditCard, title: 'FASTag Recharges' },
    { icon: Droplets, title: 'Water Bill Subsidies' },
    { icon: ShoppingCart, title: 'Local Market Discounts' },
    { icon: GraduationCap, title: 'Educational Benefits' },
    { icon: Award, title: 'Community Recognition' }
  ];

  return (
    <section id="rewards" className="py-20 bg-white">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold text-green-600 mb-6">
            Rewards & Benefits
          </h2>
          <div className="w-16 h-1 bg-gradient-to-r from-yellow-400 to-yellow-500 mx-auto mb-6 rounded-full"></div>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Turn your eco-friendly actions into tangible rewards that benefit your family and community.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {rewards.map((reward, index) => (
            <div
              key={index}
              className="group bg-white p-6 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-4 border border-yellow-100 relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-yellow-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              
              <div className="relative text-center">
                <reward.icon className="w-12 h-12 text-yellow-500 mx-auto mb-4 group-hover:scale-125 group-hover:drop-shadow-lg transition-all duration-500" />
                <h3 className="text-sm font-bold text-gray-800 leading-tight">
                  {reward.title}
                </h3>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Rewards;