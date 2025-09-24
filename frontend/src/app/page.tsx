'use client';

import { ClientInfo } from '@/components/search/ClientInfo';
import { StatusBadge } from '@/components/ui/Badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { useAuth } from '@/contexts/AuthContext';
import { Client, clientService, PaymentSchedule } from '@/services/api';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function Home() {
  const { isAuthenticated, clientInfo } = useAuth();
  const router = useRouter();
  const [client, setClient] = useState<Client | null>(null);
  const [paymentSchedule, setPaymentSchedule] = useState<PaymentSchedule[]>([]);
  const [summary, setSummary] = useState<unknown>(null);
  const [estadoActual, setEstadoActual] = useState<'al_dia' | 'en_mora' | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Si no está autenticado, redirigir al login
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    // Si está autenticado, cargar la información del cronograma
    if (clientInfo) {
      loadClientSchedule();
    }
  }, [isAuthenticated, clientInfo, router]);

  const loadClientSchedule = async () => {
    if (!clientInfo) return;

    setIsLoading(true);
    setError(null);

    try {
      // Buscar cliente con cronograma completo usando la información guardada
      const response = await clientService.getClientWithSchedule(
        clientInfo.num_doc, 
        clientInfo.tipo_doc
      );
      
      setClient(response.cliente);
      setPaymentSchedule(response.cronograma);
      setSummary(response.resumen);
      setEstadoActual(response.resumen.cuotas_vencidas > 0 ? 'en_mora' : 'al_dia');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar el cronograma');
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Si está cargando, mostrar loading
  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-roda-yellow mx-auto mb-4"></div>
          <p className="text-roda-gray-600">Cargando tu cronograma...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Hero Section */}
      <div className="text-center py-8">
        <h1 className="text-4xl font-bold text-roda-black mb-4">
          Bienvenido, {clientInfo?.nombre}
        </h1>
        <p className="text-xl text-roda-gray-600 max-w-2xl mx-auto">
          Consulta el estado de tus pagos y mantente al día con tu cronograma de e-bikes y e-mopeds
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <Card className="max-w-md mx-auto">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-3 text-roda-error">
              <svg className="w-6 h-6 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="font-medium">{error}</p>
            </div>
            <div className="mt-4">
              <button
                onClick={loadClientSchedule}
                className="text-sm text-roda-yellow hover:text-roda-green transition-colors"
              >
                Reintentar
              </button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Client Information */}
      {client && summary && estadoActual && (
        <ClientInfo 
          client={client} 
          summary={summary} 
          estadoActual={estadoActual} 
        />
      )}

      {/* Payment Schedule */}
      {paymentSchedule.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Cronograma de Pagos</CardTitle>
            <p className="text-sm text-roda-gray-600">
              Lista de todas las cuotas ordenadas por fecha de vencimiento
            </p>
          </CardHeader>
          
          <CardContent>
            <div className="overflow-x-auto">
              <div className="min-w-full divide-y divide-roda-gray-200">
                {/* Table Header */}
                <div className="grid grid-cols-12 gap-4 px-4 py-3 bg-roda-gray-50 text-xs font-medium text-roda-gray-500 uppercase tracking-wider">
                  <div className="col-span-1">Cuota</div>
                  <div className="col-span-2">Producto</div>
                  <div className="col-span-2">Vencimiento</div>
                  <div className="col-span-2">Valor</div>
                  <div className="col-span-2">Pagado</div>
                  <div className="col-span-2">Saldo</div>
                  <div className="col-span-1">Estado</div>
                </div>

                {/* Table Body */}
                {paymentSchedule.map((payment) => (
                  <div
                    key={payment.cuota_id}
                    className="grid grid-cols-12 gap-4 px-4 py-4 hover:bg-roda-gray-50 transition-colors"
                  >
                    <div className="col-span-1 text-sm font-medium text-roda-gray-900">
                      {payment.num_cuota}
                    </div>
                    
                    <div className="col-span-2 text-sm text-roda-gray-900">
                      {payment.producto === 'e-bike' ? '🛵 E-bike' : '🏍️ E-moped'}
                    </div>
                    
                    <div className="col-span-2 text-sm text-roda-gray-900">
                      {formatDate(payment.fecha_vencimiento)}
                      {payment.dias_vencido > 0 && (
                        <div className="text-xs text-roda-error">
                          {payment.dias_vencido} días vencido
                        </div>
                      )}
                      {payment.dias_restantes > 0 && (
                        <div className="text-xs text-roda-gray-500">
                          {payment.dias_restantes} días restantes
                        </div>
                      )}
                    </div>
                    
                    <div className="col-span-2 text-sm font-medium text-roda-gray-900">
                      {formatCurrency(payment.valor_cuota)}
                    </div>
                    
                    <div className="col-span-2 text-sm text-roda-gray-900">
                      {formatCurrency(payment.monto_pagado)}
                    </div>
                    
                    <div className="col-span-2 text-sm font-medium text-roda-gray-900">
                      {formatCurrency(payment.saldo_pendiente)}
                    </div>
                    
                    <div className="col-span-1">
                      <StatusBadge status={payment.estado} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Summary Stats */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4 pt-6 border-t border-roda-gray-200">
              <div className="text-center">
                <div className="text-2xl font-bold text-roda-black">
                  {summary?.total_cuotas || 0}
                </div>
                <div className="text-sm text-roda-gray-600">Total Cuotas</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-roda-success">
                  {summary?.cuotas_pagadas || 0}
                </div>
                <div className="text-sm text-roda-gray-600">Pagadas</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-roda-warning">
                  {summary?.cuotas_pendientes || 0}
                </div>
                <div className="text-sm text-roda-gray-600">Pendientes</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-roda-error">
                  {summary?.cuotas_vencidas || 0}
                </div>
                <div className="text-sm text-roda-gray-600">Vencidas</div>
              </div>
        </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}