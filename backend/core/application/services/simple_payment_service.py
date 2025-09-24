from ...domain.entities import Payment, PaymentSchedule
from decimal import Decimal


class SimplePaymentService:
    """Simple payment service using Django managers directly"""
    
    def get_payment_summary(self):
        """Get payment summary statistics"""
        schedules = PaymentSchedule.objects.all()
        
        total_schedules = schedules.count()
        paid_schedules = schedules.filter(estado='pagada').count()
        overdue_schedules = schedules.filter(estado='vencida').count()
        pending_schedules = schedules.filter(estado='pendiente').count()
        partial_schedules = schedules.filter(estado='parcial').count()
        
        total_amount = sum(s.valor_cuota for s in schedules)
        paid_amount = sum(s.monto_pagado for s in schedules)
        pending_amount = total_amount - paid_amount
        
        # Calculate average overdue days
        overdue_schedules_with_days = schedules.filter(estado='vencida')
        total_overdue_days = sum(s.dias_mora for s in overdue_schedules_with_days)
        average_overdue_days = total_overdue_days / overdue_schedules.count() if overdue_schedules.count() > 0 else 0
        
        return {
            'total_schedules': total_schedules,
            'paid_schedules': paid_schedules,
            'overdue_schedules': overdue_schedules,
            'pending_schedules': pending_schedules,
            'partial_schedules': partial_schedules,
            'total_amount': float(total_amount),
            'paid_amount': float(paid_amount),
            'pending_amount': float(pending_amount),
            'payment_percentage': (float(paid_amount) / float(total_amount) * 100) if total_amount > 0 else 0,
            'average_overdue_days': float(average_overdue_days)
        }
    
    def get_overdue_payments(self):
        """Get all overdue payments"""
        return PaymentSchedule.objects.overdue()
    
    def calculate_overdue_interest(self, schedule_id: int, overdue_rate: Decimal = Decimal('0.02')):
        """Calculate overdue interest for a payment schedule"""
        return PaymentSchedule.objects.calculate_overdue_interest(schedule_id, overdue_rate)
