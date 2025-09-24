from django.core.exceptions import ObjectDoesNotExist
from ...domain.entities import Credit
from ...application.use_cases.credit_use_cases import CreditRepository


class CreditRepositoryImpl(CreditRepository):
    """Django implementation of CreditRepository"""
    
    def get_by_id(self, credit_id: int):
        """Get credit by ID"""
        try:
            return Credit.objects.get(credit_id=credit_id)
        except ObjectDoesNotExist:
            return None
    
    def get_by_client(self, client_id: int):
        """Get credits by client ID"""
        return Credit.objects.filter(client_id=client_id)
    
    def get_active(self):
        """Get active credits"""
        return Credit.objects.active()
    
    def get_by_product(self, product: str):
        """Get credits by product"""
        return Credit.objects.by_product(product)
    
    def get_by_date_range(self, start_date, end_date):
        """Get credits by date range"""
        return Credit.objects.by_date_range(start_date, end_date)
    
    def get_with_financial_summary(self):
        """Get credits with financial summary"""
        return Credit.objects.with_financial_summary()
