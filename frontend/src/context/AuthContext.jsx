import React, { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

const API_URL = 'http://localhost:5000/api';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  useEffect(() => {
    if (token) {
      loadUser(token);
    } else {
      setLoading(false);
    }
  }, [token]);

  const loadUser = async (authToken) => {
    try {
      const response = await fetch(`${API_URL}/auth/me`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${authToken}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setUser(data.user);
      } else {
        // Token invalid or expired
        logoutUser();
      }
    } catch (err) {
      console.error('Error loading user:', err);
      logoutUser();
    } finally {
      setLoading(false);
    }
  };

  const registerUser = async (name, email, password) => {
    setAuthError(null);
    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
      });
      const data = await response.json();
      if (!data.success) {
        throw new Error(data.error || 'Registration failed');
      }
      return data;
    } catch (err) {
      setAuthError(err.message);
      throw err;
    }
  };

  const verifyEmailToken = async (verifyToken) => {
    setAuthError(null);
    try {
      const response = await fetch(`${API_URL}/auth/verify-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: verifyToken })
      });
      const data = await response.json();
      if (!data.success) {
        throw new Error(data.error || 'Email verification failed');
      }
      return data;
    } catch (err) {
      setAuthError(err.message);
      throw err;
    }
  };

  const loginUser = async (email, password) => {
    setAuthError(null);
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await response.json();
      if (!data.success) {
        if (data.isNotVerified) {
          throw new Error('NOT_VERIFIED');
        }
        throw new Error(data.error || 'Login failed');
      }
      
      localStorage.setItem('token', data.token);
      setToken(data.token);
      setUser(data.user);
      return data;
    } catch (err) {
      setAuthError(err.message);
      throw err;
    }
  };

  const logoutUser = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  const requestForgotPassword = async (email) => {
    setAuthError(null);
    try {
      const response = await fetch(`${API_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await response.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to request password reset');
      }
      return data;
    } catch (err) {
      setAuthError(err.message);
      throw err;
    }
  };

  const submitResetPassword = async (resetToken, password) => {
    setAuthError(null);
    try {
      const response = await fetch(`${API_URL}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: resetToken, password })
      });
      const data = await response.json();
      if (!data.success) {
        throw new Error(data.error || 'Password reset failed');
      }
      return data;
    } catch (err) {
      setAuthError(err.message);
      throw err;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        authError,
        registerUser,
        verifyEmailToken,
        loginUser,
        logoutUser,
        requestForgotPassword,
        submitResetPassword,
        loadUser: () => loadUser(token) // Expose refresh function
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
