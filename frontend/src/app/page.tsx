'use client';

import { ClientInfo } from '@/components/search/ClientInfo';
import { StatusBadge } from '@/components/ui/Badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { useAuth } from '@/contexts/AuthContext';
import { Client, clientService, PaymentSchedule, PaymentSummary } from '@/services/api';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';

export default function Home() {
  const { isAuthenticated, clientInfo } = useAuth();
  const router = useRouter();
  const [client, setClient] = useState<Client | null>(null);
  const [paymentSchedule, setPaymentSchedule] = useState<PaymentSchedule[]>([]);
  const [summary, setSummary] = useState<PaymentSummary | null>(null);
  const [estadoActual, setEstadoActual] = useState<'al_dia' | 'en_mora' | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadClientSchedule = useCallback(async () => {
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
      setEstadoActual(response.resumen.overdue_schedules > 0 ? 'en_mora' : 'al_dia');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar el cronograma');
    } finally {
      setIsLoading(false);
    }
  }, [clientInfo]);

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
  }, [isAuthenticated, clientInfo, router, loadClientSchedule]);

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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-roda-yellow mx-auto mb-4"></div>
          <p className="text-roda-gray-600">Cargando tu cronograma...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
      {/* Hero Section */}
      <div className="text-center py-6 sm:py-8">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-roda-black mb-4">
          Bienvenido, {clientInfo?.nombre}
        </h1>
        <p className="text-base sm:text-lg lg:text-xl text-roda-gray-600 max-w-2xl mx-auto px-4">
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
              <p className="font-medium text-sm sm:text-base">{error}</p>
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
            {/* Vista móvil - Cards apiladas */}
            <div className="block lg:hidden space-y-4">
              {paymentSchedule.map((payment) => (
                <div key={payment.schedule_id} className="border border-roda-gray-200 rounded-lg p-4 bg-white hover:bg-roda-gray-50 transition-colors">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-semibold text-roda-gray-900">Cuota #{payment.num_cuota}</span>
                        <StatusBadge status={payment.estado} />
                      </div>
                      <div className="text-sm text-roda-gray-600 mt-1">
                        {(payment.credit_info?.producto || '').toLowerCase() === 'e-moped' ? '🏍️ E-moped' : '🛵 E-bike'}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-roda-gray-900">
                        {formatCurrency(parseFloat(payment.valor_cuota as unknown as string))}
                      </div>
                      <div className="text-sm text-roda-gray-600">
                        Crédito #{payment.credit_info?.credito_id ?? payment.credito}
                      </div>
                    </div>
                  </div>
                  <div className="text-sm text-roda-gray-600">
                    Vence: {formatDate(payment.fecha_vencimiento)}
                  </div>
                </div>
              ))}
            </div>

            {/* Vista desktop - Tabla */}
            <div className="hidden lg:block overflow-x-auto">
              <div className="min-w-full divide-y divide-roda-gray-200">
                {/* Table Header */}
                <div className="grid grid-cols-10 gap-4 px-4 py-3 bg-roda-gray-50 text-xs font-medium text-roda-gray-500 uppercase tracking-wider">
                  <div className="col-span-1">Cuota</div>
                  <div className="col-span-2">Producto</div>
                  <div className="col-span-2">Vencimiento</div>
                  <div className="col-span-2">Valor</div>
                  <div className="col-span-2">Crédito</div>
                  <div className="col-span-1">Estado</div>
                </div>

                {/* Table Body */}
                {paymentSchedule.map((payment) => (
                  <div
                    key={payment.schedule_id}
                    className="grid grid-cols-10 gap-4 px-4 py-4 hover:bg-roda-gray-50 transition-colors"
                  >
                    <div className="col-span-1 text-sm font-medium text-roda-gray-900">
                      {payment.num_cuota}
                    </div>
                    
                    <div className="col-span-2 text-sm text-roda-gray-900">
                      {(payment.credit_info?.producto || '').toLowerCase() === 'e-moped' ? '🏍️ E-moped' : '🛵 E-bike'}
                    </div>
                    
                    <div className="col-span-2 text-sm text-roda-gray-900">
                      {formatDate(payment.fecha_vencimiento)}
                    </div>
                    
                    <div className="col-span-2 text-sm font-medium text-roda-gray-900">
                      {formatCurrency(parseFloat(payment.valor_cuota as unknown as string))}
                    </div>
                    
                    <div className="col-span-2 text-sm text-roda-gray-900">
                      Crédito #{payment.credit_info?.credito_id ?? payment.credito}
                    </div>
                    
                    <div className="col-span-1">
                      <StatusBadge status={payment.estado} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Summary Stats */}
            <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 border-t border-roda-gray-200">
              <div className="text-center">
                <div className="text-xl sm:text-2xl font-bold text-roda-black">
                  {summary?.total_schedules || 0}
                </div>
                <div className="text-xs sm:text-sm text-roda-gray-600">Total Cuotas</div>
              </div>
              
              <div className="text-center">
                <div className="text-xl sm:text-2xl font-bold text-roda-success">
                  {summary?.paid_schedules || 0}
                </div>
                <div className="text-xs sm:text-sm text-roda-gray-600">Pagadas</div>
              </div>
              
              <div className="text-center">
                <div className="text-xl sm:text-2xl font-bold text-roda-warning">
                  {summary?.pending_schedules || 0}
                </div>
                <div className="text-xs sm:text-sm text-roda-gray-600">Pendientes</div>
              </div>
              
              <div className="text-center">
                <div className="text-xl sm:text-2xl font-bold text-roda-error">
                  {summary?.overdue_schedules || 0}
                </div>
                <div className="text-xs sm:text-sm text-roda-gray-600">Vencidas</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}