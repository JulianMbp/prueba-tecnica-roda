// API Configuration
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// API Endpoints
export const API_ENDPOINTS = {
  // Client endpoints
  CLIENTES: 'clientes',
  CREDITOS: 'creditos', 
  CRONOGRAMA: 'cronograma',
  PAGOS: 'pagos',
  REPARTIDOR: 'repartidor',
} as const;

// Helper function to build full URL
export const buildApiUrl = (endpoint: string): string => {
  return `${API_BASE_URL}/${endpoint}`;
};
