'use client';

import { StatusBadge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { useAuth } from '@/contexts/AuthContext';
import { Payment, paymentService, PaymentSummaryType } from '@/services/api';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';

export default function PaymentsPage() {
  const { isAuthenticated, clientInfo } = useAuth();
  const router = useRouter();
  
  const [payments, setPayments] = useState<Payment[]>([]);
  const [summary, setSummary] = useState<PaymentSummaryType | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage] = useState(1);
  // Variables de paginación para futuro uso
  // const [totalPages, setTotalPages] = useState(1);
  // const [totalItems, setTotalItems] = useState(0);
  
  const itemsPerPage = 10;

  const loadPayments = useCallback(async () => {
    if (!clientInfo) return;

    setIsLoading(true);
    setError(null);

    try {
      // Solo obtener los pagos sin filtros
      const response = await paymentService.getClientPayments(clientInfo.cliente_id, {
        page: currentPage,
        page_size: itemsPerPage,
      });
      
      setPayments(response.results);
      // setTotalItems(response.count);
      // setTotalPages(Math.ceil(response.count / itemsPerPage));

      // Crear resumen básico desde los datos obtenidos
      const totalPagos = response.count;
      const montoTotalPagado = response.results.reduce((sum, p) => sum + parseFloat(p.monto), 0);
      const pagosPorMedio = response.results.reduce((acc, p) => {
        if (!acc[p.medio]) {
          acc[p.medio] = { cantidad: 0, monto_total: 0 };
        }
        acc[p.medio].cantidad++;
        acc[p.medio].monto_total += parseFloat(p.monto);
        return acc;
      }, {} as Record<string, { cantidad: number; monto_total: number }>);
      
      const ultimoPago = response.results.length > 0 ? {
        fecha: response.results[0].fecha_pago,
        monto: parseFloat(response.results[0].monto),
        medio: response.results[0].medio,
        cuota: 1 // Placeholder
      } : null;
      
      setSummary({
        total_pagos: totalPagos,
        monto_total_pagado: montoTotalPagado,
        pagos_por_medio: pagosPorMedio,
        ultimo_pago: ultimoPago!,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar los pagos');
    } finally {
      setIsLoading(false);
    }
  }, [clientInfo, currentPage, itemsPerPage]);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    if (clientInfo) {
      loadPayments();
    }
  }, [isAuthenticated, clientInfo, router, loadPayments]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getPaymentMethodIcon = (medio: string) => {
    switch (medio.toLowerCase()) {
      case 'efectivo':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        );
      case 'transferencia':
      case 'pse':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
          </svg>
        );
      case 'tarjeta':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
          </svg>
        );
      default:
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
          </svg>
        );
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center py-6">
        <h1 className="text-4xl font-bold text-roda-black mb-4">
          Historial de Pagos
        </h1>
        <p className="text-xl text-roda-gray-600 max-w-2xl mx-auto">
          Consulta el historial completo de tus pagos realizados
        </p>
      </div>

      {/* Resumen */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-roda-success">
                  {formatCurrency(summary.monto_total_pagado)}
                </div>
                <div className="text-sm text-roda-gray-600">Total Pagado</div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-roda-black">
                  {summary.total_pagos}
                </div>
                <div className="text-sm text-roda-gray-600">Total Pagos</div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-roda-info">
                  {Object.keys(summary.pagos_por_medio).length}
                </div>
                <div className="text-sm text-roda-gray-600">Métodos de Pago</div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-roda-black">
                  {formatCurrency(summary.monto_total_pagado / summary.total_pagos)}
                </div>
                <div className="text-sm text-roda-gray-600">Promedio por Pago</div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Último pago */}
      {summary && summary.ultimo_pago && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Último Pago Realizado</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-roda-success/10 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-roda-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-sm text-roda-gray-600">Fecha del último pago</p>
                <p className="text-lg font-semibold text-roda-black">
                  {formatDate(summary.ultimo_pago.fecha)}
                </p>
                <p className="text-sm text-roda-gray-600">
                  {formatCurrency(summary.ultimo_pago.monto)} - {summary.ultimo_pago.medio}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}


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
              <Button onClick={loadPayments} variant="outline" className="text-sm">
                Reintentar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Loading */}
      {isLoading && (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-roda-yellow mx-auto mb-4"></div>
          <p className="text-roda-gray-600">Cargando historial de pagos...</p>
        </div>
      )}

      {/* Lista de Pagos */}
      {!isLoading && !error && payments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl text-roda-black">
              Historial de Pagos ({payments.length} pagos)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {payments.map((payment) => (
                <div
                  key={payment.pago_id}
                  className="flex items-center justify-between p-4 bg-roda-gray-50 rounded-lg hover:bg-roda-gray-100 transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-roda-success/10 rounded-full flex items-center justify-center">
                      {getPaymentMethodIcon(payment.medio)}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h4 className="font-semibold text-roda-black">
                          Pago #{payment.pago_id}
                        </h4>
                        <StatusBadge status="pagada" />
                      </div>
                      <div className="text-sm text-roda-gray-600">
                        {payment.cuota_info && (
                          <span>Cuota {payment.cuota_info.num_cuota} - {payment.cuota_info.producto}</span>
                        )}
                      </div>
                      <div className="text-xs text-roda-gray-500">
                        {formatDate(payment.fecha_pago)}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-roda-success">
                      {formatCurrency(parseFloat(payment.monto))}
                    </div>
                    <div className="text-sm text-roda-gray-600 capitalize">
                      {payment.medio}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Sin datos */}
      {!isLoading && !error && payments.length === 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <svg className="w-16 h-16 text-roda-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="text-xl font-semibold text-roda-gray-900 mb-2">
                No se encontraron pagos
              </h3>
              <p className="text-roda-gray-600">
                No hay pagos que coincidan con los filtros seleccionados.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}