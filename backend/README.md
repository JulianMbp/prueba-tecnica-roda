# Roda Payment Schedule API

API REST para gestión de cronogramas de pagos de e-bikes/e-mopeds para Roda, empresa que financia vehículos eléctricos para repartidores de estratos 1-3.

## 🏗️ Arquitectura del Proyecto

El proyecto sigue una **arquitectura modular limpia** basada en principios SOLID y Clean Code:

```
backend/
├── core/                          # Aplicación principal Django
│   ├── domain/                   # Lógica de dominio
│   │   ├── entities/             # Entidades de negocio
│   │   │   ├── client.py         # Entidad Cliente
│   │   │   ├── credit.py         # Entidad Crédito
│   │   │   ├── payment_schedule.py # Entidad Cronograma
│   │   │   └── payment.py        # Entidad Pago
│   │   └── repositories/         # Managers personalizados
│   ├── application/              # Capa de aplicación
│   │   ├── use_cases/           # Casos de uso
│   │   └── services/            # Servicios de aplicación
│   ├── infrastructure/          # Capa de infraestructura
│   │   ├── repositories/        # Implementaciones de repositorio
│   │   └── serializers/         # Serializers DRF
│   └── management/              # Comandos Django personalizados
├── config/                       # Configuración Django
├── sql/                          # Scripts SQL y seed data
├── docker-compose.yml            # Orquestación de contenedores
├── Dockerfile                    # Imagen Docker
└── requirements.txt              # Dependencias Python
```

## 🚀 Instalación y Configuración

### Prerrequisitos
- Docker y Docker Compose
- Git

### Instalación Rápida

1. **Clonar el repositorio**
```bash
git clone <repository-url>
cd prueba_tecnica/backend
```

2. **Configurar variables de entorno**
```bash
cp .env.example .env
# Editar .env con tus configuraciones
```

3. **Levantar servicios**
```bash
docker-compose up -d
```

4. **Aplicar migraciones**
```bash
docker-compose exec web python manage.py migrate
```

5. **Cargar datos de prueba**
```bash
docker-compose exec web python manage.py load_sample_data
```

### Acceso a la API
- **API**: http://localhost:8000/api/
- **Admin**: http://localhost:8000/admin/
- **PgAdmin**: http://localhost:8080/

## 📊 Base de Datos

### Esquema Principal
- **clientes**: Información de clientes (repartidores)
- **creditos**: Créditos de e-bikes/e-mopeds
- **payment_schedule**: Cronograma de cuotas
- **pagos**: Pagos realizados

### Endpoints Principales

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/clientes/buscar_por_cedula/?num_doc={cedula}` | Buscar cliente con cronograma |
| GET | `/api/cronograma/` | Listar cronogramas |
| GET | `/api/cronograma/vencidas/` | Cuotas vencidas |
| GET | `/api/pagos/resumen_por_cliente/` | Resumen de pagos |

## 🛠️ Desarrollo

### Estructura Modular
- **Domain**: Entidades de negocio y lógica core
- **Application**: Casos de uso y servicios
- **Infrastructure**: Persistencia y serialización
- **Presentation**: API REST y controladores

### Principios Aplicados
- ✅ **SOLID**: Principios de diseño orientado a objetos
- ✅ **Clean Code**: Código legible y mantenible
- ✅ **Clean Architecture**: Separación de responsabilidades
- ✅ **DRY**: No repetición de código
- ✅ **Límite 100 líneas**: Archivos concisos y enfocados

### Comandos Útiles

```bash
# Crear migraciones
docker-compose exec web python manage.py makemigrations

# Aplicar migraciones
docker-compose exec web python manage.py migrate

# Cargar datos de prueba
docker-compose exec web python manage.py load_sample_data

# Shell Django
docker-compose exec web python manage.py shell

# Logs del contenedor
docker-compose logs web
```

## 🧪 Testing

```bash
# Ejecutar tests
docker-compose exec web python manage.py test

# Tests con cobertura
docker-compose exec web coverage run --source='.' manage.py test
docker-compose exec web coverage report
```

## 📚 Documentación API

La API incluye:
- **Postman Collection**: Importar `postman_collection.json`
- **Environment**: Configurar `postman_environment.json`
- **Guía de Uso**: Ver `POSTMAN_GUIDE.md`

## 🔧 Tecnologías

- **Backend**: Django 4.2 + Django REST Framework
- **Base de Datos**: PostgreSQL 15
- **Contenedores**: Docker + Docker Compose
- **ORM**: Django ORM con managers personalizados
- **Validación**: DRF Serializers
- **Arquitectura**: Clean Architecture + SOLID

## 📝 Funcionalidades

- ✅ Búsqueda de clientes por cédula
- ✅ Cronogramas de pago completos
- ✅ Cálculo de mora automático
- ✅ Resúmenes financieros
- ✅ API REST documentada
- ✅ Arquitectura escalable
- ✅ Manejo de errores robusto

## 🤝 Contribución

1. Fork el proyecto
2. Crear feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit cambios (`git commit -m 'Add AmazingFeature'`)
4. Push al branch (`git push origin feature/AmazingFeature`)
5. Abrir Pull Request

## 📄 Licencia

Este proyecto es parte de una prueba técnica para Roda.