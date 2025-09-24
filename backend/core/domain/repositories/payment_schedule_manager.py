from django.db import models
from django.db.models import Sum, F, ExpressionWrapper, fields
from django.utils import timezone
from decimal import Decimal


class PaymentScheduleManager(models.Manager):
    """Custom manager for payment schedule queries"""
    
    def get_queryset(self):
        return super().get_queryset().select_related('credito__cliente').prefetch_related('pagos')

    def with_payments(self):
        return self.annotate(
            amount_paid=Sum('pagos__monto', default=Decimal('0.00'))
        )

    def with_balance(self):
        return self.with_payments().annotate(
            pending_balance=F('valor_cuota') - F('amount_paid')
        )

    def overdue(self):
        today = timezone.now().date()
        return self.with_balance().filter(
            fecha_vencimiento__lt=today,
            pending_balance__gt=Decimal('0.00')
        )

    def by_client(self, client_id):
        return self.filter(credito__cliente_id=client_id).order_by('credito__credito_id', 'num_cuota')

    def summary_by_status(self):
        return self.values('estado').annotate(count=models.Count('estado')).order_by('estado')

    def calculate_overdue_interest(self, schedule_id, overdue_rate=Decimal('0.02')):
        try:
            schedule = self.with_balance().get(pk=schedule_id)
        except self.model.DoesNotExist:
            return None

        if schedule.esta_vencida:
            days = schedule.dias_mora
            overdue_interest = schedule.saldo_pendiente * (overdue_rate / Decimal('365')) * days
            return {
                'schedule_id': schedule.schedule_id,
                'days_overdue': days,
                'pending_balance': schedule.saldo_pendiente,
                'overdue_interest': overdue_interest.quantize(Decimal('0.01')),
                'total_with_overdue': (schedule.saldo_pendiente + overdue_interest).quantize(Decimal('0.01'))
            }
        return {
            'schedule_id': schedule.schedule_id,
            'days_overdue': 0,
            'pending_balance': schedule.saldo_pendiente,
            'overdue_interest': Decimal('0.00'),
            'total_with_overdue': schedule.saldo_pendiente
        }
