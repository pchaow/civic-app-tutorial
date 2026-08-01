import React, { createContext, useContext, useState, useEffect } from 'react';
import type { UserProfile, UserRole } from '../types';
import { MOCK_USERS } from '../services/mockData';
import { signInWithGoogle, logoutGoogle } from '../services/authService';

interface AuthContextType {
  currentUser: UserProfile | null;
  loginWithGoogle: () => Promise<void>;
  switchRole: (role: UserRole) => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem('civicsolve_user');
    if (saved) {
      try { return JSON.parse(saved); } catch {}
    }
    return MOCK_USERS[0];
  });

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('civicsolve_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('civicsolve_user');
    }
  }, [currentUser]);

  const loginWithGoogle = async () => {
    const profile = await signInWithGoogle();
    setCurrentUser(profile);
  };

  const switchRole = (role: UserRole) => {
    const found = MOCK_USERS.find(u => u.role === role) || MOCK_USERS[0];
    setCurrentUser(found);
  };

  const logout = async () => {
    await logoutGoogle();
    setCurrentUser(null);
  };

  return (
    <AuthContext.Provider value={{ currentUser, loginWithGoogle, switchRole, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
