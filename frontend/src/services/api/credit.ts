import { API_ENDPOINTS, buildApiUrl } from '@/config/api';

export interface Credit {
  credito_id: number;
  cliente: number;
  client_name: string;
  producto: string;
  inversion: string;
  cuotas_totales: number;
  tea: string;
  fecha_desembolso: string;
  fecha_inicio_pago: string;
  estado: 'vigente' | 'cancelado' | 'castigado';
  resumen?: {
    cuotas_pagadas: number;
    cuotas_pendientes: number;
    cuotas_vencidas?: number;
    cuotas_restantes?: number;
    monto_pagado: number;
    monto_pendiente: number;
    porcentaje_pagado: number;
    pagos_asociados?: number;
    ultima_fecha_pago?: string | null;
  };
}

export interface CreditSummary {
  total_creditos: number;
  creditos_vigentes: number;
  creditos_cancelados: number;
  creditos_castigados: number;
  inversion_total: number;
  inversion_vigente: number;
  monto_pagado_total: number;
  monto_pendiente_total: number;
}

export interface CreditFilters {
  estado?: string;
  producto?: string;
  fecha_desde?: string;
  fecha_hasta?: string;
  ordenar_por?: 'fecha' | 'inversion' | 'estado' | 'producto';
  orden?: 'asc' | 'desc';
  page?: number;
  page_size?: number;
}

class CreditService {
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = buildApiUrl(endpoint);
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  // Obtener créditos del cliente
  async getClientCredits(clientId: number, filters?: CreditFilters): Promise<{
    count: number;
    next: string | null;
    previous: string | null;
    results: Credit[];
  }> {
    const params = new URLSearchParams();
    
    // Parámetro principal para filtrar por cliente
    params.append('cliente_id', clientId.toString());
    
    if (filters?.estado) params.append('estado', filters.estado);
    if (filters?.producto) params.append('producto', filters.producto);
    if (filters?.fecha_desde) params.append('fecha_desde', filters.fecha_desde);
    if (filters?.fecha_hasta) params.append('fecha_hasta', filters.fecha_hasta);
    if (filters?.ordenar_por) params.append('ordenar_por', filters.ordenar_por);
    if (filters?.orden) params.append('orden', filters.orden);
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.page_size) params.append('page_size', filters.page_size.toString());

    const queryString = params.toString();
    const endpoint = `${API_ENDPOINTS.CREDITOS}/?${queryString}`;
    
    return this.request<{
      count: number;
      next: string | null;
      previous: string | null;
      results: Credit[];
    }>(endpoint);
  }

  // Obtener resumen de créditos del cliente
  async getCreditSummary(clientId: number): Promise<CreditSummary> {
    return this.request<CreditSummary>(`${API_ENDPOINTS.CREDITOS}/resumen/?cliente_id=${clientId}`);
  }

  // Obtener todos los créditos (para administración)
  async getAllCredits(filters?: CreditFilters): Promise<Credit[]> {
    const params = new URLSearchParams();
    
    if (filters?.estado) params.append('estado', filters.estado);
    if (filters?.producto) params.append('producto', filters.producto);
    if (filters?.fecha_desde) params.append('fecha_desde', filters.fecha_desde);
    if (filters?.fecha_hasta) params.append('fecha_hasta', filters.fecha_hasta);
    if (filters?.ordenar_por) params.append('ordenar_por', filters.ordenar_por);
    if (filters?.orden) params.append('orden', filters.orden);

    const queryString = params.toString();
    const endpoint = `${API_ENDPOINTS.CREDITOS}/${queryString ? `?${queryString}` : ''}`;
    
    return this.request<Credit[]>(endpoint);
  }

  // Obtener crédito específico
  async getCredit(creditId: number): Promise<Credit> {
    return this.request<Credit>(`${API_ENDPOINTS.CREDITOS}/${creditId}/`);
  }

  // Obtener créditos por estado
  async getCreditsByStatus(status: string): Promise<Credit[]> {
    return this.request<Credit[]>(`${API_ENDPOINTS.CREDITOS}/?estado=${status}`);
  }

  // Obtener créditos por producto
  async getCreditsByProduct(product: string): Promise<Credit[]> {
    return this.request<Credit[]>(`${API_ENDPOINTS.CREDITOS}/?producto=${product}`);
  }

  // Obtener estadísticas de créditos
  async getCreditStats(): Promise<{
    total_creditos: number;
    creditos_por_estado: Record<string, number>;
    creditos_por_producto: Record<string, number>;
    inversion_por_producto: Record<string, number>;
  }> {
    return this.request(`${API_ENDPOINTS.CREDITOS}/estadisticas/`);
  }

  // Obtener productos disponibles
  async getAvailableProducts(): Promise<string[]> {
    return this.request<string[]>(`${API_ENDPOINTS.CREDITOS}/productos/`);
  }

  // Obtener estados disponibles
  async getAvailableStatuses(): Promise<string[]> {
    return this.request<string[]>(`${API_ENDPOINTS.CREDITOS}/estados/`);
  }
}

export const creditService = new CreditService();
