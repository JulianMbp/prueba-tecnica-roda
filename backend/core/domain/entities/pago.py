from django.db import models
from decimal import Decimal


class Pago(models.Model):
    """Entidad de dominio para pagos realizados"""
    
    MEDIO_CHOICES = [
        ('app', 'App Móvil'),
        ('efectivo', 'Efectivo'),
        ('link', 'Link de Pago'),
        ('transferencia', 'Transferencia'),
        ('tarjeta', 'Tarjeta'),
    ]
    
    pago_id = models.BigAutoField(primary_key=True)
    schedule = models.ForeignKey(
        'PaymentSchedule',
        on_delete=models.CASCADE,
        related_name='pagos',
        help_text="Cuota a la que corresponde este pago"
    )
    fecha_pago = models.DateTimeField(
        help_text="Fecha y hora del pago"
    )
    monto = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        help_text="Monto pagado"
    )
    medio = models.CharField(
        max_length=20,
        choices=MEDIO_CHOICES,
        blank=True,
        null=True,
        help_text="Medio utilizado para el pago"
    )
    
    class Meta:
        db_table = 'core.pagos'
        verbose_name = 'Pago'
        verbose_name_plural = 'Pagos'
    
    def __str__(self):
        return f"Pago ${self.monto:,.0f} - {self.schedule}"
    
    def es_pago_completo(self):
        """Verifica si este pago completa la cuota"""
        return self.monto >= self.schedule.valor_cuota
    
    def es_pago_parcial(self):
        """Verifica si este pago es parcial"""
        return self.monto < self.schedule.valor_cuota
