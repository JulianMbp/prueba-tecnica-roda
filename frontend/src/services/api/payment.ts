import { API_ENDPOINTS, buildApiUrl } from '@/config/api';

export interface Payment {
  pago_id: number;
  schedule: number;
  credito?: number;
  fecha_pago: string;
  monto: string;
  medio: string;
  cuota_info?: {
    num_cuota: number;
    fecha_vencimiento: string;
    valor_cuota: number;
    estado: string;
    producto: string;
  };
  credito_info?: {
    credito_id: number;
    producto: string;
    cliente_id: number;
  };
}

export interface PaymentSummary {
  total_pagos: number;
  monto_total_pagado: number;
  pagos_por_medio: Record<string, {
    cantidad: number;
    monto_total: number;
  }>;
  ultimo_pago: {
    fecha: string;
    monto: number;
    medio: string;
    cuota: number;
  };
}

export interface PaymentFilters {
  fecha_desde?: string;
  fecha_hasta?: string;
  medio?: string;
  estado?: string;
  page?: number;
  page_size?: number;
  ordenar_por?: string;
  orden?: string;
  all?: boolean;
}

class PaymentService {
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

  // Obtener pagos del cliente
  async getClientPayments(clientId: number, filters?: PaymentFilters): Promise<{
    count?: number;
    next?: string | null;
    previous?: string | null;
    total_pages?: number;
    current_page?: number;
    page_size?: number;
    results: Payment[];
  }> {
    const params = new URLSearchParams();
    
    // Parámetro principal para filtrar por cliente
    params.append('cliente_id', clientId.toString());
    
    if (filters?.fecha_desde) params.append('fecha_desde', filters.fecha_desde);
    if (filters?.fecha_hasta) params.append('fecha_hasta', filters.fecha_hasta);
    if (filters?.medio) params.append('medio', filters.medio);
    if (filters?.estado) params.append('estado', filters.estado);
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.page_size) params.append('page_size', filters.page_size.toString());
    if (filters?.all) params.append('all', 'true');

    const queryString = params.toString();
    const endpoint = `${API_ENDPOINTS.PAGOS}/?${queryString}`;
    
    // Si se solicitan todos los resultados, el backend retorna directamente el array
    if (filters?.all) {
      const results = await this.request<Payment[]>(endpoint);
      return { results };
    }
    
    return this.request<{
      count: number;
      next: string | null;
      previous: string | null;
      total_pages: number;
      current_page: number;
      page_size: number;
      results: Payment[];
    }>(endpoint);
  }

  // Obtener resumen de pagos del cliente
  async getPaymentSummary(clientId: number): Promise<PaymentSummary> {
    return this.request<PaymentSummary>(`${API_ENDPOINTS.PAGOS}/resumen_por_cliente/?cliente_id=${clientId}`);
  }

  // Obtener pagos por crédito
  async getCreditPayments(creditId: number): Promise<Payment[]> {
    return this.request<Payment[]>(`${API_ENDPOINTS.PAGOS}/?credito=${creditId}`);
  }

  // Obtener pago específico
  async getPayment(paymentId: number): Promise<Payment> {
    return this.request<Payment>(`${API_ENDPOINTS.PAGOS}/${paymentId}/`);
  }

  // Crear nuevo pago (para futuras funcionalidades)
  async createPayment(paymentData: Partial<Payment>): Promise<Payment> {
    return this.request<Payment>(`${API_ENDPOINTS.PAGOS}/`, {
      method: 'POST',
      body: JSON.stringify(paymentData),
    });
  }

  // Obtener métodos de pago disponibles
  async getPaymentMethods(): Promise<string[]> {
    return this.request<string[]>(`${API_ENDPOINTS.PAGOS}/metodos/`);
  }
}

export const paymentService = new PaymentService();
