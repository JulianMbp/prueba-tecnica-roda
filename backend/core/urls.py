from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import (
    ClienteViewSet, CreditoViewSet, 
    PaymentScheduleViewSet, PagoViewSet,
    RepartidorCronogramaViewSet
)

# Router para ViewSets
router = DefaultRouter()
router.register(r'clientes', ClienteViewSet)
router.register(r'creditos', CreditoViewSet)
router.register(r'cronograma', PaymentScheduleViewSet)
router.register(r'pagos', PagoViewSet)
router.register(r'repartidor', RepartidorCronogramaViewSet, basename='repartidor')

urlpatterns = [
    path('api/', include(router.urls)),
]
