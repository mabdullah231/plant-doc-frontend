import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Helpers from "../../Config/Helpers";
import axios from "axios";
const Register = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [agree, setAgree] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [showVerificationStep, setShowVerificationStep] = useState(false);
  const [userId, setUserId] = useState(null); // Store user ID after registration

  const navigate = useNavigate();

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  // Step 1: Handle Registration
  const handleRegister = async (e) => {
    e.preventDefault();

    // Check if passwords match
    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match.");
      return;
    }

    // Prepare data for API call
    const registrationData = {
      name: formData.name,
      email: formData.email,
      password: formData.password,
      password_confirmation: formData.confirmPassword,
      user_tpe: "2",
    };

    console.log("Registering user...", registrationData);
    const response = await axios.post(
      `${Helpers.apiUrl}auth/register`,
      registrationData
    );
    console.log(response);
    if (response.status === 200) {
      setUserId(response.data.user_id); // Store user ID for verification
      Helpers.toast("success", "Please Enter Verification Code");
      setShowVerificationStep(true); // Show verification step
    }
  };

  // Step 2: Handle Verification Code Submission
  const handleVerification = async (e) => {
    e.preventDefault();

    const verificationData = {
      code: verificationCode,
      user_id: userId,
    };

    try {
      const response = await axios.post(
        `${Helpers.apiUrl}auth/verify-email`,
        verificationData
      );
      if (response.status === 200) {
        // Assuming the response contains user object and token
        const { user, token } = response.data;

        // Save user and token in local storage
        Helpers.setItem("user", JSON.stringify(user)); // Save user data
        Helpers.setItem("token", token); // Save token

        Helpers.toast("success", "Registered Succesfully, Logging In");

        // Navigate based on user type
        const userType = user.user_type;
        if (parseInt(userType) === 0 || parseInt(userType) === 1) {
          navigate("/admin/dashboard"); // Admin dashboard
        } else if (parseInt(userType) === 2) {
          navigate("/user/dashboard"); // User dashboard
        } else {
          navigate("/"); // Default fallback
        }
      }
    } catch (error) {
      console.error("Verification error:", error);
      alert("Invalid verification code. Please try again.");
    }
  };

  return (
    <div className="w-full flex items-center justify-center p-8">
      <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-lg">
        {!showVerificationStep ? (
          // Step 1: Registration Form
          <>
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Register</h2>
            <form onSubmit={handleRegister}>
              <div className="mb-6">
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
                  placeholder="Enter your name"
                  required
                />
              </div>
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
                  value={formData.email}
                  onChange={handleChange}
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
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
                  placeholder="Enter your password"
                  required
                />
              </div>
              <div className="mb-6">
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Confirm Password
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
                  placeholder="Confirm your password"
                  required
                />
              </div>
              <div className="mb-6">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={agree}
                    onChange={(e) => setAgree(e.target.checked)}
                    className="mr-2"
                    required
                  />
                  <span className="text-sm text-gray-700">
                    I agree to the terms and conditions
                  </span>
                </label>
              </div>
              <button
                type="submit"
                className="w-full bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 focus:ring-2 focus:ring-gray-500 focus:outline-none transition duration-200"
              >
                Register
              </button>
            </form>
          </>
        ) : (
          // Step 2: Verification Code Form
          <>
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              Verify Your Email
            </h2>
            <p className="text-sm text-gray-600 mb-6">
              A verification code has been sent to your email. Please enter it
              below.
            </p>
            <form onSubmit={handleVerification}>
              <div className="mb-6">
                <label
                  htmlFor="verificationCode"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Verification Code
                </label>
                <input
                  type="text"
                  id="verificationCode"
                  name="verificationCode"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
                  placeholder="Enter verification code"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 focus:ring-2 focus:ring-gray-500 focus:outline-none transition duration-200"
              >
                Verify
              </button>
            </form>
          </>
        )}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Already have an account?{" "}
            <Link to="/" className="text-blue-600 hover:underline">
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
