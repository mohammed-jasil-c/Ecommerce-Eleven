// src/pages/Unauthorized.js
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Unauthorized = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full text-center">
        {/* Icon */}
        <div className="mb-8">
          <div className="mx-auto flex items-center justify-center h-24 w-24 rounded-full bg-red-100">
            <span className="text-4xl">🚫</span>
          </div>
        </div>

        {/* Message */}
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Access Denied
        </h1>
        
        <p className="text-lg text-gray-600 mb-2">
          You don't have permission to access this page.
        </p>
        
        <p className="text-gray-500 mb-8">
          This area is restricted to administrators only. If you believe this is an error, 
          please contact your system administrator.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => navigate(-1)}
            className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
          >
            ← Go Back
          </button>
          
          <Link
            to="/"
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Go to Homepage
          </Link>
          
          <Link
            to="/login"
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
          >
            Sign in as Admin
          </Link>
        </div>

        {/* Additional Help */}
        <div className="mt-8 p-4 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-700">
            <strong>Need help?</strong> Contact support at{" "}
            <a href="mailto:support@yourapp.com" className="underline">
              support@yourapp.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Unauthorized;