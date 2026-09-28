import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService, User } from '../services/auth.service.js';
import i18n from '../i18n/i18n.js';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (emailOrUser: string, pass: string) => Promise<void>;
  register: (email: string, username: string, name: string, pass: string) => Promise<void>;
  logout: () => void;
  updateUserProfile: (data: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => authService.getCurrentUser());
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('hbd_token');
      if (token) {
        try {
          const res = await authService.getMe();
          if (res.data) {
            setUser(res.data);
            if (res.data.language) {
              i18n.changeLanguage(res.data.language);
            }
          }
        } catch {
          authService.logout();
          setUser(null);
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (emailOrUser: string, pass: string) => {
    const res = await authService.login(emailOrUser, pass);
    if (res.data?.user) {
      setUser(res.data.user);
      if (res.data.user.language) {
        i18n.changeLanguage(res.data.user.language);
      }
    }
  };

  const register = async (email: string, username: string, name: string, pass: string) => {
    const res = await authService.register(email, username, name, pass);
    if (res.data?.user) {
      setUser(res.data.user);
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  const updateUserProfile = async (data: Partial<User>) => {
    const res = await authService.updateProfile(data);
    if (res.data) {
      setUser(res.data);
      if (res.data.language) {
        i18n.changeLanguage(res.data.language);
      }
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        updateUserProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
