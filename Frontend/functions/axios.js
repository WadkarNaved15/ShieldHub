const axios = require('axios').default;
const { getToken, saveToken } = require('./secureStorage'); 

// Create an Axios instance for API requests
const axiosInstance = axios.create({
  baseURL: process.env.BACKEND_URI, 
  // baseURL: 'http://192.168.32.234:3000',
  timeout: 10000, 
});

// Function to refresh access token using refresh token
const refreshAccessToken = async () => {
  try {
    const refreshToken = await getToken('refreshToken');

    if (!refreshToken) {
      console.warn('No refresh token found. Skipping token refresh.');
      return null; // Return null instead of throwing an error
    }

    // Make a call to the refresh token endpoint
    const response = await axiosInstance.post('/refresh-token', { refreshToken });

    const { newAccessToken, newRefreshToken } = response.data;

    // Save the new tokens
    await saveToken('accessToken', newAccessToken);
    await saveToken('refreshToken', newRefreshToken);

    return newAccessToken;
  } catch (error) {
    console.error('Failed to refresh access token:', error);
    return null; // Return null instead of throwing an error
  }
};

// API call function with parameters for URL, method, headers, and data
const apiCall = async ({ url, method = 'GET', headers = {}, data = {} }) => {
  try {
    console.log("Backend URL:", process.env.BACKEND_URI);

    const accessToken = await getToken('accessToken');
    // console.log("🔐 Sending access token:", accessToken);

    const authHeaders = accessToken
      ? { ...headers, Authorization: `Bearer ${accessToken}` }
      : headers;

    console.log(`📡 API Request -> ${method} ${url}`);
    console.log("Headers:", authHeaders);
    if (method !== 'GET') console.log("Payload:", data);

    const response = await axiosInstance({ url, method, headers: authHeaders, data });

    console.log("✅ API Response:", response.data);
    return response.data;
  } catch (error) {
    console.log("Error:", error);

    if (error.response && error.response.status === 401) {
      console.log('Token expired, attempting refresh...');

      const newAccessToken = await refreshAccessToken();
      if (!newAccessToken) {
        console.warn('No new access token obtained. User may need to log in.');
        return null; // Avoid retrying if refresh failed
      }

      // Retry the original request with the new token
      const retryHeaders = { ...headers, Authorization: `Bearer ${newAccessToken}` };
      const retryResponse = await axiosInstance({ url, method, headers: retryHeaders, data });

      return retryResponse.data;
    }

    console.error('API call failed:', error);
    // return null; // Return null instead of throwing an error
    throw error; // ✅ Let the caller handle the error

  }
};

module.exports = apiCall;
