import {jwtDecode} from "jwt-decode";

// Store the token in localStorage
export const setToken = (token) => {
  localStorage.setItem("token", token);
};

// Retrieve the token from localStorage
export const getToken = () => {
  return localStorage.getItem("token");
};

// Remove the token and user data from localStorage
export const clearAuth = () => {
  localStorage.removeItem("token");
};

// Check if the user is authenticated
export const isAuthenticated = () => {
  const token = getToken();
  return !!token; // Returns true if token exists
};

// Retrieve the current user ID from the token
export const getUserId = () => {
    const token = getToken();
    if (token) {
      try {
        const decoded = jwtDecode(token);
        return decoded.user_id || null; // Use the key from your token payload
      } catch (error) {
        console.error("Error decoding token:", error);
        // Fall back to the user object in localStorage
        const user = JSON.parse(localStorage.getItem('user'));
        return user?.id || null;
      }
    }
    return null;
  };
  
  
  
  
