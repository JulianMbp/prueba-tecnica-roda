from django.db import models
from django.utils import timezone
from decimal import Decimal
from ..repositories.payment_schedule_manager import PaymentScheduleManager


class PaymentSchedule(models.Model):
    """Domain entity for payment schedule"""
    
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('partial', 'Partial Payment'),
        ('paid', 'Paid'),
        ('overdue', 'Overdue'),
    ]
    
    schedule_id = models.BigAutoField(primary_key=True)
    credito = models.ForeignKey(
        'Credit',
        on_delete=models.CASCADE,
        related_name='payment_schedules',
        help_text="Credit this installment belongs to"
    )
    num_cuota = models.PositiveIntegerField(
        help_text="Installment number"
    )
    fecha_vencimiento = models.DateField(
        help_text="Installment due date"
    )
    valor_cuota = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        help_text="Amount to pay in this installment"
    )
    estado = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='pendiente',
        help_text="Current installment status"
    )
    
    objects = PaymentScheduleManager()
    
    class Meta:
        db_table = 'core.payment_schedule'
        unique_together = ['credito', 'num_cuota']
        verbose_name = 'Payment Schedule'
        verbose_name_plural = 'Payment Schedules'
    
    def __str__(self):
        return f"Installment {self.num_cuota} - {self.credito.cliente.nombre}"
    
    @property
    def monto_pagado(self):
        """Calculates total amount paid in this installment"""
        return self.pagos.aggregate(
            total=models.Sum('monto')
        )['total'] or Decimal('0.00')
    
    @property
    def saldo_pendiente(self):
        """Calculates pending balance of the installment"""
        return self.valor_cuota - self.monto_pagado
    
    @property
    def esta_vencida(self):
        """Checks if installment is overdue"""
        return (
            self.fecha_vencimiento < timezone.now().date() and
            self.saldo_pendiente > Decimal('0.00')
        )
    
    @property
    def dias_mora(self):
        """Calculates overdue days"""
        if self.esta_vencida:
            return (timezone.now().date() - self.fecha_vencimiento).days
        return 0
