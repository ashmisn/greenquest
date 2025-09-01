import React, { useState } from "react";

const ScheduleSection: React.FC = () => {
  const [showSchedule, setShowSchedule] = useState(false);

  return (
    <section className="py-12 bg-gradient-to-r from-green-200 via-green-50 to-green-100 animate-gradient-x">
      <div className="max-w-5xl mx-auto px-4 text-center">
        {/* Toggle button */}
        <button
          onClick={() => setShowSchedule((prev) => !prev)}
          className="px-8 py-3 bg-gradient-to-r from-green-500 to-blue-500 text-white font-bold text-lg rounded-full shadow-lg hover:scale-105 transform transition-transform duration-300"
        >
          {showSchedule ? "Hide Schedule" : "View Schedule"}
        </button>

        {/* Timetable */}
        {showSchedule && (
          <div className="mt-12">
            <h2 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-green-600 via-blue-500 to-yellow-500 mb-8 drop-shadow-lg">
              Waste Collection Timetable
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Monday */}
              <div className="bg-gradient-to-br from-green-100 to-green-300 rounded-3xl shadow-xl p-8 flex flex-col items-center transform hover:scale-105 transition-transform duration-300">
                <span className="text-6xl mb-3 animate-bounce">🧴</span>
                <h3 className="font-bold text-2xl text-green-700 mb-2">
                  Monday
                </h3>
                <p className="text-gray-700 font-semibold">Plastic Waste</p>
                <span className="mt-2 text-green-500 font-bold">♻️ 10 pts/kg</span>
              </div>
              {/* Tuesday */}
              <div className="bg-gradient-to-br from-blue-100 to-blue-300 rounded-3xl shadow-xl p-8 flex flex-col items-center transform hover:scale-105 transition-transform duration-300">
                <span className="text-6xl mb-3 animate-pulse">💻</span>
                <h3 className="font-bold text-2xl text-blue-700 mb-2">
                  Tuesday
                </h3>
                <p className="text-gray-700 font-semibold">E-waste</p>
                <span className="mt-2 text-blue-500 font-bold">🔌 25 pts/kg</span>
              </div>
              {/* Wednesday */}
              <div className="bg-gradient-to-br from-yellow-100 to-green-200 rounded-3xl shadow-xl p-8 flex flex-col items-center transform hover:scale-105 transition-transform duration-300">
                <span className="text-6xl mb-3 animate-spin-slow">🌿</span>
                <h3 className="font-bold text-2xl text-yellow-700 mb-2">
                  Wednesday
                </h3>
                <p className="text-gray-700 font-semibold">
                  Biodegradable Waste
                </p>
                <span className="mt-2 text-yellow-600 font-bold">🌱 15 pts/kg</span>
              </div>
              {/* Thursday */}
              <div className="bg-gradient-to-br from-red-100 to-red-300 rounded-3xl shadow-xl p-8 flex flex-col items-center transform hover:scale-105 transition-transform duration-300">
                <span className="text-6xl mb-3 animate-pulse">⚕️</span>
                <h3 className="font-bold text-2xl text-red-700 mb-2">
                  Thursday
                </h3>
                <p className="text-gray-700 font-semibold">Medical Waste</p>
                <span className="mt-2 text-red-500 font-bold">💉 50 pts/kg</span>
              </div>
              {/* Sunday */}
              <div className="bg-gradient-to-br from-gray-100 to-gray-300 rounded-3xl shadow-xl p-8 flex flex-col items-center transform hover:scale-105 transition-transform duration-300">
                <span className="text-6xl mb-3 animate-wiggle">📦</span>
                <h3 className="font-bold text-2xl text-gray-700 mb-2">
                  Sunday
                </h3>
                <p className="text-gray-700 font-semibold">Special Pickup</p>
                <span className="mt-2 text-gray-500 font-bold">
                  ✨ Call for Quote
                </span>
              </div>
            </div>
            <p className="text-center text-gray-600 mt-8 text-lg italic">
              Keep your waste ready for collection on the right day and earn
              more points!
            </p>
          </div>
        )}
      </div>
    </section>
  );
};

export default ScheduleSection;
