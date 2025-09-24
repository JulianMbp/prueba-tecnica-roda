from django.db import models
from django.db.models import Sum


class CreditManager(models.Manager):
    """Custom manager for credit queries"""
    
    def get_queryset(self):
        return super().get_queryset().select_related('cliente')

    def with_financial_summary(self):
        return self.annotate(
            total_investment=Sum('inversion'),
            total_installments=Sum('cuotas_totales')
        )

    def by_client(self, client_id):
        return self.filter(cliente_id=client_id)

    def active(self):
        return self.filter(estado='vigente')

    def by_product(self, product):
        return self.filter(producto=product)

    def by_date_range(self, start_date, end_date):
        return self.filter(
            fecha_desembolso__range=[start_date, end_date]
        )
