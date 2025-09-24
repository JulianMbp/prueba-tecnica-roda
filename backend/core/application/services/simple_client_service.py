from ...domain.entities import Client, PaymentSchedule
from decimal import Decimal


class SimpleClientService:
    """Simple client service using Django managers directly"""
    
    def get_client_by_document(self, doc_type: str = 'CC', doc_number: str = None):
        """Get client by document number"""
        try:
            return Client.objects.get(tipo_doc=doc_type, num_doc=doc_number)
        except Client.DoesNotExist:
            return None
    
    def get_client_dashboard(self, client_id: int):
        """Get client dashboard data"""
        try:
            client = Client.objects.get(cliente_id=client_id)
        except Client.DoesNotExist:
            raise ValueError(f"Client with ID {client_id} not found")
        
        # Get all payment schedules for this client
        schedules = PaymentSchedule.objects.by_client(client_id)
        
        # Calculate summary
        summary = self._calculate_client_summary(schedules)
        
        return {
            'cliente': client,
            'cronogramas': schedules,
            'resumen': summary
        }
    
    def get_clients_with_overdue(self):
        """Get clients with overdue payments"""
        return Client.objects.with_overdue()
    
    def _calculate_client_summary(self, schedules):
        """Calculate client financial summary"""
        total_schedules = schedules.count()
        paid_schedules = schedules.filter(estado='pagada').count()
        overdue_schedules = schedules.filter(estado='vencida').count()
        pending_schedules = schedules.filter(estado='pendiente').count()
        partial_schedules = schedules.filter(estado='parcial').count()
        
        total_amount = sum(s.valor_cuota for s in schedules)
        paid_amount = sum(s.monto_pagado for s in schedules)
        pending_amount = total_amount - paid_amount
        
        return {
            'total_schedules': total_schedules,
            'paid_schedules': paid_schedules,
            'overdue_schedules': overdue_schedules,
            'pending_schedules': pending_schedules,
            'partial_schedules': partial_schedules,
            'total_amount': float(total_amount),
            'paid_amount': float(paid_amount),
            'pending_amount': float(pending_amount),
            'payment_percentage': (float(paid_amount) / float(total_amount) * 100) if total_amount > 0 else 0
        }
