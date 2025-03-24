import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import Helpers from "../../Config/Helpers"; // Adjust the path as needed

const Login = () => {
  // States for form inputs
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate(); // For redirection

  // Handle form submission
  const handleLogin = async (e) => {
    e.preventDefault();

    // Validate fields
    if (!email || !password) {
      Helpers.toast("error", "Email and Password are required.");
      return;
    }

    try {
      const response = await axios.post(`${Helpers.apiUrl}auth/login`, {
        email,
        password,
      });

      if (response.data.code === "EMAIL_NOT_VERIFIED") {
        Helpers.toast("error", "Verify your email before logging in.");
        return;
      }

      // Login successful
      Helpers.toast("success", "Login successful.");
      Helpers.setItem("token", response.data.token); // Save token
      Helpers.setItem("user", JSON.stringify(response.data.user)); // Save user data

      // Redirect based on user type
      const userType = response.data.user.user_type;
      if (parseInt(userType) === 0 || parseInt(userType) === 1) {
        navigate("/admin/dashboard"); // Admin dashboard
      } else if (parseInt(userType) === 2) {
        navigate("/user/dashboard"); // User dashboard
      } else {
        navigate("/"); // Default fallback
      }

      Helpers.scrollToTop(); // Scroll to top after navigation
    } catch (error) {
      let errorMessage = "Invalid credentials.";

      if (error.response) {
        errorMessage = error.response.data.message || errorMessage;
      } else if (error.request) {
        errorMessage = "No response from server. Please check your internet.";
      } else {
        errorMessage = error.message;
      }

      Helpers.toast("error", errorMessage); // Show error toast
    }
  };

  return (

      <div className="w-full  flex items-center justify-center p-8">
        <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Login</h2>
          <form onSubmit={handleLogin}>
            <div className="mb-6">
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
                placeholder="Enter your email"
                required
              />
            </div>
            <div className="mb-6">
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
                placeholder="Enter your password"
                required
              />
            </div>
            <div className="my-3 text-right">
              <p className="text-sm text-gray-600">
                Forgot Your{" "}
                <Link
                  to="/forget-password"
                  className="text-blue-600 hover:underline"
                >
                  Password?
                </Link>
              </p>
            </div>
            <button
              type="submit"
              className="w-full bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 focus:ring-2 focus:ring-gray-500 focus:outline-none transition duration-200"
            >
              Login
            </button>
          </form>
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Don't have an account?{" "}
              <Link to="/register" className="text-blue-600 hover:underline">
                Register
              </Link>
            </p>
          </div>
        </div>
      </div>

  );
};

export default Login;