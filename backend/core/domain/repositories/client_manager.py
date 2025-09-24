from django.db import models
from django.db.models import Sum


class ClientManager(models.Manager):
    """Custom manager for client queries"""
    
    def get_queryset(self):
        return super().get_queryset()

    def with_credits_summary(self):
        return self.annotate(
            total_credits=models.Count('creditos'),
            total_investment_credits=Sum('creditos__inversion')
        )

    def with_overdue(self):
        # Clients who have at least one overdue payment
        return self.filter(
            creditos__payment_schedules__estado='vencida'
        ).distinct()

    def by_city(self, city):
        return self.filter(ciudad__icontains=city)

    def by_document_type(self, doc_type):
        return self.filter(tipo_doc=doc_type)

    def search_by_document(self, doc_type, doc_number):
        return self.filter(tipo_doc=doc_type, num_doc=doc_number)

    def search_by_name(self, name):
        return self.filter(nombre__icontains=name)
