"""
Main serializers module - imports all infrastructure serializers
This file maintains backward compatibility while using the new modular structure
"""

# Import all infrastructure serializers
from .infrastructure.serializers import (
    ClientSerializer,
    ClientDashboardSerializer,
    ClientSearchSerializer,
    CreditSerializer,
    CreditSummarySerializer,
    PaymentSerializer,
    PaymentScheduleSerializer,
    PaymentSummarySerializer,
    OverdueInterestSerializer
)

# Create aliases for backward compatibility
PaymentScheduleSummarySerializer = PaymentScheduleSerializer
ClienteCronogramaSerializer = ClientDashboardSerializer
PagoCreateSerializer = PaymentSerializer

# Legacy compatibility aliases
ClienteSerializer = ClientSerializer
CreditoSerializer = CreditSerializer
PagoSerializer = PaymentSerializer

__all__ = [
    'ClientSerializer',
    'ClientDashboardSerializer',
    'ClientSearchSerializer',
    'CreditSerializer',
    'CreditSummarySerializer',
    'PaymentSerializer',
    'PaymentScheduleSerializer',
    'PaymentSummarySerializer',
    'OverdueInterestSerializer',
    'PaymentScheduleSummarySerializer',
    'ClienteCronogramaSerializer',
    'PagoCreateSerializer',
    # Legacy compatibility
    'ClienteSerializer',
    'CreditoSerializer',
    'PagoSerializer'
]