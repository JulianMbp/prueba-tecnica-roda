'use client';

import { StatusBadge } from '@/components/ui/Badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Client, PaymentSummary } from '@/services/api';

interface ClientInfoProps {
  client: Client;
  summary: PaymentSummary;
  estadoActual: 'al_dia' | 'en_mora';
}

export function ClientInfo({ client, summary, estadoActual }: ClientInfoProps) {
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
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl">{client.nombre}</CardTitle>
            <p className="text-roda-gray-600 mt-1">
              {client.tipo_doc} {client.num_doc}
            </p>
            {client.ciudad && (
              <p className="text-sm text-roda-gray-500">
                📍 {client.ciudad}
              </p>
            )}
          </div>
          <StatusBadge status={estadoActual} />
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Información básica */}
          <div className="space-y-2">
            <h4 className="font-medium text-roda-gray-900">Información del Cliente</h4>
            <div className="text-sm text-roda-gray-600 space-y-1">
              <p><strong>ID:</strong> {client.cliente_id}</p>
              <p><strong>Registro:</strong> {formatDate(client.created_at)}</p>
            </div>
          </div>

          {/* Resumen financiero */}
          <div className="space-y-2">
            <h4 className="font-medium text-roda-gray-900">Resumen Financiero</h4>
            <div className="text-sm text-roda-gray-600 space-y-1">
              <p><strong>Total Cuotas:</strong> {summary.total_cuotas}</p>
              <p><strong>Cuotas Pagadas:</strong> {summary.cuotas_pagadas}</p>
              <p><strong>Cuotas Pendientes:</strong> {summary.cuotas_pendientes}</p>
              {summary.cuotas_vencidas > 0 && (
                <p className="text-roda-error">
                  <strong>Cuotas Vencidas:</strong> {summary.cuotas_vencidas}
                </p>
              )}
            </div>
          </div>

          {/* Montos */}
          <div className="space-y-2">
            <h4 className="font-medium text-roda-gray-900">Montos</h4>
            <div className="text-sm text-roda-gray-600 space-y-1">
              <p><strong>Total:</strong> {formatCurrency(summary.total_monto)}</p>
              <p><strong>Pagado:</strong> {formatCurrency(summary.monto_pagado)}</p>
              <p><strong>Pendiente:</strong> {formatCurrency(summary.monto_pendiente)}</p>
              <div className="mt-2">
                <div className="flex justify-between text-xs text-roda-gray-500 mb-1">
                  <span>Progreso</span>
                  <span>{summary.porcentaje_pagado ? summary.porcentaje_pagado.toFixed(1) : '0.0'}%</span>
                </div>
                <div className="w-full bg-roda-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-300 ${
                      (summary.porcentaje_pagado || 0) >= 80
                        ? 'bg-roda-success'
                        : (summary.porcentaje_pagado || 0) >= 50
                        ? 'bg-roda-warning'
                        : 'bg-roda-error'
                    }`}
                    style={{ width: `${Math.min(summary.porcentaje_pagado || 0, 100)}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
