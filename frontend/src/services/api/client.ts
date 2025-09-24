// API service for client operations

export interface Client {
  cliente_id: number;
  tipo_doc: string;
  num_doc: string;
  nombre: string;
  ciudad: string;
  created_at: string;
}

export interface ClientSearchResponse {
  cliente: Client;
  cronograma: PaymentSchedule[];
  resumen: PaymentSummary;
}

export interface PaymentSchedule {
  cuota_id: number;
  num_cuota: number;
  fecha_vencimiento: string;
  valor_cuota: number;
  estado: 'pendiente' | 'pagada' | 'vencida' | 'parcial';
  producto: string;
  credito_id: number;
  dias_vencido: number;
  dias_restantes: number;
  monto_pagado: number;
  saldo_pendiente: number;
}

export interface PaymentSummary {
  total_cuotas: number;
  cuotas_pagadas: number;
  cuotas_vencidas: number;
  cuotas_pendientes: number;
  cuotas_parciales: number;
  total_monto: number;
  monto_pagado: number;
  monto_pendiente: number;
  porcentaje_pagado: number;
}

export interface PaymentStatus {
  estado_general: 'al_dia' | 'en_mora';
  total_cuotas: number;
  cuotas_pagadas: number;
  cuotas_pendientes: number;
  cuotas_vencidas: number;
  proxima_cuota: PaymentSchedule | null;
  cuota_mas_reciente_vencida: PaymentSchedule | null;
  dias_mora: number;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

class ClientService {
  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    try {
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
        ...options,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Error desconocido' }));
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`API Error (${endpoint}):`, error);
      throw error;
    }
  }

  async searchClientByDocument(
    numDoc: string,
    tipoDoc: string = 'CC'
  ): Promise<Client> {
    return this.request<Client>(
      `/clientes/buscar_cliente/?num_doc=${numDoc}&tipo_doc=${tipoDoc}`
    );
  }

  async getClientWithSchedule(
    numDoc: string,
    tipoDoc: string = 'CC'
  ): Promise<ClientSearchResponse> {
    return this.request<ClientSearchResponse>(
      `/clientes/buscar_por_cedula/?num_doc=${numDoc}&tipo_doc=${tipoDoc}`
    );
  }

  async getRepartidorSchedule(clientId: number): Promise<{
    cliente: Client;
    cronograma: PaymentSchedule[];
    resumen: PaymentSummary;
    estado_actual: 'al_dia' | 'en_mora';
  }> {
    return this.request(
      `/repartidor/cronograma_resumido/?cliente_id=${clientId}`
    );
  }

  async getPaymentStatus(clientId: number): Promise<PaymentStatus> {
    return this.request<PaymentStatus>(
      `/repartidor/estado_pago/?cliente_id=${clientId}`
    );
  }

  async getAllClients(): Promise<{
    count: number;
    results: Client[];
  }> {
    return this.request('/clientes/');
  }

  async getClientsWithOverdue(): Promise<Client[]> {
    return this.request<Client[]>('/clientes/con_mora/');
  }
}

export const clientService = new ClientService();
