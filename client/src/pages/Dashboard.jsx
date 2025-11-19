import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { missingPersonsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Plus, Search, User, MapPin, Calendar } from 'lucide-react';

export default function Dashboard() {
  const { user } = useAuth();
  const [myReports, setMyReports] = useState([]);
  const [recentReports, setRecentReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await missingPersonsAPI.getAll({ per_page: 10 });
      const allReports = response.data.data;
      
      setMyReports(allReports.filter(p => p.reporter.id === user.id));
      setRecentReports(allReports.slice(0, 6));
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown';
    return new Date(dateString).toLocaleDateString();
  };

  const PersonCard = ({ person }) => (
    <Link
      to={`/missing-person/${person.id}`}
      className="bg-white rounded-lg shadow hover:shadow-md transition overflow-hidden"
    >
      {person.photos.length > 0 ? (
        <img
          src={`http://localhost:5000${person.photos[0].url}`}
          alt={person.full_name}
          className="w-full h-40 object-cover"
        />
      ) : (
        <div className="w-full h-40 bg-gray-200 flex items-center justify-center">
          <User className="w-12 h-12 text-gray-400" />
        </div>
      )}
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 mb-2 line-clamp-1">{person.full_name}</h3>
        <div className="space-y-1 text-sm text-gray-600">
          {person.last_seen_location && (
            <div className="flex items-start space-x-1">
              <MapPin className="w-3 h-3 mt-1 flex-shrink-0" />
              <span className="line-clamp-1">{person.last_seen_location}</span>
            </div>
          )}
          {person.last_seen_date && (
            <div className="flex items-center space-x-1">
              <Calendar className="w-3 h-3 flex-shrink-0" />
              <span>{formatDate(person.last_seen_date)}</span>
            </div>
          )}
        </div>
        <span className={`inline-block mt-3 px-2 py-1 rounded-full text-xs font-medium ${
          person.status === 'missing' ? 'bg-red-100 text-red-800' :
          person.status === 'found' ? 'bg-green-100 text-green-800' :
          'bg-gray-100 text-gray-800'
        }`}>
          {person.status.toUpperCase()}
        </span>
      </div>
    </Link>
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome back, {user.username}!</h1>
        <p className="text-gray-600">Manage your reports and search for missing persons</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Total Reports</p>
              <p className="text-3xl font-bold text-gray-900">{myReports.length}</p>
            </div>
            <div className="bg-primary-100 p-3 rounded-lg">
              <User className="w-8 h-8 text-primary-600" />
            </div>
          </div>
        </div>

        <Link
          to="/add"
          className="bg-primary-600 text-white rounded-lg shadow p-6 hover:bg-primary-700 transition flex items-center justify-between"
        >
          <div>
            <p className="text-primary-100 text-sm">Add New</p>
            <p className="text-2xl font-bold">Missing Person</p>
          </div>
          <Plus className="w-8 h-8" />
        </Link>

        <Link
          to="/search"
          className="bg-green-600 text-white rounded-lg shadow p-6 hover:bg-green-700 transition flex items-center justify-between"
        >
          <div>
            <p className="text-green-100 text-sm">Search</p>
            <p className="text-2xl font-bold">Find Missing</p>
          </div>
          <Search className="w-8 h-8" />
        </Link>
      </div>

      {myReports.length > 0 && (
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">My Reports</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {myReports.map(person => (
              <PersonCard key={person.id} person={person} />
            ))}
          </div>
        </div>
      )}

      <div>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Recent Reports</h2>
          <Link to="/search" className="text-primary-600 hover:text-primary-700 font-medium">
            View All →
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {recentReports.map(person => (
            <PersonCard key={person.id} person={person} />
          ))}
        </div>
      </div>
    </div>
  );
}