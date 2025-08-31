import React, { useEffect, useState } from 'react';
import { authAPI } from '../services/api';
import { Stats } from '../types';

const Impact: React.FC = () => {
  const [stats, setStats] = useState<Stats>({
    households: 0,
    villages: 0,
    wasteReduction: 0,
    rewards: 0
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await authAPI.getStats();
        setStats(data);
      } catch (error) {
        console.error('Error fetching stats:', error);
      }
    };

    fetchStats();
  }, []);

  const statItems = [
    { value: stats.households, label: 'Households Enrolled', suffix: '' },
    { value: stats.villages, label: 'Villages Covered', suffix: '' },
    { value: stats.wasteReduction, label: 'Waste Reduction', suffix: 'kg' },
    { value: stats.rewards, label: 'Rewards Distributed', suffix: '' }
  ];

  return (
    <section id="impact" className="py-20 bg-gradient-to-br from-green-600 to-green-500 text-white relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-20 w-40 h-40 border border-white rounded-full animate-spin-slow"></div>
        <div className="absolute bottom-20 right-20 w-32 h-32 border border-white rounded-full animate-bounce"></div>
        <div className="absolute top-1/2 left-10 w-24 h-24 border border-white rounded-full animate-pulse"></div>
      </div>

      <div className="relative max-w-6xl mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold mb-6">
            Our Impact
          </h2>
          <div className="w-16 h-1 bg-gradient-to-r from-yellow-400 to-yellow-500 mx-auto mb-6 rounded-full"></div>
          <p className="text-xl text-green-100 max-w-3xl mx-auto leading-relaxed">
            Join thousands of households already making a difference in their communities.
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {statItems.map((stat, index) => (
            <div
              key={index}
              className="group text-center p-8 bg-white/10 backdrop-blur-md rounded-2xl hover:bg-white/20 transition-all duration-500 transform hover:scale-105"
            >
              <div className="text-5xl lg:text-6xl font-bold text-yellow-400 mb-4 group-hover:scale-110 transition-transform duration-500">
                {stat.value}
                <span className="text-3xl">{stat.suffix}</span>
              </div>
              <div className="text-lg font-medium text-green-100">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Impact;