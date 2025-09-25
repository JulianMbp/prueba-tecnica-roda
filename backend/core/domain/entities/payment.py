from django.db import models
from decimal import Decimal


class Payment(models.Model):
    """Domain entity for payments made"""
    
    PAYMENT_METHOD_CHOICES = [
        ('app', 'Mobile App'),
        ('cash', 'Cash'),
        ('link', 'Payment Link'),
        ('transfer', 'Transfer'),
        ('card', 'Card'),
    ]
    
    pago_id = models.BigAutoField(primary_key=True)
    credito = models.ForeignKey(
        'Credit',
        on_delete=models.CASCADE,
        related_name='pagos',
        help_text="Credit this payment contributes to",
        null=True,  # se establece NOT NULL en migración posterior al backfill
        blank=True
    )
    schedule = models.ForeignKey(
        'PaymentSchedule',
        on_delete=models.CASCADE,
        related_name='pagos',
        help_text="Installment this payment corresponds to"
    )
    fecha_pago = models.DateTimeField(
        help_text="Payment date and time"
    )
    monto = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        help_text="Payment amount"
    )
    medio = models.CharField(
        max_length=20,
        choices=PAYMENT_METHOD_CHOICES,
        blank=True,
        null=True,
        help_text="Payment method used"
    )
    
    class Meta:
        db_table = 'core.pagos'
        verbose_name = 'Payment'
        verbose_name_plural = 'Payments'
    
    def __str__(self):
        return f"Payment ${self.monto:,.0f} - {self.schedule}"
    
    def is_full_payment(self):
        """Checks if this payment completes the installment"""
        return self.monto >= self.schedule.valor_cuota
    
    def is_partial_payment(self):
        """Checks if this payment is partial"""
        return self.monto < self.schedule.valor_cuota
