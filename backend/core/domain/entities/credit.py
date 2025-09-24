from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from decimal import Decimal
from ..repositories.credit_manager import CreditManager


class Credit(models.Model):
    """Domain entity for e-bike/e-moped credits"""
    
    PRODUCT_CHOICES = [
        ('e-bike', 'E-Bike'),
        ('e-moped', 'E-Moped'),
    ]
    
    STATUS_CHOICES = [
        ('active', 'Active'),
        ('cancelled', 'Cancelled'),
        ('written_off', 'Written Off'),
    ]
    
    credito_id = models.BigAutoField(primary_key=True)
    cliente = models.ForeignKey(
        'Client',
        on_delete=models.CASCADE,
        related_name='creditos',
        help_text="Credit owner client"
    )
    producto = models.CharField(
        max_length=20,
        choices=PRODUCT_CHOICES,
        help_text="Financed product type"
    )
    inversion = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        validators=[MinValueValidator(Decimal('100000'))],
        help_text="Total credit value"
    )
    cuotas_totales = models.PositiveIntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(60)],
        help_text="Total number of installments"
    )
    tea = models.DecimalField(
        max_digits=8,
        decimal_places=6,
        validators=[MinValueValidator(Decimal('0.01')), MaxValueValidator(Decimal('1.00'))],
        help_text="Annual effective rate"
    )
    fecha_desembolso = models.DateField(
        help_text="Credit disbursement date"
    )
    fecha_inicio_pago = models.DateField(
        help_text="Payment schedule start date"
    )
    estado = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='vigente',
        help_text="Current credit status"
    )
    
    objects = CreditManager()
    
    class Meta:
        db_table = 'core.creditos'
        verbose_name = 'Credit'
        verbose_name_plural = 'Credits'
    
    def __str__(self):
        return f"{self.producto} - {self.cliente.nombre} (${self.inversion:,.0f})"
    
    @property
    def valor_cuota(self):
        """Calculates each installment value"""
        return round(self.inversion / self.cuotas_totales, -1)
    
    def is_active(self):
        """Checks if credit is active"""
        return self.estado == 'vigente'
