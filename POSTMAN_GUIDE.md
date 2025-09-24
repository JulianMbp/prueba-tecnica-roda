# 🚀 Guía de Postman - API Roda Cronograma de Pagos

Esta guía te ayudará a probar todos los endpoints de la API usando la colección de Postman.

## 📋 Contenido

- [Instalación](#instalación)
- [Configuración](#configuración)
- [Endpoints Disponibles](#endpoints-disponibles)
- [Ejemplos de Uso](#ejemplos-de-uso)
- [Troubleshooting](#troubleshooting)

## 🛠️ Instalación

### 1. Importar la Colección

1. Abre Postman
2. Haz clic en **Import**
3. Selecciona los archivos:
   - `postman_collection.json`
   - `postman_environment.json`

### 2. Configurar el Entorno

1. Selecciona el entorno **"Roda API - Local Development"**
2. Verifica que `base_url` esté configurado como `http://localhost:8000`

## ⚙️ Configuración

### Variables de Entorno Disponibles

| Variable | Valor | Descripción |
|----------|-------|-------------|
| `base_url` | `http://localhost:8000` | URL base de la API |
| `cliente_id_ejemplo` | `11` | ID de cliente para pruebas |
| `credito_id_ejemplo` | `21` | ID de crédito para pruebas |
| `cuota_id_ejemplo` | `193` | ID de cuota para pruebas |
| `tasa_mora_default` | `0.02` | Tasa de mora por defecto (2%) |

## 📚 Endpoints Disponibles

### 👥 Clientes

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/clientes/` | Lista todos los clientes |
| GET | `/api/clientes/{id}/` | Obtiene cliente específico |
| GET | `/api/clientes/{id}/cronograma/` | Cronograma completo del cliente |
| GET | `/api/clientes/{id}/resumen/` | Resumen financiero del cliente |
| GET | `/api/clientes/con_mora/` | Clientes con cuotas en mora |
| GET | `/api/clientes/buscar_cliente/?num_doc={cedula}` | Busca cliente por cédula |
| GET | `/api/clientes/buscar_por_cedula/?num_doc={cedula}` | Busca cliente con cronograma |
| GET | `/api/clientes/?num_doc={cedula}` | Filtra clientes por cédula |
| GET | `/api/clientes/?nombre={nombre}` | Busca clientes por nombre |
| GET | `/api/clientes/?ciudad={ciudad}` | Filtra clientes por ciudad |
| POST | `/api/clientes/` | Crea nuevo cliente |

### 💰 Créditos

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/creditos/` | Lista todos los créditos |
| GET | `/api/creditos/?cliente_id={id}` | Créditos por cliente |
| GET | `/api/creditos/?producto={tipo}` | Créditos por producto |
| GET | `/api/creditos/{id}/` | Obtiene crédito específico |
| GET | `/api/creditos/{id}/cronograma/` | Cronograma del crédito |
| GET | `/api/creditos/{id}/resumen_financiero/` | Resumen financiero |

### 📅 Cronograma de Pagos

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/cronograma/` | Lista todo el cronograma |
| GET | `/api/cronograma/?cliente_id={id}` | Cronograma por cliente |
| GET | `/api/cronograma/?credito_id={id}` | Cronograma por crédito |
| GET | `/api/cronograma/?estado={estado}` | Cuotas por estado |
| GET | `/api/cronograma/?fecha_desde={fecha}&fecha_hasta={fecha}` | Por rango de fechas |
| GET | `/api/cronograma/vencidas/` | Cuotas vencidas |
| GET | `/api/cronograma/por_estado/?estado={estado}` | Cuotas por estado (endpoint específico) |
| GET | `/api/cronograma/{id}/calcular_mora/?tasa_mora={tasa}` | Calcula mora |

### 💳 Pagos

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/pagos/` | Lista todos los pagos |
| GET | `/api/pagos/?cliente_id={id}` | Pagos por cliente |
| GET | `/api/pagos/?credito_id={id}` | Pagos por crédito |
| GET | `/api/pagos/?schedule_id={id}` | Pagos por cuota |
| POST | `/api/pagos/` | Crea nuevo pago |
| GET | `/api/pagos/resumen_por_cliente/?cliente_id={id}` | Resumen de pagos |

## 🧪 Ejemplos de Uso

### 1. Obtener Dashboard de un Cliente

```http
GET {{base_url}}/api/clientes/11/resumen/
```

**Respuesta esperada:**
```json
{
  "cliente": {
    "cliente_id": 11,
    "nombre": "Cliente 1",
    "tipo_doc": "CC",
    "num_doc": "10000001"
  },
  "creditos": [...],
  "resumen_cronograma": {
    "total_cuotas": 24,
    "cuotas_pagadas": 3,
    "cuotas_vencidas": 2,
    "monto_total_pagado": 2482300.0
  }
}
```

### 2. Crear un Nuevo Pago

```http
POST {{base_url}}/api/pagos/
Content-Type: application/json

{
  "schedule": 193,
  "monto": 50000,
  "medio": "app"
}
```

### 3. Calcular Mora de una Cuota

```http
GET {{base_url}}/api/cronograma/193/calcular_mora/?tasa_mora=0.02
```

**Respuesta esperada:**
```json
{
  "cuota": {...},
  "dias_mora": 5,
  "tasa_mora": 0.02,
  "monto_mora": 1250.00,
  "saldo_pendiente": 90710.00
}
```

### 4. Filtrar Cuotas Vencidas por Cliente

```http
GET {{base_url}}/api/cronograma/vencidas/?cliente_id=11
```

### 5. Obtener Resumen de Pagos

```http
GET {{base_url}}/api/pagos/resumen_por_cliente/?cliente_id=11
```

### 6. Buscar Cliente por Cédula

```http
GET {{base_url}}/api/clientes/buscar_cliente/?num_doc=10000001
```

**Respuesta esperada:**
```json
{
  "cliente_id": 11,
  "tipo_doc": "CC",
  "num_doc": "10000001",
  "nombre": "Cliente 1",
  "ciudad": "Barranquilla",
  "created_at": "2025-09-24T04:32:07.295176Z"
}
```

### 7. Buscar Cliente con Cronograma Completo

```http
GET {{base_url}}/api/clientes/buscar_por_cedula/?num_doc=10000001
```

**Respuesta esperada:**
```json
{
  "cliente": {...},
  "cronograma": [...],
  "resumen": {
    "total_cuotas": 24,
    "cuotas_pagadas": 3,
    "cuotas_vencidas": 2,
    "monto_total_pagado": 2482300.0
  }
}
```

### 8. Buscar Clientes por Nombre

```http
GET {{base_url}}/api/clientes/?nombre=Cliente
```

### 9. Filtrar Clientes por Ciudad

```http
GET {{base_url}}/api/clientes/?ciudad=Bogotá
```

## 🔍 Consultas Avanzadas

### Búsqueda por Cédula (Funcionalidad Principal)

La búsqueda por cédula es la funcionalidad más importante para los repartidores. Permite encontrar rápidamente su información usando su número de documento.

#### Opciones de Búsqueda:

1. **Búsqueda Básica (Solo Cliente):**
```http
GET {{base_url}}/api/clientes/buscar_cliente/?num_doc=10000001
```

2. **Búsqueda Completa (Cliente + Cronograma):**
```http
GET {{base_url}}/api/clientes/buscar_por_cedula/?num_doc=10000001
```

3. **Búsqueda con Tipo de Documento:**
```http
GET {{base_url}}/api/clientes/buscar_cliente/?tipo_doc=CC&num_doc=10000001
```

4. **Búsqueda Parcial (Filtro en Listado):**
```http
GET {{base_url}}/api/clientes/?num_doc=10000001
```

#### Tipos de Documento Soportados:
- `CC` - Cédula de Ciudadanía (por defecto)
- `CE` - Cédula de Extranjería
- `TI` - Tarjeta de Identidad
- `PP` - Pasaporte

### Análisis de Mora por Período

```http
GET {{base_url}}/api/cronograma/?fecha_desde=2025-09-01&fecha_hasta=2025-09-30&estado=vencida
```

### Créditos por Tipo de Producto

```http
GET {{base_url}}/api/creditos/?producto=e-bike
```

### Cuotas Pendientes de Pago

```http
GET {{base_url}}/api/cronograma/por_estado/?estado=pendiente
```

## 📊 Estados de Cuotas

| Estado | Descripción |
|--------|-------------|
| `pendiente` | Cuota sin pagos |
| `parcial` | Cuota con pagos parciales |
| `pagada` | Cuota completamente pagada |
| `vencida` | Cuota vencida con saldo pendiente |

## 🎯 Medios de Pago

| Medio | Descripción |
|-------|-------------|
| `app` | App Móvil |
| `efectivo` | Efectivo |
| `link` | Link de Pago |
| `transferencia` | Transferencia Bancaria |
| `tarjeta` | Tarjeta de Crédito/Débito |

## 🚨 Troubleshooting

### Error: Connection Refused

**Problema:** No se puede conectar a la API

**Solución:**
1. Verifica que el backend esté corriendo: `docker-compose up -d web`
2. Confirma que la URL base sea correcta: `http://localhost:8000`
3. Verifica que no haya firewall bloqueando el puerto 8000

### Error: 404 Not Found

**Problema:** Endpoint no encontrado

**Solución:**
1. Verifica la URL del endpoint
2. Confirma que el ID del recurso existe
3. Revisa la documentación de endpoints

### Error: 400 Bad Request

**Problema:** Solicitud inválida

**Solución:**
1. Verifica el formato JSON en el body
2. Confirma que todos los campos requeridos estén presentes
3. Revisa los tipos de datos (números, fechas, etc.)

### Error: 500 Internal Server Error

**Problema:** Error interno del servidor

**Solución:**
1. Revisa los logs del servidor
2. Verifica que la base de datos esté funcionando
3. Confirma que los datos de prueba estén cargados

## 📈 Datos de Prueba Disponibles

La API viene precargada con datos de prueba:

- **10 clientes** (IDs: 11-20)
- **20 créditos** (IDs: 21-40)
- **189 cuotas** (IDs: 193-381)
- **140 pagos** con diferentes estados

### IDs de Ejemplo para Pruebas

- **Cliente:** 11 (Cliente 1)
- **Crédito:** 21 (e-bike del Cliente 1)
- **Cuota:** 193 (Primera cuota del crédito 21)

## 🔧 Comandos Útiles

### Recargar Datos de Prueba

```bash
cd backend
docker-compose run --rm web python manage.py load_sample_data --clear
```

### Verificar Estado de la API

```bash
curl http://localhost:8000/api/clientes/
```

### Ver Logs del Servidor

```bash
docker-compose logs -f web
```

## 📞 Soporte

Si encuentras algún problema:

1. Revisa esta documentación
2. Verifica los logs del servidor
3. Confirma que todos los servicios estén corriendo
4. Consulta la documentación de Django REST Framework

---

¡Disfruta probando la API de Roda! 🚀
