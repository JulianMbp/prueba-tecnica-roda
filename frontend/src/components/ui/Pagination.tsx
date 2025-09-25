'use client';

import { Button } from './Button';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems?: number;
  itemsPerPage?: number;
  onPageChange: (page: number) => void;
  showInfo?: boolean;
  className?: string;
}

export function Pagination({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
  showInfo = true,
  className = ''
}: PaginationProps) {
  const getVisiblePages = () => {
    const delta = 2;
    const range = [];
    const rangeWithDots = [];

    for (
      let i = Math.max(2, currentPage - delta);
      i <= Math.min(totalPages - 1, currentPage + delta);
      i++
    ) {
      range.push(i);
    }

    if (currentPage - delta > 2) {
      rangeWithDots.push(1, '...');
    } else {
      rangeWithDots.push(1);
    }

    rangeWithDots.push(...range);

    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push('...', totalPages);
    } else {
      if (totalPages > 1) {
        rangeWithDots.push(totalPages);
      }
    }

    return rangeWithDots;
  };

  if (totalPages <= 1) {
    return null;
  }

  const visiblePages = getVisiblePages();

  return (
    <div className={`flex flex-col sm:flex-row items-center justify-between space-y-3 sm:space-y-0 ${className}`}>
      {/* Información de resultados */}
      {showInfo && totalItems && itemsPerPage && (
        <div className="text-sm text-roda-gray-600 order-2 sm:order-1">
          Mostrando {Math.min((currentPage - 1) * itemsPerPage + 1, totalItems)} - {Math.min(currentPage * itemsPerPage, totalItems)} de {totalItems} resultados
        </div>
      )}

      {/* Controles de paginación */}
      <div className="flex items-center space-x-1 order-1 sm:order-2">
        {/* Botón anterior */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-2 py-1 text-xs sm:px-3 sm:py-2 sm:text-sm"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <span className="hidden sm:inline ml-1">Anterior</span>
        </Button>

        {/* Números de página */}
        <div className="flex items-center space-x-1">
          {visiblePages.map((page, index) => (
            <div key={index}>
              {page === '...' ? (
                <span className="px-2 py-1 text-roda-gray-400 text-xs sm:px-3 sm:py-2 sm:text-sm">
                  ...
                </span>
              ) : (
                <Button
                  variant={currentPage === page ? "primary" : "outline"}
                  size="sm"
                  onClick={() => onPageChange(page as number)}
                  className={`px-2 py-1 text-xs sm:px-3 sm:py-2 sm:text-sm min-w-[32px] sm:min-w-[40px] ${
                    currentPage === page 
                      ? '' 
                      : 'hover:bg-roda-gray-100'
                  }`}
                >
                  {page}
                </Button>
              )}
            </div>
          ))}
        </div>

        {/* Botón siguiente */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="px-2 py-1 text-xs sm:px-3 sm:py-2 sm:text-sm"
        >
          <span className="hidden sm:inline mr-1">Siguiente</span>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Button>
      </div>
    </div>
  );
}

interface PaginationControlsProps {
  currentPage: number;
  totalPages: number;
  totalItems?: number;
  itemsPerPage?: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  showAllOption?: boolean;
  onShowAll?: () => void;
  isShowingAll?: boolean;
  className?: string;
}

export function PaginationControls({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
  onPageSizeChange,
  showAllOption = false,
  onShowAll,
  isShowingAll = false,
  className = ''
}: PaginationControlsProps) {
  const pageSizeOptions = [10, 20, 50, 100];

  return (
    <div className={`flex flex-col lg:flex-row items-center justify-between space-y-4 lg:space-y-0 ${className}`}>
      {/* Controles de tamaño de página y mostrar todos */}
      <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-4">
        {onPageSizeChange && (
          <div className="flex items-center space-x-2">
            <label htmlFor="pageSize" className="text-sm text-roda-gray-600 whitespace-nowrap">
              Mostrar:
            </label>
            <select
              id="pageSize"
              value={itemsPerPage || 20}
              onChange={(e) => onPageSizeChange(parseInt(e.target.value))}
              className="px-2 py-1 text-sm border border-roda-gray-300 rounded-md bg-white text-roda-gray-900 focus:outline-none focus:ring-2 focus:ring-roda-yellow focus:border-transparent"
              disabled={isShowingAll}
            >
              {pageSizeOptions.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
            <span className="text-sm text-roda-gray-600 whitespace-nowrap">por página</span>
          </div>
        )}

        {showAllOption && onShowAll && (
          <Button
            variant={isShowingAll ? "primary" : "outline"}
            size="sm"
            onClick={onShowAll}
            className={`text-sm ${
              isShowingAll 
                ? '' 
                : 'hover:bg-roda-gray-100'
            }`}
          >
            {isShowingAll ? 'Mostrar paginado' : 'Mostrar todos'}
          </Button>
        )}
      </div>

      {/* Paginación */}
      {!isShowingAll && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalItems}
          itemsPerPage={itemsPerPage}
          onPageChange={onPageChange}
          showInfo={false}
        />
      )}

      {/* Información de resultados */}
      {totalItems && (
        <div className="text-sm text-roda-gray-600 order-first lg:order-last">
          {isShowingAll ? (
            `Mostrando todos los ${totalItems} resultados`
          ) : (
            `${totalItems} resultado${totalItems !== 1 ? 's' : ''} en total`
          )}
        </div>
      )}
    </div>
  );
}
