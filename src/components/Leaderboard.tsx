import React from 'react';
import { Trophy } from 'lucide-react';

interface LeaderboardUser {
  _id: string;
  fullName: string;
  village: string;
  points: number;
}

interface LeaderboardProps {
  leaderboardData: LeaderboardUser[];
  loading: boolean;
}

const Leaderboard: React.FC<LeaderboardProps> = ({ leaderboardData, loading }) => {
  return (
    <section id="leaderboard" className="py-20 bg-green-50">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl lg:text-5xl font-bold text-green-600 mb-4">Community Leaders</h2>
          <p className="text-lg text-gray-600">See who's making the biggest impact in our community!</p>
        </div>
        <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-lg">
          <div className="flex items-center gap-3 mb-6">
            <Trophy className="w-8 h-8 text-yellow-500" />
            <h3 className="text-2xl font-bold text-gray-800">Top 10 Performers</h3>
          </div>
          {loading ? (
            <p className="text-center text-gray-500">Loading leaderboard...</p>
          ) : (
            <ol className="space-y-4">
              {leaderboardData.map((player, index) => (
                <li key={player._id} className="flex items-center gap-4 p-3 rounded-lg transition-colors hover:bg-gray-100">
                  <div className="font-bold text-lg text-gray-500 w-8 text-center flex-shrink-0">{index + 1}</div>
                  <div>
                    <p className="font-semibold text-gray-800">{player.fullName}</p>
                    <p className="text-sm text-gray-500">{player.village}</p>
                  </div>
                  <div className="ml-auto font-bold text-green-600 text-lg">{player.points} pts</div>
                </li>
              ))}
            </ol>
          )}
        </div>
      </div>
    </section>
  );
};

export default Leaderboard;