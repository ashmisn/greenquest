import React from 'react';
import { Link } from 'react-router-dom';
import TrashSortGame from '../components/TrashSortGame';
import { ArrowLeft } from 'lucide-react';

const TrashSortGamePage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-100 to-blue-100 py-12">
      <div className="max-w-6xl mx-auto px-4">
        <Link to="/games" className="inline-flex items-center gap-2 text-green-700 font-semibold hover:underline mb-8">
          <ArrowLeft size={20} />
          Back to Games Menu
        </Link>
        <TrashSortGame />
      </div>
    </div>
  );
};

export default TrashSortGamePage;