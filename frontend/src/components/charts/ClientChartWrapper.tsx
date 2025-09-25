'use client';

import dynamic from 'next/dynamic';

// Importar dinámicamente los componentes de gráficos para evitar problemas de SSR
const PaymentStatusChart = dynamic(
  () => import('./ChartComponents').then(mod => ({ default: mod.PaymentStatusChart })),
  { 
    ssr: false,
    loading: () => (
      <div className="h-80 w-full bg-gray-50 rounded-lg flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-roda-yellow mx-auto mb-2"></div>
          <p className="text-sm text-gray-600">Cargando gráfico...</p>
        </div>
      </div>
    )
  }
);

const PaymentTimelineChart = dynamic(
  () => import('./ChartComponents').then(mod => ({ default: mod.PaymentTimelineChart })),
  { 
    ssr: false,
    loading: () => (
      <div className="h-80 w-full bg-gray-50 rounded-lg flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-roda-yellow mx-auto mb-2"></div>
          <p className="text-sm text-gray-600">Cargando gráfico...</p>
        </div>
      </div>
    )
  }
);

const ProductDistributionChart = dynamic(
  () => import('./ChartComponents').then(mod => ({ default: mod.ProductDistributionChart })),
  { 
    ssr: false,
    loading: () => (
      <div className="h-80 w-full bg-gray-50 rounded-lg flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-roda-yellow mx-auto mb-2"></div>
          <p className="text-sm text-gray-600">Cargando gráfico...</p>
        </div>
      </div>
    )
  }
);

const MonthlyTrendChart = dynamic(
  () => import('./ChartComponents').then(mod => ({ default: mod.MonthlyTrendChart })),
  { 
    ssr: false,
    loading: () => (
      <div className="h-80 w-full bg-gray-50 rounded-lg flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-roda-yellow mx-auto mb-2"></div>
          <p className="text-sm text-gray-600">Cargando gráfico...</p>
        </div>
      </div>
    )
  }
);

// Exportar los componentes con dynamic import
export {
    MonthlyTrendChart as DynamicMonthlyTrendChart, PaymentStatusChart as DynamicPaymentStatusChart,
    PaymentTimelineChart as DynamicPaymentTimelineChart,
    ProductDistributionChart as DynamicProductDistributionChart
};

