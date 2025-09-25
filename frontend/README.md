# 🚀 Frontend - Sistema de Cronograma de Pagos

Aplicación web moderna desarrollada con Next.js 15, React 19 y TypeScript para la gestión de cronogramas de pagos de e-bikes y e-mopeds.

## 📋 Stack Tecnológico

- **Next.js 15** - Framework React con Turbopack
- **React 19** - Librería de interfaces de usuario
- **TypeScript** - JavaScript con tipado estático
- **Tailwind CSS 4** - Framework de CSS utilitario
- **Recharts** - Gráficas y visualizaciones
- **date-fns** - Utilidades de fechas

## 📁 Estructura de Carpetas

```tree
src/
├── app/                    # App Router de Next.js
│   ├── credits/           # Página de créditos
│   ├── login/             # Página de login
│   ├── payments/          # Página de pagos
│   ├── schedule/          # Página de cronograma
│   └── layout.tsx         # Layout principal
│
├── components/            # Componentes reutilizables
│   ├── charts/           # Componentes de gráficas
│   ├── export/           # Botones de exportación
│   ├── filters/          # Paneles de filtros
│   ├── layout/           # Componentes de layout
│   ├── search/           # Componentes de búsqueda
│   └── ui/               # Componentes básicos de UI
│
├── config/               # Configuraciones
│   └── api.ts            # Configuración de API
│
├── contexts/             # Contextos de React
│   └── AuthContext.tsx   # Contexto de autenticación
│
├── services/             # Servicios de API
│   └── api/              # Servicios organizados por entidad
│
└── utils/                # Utilidades y helpers
    └── exportUtils.ts    # Utilidades de exportación
```

## ⚡ Instalación y Ejecución

```bash
# Instalar dependencias
npm install

# Ejecutar en desarrollo
npm run dev

# Construir para producción
npm run build

# Ejecutar en producción
npm run start

# Linter
npm run lint
```

## 🌐 URLs de la Aplicación

- **Desarrollo**: <http://localhost:3000>
- **Login**: <http://localhost:3000/login>
- **Cronograma**: <http://localhost:3000/schedule>
- **Pagos**: <http://localhost:3000/payments>
- **Créditos**: <http://localhost:3000/credits>

## 🔧 Configuración

Crear archivo `.env.local`:

```bash
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## 📱 Funcionalidades

- 🔐 **Autenticación** - Login de repartidores
- 📊 **Dashboard** - Vista general del cronograma
- 📈 **Gráficas** - Visualizaciones interactivas
- 🔍 **Filtros** - Búsqueda y filtrado avanzado
- 📄 **Exportación** - PDF
- 📱 **Responsive** - Adaptable a todos los dispositivos

---

### Desarrollado con ❤️ usando las últimas tecnologías web
