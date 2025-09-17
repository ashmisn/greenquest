import React, { useState, useEffect } from "react";
import Header from "../components/Header";
import Hero from "../components/Hero";
import Rewards from "../components/Rewards";
import Leaderboard from "../components/Leaderboard";
import Footer from "../components/Footer";
import { leaderboardAPI } from "../services/api"; // MODIFIED: Removed rewardAPI
import { Reward } from "../types";
// Import other sections you want on the homepage
import Slideshow from "../components/Slideshow";
import Problem from "../components/Problem";
import Solution from "../components/Solution";
import HowItWorks from "../components/HowItWorks";
import Engagement from "../components/Engagement";
import Impact from "../components/Impact";
import Registration from "../components/Registration";

interface LeaderboardUser {
  _id: string;
  fullName: string;
  village: string;
  points: number;
}

// 1. CREATE A HARDCODED LIST OF SAMPLE REWARDS
const sampleRewards: Reward[] = [
  {
    _id: 'sample1',
    title: '₹50 Mobile Recharge',
    description: 'Instant recharge for any number.',
    pointsRequired: 500,
    type: 'Recharge',
    requiredLevel: 1,
  },
  {
    _id: 'sample2',
    title: '10% Off Groceries',
    description: 'Discount at local partner stores.',
    pointsRequired: 300,
    type: 'Discount',
    requiredLevel: 1,
  },
  {
    _id: 'sample3',
    title: 'Movie Ticket Voucher',
    description: 'Enjoy a movie on us!',
    pointsRequired: 1200,
    type: 'Voucher',
    requiredLevel: 2,
  },
  {
    _id: 'sample4',
    title: 'Eco-Friendly Plant Kit',
    description: 'Grow your own plants at home.',
    pointsRequired: 800,
    type: 'Product', // Note: Make sure 'Product' is in your Reward type definition
    requiredLevel: 2,
  },
];


const HomePage: React.FC = () => {
  // 2. REMOVED STATE AND API CALL FOR REWARDS
  //    The leaderboard fetching logic remains the same.
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardUser[]>([]);
  const [loadingLeaderboard, setLoadingLeaderboard] = useState(true);

  useEffect(() => {
    leaderboardAPI.getLeaderboard()
      .then(data => setLeaderboardData(data))
      .catch(err => console.error("Failed to fetch leaderboard:", err))
      .finally(() => setLoadingLeaderboard(false));
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <Hero />
      <Slideshow />
      <Problem />
      <Solution />
      <HowItWorks />
      
      {/* 3. PASS THE SAMPLE DATA DIRECTLY TO THE REWARDS COMPONENT */}
      <Rewards rewards={sampleRewards} loading={false} title="Our Rewards & Benefits" />
      
      <Leaderboard leaderboardData={leaderboardData} loading={loadingLeaderboard} />
      <Engagement />
      <Impact />
      <Registration />
      <Footer />
    </div>
  );
};

export default HomePage;