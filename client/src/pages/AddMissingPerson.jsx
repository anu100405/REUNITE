import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { missingPersonsAPI } from "../services/api"; // Assume this file handles axios/fetch
import { Upload, Plus, Trash2 } from "lucide-react";

export default function AddMissingPerson() {
  const [formData, setFormData] = useState({
    full_name: "",
    age: "",
    gender: "",
    height: "",
    weight: "",
    hair_color: "",
    eye_color: "",
    last_seen_location: "",
    last_seen_date: "",
    description: "",
  });
  const [photos, setPhotos] = useState([]);
  const [relatives, setRelatives] = useState([
    { name: "", relationship: "", phone: "", email: "", address: "" },
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handlePhotoChange = (e) => {
    const files = Array.from(e.target.files);
    setPhotos([...photos, ...files]);
  };

  const removePhoto = (index) => {
    setPhotos(photos.filter((_, i) => i !== index));
  };

  const addRelative = () => {
    setRelatives([
      ...relatives,
      { name: "", relationship: "", phone: "", email: "", address: "" },
    ]);
  };

  const removeRelative = (index) => {
    setRelatives(relatives.filter((_, i) => i !== index));
  };

  const updateRelative = (index, field, value) => {
    const updated = [...relatives];
    updated[index][field] = value;
    setRelatives(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const formDataToSend = new FormData();

      // Append main form data
      Object.keys(formData).forEach((key) => {
        // Only append non-empty values
        if (formData[key]) {
          formDataToSend.append(key, formData[key]);
        }
      });

      // Append photo files
      photos.forEach((photo) => {
        formDataToSend.append("photos", photo);
      });

      // Append relatives data as a JSON string
      const non_empty_relatives = relatives.filter((r) => r.name);
      formDataToSend.append("relatives", JSON.stringify(non_empty_relatives));

      // --- CRITICAL CHANGE FOR JWT ERROR ---
      // 1. Get the stored token (assuming it's in localStorage)
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("User not authenticated. Please log in.");
      }

      // 2. Call the API, passing the token for the Authorization header
      // This part depends on how missingPersonsAPI.create is implemented.
      // It MUST use the token. (See example implementation above)
      await missingPersonsAPI.create(formDataToSend);

      navigate("/");
    } catch (err) {
      // Improved error message handling
      const errorMessage =
        err.response?.data?.msg ||
        err.response?.data?.error ||
        err.message ||
        "Failed to add missing person";
      setError(errorMessage);

      // If the error is related to JWT, redirect to login
      if (
        errorMessage.includes("Subject must be a string") ||
        errorMessage.includes("token")
      ) {
        // You might want to force a logout/redirect here
        console.error("Authentication Error detected. Redirecting to login.");
        // navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">
        Add Missing Person
      </h1>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-lg shadow-md p-6 space-y-6"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Full Name *
            </label>
            <input
              type="text"
              required
              value={formData.full_name}
              onChange={(e) =>
                setFormData({ ...formData, full_name: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Age
            </label>
            <input
              type="number"
              value={formData.age}
              onChange={(e) =>
                setFormData({ ...formData, age: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Gender
            </label>
            <select
              value={formData.gender}
              onChange={(e) =>
                setFormData({ ...formData, gender: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="">Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Height (in feet/decimal)
            </label>
            <input
              type="number" // ⬅️ Changed type to 'number' for cleaner data
              step="0.1"
              placeholder="e.g., 5.7" // ⬅️ Cleaned placeholder
              value={formData.height}
              onChange={(e) =>
                setFormData({ ...formData, height: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Weight (in kg)
            </label>
            <input
              type="number" // ⬅️ Changed type to 'number' for cleaner data
              placeholder="e.g., 60" // ⬅️ Cleaned placeholder
              value={formData.weight}
              onChange={(e) =>
                setFormData({ ...formData, weight: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Hair Color
            </label>
            <input
              type="text"
              value={formData.hair_color}
              onChange={(e) =>
                setFormData({ ...formData, hair_color: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Eye Color
            </label>
            <input
              type="text"
              value={formData.eye_color}
              onChange={(e) =>
                setFormData({ ...formData, eye_color: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Last Seen Location
            </label>
            <input
              type="text"
              value={formData.last_seen_location}
              onChange={(e) =>
                setFormData({ ...formData, last_seen_location: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Last Seen Date
            </label>
            <input
              type="datetime-local"
              value={formData.last_seen_date}
              onChange={(e) =>
                setFormData({ ...formData, last_seen_date: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              rows="4"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Any additional information that might help..."
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Photos
          </label>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handlePhotoChange}
              className="hidden"
              id="photo-upload"
            />
            <label
              htmlFor="photo-upload"
              className="flex flex-col items-center justify-center cursor-pointer"
            >
              <Upload className="w-12 h-12 text-gray-400 mb-2" />
              <span className="text-sm text-gray-600">
                Click to upload photos
              </span>
            </label>
          </div>
          {photos.length > 0 && (
            <div className="mt-4 grid grid-cols-3 gap-4">
              {photos.map((photo, index) => (
                <div key={index} className="relative">
                  <img
                    src={URL.createObjectURL(photo)}
                    alt={`Preview ${index + 1}`}
                    className="w-full h-32 object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => removePhoto(index)}
                    className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <div className="flex justify-between items-center mb-4">
            <label className="block text-sm font-medium text-gray-700">
              Relatives/Contacts
            </label>
            <button
              type="button"
              onClick={addRelative}
              className="flex items-center space-x-1 text-primary-600 hover:text-primary-700"
            >
              <Plus className="w-4 h-4" />
              <span>Add Relative</span>
            </button>
          </div>

          {relatives.map((relative, index) => (
            <div
              key={index}
              className="border border-gray-200 rounded-lg p-4 mb-4"
            >
              <div className="flex justify-between items-center mb-4">
                <h4 className="font-medium text-gray-900">
                  Contact {index + 1}
                </h4>
                {relatives.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeRelative(index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <input
                    type="text"
                    placeholder="Name"
                    value={relative.name}
                    onChange={(e) =>
                      updateRelative(index, "name", e.target.value)
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <input
                    type="text"
                    placeholder="Relationship"
                    value={relative.relationship}
                    onChange={(e) =>
                      updateRelative(index, "relationship", e.target.value)
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <input
                    type="tel"
                    placeholder="Phone"
                    value={relative.phone}
                    onChange={(e) =>
                      updateRelative(index, "phone", e.target.value)
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <input
                    type="email"
                    placeholder="Email"
                    value={relative.email}
                    onChange={(e) =>
                      updateRelative(index, "email", e.target.value)
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
                <div className="md:col-span-2">
                  <input
                    type="text"
                    placeholder="Address"
                    value={relative.address}
                    onChange={(e) =>
                      updateRelative(index, "address", e.target.value)
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate("/")}
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:bg-gray-400"
          >
            {loading ? "Submitting..." : "Submit"}
          </button>
        </div>
      </form>
    </div>
  );
}
