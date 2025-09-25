'use client';

import { StatusBadge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { PaginationControls } from '@/components/ui/Pagination';
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
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [showAll, setShowAll] = useState(false);

  const loadCredits = useCallback(async () => {
    if (!clientInfo) return;

    setIsLoading(true);
    setError(null);

    try {
      // Obtener créditos con paginación o todos si showAll está activado
      const response = await creditService.getClientCredits(clientInfo.cliente_id, {
        page: showAll ? undefined : currentPage,
        page_size: showAll ? undefined : itemsPerPage,
        all: showAll,
      });
      
      setCredits(response.results);
      
      if (!showAll && response.count !== undefined) {
        setTotalItems(response.count);
        setTotalPages(response.total_pages || Math.ceil(response.count / itemsPerPage));
      } else if (showAll) {
        setTotalItems(response.results.length);
        setTotalPages(1);
      }

      // Consumir resumen real del backend que incluye pagos
      const serverSummary = await creditService.getCreditSummary(clientInfo.cliente_id);
      setSummary(serverSummary);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar los créditos');
    } finally {
      setIsLoading(false);
    }
  }, [clientInfo, currentPage, itemsPerPage, showAll]);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    if (clientInfo) {
      loadCredits();
    }
  }, [isAuthenticated, clientInfo, router, loadCredits]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handlePageSizeChange = (pageSize: number) => {
    setItemsPerPage(pageSize);
    setCurrentPage(1);
  };

  const handleShowAll = () => {
    setShowAll(!showAll);
    setCurrentPage(1);
  };

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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
      {/* Header */}
      <div className="text-center py-4 sm:py-6">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-roda-black mb-4">
          Mis Créditos
        </h1>
        <p className="text-base sm:text-lg lg:text-xl text-roda-gray-600 max-w-2xl mx-auto px-4">
          Consulta el estado y detalles de todos tus créditos
        </p>
      </div>

      {/* Resumen */}
      {summary && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <Card>
            <CardContent className="pt-4 sm:pt-6">
              <div className="text-center">
                <div className="text-lg sm:text-xl lg:text-2xl font-bold text-roda-black">
                  {summary.total_creditos}
                </div>
                <div className="text-xs sm:text-sm text-roda-gray-600">Total Créditos</div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-4 sm:pt-6">
              <div className="text-center">
                <div className="text-lg sm:text-xl lg:text-2xl font-bold text-roda-success">
                  {summary.creditos_vigentes}
                </div>
                <div className="text-xs sm:text-sm text-roda-gray-600">Vigentes</div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-4 sm:pt-6">
              <div className="text-center">
                <div className="text-lg sm:text-xl lg:text-2xl font-bold text-roda-success">
                  {summary.creditos_cancelados}
                </div>
                <div className="text-xs sm:text-sm text-roda-gray-600">Cancelados</div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-4 sm:pt-6">
              <div className="text-center">
                <div className="text-lg sm:text-xl lg:text-2xl font-bold text-roda-error">
                  {summary.creditos_castigados}
                </div>
                <div className="text-xs sm:text-sm text-roda-gray-600">Castigados</div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Resumen financiero */}
      {summary && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {credits.map((credit) => (
            <Card key={credit.credito_id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-roda-yellow/10 rounded-full flex items-center justify-center flex-shrink-0">
                      <div className="scale-75 sm:scale-100">
                        {getProductIcon(credit.producto)}
                      </div>
                    </div>
                    <div className="min-w-0 flex-1">
                      <CardTitle className="text-base sm:text-lg truncate">{credit.producto}</CardTitle>
                      <p className="text-xs sm:text-sm text-roda-gray-600">
                        Crédito #{credit.credito_id}
                      </p>
                    </div>
                  </div>
                  <div className="flex-shrink-0 ml-2">
                    <StatusBadge status={credit.estado} />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Información básica */}
                  <div className="grid grid-cols-2 gap-3 sm:gap-4">
                    <div>
                      <p className="text-xs sm:text-sm text-roda-gray-600">Inversión</p>
                      <p className="font-semibold text-sm sm:text-base lg:text-lg truncate">{formatCurrency(parseFloat(credit.inversion))}</p>
                    </div>
                    <div>
                      <p className="text-xs sm:text-sm text-roda-gray-600">TEA</p>
                      <p className="font-semibold text-sm sm:text-base">{formatPercentage(parseFloat(credit.tea) * 100)}</p>
                    </div>
                  </div>

                  {/* Cuotas */}
                  <div className="grid grid-cols-2 gap-3 sm:gap-4">
                    <div>
                      <p className="text-xs sm:text-sm text-roda-gray-600">Cuotas Totales</p>
                      <p className="font-semibold text-sm sm:text-base">{credit.cuotas_totales}</p>
                    </div>
                    <div>
                      <p className="text-xs sm:text-sm text-roda-gray-600">Cuotas Pagadas</p>
                      <p className="font-semibold text-roda-success text-sm sm:text-base">
                        {credit.resumen?.cuotas_pagadas || 0}
                      </p>
                    </div>
                  </div>

                  {/* Pagos asociados al crédito y cuotas restantes */}
                  {credit.resumen && (
                    <div className="grid grid-cols-2 gap-3 sm:gap-4">
                      <div>
                        <p className="text-xs sm:text-sm text-roda-gray-600">Pagos aplicados</p>
                        <p className="font-semibold text-sm sm:text-base">{credit.resumen.pagos_asociados ?? 0}</p>
                      </div>
                      <div>
                        <p className="text-xs sm:text-sm text-roda-gray-600">Cuotas restantes</p>
                        <p className="font-semibold text-sm sm:text-base">{credit.resumen.cuotas_restantes ?? Math.max(credit.cuotas_totales - (credit.resumen?.cuotas_pagadas || 0), 0)}</p>
                      </div>
                    </div>
                  )}

                  {/* Fechas importantes */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-xs sm:text-sm text-roda-gray-600">Desembolso:</span>
                      <span className="text-xs sm:text-sm font-medium text-right">{formatDate(credit.fecha_desembolso)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs sm:text-sm text-roda-gray-600">Inicio Pago:</span>
                      <span className="text-xs sm:text-sm font-medium text-right">{formatDate(credit.fecha_inicio_pago)}</span>
                    </div>
                  </div>

                  {/* Progreso del pago */}
                  {credit.resumen && (
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-xs sm:text-sm text-roda-gray-600">Progreso del Pago</span>
                        <span className="text-xs sm:text-sm font-medium">{credit.resumen.porcentaje_pagado.toFixed(1)}%</span>
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
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4 text-xs">
                        <div className="flex flex-col sm:flex-row sm:items-center">
                          <span className="text-roda-gray-600">Pagado:</span>
                          <span className="sm:ml-1 font-medium text-roda-success truncate">
                            {formatCurrency(credit.resumen.monto_pagado)}
                          </span>
                        </div>
                        <div className="flex flex-col sm:flex-row sm:items-center">
                          <span className="text-roda-gray-600">Pendiente:</span>
                          <span className="sm:ml-1 font-medium text-roda-warning truncate">
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

      {/* Controles de paginación */}
      {!isLoading && !error && credits.length > 0 && (
        <PaginationControls
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalItems}
          itemsPerPage={itemsPerPage}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
          showAllOption={true}
          onShowAll={handleShowAll}
          isShowingAll={showAll}
          className="mt-6"
        />
      )}
    </div>
  );
}