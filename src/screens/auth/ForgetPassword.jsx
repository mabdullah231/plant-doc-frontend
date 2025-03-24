import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import Helpers from "../../Config/Helpers";

const ForgetPassword = () => {
  const [email, setEmail] = useState("");
  const [userId, setUserId] = useState(null);
  const [verificationCode, setVerificationCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [step, setStep] = useState(1); // Track the current step
  const navigate = useNavigate();

  // Step 1: Handle Email Submission
  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        `${Helpers.apiUrl}auth/forgot-password`,
        { email }
      );
      if (response.status === 200) {
        Helpers.toast("success", "Verification code sent to your email.");
        setStep(2); // Move to the next step
        setUserId(response.data.user_id)
      }
    } catch (error) {
      console.error("Error sending verification email:", error);
      alert("Failed to send verification email. Please try again.");
    }
  };

  // Step 2: Handle Verification Code Submission
  const handleVerificationSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        `${Helpers.apiUrl}auth/verify-forgot-email`,
        { user_id:userId, code: verificationCode }
      );
      if (response.status === 200) {
        Helpers.toast("success", "Verification code verified.");
        setUserId(response.data.user_id)
        setStep(3); // Move to the next step
      }
    } catch (error) {
      console.error("Verification error:", error);
      Helpers.toast("error","Something Wrong Happened")
    }
  };

  // Step 3: Handle New Password Submission
  const handleNewPasswordSubmit = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmNewPassword) {
      alert("Passwords do not match.");
      return;
    }
    try {
      const response = await axios.post(
        `${Helpers.apiUrl}auth/reset-password`,
        { user_id:userId, password: newPassword, password_confirmation: confirmNewPassword }
      );
      if (response.status === 200) {
        Helpers.toast("success", "Password reset successfully. You can now log in.");
        navigate('/login');
      }
    } catch (error) {
      console.error("Error resetting password:", error);
      alert("Failed to reset password. Please try again.");
    }
  };

  return (
    <div className="w-full flex items-center justify-center p-8">
      <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Forget Password</h2>
        {step === 1 && (
          <form onSubmit={handleEmailSubmit}>
            <div className="mb-6">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
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
            <button
              type="submit"
              className="w-full bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 focus:ring-2 focus:ring-gray-500 focus:outline-none transition duration-200"
            >
              Send Verification Code
            </button>
          </form>
        )}
        {step === 2 && (
          <form onSubmit={handleVerificationSubmit}>
            <div className="mb-6">
              <label htmlFor="verificationCode" className="block text-sm font-medium text-gray-700 mb-2">
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
              Verify Code
            </button>
          </form>
        )}
        {step === 3 && (
          <form onSubmit={handleNewPasswordSubmit}>
            <div className="mb-6">
              <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-2">
                New Password
              </label>
              <input
                type="password"
                id="newPassword"
                name="newPassword"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
                placeholder="Enter your new password"
                required
              />
            </div>
            <div className="mb-6">
              <label htmlFor="confirmNewPassword" className="block text-sm font-medium text-gray-700 mb-2">
                Confirm New Password
              </label>
              <input
                type="password"
                id="confirmNewPassword"
                name="confirmNewPassword"
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
                placeholder="Confirm your new password"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 focus:ring-2 focus:ring-gray-500 focus:outline-none transition duration-200"
            >
              Reset Password
            </button>
          </form>
        )}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Remember your password?{" "}
            <Link to="/" className="text-blue-600 hover:underline">
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgetPassword;