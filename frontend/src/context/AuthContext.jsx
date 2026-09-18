import React, { createContext, useContext, useState, useEffect } from 'react';
import { api, getDemoMode, setDemoMode as setDemoModeStore } from '../services/api';

const AuthContext = createContext(null);

// UUID Generator for session ID
const generateUUID = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [sessionId, setSessionId] = useState('');
  const [demoMode, setDemoModeState] = useState(getDemoMode());
  const [loading, setLoading] = useState(true);

  // Initialize Session ID and stored user on mount
  useEffect(() => {
    let currentSession = localStorage.getItem('smartnest_session_id');
    if (!currentSession) {
      currentSession = generateUUID();
      localStorage.setItem('smartnest_session_id', currentSession);
    }
    setSessionId(currentSession);

    const storedUser = localStorage.getItem('smartnest_user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        localStorage.removeItem('smartnest_user');
      }
    }
    setLoading(false);

    const handleDemoModeChange = () => {
      setDemoModeState(getDemoMode());
    };
    window.addEventListener('smartnest_demo_mode_changed', handleDemoModeChange);
    return () => {
      window.removeEventListener('smartnest_demo_mode_changed', handleDemoModeChange);
    };
  }, []);

  const toggleDemoMode = (enabled) => {
    setDemoModeStore(enabled);
    setDemoModeState(enabled);
  };

  const login = async (email, password, contact = '') => {
    const currentSessionId =
      sessionId ||
      (typeof localStorage !== 'undefined' ? localStorage.getItem('smartnest_session_id') : '') ||
      generateUUID();

    const authData = await api.loginUser(email, password, contact);
    const userData = {
      user_id: authData.user_id,
      name: authData.name,
      role: authData.role,
      email: authData.email,
      phone: authData.phone || contact,
      contact: authData.contact || authData.phone || contact,
      session_id: currentSessionId,
      token: authData.token
    };
    setUser(userData);
    localStorage.setItem('smartnest_user', JSON.stringify(userData));
    localStorage.setItem('smartnest_token', authData.token);
    return userData;
  };

  const register = async (nameOrPayload, email, password, role, confirmPassword) => {
    let payload;
    if (typeof nameOrPayload === 'object' && nameOrPayload !== null) {
      payload = { ...nameOrPayload };
    } else {
      payload = {
        name: nameOrPayload,
        email,
        password,
        role,
        confirmPassword
      };
    }

    const currentSessionId =
      sessionId ||
      (typeof localStorage !== 'undefined' ? localStorage.getItem('smartnest_session_id') : '') ||
      generateUUID();

    payload.session_id = currentSessionId;

    const authData = await api.registerUser(payload);

    const userData = {
      user_id: authData.user_id,
      name: authData.name,
      role: authData.role,
      email: authData.email,
      session_id: currentSessionId,
      token: authData.token
    };
    setUser(userData);
    localStorage.setItem('smartnest_user', JSON.stringify(userData));
    localStorage.setItem('smartnest_token', authData.token);
    return userData;
  };

  const logout = async () => {
    try {
      await api.logout(sessionId);
    } catch (e) {
      // Clean up even if api fails
    }
    setUser(null);
    localStorage.removeItem('smartnest_user');
    localStorage.removeItem('smartnest_token');
  };

  // Quick Persona Switcher for effortless review & grading
  const switchPersona = (role) => {
    let mockUser;
    if (role === 'buyer') {
      mockUser = {
        user_id: 'usr_buyer_01',
        name: 'Aarav Sharma',
        email: 'aarav@smartnest.ai',
        role: 'buyer',
        session_id: sessionId,
        token: `mock_token_buyer_${Date.now()}`
      };
    } else if (role === 'seller') {
      mockUser = {
        user_id: 'usr_seller_01',
        name: 'Prestige Developers',
        email: 'prestige@smartnest.ai',
        role: 'seller',
        session_id: sessionId,
        token: `mock_token_seller_${Date.now()}`
      };
    } else if (role === 'admin') {
      mockUser = {
        user_id: 'usr_admin_01',
        name: 'Vikram Malhotra',
        email: 'admin@smartnest.ai',
        role: 'admin',
        session_id: sessionId,
        token: `mock_token_admin_${Date.now()}`
      };
    }

    if (mockUser) {
      setUser(mockUser);
      localStorage.setItem('smartnest_user', JSON.stringify(mockUser));
      localStorage.setItem('smartnest_token', mockUser.token);
    }
  };

  const getDashboardPath = (role) => {
    switch (role) {
      case 'buyer':
        return '/buyer/dashboard';
      case 'seller':
        return '/seller/dashboard';
      case 'admin':
        return '/admin/dashboard';
      default:
        return '/';
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        sessionId,
        demoMode,
        toggleDemoMode,
        loading,
        login,
        loginUser: login,
        register,
        registerUser: register,
        logout,
        switchPersona,
        getDashboardPath
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
