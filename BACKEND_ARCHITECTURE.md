# 🏗️ Arquitectura del Backend - Roda Payment Schedule

## 📋 Resumen Ejecutivo

Este backend implementa una **arquitectura híbrida** que combina:
- **Django MVC tradicional** para compatibilidad
- **Clean Architecture** modular para escalabilidad
- **Patrón Repository** con Django Managers
- **Servicios de aplicación** para lógica de negocio

---

## 🗂️ Estructura de Carpetas

```
backend/
├── 📁 config/                    # Configuración Django
├── 📁 core/                      # Aplicación principal
│   ├── 📄 models.py              # Punto de entrada - importa entidades
│   ├── 📄 managers.py            # Punto de entrada - importa managers
│   ├── 📄 serializers.py         # Punto de entrada - importa serializers
│   ├── 📄 services.py            # Punto de entrada - importa servicios
│   ├── 📄 views.py               # Controladores (ViewSets)
│   ├── 📄 urls.py                # Rutas de la API
│   ├── 📄 exceptions.py          # Excepciones personalizadas
│   ├── 📁 domain/                # Capa de Dominio
│   │   ├── 📁 entities/          # Entidades de negocio
│   │   └── 📁 repositories/      # Interfaces de acceso a datos
│   ├── 📁 application/           # Capa de Aplicación
│   │   ├── 📁 services/          # Servicios de aplicación
│   │   └── 📁 use_cases/         # Casos de uso (futuro)
│   ├── 📁 infrastructure/        # Capa de Infraestructura
│   │   ├── 📁 repositories/      # Implementaciones concretas
│   │   └── 📁 serializers/       # Serializers DRF
│   └── 📁 management/            # Comandos Django
├── 📁 sql/                       # Scripts SQL
├── 📄 docker-compose.yml         # Orquestación de servicios
├── 📄 Dockerfile                 # Imagen Docker
└── 📄 requirements.txt           # Dependencias Python
```

---

## 🎯 Arquitectura por Capas

### **1. Capa de Presentación (Presentation Layer)**
**Ubicación**: `core/views.py`, `core/urls.py`

```python
# Ejemplo de ViewSet
class ClienteViewSet(viewsets.ModelViewSet):
    queryset = Cliente.objects.all()
    serializer_class = ClienteSerializer
    
    @action(detail=False, methods=['get'])
    def buscar_por_cedula(self, request):
        # Lógica de búsqueda
```

**Responsabilidades**:
- ✅ Manejo de requests HTTP
- ✅ Validación de entrada
- ✅ Serialización de respuestas
- ✅ Manejo de errores HTTP

### **2. Capa de Aplicación (Application Layer)**
**Ubicación**: `core/application/services/`

```python
# Ejemplo de servicio de aplicación
class SimpleClientService:
    def get_client_dashboard(self, client_id: int):
        # Lógica de negocio
        client = Client.objects.get(cliente_id=client_id)
        schedules = PaymentSchedule.objects.by_client(client_id)
        summary = self._calculate_client_summary(schedules)
        return {'cliente': client, 'cronogramas': schedules, 'resumen': summary}
```

**Responsabilidades**:
- ✅ Orquestación de operaciones
- ✅ Lógica de negocio compleja
- ✅ Coordinación entre entidades
- ✅ Casos de uso específicos

### **3. Capa de Dominio (Domain Layer)**
**Ubicación**: `core/domain/`

#### **3.1 Entidades (`core/domain/entities/`)**
```python
# Ejemplo de entidad
class Client(models.Model):
    cliente_id = models.BigAutoField(primary_key=True)
    tipo_doc = models.CharField(max_length=2, choices=DOC_TYPE_CHOICES)
    num_doc = models.CharField(max_length=20)
    nombre = models.CharField(max_length=100)
    
    objects = ClientManager()  # Manager personalizado
    
    def has_active_credits(self):
        return self.creditos.filter(estado='vigente').exists()
```

#### **3.2 Repositorios/Managers (`core/domain/repositories/`)**
```python
# Ejemplo de manager personalizado
class ClientManager(models.Manager):
    def with_credits_summary(self):
        return self.annotate(
            total_credits=models.Count('creditos'),
            total_investment_credits=Sum('creditos__inversion')
        )
    
    def search_by_document(self, doc_type, doc_number):
        return self.filter(tipo_doc=doc_type, num_doc=doc_number)
```

**Responsabilidades**:
- ✅ Definición de entidades de negocio
- ✅ Lógica de dominio
- ✅ Reglas de negocio
- ✅ Consultas complejas

### **4. Capa de Infraestructura (Infrastructure Layer)**
**Ubicación**: `core/infrastructure/`

#### **4.1 Serializers (`core/infrastructure/serializers/`)**
```python
# Ejemplo de serializer
class ClientSerializer(serializers.ModelSerializer):
    class Meta:
        model = Client
        fields = '__all__'
        read_only_fields = ('cliente_id', 'created_at')

class ClientDashboardSerializer(ClientSerializer):
    total_credits = serializers.SerializerMethodField()
    total_investment = serializers.SerializerMethodField()
```

#### **4.2 Repositorios Concretos (`core/infrastructure/repositories/`)**
```python
# Ejemplo de repositorio concreto (futuro)
class ClientRepository:
    def save(self, client):
        # Implementación específica de guardado
        pass
```

**Responsabilidades**:
- ✅ Serialización de datos
- ✅ Persistencia de datos
- ✅ Integración con servicios externos
- ✅ Configuración técnica

---

## 🔄 Flujo de Datos

### **Request → Response**

```
1. 🌐 HTTP Request
   ↓
2. 📍 URL Router (core/urls.py)
   ↓
3. 🎮 ViewSet (core/views.py)
   ↓
4. 🔧 Service (core/application/services/)
   ↓
5. 🏢 Entity + Manager (core/domain/)
   ↓
6. 🗄️ Database (PostgreSQL)
   ↓
7. 📊 Serializer (core/infrastructure/serializers/)
   ↓
8. 📤 HTTP Response
```

### **Ejemplo Concreto**:

```python
# 1. Request: GET /api/clientes/buscar_por_cedula/?num_doc=10000001

# 2. Router: core/urls.py
router.register(r'clientes', ClienteViewSet)

# 3. ViewSet: core/views.py
@action(detail=False, methods=['get'])
def buscar_por_cedula(self, request):
    num_doc = request.query_params.get('num_doc')
    cliente = ClienteService.get_cliente_por_cedula(num_doc)
    return Response(ClienteSerializer(cliente).data)

# 4. Service: core/application/services/simple_client_service.py
def get_client_by_document(self, doc_type='CC', doc_number=None):
    return Client.objects.search_by_document(doc_type, doc_number)

# 5. Manager: core/domain/repositories/client_manager.py
def search_by_document(self, doc_type, doc_number):
    return self.filter(tipo_doc=doc_type, num_doc=doc_number)

# 6. Database: PostgreSQL query
SELECT * FROM core.clientes WHERE tipo_doc='CC' AND num_doc='10000001'

# 7. Serializer: core/infrastructure/serializers/client_serializers.py
class ClientSerializer(serializers.ModelSerializer):
    # Convierte objeto Python a JSON

# 8. Response: JSON con datos del cliente
```

---

## 🎯 ¿Por Qué Esta Estructura?

### **1. Compatibilidad con Django**
```python
# core/models.py - Punto de entrada que mantiene compatibilidad
from .domain.entities import Client, Credit, PaymentSchedule, Payment

# Alias para compatibilidad
Cliente = Client
Credito = Credit
Pago = Payment
```

**Ventajas**:
- ✅ Django admin funciona automáticamente
- ✅ Migraciones funcionan sin cambios
- ✅ Código existente sigue funcionando
- ✅ Importaciones simples: `from core.models import Cliente`

### **2. Arquitectura Modular**
```python
# Separación clara de responsabilidades
core/
├── domain/          # Lógica de negocio pura
├── application/     # Casos de uso y servicios
├── infrastructure/  # Detalles técnicos
└── presentation/    # API y UI (views.py)
```

**Ventajas**:
- ✅ Fácil testing unitario
- ✅ Cambios aislados por capa
- ✅ Reutilización de código
- ✅ Escalabilidad

### **3. Principios SOLID Aplicados**

#### **Single Responsibility Principle (SRP)**
```python
# Cada clase tiene una responsabilidad específica
class Client(models.Model):           # Entidad de dominio
class ClientManager(models.Manager):  # Acceso a datos
class ClientSerializer(...):          # Serialización
class SimpleClientService:            # Lógica de aplicación
```

#### **Open/Closed Principle (OCP)**
```python
# Fácil extensión sin modificar código existente
class PaymentScheduleManager(models.Manager):
    def overdue(self):                    # Método base
        return self.filter(...)
    
    def calculate_overdue_interest(self): # Método extendido
        return self.overdue().annotate(...)
```

#### **Dependency Inversion Principle (DIP)**
```python
# Depende de abstracciones, no de implementaciones concretas
class SimpleClientService:
    def __init__(self):
        self.client_manager = Client.objects  # Abstracción
        # No depende directamente de PostgreSQL
```

---

## 📁 Archivos en `core/` - ¿Por Qué Tantos?

### **Archivos de Punto de Entrada (Entry Points)**

#### **1. `models.py`** - Entrada Principal
```python
# Importa todas las entidades del dominio
from .domain.entities import Client, Credit, PaymentSchedule, Payment

# Mantiene compatibilidad con nombres en español
Cliente = Client
Credito = Credit
Pago = Payment
```

**¿Por qué existe?**
- ✅ Django espera `models.py` en cada app
- ✅ Mantiene compatibilidad con código existente
- ✅ Punto único de importación para entidades
- ✅ Migraciones funcionan automáticamente

#### **2. `managers.py`** - Managers Personalizados
```python
# Importa todos los managers del dominio
from .domain.repositories import ClientManager, CreditManager

# Alias para compatibilidad
ClienteManager = ClientManager
CreditoManager = CreditManager
```

**¿Por qué existe?**
- ✅ Centraliza managers personalizados
- ✅ Fácil importación: `from core.managers import ClienteManager`
- ✅ Compatibilidad con código existente

#### **3. `serializers.py`** - Serializers DRF
```python
# Importa todos los serializers de infraestructura
from .infrastructure.serializers import ClientSerializer, CreditSerializer

# Alias para compatibilidad
ClienteSerializer = ClientSerializer
CreditoSerializer = CreditSerializer
```

**¿Por qué existe?**
- ✅ Centraliza serializers
- ✅ Compatibilidad con nombres en español
- ✅ Fácil importación en views

#### **4. `services.py`** - Servicios de Aplicación
```python
# Importa servicios simples
from .application.services.simple_client_service import SimpleClientService

# Crea instancias
client_service = SimpleClientService()

# Clases legacy para compatibilidad
class ClienteService:
    @staticmethod
    def get_cliente_dashboard(cliente_id):
        return client_service.get_client_dashboard(cliente_id)
```

**¿Por qué existe?**
- ✅ Punto único de acceso a servicios
- ✅ Mantiene compatibilidad con código existente
- ✅ Instancias preconfiguradas

### **Archivos de Funcionalidad**

#### **5. `views.py`** - Controladores (652 líneas)
```python
class ClienteViewSet(viewsets.ModelViewSet):
    # CRUD básico
    
    @action(detail=False, methods=['get'])
    def buscar_por_cedula(self, request):
        # Búsqueda específica
    
    @action(detail=True, methods=['get'])
    def cronograma(self, request, pk=None):
        # Cronograma del cliente

class RepartidorCronogramaViewSet(viewsets.ViewSet):
    # Endpoints específicos para repartidores
```

**¿Por qué es grande?**
- ✅ Contiene todos los ViewSets
- ✅ Múltiples endpoints por entidad
- ✅ Lógica de presentación completa

#### **6. `urls.py`** - Enrutamiento
```python
router = DefaultRouter()
router.register(r'clientes', ClienteViewSet)
router.register(r'creditos', CreditoViewSet)
router.register(r'cronograma', PaymentScheduleViewSet)
router.register(r'pagos', PagoViewSet)
router.register(r'repartidor', RepartidorCronogramaViewSet)
```

#### **7. `exceptions.py`** - Manejo de Errores
```python
class NotFoundException(APIException):
    status_code = status.HTTP_404_NOT_FOUND
    default_detail = 'El recurso solicitado no fue encontrado.'

class BadRequestException(APIException):
    status_code = status.HTTP_400_BAD_REQUEST
```

---

## 🏗️ Arquitectura de Carpetas

### **`core/domain/`** - Capa de Dominio

```
domain/
├── entities/           # Entidades de negocio
│   ├── client.py       # Modelo Cliente
│   ├── credit.py       # Modelo Crédito
│   ├── payment_schedule.py  # Modelo Cronograma
│   └── payment.py      # Modelo Pago
└── repositories/       # Interfaces de acceso a datos
    ├── client_manager.py      # Manager de Cliente
    ├── credit_manager.py      # Manager de Crédito
    └── payment_schedule_manager.py  # Manager de Cronograma
```

**¿Por qué esta estructura?**
- ✅ **Entities**: Contienen la lógica de negocio pura
- ✅ **Repositories**: Abstraen el acceso a datos
- ✅ **Independiente**: No depende de frameworks externos
- ✅ **Testeable**: Fácil testing unitario

### **`core/application/`** - Capa de Aplicación

```
application/
├── services/           # Servicios de aplicación
│   ├── simple_client_service.py      # Servicio de Cliente
│   ├── simple_credit_service.py      # Servicio de Crédito
│   └── simple_payment_service.py     # Servicio de Pagos
└── use_cases/          # Casos de uso (futuro)
    ├── client_use_cases.py
    ├── credit_use_cases.py
    └── payment_use_cases.py
```

**¿Por qué esta estructura?**
- ✅ **Services**: Orquestan operaciones complejas
- ✅ **Use Cases**: Encapsulan casos de uso específicos
- ✅ **Coordinación**: Coordinan múltiples entidades
- ✅ **Lógica de aplicación**: No de dominio, no de infraestructura

### **`core/infrastructure/`** - Capa de Infraestructura

```
infrastructure/
├── repositories/       # Implementaciones concretas
│   ├── client_repository.py
│   ├── credit_repository.py
│   └── payment_repository.py
└── serializers/        # Serializers DRF
    ├── client_serializers.py
    ├── credit_serializers.py
    └── payment_serializers.py
```

**¿Por qué esta estructura?**
- ✅ **Repositories**: Implementaciones concretas de acceso a datos
- ✅ **Serializers**: Detalles técnicos de serialización
- ✅ **Frameworks**: Depende de Django/DRF
- ✅ **Implementación**: Cambia sin afectar otras capas

---

## 🔄 Patrón de Importación

### **Flujo de Importación**

```python
# 1. En views.py
from .models import Cliente, Credito
from .serializers import ClienteSerializer
from .services import ClienteService

# 2. models.py importa de domain
from .domain.entities import Client, Credit
Cliente = Client  # Alias

# 3. serializers.py importa de infrastructure
from .infrastructure.serializers import ClientSerializer
ClienteSerializer = ClientSerializer  # Alias

# 4. services.py importa de application
from .application.services.simple_client_service import SimpleClientService
```

### **Ventajas de Este Patrón**

✅ **Compatibilidad**: Código existente sigue funcionando  
✅ **Modularidad**: Cambios aislados por capa  
✅ **Escalabilidad**: Fácil agregar nuevas funcionalidades  
✅ **Testing**: Cada capa se puede testear independientemente  
✅ **Mantenimiento**: Código organizado y fácil de entender  

---

## 🎯 Casos de Uso Específicos

### **1. Búsqueda de Cliente por Cédula**

```python
# Flujo completo:
# 1. Request: GET /api/clientes/buscar_por_cedula/?num_doc=10000001
# 2. ViewSet: ClienteViewSet.buscar_por_cedula()
# 3. Service: SimpleClientService.get_client_by_document()
# 4. Manager: ClientManager.search_by_document()
# 5. Database: SELECT * FROM core.clientes WHERE num_doc='10000001'
# 6. Serializer: ClientSerializer
# 7. Response: JSON con datos del cliente
```

### **2. Cronograma de Repartidor**

```python
# Flujo completo:
# 1. Request: GET /api/repartidor/cronograma_resumido/?cliente_id=11
# 2. ViewSet: RepartidorCronogramaViewSet.cronograma_resumido()
# 3. Service: SimpleClientService.get_client_dashboard()
# 4. Manager: PaymentScheduleManager.by_client()
# 5. Database: JOIN queries para obtener cronograma completo
# 6. Serializer: PaymentScheduleSerializer + lógica personalizada
# 7. Response: JSON con cronograma ordenado por fecha
```

---

## 🚀 Beneficios de Esta Arquitectura

### **1. Mantenibilidad**
- ✅ Código organizado por responsabilidades
- ✅ Fácil localizar y modificar funcionalidades
- ✅ Cambios aislados por capa

### **2. Escalabilidad**
- ✅ Fácil agregar nuevas entidades
- ✅ Nuevos casos de uso sin afectar existentes
- ✅ Integración con nuevos sistemas

### **3. Testabilidad**
- ✅ Cada capa se puede testear independientemente
- ✅ Mocks y stubs fáciles de implementar
- ✅ Testing unitario y de integración

### **4. Flexibilidad**
- ✅ Cambiar implementación sin afectar lógica de negocio
- ✅ Múltiples interfaces (API, CLI, etc.)
- ✅ Diferentes bases de datos

### **5. Compatibilidad**
- ✅ Django admin funciona automáticamente
- ✅ Migraciones funcionan sin cambios
- ✅ Código legacy sigue funcionando

---

## 📊 Resumen de Archivos por Responsabilidad

| **Archivo** | **Responsabilidad** | **Líneas** | **Ubicación** |
|-------------|-------------------|------------|---------------|
| `models.py` | Punto de entrada de entidades | 28 | `core/` |
| `managers.py` | Punto de entrada de managers | 24 | `core/` |
| `serializers.py` | Punto de entrada de serializers | 46 | `core/` |
| `services.py` | Punto de entrada de servicios | 72 | `core/` |
| `views.py` | Controladores HTTP | 652 | `core/` |
| `urls.py` | Enrutamiento | 21 | `core/` |
| `exceptions.py` | Manejo de errores | 118 | `core/` |
| `client.py` | Entidad Cliente | ~60 | `domain/entities/` |
| `credit.py` | Entidad Crédito | ~50 | `domain/entities/` |
| `payment_schedule.py` | Entidad Cronograma | ~70 | `domain/entities/` |
| `payment.py` | Entidad Pago | ~40 | `domain/entities/` |
| `client_manager.py` | Manager de Cliente | ~40 | `domain/repositories/` |
| `credit_manager.py` | Manager de Crédito | ~30 | `domain/repositories/` |
| `payment_schedule_manager.py` | Manager de Cronograma | ~60 | `domain/repositories/` |

---

## 🎯 Conclusión

Esta arquitectura híbrida nos permite:

1. **✅ Mantener compatibilidad** con Django y código existente
2. **✅ Aplicar principios SOLID** y Clean Architecture
3. **✅ Organizar código** por responsabilidades claras
4. **✅ Facilitar testing** y mantenimiento
5. **✅ Escalar** la aplicación fácilmente
6. **✅ Separar** lógica de negocio de detalles técnicos

El resultado es un backend **robusto**, **mantenible** y **escalable** que cumple con todos los principios de Clean Code y arquitectura de software moderna, mientras mantiene la simplicidad y compatibilidad que Django proporciona.
