// frontend/src/config/api.js
// Create this file to centralize API configuration

/**
 * API Configuration
 * Automatically uses correct backend URL based on environment
 */

// Determine the correct API URL
const getApiUrl = () => {
  // Check if we're in development (localhost)
  if (
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1"
  ) {
    return "http://localhost:5000";
  }

  // Production - use your actual backend URL
  // YOUR BACKEND IS AT: https://lead-system-sb8k.onrender.com
  return "https://lead-system-sb8k.onrender.com";
};

export const API_URL = getApiUrl();

// API Endpoints
export const API_ENDPOINTS = {
  SUBMIT_LEAD: `${API_URL}/api/lead`,
  GET_LEADS: `${API_URL}/api/leads`,
  GET_LEAD: (id) => `${API_URL}/api/leads/${id}`,
  GET_STATS: `${API_URL}/api/leads/stats/summary`,
  HEALTH_CHECK: `${API_URL}/api/health`,
  TEST_DB: `${API_URL}/api/test-db`,
};

// Helper function for making API calls
export const apiCall = async (endpoint, options = {}) => {
  const defaultOptions = {
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(endpoint, defaultOptions);

    if (!response.ok) {
      const error = await response.json().catch(() => ({
        message: `HTTP error! status: ${response.status}`,
      }));
      throw new Error(error.message || "Request failed");
    }

    return await response.json();
  } catch (error) {
    console.error("API call failed:", error);
    throw error;
  }
};

// Log current configuration (useful for debugging)
console.log("🌐 API Configuration:", {
  environment:
    window.location.hostname === "localhost" ? "development" : "production",
  apiUrl: API_URL,
  frontend: window.location.origin,
});

export default {
  API_URL,
  API_ENDPOINTS,
  apiCall,
};
