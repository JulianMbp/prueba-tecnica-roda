'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';

// Colores de la paleta Roda
const RODA_COLORS = {
  primary: '#EBFF00',
  secondary: '#C6F833',
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  neutral: '#6B7280',
  dark: '#0C0D0D'
};

const CHART_COLORS = [
  RODA_COLORS.primary,
  RODA_COLORS.secondary,
  RODA_COLORS.success,
  RODA_COLORS.warning,
  RODA_COLORS.error,
  RODA_COLORS.neutral
];

interface ChartCardProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
}

function ChartCard({ title, subtitle, children, className = "" }: ChartCardProps) {
  return (
    <Card className={`${className}`}>
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold text-roda-gray-900">
          {title}
        </CardTitle>
        {subtitle && (
          <p className="text-sm text-roda-gray-600 mt-1">{subtitle}</p>
        )}
      </CardHeader>
      <CardContent>
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <div style={{ width: '100%', height: '100%' }}>
              {children}
            </div>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

interface PaymentStatusChartProps {
  data: Array<{
    estado: string;
    cantidad: number;
    monto?: number;
  }>;
}

export function PaymentStatusChart({ data }: PaymentStatusChartProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  // Asegurar que hay datos para mostrar
  const chartData = data && data.length > 0 ? data : [
    { estado: 'Sin datos', cantidad: 0 }
  ];

  return (
    <ChartCard 
      title="Estado de Cuotas" 
      subtitle="Distribución por estado de pago"
    >
      <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis 
          dataKey="estado" 
          tick={{ fill: '#374151', fontSize: 12 }}
          axisLine={{ stroke: '#d1d5db' }}
        />
        <YAxis 
          tick={{ fill: '#374151', fontSize: 12 }}
          axisLine={{ stroke: '#d1d5db' }}
        />
        <Tooltip 
          contentStyle={{
            backgroundColor: 'white',
            border: '1px solid #d1d5db',
            borderRadius: '6px',
            fontSize: '12px'
          }}
          formatter={(value: number, name: string) => [
            name === 'monto' ? formatCurrency(value) : value,
            name === 'monto' ? 'Monto' : 'Cantidad'
          ]}
        />
        <Legend />
        <Bar 
          dataKey="cantidad" 
          fill={RODA_COLORS.primary} 
          name="Cantidad" 
          radius={[4, 4, 0, 0]} 
        />
        {data && data.some(item => item.monto) && (
          <Bar 
            dataKey="monto" 
            fill={RODA_COLORS.primary} 
            name="Monto" 
            radius={[4, 4, 0, 0]} 
          />
        )}
      </BarChart>
    </ChartCard>
  );
}

interface ProductDistributionChartProps {
  data: Array<{
    producto: string;
    cantidad: number;
    porcentaje: number;
  }>;
}

export function ProductDistributionChart({ data }: ProductDistributionChartProps) {
  const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{ payload: { producto: string; cantidad: number; porcentaje: number } }> }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900">{data.producto}</p>
          <p className="text-sm text-gray-600">
            Cantidad: <span className="font-medium">{data.cantidad}</span>
          </p>
          <p className="text-sm text-gray-600">
            Porcentaje: <span className="font-medium">{data.porcentaje}%</span>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <ChartCard 
      title="Distribución de Productos" 
      subtitle="Porcentaje por tipo de producto"
    >
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={({ producto, porcentaje }) => `${producto} (${porcentaje}%)`}
          outerRadius={100}
          fill="#8884d8"
          dataKey="cantidad"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
      </PieChart>
    </ChartCard>
  );
}

interface PaymentTimelineChartProps {
  data: Array<{
    fecha: string;
    pagos: number;
    vencimientos: number;
    monto_pagado: number;
    monto_vencido: number;
  }>;
}

export function PaymentTimelineChart({ data }: PaymentTimelineChartProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  // Asegurar que hay datos para mostrar
  const chartData = data && data.length > 0 ? data : [
    { fecha: 'Sin datos', pagos: 0, vencimientos: 0, monto_pagado: 0, monto_vencido: 0 }
  ];

  return (
    <ChartCard 
      title="Línea de Tiempo de Pagos" 
      subtitle="Evolución de pagos y vencimientos"
    >
      <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis 
          dataKey="fecha" 
          tick={{ fill: '#374151', fontSize: 12 }}
          axisLine={{ stroke: '#d1d5db' }}
        />
        <YAxis 
          tick={{ fill: '#374151', fontSize: 12 }}
          axisLine={{ stroke: '#d1d5db' }}
        />
        <Tooltip 
          contentStyle={{
            backgroundColor: 'white',
            border: '1px solid #d1d5db',
            borderRadius: '6px',
            fontSize: '12px'
          }}
          formatter={(value: number, name: string) => [
            name.includes('monto') ? formatCurrency(value) : value,
            name === 'pagos' ? 'Pagos' : 
            name === 'vencimientos' ? 'Vencimientos' :
            name === 'monto_pagado' ? 'Monto Pagado' : 'Monto Vencido'
          ]}
        />
        <Legend />
        <Line 
          type="monotone" 
          dataKey="pagos" 
          stroke={RODA_COLORS.success} 
          strokeWidth={3}
          name="Pagos"
          dot={{ fill: RODA_COLORS.success, strokeWidth: 2, r: 4 }}
        />
        <Line 
          type="monotone" 
          dataKey="vencimientos" 
          stroke={RODA_COLORS.error} 
          strokeWidth={3}
          name="Vencimientos"
          dot={{ fill: RODA_COLORS.error, strokeWidth: 2, r: 4 }}
        />
      </LineChart>
    </ChartCard>
  );
}

interface MonthlyTrendChartProps {
  data: Array<{
    mes: string;
    ingresos: number;
    cuotas_pagadas: number;
    cuotas_vencidas: number;
  }>;
}

export function MonthlyTrendChart({ data }: MonthlyTrendChartProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <ChartCard 
      title="Tendencia Mensual" 
      subtitle="Ingresos y cuotas por mes"
    >
      <AreaChart data={data}>
        <defs>
          <linearGradient id="colorIngresos" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={RODA_COLORS.primary} stopOpacity={0.8}/>
            <stop offset="95%" stopColor={RODA_COLORS.primary} stopOpacity={0.1}/>
          </linearGradient>
          <linearGradient id="colorCuotas" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={RODA_COLORS.secondary} stopOpacity={0.8}/>
            <stop offset="95%" stopColor={RODA_COLORS.secondary} stopOpacity={0.1}/>
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis 
          dataKey="mes" 
          tick={{ fill: '#374151', fontSize: 12 }}
          axisLine={{ stroke: '#d1d5db' }}
        />
        <YAxis 
          tick={{ fill: '#374151', fontSize: 12 }}
          axisLine={{ stroke: '#d1d5db' }}
        />
        <Tooltip 
          contentStyle={{
            backgroundColor: 'white',
            border: '1px solid #d1d5db',
            borderRadius: '6px',
            fontSize: '12px'
          }}
          formatter={(value: number, name: string) => [
            name === 'ingresos' ? formatCurrency(value) : value,
            name === 'ingresos' ? 'Ingresos' : 
            name === 'cuotas_pagadas' ? 'Cuotas Pagadas' : 'Cuotas Vencidas'
          ]}
        />
        <Legend />
        <Area 
          type="monotone" 
          dataKey="ingresos" 
          stroke={RODA_COLORS.primary} 
          fillOpacity={1} 
          fill="url(#colorIngresos)"
          name="Ingresos"
        />
        <Area 
          type="monotone" 
          dataKey="cuotas_pagadas" 
          stroke={RODA_COLORS.secondary} 
          fillOpacity={1} 
          fill="url(#colorCuotas)"
          name="Cuotas Pagadas"
        />
      </AreaChart>
    </ChartCard>
  );
}

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  icon?: React.ReactNode;
  color?: 'primary' | 'success' | 'warning' | 'error';
}

export function MetricCard({ 
  title, 
  value, 
  subtitle, 
  trend, 
  icon, 
  color = 'primary' 
}: MetricCardProps) {
  const colorClasses = {
    primary: 'border-roda-yellow bg-roda-yellow/5',
    success: 'border-green-500 bg-green-50',
    warning: 'border-yellow-500 bg-yellow-50',
    error: 'border-red-500 bg-red-50'
  };

  const iconColors = {
    primary: 'text-roda-yellow',
    success: 'text-green-500',
    warning: 'text-yellow-500',
    error: 'text-red-500'
  };

  return (
    <Card className={`border-l-4 ${colorClasses[color]}`}>
      <CardContent className="p-3 sm:p-4 lg:p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <p className="text-xs sm:text-sm font-medium text-roda-gray-600 uppercase tracking-wide truncate">
              {title}
            </p>
            <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-roda-gray-900 mt-1 sm:mt-2">
              {value}
            </p>
            {subtitle && (
              <p className="text-xs sm:text-sm text-roda-gray-500 mt-1 truncate">{subtitle}</p>
            )}
            {trend && (
              <div className="flex items-center mt-1 sm:mt-2">
                <svg 
                  className={`w-3 h-3 sm:w-4 sm:h-4 mr-1 ${trend.isPositive ? 'text-green-500' : 'text-red-500'}`}
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d={trend.isPositive ? "M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" : "M13 17h8m0 0V9m0 8l-8-8-4 4-6-6"} 
                  />
                </svg>
                <span className={`text-xs sm:text-sm font-medium ${trend.isPositive ? 'text-green-600' : 'text-red-600'}`}>
                  {trend.value}%
                </span>
              </div>
            )}
          </div>
          {icon && (
            <div className={`text-lg sm:text-xl lg:text-3xl ${iconColors[color]} flex-shrink-0 ml-2`}>
              <div className="scale-75 sm:scale-90 lg:scale-100">
                {icon}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
