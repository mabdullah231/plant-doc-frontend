import React ,{useEffect, useState} from 'react'
import Helpers from '../../../Config/Helpers';
import Loader from '../../../Components/Common/Loader';
import axios from "axios";

const Settings = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  // Fetch user details to populate the form fields
  useEffect(() => {
    fetchUserDetails();
  }, []);

  const fetchUserDetails = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${Helpers.apiUrl}user/details`,
        Helpers.getAuthHeaders()
      );
      setName(response.data.user.name);
      setEmail(response.data.user.email);
      setError(null); // Reset error if fetching is successful
    } catch (err) {
      setError("Failed to fetch user details.");
    } finally {
      setLoading(false);
    }
  };

  // Handle form submission (update name, email, or password)
  const handleSubmit = async (e, field) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    let data = {};
    if (field === "name") {
      data.name = name;
    } else if (field === "email") {
      data.email = email;
    } else if (field === "password") {
      if (password !== passwordConfirmation) {
        setError("Passwords do not match.");
        setLoading(false);
        return;
      }
      data.password = password;
    }

    try {
      const response = await axios.put(
        `${Helpers.apiUrl}user/update`,
        data,
        Helpers.getAuthHeaders()
      );
      setSuccessMessage(response.data.message);
      setError(null);
    } catch (err) {
      setError("Failed to update user details.");
    } finally {
      setLoading(false);
    }
  };

    if (loading) {
      return <Loader />;
    }
  
    return (
      <div className="p-4">
        <h2 className="text-2xl font-medium mb-4">Update Your Details</h2>
  
        {successMessage && (
          <div className="p-4 text-green-600 bg-green-100">{successMessage}</div>
        )}
        {error && <div className="p-4 text-red-600 bg-red-100">{error}</div>}
  
        <form onSubmit={(e) => handleSubmit(e, "name")} className="mb-4">
          <label className="block mb-2">Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="border border-gray-300 p-2 w-full rounded"
            required
          />
          <button type="submit" className="bg-green-500 rounded transition duration-75 hover:bg-green-600 cursor-pointer text-white p-2 mt-2">
            Update Name
          </button>
        </form>
  
        <form onSubmit={(e) => handleSubmit(e, "email")} className="mb-4">
          <label className="block mb-2">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="border border-gray-300 p-2 w-full rounded"
            required
          />
          <button type="submit" className="bg-green-500 rounded transition duration-75 hover:bg-green-600 cursor-pointer text-white p-2 mt-2">
            Update Email
          </button>
        </form>
  
        <form onSubmit={(e) => handleSubmit(e, "password")} className="mb-4">
          <label className="block mb-2">New Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="border border-gray-300 p-2 w-full rounded"
            required
          />
          <label className="block mb-2 mt-2">Confirm New Password</label>
          <input
            type="password"
            value={passwordConfirmation}
            onChange={(e) => setPasswordConfirmation(e.target.value)}
            className="border border-gray-300 p-2 w-full rounded"
            required
          />
          <button type="submit" className="bg-green-500 rounded transition duration-75 hover:bg-green-600 cursor-pointer text-white p-2 mt-2">
            Update Password
          </button>
        </form>
      </div>
    );
  };

export default Settings