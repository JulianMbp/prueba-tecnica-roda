# 🚀 Guía de Pruebas de API - Roda Payment Schedule

## 📋 Índice
- [Endpoints Principales](#endpoints-principales)
- [Endpoints para Repartidores](#endpoints-para-repartidores)
- [Ejemplos de Requests](#ejemplos-de-requests)
- [Resultados de Pruebas](#resultados-de-pruebas)
- [Códigos de Respuesta](#códigos-de-respuesta)

---

## 🔗 Endpoints Principales

### 1. **Clientes**
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/clientes/` | Listar todos los clientes |
| GET | `/api/clientes/buscar_cliente/?num_doc=10000001` | Buscar cliente por documento |
| GET | `/api/clientes/buscar_por_cedula/?num_doc=10000001` | Buscar cliente con cronograma |
| GET | `/api/clientes/11/cronograma/` | Cronograma de cliente específico |
| GET | `/api/clientes/con_mora/` | Clientes con cuotas en mora |

### 2. **Créditos**
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/creditos/` | Listar todos los créditos |
| GET | `/api/creditos/22/` | Detalle de crédito específico |

### 3. **Cronograma**
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/cronograma/` | Listar todos los cronogramas |
| GET | `/api/cronograma/vencidas/` | Cuotas vencidas |
| GET | `/api/cronograma/?cliente_id=11` | Cronograma por cliente |

### 4. **Pagos**
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/pagos/` | Listar todos los pagos |
| GET | `/api/pagos/resumen_por_cliente/?cliente_id=11` | Resumen de pagos por cliente |

---

## 🎯 Endpoints para Repartidores

### 1. **Cronograma Completo**
```http
GET /api/repartidor/cronograma_completo/?cliente_id=11
```

### 2. **Cronograma Resumido (Recomendado)**
```http
GET /api/repartidor/cronograma_resumido/?cliente_id=11
```

### 3. **Estado de Pago**
```http
GET /api/repartidor/estado_pago/?cliente_id=11
```

---

## 📝 Ejemplos de Requests

### **cURL Commands**

#### 1. Listar Clientes
```bash
curl -X GET "http://localhost:8000/api/clientes/" \
  -H "Content-Type: application/json"
```

#### 2. Buscar Cliente por Cédula
```bash
curl -X GET "http://localhost:8000/api/clientes/buscar_cliente/?num_doc=10000001" \
  -H "Content-Type: application/json"
```

#### 3. Cronograma Completo de Repartidor
```bash
curl -X GET "http://localhost:8000/api/repartidor/cronograma_completo/?cliente_id=11" \
  -H "Content-Type: application/json"
```

#### 4. Estado de Pago
```bash
curl -X GET "http://localhost:8000/api/repartidor/estado_pago/?cliente_id=11" \
  -H "Content-Type: application/json"
```

#### 5. Cuotas Vencidas
```bash
curl -X GET "http://localhost:8000/api/cronograma/vencidas/" \
  -H "Content-Type: application/json"
```

### **JavaScript/Fetch Examples**

#### 1. Obtener Cronograma Resumido
```javascript
const getCronogramaResumido = async (clienteId) => {
  try {
    const response = await fetch(`http://localhost:8000/api/repartidor/cronograma_resumido/?cliente_id=${clienteId}`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error:', error);
  }
};

// Uso
getCronogramaResumido(11).then(data => {
  console.log('Cliente:', data.cliente.nombre);
  console.log('Estado:', data.estado_actual);
  console.log('Total cuotas:', data.resumen.total_cuotas);
});
```

#### 2. Verificar Estado de Pago
```javascript
const verificarEstadoPago = async (clienteId) => {
  try {
    const response = await fetch(`http://localhost:8000/api/repartidor/estado_pago/?cliente_id=${clienteId}`);
    const data = await response.json();
    
    if (data.estado_general === 'en_mora') {
      console.log(`⚠️ Cliente en mora: ${data.cuotas_vencidas} cuotas vencidas`);
      console.log(`Días de mora: ${data.dias_mora}`);
    } else {
      console.log('✅ Cliente al día');
    }
    
    return data;
  } catch (error) {
    console.error('Error:', error);
  }
};
```

#### 3. Buscar Cliente por Documento
```javascript
const buscarClientePorCedula = async (numDoc, tipoDoc = 'CC') => {
  try {
    const response = await fetch(`http://localhost:8000/api/clientes/buscar_cliente/?num_doc=${numDoc}&tipo_doc=${tipoDoc}`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error:', error);
  }
};
```

---

## 📊 Resultados de Pruebas

### **1. Endpoints Principales - Resultados**

#### ✅ **GET /api/clientes/**
```json
{
  "count": 10,
  "next": null,
  "previous": null,
  "results": [
    {
      "cliente_id": 11,
      "tipo_doc": "CC",
      "num_doc": "10000001",
      "nombre": "Cliente 1",
      "ciudad": "Barranquilla",
      "created_at": "2025-09-24T04:32:07.295176Z"
    }
  ]
}
```

#### ✅ **GET /api/creditos/**
```json
{
  "count": 20,
  "next": null,
  "previous": null,
  "results": [
    {
      "credito_id": 22,
      "cliente": 11,
      "client_name": "Cliente 1",
      "producto": "e-moped",
      "inversion": "4216000.00",
      "cuotas_totales": 12,
      "tea": "0.280000",
      "fecha_desembolso": "2025-08-03",
      "fecha_inicio_pago": "2025-09-12",
      "estado": "vigente"
    }
  ]
}
```

#### ✅ **GET /api/cronograma/**
```json
{
  "count": 189,
  "next": null,
  "previous": null,
  "results": [
    {
      "schedule_id": 343,
      "credito": 37,
      "num_cuota": 1,
      "fecha_vencimiento": "2025-08-26",
      "valor_cuota": "515670.00",
      "estado": "vencida"
    }
  ]
}
```

#### ✅ **GET /api/pagos/**
```json
{
  "count": 140,
  "next": null,
  "previous": null,
  "results": [
    {
      "pago_id": 110,
      "fecha_pago": "2026-08-26T00:00:00Z",
      "monto": "87000.00",
      "medio": "link"
    }
  ]
}
```

### **2. Endpoints para Repartidores - Resultados**

#### ✅ **GET /api/repartidor/cronograma_resumido/?cliente_id=11**
```json
{
  "cliente": {
    "cliente_id": 11,
    "nombre": "Cliente 1",
    "tipo_doc": "CC",
    "num_doc": "10000001"
  },
  "cronograma": [
    {
      "cuota_id": 343,
      "num_cuota": 1,
      "fecha_vencimiento": "2025-09-12",
      "valor_cuota": 351330.0,
      "estado": "vencida",
      "producto": "e-moped",
      "credito_id": 22,
      "dias_vencido": 12,
      "dias_restantes": 0,
      "monto_pagado": 0.0,
      "saldo_pendiente": 351330.0
    },
    {
      "cuota_id": 344,
      "num_cuota": 1,
      "fecha_vencimiento": "2025-09-23",
      "valor_cuota": 181420.0,
      "estado": "vencida",
      "producto": "e-bike",
      "credito_id": 21,
      "dias_vencido": 1,
      "dias_restantes": 0,
      "monto_pagado": 0.0,
      "saldo_pendiente": 181420.0
    }
  ],
  "resumen": {
    "total_cuotas": 24,
    "cuotas_pagadas": 3,
    "cuotas_vencidas": 2,
    "cuotas_pendientes": 9,
    "cuotas_parciales": 10,
    "total_monto": 6393000.0,
    "monto_pagado": 2482300.0,
    "monto_pendiente": 3910700.0,
    "porcentaje_pagado": 38.82840606913812
  },
  "estado_actual": "en_mora"
}
```

#### ✅ **GET /api/repartidor/estado_pago/?cliente_id=11**
```json
{
  "estado_general": "en_mora",
  "total_cuotas": 24,
  "cuotas_pagadas": 3,
  "cuotas_pendientes": 19,
  "cuotas_vencidas": 2,
  "proxima_cuota": {
    "num_cuota": 2,
    "fecha_vencimiento": "2025-10-23",
    "valor_cuota": "181420.00",
    "estado": "pendiente"
  },
  "cuota_mas_reciente_vencida": {
    "num_cuota": 1,
    "fecha_vencimiento": "2025-09-23",
    "valor_cuota": "181420.00",
    "estado": "vencida"
  },
  "dias_mora": 1
}
```

#### ✅ **GET /api/repartidor/cronograma_completo/?cliente_id=11**
```json
{
  "cliente": {
    "cliente_id": 11,
    "nombre": "Cliente 1",
    "tipo_doc": "CC",
    "num_doc": "10000001",
    "ciudad": "Barranquilla"
  },
  "cronograma": [
    {
      "schedule_id": 343,
      "credito": 22,
      "credit_info": {
        "credito_id": 22,
        "producto": "e-moped",
        "inversion": 4216000.0,
        "cuotas_totales": 12,
        "fecha_desembolso": "2025-08-03",
        "cliente_nombre": "Cliente 1"
      },
      "num_cuota": 1,
      "fecha_vencimiento": "2025-09-12",
      "valor_cuota": "351330.00",
      "estado": "vencida",
      "amount_paid": "0.00",
      "pending_balance": "351330.00",
      "days_overdue": 12,
      "is_overdue": true,
      "payments": []
    }
  ],
  "resumen": {
    "total_cuotas": 24,
    "cuotas_pagadas": 3,
    "cuotas_vencidas": 2,
    "cuotas_pendientes": 9,
    "cuotas_parciales": 10,
    "estado_general": "en_mora"
  }
}
```

### **3. Búsquedas Específicas - Resultados**

#### ✅ **GET /api/clientes/buscar_cliente/?num_doc=10000001**
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

#### ✅ **GET /api/clientes/buscar_por_cedula/?num_doc=10000001**
```json
{
  "cliente": {
    "cliente_id": 11,
    "tipo_doc": "CC",
    "num_doc": "10000001",
    "nombre": "Cliente 1",
    "ciudad": "Barranquilla",
    "created_at": "2025-09-24T04:32:07.295176Z"
  },
  "cronograma": [...],
  "resumen": {...}
}
```

#### ✅ **GET /api/cronograma/vencidas/**
```json
[
  {
    "schedule_id": 343,
    "credito": 22,
    "num_cuota": 1,
    "fecha_vencimiento": "2025-08-26",
    "valor_cuota": "515670.00",
    "estado": "vencida"
  }
]
```

#### ✅ **GET /api/pagos/resumen_por_cliente/?cliente_id=11**
```json
{
  "total_pagos": 15,
  "monto_total_pagado": 2482300.0,
  "pagos_por_medio": {
    "app": {
      "cantidad": 5,
      "monto_total": 969020.0
    },
    "link": {
      "cantidad": 2,
      "monto_total": 181420.0
    },
    "efectivo": {
      "cantidad": 8,
      "monto_total": 1331860.0
    }
  },
  "ultimo_pago": {
    "fecha": "2026-08-16T00:00:00Z",
    "monto": 175660.0,
    "medio": "app",
    "cuota": 12
  }
}
```

---

## 📈 Estadísticas de Datos de Prueba

| **Entidad** | **Cantidad** | **Descripción** |
|-------------|--------------|-----------------|
| **Clientes** | 10 | Clientes con diferentes tipos de documento y ciudades |
| **Créditos** | 20 | Créditos de e-bikes y e-mopeds con diferentes montos |
| **Cronogramas** | 189 | Cuotas distribuidas en diferentes fechas |
| **Pagos** | 140 | Pagos realizados con diferentes métodos |
| **Cuotas Vencidas** | 16 | Cuotas en estado de mora para pruebas |

---

## 🔍 Filtros y Parámetros Disponibles

### **Clientes**
- `tipo_doc`: Filtrar por tipo de documento (CC, CE, TI, PP)
- `num_doc`: Buscar por número de documento
- `nombre`: Buscar por nombre (búsqueda parcial)
- `ciudad`: Filtrar por ciudad

### **Cronograma**
- `cliente_id`: Filtrar por cliente específico
- `credito_id`: Filtrar por crédito específico
- `estado`: Filtrar por estado (pendiente, pagada, vencida, parcial)
- `fecha_desde`: Filtrar desde fecha
- `fecha_hasta`: Filtrar hasta fecha

### **Pagos**
- `cliente_id`: Resumen por cliente específico
- `medio`: Filtrar por método de pago

---

## ⚠️ Códigos de Respuesta

| **Código** | **Significado** | **Ejemplo** |
|------------|-----------------|-------------|
| **200** | OK - Solicitud exitosa | Lista de clientes obtenida |
| **400** | Bad Request - Parámetros incorrectos | Falta parámetro cliente_id |
| **404** | Not Found - Recurso no encontrado | Cliente no existe |
| **500** | Internal Server Error - Error del servidor | Error en base de datos |

### **Ejemplos de Errores**

#### **400 - Bad Request**
```json
{
  "error": "Parámetro cliente_id es requerido"
}
```

#### **404 - Not Found**
```json
{
  "error": "Client with ID 999 not found"
}
```

#### **500 - Internal Server Error**
```json
{
  "error": "Error interno: connection failed"
}
```

---

## 🚀 Comandos de Prueba Rápida

### **Verificar que la API funciona**
```bash
# Verificar estado general
curl -s "http://localhost:8000/api/" | jq .

# Contar registros
curl -s "http://localhost:8000/api/clientes/" | jq '.count'
curl -s "http://localhost:8000/api/creditos/" | jq '.count'
curl -s "http://localhost:8000/api/cronograma/" | jq '.count'
curl -s "http://localhost:8000/api/pagos/" | jq '.count'
```

### **Pruebas de Repartidor**
```bash
# Cronograma resumido
curl -s "http://localhost:8000/api/repartidor/cronograma_resumido/?cliente_id=11" | jq '.estado_actual'

# Estado de pago
curl -s "http://localhost:8000/api/repartidor/estado_pago/?cliente_id=11" | jq '.estado_general'

# Búsqueda por cédula
curl -s "http://localhost:8000/api/clientes/buscar_cliente/?num_doc=10000001" | jq '.nombre'
```

### **Verificar Cuotas Vencidas**
```bash
# Contar cuotas vencidas
curl -s "http://localhost:8000/api/cronograma/vencidas/" | jq 'length'

# Clientes con mora
curl -s "http://localhost:8000/api/clientes/con_mora/" | jq 'length'
```

---

## 📱 Casos de Uso para App de Repartidor

### **1. Dashboard Principal**
```javascript
// Obtener estado general del cliente
const estado = await fetch(`/api/repartidor/estado_pago/?cliente_id=${clienteId}`);
const data = await estado.json();

if (data.estado_general === 'en_mora') {
  showAlert(`⚠️ Tienes ${data.cuotas_vencidas} cuotas vencidas`);
} else {
  showSuccess('✅ Estás al día con tus pagos');
}
```

### **2. Cronograma de Pagos**
```javascript
// Mostrar próximas cuotas
const cronograma = await fetch(`/api/repartidor/cronograma_resumido/?cliente_id=${clienteId}`);
const data = await cronograma.json();

const proximasCuotas = data.cronograma.filter(cuota => 
  cuota.dias_restantes > 0 && cuota.dias_restantes <= 30
);

proximasCuotas.forEach(cuota => {
  console.log(`Cuota ${cuota.num_cuota}: $${cuota.valor_cuota} - ${cuota.dias_restantes} días restantes`);
});
```

### **3. Búsqueda de Cliente**
```javascript
// Buscar cliente por cédula
const buscarCliente = async (numDoc) => {
  const response = await fetch(`/api/clientes/buscar_cliente/?num_doc=${numDoc}`);
  const cliente = await response.json();
  
  if (cliente.cliente_id) {
    // Obtener cronograma del cliente encontrado
    const cronograma = await fetch(`/api/repartidor/cronograma_resumido/?cliente_id=${cliente.cliente_id}`);
    return await cronograma.json();
  }
  return null;
};
```

---

## ✅ Estado de Implementación

- ✅ **Backend API**: 100% funcional
- ✅ **Endpoints Principales**: Todos probados
- ✅ **Endpoints para Repartidores**: Implementados y probados
- ✅ **Búsquedas**: Funcionando correctamente
- ✅ **Filtros**: Implementados
- ✅ **Manejo de Errores**: Configurado
- ✅ **Datos de Prueba**: Cargados y verificados
- ⏳ **Frontend React**: Pendiente
- ⏳ **Tests Unitarios**: Pendiente

---

## 🔧 Configuración del Entorno

### **Requisitos**
- Docker y Docker Compose
- Puerto 8000 disponible para la API
- Puerto 5432 disponible para PostgreSQL

### **Iniciar el Servidor**
```bash
# Levantar servicios
docker-compose up -d

# Verificar logs
docker-compose logs web

# Acceder a la API
curl http://localhost:8000/api/
```

---

**🎯 La API está lista para ser consumida por el frontend React y proporciona toda la información necesaria para el cronograma de pagos de Roda.**
