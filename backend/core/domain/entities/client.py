from django.db import models
from ..repositories.client_manager import ClientManager


class Client(models.Model):
    """Domain entity for Roda clients"""
    
    DOC_TYPE_CHOICES = [
        ('CC', 'Citizenship Card'),
        ('CE', 'Foreign ID'),
        ('TI', 'Identity Card'),
        ('PP', 'Passport'),
    ]
    
    cliente_id = models.BigAutoField(primary_key=True)
    tipo_doc = models.CharField(
        max_length=2, 
        choices=DOC_TYPE_CHOICES,
        help_text="Document type"
    )
    num_doc = models.CharField(
        max_length=20,
        help_text="Document number"
    )
    nombre = models.CharField(
        max_length=100,
        help_text="Full client name"
    )
    ciudad = models.CharField(
        max_length=50,
        blank=True,
        null=True,
        help_text="Residence city"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    
    objects = ClientManager()
    
    class Meta:
        db_table = 'core.clientes'
        unique_together = ['tipo_doc', 'num_doc']
        verbose_name = 'Client'
        verbose_name_plural = 'Clients'
    
    def __str__(self):
        return f"{self.nombre} ({self.tipo_doc} {self.num_doc})"
    
    @property
    def full_document(self):
        """Returns complete document with type"""
        return f"{self.tipo_doc} {self.num_doc}"
    
    def has_active_credits(self):
        """Checks if client has active credits"""
        return self.creditos.filter(estado='vigente').exists()
    
    def get_active_credits(self):
        """Gets client's active credits"""
        return self.creditos.filter(estado='vigente')
