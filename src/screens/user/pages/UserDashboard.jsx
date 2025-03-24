import React, { useEffect, useState } from "react";
import axios from "axios";
import Helpers from "../../../Config/Helpers";
import Loader from "../../../Components/Common/Loader";

const UserDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch user stats
  const fetchUserStats = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${Helpers.apiUrl}user/stats`, Helpers.getAuthHeaders());
      setStats(response.data);
    } catch (error) {
      console.error("Error fetching user stats:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserStats();
  }, []);

  return (
    <div className="p-6 min-h-screen">
      <h1 className="text-3xl font-bold text-center text-blue-700 mb-6">👤 User Dashboard</h1>

      {loading ? (
        <Loader />
      ) : (
        stats && (
          <div className="max-w-4xl mx-auto">
            {/* Total Reports */}
            <div className="bg-white shadow-lg rounded-xl p-6 text-center mb-6">
              <h2 className="text-xl font-semibold text-gray-800">📄 Total Reports</h2>
              <p className="text-3xl font-bold text-blue-600 mt-2">{stats.total_reports}</p>
            </div>

            {/* Recent Reports */}
            <div className="bg-white shadow-lg rounded-xl p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">📋 Recent Reports</h2>
              {stats.recent_reports.length > 0 ? (
                <ul className="space-y-4">
                  {stats.recent_reports.map((report) => (
                    <li key={report.id} className="bg-gray-50 p-4 rounded-lg shadow">
                      <p className="text-gray-700"><strong>Report ID:</strong> {report.id}</p>
                      <p className="text-gray-700"><strong>Created At:</strong> {new Date(report.created_at).toLocaleString()}</p>
                      <p className="text-gray-700"><strong>Details:</strong> {report.details || "No details provided"}</p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-600 text-center">No reports found.</p>
              )}
            </div>
          </div>
        )
      )}
    </div>
  );
};

export default UserDashboard;
