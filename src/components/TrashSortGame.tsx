import React, { useState } from 'react';
import { useDrag, useDrop, DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { GlassWater, Trash2, Recycle } from 'lucide-react'; // <-- CORRECTED: Changed Bottle to GlassWater

const ItemTypes = {
  BOTTLE: 'bottle',
};

// --- Draggable Bottle Component ---
const DraggableBottle: React.FC = () => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: ItemTypes.BOTTLE,
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));

  return (
    <div
      ref={drag}
      style={{ opacity: isDragging ? 0.5 : 1 }}
      className="cursor-grab p-4 bg-blue-100 rounded-lg flex items-center justify-center"
    >
      <GlassWater size={48} className="text-blue-500" /> {/* <-- CORRECTED: Changed Bottle to GlassWater */}
    </div>
  );
};

// ... The rest of the file is the same ...

// --- Trash Bin Drop Target Component ---
interface TrashBinProps {
  binType: 'Recycling' | 'General';
  onDrop: (binType: 'Recycling' | 'General') => void;
}
const TrashBin: React.FC<TrashBinProps> = ({ binType, onDrop }) => {
  const [{ isOver }, drop] = useDrop(() => ({
    accept: ItemTypes.BOTTLE,
    drop: () => onDrop(binType),
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  }));

  const isRecycling = binType === 'Recycling';

  return (
    <div
      ref={drop}
      className={`p-8 border-4 rounded-xl text-center transition-colors duration-300 ${
        isOver ? 'border-yellow-400 bg-yellow-100' : 'border-dashed border-gray-400'
      }`}
    >
      {isRecycling ? <Recycle size={48} className="mx-auto text-green-600" /> : <Trash2 size={48} className="mx-auto text-gray-700" />}
      <p className="mt-4 font-bold text-lg">{binType} Bin</p>
    </div>
  );
};

// --- Main Game Component ---
const TrashSortGame: React.FC = () => {
  const [showBottle, setShowBottle] = useState(true);
  const [message, setMessage] = useState('Drag the plastic bottle to the correct bin!');

  const handleDrop = (binType: 'Recycling' | 'General') => {
    setShowBottle(false);
    if (binType === 'Recycling') {
      setMessage('Correct! Plastic bottles go in the recycling bin. You earned 10 points!');
    } else {
      setMessage('Oops! Plastic bottles should be recycled. Try again!');
    }
  };
  
  const resetGame = () => {
      setShowBottle(true);
      setMessage('Drag the plastic bottle to the correct bin!');
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="bg-white p-8 rounded-2xl shadow-2xl max-w-2xl mx-auto mt-12">
        <h2 className="text-2xl font-bold text-center mb-6">Sort the Trash!</h2>
        <div className="mb-8 p-4 bg-gray-100 rounded-lg text-center font-semibold text-gray-800">
          {message}
        </div>
        
        <div className="flex justify-center mb-12 h-24 items-center">
            {showBottle && <DraggableBottle />}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <TrashBin binType="Recycling" onDrop={handleDrop} />
          <TrashBin binType="General" onDrop={handleDrop} />
        </div>
        
        {!showBottle && (
            <div className="text-center mt-8">
                <button onClick={resetGame} className='bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-transform hover:scale-105'>
                    Play Again
                </button>
            </div>
        )}
      </div>
    </DndProvider>
  );
};

export default TrashSortGame;