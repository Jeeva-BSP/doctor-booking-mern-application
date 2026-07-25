import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService, notificationService } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [unreadNotifications, setUnreadNotifications] = useState(0);

  const fetchUser = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }
    try {
      const res = await authService.getMe();
      if (res.data.success) {
        setUser(res.data.user);
        fetchNotificationsCount();
      } else {
        logout();
      }
    } catch (err) {
      console.error('Auth verify error:', err);
      logout();
    } finally {
      setLoading(false);
    }
  };

  const fetchNotificationsCount = async () => {
    try {
      const res = await notificationService.getNotifications();
      if (res.data.success) {
        setUnreadNotifications(res.data.unreadCount || 0);
      }
    } catch (e) {
      // Ignore background notification check errors
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const login = async (credentials) => {
    const res = await authService.login(credentials);
    if (res.data.success) {
      localStorage.setItem('token', res.data.token);
      setUser(res.data.user);
      fetchNotificationsCount();
    }
    return res.data;
  };

  const registerPatient = async (data) => {
    const res = await authService.registerPatient(data);
    if (res.data.success) {
      localStorage.setItem('token', res.data.token);
      setUser(res.data.user);
      fetchNotificationsCount();
    }
    return res.data;
  };

  const registerDoctor = async (data) => {
    const res = await authService.registerDoctor(data);
    if (res.data.success) {
      localStorage.setItem('token', res.data.token);
      setUser(res.data.user);
      fetchNotificationsCount();
    }
    return res.data;
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setUnreadNotifications(0);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        unreadNotifications,
        login,
        registerPatient,
        registerDoctor,
        logout,
        refreshUser: fetchUser,
        refreshNotifications: fetchNotificationsCount
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
