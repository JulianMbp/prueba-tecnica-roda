from ...infrastructure.repositories import (
    CreditRepositoryImpl,
    PaymentScheduleRepositoryImpl
)
from ..use_cases.credit_use_cases import (
    GetCreditScheduleUseCase,
    GetCreditSummaryUseCase
)


class CreditService:
    """Application service for credit operations"""
    
    def __init__(self):
        self.credit_repo = CreditRepositoryImpl()
        self.schedule_repo = PaymentScheduleRepositoryImpl()
        
        # Initialize use cases
        self.get_credit_schedule_use_case = GetCreditScheduleUseCase(self.credit_repo, self.schedule_repo)
        self.get_credit_summary_use_case = GetCreditSummaryUseCase(self.credit_repo)
    
    def get_credit_schedule(self, credit_id: int):
        """Get credit payment schedule"""
        return self.get_credit_schedule_use_case.execute(credit_id)
    
    def get_credit_summary(self, credit_id: int):
        """Get credit financial summary"""
        return self.get_credit_summary_use_case.execute(credit_id)
    
    def get_credits_by_client(self, client_id: int):
        """Get credits by client ID"""
        return self.credit_repo.get_by_client(client_id)
    
    def get_active_credits(self):
        """Get all active credits"""
        return self.credit_repo.get_active()
    
    def get_credits_by_product(self, product: str):
        """Get credits by product"""
        return self.credit_repo.get_by_product(product)
    
    def get_credits_by_date_range(self, start_date, end_date):
        """Get credits by date range"""
        return self.credit_repo.get_by_date_range(start_date, end_date)
    
    def get_credit_financial_resume(self, credit_id: int):
        """Get credit financial resume with detailed information"""
        credit = self.credit_repo.get_by_id(credit_id)
        if not credit:
            raise ValueError(f"Credit with ID {credit_id} not found")
        
        schedules = self.schedule_repo.get_by_credit(credit_id)
        
        # Calculate detailed summary
        summary = self._calculate_credit_summary(credit, schedules)
        
        return {
            'credit': credit,
            'schedules': schedules,
            'summary': summary
        }
    
    def _calculate_credit_summary(self, credit, schedules):
        """Calculate detailed credit summary"""
        total_schedules = schedules.count()
        paid_schedules = schedules.filter(status='paid').count()
        overdue_schedules = schedules.filter(status='overdue').count()
        pending_schedules = schedules.filter(status='pending').count()
        partial_schedules = schedules.filter(status='partial').count()
        
        total_value = credit.investment
        paid_amount = sum(s.amount_paid for s in schedules)
        pending_amount = total_value - paid_amount
        
        return {
            'credit_id': credit.credit_id,
            'product': credit.product,
            'total_schedules': total_schedules,
            'paid_schedules': paid_schedules,
            'overdue_schedules': overdue_schedules,
            'pending_schedules': pending_schedules,
            'partial_schedules': partial_schedules,
            'total_value': total_value,
            'paid_amount': paid_amount,
            'pending_amount': pending_amount,
            'payment_percentage': (paid_amount / total_value * 100) if total_value > 0 else 0
        }
