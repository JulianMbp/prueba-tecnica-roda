'use client';

import { createContext, ReactNode, useContext, useEffect, useState } from 'react';

interface AuthContextType {
  isAuthenticated: boolean;
  clientInfo: ClientInfo | null;
  isLoading: boolean;
  login: (clientInfo: ClientInfo) => void;
  logout: () => void;
}

export interface ClientInfo {
  cliente_id: number;
  tipo_doc: string;
  num_doc: string;
  nombre: string;
  ciudad: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [clientInfo, setClientInfo] = useState<ClientInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Verificar si hay información guardada en localStorage
    const savedClientInfo = localStorage.getItem('roda_client_info');
    if (savedClientInfo) {
      try {
        const parsed = JSON.parse(savedClientInfo);
        setClientInfo(parsed);
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Error parsing saved client info:', error);
        localStorage.removeItem('roda_client_info');
      }
    }
    setIsLoading(false);
  }, []);

  const login = (clientInfo: ClientInfo) => {
    setClientInfo(clientInfo);
    setIsAuthenticated(true);
    localStorage.setItem('roda_client_info', JSON.stringify(clientInfo));
  };

  const logout = () => {
    setClientInfo(null);
    setIsAuthenticated(false);
    localStorage.removeItem('roda_client_info');
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, clientInfo, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
