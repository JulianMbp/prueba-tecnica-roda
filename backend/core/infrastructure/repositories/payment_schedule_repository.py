from django.core.exceptions import ObjectDoesNotExist
from ...domain.entities import PaymentSchedule
from ...application.use_cases.client_use_cases import PaymentScheduleRepository as ClientPaymentScheduleRepository
from ...application.use_cases.credit_use_cases import PaymentScheduleRepository as CreditPaymentScheduleRepository
from ...application.use_cases.payment_use_cases import PaymentScheduleRepository as PaymentPaymentScheduleRepository


class PaymentScheduleRepositoryImpl(
    ClientPaymentScheduleRepository,
    CreditPaymentScheduleRepository,
    PaymentPaymentScheduleRepository
):
    """Django implementation of PaymentScheduleRepository"""
    
    def get_by_id(self, schedule_id: int):
        """Get payment schedule by ID"""
        try:
            return PaymentSchedule.objects.get(schedule_id=schedule_id)
        except ObjectDoesNotExist:
            return None
    
    def get_by_client(self, client_id: int):
        """Get payment schedules by client ID"""
        return PaymentSchedule.objects.by_client(client_id).with_balance().with_payments()
    
    def get_by_credit(self, credit_id: int):
        """Get payment schedules by credit ID"""
        return PaymentSchedule.objects.filter(credit_id=credit_id).with_balance().with_payments()
    
    def get_overdue(self):
        """Get overdue payment schedules"""
        return PaymentSchedule.objects.overdue()
    
    def get_by_status(self, status: str):
        """Get payment schedules by status"""
        return PaymentSchedule.objects.filter(status=status)
    
    def get_summary_by_status(self):
        """Get payment schedule summary by status"""
        return PaymentSchedule.objects.summary_by_status()
    
    def calculate_overdue_interest(self, schedule_id: int, overdue_rate):
        """Calculate overdue interest for a schedule"""
        return PaymentSchedule.objects.calculate_overdue_interest(schedule_id, overdue_rate)
