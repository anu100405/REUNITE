import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Search, UserPlus, Home, LogOut, User } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">R</span>
              </div>
              <span className="text-2xl font-bold text-primary-600">REUNITE</span>
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            <Link
              to="/search"
              className="flex items-center space-x-1 px-4 py-2 text-gray-700 hover:text-primary-600 transition"
            >
              <Search className="w-5 h-5" />
              <span className="hidden sm:inline">Search</span>
            </Link>

            {user ? (
              <>
                <Link
                  to="/"
                  className="flex items-center space-x-1 px-4 py-2 text-gray-700 hover:text-primary-600 transition"
                >
                  <Home className="w-5 h-5" />
                  <span className="hidden sm:inline">Dashboard</span>
                </Link>
                
                <Link
                  to="/add"
                  className="flex items-center space-x-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
                >
                  <UserPlus className="w-5 h-5" />
                  <span className="hidden sm:inline">Add Missing</span>
                </Link>

                <div className="flex items-center space-x-2 pl-4 border-l border-gray-300">
                  <User className="w-5 h-5 text-gray-600" />
                  <span className="text-sm text-gray-700">{user.username}</span>
                </div>

                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-1 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                >
                  <LogOut className="w-5 h-5" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-4 py-2 text-gray-700 hover:text-primary-600 transition"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}