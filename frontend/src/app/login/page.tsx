'use client';

import { ClientSearchForm } from '@/components/search/ClientSearchForm';
import { ClientInfo, useAuth } from '@/contexts/AuthContext';
import { clientService } from '@/services/api';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { login } = useAuth();
  const router = useRouter();

  const handleSearch = async (numDoc: string, tipoDoc: string) => {
    setIsLoading(true);
    setError(null);

    try {
      // Buscar cliente básico
      const client = await clientService.searchClientByDocument(numDoc, tipoDoc);
      
      // Hacer login con la información del cliente
      const clientInfo: ClientInfo = {
        cliente_id: client.cliente_id,
        tipo_doc: client.tipo_doc,
        num_doc: client.num_doc,
        nombre: client.nombre,
        ciudad: client.ciudad,
      };
      
      login(clientInfo);

      // Redirigir al dashboard principal
      router.push('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al buscar el cliente');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-roda-gray-900 via-roda-black to-roda-dark flex items-center justify-center p-4">
      {/* Patrón de fondo sutil */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(235,255,0,0.1),transparent_50%)]"></div>
      
      <div className="w-full max-w-md relative z-10">
        {/* Logo y título */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-roda-yellow mb-3 drop-shadow-lg">
            Roda
          </h1>
          <p className="text-roda-gray-200 text-xl font-medium">
            Cronograma de Pagos
          </p>
        </div>

        {/* Formulario de búsqueda con sombra mejorada */}
        <div className="bg-roda-white rounded-2xl shadow-2xl p-8 border border-roda-gray-200/20 backdrop-blur-sm">
          <ClientSearchForm onSearch={handleSearch} isLoading={isLoading} />
        </div>

        {/* Error message */}
        {error && (
          <div className="mt-6 p-4 bg-roda-error/10 border border-roda-error/30 rounded-xl backdrop-blur-sm">
            <div className="flex items-center space-x-3 text-roda-error">
              <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="font-medium">{error}</p>
            </div>
          </div>
        )}

        {/* Información adicional */}
        <div className="mt-8 text-center">
          <p className="text-roda-gray-300 text-sm leading-relaxed">
            Ingresa tu número de documento para acceder a tu cronograma de pagos
          </p>
        </div>
      </div>
    </div>
  );
}
