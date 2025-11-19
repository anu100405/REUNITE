import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { missingPersonsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { MapPin, Calendar, User, Phone, Mail, Home, ArrowLeft, Trash2 } from 'lucide-react';

export default function MissingPersonDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [person, setPerson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedPhoto, setSelectedPhoto] = useState(0);

  useEffect(() => {
    fetchPersonDetails();
  }, [id]);

  const fetchPersonDetails = async () => {
    try {
      const response = await missingPersonsAPI.getById(id);
      setPerson(response.data);
    } catch (error) {
      console.error('Error fetching person details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this missing person entry?')) {
      try {
        await missingPersonsAPI.delete(id);
        navigate('/');
      } catch (error) {
        alert('Failed to delete entry');
      }
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown';
    return new Date(dateString).toLocaleString();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!person) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 text-center">
        <p className="text-gray-600">Person not found</p>
      </div>
    );
  }

  const canEdit = user && user.id === person.reporter?.id;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center space-x-2 text-primary-600 hover:text-primary-700 mb-6"
      >
        <ArrowLeft className="w-5 h-5" />
        <span>Back</span>
      </button>

      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="md:flex">
          <div className="md:w-1/2">
            {person.photos.length > 0 ? (
              <div>
                <img
                  src={`http://localhost:5000${person.photos[selectedPhoto].url}`}
                  alt={person.full_name}
                  className="w-full h-96 object-cover"
                />
                {person.photos.length > 1 && (
                  <div className="flex space-x-2 p-4 bg-gray-50 overflow-x-auto">
                    {person.photos.map((photo, index) => (
                      <img
                        key={photo.id}
                        src={`http://localhost:5000${photo.url}`}
                        alt={`${person.full_name} ${index + 1}`}
                        onClick={() => setSelectedPhoto(index)}
                        className={`w-20 h-20 object-cover rounded cursor-pointer ${
                          selectedPhoto === index ? 'ring-2 ring-primary-600' : ''
                        }`}
                      />
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="w-full h-96 bg-gray-200 flex items-center justify-center">
                <User className="w-24 h-24 text-gray-400" />
              </div>
            )}
          </div>

          <div className="md:w-1/2 p-8">
            <div className="flex justify-between items-start mb-4">
              <h1 className="text-3xl font-bold text-gray-900">{person.full_name}</h1>
              {canEdit && (
                <button
                  onClick={handleDelete}
                  className="text-red-600 hover:text-red-700 p-2"
                  title="Delete"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              )}
            </div>

            <div className={`inline-block px-4 py-2 rounded-full text-sm font-medium mb-6 ${
              person.status === 'missing' ? 'bg-red-100 text-red-800' :
              person.status === 'found' ? 'bg-green-100 text-green-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              {person.status.toUpperCase()}
            </div>

            <div className="space-y-4">
              {person.age && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Physical Description</h3>
                  <p className="text-gray-900">
                    {person.age} years old • {person.gender}
                    {person.height && ` • ${person.height}`}
                    {person.weight && ` • ${person.weight}`}
                  </p>
                  {person.hair_color && <p className="text-gray-900">Hair: {person.hair_color}</p>}
                  {person.eye_color && <p className="text-gray-900">Eyes: {person.eye_color}</p>}
                </div>
              )}

              {person.last_seen_location && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500 flex items-center space-x-2 mb-1">
                    <MapPin className="w-4 h-4" />
                    <span>Last Seen Location</span>
                  </h3>
                  <p className="text-gray-900">{person.last_seen_location}</p>
                </div>
              )}

              {person.last_seen_date && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500 flex items-center space-x-2 mb-1">
                    <Calendar className="w-4 h-4" />
                    <span>Last Seen Date</span>
                  </h3>
                  <p className="text-gray-900">{formatDate(person.last_seen_date)}</p>
                </div>
              )}

              {person.description && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Additional Information</h3>
                  <p className="text-gray-900 whitespace-pre-wrap">{person.description}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {person.relatives && person.relatives.length > 0 && (
          <div className="border-t border-gray-200 p-8 bg-gray-50">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Contact Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {person.relatives.map((relative) => (
                <div key={relative.id} className="bg-white p-6 rounded-lg shadow">
                  <h3 className="font-semibold text-lg text-gray-900 mb-2">{relative.name}</h3>
                  {relative.relationship && (
                    <p className="text-sm text-gray-600 mb-3">{relative.relationship}</p>
                  )}
                  <div className="space-y-2 text-sm">
                    {relative.phone && (
                      <div className="flex items-center space-x-2 text-gray-700">
                        <Phone className="w-4 h-4" />
                        <a href={`tel:${relative.phone}`} className="hover:text-primary-600">
                          {relative.phone}
                        </a>
                      </div>
                    )}
                    {relative.email && (
                      <div className="flex items-center space-x-2 text-gray-700">
                        <Mail className="w-4 h-4" />
                        <a href={`mailto:${relative.email}`} className="hover:text-primary-600">
                          {relative.email}
                        </a>
                      </div>
                    )}
                    {relative.address && (
                      <div className="flex items-start space-x-2 text-gray-700">
                        <Home className="w-4 h-4 mt-0.5" />
                        <span>{relative.address}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="border-t border-gray-200 p-6 bg-white">
          <p className="text-sm text-gray-600">
            Reported by {person.reporter?.username} on {formatDate(person.created_at)}
          </p>
        </div>
      </div>
    </div>
  );
}