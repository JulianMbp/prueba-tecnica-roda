'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function PaymentsPage() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Si no está autenticado, redirigir al login
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);
  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center py-8">
        <h1 className="text-3xl font-bold text-roda-black mb-4">
          Gestión de Pagos
        </h1>
        <p className="text-lg text-roda-gray-600 max-w-2xl mx-auto">
          Registra, consulta y administra todos los pagos realizados por los clientes
        </p>
      </div>

      {/* Coming Soon Message */}
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-center">🚧 En Desarrollo</CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <div className="space-y-4">
            <p className="text-roda-gray-600">
              Esta sección estará disponible próximamente. Aquí podrás:
            </p>
            <ul className="text-left text-roda-gray-600 space-y-2 max-w-md mx-auto">
              <li className="flex items-center space-x-2">
                <span className="w-2 h-2 bg-roda-yellow rounded-full"></span>
                <span>Registrar nuevos pagos</span>
              </li>
              <li className="flex items-center space-x-2">
                <span className="w-2 h-2 bg-roda-yellow rounded-full"></span>
                <span>Historial de pagos por cliente</span>
              </li>
              <li className="flex items-center space-x-2">
                <span className="w-2 h-2 bg-roda-yellow rounded-full"></span>
                <span>Reportes de recaudación</span>
              </li>
              <li className="flex items-center space-x-2">
                <span className="w-2 h-2 bg-roda-yellow rounded-full"></span>
                <span>Análisis de métodos de pago</span>
              </li>
              <li className="flex items-center space-x-2">
                <span className="w-2 h-2 bg-roda-yellow rounded-full"></span>
                <span>Alertas de pagos pendientes</span>
              </li>
            </ul>
            <div className="pt-4">
              <a 
                href="/" 
                className="inline-flex items-center px-4 py-2 bg-roda-yellow text-roda-black rounded-md hover:bg-roda-green transition-colors"
              >
                Volver a la búsqueda
              </a>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
