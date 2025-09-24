from abc import ABC, abstractmethod
from typing import Optional, Dict, Any
from decimal import Decimal


class PaymentScheduleRepository(ABC):
    """Abstract repository for payment schedule operations"""
    
    @abstractmethod
    def get_by_id(self, schedule_id: int):
        pass
    
    @abstractmethod
    def get_by_client(self, client_id: int):
        pass


class PaymentRepository(ABC):
    """Abstract repository for payment operations"""
    
    @abstractmethod
    def get_by_schedule(self, schedule_id: int):
        pass


class GetPaymentSummaryUseCase:
    """Use case for getting payment summary"""
    
    def __init__(self, schedule_repo: PaymentScheduleRepository, payment_repo: PaymentRepository):
        self.schedule_repo = schedule_repo
        self.payment_repo = payment_repo
    
    def execute(self, client_id: int):
        schedules = self.schedule_repo.get_by_client(client_id)
        
        # Calculate summary
        total_schedules = schedules.count()
        paid_schedules = schedules.filter(status='paid').count()
        overdue_schedules = schedules.filter(status='overdue').count()
        pending_schedules = schedules.filter(status='pending').count()
        partial_schedules = schedules.filter(status='partial').count()
        
        total_amount = sum(s.installment_value for s in schedules)
        paid_amount = sum(s.amount_paid for s in schedules)
        pending_amount = total_amount - paid_amount
        
        return {
            'total_schedules': total_schedules,
            'paid_schedules': paid_schedules,
            'overdue_schedules': overdue_schedules,
            'pending_schedules': pending_schedules,
            'partial_schedules': partial_schedules,
            'total_amount': total_amount,
            'paid_amount': paid_amount,
            'pending_amount': pending_amount,
            'payment_percentage': (paid_amount / total_amount * 100) if total_amount > 0 else 0
        }


class CalculateOverdueInterestUseCase:
    """Use case for calculating overdue interest"""
    
    def __init__(self, schedule_repo: PaymentScheduleRepository):
        self.schedule_repo = schedule_repo
    
    def execute(self, schedule_id: int, overdue_rate: Decimal = Decimal('0.02')):
        schedule = self.schedule_repo.get_by_id(schedule_id)
        if not schedule:
            raise ValueError(f"Schedule with ID {schedule_id} not found")
        
        if not schedule.is_overdue:
            return {
                'schedule_id': schedule_id,
                'days_overdue': 0,
                'pending_balance': schedule.pending_balance,
                'overdue_interest': Decimal('0.00'),
                'total_with_overdue': schedule.pending_balance
            }
        
        days_overdue = schedule.days_overdue
        overdue_interest = schedule.pending_balance * (overdue_rate / Decimal('365')) * days_overdue
        
        return {
            'schedule_id': schedule_id,
            'days_overdue': days_overdue,
            'pending_balance': schedule.pending_balance,
            'overdue_interest': overdue_interest.quantize(Decimal('0.01')),
            'total_with_overdue': (schedule.pending_balance + overdue_interest).quantize(Decimal('0.01'))
        }
