import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { authAPI, pickupAPI, rewardAPI, leaderboardAPI } from '../services/api';
import { Link } from 'react-router-dom';
import {
  Gift,
  Recycle,
  Truck,
  Receipt,
  Smartphone,
  Ticket,
  Trophy,
  Gamepad2,
} from 'lucide-react';
import { Reward, User, Admin } from '../types';
import Notifications from '../components/Notifications';

type LeaderboardUser = {
  _id: string;
  fullName: string;
  village: string;
  points: number;
  level: number;
};

const tiers = [
  { level: 1, name: 'Eco-Starter', minPoints: 0 },
  { level: 2, name: 'Green-Guardian', minPoints: 100 },
  { level: 3, name: 'Eco-Champion', minPoints: 300 },
  { level: 4, name: 'Planet-Hero', minPoints: 700 },
  { level: 5, name: 'Eco-Legend', minPoints: 5000 },
  { level: 6, name: 'Terra-Guardian', minPoints: 20000 },
  { level: 7, name: "Gaia's Champion", minPoints: 50000 },
];

const Dashboard: React.FC = () => {
  const { user, logout, login, token } = useAuth();
  const [currentUser, setCurrentUser] = useState<User | Admin | null>(user);
  const [tierRewards, setTierRewards] = useState<Reward[]>([]);
  const [currentUserTier, setCurrentUserTier] = useState(tiers[0]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);
  const [userPickups, setUserPickups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [redeemingId, setRedeemingId] = useState<string | null>(null);
  const [allPickups, setAllPickups] = useState<any[]>([]);
  const [assignForm, setAssignForm] = useState({
    phone: '',
    wasteType: 'plastic',
    weight: '',
  });
  const [assignStatus, setAssignStatus] = useState<string | null>(null);

  // ✅ Compute isAdmin outside so JSX can use it
  const isAdmin = currentUser?.role === 'admin';

  // --- DATA FETCHING ---
  useEffect(() => {
    if (!token || !user) {
      setLoading(false);
      return;
    }

    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        if (user.role === 'admin') {
          // --- ADMIN ---
          const pickupsData = await pickupAPI.getAllPickups();
          setAllPickups(pickupsData);
          setCurrentUser(user);
        } else {
          // --- USER ---
          const [rewardsData, leaderboardData, pickupsData, profileData] =
            await Promise.all([
              rewardAPI.getRewards(),
              leaderboardAPI.getLeaderboard(),
              pickupAPI.getUserPickups(),
              authAPI.getProfile(),
            ]);

          setCurrentUser(profileData);
          //login(token, profileData); // keep context fresh

          const userPoints = profileData.points;
          const currentTier =
            tiers.slice().reverse().find((t) => userPoints >= t.minPoints) ||
            tiers[0];

          const filteredRewards = rewardsData.filter(
            (r) => r.requiredLevel === currentTier.level
          );

          setCurrentUserTier(currentTier);
          setTierRewards(filteredRewards);
          setLeaderboard(leaderboardData);
          setUserPickups(pickupsData);
        }
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [token, user, login]);

  // --- HANDLE REDEEM ---
  const handleRedeem = async (reward: Reward) => {
    if (
      !window.confirm(
        `Redeem "${reward.title}" for ${reward.pointsRequired} points?`
      )
    )
      return;
    setRedeemingId(reward._id);
    try {
      const response = await rewardAPI.redeemReward(reward._id);
      alert(response.message);

      setCurrentUser((prevUser) => {
        if (!prevUser || prevUser.role === 'admin') return prevUser;

        const updatedUser: User = {
          ...prevUser,
          points: response.updatedPoints,
          redeemedRewards: [...prevUser.redeemedRewards, reward._id],
        };

        login(token!, updatedUser);
        return updatedUser;
      });
    } catch (error: any) {
      alert(
        `Redemption Failed: ${
          error.response?.data?.message || 'Unexpected Error'
        }`
      );
    } finally {
      setRedeemingId(null);
    }
  };

  // --- ADMIN STATUS CHANGE ---
  const handleStatusChange = async (pickupId: string, newStatus: string) => {
    try {
      await pickupAPI.updatePickupStatus(pickupId, newStatus);
      setAllPickups((prev) =>
        prev.map((p) =>
          p._id === pickupId ? { ...p, status: newStatus } : p
        )
      );
      alert('Status updated!');
    } catch {
      alert('Failed to update status.');
    }
  };

  const getUserPoints = () =>
    currentUser && currentUser.role === 'user'
      ? (currentUser as User).points
      : 0;

  const getRewardIcon = (type: Reward['type']) => {
    switch (type) {
      case 'Discount':
        return <Receipt className="w-5 h-5 text-blue-500" />;
      case 'Recharge':
        return <Smartphone className="w-5 h-5 text-purple-500" />;
      case 'Voucher':
        return <Ticket className="w-5 h-5 text-orange-500" />;
      default:
        return <Gift className="w-5 h-5 text-gray-500" />;
    }
  };

  if (loading)
    return <div className="text-center p-10">Loading Dashboard...</div>;
  if (!currentUser)
    return (
      <div className="text-center p-10">
        Error loading user data. Please try logging in again.
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-white">
      {/* HEADER */}
      <div className="bg-white shadow-lg border-b border-green-100">
        <div className="max-w-6xl mx-auto px-4 py-6 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Recycle className="w-10 h-10 text-green-600" />
            <span className="text-2xl font-bold text-green-600">
              GreenQuest Dashboard
            </span>
          </div>
          <div className="flex items-center gap-6">
            <span className="text-gray-700 font-medium">
              Welcome,{' '}
              {isAdmin
                ? (currentUser as Admin).name
                : (currentUser as User).fullName}
            </span>
            {!isAdmin && <Notifications />}
            <button
              onClick={() => {
                logout();
                setCurrentUser(null);
              }}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* MAIN */}
      <div className="max-w-6xl mx-auto px-4 py-12">
        {isAdmin ? (
          // --- ADMIN VIEW ---
          <div className="space-y-8">
            <h1 className="text-3xl font-bold text-gray-800">Admin Dashboard</h1>
            <div className="bg-white p-6 rounded-2xl shadow-lg max-w-xl">
              <h2 className="text-xl font-bold text-green-700 mb-4">
                Assign Points to User
              </h2>
              <form
                className="space-y-4"
                onSubmit={async (e) => {
                  e.preventDefault();
                  try {
                    const res = await authAPI.assignPoints(
                      assignForm.phone,
                      assignForm.wasteType,
                      Number(assignForm.weight)
                    );
                    setAssignStatus(`Success! ${res.points} points assigned.`);
                    setAssignForm({
                      phone: '',
                      wasteType: 'plastic',
                      weight: '',
                    });
                  } catch (err: any) {
                    setAssignStatus(
                      err.response?.data?.message || 'Error assigning points'
                    );
                  }
                }}
              >
                <div>
                  <label className="block text-sm font-semibold mb-1">
                    User Phone
                  </label>
                  <input
                    type="tel"
                    required
                    value={assignForm.phone}
                    onChange={(e) =>
                      setAssignForm((f) => ({ ...f, phone: e.target.value }))
                    }
                    className="w-full p-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">
                    Waste Type
                  </label>
                  <select
                    value={assignForm.wasteType}
                    onChange={(e) =>
                      setAssignForm((f) => ({
                        ...f,
                        wasteType: e.target.value,
                      }))
                    }
                    className="w-full p-2 border rounded-lg"
                  >
                    <option value="plastic">Plastic</option>
                    <option value="biodegradable">Biodegradable</option>
                    <option value="e-waste">E-waste</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">
                    Weight (kg)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={assignForm.weight}
                    onChange={(e) =>
                      setAssignForm((f) => ({ ...f, weight: e.target.value }))
                    }
                    className="w-full p-2 border rounded-lg"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 rounded-lg"
                >
                  Assign Points
                </button>
                {assignStatus && (
                  <p
                    className={`mt-2 text-sm font-semibold ${
                      assignStatus.startsWith('Success')
                        ? 'text-green-600'
                        : 'text-red-600'
                    }`}
                  >
                    {assignStatus}
                  </p>
                )}
              </form>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-lg">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">
                Pending Pickup Requests
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="border-b">
                    <tr>
                      <th className="p-2">User</th>
                      <th className="p-2">Phone</th>
                      <th className="p-2">Address</th>
                      <th className="p-2">Date</th>
                      <th className="p-2">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allPickups.map((p) => (
                      <tr key={p._id} className="border-b">
                        <td className="p-2">{p.user?.fullName}</td>
                        <td className="p-2">{p.user?.phone}</td>
                        <td className="p-2">{p.address}</td>
                        <td className="p-2">
                          {new Date(p.pickupDate).toLocaleDateString()}
                        </td>
                        <td className="p-2">
                          <select
                            className="p-1 border rounded"
                            value={p.status}
                            onChange={(e) =>
                              handleStatusChange(p._id, e.target.value)
                            }
                          >
                            <option>Pending</option>
                            <option>Confirmed</option>
                            <option>Completed</option>
                            <option>Cancelled</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : (
          // --- USER VIEW ---
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              {/* USER HEADER CARD */}
              <div className="bg-gradient-to-r from-green-600 to-green-500 p-8 rounded-2xl text-white shadow-xl">
                <div className="flex justify-between items-start">
                  <div>
                    <h1 className="text-3xl font-bold">
                      Welcome back, {(currentUser as User).fullName}!
                    </h1>
                    <p className="text-green-200 mt-1">
                      You have {(currentUser as User).points} points.
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-yellow-300 text-lg">
                      {currentUserTier.name}
                    </div>
                    <div className="text-sm text-green-100">
                      Tier {currentUserTier.level}
                    </div>
                  </div>
                </div>
              </div>

              {/* ACTION CARDS */}
              <div className="grid md:grid-cols-2 gap-6">
                <Link
                  to="/schedule-pickup"
                  className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-shadow flex flex-col items-center justify-center text-center"
                >
                  <Truck className="w-12 h-12 text-green-500 mb-4" />
                  <h3 className="text-xl font-bold text-gray-800">
                    Schedule a Pickup
                  </h3>
                </Link>
                <Link
                  to="/games"
                  className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-shadow flex flex-col items-center justify-center text-center"
                >
                  <Gamepad2 className="w-12 h-12 text-blue-500 mb-4" />
                  <h3 className="text-xl font-bold text-gray-800">Play & Earn</h3>
                </Link>
              </div>

              {/* REWARDS */}
              <div className="bg-white p-6 rounded-2xl shadow-lg">
                <h3 className="text-2xl font-bold text-gray-800 mb-4">
                  Rewards for Your Tier ({currentUserTier.name})
                </h3>
                <div className="space-y-3">
                  {tierRewards.length > 0 ? (
                    tierRewards.map((reward) => {
                      const isRedeemed = (currentUser as User).redeemedRewards?.includes(
                        reward._id
                      );
                      return (
                        <button
                          key={reward._id}
                          className={`w-full p-3 rounded-lg text-left transition-colors ${
                            isRedeemed
                              ? 'bg-gray-200 cursor-not-allowed'
                              : 'bg-green-50 hover:bg-green-100 disabled:opacity-60'
                          }`}
                          disabled={
                            getUserPoints() < reward.pointsRequired ||
                            !!redeemingId ||
                            isRedeemed
                          }
                          onClick={() => handleRedeem(reward)}
                        >
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-3">
                              {getRewardIcon(reward.type)}
                              <div>
                                <p
                                  className={`font-semibold ${
                                    isRedeemed
                                      ? 'text-gray-500'
                                      : 'text-green-700'
                                  }`}
                                >
                                  {reward.title}
                                </p>
                                <p className="text-xs text-gray-600">
                                  {reward.description}
                                </p>
                              </div>
                            </div>
                            <span
                              className={`text-sm font-bold ml-4 ${
                                isRedeemed
                                  ? 'text-gray-600'
                                  : getUserPoints() >= reward.pointsRequired
                                  ? 'text-green-600'
                                  : 'text-red-500'
                              }`}
                            >
                              {isRedeemed
                                ? 'Redeemed'
                                : redeemingId === reward._id
                                ? '...'
                                : `${reward.pointsRequired} pts`}
                            </span>
                          </div>
                        </button>
                      );
                    })
                  ) : (
                    <p className="text-center text-gray-500 py-4">
                      No special rewards for this tier yet. Keep earning points!
                    </p>
                  )}
                </div>
              </div>

              {/* PICKUP HISTORY */}
              <div className="bg-white p-6 rounded-2xl shadow-lg">
                <h3 className="text-2xl font-bold text-gray-800 mb-4">
                  My Pickup History
                </h3>
                {userPickups.length > 0 ? (
                  userPickups.slice(0, 3).map((pickup) => (
                    <div
                      key={pickup._id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg mb-2"
                    >
                      <p className="text-sm font-medium">
                        {new Date(pickup.pickupDate).toLocaleDateString()}
                      </p>
                      <span
                        className={`text-xs font-bold px-2 py-1 rounded-full ${
                          pickup.status === 'Completed'
                            ? 'bg-green-200 text-green-800'
                            : 'bg-yellow-200 text-yellow-800'
                        }`}
                      >
                        {pickup.status}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500">
                    No pickups scheduled yet.
                  </p>
                )}
              </div>
            </div>

            {/* LEADERBOARD */}
            <div className="lg:col-span-1 space-y-8">
              <div className="bg-white p-6 rounded-2xl shadow-lg">
                <div className="flex items-center gap-3 mb-4">
                  <Trophy className="w-8 h-8 text-yellow-500" />
                  <h3 className="text-2xl font-bold text-gray-800">
                    Leaderboard
                  </h3>
                </div>
                <ol className="space-y-4">
                  {leaderboard.map((player, index) => (
                    <li key={player._id} className="flex items-center gap-4">
                      <div className="font-bold text-lg text-gray-500 w-6 text-center">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800">
                          {player.fullName}
                        </p>
                        <p className="text-sm text-gray-500">{player.village}</p>
                      </div>
                      <div className="ml-auto font-bold text-green-600">
                        {player.points} pts
                      </div>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
