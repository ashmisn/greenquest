import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
// Import authAPI, pickupAPI, and the new rewardAPI
import { authAPI, pickupAPI, rewardAPI } from '../services/api'; 
import { Link } from 'react-router-dom';
import { Award, TrendingUp, Users, Leaf, Star, Gift, Recycle, Truck } from 'lucide-react';
import { Reward } from '../types'; // Import the new Reward type

const Dashboard: React.FC = () => {
  const { user, logout, login, token } = useAuth();
  const [assignForm, setAssignForm] = useState({ phone: '', wasteType: 'plastic', weight: '' });
  const [assignStatus, setAssignStatus] = useState<string | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [currentUser, setCurrentUser] = useState(user);

  const [userPickups, setUserPickups] = useState<any[]>([]);
  const [allPickups, setAllPickups] = useState<any[]>([]);
  const [loadingPickups, setLoadingPickups] = useState(false);

  // --- NEW STATE for rewards ---
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [loadingRewards, setLoadingRewards] = useState(true);

  const isAdmin = currentUser?.role === 'admin';

  // --- useEffect to fetch pickups ---
  useEffect(() => {
    if (token) {
      setLoadingPickups(true);
      if (isAdmin) {
        pickupAPI.getAllPickups()
          .then(data => setAllPickups(data))
          .catch(err => console.error("Failed to fetch all pickups:", err))
          .finally(() => setLoadingPickups(false));
      } else {
        pickupAPI.getUserPickups()
          .then(data => setUserPickups(data))
          .catch(err => console.error("Failed to fetch user pickups:", err))
          .finally(() => setLoadingPickups(false));
      }
    }
  }, [token, isAdmin]);
  
  // --- NEW useEffect to fetch rewards (for users only) ---
  useEffect(() => {
    if (!isAdmin && token) {
        setLoadingRewards(true);
        rewardAPI.getRewards()
            .then(data => setRewards(data))
            .catch(err => console.error("Failed to fetch rewards:", err))
            .finally(() => setLoadingRewards(false));
    }
  }, [isAdmin, token]);


  // --- useEffect to fetch profile ---
  useEffect(() => {
    if (user && user.role === 'user' && token) {
      setLoadingProfile(true);
      authAPI.getProfile()
        .then(profile => {
          setCurrentUser(profile);
          login(token, profile);
        })
        .finally(() => setLoadingProfile(false));
    } else {
      setCurrentUser(user);
    }
  }, [user, token]);

  const handleStatusChange = async (pickupId: string, newStatus: string) => {
    try {
      await pickupAPI.updatePickupStatus(pickupId, newStatus);
      setAllPickups(prevPickups => 
        prevPickups.map(p => p._id === pickupId ? { ...p, status: newStatus } : p)
      );
      alert('Pickup status updated successfully!');
    } catch (err) {
      alert('Failed to update pickup status.');
      console.error(err);
    }
  };


  if (!currentUser) {
    return <div>Loading...</div>;
  }

  // Helper function to get the correct user points
  const getUserPoints = () => {
      if (currentUser && currentUser.role === 'user') {
          return (currentUser as any).points || 0;
      }
      return 0;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-white">
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
            {/* ... existing admin dashboard JSX ... */}
          </div>
        ) : (
          // User Dashboard
          <div className="space-y-8">
            <div className="bg-gradient-to-r from-green-600 to-green-500 p-8 rounded-2xl text-white shadow-xl">
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
              <Link to="/schedule-pickup" className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col items-center justify-center text-center">
                  <Truck className="w-12 h-12 text-green-500 mb-4" />
                  <h3 className="text-xl font-bold text-gray-800">Schedule a Pickup</h3>
                  <p className="text-gray-600 mt-2">Request a doorstep pickup for your recyclable waste.</p>
              </Link>
              
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

              {/* --- MODIFIED REWARDS SECTION --- */}
              <div className="bg-white p-6 rounded-2xl shadow-lg">
                <div className="flex items-center gap-4 mb-4">
                  <Gift className="w-10 h-10 text-green-500" />
                  <h3 className="text-xl font-bold text-gray-800">Available Rewards</h3>
                </div>
                <div className="space-y-3">
                  {loadingRewards ? (
                    <p className="text-gray-500 text-center">Loading rewards...</p>
                  ) : (
                    rewards.map(reward => (
                      <button 
                        key={reward._id} 
                        className="w-full p-3 bg-green-50 hover:bg-green-100 rounded-lg text-left transition-colors duration-300 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:bg-green-50" 
                        disabled={getUserPoints() < reward.pointsRequired}
                        onClick={() => alert(`Redeeming ${reward.title}!`)} // Placeholder action
                      >
                        <div className="flex justify-between items-center">
                          <p className="text-sm font-semibold text-green-700">{reward.title}</p>
                          <p className={`text-sm font-bold ${getUserPoints() >= reward.pointsRequired ? 'text-green-600' : 'text-red-500'}`}>
                            {reward.pointsRequired} pts
                          </p>
                        </div>
                        <p className="text-xs text-gray-600">{reward.description}</p>
                      </button>
                    ))
                  )}
                   {rewards.length === 0 && !loadingRewards && <p className="text-center text-gray-500">No rewards available at the moment.</p>}
                </div>
              </div>
            </div>
            
            <div className="bg-white p-8 rounded-2xl shadow-lg">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">My Pickup History</h2>
                <Link to="/my-pickups" className="text-green-600 font-semibold hover:underline">View All</Link>
              </div>
              {loadingPickups ? <p>Loading history...</p> : (
                <div className="space-y-4">
                  {userPickups.slice(0, 3).map((pickup) => (
                    <div key={pickup._id} className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                      <div>
                        <span className="font-semibold text-gray-700">Pickup on {new Date(pickup.pickupDate).toLocaleDateString()}</span>
                        <p className="text-sm text-gray-500">{pickup.quantity} - {pickup.wasteTypes.join(', ')}</p>
                      </div>
                      <span className={`text-sm font-bold px-3 py-1 rounded-full ${pickup.status === 'Completed' ? 'bg-green-200 text-green-800' : 'bg-yellow-200 text-yellow-800'}`}>
                        {pickup.status}
                      </span>
                    </div>
                  ))}
                  {userPickups.length === 0 && <p className="text-center text-gray-500 py-4">You haven't scheduled any pickups yet.</p>}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;