import React, { useEffect, useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  Menu,
  User,
  Settings,
  LogOut,
  LayoutDashboard,
  ChevronDown,
  Clover,
  Users,
  ScrollText,
  X,
} from "lucide-react";
import axios from "axios";
import Helpers from "../../Config/Helpers";
const navLinks = [
  {
    name: "Dashboard",
    icon: <LayoutDashboard size={20} />,
    path: "/admin/dashboard",
  },
  {
    name: "Plant Types",
    icon: <Clover size={20} />,
    path: "/admin/planttypes",
  },
  {
    name: "Questionnaires",
    icon: <ScrollText size={20} />,
    path: "/admin/questionnaires",
  },
  { name: "Users", icon: <Users size={20} />, path: "/admin/users" },
  { name: "Settings", icon: <Settings size={20} />, path: "/admin/settings" },
];

const AdminLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [isDropdownOpen, setDropdownOpen] = useState(false);
  const authUser = Helpers.getAuthUser();
  console.log("Auth User : ", authUser);
  const handleLogout = async () => {
    try {
      // Make the API call to logout
      const headers = Helpers.getAuthHeaders();
      console.log(headers);
      const response = await axios.post(
        `${Helpers.apiUrl}logout`,
        {},
        Helpers.getAuthHeaders()
      );

      if (response.status === 200) {
        Helpers.removeItem("token");
        Helpers.removeItem("user");
        Helpers.toast("success", "Logged Out Succesfully");
        navigate("/");
      }
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  useEffect(() => {
    const loginTimestamp = Helpers.getItem("loginTimestamp");
    if (loginTimestamp) {
      const currentTime = Date.now();
      const timeElapsed = currentTime - loginTimestamp; // Time in milliseconds
      const timeLimit = 120 * 60 * 1000; // 120 minutes in milliseconds
      if (timeElapsed > timeLimit) {
        Helpers.toast("error", "Session Expired! Log In Again Please");
        Helpers.removeItem("user");
        Helpers.removeItem("token");
        Helpers.removeItem("loginTimestamp"); // Clear the timestamp
        Helpers.refresh();
        navigate("/"); // Call the logout function if time limit exceeded
      }
    }
  }, [location]);

  return (
    <div className="flex">
      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-screen rounded w-64 border  border-gray-200 bg-white p-5 transform transition-transform ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-64"
        } sm:translate-x-0`}
      >
        {/* Close Button for Small Screens */}
        <button
          className="sm:hidden absolute top-4 right-4 text-gray-800 hover:text-gray-500"
          onClick={() => setSidebarOpen(false)}
        >
          <X size={24} />
        </button>

        <h2 className="text-gray-800 text-xl font-semibold mb-6">
          {authUser.user_type == "0" ? "Admin" : "Sub Admin"} Panel
        </h2>
        <ul className="space-y-3">
          {navLinks.map((link, index) => (
            <li key={index}>
              <NavLink
                to={link.path}
                className={`flex items-center space-x-3 p-2 rounded-md transition ${
                  location.pathname === link.path
                    ? "bg-gray-200 text-gray-800"
                    : "text-gray-800 hover:bg-gray-300"
                }`}
              >
                {link.icon}
                <span>{link.name}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </aside>

      {/* Main Content */}
      <div className="flex-1 sm:ml-64">
        {/* Navbar */}
        <nav className="bg-white  p-4 flex justify-between items-center shadow-md">
          {/* Sidebar Toggle Button */}
          <button
            className="sm:hidden"
            onClick={() => setSidebarOpen(!isSidebarOpen)}
          >
            <Menu size={24} />
          </button>

          {/* Admin Title */}
          <h1 className="text-lg font-semibold text-gray-800 hidden sm:block">
            {authUser.user_type == "0" ? "Admin" : "Sub Admin"} Dashboard
          </h1>

          {/* Profile Dropdown */}
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!isDropdownOpen)}
              className="flex items-center space-x-2 bg-gray-100 px-3 py-1.5 rounded-md hover:bg-gray-200"
            >
              {/* <img
            src="https://flowbite.com/docs/images/people/profile-picture-5.jpg"
            alt="User "
            className="w-8 h-8 rounded-full"
          /> */}
              <span className="text-gray-800">{authUser.name}</span>
              <ChevronDown size={18} />
            </button>

            {/* Dropdown Menu */}
            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white shadow-md rounded-md">
                <ul className="py-2">
                  <li>
                    <NavLink
                      to="/admin/profile"
                      className="block px-4 py-2 hover:bg-gray-100"
                    >
                      <User size={16} className="inline-block mr-2" />
                      Profile
                    </NavLink>
                  </li>
                  <li>
                    <NavLink
                      to="/admin/settings"
                      className="block px-4 py-2 hover:bg-gray-100"
                    >
                      <Settings size={16} className="inline-block mr-2" />
                      Settings
                    </NavLink>
                  </li>
                  <li>
                    <NavLink
                      onClick={handleLogout}
                      className="block px-4 py-2 hover:bg-gray-100 text-red-500"
                    >
                      <LogOut size={16} className="inline-block mr-2" />
                      Logout
                    </NavLink>
                  </li>
                </ul>
              </div>
            )}
          </div>
        </nav>

        {/* Page Content */}
        <div className="p-6">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;
