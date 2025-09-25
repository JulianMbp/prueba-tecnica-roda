'use client';

import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { ReactNode } from 'react';

interface FilterPanelProps {
  title?: string;
  children: ReactNode;
  onApply: () => void;
  onClear: () => void;
  onReset: () => void;
  isLoading?: boolean;
  className?: string;
}

export function FilterPanel({
  title = "Filtros",
  children,
  onApply,
  onClear,
  onReset,
  isLoading = false,
  className = ""
}: FilterPanelProps) {
  return (
    <Card className={`mb-6 ${className}`}>
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold text-roda-gray-900 flex items-center">
          <svg className="w-5 h-5 mr-2 text-roda-yellow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.207A1 1 0 013 6.5V4z" />
          </svg>
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {children}
          
          {/* Filter Actions */}
          <div className="flex flex-wrap gap-3 pt-4 border-t border-roda-gray-200">
            <Button 
              onClick={onApply} 
              disabled={isLoading}
              className="flex-1 min-w-[120px]"
            >
              {isLoading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Aplicando...
                </div>
              ) : (
                <div className="flex items-center">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  Aplicar Filtros
                </div>
              )}
            </Button>
            
            <Button 
              onClick={onClear} 
              variant="outline"
              disabled={isLoading}
              className="flex-1 min-w-[120px]"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Limpiar
            </Button>
            
            <Button 
              onClick={onReset} 
              variant="outline"
              disabled={isLoading}
              className="min-w-[100px]"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Reset
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface DateRangeFilterProps {
  startDate: string;
  endDate: string;
  onStartDateChange: (date: string) => void;
  onEndDateChange: (date: string) => void;
  label?: string;
}

export function DateRangeFilter({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  label = "Rango de Fechas"
}: DateRangeFilterProps) {
  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-roda-gray-700">
        {label}
      </label>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs text-roda-gray-500 mb-1">Desde</label>
          <Input
            type="date"
            value={startDate}
            onChange={(e) => onStartDateChange(e.target.value)}
            className="w-full"
          />
        </div>
        <div>
          <label className="block text-xs text-roda-gray-500 mb-1">Hasta</label>
          <Input
            type="date"
            value={endDate}
            onChange={(e) => onEndDateChange(e.target.value)}
            className="w-full"
          />
        </div>
      </div>
    </div>
  );
}

interface SelectFilterProps {
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string }>;
  label: string;
  placeholder?: string;
}

export function SelectFilter({
  value,
  onChange,
  options,
  label,
  placeholder = "Seleccionar..."
}: SelectFilterProps) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-roda-gray-700">
        {label}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 border border-roda-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-roda-yellow focus:border-transparent bg-white"
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}

interface SearchFilterProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label: string;
}

export function SearchFilter({
  value,
  onChange,
  placeholder = "Buscar...",
  label
}: SearchFilterProps) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-roda-gray-700">
        {label}
      </label>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg className="h-5 w-5 text-roda-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <Input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="pl-10"
        />
      </div>
    </div>
  );
}
