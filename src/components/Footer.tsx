import React from 'react';
import { Recycle, MapPin, Phone, Mail, Clock, Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';

const Footer: React.FC = () => {
  const handleNavClick = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <footer className="bg-gradient-to-br from-gray-900 to-gray-800 text-white py-16">
      <div className="max-w-6xl mx-auto px-4">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Company Info */}
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <Recycle className="w-10 h-10 text-green-400" />
              <span className="text-2xl font-bold bg-gradient-to-r from-green-400 to-green-300 bg-clip-text text-transparent">
                GreenQuest
              </span>
            </div>
            <p className="text-gray-300 leading-relaxed">
              Transforming rural waste management through technology and community engagement. 
              Join us in building a sustainable future.
            </p>
            <div className="flex gap-4">
              <a href="#" className="w-12 h-12 bg-white/10 hover:bg-green-500 rounded-full flex items-center justify-center transition-all duration-300 transform hover:scale-110">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="w-12 h-12 bg-white/10 hover:bg-green-500 rounded-full flex items-center justify-center transition-all duration-300 transform hover:scale-110">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="w-12 h-12 bg-white/10 hover:bg-green-500 rounded-full flex items-center justify-center transition-all duration-300 transform hover:scale-110">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="w-12 h-12 bg-white/10 hover:bg-green-500 rounded-full flex items-center justify-center transition-all duration-300 transform hover:scale-110">
                <Linkedin className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-yellow-400 font-bold text-lg mb-6">Quick Links</h3>
            <ul className="space-y-3">
              {['Home', 'Solution', 'How It Works', 'Rewards'].map((link) => (
                <li key={link}>
                  <button
                    onClick={() => handleNavClick(link.toLowerCase().replace(' ', '-'))}
                    className="text-gray-300 hover:text-yellow-400 transition-all duration-300 transform hover:translate-x-2"
                  >
                    {link}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-yellow-400 font-bold text-lg mb-6">Support</h3>
            <ul className="space-y-3">
              {['Help Center', 'Contact Us', 'Privacy Policy', 'Terms of Service', 'FAQ'].map((link) => (
                <li key={link}>
                  <a href="#" className="text-gray-300 hover:text-yellow-400 transition-all duration-300 transform hover:translate-x-2">
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-yellow-400 font-bold text-lg mb-6">Contact Info</h3>
            <ul className="space-y-4">
              <li className="flex items-center gap-3 text-gray-300">
                <MapPin className="w-5 h-5 text-green-400" />
                IIIT Kottayam, Kerala
              </li>
              <li className="flex items-center gap-3 text-gray-300">
                <Phone className="w-5 h-5 text-green-400" />
                +91 98765 43210
              </li>
              <li className="flex items-center gap-3 text-gray-300">
                <Mail className="w-5 h-5 text-green-400" />
                info@greenquest.in
              </li>
              <li className="flex items-center gap-3 text-gray-300">
                <Clock className="w-5 h-5 text-green-400" />
                Mon-Fri: 9AM-6PM
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-gray-700 text-center text-gray-400">
          <p>&copy; 2024 GreenQuest. All rights reserved. | Developed by Team GreenQuest - IIIT Kottayam</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;