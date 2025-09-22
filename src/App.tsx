import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import SchedulePickupPage  from './pages/SchedulePickupPage'; // Import the new page
import GamesPage from './pages/GamesPage';
import QuizGamePage from './components/QuizGame'; // 1. Import new game pages
import TrashSortGamePage from './components/TrashSortGame';
import MazeGamePage from './components/MazeGame';
import Marketplace from './pages/Marketplace';   // <-- Import
import CreateProduct from './pages/CreateProduct';


const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
};

const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Allow all users to access public routes (homepage, login, etc.)
  return <>{children}</>;
};

function AppContent() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={
          <PublicRoute>
            <HomePage />
          </PublicRoute>
        } />
        <Route path="/login" element={
          <PublicRoute>
            <LoginPage />
          </PublicRoute>
        } />
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } />
        
        {/* --- ADDED THE NEW PROTECTED ROUTE --- */}
        <Route path="/schedule-pickup" element={
          <ProtectedRoute>
            <SchedulePickupPage />
          </ProtectedRoute>
        } />
        <Route path="/games" element={<ProtectedRoute><GamesPage /></ProtectedRoute>} />
        <Route path="/games/quiz" element={<ProtectedRoute><QuizGamePage /></ProtectedRoute>} />
        <Route path="/games/sort" element={<ProtectedRoute><TrashSortGamePage /></ProtectedRoute>} />
        <Route path="/games/maze" element={<ProtectedRoute><MazeGamePage /></ProtectedRoute>} />
        <Route path="/marketplace" element={<Marketplace />} />
          <Route path="/list-product" element={<CreateProduct />} />

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;