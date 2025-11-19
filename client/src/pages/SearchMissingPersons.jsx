import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { missingPersonsAPI } from '../services/api';
import { Search, User, MapPin, Calendar } from 'lucide-react';

export default function SearchMissingPersons() {
  const [missingPersons, setMissingPersons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    gender: '',
    status: 'missing'
  });

  useEffect(() => {
    fetchMissingPersons();
  }, [filters]);

  const fetchMissingPersons = async () => {
    try {
      setLoading(true);
      const response = await missingPersonsAPI.getAll(filters);
      setMissingPersons(response.data.data);
    } catch (error) {
      console.error('Error fetching missing persons:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown';
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Search Missing Persons</h1>

      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by name, location..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <select
              value={filters.gender}
              onChange={(e) => setFilters({ ...filters, gender: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="">All Genders</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      ) : missingPersons.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow-md">
          <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No missing persons found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {missingPersons.map((person) => (
            <Link
              key={person.id}
              to={`/missing-person/${person.id}`}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition"
            >
              {person.photos.length > 0 ? (
                <img
                  src={`http://localhost:5000${person.photos[0].url}`}
                  alt={person.full_name}
                  className="w-full h-48 object-cover"
                />
              ) : (
                <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                  <User className="w-16 h-16 text-gray-400" />
                </div>
              )}

              <div className="p-4">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{person.full_name}</h3>
                
                <div className="space-y-2 text-sm text-gray-600">
                  {person.age && (
                    <p>Age: {person.age} • {person.gender}</p>
                  )}
                  
                  {person.last_seen_location && (
                    <div className="flex items-start space-x-2">
                      <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                      <span className="line-clamp-2">{person.last_seen_location}</span>
                    </div>
                  )}
                  
                  {person.last_seen_date && (
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4 flex-shrink-0" />
                      <span>Last seen: {formatDate(person.last_seen_date)}</span>
                    </div>
                  )}
                </div>

                <div className="mt-4">
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                    person.status === 'missing' ? 'bg-red-100 text-red-800' :
                    person.status === 'found' ? 'bg-green-100 text-green-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {person.status.toUpperCase()}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}