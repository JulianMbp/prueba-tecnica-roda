'use client';

import { Button } from '@/components/ui/Button';
import { ExportData, ExportOptions, exportData, shareData } from '@/utils/exportUtils';
import { useState } from 'react';

interface ExportButtonProps {
  data: ExportData;
  disabled?: boolean;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function ExportButton({ 
  data, 
  disabled = false, 
  className = "",
  size = 'md' 
}: ExportButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async (options: ExportOptions) => {
    setIsExporting(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 100)); // Pequeña pausa para UX
      exportData(data, options);
    } catch (error) {
      console.error('Error al exportar:', error);
    } finally {
      setIsExporting(false);
      setIsOpen(false);
    }
  };

  const handleShare = (method: 'whatsapp' | 'email') => {
    shareData(data, method);
    setIsOpen(false);
  };

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base'
  };

  return (
    <div className="relative inline-block">
      {/* Botón principal */}
      <Button
        onClick={() => setIsOpen(!isOpen)}
        disabled={disabled || isExporting}
        className={`${sizeClasses[size]} ${className} flex items-center space-x-2`}
        variant="outline"
      >
        {isExporting ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-roda-yellow"></div>
            <span>Exportando...</span>
          </>
        ) : (
          <>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-4-4m4 4l4-4m3 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Exportar</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </>
        )}
      </Button>

      {/* Menú desplegable */}
      {isOpen && !isExporting && (
        <>
          {/* Overlay para cerrar */}
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          ></div>
          
          {/* Menú */}
          <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-roda-gray-200 z-20">
            <div className="p-2">
              <div className="px-3 py-2 text-xs font-semibold text-roda-gray-500 uppercase tracking-wide border-b border-roda-gray-100">
                Exportar como
              </div>
              
              {/* Opciones de exportación */}
              <div className="mt-2 space-y-1">
                <button
                  onClick={() => handleExport({ format: 'pdf', orientation: 'portrait' })}
                  className="w-full text-left px-3 py-2 text-sm text-roda-gray-700 hover:bg-roda-gray-50 rounded-md flex items-center space-x-3"
                >
                  <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                  <div>
                    <p className="font-medium">PDF</p>
                    <p className="text-xs text-roda-gray-500">Reporte completo con formato</p>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

interface QuickExportButtonProps {
  data: ExportData;
  format: 'pdf' | 'excel' | 'csv';
  disabled?: boolean;
  className?: string;
  children?: React.ReactNode;
}

export function QuickExportButton({ 
  data, 
  format, 
  disabled = false, 
  className = "",
  children 
}: QuickExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 100));
      exportData(data, { format });
    } catch (error) {
      console.error('Error al exportar:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const formatIcons = {
    pdf: (
      <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
      </svg>
    ),
    excel: (
      <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
    csv: (
      <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    )
  };

  return (
    <Button
      onClick={handleExport}
      disabled={disabled || isExporting}
      variant="outline"
      className={`flex items-center space-x-2 ${className}`}
    >
      {isExporting ? (
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-roda-yellow"></div>
      ) : (
        formatIcons[format]
      )}
      <span>
        {children || (isExporting ? 'Exportando...' : format.toUpperCase())}
      </span>
    </Button>
  );
}
