from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from decimal import Decimal
from ..repositories.credito_manager import CreditoManager


class Credito(models.Model):
    """Entidad de dominio para créditos de e-bikes/e-mopeds"""
    
    PRODUCTO_CHOICES = [
        ('e-bike', 'E-Bike'),
        ('e-moped', 'E-Moped'),
    ]
    
    ESTADO_CHOICES = [
        ('vigente', 'Vigente'),
        ('cancelado', 'Cancelado'),
        ('castigado', 'Castigado'),
    ]
    
    credito_id = models.BigAutoField(primary_key=True)
    cliente = models.ForeignKey(
        'Cliente',
        on_delete=models.CASCADE,
        related_name='creditos',
        help_text="Cliente propietario del crédito"
    )
    producto = models.CharField(
        max_length=20,
        choices=PRODUCTO_CHOICES,
        help_text="Tipo de producto financiado"
    )
    inversion = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        validators=[MinValueValidator(Decimal('100000'))],
        help_text="Valor total del crédito"
    )
    cuotas_totales = models.PositiveIntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(60)],
        help_text="Número total de cuotas"
    )
    tea = models.DecimalField(
        max_digits=8,
        decimal_places=6,
        validators=[MinValueValidator(Decimal('0.01')), MaxValueValidator(Decimal('1.00'))],
        help_text="Tasa efectiva anual"
    )
    fecha_desembolso = models.DateField(
        help_text="Fecha en que se desembolsó el crédito"
    )
    fecha_inicio_pago = models.DateField(
        help_text="Fecha de inicio del cronograma de pagos"
    )
    estado = models.CharField(
        max_length=20,
        choices=ESTADO_CHOICES,
        default='vigente',
        help_text="Estado actual del crédito"
    )
    
    objects = CreditoManager()
    
    class Meta:
        db_table = 'core.creditos'
        verbose_name = 'Crédito'
        verbose_name_plural = 'Créditos'
    
    def __str__(self):
        return f"{self.producto} - {self.cliente.nombre} (${self.inversion:,.0f})"
    
    @property
    def valor_cuota(self):
        """Calcula el valor de cada cuota"""
        return round(self.inversion / self.cuotas_totales, -1)
    
    def esta_vigente(self):
        """Verifica si el crédito está vigente"""
        return self.estado == 'vigente'
