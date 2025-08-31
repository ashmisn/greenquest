import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Award, TrendingUp, Users, Leaf, Star, Gift, Recycle } from 'lucide-react';

const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();

  if (!user) {
    return <div>Loading...</div>;
  }

  // Debug output
  console.log('Dashboard user:', user);

  // Show user object for debugging
  const debugUser = (
    <pre className="bg-gray-100 text-xs p-2 rounded mb-4 overflow-x-auto border border-gray-300">
      {JSON.stringify(user, null, 2)}
    </pre>
  );

  const isAdmin = user.role === 'admin';

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-white">
      {debugUser}
      {/* Header */}
      <div className="bg-white shadow-lg border-b border-green-100">
        <div className="max-w-6xl mx-auto px-4 py-6 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Recycle className="w-10 h-10 text-green-600" />
            <span className="text-2xl font-bold text-green-600">GreenQuest Dashboard</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-gray-700 font-medium">
              Welcome, {isAdmin ? (user as any).name : (user as any).fullName}
            </span>
            <button
              onClick={logout}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors duration-300"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-12">
        {isAdmin ? (
          // Admin Dashboard
          <div className="space-y-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-8">Admin Dashboard</h1>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-2xl shadow-lg border-l-4 border-blue-500">
                <div className="flex items-center gap-4">
                  <Users className="w-12 h-12 text-blue-500" />
                  <div>
                    <h3 className="text-2xl font-bold text-gray-800">150</h3>
                    <p className="text-gray-600">Total Users</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-2xl shadow-lg border-l-4 border-green-500">
                <div className="flex items-center gap-4">
                  <TrendingUp className="w-12 h-12 text-green-500" />
                  <div>
                    <h3 className="text-2xl font-bold text-gray-800">25</h3>
                    <p className="text-gray-600">Villages</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-2xl shadow-lg border-l-4 border-yellow-500">
                <div className="flex items-center gap-4">
                  <Leaf className="w-12 h-12 text-yellow-500" />
                  <div>
                    <h3 className="text-2xl font-bold text-gray-800">2.5k</h3>
                    <p className="text-gray-600">Kg Waste Reduced</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-2xl shadow-lg border-l-4 border-purple-500">
                <div className="flex items-center gap-4">
                  <Gift className="w-12 h-12 text-purple-500" />
                  <div>
                    <h3 className="text-2xl font-bold text-gray-800">320</h3>
                    <p className="text-gray-600">Rewards Given</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-lg">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Recent Activity</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                  <span className="text-gray-700">New user registered from Kottayam</span>
                  <span className="text-sm text-gray-500">2 hours ago</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                  <span className="text-gray-700">Waste collection completed in Sector 7</span>
                  <span className="text-sm text-gray-500">5 hours ago</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg">
                  <span className="text-gray-700">Monthly reward distribution completed</span>
                  <span className="text-sm text-gray-500">1 day ago</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          // User Dashboard
          <div className="space-y-8">
            <div className="bg-gradient-to-r from-green-600 to-green-500 p-8 rounded-2xl text-white">
              <h1 className="text-3xl font-bold mb-4">Welcome back, {(user as any).fullName}!</h1>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-yellow-300">{(user as any).points}</div>
                  <div className="text-green-100">Total Points</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-yellow-300">{(user as any).level}</div>
                  <div className="text-green-100">Current Level</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-yellow-300">{(user as any).village}</div>
                  <div className="text-green-100">Village</div>
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-2xl shadow-lg">
                <div className="flex items-center gap-4 mb-4">
                  <Star className="w-10 h-10 text-yellow-500" />
                  <h3 className="text-xl font-bold text-gray-800">Recent Activity</h3>
                </div>
                <div className="space-y-3">
                  <div className="p-3 bg-green-50 rounded-lg">
                    <p className="text-sm text-gray-700">Proper waste segregation - <span className="font-semibold text-green-600">+10 points</span></p>
                    <p className="text-xs text-gray-500">2 days ago</p>
                  </div>
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm text-gray-700">Weekly challenge completed - <span className="font-semibold text-blue-600">+25 points</span></p>
                    <p className="text-xs text-gray-500">5 days ago</p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl shadow-lg">
                <div className="flex items-center gap-4 mb-4">
                  <Award className="w-10 h-10 text-purple-500" />
                  <h3 className="text-xl font-bold text-gray-800">Achievements</h3>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                      <Star className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-gray-700">First Collection</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
                      <Leaf className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-gray-700">Eco Warrior</span>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl shadow-lg">
                <div className="flex items-center gap-4 mb-4">
                  <Gift className="w-10 h-10 text-green-500" />
                  <h3 className="text-xl font-bold text-gray-800">Available Rewards</h3>
                </div>
                <div className="space-y-3">
                  <button className="w-full p-3 bg-green-50 hover:bg-green-100 rounded-lg text-left transition-colors duration-300">
                    <p className="text-sm font-semibold text-green-700">₹50 Electricity Discount</p>
                    <p className="text-xs text-gray-600">100 points required</p>
                  </button>
                  <button className="w-full p-3 bg-blue-50 hover:bg-blue-100 rounded-lg text-left transition-colors duration-300">
                    <p className="text-sm font-semibold text-blue-700">₹25 FASTag Recharge</p>
                    <p className="text-xs text-gray-600">50 points required</p>
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-lg">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Your Green Journey</h2>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">Progress to next level</span>
                  <span className="text-green-600 font-semibold">75%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div className="bg-gradient-to-r from-green-500 to-green-400 h-3 rounded-full w-3/4 transition-all duration-500"></div>
                </div>
                <p className="text-sm text-gray-600">Keep up the great work! You need 25 more points to reach Level 2.</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;