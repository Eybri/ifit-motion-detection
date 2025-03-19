import { jwtDecode } from "jwt-decode";

// Store the token in localStorage
export const setToken = (token) => {
  localStorage.setItem("token", token);
};

// Retrieve the token from localStorage and check expiration
export const getToken = () => {
  const token = localStorage.getItem("token");
  if (!token) return null;

  try {
    const decoded = jwtDecode(token);
    const currentTime = Date.now() / 1000; // Convert to seconds
    if (decoded.exp < currentTime) {
      clearAuth();
      return null;
    }
    return token;
  } catch (error) {
    console.error("Invalid token:", error);
    clearAuth();
    return null;
  }
};

// Remove the token and user data from localStorage
export const clearAuth = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  sessionStorage.removeItem("user_id"); // Clear user_id from session storage
};

// Check if the user is authenticated
export const isAuthenticated = () => {
  const token = getToken();
  if (!token) return false;

  try {
    const decoded = jwtDecode(token);
    const currentTime = Date.now() / 1000; // Convert milliseconds to seconds
    if (decoded.exp < currentTime) {
      clearAuth();
      return false;
    }
    return true;
  } catch (error) {
    console.error("Invalid token:", error);
    clearAuth();
    return false;
  }
};

// Store user_id in session storage
export const setUserId = (userId) => {
  sessionStorage.setItem("user_id", userId);
};

// Retrieve user_id from session storage
export const getUserId = () => {
  return sessionStorage.getItem("user_id");
};

// Store user info in localStorage
export const setUserInfo = (userInfo) => {
  localStorage.setItem("user", JSON.stringify(userInfo));
};

// Retrieve user info from localStorage
export const getUserInfo = () => {
  const userInfo = localStorage.getItem("user");
  return userInfo ? JSON.parse(userInfo) : null;
};