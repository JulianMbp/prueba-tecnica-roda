'use client';

import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useState } from 'react';

interface ClientSearchFormProps {
  onSearch: (numDoc: string, tipoDoc: string) => void;
  isLoading?: boolean;
}

export function ClientSearchForm({ onSearch, isLoading = false }: ClientSearchFormProps) {
  const [numDoc, setNumDoc] = useState('');
  const [tipoDoc, setTipoDoc] = useState('CC');
  const [error, setError] = useState('');

  const documentTypes = [
    { value: 'CC', label: 'Cédula de Ciudadanía' },
    { value: 'CE', label: 'Cédula de Extranjería' },
    { value: 'TI', label: 'Tarjeta de Identidad' },
    { value: 'PP', label: 'Pasaporte' },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!numDoc.trim()) {
      setError('Por favor ingresa el número de documento');
      return;
    }

    if (numDoc.length < 6) {
      setError('El número de documento debe tener al menos 6 caracteres');
      return;
    }

    onSearch(numDoc.trim(), tipoDoc);
  };

  const handleNumDocChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, ''); // Solo números
    setNumDoc(value);
    setError('');
  };

  return (
    <div className="w-full">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-roda-black mb-2">
          Buscar Cliente
        </h2>
        <p className="text-roda-gray-600">
          Ingresa el número de documento para consultar el cronograma de pagos
        </p>
      </div>
      
      <div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-roda-gray-700 mb-2">
              Tipo de Documento
            </label>
            <select
              value={tipoDoc}
              onChange={(e) => setTipoDoc(e.target.value)}
              className="block w-full px-3 py-2 border border-roda-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-roda-yellow focus:border-roda-yellow"
            >
              {documentTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          <Input
            label="Número de Documento"
            type="text"
            value={numDoc}
            onChange={handleNumDocChange}
            placeholder="Ej: 10000001"
            error={error}
            helperText="Solo se permiten números"
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
              </svg>
            }
          />

          <Button
            type="submit"
            className="w-full py-3 text-base font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
            isLoading={isLoading}
            disabled={!numDoc.trim() || isLoading}
          >
            {isLoading ? 'Buscando...' : 'Buscar Cliente'}
          </Button>
        </form>

        <div className="mt-6 p-4 bg-roda-gray-50 rounded-lg border border-roda-gray-200">
          <h4 className="text-sm font-medium text-roda-gray-900 mb-2">
            Tipos de documento soportados:
          </h4>
          <ul className="text-xs text-roda-gray-600 space-y-1">
            <li>• <strong>CC:</strong> Cédula de Ciudadanía</li>
            <li>• <strong>CE:</strong> Cédula de Extranjería</li>
            <li>• <strong>TI:</strong> Tarjeta de Identidad</li>
            <li>• <strong>PP:</strong> Pasaporte</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
