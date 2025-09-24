"""
Main services module - imports all application services
This file maintains backward compatibility while using the new modular structure
"""

# Import simple services that use Django managers directly
from .application.services.simple_client_service import SimpleClientService
from .application.services.simple_credit_service import SimpleCreditService
from .application.services.simple_payment_service import SimplePaymentService

# Create service instances
client_service = SimpleClientService()
credit_service = SimpleCreditService()
payment_service = SimplePaymentService()

# Legacy service classes for backward compatibility
class PaymentScheduleService:
    """Legacy service class for backward compatibility"""
    
    @staticmethod
    def get_cliente_cronograma(cliente_id):
        return client_service.get_client_dashboard(cliente_id)
    
    @staticmethod
    def get_credito_cronograma(credito_id):
        return credit_service.get_credit_financial_resume(credito_id)
    
    @staticmethod
    def get_cuotas_vencidas(cliente_id=None):
        from .models import PaymentSchedule
        if cliente_id:
            return PaymentSchedule.objects.by_client(cliente_id).overdue()
        return PaymentSchedule.objects.overdue()

class ClienteService:
    """Legacy service class for backward compatibility"""
    
    @staticmethod
    def get_clientes_con_mora():
        return client_service.get_clients_with_overdue()
    
    @staticmethod
    def get_cliente_dashboard(cliente_id):
        return client_service.get_client_dashboard(cliente_id)
    
    @staticmethod
    def get_resumen_cliente(cliente_id):
        return client_service.get_client_dashboard(cliente_id)

class CreditoService:
    """Legacy service class for backward compatibility"""
    
    @staticmethod
    def get_creditos_por_cliente(cliente_id):
        return credit_service.get_credits_by_client(cliente_id)
    
    @staticmethod
    def get_credito_resumen_financiero(credito_id):
        return credit_service.get_credit_financial_resume(credito_id)

__all__ = [
    'ClientService',
    'CreditService',
    'PaymentService',
    'client_service',
    'credit_service',
    'payment_service',
    # Legacy compatibility
    'PaymentScheduleService',
    'ClienteService',
    'CreditoService'
]