from abc import ABC, abstractmethod
from typing import Optional, Dict, Any


class CreditRepository(ABC):
    """Abstract repository for credit operations"""
    
    @abstractmethod
    def get_by_id(self, credit_id: int):
        pass
    
    @abstractmethod
    def get_by_client(self, client_id: int):
        pass


class PaymentScheduleRepository(ABC):
    """Abstract repository for payment schedule operations"""
    
    @abstractmethod
    def get_by_credit(self, credit_id: int):
        pass


class GetCreditScheduleUseCase:
    """Use case for getting credit payment schedule"""
    
    def __init__(self, credit_repo: CreditRepository, schedule_repo: PaymentScheduleRepository):
        self.credit_repo = credit_repo
        self.schedule_repo = schedule_repo
    
    def execute(self, credit_id: int):
        # Get credit
        credit = self.credit_repo.get_by_id(credit_id)
        if not credit:
            raise ValueError(f"Credit with ID {credit_id} not found")
        
        # Get payment schedules
        schedules = self.schedule_repo.get_by_credit(credit_id)
        
        return {
            'credit': credit,
            'schedules': schedules
        }


class GetCreditSummaryUseCase:
    """Use case for getting credit financial summary"""
    
    def __init__(self, credit_repo: CreditRepository):
        self.credit_repo = credit_repo
    
    def execute(self, credit_id: int):
        credit = self.credit_repo.get_by_id(credit_id)
        if not credit:
            raise ValueError(f"Credit with ID {credit_id} not found")
        
        # Calculate summary
        total_installments = credit.total_installments
        installment_value = credit.installment_value
        total_value = credit.investment
        
        return {
            'credit_id': credit.credit_id,
            'product': credit.product,
            'total_installments': total_installments,
            'installment_value': installment_value,
            'total_value': total_value,
            'status': credit.status
        }
