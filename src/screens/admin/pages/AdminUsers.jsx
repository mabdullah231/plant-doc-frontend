import React, { useState, useEffect } from "react";
import axios from "axios";
import Helpers from "../../../Config/Helpers";
import Loader from "../../../Components/Common/Loader";

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState(null);
  const authUser = Helpers.getAuthUser(); // Get the authenticated user
  

  // Fetch all users when component mounts
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${Helpers.apiUrl}admin/userdata/get-all`,
        Helpers.getAuthHeaders()
      );
      setUsers(response.data || []);
      setError(null);
    } catch (error) {
      console.error("Error fetching users:", error);
      setError("Failed to load users. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  // Toggle user status (active/inactive)
  const handleToggleStatus = async (userId) => {
    try {
      const response = await axios.put(
        `${Helpers.apiUrl}admin/userdata/toggle-status/${userId}`,
        {},
        Helpers.getAuthHeaders()
      );
      
      if (response.status === 200) {
        // Update the local state with the new status
        const updatedUsers = users.map((user) =>
          user.id === userId ? { ...user, is_active: !user.is_active } : user
        );
        setUsers(updatedUsers);
        Helpers.toast("success", `User status updated successfully`);
      }
    } catch (error) {
      console.error("Error toggling user status:", error);
      Helpers.toast("error", "Failed to update user status");
    }
  };

  // Make user a subadmin
  const handleMakeSubadmin = async (userId) => {
    try {
      const response = await axios.put(
        `${Helpers.apiUrl}admin/userdata/make-subadmin/${userId}`,
        {},
        Helpers.getAuthHeaders()
      );
      
      if (response.status === 200) {
        // Update the local state 
        const updatedUsers = users.map((user) =>
          user.id === userId ? { ...user, user_type: "1" } : user
        );
        setUsers(updatedUsers);
        Helpers.toast("success", "User has been made a subadmin");
      }
    } catch (error) {
      console.error("Error making user subadmin:", error);
      Helpers.toast("error", "Failed to update user role");
    }
  };

  // Show delete confirmation
  const showToggleConfirmation = (userId) => {
    setDeleteConfirmation(userId);
  };

  // Hide delete confirmation
  const hideToggleConfirmation = () => {
    setDeleteConfirmation(null);
  };

  // Helper function to format date
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Helper function to determine user role label
  const getUserRoleLabel = (userType) => {
    switch (parseInt(userType)) {
      case 2:
        return { text: "User", className: "text-blue-600" };
      case 1:
        return { text: "Sub Admin", className: "text-yellow-600" };
      case 0:
        return { text: "Admin", className: "text-green-600" };
      default:
        return { text: "Unknown", className: "text-gray-600" };
    }
  };

  if (loading) {
    return <Loader/>;
  }

  if (error) {
    return <div className="p-4 text-red-500">{error}</div>;
  }

  return (
    <div className="p-4">
      <h2 className="text-2xl font-medium mb-4">Manage Users</h2>

      <div className="overflow-x-auto shadow-md sm:rounded-lg">
        <table className="w-full text-sm text-left text-gray-500">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3">
                Name
              </th>
              <th scope="col" className="px-6 py-3">
                Email
              </th>
              <th scope="col" className="px-6 py-3">
                Registered
              </th>
              <th scope="col" className="px-6 py-3">
                Role
              </th>
              <th scope="col" className="px-6 py-3">
                Status
              </th>
              <th scope="col" className="px-6 py-3">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => {
              const roleInfo = getUserRoleLabel(user.user_type);
              return (
                <tr key={user.id} className="bg-white border-b hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-gray-900">
                    {user.name}
                  </td>
                  <td className="px-6 py-4">{user.email}</td>
                  <td className="px-6 py-4">{formatDate(user.created_at)}</td>
                  <td className="px-6 py-4">
                    <span className={roleInfo.className}>{roleInfo.text}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={user.is_active ? "text-green-600" : "text-red-600"}>
                      {user.is_active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {deleteConfirmation === user.id ? (
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => {
                            handleToggleStatus(user.id);
                            hideToggleConfirmation();
                          }}
                          className="text-white bg-yellow-600 hover:bg-yellow-700 px-2 py-1 rounded text-xs"
                        >
                          Confirm {user.is_active ? "Deactivate" : "Activate"}
                        </button>
                        <button
                          onClick={hideToggleConfirmation}
                          className="text-gray-600 hover:text-gray-800 px-2 py-1 rounded text-xs"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <>
                        {parseInt(user.user_type) === 2 && authUser.user_type == "0" && (
                          <button
                            onClick={() => handleMakeSubadmin(user.id)}
                            className="text-blue-600 hover:underline mr-2"
                          >
                            Make Sub Admin
                          </button>
                        )}
                        <button
                          onClick={() => showToggleConfirmation(user.id)}
                          className={user.is_active ? "text-red-600 hover:underline" : "text-green-600 hover:underline"}
                        >
                          {user.is_active ? "Deactivate" : "Activate"}
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminUsers;