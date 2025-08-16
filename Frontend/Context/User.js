const React = require('react');
const { createContext, useState, useEffect } = require('react');
const axios = require('axios').default;
const { getToken, saveToken, deleteToken } = require('../functions/secureStorage');
const { decodeToken } = require('../functions/token'); 
const { Alert} = require('react-native');
const {navigate} = require('../services/navigationService');

const UserContext = createContext();

const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true); 


  // ✅ Load User
const loadUser = async () => {
  try {
    setLoading(true);

    const accessToken = await getToken('accessToken');
    const refreshToken = await getToken('refreshToken');

    console.log("Refresh Token:", refreshToken);

    const isTokenExpired = (token) => {
      try {
        const decoded = decodeToken(token);
        if (!decoded || !decoded.exp) return true;
        const currentTime = Date.now() / 1000;
        return decoded.exp < currentTime;
      } catch (err) {
        return true;
      }
    };

    // ✅ Try access token
    if (accessToken) {
      try {
        if (!isTokenExpired(accessToken)) {
          const decoded = decodeToken(accessToken);
          setUser(decoded);
          setIsAuthenticated(true);
          return;
        } else {
          console.log("Access token is expired, trying refresh token...");
        }
      } catch (err) {
        console.log("Access token decoding failed, trying refresh token...");
      }
    }

    // 🔁 Fallback to refresh token
    if (refreshToken && !isTokenExpired(refreshToken)) {
      try {
        const response = await axios.post(`${process.env.BACKEND_URI}/refresh-token`, { refreshToken });
        const newAccessToken = response.data.accessToken;
        const newRefreshToken = response.data.refreshToken;

        if (newAccessToken && newRefreshToken) {
          await saveToken('accessToken', newAccessToken);
          await saveToken('refreshToken', newRefreshToken);
          const decoded = decodeToken(newAccessToken);
          if (decoded) {
            setUser(decoded);
            setIsAuthenticated(true);
            return;
          }
        } else {
          throw new Error("Incomplete token response");
        }
      } catch (error) {
        console.error("🔄 Token refresh failed:", error?.response?.data || error.message);
        Alert.alert("Session expired", "Please log in again.");
      }
    } else {
      console.log("Refresh token is invalid or expired.");
    }

    // ❌ If both failed
    await logout();

  } catch (error) {
    console.error("🚫 Error loading user:", error);
    await logout();
  } finally {
    setLoading(false);
  }
};


  // ✅ Logout
  const logout = async () => {
       navigate("Login")
    await deleteToken('accessToken');
    await deleteToken('refreshToken');
    setUser(null);
    setIsAuthenticated(false);
    setLocation(null);
    console.log("User logged out");
 
  };

  // ✅ Login Function
  const login = async (accessToken, refreshToken) => {
    try {
      await saveToken('accessToken', accessToken);
      await saveToken('refreshToken', refreshToken);
      const decoded = decodeToken(accessToken);
      if (decoded) {
        setUser(decoded);
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.error("Login Error:", error);
    }
  };

  // ✅ Initial Effect: Load user
  useEffect(() => {
    loadUser();
  }, []);

  return (
    <UserContext.Provider value={{
      user,
      isAuthenticated,
      loading,
      login,
      logout,
      loadUser,
    }}>
      {children}
    </UserContext.Provider>
  );
};

module.exports = { UserContext, UserProvider };
