# 🚀 Roda Frontend - Cronograma de Pagos

Frontend moderno para la plataforma de cronograma de pagos de Roda, construido con Next.js 15, React 19, TypeScript y Tailwind CSS.

## 🎯 Características

- ✅ **Búsqueda de clientes** por número de documento
- ✅ **Cronograma de pagos** completo y detallado
- ✅ **Diseño responsive** optimizado para móviles
- ✅ **UI moderna** con paleta de colores Roda
- ✅ **Componentes reutilizables** y arquitectura modular
- ✅ **TypeScript** para mayor robustez
- ✅ **Tailwind CSS** para estilos consistentes

## 🎨 Paleta de Colores Roda

- **Negro**: `#000000`
- **Oscuro**: `#0C0D0D`
- **Blanco**: `#FFFFFF`
- **Amarillo**: `#EBFF00`
- **Verde**: `#C6F833`
- **Morado**: `#B794F6`

## 🏗️ Arquitectura

### Estructura de Componentes

```
src/
├── app/                    # Páginas de Next.js
│   ├── page.tsx           # Página principal (búsqueda)
│   ├── schedule/          # Cronogramas
│   ├── credits/           # Créditos
│   └── payments/          # Pagos
├── components/            # Componentes reutilizables
│   ├── layout/           # Header, Sidebar, Footer
│   ├── ui/               # Componentes base (Button, Input, Card, Badge)
│   └── search/           # Componentes de búsqueda
└── services/             # Servicios de API
    └── api/              # Cliente de API
```

### Componentes Principales

- **Header**: Barra superior con logo y navegación
- **Sidebar**: Navegación lateral colapsable
- **Footer**: Pie de página con información
- **ClientSearchForm**: Formulario de búsqueda por cédula
- **ClientInfo**: Información detallada del cliente
- **Button, Input, Card, Badge**: Componentes UI base

## 🚀 Instalación y Configuración

### Prerrequisitos

- Node.js 18+ 
- npm, yarn o pnpm
- Backend de Roda ejecutándose en `http://localhost:8000`

### Instalación

```bash
# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env.local

# Editar .env.local con la URL del backend
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

### Desarrollo

```bash
# Iniciar servidor de desarrollo
npm run dev

# Abrir en el navegador
open http://localhost:3000
```

### Producción

```bash
# Construir para producción
npm run build

# Iniciar servidor de producción
npm start
```

## 📱 Funcionalidades

### Página Principal (`/`)

- **Búsqueda por cédula**: Formulario para buscar clientes por documento
- **Información del cliente**: Datos básicos y resumen financiero
- **Cronograma de pagos**: Tabla completa con todas las cuotas
- **Estados visuales**: Badges de estado (al día, en mora, vencida, etc.)
- **Estadísticas**: Resumen de cuotas pagadas, pendientes y vencidas

### Páginas Futuras

- **`/schedule`**: Vista general de cronogramas
- **`/credits`**: Gestión de créditos
- **`/payments`**: Registro y consulta de pagos

## 🔧 Configuración

### Variables de Entorno

```env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

### Tailwind CSS

El proyecto usa Tailwind CSS v4 con configuración personalizada:

- Paleta de colores Roda
- Fuentes Geist Sans y Mono
- Animaciones personalizadas
- Responsive design

### TypeScript

- Configuración estricta
- Paths alias (`@/` para `src/`)
- Tipos para API y componentes

## 📡 Integración con Backend

### Endpoints Utilizados

- `GET /api/clientes/buscar_cliente/?num_doc={doc}&tipo_doc={type}`
- `GET /api/clientes/buscar_por_cedula/?num_doc={doc}&tipo_doc={type}`
- `GET /api/repartidor/cronograma_resumido/?cliente_id={id}`
- `GET /api/repartidor/estado_pago/?cliente_id={id}`

### Servicios

- **ClientService**: Manejo de todas las operaciones de cliente
- **Error Handling**: Manejo robusto de errores de API
- **Type Safety**: Interfaces TypeScript para todas las respuestas

## 🎨 Diseño y UX

### Principios de Diseño

- **Mobile First**: Diseño optimizado para dispositivos móviles
- **Accesibilidad**: Focus states, contraste adecuado, navegación por teclado
- **Consistencia**: Paleta de colores y componentes uniformes
- **Simplicidad**: Interfaz intuitiva y fácil de usar

### Responsive Design

- **Desktop**: Layout completo con sidebar
- **Tablet**: Sidebar colapsable
- **Mobile**: Navegación adaptativa y componentes apilados

## 🛠️ Scripts Disponibles

```bash
npm run dev          # Desarrollo con Turbopack
npm run build        # Construcción para producción
npm run start        # Servidor de producción
npm run lint         # Linter ESLint
```

## 📦 Dependencias Principales

- **Next.js 15**: Framework React
- **React 19**: Biblioteca de UI
- **TypeScript**: Tipado estático
- **Tailwind CSS 4**: Framework de estilos
- **Geist Fonts**: Fuentes modernas

## 🔮 Próximas Funcionalidades

- [ ] Páginas de cronograma, créditos y pagos
- [ ] Autenticación y autorización
- [ ] Dashboard con métricas
- [ ] Exportación de reportes
- [ ] Notificaciones push
- [ ] Modo oscuro
- [ ] Internacionalización (i18n)

## 👨‍💻 Desarrollo

### Estructura de Commits

```
feat: nueva funcionalidad
fix: corrección de bug
style: cambios de estilo
refactor: refactorización de código
docs: documentación
test: pruebas
```

### Estándares de Código

- **ESLint**: Linting automático
- **TypeScript**: Tipado estricto
- **Componentes funcionales**: Hooks de React
- **CSS Modules**: Estilos encapsulados
- **Naming**: Inglés para código, español para UI

## 📄 Licencia

Hecho con ❤️ por Julian Bastidas para Roda.

---

**🎯 Frontend listo para producción con arquitectura escalable y diseño moderno.**
