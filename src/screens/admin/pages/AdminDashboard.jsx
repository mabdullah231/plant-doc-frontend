import React, { useEffect, useState } from "react";
import axios from "axios";
import Helpers from "../../../Config/Helpers";
import Loader from "../../../Components/Common/Loader";

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch admin stats
  const fetchAdminStats = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${Helpers.apiUrl}admin/stats`, Helpers.getAuthHeaders());
      setStats(response.data);
    } catch (error) {
      console.error("Error fetching admin stats:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminStats();
  }, []);

  return (
    <div className="p-6 ">
      <h1 className="text-3xl font-bold text-center text-green-700 mb-6">🌿 Admin Dashboard</h1>

      {loading ? (
        <Loader />
      ) : (
        stats && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 justify-center">
            {/* User Count */}
            <div className="bg-white shadow-lg rounded-xl p-6 text-center">
              <h2 className="text-xl font-semibold text-gray-800">👤 Total Users</h2>
              <p className="text-3xl font-bold text-green-600 mt-2">{stats.total_users}</p>
            </div>

            {/* Plant Type Count */}
            <div className="bg-white shadow-lg rounded-xl p-6 text-center">
              <h2 className="text-xl font-semibold text-gray-800">🌱 Plant Types</h2>
              <p className="text-3xl font-bold text-green-600 mt-2">{stats.total_plant_types}</p>
            </div>

            {/* User Reports */}
            <div className="bg-white shadow-lg rounded-xl p-6 text-center">
              <h2 className="text-xl font-semibold text-gray-800">📄 User Reports</h2>
              <p className="text-3xl font-bold text-green-600 mt-2">{stats.total_user_reports}</p>
            </div>

            {/* Questions Grouped by Plant Type (Grid Boxes) */}
            <div className="col-span-1 md:col-span-2 lg:col-span-4 bg-white shadow-lg rounded-xl p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4 text-center">📊 Questions by Plant Type</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {stats.questions_by_plant_type.map((plant) => (
                  <div
                    key={plant.plant_type_id}
                    className="bg-green-100 p-4 rounded-lg text-center text-green-700 font-semibold shadow-md relative group"
                  >
                    {plant.plant_name}
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block bg-gray-800 text-white text-xs font-medium px-3 py-1 rounded-md shadow-lg">
                      {plant.total} Questions
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )
      )}
    </div>
  );
};

export default AdminDashboard;