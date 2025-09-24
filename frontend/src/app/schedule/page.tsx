'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function SchedulePage() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const [schedules, setSchedules] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Si no está autenticado, redirigir al login
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    const fetchSchedules = async () => {
      try {
        // En una implementación real, aquí llamarías a un endpoint específico
        // Para ahora, mostraremos un mensaje de que esta funcionalidad está en desarrollo
        setIsLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al cargar cronogramas');
        setIsLoading(false);
      }
    };

    fetchSchedules();
  }, [isAuthenticated, router]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="text-center py-8">
          <h1 className="text-3xl font-bold text-roda-black mb-4">
            Cronogramas de Pago
          </h1>
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-roda-yellow"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto space-y-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-3 text-roda-error">
              <svg className="w-6 h-6 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="font-medium">{error}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center py-8">
        <h1 className="text-3xl font-bold text-roda-black mb-4">
          Cronogramas de Pago
        </h1>
        <p className="text-lg text-roda-gray-600 max-w-2xl mx-auto">
          Vista general de todos los cronogramas de pago del sistema
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
              Esta sección estará disponible próximamente. Aquí podrás ver:
            </p>
            <ul className="text-left text-roda-gray-600 space-y-2 max-w-md mx-auto">
              <li className="flex items-center space-x-2">
                <span className="w-2 h-2 bg-roda-yellow rounded-full"></span>
                <span>Cronogramas de todos los clientes</span>
              </li>
              <li className="flex items-center space-x-2">
                <span className="w-2 h-2 bg-roda-yellow rounded-full"></span>
                <span>Filtros por fecha y estado</span>
              </li>
              <li className="flex items-center space-x-2">
                <span className="w-2 h-2 bg-roda-yellow rounded-full"></span>
                <span>Exportación de reportes</span>
              </li>
              <li className="flex items-center space-x-2">
                <span className="w-2 h-2 bg-roda-yellow rounded-full"></span>
                <span>Alertas de vencimiento</span>
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
