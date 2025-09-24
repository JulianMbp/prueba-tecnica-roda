from django.core.exceptions import ObjectDoesNotExist
from ...domain.entities import Client
from ...application.use_cases.client_use_cases import ClientRepository


class ClientRepositoryImpl(ClientRepository):
    """Django implementation of ClientRepository"""
    
    def get_by_document(self, doc_type: str, doc_number: str):
        """Get client by document type and number"""
        try:
            return Client.objects.get(doc_type=doc_type, doc_number=doc_number)
        except ObjectDoesNotExist:
            return None
    
    def get_by_id(self, client_id: int):
        """Get client by ID"""
        try:
            return Client.objects.get(cliente_id=client_id)
        except ObjectDoesNotExist:
            return None
    
    def search_by_name(self, name: str):
        """Search clients by name"""
        return Client.objects.filter(name__icontains=name)
    
    def get_by_city(self, city: str):
        """Get clients by city"""
        return Client.objects.filter(city__icontains=city)
    
    def filter(self, **kwargs):
        """Filter clients with given criteria"""
        return Client.objects.filter(**kwargs)
    
    def get_with_overdue(self):
        """Get clients with overdue payments"""
        return Client.objects.with_overdue()
    
    def get_with_credits_summary(self):
        """Get clients with credits summary"""
        return Client.objects.with_credits_summary()
