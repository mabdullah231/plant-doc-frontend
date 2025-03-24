import React from "react";
import { Outlet } from "react-router-dom";

const Layout = () => {
  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gray-50">
      {/* Left Side - Dynamic Content */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-8">
        <Outlet /> {/* This will render the Login, Register, or ForgetPassword component */}
      </div>

      {/* Right Side - Plant Doc Description */}
      <div className="w-full md:w-1/2 bg-gray-800 flex items-center justify-center p-8">
        <div className="text-white max-w-md">
          <h1 className="text-4xl font-bold mb-4">Plant Doc</h1>
          <p className="text-lg mb-6">
            Plant Doc is your ultimate companion for managing and understanding
            various plant types. Whether you're a botanist, gardener, or plant
            enthusiast, Plant Doc provides you with the tools and knowledge to
            care for your plants effectively.
          </p>
          <ul className="space-y-2">
            <li className="flex items-center">
              <span className="mr-2">🌱</span>
              <span>Comprehensive plant database</span>
            </li>
            <li className="flex items-center">
              <span className="mr-2">📚</span>
              <span>Detailed care guides</span>
            </li>
            <li className="flex items-center">
              <span className="mr-2">🔍</span>
              <span>Advanced search and filtering</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Layout;