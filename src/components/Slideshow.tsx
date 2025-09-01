import React, { useEffect, useState } from 'react';

const slides = [
  {
    image: 'https://images.unsplash.com/photo-1501004318641-b39e6451bec6?auto=format&fit=crop&w=1600&q=80',
    tip: 'Segregate your waste into plastic, e-waste, and biodegradable bins.'
  },
  {
    image: 'https://images.unsplash.com/photo-1523978591478-c753949ff840?auto=format&fit=crop&w=1600&q=80',
    tip: 'Plant more trees and maintain greenery around your home.'
  },
  {
    image: '/images.jpeg',
    tip: 'Reduce, reuse, and recycle to minimize waste.'
  },
  {
    image: '/imagesreuse.jpeg',
    tip: 'Avoid single-use plastics and carry reusable bags.'
  },
  {
    image: '/saveelectricity.jpg',
    tip: 'Save water and electricity whenever possible.'
  },
];


const Slideshow: React.FC = () => {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-full overflow-hidden h-72 md:h-96">
      {/* Slides container */}
      <div
        className="flex transition-transform duration-700 ease-in-out"
        style={{ transform: `translateX(-${current * 100}%)` }}
      >
        {slides.map((slide, idx) => (
          <div
            key={idx}
            className="w-full flex-shrink-0 relative h-72 md:h-96"
          >
            <img
              src={slide.image}
              alt={slide.tip}
              className="object-cover w-full h-full rounded-2xl brightness-75"
            />
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/70 to-transparent rounded-b-2xl flex justify-center">
              <span className="text-white text-lg md:text-xl font-bold text-center drop-shadow-lg">
                {slide.tip}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation dots */}
      <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
        {slides.map((_, idx) => (
          <div
            key={idx}
            className={`w-3 h-3 rounded-full cursor-pointer ${
              current === idx ? "bg-white" : "bg-gray-400"
            }`}
            onClick={() => setCurrent(idx)}
          ></div>
        ))}
      </div>
    </div>
  );
};

export default Slideshow;