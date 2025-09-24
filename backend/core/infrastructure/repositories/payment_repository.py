from django.core.exceptions import ObjectDoesNotExist
from ...domain.entities import Payment
from ...application.use_cases.payment_use_cases import PaymentRepository


class PaymentRepositoryImpl(PaymentRepository):
    """Django implementation of PaymentRepository"""
    
    def get_by_id(self, payment_id: int):
        """Get payment by ID"""
        try:
            return Payment.objects.get(payment_id=payment_id)
        except ObjectDoesNotExist:
            return None
    
    def get_by_schedule(self, schedule_id: int):
        """Get payments by schedule ID"""
        return Payment.objects.filter(schedule_id=schedule_id)
    
    def get_by_client(self, client_id: int):
        """Get payments by client ID"""
        return Payment.objects.filter(
            schedule__credit__client_id=client_id
        ).select_related('schedule__credit__client')
    
    def get_by_date_range(self, start_date, end_date):
        """Get payments by date range"""
        return Payment.objects.filter(
            payment_date__date__range=[start_date, end_date]
        )
    
    def get_by_payment_method(self, payment_method: str):
        """Get payments by payment method"""
        return Payment.objects.filter(payment_method=payment_method)
    
    def get_summary_by_client(self, client_id: int):
        """Get payment summary by client"""
        payments = self.get_by_client(client_id)
        return payments.aggregate(
            total_amount=models.Sum('amount'),
            total_payments=models.Count('payment_id'),
            avg_amount=models.Avg('amount')
        )
