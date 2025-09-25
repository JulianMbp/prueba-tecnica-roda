'use client';

import { DynamicPaymentStatusChart, DynamicPaymentTimelineChart, MetricCard } from '@/components/charts';
import { ExportButton } from '@/components/export';
import { DateRangeFilter, FilterPanel, SearchFilter, SelectFilter } from '@/components/filters';
import { StatusBadge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { PaginationControls } from '@/components/ui/Pagination';
import { useAuth } from '@/contexts/AuthContext';
import { SchedulePaymentSchedule, scheduleService } from '@/services/api';
import { prepareScheduleData } from '@/utils/exportUtils';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';

// Nuevos imports para funcionalidades avanzadas

export default function SchedulePage() {
  const { isAuthenticated, clientInfo } = useAuth();
  const router = useRouter();
  
  const [schedule, setSchedule] = useState<SchedulePaymentSchedule[]>([]);
  const [filteredSchedule, setFilteredSchedule] = useState<SchedulePaymentSchedule[]>([]);
  const [allScheduleData, setAllScheduleData] = useState<SchedulePaymentSchedule[]>([]); // Para gráficas
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [showAll, setShowAll] = useState(false);

  // Estados para filtros
  const [filters, setFilters] = useState({
    fechaDesde: '',
    fechaHasta: '',
    estado: '',
    producto: '',
    busqueda: ''
  });

  const [showCharts, setShowCharts] = useState(true);

  const loadSchedule = useCallback(async () => {
    if (!clientInfo) return;

    setIsLoading(true);
    setError(null);

    try {
      // Obtener cronograma con paginación o todos si showAll está activado
      const response = await scheduleService.getClientSchedule(clientInfo.cliente_id, {
        page: showAll ? undefined : currentPage,
        page_size: showAll ? undefined : itemsPerPage,
        all: showAll,
      });
      
      // Obtener TODOS los datos para las gráficas (sin paginación)
      const allDataResponse = await scheduleService.getClientSchedule(clientInfo.cliente_id, {
        all: true
      });
      
      setSchedule(response.results);
      setFilteredSchedule(response.results);
      setAllScheduleData(allDataResponse.results); // Para gráficas
      
      if (!showAll && response.count !== undefined) {
        setTotalItems(response.count);
        setTotalPages(response.total_pages || Math.ceil(response.count / itemsPerPage));
      } else if (showAll) {
        setTotalItems(response.results.length);
        setTotalPages(1);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar el cronograma');
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
      loadSchedule();
    }
  }, [isAuthenticated, clientInfo, router, loadSchedule]);

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

  // Funciones de filtrado
  const applyFilters = useCallback(() => {
    let filtered = [...schedule];

    // Filtro por fecha
    if (filters.fechaDesde) {
      filtered = filtered.filter(item => 
        new Date(item.fecha_vencimiento) >= new Date(filters.fechaDesde)
      );
    }
    if (filters.fechaHasta) {
      filtered = filtered.filter(item => 
        new Date(item.fecha_vencimiento) <= new Date(filters.fechaHasta)
      );
    }

    // Filtro por estado
    if (filters.estado) {
      filtered = filtered.filter(item => item.estado === filters.estado);
    }

    // Filtro por producto
    if (filters.producto) {
      filtered = filtered.filter(item => 
        item.credit_info?.producto?.toLowerCase().includes(filters.producto.toLowerCase())
      );
    }

    // Filtro por búsqueda
    if (filters.busqueda) {
      const searchTerm = filters.busqueda.toLowerCase();
      filtered = filtered.filter(item => 
        item.num_cuota.toString().includes(searchTerm) ||
        item.credit_info?.producto?.toLowerCase().includes(searchTerm) ||
        item.estado.toLowerCase().includes(searchTerm)
      );
    }

    setFilteredSchedule(filtered);
  }, [schedule, filters]);

  const clearFilters = () => {
    setFilters({
      fechaDesde: '',
      fechaHasta: '',
      estado: '',
      producto: '',
      busqueda: ''
    });
    setFilteredSchedule(schedule);
  };

  const resetFilters = () => {
    clearFilters();
    loadSchedule();
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  // Aplicar filtros cuando cambien
  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  // Calcular resumen dinámico desde los datos filtrados (para tabla)
  const dynamicSummary = {
    total_cuotas: filteredSchedule.length,
    cuotas_pagadas: filteredSchedule.filter(s => s.estado === 'pagada' || s.estado === 'pagado').length,
    cuotas_pendientes: filteredSchedule.filter(s => s.estado === 'pendiente').length,
    cuotas_vencidas: filteredSchedule.filter(s => s.estado === 'vencida' || s.estado === 'vencido' || s.estado === 'mora').length,
    cuotas_parciales: filteredSchedule.filter(s => s.estado === 'parcial').length,
    monto_total: filteredSchedule.reduce((sum, s) => sum + parseFloat(s.valor_cuota), 0),
    porcentaje_pagado: filteredSchedule.length > 0 ? 
      Math.round((filteredSchedule.filter(s => s.estado === 'pagada' || s.estado === 'pagado').length / filteredSchedule.length) * 100) : 0
  };

  // Preparar datos para gráficos usando TODOS los datos (no paginados)
  const chartData = {
    statusData: [
      { estado: 'Pagadas', cantidad: allScheduleData.filter(s => s.estado === 'pagada' || s.estado === 'pagado').length },
      { estado: 'Pendientes', cantidad: allScheduleData.filter(s => s.estado === 'pendiente').length },
      { estado: 'Vencidas', cantidad: allScheduleData.filter(s => s.estado === 'vencida' || s.estado === 'vencido' || s.estado === 'mora').length },
      { estado: 'Parciales', cantidad: allScheduleData.filter(s => s.estado === 'parcial').length }
    ],

    timelineData: (() => {
      const monthlyData: { [key: string]: { pagos: number; vencimientos: number; monto_pagado: number; monto_vencido: number } } = {};
      
      allScheduleData.forEach(item => {
        const month = new Date(item.fecha_vencimiento).toLocaleDateString('es-CO', { year: 'numeric', month: 'short' });
        if (!monthlyData[month]) {
          monthlyData[month] = { pagos: 0, vencimientos: 0, monto_pagado: 0, monto_vencido: 0 };
        }
        
        if (item.estado === 'pagada' || item.estado === 'pagado') {
          monthlyData[month].pagos++;
          monthlyData[month].monto_pagado += parseFloat(item.valor_cuota);
        } else if (item.estado === 'vencida' || item.estado === 'vencido' || item.estado === 'mora') {
          monthlyData[month].vencimientos++;
          monthlyData[month].monto_vencido += parseFloat(item.valor_cuota);
        }
      });

      return Object.entries(monthlyData).map(([fecha, data]) => ({
        fecha,
        ...data
      }));
    })()
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

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
      {/* Header */}
      <div className="text-center py-4 sm:py-6">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-roda-black mb-4">
          Cronograma de Pagos
        </h1>
        <p className="text-base sm:text-lg lg:text-xl text-roda-gray-600 max-w-2xl mx-auto px-4">
          Consulta el detalle completo de tu cronograma de pagos
        </p>
      </div>

      {/* Métricas principales - Dinámicas basadas en filtros */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <MetricCard
          title="Total Cuotas"
          value={dynamicSummary.total_cuotas}
          subtitle={schedule.length !== filteredSchedule.length ? `de ${schedule.length} totales` : undefined}
          color="primary"
          icon={
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          }
        />
        
        <MetricCard
          title="Cuotas Pagadas"
          value={dynamicSummary.cuotas_pagadas}
          color="success"
          icon={
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
          trend={{
            value: dynamicSummary.porcentaje_pagado,
            isPositive: true
          }}
        />
        
        <MetricCard
          title="Cuotas Pendientes"
          value={dynamicSummary.cuotas_pendientes}
          color="warning"
          icon={
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
        
        <MetricCard
          title="Cuotas Vencidas"
          value={dynamicSummary.cuotas_vencidas}
          color="error"
          icon={
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          }
        />
      </div>

      {/* Panel de Filtros */}
      <FilterPanel
        title="Filtros de Cronograma"
        onApply={applyFilters}
        onClear={clearFilters}
        onReset={resetFilters}
        isLoading={isLoading}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <DateRangeFilter
            startDate={filters.fechaDesde}
            endDate={filters.fechaHasta}
            onStartDateChange={(date: string) => handleFilterChange('fechaDesde', date)}
            onEndDateChange={(date: string) => handleFilterChange('fechaHasta', date)}
            label="Rango de Fechas de Vencimiento"
          />
          
          <SelectFilter
            value={filters.estado}
            onChange={(value: string) => handleFilterChange('estado', value)}
            options={[
              { value: 'pendiente', label: 'Pendiente' },
              { value: 'pagada', label: 'Pagada' },
              { value: 'pagado', label: 'Pagado' },
              { value: 'vencida', label: 'Vencida' },
              { value: 'vencido', label: 'Vencido' },
              { value: 'parcial', label: 'Parcial' },
              { value: 'mora', label: 'En Mora' }
            ]}
            label="Estado"
            placeholder="Todos los estados"
          />
          
          <SearchFilter
            value={filters.busqueda}
            onChange={(value: string) => handleFilterChange('busqueda', value)}
            label="Búsqueda"
            placeholder="Buscar por N° cuota, producto..."
          />
        </div>
      </FilterPanel>

      {/* Controles de Vista */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 w-full sm:w-auto">
          <button
            onClick={() => setShowCharts(!showCharts)}
            className="flex items-center space-x-2 px-3 sm:px-4 py-2 text-sm font-medium text-roda-gray-700 bg-white border border-roda-gray-300 rounded-md hover:bg-roda-gray-50 focus:outline-none focus:ring-2 focus:ring-roda-yellow"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <span className="hidden sm:inline">{showCharts ? 'Ocultar' : 'Mostrar'} Gráficos</span>
            <span className="sm:hidden">{showCharts ? 'Ocultar' : 'Mostrar'}</span>
          </button>
          
          <div className="text-xs sm:text-sm text-roda-gray-600">
            Mostrando {filteredSchedule.length} de {schedule.length} cuotas
          </div>
        </div>
        
        <div className="w-full sm:w-auto">
          <ExportButton 
            data={prepareScheduleData(filteredSchedule as unknown as Array<Record<string, unknown>>)}
            disabled={filteredSchedule.length === 0}
          />
        </div>
      </div>


      {/* Gráficos */}
      {showCharts && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          <DynamicPaymentStatusChart data={chartData.statusData} />
          <DynamicPaymentTimelineChart data={chartData.timelineData} />
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
              <Button onClick={loadSchedule} variant="outline" className="text-sm">
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
          <p className="text-roda-gray-600">Cargando cronograma...</p>
        </div>
      )}

      {/* Tabla de Cronograma */}
      {!isLoading && !error && schedule.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl text-roda-black">
              Detalle del Cronograma ({schedule.length} cuotas)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-roda-gray-200">
                <thead className="bg-roda-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-roda-gray-500 uppercase tracking-wider">
                      Cuota
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-roda-gray-500 uppercase tracking-wider">
                      Vencimiento
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-roda-gray-500 uppercase tracking-wider">
                      Valor
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-roda-gray-500 uppercase tracking-wider">
                      Estado
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-roda-gray-500 uppercase tracking-wider">
                      Producto
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-roda-gray-500 uppercase tracking-wider">
                      Crédito
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-roda-white divide-y divide-roda-gray-200">
                  {filteredSchedule.map((cuota) => (
                    <tr key={cuota.schedule_id} className="hover:bg-roda-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-roda-black">
                        {cuota.num_cuota}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-roda-gray-700">
                        {formatDate(cuota.fecha_vencimiento)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-roda-gray-700">
                        {formatCurrency(parseFloat(cuota.valor_cuota))}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-roda-gray-700">
                        <StatusBadge status={cuota.estado} />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-roda-gray-700">
                        <div className="flex items-center">
                          <span className="mr-2">
                            {(cuota.credit_info?.producto || '').toLowerCase() === 'e-moped' ? '🏍️' : '🛵'}
                          </span>
                          <span>{cuota.credit_info?.producto ?? '-'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-roda-gray-700">
                        <div className="flex flex-col">
                          {(() => {
                            const creditId = cuota.credit_info?.credito_id ?? cuota.credito;
                            return (
                              <span className="font-medium">
                                {creditId ? `Crédito #${creditId}` : 'Crédito -'}
                              </span>
                            );
                          })()}
                          {cuota.credit_info?.inversion && (
                            <span className="text-xs text-roda-gray-500">
                              {formatCurrency(parseFloat(cuota.credit_info.inversion))}
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {/* Controles de paginación */}
            {!isLoading && !error && filteredSchedule.length > 0 && (
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
          </CardContent>
        </Card>
      )}

      {/* Sin datos */}
      {!isLoading && !error && filteredSchedule.length === 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <svg className="w-16 h-16 text-roda-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <h3 className="text-xl font-semibold text-roda-gray-900 mb-2">
                No se encontraron cuotas
              </h3>
              <p className="text-roda-gray-600">
                No hay cuotas que coincidan con los filtros seleccionados.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
