import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
// Import both authAPI and the new pickupAPI
import { authAPI, pickupAPI } from '../services/api'; 
import { Link } from 'react-router-dom'; // Import Link for navigation
import { Award, TrendingUp, Users, Leaf, Star, Gift, Recycle, Truck } from 'lucide-react';

const Dashboard: React.FC = () => {
  const { user, logout, login, token } = useAuth();
  const [assignForm, setAssignForm] = useState({ phone: '', wasteType: 'plastic', weight: '' });
  const [assignStatus, setAssignStatus] = useState<string | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [currentUser, setCurrentUser] = useState(user);

  // --- NEW STATE for pickups ---
  const [userPickups, setUserPickups] = useState<any[]>([]);
  const [allPickups, setAllPickups] = useState<any[]>([]);
  const [loadingPickups, setLoadingPickups] = useState(false);

  const isAdmin = currentUser?.role === 'admin';

  // --- NEW useEffect to fetch pickups based on user role ---
  useEffect(() => {
    if (token) {
      setLoadingPickups(true);
      if (isAdmin) {
        // Admin: Fetch all pickups
        pickupAPI.getAllPickups()
          .then(data => setAllPickups(data))
          .catch(err => console.error("Failed to fetch all pickups:", err))
          .finally(() => setLoadingPickups(false));
      } else {
        // User: Fetch their own pickups
        pickupAPI.getUserPickups()
          .then(data => setUserPickups(data))
          .catch(err => console.error("Failed to fetch user pickups:", err))
          .finally(() => setLoadingPickups(false));
      }
    }
  }, [token, isAdmin]);


  // For user: fetch latest profile on mount or after points assignment
  useEffect(() => {
    if (user && user.role === 'user' && token) {
      setLoadingProfile(true);
      authAPI.getProfile()
        .then(profile => {
          setCurrentUser(profile);
          login(token, profile); // update context
        })
        .finally(() => setLoadingProfile(false));
    } else {
      setCurrentUser(user);
    }
  }, [user, token]);

  // --- NEW Handler for Admin to update status ---
  const handleStatusChange = async (pickupId: string, newStatus: string) => {
    try {
      await pickupAPI.updatePickupStatus(pickupId, newStatus);
      // Update the status in the local state for immediate UI feedback
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
          // -------------------------- Admin Dashboard --------------------------
          <div className="space-y-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-8">Admin Dashboard</h1>

            {/* Assign Points Form (Existing) */}
            <div className="bg-white p-6 rounded-2xl shadow-lg mb-8 max-w-xl">
              <h2 className="text-xl font-bold text-green-700 mb-4">Assign Points to User</h2>
              <form
                className="space-y-4"
                onSubmit={async (e) => {
                  e.preventDefault();
                  setAssignStatus(null);
                  try {
                    const res = await authAPI.assignPoints(assignForm.phone, assignForm.wasteType, Number(assignForm.weight));
                    setAssignStatus(`Success! ${res.points} points assigned to user.`);
                    setAssignForm({ phone: '', wasteType: 'plastic', weight: '' });
                  } catch (err: any) {
                    setAssignStatus(err.response?.data?.message || 'Error assigning points');
                  }
                }}
              >
                {/* ... existing form inputs ... */}
                 <div>
                  <label className="block text-sm font-semibold mb-1">User Phone</label>
                  <input
                    type="tel"
                    required
                    value={assignForm.phone}
                    onChange={e => setAssignForm(f => ({ ...f, phone: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-lg"
                    placeholder="Enter user's phone number"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">Waste Type</label>
                  <select
                    value={assignForm.wasteType}
                    onChange={e => setAssignForm(f => ({ ...f, wasteType: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-lg"
                  >
                    <option value="plastic">Plastic (10 pts/kg)</option>
                    <option value="biodegradable">Biodegradable (15 pts/kg)</option>
                    <option value="e-waste">E-waste (25 pts/kg)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">Weight (kg)</label>
                  <input
                    type="number"
                    min="0.1"
                    step="0.1"
                    required
                    value={assignForm.weight}
                    onChange={e => setAssignForm(f => ({ ...f, weight: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-lg"
                    placeholder="Enter weight in kg"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg font-bold mt-2"
                >
                  Assign Points
                </button>
                {assignStatus && (
                  <div className={`mt-2 text-sm font-semibold ${assignStatus.startsWith('Success') ? 'text-green-600' : 'text-red-600'}`}>{assignStatus}</div>
                )}
              </form>
            </div>
            
            {/* ... existing stats cards ... */}

            {/* --- NEW Pickup Requests Table --- */}
            <div className="bg-white p-8 rounded-2xl shadow-lg">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Pending Pickup Requests</h2>
              {loadingPickups ? <p>Loading pickups...</p> : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b">
                        <th className="py-2 px-4">User</th>
                        <th className="py-2 px-4">Phone</th>
                        <th className="py-2 px-4">Address</th>
                        <th className="py-2 px-4">Date & Time</th>
                        <th className="py-2 px-4">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {allPickups.map((pickup) => (
                        <tr key={pickup._id} className="border-b hover:bg-gray-50">
                          <td className="py-3 px-4">{pickup.user?.fullName || 'N/A'}</td>
                          <td className="py-3 px-4">{pickup.user?.phone || 'N/A'}</td>
                          <td className="py-3 px-4">{pickup.address}</td>
                          <td className="py-3 px-4">{new Date(pickup.pickupDate).toLocaleDateString()} ({pickup.timeSlot})</td>
                          <td className="py-3 px-4">
                            <select 
                              value={pickup.status}
                              onChange={(e) => handleStatusChange(pickup._id, e.target.value)}
                              className="p-2 border rounded-lg bg-gray-100"
                            >
                              <option value="Pending">Pending</option>
                              <option value="Confirmed">Confirmed</option>
                              <option value="Completed">Completed</option>
                              <option value="Cancelled">Cancelled</option>
                            </select>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {allPickups.length === 0 && <p className="text-center text-gray-500 py-4">No pending pickup requests.</p>}
                </div>
              )}
            </div>
          </div>
        ) : (
          // -------------------------- User Dashboard --------------------------
          <div className="space-y-8">
            {loadingProfile && <div className="text-center text-green-600 font-semibold">Refreshing profile...</div>}
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
              {/* --- NEW Schedule Pickup Card --- */}
              <Link to="/schedule-pickup" className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col items-center justify-center text-center">
                <Truck className="w-12 h-12 text-green-500 mb-4" />
                <h3 className="text-xl font-bold text-gray-800">Schedule a Pickup</h3>
                <p className="text-gray-600 mt-2">Request a doorstep pickup for your recyclable waste.</p>
              </Link>

              {/* ... existing user cards ... */}
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
                  <Gift className="w-10 h-10 text-green-500" />
                  <h3 className="text-xl font-bold text-gray-800">Available Rewards</h3>
                </div>
      _... existing rewards content ..._
              </div>
            </div>

            {/* --- NEW Pickup History Section --- */}
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