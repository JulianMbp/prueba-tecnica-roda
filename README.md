# 🚀 Sistema de Cronograma de Pagos - E-bikes & E-mopeds

Sistema completo para la gestión de cronogramas de pagos de vehículos eléctricos, compuesto por un backend robusto en Django y un frontend moderno en Next.js.

## 🏗️ Arquitectura del Sistema

```text
📦 Proyecto
├── 🗄️ Backend (Django + PostgreSQL)
│   ├── API REST con DRF
│   ├── Arquitectura Hexagonal
│   ├── Docker Compose
│   └── Seeder con datos sintéticos
└── 🌐 Frontend (Next.js + TypeScript)
    ├── App Router (Next.js 15)
    ├── Componentes reutilizables
    ├── Gráficas interactivas
    └── Exportación Excel/PDF
```

## ⚡ Instalación Rápida

### 🐳 Backend (Docker)

```bash
cd backend/
docker-compose up -d
docker-compose exec web python manage.py load_sample_data --clear
```

**API disponible en:** <http://localhost:8000>

### 🌐 Frontend

```bash
cd frontend/
npm install
echo "NEXT_PUBLIC_API_URL=http://localhost:8000" > .env.local
npm run dev
```

**App disponible en:** <http://localhost:3000>

## 🤔 Decisiones Arquitectónicas

### ¿Por qué Django vs Flask/FastAPI?

**✅ Django elegido por:**

- **Ecosistema maduro**: ORM robusto, admin panel, migraciones automáticas
- **Batteries included**: Autenticación, serializers, validaciones out-of-the-box
- **Django REST Framework**: API potente con paginación, filtros, y serialización automática
- **Arquitectura escalable**: Separación clara de responsabilidades con apps modulares
- **PostgreSQL nativo**: Soporte completo para consultas complejas y relaciones

**❌ Flask/FastAPI descartados:**

- **Flask**: Requiere muchas librerías adicionales para funcionalidad básica
- **FastAPI**: Más moderno pero menos maduro para sistemas complejos con relaciones

### ¿Por qué Next.js vs React puro?

**✅ Next.js elegido por:**

- **App Router**: Arquitectura moderna con layouts anidados y loading states
- **Server Components**: Mejor performance y SEO
- **File-based routing**: Organización intuitiva de páginas
- **Built-in optimizations**: Imágenes, fonts, y bundle splitting automático
- **TypeScript nativo**: Soporte completo sin configuración adicional
- **Deployment simplificado**: Optimizado para Vercel y otros providers

**❌ React puro descartado:**

- Requiere configurar manualmente: routing, bundling, optimizaciones
- Sin SSR/SSG out-of-the-box
- Más setup inicial para TypeScript y tooling

## ⚖️ Trade-offs Principales

### Backend

| **Pros** | **Contras** |
|----------|-------------|
| ✅ Desarrollo rápido con Django Admin | ❌ Mayor overhead que FastAPI |
| ✅ ORM potente para consultas complejas | ❌ Curva de aprendizaje alta |
| ✅ Arquitectura hexagonal escalable | ❌ Más verboso que Flask |
| ✅ Docker para consistencia | ❌ Startup time más lento |

### Frontend

| **Pros** | **Contras** |
|----------|-------------|
| ✅ Performance superior con SSR | ❌ Bundle size mayor que React puro |
| ✅ Developer Experience excelente | ❌ Vendor lock-in con Vercel |
| ✅ Optimizaciones automáticas | ❌ Más complejo para casos simples |
| ✅ Routing y layouts intuitivos | ❌ Breaking changes entre versiones |

## 🏛️ Arquitectura Técnica

### Backend - Arquitectura Hexagonal

```text
├── 🎯 Domain (Entities, Repositories)
├── 🔧 Application (Use Cases, Services)
├── 🌐 Infrastructure (DB, API, Serializers)
└── 🎮 Presentación (Views, URLs)
```

### Frontend - Arquitectura por Capas

```text
├── 📱 Pages (App Router)
├── 🧩 Components (Reutilizables)
├── 🔄 Services (API Clients)
├── 🗃️ Contexts (Estado Global)
└── 🛠️ Utils (Helpers)
```

## 📊 Tecnologías Utilizadas

**Backend:**

- Django 5.0 + DRF
- PostgreSQL 15
- Docker + Docker Compose
- Python 3.11

**Frontend:**

- Next.js 15 + Turbopack
- React 19 + TypeScript
- Tailwind CSS 4
- Recharts + date-fns

## 🎯 Funcionalidades Principales

- 🔍 **Búsqueda de clientes** por documento
- 📋 **Cronogramas completos** con estados dinámicos
- 📊 **Gráficas interactivas** de pagos y tendencias
- 📄 **Exportación** a Excel y PDF
- 🔐 **Autenticación** de repartidores
- 📱 **Responsive design** para móviles
- 🎨 **UI moderna** con componentes reutilizables

## 🚀 Para Producción

```bash
# Backend
docker-compose -f docker-compose.prod.yml up -d

# Frontend
npm run build && npm start
```

---

**💡 Sistema diseñado para escalabilidad, mantenibilidad y excelente developer experience.**
