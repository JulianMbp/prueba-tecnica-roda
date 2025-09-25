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
  // Normalizar base (sin slash final)
  const normalizedBase = API_BASE_URL.replace(/\/+$/, '');
  // Asegurar que la base incluya "/api" exactamente una vez
  const baseWithApi = normalizedBase.endsWith('/api')
    ? normalizedBase
    : `${normalizedBase}/api`;
  // Normalizar endpoint (sin slash inicial)
  const normalizedEndpoint = endpoint.replace(/^\/+/, '');
  return `${baseWithApi}/${normalizedEndpoint}`;
};
