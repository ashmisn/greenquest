import React, { useState } from 'react';
import { Recycle, LogIn } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { authAPI } from '../services/api';
import { useNavigate } from 'react-router-dom';

const LoginPage: React.FC = () => {
  const [role, setRole] = useState<'user' | 'admin'>('user');
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await authAPI.login(formData.username, formData.password, role);
      login(response.token, response.user);
      navigate('/dashboard');
    } catch (error: any) {
      alert(error.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-600 to-green-500 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-20 w-32 h-32 bg-white rounded-full animate-bounce"></div>
        <div className="absolute bottom-32 right-20 w-48 h-48 bg-white rounded-full animate-pulse"></div>
        <div className="absolute bottom-40 left-32 w-20 h-20 bg-white rounded-full animate-bounce delay-1000"></div>
      </div>

      <div className="relative w-full max-w-md">
        <div className="bg-white p-8 rounded-3xl shadow-2xl transform hover:scale-105 transition-all duration-300">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4 shadow-lg">
              <Recycle className="w-12 h-12 text-green-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-800">Welcome Back</h1>
            <p className="text-gray-600">Sign in to your GreenQuest account</p>
          </div>

          {/* Role Toggle */}
          <div className="flex bg-gray-100 rounded-2xl p-1 mb-6">
            <button
              type="button"
              onClick={() => setRole('user')}
              className={`flex-1 py-3 rounded-xl font-semibold transition-all duration-300 ${
                role === 'user'
                  ? 'bg-green-600 text-white shadow-lg transform scale-105'
                  : 'text-gray-600 hover:text-green-600'
              }`}
            >
              User
            </button>
            <button
              type="button"
              onClick={() => setRole('admin')}
              className={`flex-1 py-3 rounded-xl font-semibold transition-all duration-300 ${
                role === 'admin'
                  ? 'bg-green-600 text-white shadow-lg transform scale-105'
                  : 'text-gray-600 hover:text-green-600'
              }`}
            >
              Admin
            </button>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {role === 'admin' ? 'ID Number' : 'Phone Number'}
              </label>
              <input
                type={role === 'admin' ? 'text' : 'tel'}
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:outline-none transition-all duration-300 transform focus:scale-105"
                placeholder={role === 'admin' ? 'Enter your ID number' : 'Enter your phone number'}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Password
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:outline-none transition-all duration-300 transform focus:scale-105"
                placeholder="Enter your password"
              />
            </div>

            <div className="text-right">
              <a href="#" className="text-green-600 hover:text-green-700 font-medium text-sm transition-colors duration-300">
                Forgot Password?
              </a>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-green-600 hover:bg-green-700 text-white py-4 rounded-lg font-bold text-lg flex items-center justify-center gap-3 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <LogIn className="w-5 h-5" />
              {isLoading ? 'Signing In...' : `Login as ${role.charAt(0).toUpperCase() + role.slice(1)}`}
            </button>
          </form>

          <div className="text-center mt-6">
            <p className="text-gray-600">
              Don't have an account?{' '}
              <button
                onClick={() => navigate('/')}
                className="text-green-600 hover:text-green-700 font-semibold transition-colors duration-300"
              >
                Register
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;