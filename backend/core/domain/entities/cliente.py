from django.db import models
from ..repositories.cliente_manager import ClienteManager


class Cliente(models.Model):
    """Domain entity for Roda clients"""
    
    DOC_TYPE_CHOICES = [
        ('CC', 'Citizenship Card'),
        ('CE', 'Foreign ID'),
        ('TI', 'Identity Card'),
        ('PP', 'Passport'),
    ]
    
    cliente_id = models.BigAutoField(primary_key=True)
    doc_type = models.CharField(
        max_length=2, 
        choices=DOC_TYPE_CHOICES,
        help_text="Document type"
    )
    doc_number = models.CharField(
        max_length=20,
        help_text="Document number"
    )
    name = models.CharField(
        max_length=100,
        help_text="Full client name"
    )
    city = models.CharField(
        max_length=50,
        blank=True,
        null=True,
        help_text="Residence city"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    
    objects = ClienteManager()
    
    class Meta:
        db_table = 'core.clientes'
        unique_together = ['tipo_doc', 'num_doc']
        verbose_name = 'Cliente'
        verbose_name_plural = 'Clientes'
    
    def __str__(self):
        return f"{self.nombre} ({self.tipo_doc} {self.num_doc})"
    
    @property
    def documento_completo(self):
        """Retorna el documento completo con tipo"""
        return f"{self.tipo_doc} {self.num_doc}"
    
    def tiene_creditos_vigentes(self):
        """Verifica si el cliente tiene créditos vigentes"""
        return self.creditos.filter(estado='vigente').exists()
    
    def obtener_creditos_activos(self):
        """Obtiene los créditos activos del cliente"""
        return self.creditos.filter(estado='vigente')
