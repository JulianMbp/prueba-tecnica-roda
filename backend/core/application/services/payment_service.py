from decimal import Decimal
from ...infrastructure.repositories import (
    PaymentScheduleRepositoryImpl,
    PaymentRepositoryImpl
)
from ..use_cases.payment_use_cases import (
    GetPaymentSummaryUseCase,
    CalculateOverdueInterestUseCase
)


class PaymentService:
    """Application service for payment operations"""
    
    def __init__(self):
        self.schedule_repo = PaymentScheduleRepositoryImpl()
        self.payment_repo = PaymentRepositoryImpl()
        
        # Initialize use cases
        self.get_payment_summary_use_case = GetPaymentSummaryUseCase(self.schedule_repo, self.payment_repo)
        self.calculate_overdue_interest_use_case = CalculateOverdueInterestUseCase(self.schedule_repo)
    
    def get_payment_summary(self, client_id: int):
        """Get payment summary for client"""
        return self.get_payment_summary_use_case.execute(client_id)
    
    def calculate_overdue_interest(self, schedule_id: int, overdue_rate: Decimal = Decimal('0.02')):
        """Calculate overdue interest for a schedule"""
        return self.calculate_overdue_interest_use_case.execute(schedule_id, overdue_rate)
    
    def get_overdue_schedules(self):
        """Get all overdue payment schedules"""
        return self.schedule_repo.get_overdue()
    
    def get_schedules_by_status(self, status: str):
        """Get payment schedules by status"""
        return self.schedule_repo.get_by_status(status)
    
    def get_payment_schedule_summary(self, client_id: int):
        """Get comprehensive payment schedule summary"""
        schedules = self.schedule_repo.get_by_client(client_id)
        
        if not schedules.exists():
            return {
                'total_schedules': 0,
                'paid_schedules': 0,
                'overdue_schedules': 0,
                'pending_schedules': 0,
                'partial_schedules': 0,
                'total_amount': 0,
                'paid_amount': 0,
                'pending_amount': 0,
                'payment_percentage': 0,
                'average_overdue_days': 0
            }
        
        # Calculate summary
        total_schedules = schedules.count()
        paid_schedules = schedules.filter(status='paid').count()
        overdue_schedules = schedules.filter(status='overdue').count()
        pending_schedules = schedules.filter(status='pending').count()
        partial_schedules = schedules.filter(status='partial').count()
        
        total_amount = sum(s.installment_value for s in schedules)
        paid_amount = sum(s.amount_paid for s in schedules)
        pending_amount = total_amount - paid_amount
        
        # Calculate average overdue days
        overdue_schedules_with_days = schedules.filter(status='overdue')
        if overdue_schedules_with_days.exists():
            average_overdue_days = sum(s.days_overdue for s in overdue_schedules_with_days) / overdue_schedules_with_days.count()
        else:
            average_overdue_days = 0
        
        return {
            'total_schedules': total_schedules,
            'paid_schedules': paid_schedules,
            'overdue_schedules': overdue_schedules,
            'pending_schedules': pending_schedules,
            'partial_schedules': partial_schedules,
            'total_amount': total_amount,
            'paid_amount': paid_amount,
            'pending_amount': pending_amount,
            'payment_percentage': (paid_amount / total_amount * 100) if total_amount > 0 else 0,
            'average_overdue_days': average_overdue_days
        }
    
    def get_payments_by_client(self, client_id: int):
        """Get payments by client ID"""
        return self.payment_repo.get_by_client(client_id)
    
    def get_payments_by_schedule(self, schedule_id: int):
        """Get payments by schedule ID"""
        return self.payment_repo.get_by_schedule(schedule_id)
    
    def get_payment_summary_by_client(self, client_id: int):
        """Get payment summary by client"""
        return self.payment_repo.get_summary_by_client(client_id)
