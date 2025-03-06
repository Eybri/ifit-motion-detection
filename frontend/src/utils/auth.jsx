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

