import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Common/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import AddMissingPerson from './pages/AddMissingPerson';
import MissingPersonDetails from './pages/MissingPersonDetails';
import SearchMissingPersons from './pages/SearchMissingPersons';

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }
  
  return user ? children : <Navigate to="/login" />;
};

function AppRoutes() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        <Route path="/add" element={<PrivateRoute><AddMissingPerson /></PrivateRoute>} />
        <Route path="/search" element={<SearchMissingPersons />} />
        <Route path="/missing-person/:id" element={<MissingPersonDetails />} />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;