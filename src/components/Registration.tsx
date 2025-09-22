import React, { useState } from 'react';
import { UserPlus, CheckCircle } from 'lucide-react';
import { authAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom'; // 1. Import useNavigate

const Registration: React.FC = () => {
  const navigate = useNavigate(); // 2. Get the navigate function
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    username: '', // <-- FIX: Added username field
    email: '',
    village: '',
    householdSize: '',
    address: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  // We don't need the login function from useAuth here for registration
  // const { login } = useAuth(); 

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await authAPI.register(formData);
      setShowSuccess(true);
      
      // I've removed the automatic login and form reset.
      // After showing the success message, the user will be redirected.
      
    } catch (error: any) {
      alert(error.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (showSuccess) {
    return (
      <section id="join" className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center bg-green-50 p-12 rounded-2xl border border-green-200">
            <CheckCircle className="w-20 h-20 text-green-600 mx-auto mb-6 animate-bounce" />
            <h2 className="text-3xl font-bold text-green-600 mb-4">Registration Successful!</h2>
            <p className="text-xl text-gray-600 mb-6">
              Welcome to GreenQuest! Please log in to continue.
            </p>
            <button
              onClick={() => navigate('/login')} // 3. Redirect to login on click
              className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg font-bold transition-all duration-300 transform hover:scale-105"
            >
              Go to Login
            </button>
          </div>
        </div>
      </section>
    );
  }
  
  // --- The rest of your JSX form is correct and remains the same ---
  return (
    <section id="join" className="py-20 bg-white">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold text-green-600 mb-6">
            Join the Green Revolution
          </h2>
          <div className="w-16 h-1 bg-gradient-to-r from-yellow-400 to-yellow-500 mx-auto mb-6 rounded-full"></div>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Be part of the solution. Register your household and start earning rewards while protecting our environment.
          </p>
        </div>

        <div className="bg-white p-8 lg:p-12 rounded-2xl shadow-2xl border border-green-100 max-w-2xl mx-auto">
          <h3 className="text-2xl font-bold text-green-600 text-center mb-8">
            Register Your Household
          </h3>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name *</label>
                <input type="text" name="fullName" value={formData.fullName} onChange={handleInputChange} required className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:outline-none transition-all duration-300 transform focus:scale-105" placeholder="Enter your full name" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Phone Number *</label>
                <input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} required className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:outline-none transition-all duration-300 transform focus:scale-105" placeholder="Enter your phone number" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Username *</label>
              <input type="text" name="username" value={formData.username} onChange={handleInputChange} required className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:outline-none transition-all duration-300 transform focus:scale-105" placeholder="Enter your username" />
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Village/Locality *</label>
                <input type="text" name="village" value={formData.village} onChange={handleInputChange} required className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:outline-none transition-all duration-300 transform focus:scale-105" placeholder="Enter your village/locality" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Household Size *</label>
                <select name="householdSize" value={formData.householdSize} onChange={handleInputChange} required className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:outline-none transition-all duration-300 transform focus:scale-105">
                  <option value="">Select size</option>
                  <option value="1-3">1-3 members</option>
                  <option value="4-6">4-6 members</option>
                  <option value="7-10">7-10 members</option>
                  <option value="10+">10+ members</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Complete Address *</label>
              <input type="text" name="address" value={formData.address} onChange={handleInputChange} required className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:outline-none transition-all duration-300 transform focus:scale-105" placeholder="Enter your complete address" />
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address (Optional)</label>
                <input type="email" name="email" value={formData.email} onChange={handleInputChange} className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:outline-none transition-all duration-300 transform focus:scale-105" placeholder="Enter your email" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Create Password *</label>
                <input type="password" name="password" value={formData.password} onChange={handleInputChange} required className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:outline-none transition-all duration-300 transform focus:scale-105" placeholder="Create a secure password" />
              </div>
            </div>
            <div className="text-center pt-4">
              <button type="submit" disabled={isLoading} className="inline-flex items-center gap-3 bg-gradient-to-r from-green-600 to-green-500 text-white px-8 py-4 rounded-2xl font-bold text-lg hover:shadow-2xl hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed">
                <UserPlus className="w-5 h-5" />
                {isLoading ? 'Registering...' : 'Register Now'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
};

export default Registration;