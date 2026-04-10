import { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [voter, setVoter] = useState(() => {
    try {
      const s = localStorage.getItem('voter');
      return s ? JSON.parse(s) : null;
    } catch { return null; }
  });

  const login = (voterData, token) => {
    localStorage.setItem('token', token);
    localStorage.setItem('voter', JSON.stringify(voterData));
    setVoter(voterData);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('voter');
    setVoter(null);
  };

  return (
    <AuthContext.Provider value={{ voter, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);