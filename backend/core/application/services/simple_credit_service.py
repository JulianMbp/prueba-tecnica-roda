from ...domain.entities import Credit, PaymentSchedule
from decimal import Decimal


class SimpleCreditService:
    """Simple credit service using Django managers directly"""
    
    def get_credits_by_client(self, client_id: int):
        """Get all credits for a client"""
        return Credit.objects.by_client(client_id)
    
    def get_credit_financial_resume(self, credit_id: int):
        """Get credit financial resume"""
        try:
            credit = Credit.objects.get(credito_id=credit_id)
        except Credit.DoesNotExist:
            raise ValueError(f"Credit with ID {credit_id} not found")
        
        # Get all payment schedules for this credit
        schedules = PaymentSchedule.objects.filter(credito=credit)
        
        # Calculate summary
        summary = self._calculate_credit_summary(schedules)
        
        return {
            'credito': credit,
            'cronogramas': schedules,
            'resumen': summary
        }
    
    def _calculate_credit_summary(self, schedules):
        """Calculate credit financial summary"""
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
