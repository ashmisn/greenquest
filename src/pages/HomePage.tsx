import React from 'react';
import Header from '../components/Header';
import Hero from '../components/Hero';
import Problem from '../components/Problem';
import Solution from '../components/Solution';
import HowItWorks from '../components/HowItWorks';
import Rewards from '../components/Rewards';
import Engagement from '../components/Engagement';
import Impact from '../components/Impact';
import Registration from '../components/Registration';
import Footer from '../components/Footer';

const HomePage: React.FC = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <Hero />
      <Problem />
      <Solution />
      <HowItWorks />
      <Rewards />
      <Engagement />
      <Impact />
      <Registration />
      <Footer />
    </div>
  );
};

export default HomePage;