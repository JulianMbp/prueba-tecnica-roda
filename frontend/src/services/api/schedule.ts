import { API_ENDPOINTS, buildApiUrl } from "@/config/api";

export interface PaymentSchedule {
  schedule_id: number;
  credito: number;
  credit_info: {
    credito_id: number;
    cliente: number;
    client_name: string;
    producto: string;
    inversion: string;
    cuotas_totales: number;
    tea: string;
    fecha_desembolso: string;
    fecha_inicio_pago: string;
    estado: string;
  };
  num_cuota: number;
  fecha_vencimiento: string;
  valor_cuota: string;
  estado: 'pendiente' | 'pagado' | 'pagada' | 'vencido' | 'vencida' | 'mora' | 'parcial';
}

export interface ScheduleSummary {
  total_cuotas: number;
  cuotas_pagadas: number;
  cuotas_pendientes: number;
  cuotas_vencidas: number;
  monto_total: number;
  monto_pagado: number;
  monto_pendiente: number;
  porcentaje_pagado: number;
  proxima_cuota?: {
    num_cuota: number;
    fecha_vencimiento: string;
    valor_cuota: number;
  };
}

export interface ScheduleFilters {
  estado?: string;
  fecha_desde?: string;
  fecha_hasta?: string;
  producto?: string;
  ordenar_por?: 'fecha' | 'cuota' | 'valor' | 'estado';
  orden?: 'asc' | 'desc';
  page?: number;
  page_size?: number;
  all?: boolean;
}

export interface RepartidorCronograma {
  cliente: {
    cliente_id: number;
    nombre: string;
    tipo_doc: string;
    num_doc: string;
    ciudad: string;
  };
  cronograma: PaymentSchedule[];
  resumen: ScheduleSummary;
  estado_actual: 'al_dia' | 'en_mora';
}

class ScheduleService {
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

  // Obtener cronograma del cliente
  async getClientSchedule(clientId: number, filters?: ScheduleFilters): Promise<{
    count?: number;
    next?: string | null;
    previous?: string | null;
    total_pages?: number;
    current_page?: number;
    page_size?: number;
    results: PaymentSchedule[];
  }> {
    const params = new URLSearchParams();
    
    // Parámetro principal para filtrar por cliente
    params.append('cliente_id', clientId.toString());
    
    if (filters?.estado) params.append('estado', filters.estado);
    if (filters?.fecha_desde) params.append('fecha_desde', filters.fecha_desde);
    if (filters?.fecha_hasta) params.append('fecha_hasta', filters.fecha_hasta);
    if (filters?.producto) params.append('producto', filters.producto);
    if (filters?.ordenar_por) params.append('ordenar_por', filters.ordenar_por);
    if (filters?.orden) params.append('orden', filters.orden);
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.page_size) params.append('page_size', filters.page_size.toString());
    if (filters?.all) params.append('all', 'true');

    const queryString = params.toString();
    const endpoint = `${API_ENDPOINTS.CRONOGRAMA}/?${queryString}`;
    
    // Si se solicitan todos los resultados, el backend retorna directamente el array
    if (filters?.all) {
      const results = await this.request<PaymentSchedule[]>(endpoint);
      return { results };
    }
    
    return this.request<{
      count: number;
      next: string | null;
      previous: string | null;
      total_pages: number;
      current_page: number;
      page_size: number;
      results: PaymentSchedule[];
    }>(endpoint);
  }

  // Obtener resumen del cronograma del cliente
  async getScheduleSummary(clientId: number): Promise<ScheduleSummary> {
    return this.request<ScheduleSummary>(`${API_ENDPOINTS.CRONOGRAMA}/resumen/?cliente_id=${clientId}`);
  }

  // Obtener cronograma por crédito
  async getCreditSchedule(creditId: number): Promise<PaymentSchedule[]> {
    return this.request<PaymentSchedule[]>(`${API_ENDPOINTS.CRONOGRAMA}/?credito=${creditId}`);
  }

  // Obtener cuota específica
  async getInstallment(installmentId: number): Promise<PaymentSchedule> {
    return this.request<PaymentSchedule>(`${API_ENDPOINTS.CRONOGRAMA}/${installmentId}/`);
  }

  // Obtener cronograma completo para repartidor (endpoint especial)
  async getRepartidorCronograma(numDoc: string, tipoDoc: string): Promise<RepartidorCronograma> {
    return this.request<RepartidorCronograma>(`${API_ENDPOINTS.REPARTIDOR}/cronograma_completo/?num_doc=${numDoc}&tipo_doc=${tipoDoc}`);
  }

  // Obtener estado de pago del repartidor
  async getRepartidorEstadoPago(numDoc: string, tipoDoc: string): Promise<{
    estado: 'al_dia' | 'en_mora';
    dias_mora: number;
    monto_mora: number;
    proxima_cuota: PaymentSchedule;
  }> {
    return this.request(`${API_ENDPOINTS.REPARTIDOR}/estado_pago/?num_doc=${numDoc}&tipo_doc=${tipoDoc}`);
  }

  // Obtener cronograma resumido para repartidor
  async getRepartidorCronogramaResumido(numDoc: string, tipoDoc: string): Promise<{
    resumen: ScheduleSummary;
    proximas_cuotas: PaymentSchedule[];
    cuotas_vencidas: PaymentSchedule[];
  }> {
    return this.request(`${API_ENDPOINTS.REPARTIDOR}/cronograma_resumido/?num_doc=${numDoc}&tipo_doc=${tipoDoc}`);
  }

  // Obtener cuotas vencidas
  async getOverdueInstallments(clientId?: number, creditId?: number): Promise<PaymentSchedule[]> {
    const params = new URLSearchParams();
    if (clientId) params.append('cliente', clientId.toString());
    if (creditId) params.append('credito', creditId.toString());
    
    const queryString = params.toString();
    const endpoint = `${API_ENDPOINTS.CRONOGRAMA}/vencidas/${queryString ? `?${queryString}` : ''}`;
    
    return this.request<PaymentSchedule[]>(endpoint);
  }

  // Obtener próximas cuotas a vencer
  async getUpcomingInstallments(clientId?: number, days?: number): Promise<PaymentSchedule[]> {
    const params = new URLSearchParams();
    if (clientId) params.append('cliente', clientId.toString());
    if (days) params.append('dias', days.toString());
    
    const queryString = params.toString();
    const endpoint = `${API_ENDPOINTS.CRONOGRAMA}/proximas/${queryString ? `?${queryString}` : ''}`;
    
    return this.request<PaymentSchedule[]>(endpoint);
  }
}

export const scheduleService = new ScheduleService();
