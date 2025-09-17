import React from 'react';
import { Reward } from '../types'; // We'll use the Reward interface
import { Ticket, Receipt, Smartphone, Gift } from 'lucide-react';

// --- NEW: Define props for the component ---
interface RewardsProps {
  rewards: Reward[];
  loading: boolean;
  title?: string; // Optional title
}

// --- MODIFIED: The component now accepts props ---
const Rewards: React.FC<RewardsProps> = ({ rewards, loading, title = "Rewards & Benefits" }) => {
  
  // Helper function remains the same
  const getRewardIcon = (type: Reward['type']) => {
    switch (type) {
        case 'Discount':
            return <Receipt className="w-12 h-12 text-yellow-500 mx-auto mb-4 group-hover:scale-125 group-hover:drop-shadow-lg transition-all duration-500" />;
        case 'Recharge':
            return <Smartphone className="w-12 h-12 text-yellow-500 mx-auto mb-4 group-hover:scale-125 group-hover:drop-shadow-lg transition-all duration-500" />;
        case 'Voucher':
            return <Ticket className="w-12 h-12 text-yellow-500 mx-auto mb-4 group-hover:scale-125 group-hover:drop-shadow-lg transition-all duration-500" />;
        default:
            return <Gift className="w-12 h-12 text-yellow-500 mx-auto mb-4 group-hover:scale-125 group-hover:drop-shadow-lg transition-all duration-500" />;
    }
  };

  // --- REMOVED: All useState and useEffect hooks for fetching data ---

  return (
    <section id="rewards" className="py-20 bg-white">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold text-green-600 mb-6">
            {title}
          </h2>
          <div className="w-16 h-1 bg-gradient-to-r from-yellow-400 to-yellow-500 mx-auto mb-6 rounded-full"></div>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Turn your eco-friendly actions into tangible rewards that benefit your family and community.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {loading ? (
            <p className="col-span-full text-center text-gray-500">Loading rewards...</p>
          ) : rewards.length > 0 ? (
            rewards.map((reward) => (
              <div
                key={reward._id}
                className="group bg-white p-6 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-4 border border-yellow-100 relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-yellow-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative text-center">
                  {getRewardIcon(reward.type)}
                  <h3 className="text-sm font-bold text-gray-800 leading-tight">
                    {reward.title}
                  </h3>
                  <p className="text-xs text-yellow-600 font-semibold mt-1">{reward.pointsRequired} points</p>
                   {/* Display the required level */}
                  <p className="text-xs text-gray-500 font-semibold mt-1">Requires Level {reward.requiredLevel}</p>
                </div>
              </div>
            ))
          ) : (
             <p className="col-span-full text-center text-gray-500">No rewards available at the moment.</p>
          )}
        </div>
      </div>
    </section>
  );
};

export default Rewards;