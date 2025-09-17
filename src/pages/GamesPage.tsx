import React from 'react';
import { Link } from 'react-router-dom';
import { BrainCircuit, Trash2, Milestone } from 'lucide-react';

const GamesPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-100 to-blue-100 py-20">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-extrabold text-green-700">Eco Games</h1>
          <p className="text-xl text-gray-600 mt-4">Choose a game to play and earn bonus points!</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Quiz Game Card */}
          <Link to="/games/quiz" className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 flex flex-col items-center text-center">
            <BrainCircuit size={64} className="text-purple-500 mb-4" />
            <h2 className="text-2xl font-bold text-gray-800">Recycling Quiz</h2>
            <p className="text-gray-600 mt-2">Test your knowledge about recycling and sustainability.</p>
          </Link>
          
          {/* Sort the Trash Game Card */}
          <Link to="/games/sort" className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 flex flex-col items-center text-center">
            <Trash2 size={64} className="text-red-500 mb-4" />
            <h2 className="text-2xl font-bold text-gray-800">Sort the Trash</h2>
            <p className="text-gray-600 mt-2">Drag and drop the items into the correct bins.</p>
          </Link>
          
          {/* Maze Game Card */}
          <Link to="/games/maze" className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 flex flex-col items-center text-center">
            <Milestone size={64} className="text-blue-500 mb-4" />
            <h2 className="text-2xl font-bold text-gray-800">Maze Challenge</h2>
            <p className="text-gray-600 mt-2">Guide the bottle through the maze to the recycling bin.</p>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default GamesPage;
// import React from 'react';
// import QuizGame from '../components/QuizGame';
// // You would also import a Header/Navbar component here
// // import Header from '../components/Header';

// const GamesPage: React.FC = () => {
//   return (
//     <div className="min-h-screen bg-gradient-to-br from-green-100 to-blue-100 py-20">
//       {/* <Header /> */}
//       <div className="max-w-6xl mx-auto px-4">
//         <div className="text-center mb-12">
//             <h1 className="text-5xl font-extrabold text-green-700">Eco Games</h1>
//             <p className="text-xl text-gray-600 mt-4">Test your knowledge and earn bonus points!</p>
//         </div>
//         <QuizGame />
//       </div>
//     </div>
//   );
// };

// export default GamesPage;