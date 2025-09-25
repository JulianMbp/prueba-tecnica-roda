'use client';

import { StatusBadge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { useAuth } from '@/contexts/AuthContext';
import { Credit, creditService, CreditSummary } from '@/services/api';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';

export default function CreditsPage() {
  const { isAuthenticated, clientInfo } = useAuth();
  const router = useRouter();
  
  const [credits, setCredits] = useState<Credit[]>([]);
  const [summary, setSummary] = useState<CreditSummary | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage] = useState(1);
  // Variables de paginación para futuro uso
  // const [totalPages, setTotalPages] = useState(1);
  // const [totalItems, setTotalItems] = useState(0);
  
  const itemsPerPage = 10;

  const loadCredits = useCallback(async () => {
    if (!clientInfo) return;

    setIsLoading(true);
    setError(null);

    try {
      // Solo obtener los créditos sin filtros
      const response = await creditService.getClientCredits(clientInfo.cliente_id, {
        page: currentPage,
        page_size: itemsPerPage,
      });
      
      setCredits(response.results);
      // setTotalItems(response.count);
      // setTotalPages(Math.ceil(response.count / itemsPerPage));

      // Crear resumen básico desde los datos obtenidos
      const totalCreditos = response.count;
      const creditosVigentes = response.results.filter(c => c.estado === 'vigente').length;
      const inversionTotal = response.results.reduce((sum, c) => sum + parseFloat(c.inversion), 0);
      
      setSummary({
        total_creditos: totalCreditos,
        creditos_vigentes: creditosVigentes,
        creditos_cancelados: 0,
        creditos_castigados: 0,
        inversion_total: inversionTotal,
        inversion_vigente: inversionTotal,
        monto_pagado_total: 0,
        monto_pendiente_total: inversionTotal,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar los créditos');
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
      loadCredits();
    }
  }, [isAuthenticated, clientInfo, router, loadCredits]);

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
    });
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(2)}%`;
  };

  const getProductIcon = (producto: string) => {
    switch (producto.toLowerCase()) {
      case 'e-bike':
        return (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        );
      case 'e-moped':
        return (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
          </svg>
        );
      default:
        return (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
          Mis Créditos
        </h1>
        <p className="text-xl text-roda-gray-600 max-w-2xl mx-auto">
          Consulta el estado y detalles de todos tus créditos
        </p>
      </div>

      {/* Resumen */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-roda-black">
                  {summary.total_creditos}
                </div>
                <div className="text-sm text-roda-gray-600">Total Créditos</div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-roda-success">
                  {summary.creditos_vigentes}
                </div>
                <div className="text-sm text-roda-gray-600">Vigentes</div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-roda-success">
                  {summary.creditos_cancelados}
                </div>
                <div className="text-sm text-roda-gray-600">Cancelados</div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-roda-error">
                  {summary.creditos_castigados}
                </div>
                <div className="text-sm text-roda-gray-600">Castigados</div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Resumen financiero */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Inversión Total</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-roda-gray-600">Total Invertido:</span>
                  <span className="font-semibold">{formatCurrency(summary.inversion_total)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-roda-gray-600">Inversión Vigente:</span>
                  <span className="font-semibold text-roda-success">{formatCurrency(summary.inversion_vigente)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Estado de Pagos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-roda-gray-600">Total Pagado:</span>
                  <span className="font-semibold text-roda-success">{formatCurrency(summary.monto_pagado_total)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-roda-gray-600">Pendiente:</span>
                  <span className="font-semibold text-roda-warning">{formatCurrency(summary.monto_pendiente_total)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
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
              <Button onClick={loadCredits} variant="outline" className="text-sm">
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
          <p className="text-roda-gray-600">Cargando créditos...</p>
        </div>
      )}

      {/* Lista de Créditos */}
      {!isLoading && !error && credits.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {credits.map((credit) => (
            <Card key={credit.credito_id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-roda-yellow/10 rounded-full flex items-center justify-center">
                      {getProductIcon(credit.producto)}
                    </div>
                    <div>
                      <CardTitle className="text-lg">{credit.producto}</CardTitle>
                      <p className="text-sm text-roda-gray-600">
                        Crédito #{credit.credito_id}
                      </p>
                    </div>
                  </div>
                  <StatusBadge status={credit.estado} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Información básica */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-roda-gray-600">Inversión</p>
                      <p className="font-semibold text-lg">{formatCurrency(parseFloat(credit.inversion))}</p>
                    </div>
                    <div>
                      <p className="text-sm text-roda-gray-600">TEA</p>
                      <p className="font-semibold">{formatPercentage(parseFloat(credit.tea) * 100)}</p>
                    </div>
                  </div>

                  {/* Cuotas */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-roda-gray-600">Cuotas Totales</p>
                      <p className="font-semibold">{credit.cuotas_totales}</p>
                    </div>
                    <div>
                      <p className="text-sm text-roda-gray-600">Cuotas Pagadas</p>
                      <p className="font-semibold text-roda-success">
                        {credit.resumen?.cuotas_pagadas || 0}
                      </p>
                    </div>
                  </div>

                  {/* Fechas importantes */}
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-roda-gray-600">Desembolso:</span>
                      <span className="text-sm font-medium">{formatDate(credit.fecha_desembolso)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-roda-gray-600">Inicio Pago:</span>
                      <span className="text-sm font-medium">{formatDate(credit.fecha_inicio_pago)}</span>
                    </div>
                  </div>

                  {/* Progreso del pago */}
                  {credit.resumen && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-roda-gray-600">Progreso del Pago</span>
                        <span className="font-medium">{credit.resumen.porcentaje_pagado.toFixed(1)}%</span>
                      </div>
                      <div className="w-full bg-roda-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all duration-300 ${
                            credit.resumen.porcentaje_pagado >= 80
                              ? 'bg-roda-success'
                              : credit.resumen.porcentaje_pagado >= 50
                              ? 'bg-roda-warning'
                              : 'bg-roda-error'
                          }`}
                          style={{ width: `${Math.min(credit.resumen.porcentaje_pagado, 100)}%` }}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-xs">
                        <div>
                          <span className="text-roda-gray-600">Pagado:</span>
                          <span className="ml-1 font-medium text-roda-success">
                            {formatCurrency(credit.resumen.monto_pagado)}
                          </span>
                        </div>
                        <div>
                          <span className="text-roda-gray-600">Pendiente:</span>
                          <span className="ml-1 font-medium text-roda-warning">
                            {formatCurrency(credit.resumen.monto_pendiente)}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Sin datos */}
      {!isLoading && !error && credits.length === 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <svg className="w-16 h-16 text-roda-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
              <h3 className="text-xl font-semibold text-roda-gray-900 mb-2">
                No se encontraron créditos
              </h3>
              <p className="text-roda-gray-600">
                No hay créditos que coincidan con los filtros seleccionados.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}