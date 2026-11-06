import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  id: string;
  username: string;
  email: string;
  referralCode: string;
  status: string;
  createdAt?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAdmin: boolean;
  adminUser: any | null;
  adminToken: string | null;
  login: (token: string, userData: User) => void;
  adminLogin: (token: string, adminData: any) => void;
  logout: () => void;
  adminLogout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('veloop_token'));
  const [adminUser, setAdminUser] = useState<any | null>(null);
  const [adminToken, setAdminToken] = useState<string | null>(localStorage.getItem('veloop_admin_token'));
  const [isAdmin, setIsAdmin] = useState<boolean>(!!localStorage.getItem('veloop_admin_token'));
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function verifySession() {
      if (token) {
        try {
          const res = await fetch('/api/auth/me', {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (res.ok) {
            const data = await res.json();
            setUser(data.user);
          } else {
            localStorage.removeItem('veloop_token');
            setToken(null);
          }
        } catch (e) {
          console.error('Session verify error', e);
        }
      }
      setLoading(false);
    }
    verifySession();
  }, [token]);

  const login = (newToken: string, userData: User) => {
    localStorage.setItem('veloop_token', newToken);
    setToken(newToken);
    setUser(userData);
  };

  const adminLogin = (newToken: string, adminData: any) => {
    localStorage.setItem('veloop_admin_token', newToken);
    setAdminToken(newToken);
    setAdminUser(adminData);
    setIsAdmin(true);
  };

  const logout = () => {
    localStorage.removeItem('veloop_token');
    setToken(null);
    setUser(null);
  };

  const adminLogout = () => {
    localStorage.removeItem('veloop_admin_token');
    setAdminToken(null);
    setAdminUser(null);
    setIsAdmin(false);
  };

  return (
    <AuthContext.Provider value={{ user, token, isAdmin, adminUser, adminToken, login, adminLogin, logout, adminLogout, loading }}>
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
