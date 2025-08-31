import React, { useEffect, useState } from 'react';
import { Recycle, Menu, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Header: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { isAuthenticated, logout } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavClick = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setIsMobileMenuOpen(false);
    }
  };

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled 
        ? 'bg-white/98 backdrop-blur-md shadow-lg py-2' 
        : 'bg-white/95 backdrop-blur-md shadow-md py-4'
    }`}>
      <div className="max-w-6xl mx-auto px-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Recycle className="w-12 h-12 text-green-600 animate-pulse" />
          <span className="text-2xl font-bold bg-gradient-to-r from-green-600 to-green-500 bg-clip-text text-transparent">
            GreenQuest
          </span>
        </div>

        {/* Desktop Menu */}
        <ul className="hidden md:flex items-center gap-8">
          <li>
            <button 
              onClick={() => handleNavClick('home')}
              className="text-gray-700 hover:text-green-600 font-medium transition-colors duration-300 relative group"
            >
              Home
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-green-600 transition-all duration-300 group-hover:w-full"></span>
            </button>
          </li>
          <li>
            <button 
              onClick={() => handleNavClick('solution')}
              className="text-gray-700 hover:text-green-600 font-medium transition-colors duration-300 relative group"
            >
              Solution
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-green-600 transition-all duration-300 group-hover:w-full"></span>
            </button>
          </li>
          <li>
            <button 
              onClick={() => handleNavClick('how-it-works')}
              className="text-gray-700 hover:text-green-600 font-medium transition-colors duration-300 relative group"
            >
              How It Works
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-green-600 transition-all duration-300 group-hover:w-full"></span>
            </button>
          </li>
          <li>
            <button 
              onClick={() => handleNavClick('rewards')}
              className="text-gray-700 hover:text-green-600 font-medium transition-colors duration-300 relative group"
            >
              Rewards
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-green-600 transition-all duration-300 group-hover:w-full"></span>
            </button>
          </li>
          {isAuthenticated ? (
            <li>
              <button 
                onClick={logout}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-medium transition-all duration-300 transform hover:scale-105"
              >
                Logout
              </button>
            </li>
          ) : (
            <>
              <li>
                <a
                  href="/login"
                  className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg font-medium transition-all duration-300 transform hover:scale-105 mr-2"
                >
                  Login
                </a>
              </li>
              <li>
                <button 
                  onClick={() => handleNavClick('join')}
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium transition-all duration-300 transform hover:scale-105"
                >
                  Join Now
                </button>
              </li>
            </>
          )}
        </ul>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden p-2"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-t shadow-lg">
          <div className="px-4 py-4 space-y-3">
            <button 
              onClick={() => handleNavClick('home')}
              className="block w-full text-left py-2 text-gray-700 hover:text-green-600"
            >
              Home
            </button>
            <button 
              onClick={() => handleNavClick('solution')}
              className="block w-full text-left py-2 text-gray-700 hover:text-green-600"
            >
              Solution
            </button>
            <button 
              onClick={() => handleNavClick('how-it-works')}
              className="block w-full text-left py-2 text-gray-700 hover:text-green-600"
            >
              How It Works
            </button>
            <button 
              onClick={() => handleNavClick('rewards')}
              className="block w-full text-left py-2 text-gray-700 hover:text-green-600"
            >
              Rewards
            </button>
            {isAuthenticated ? (
              <button 
                onClick={logout}
                className="w-full bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-medium"
              >
                Logout
              </button>
            ) : (
              <>
                <a
                  href="/login"
                  className="block w-full bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium mb-2 text-center"
                >
                  Login
                </a>
                <button 
                  onClick={() => handleNavClick('join')}
                  className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium"
                >
                  Join Now
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Header;