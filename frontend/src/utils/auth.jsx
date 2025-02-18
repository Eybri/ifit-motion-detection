// auth.js

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
    localStorage.removeItem("user");
};

// Check if the user is authenticated
export const isAuthenticated = () => {
    const token = getToken();
    return !!token; // Returns true if token exists
};
