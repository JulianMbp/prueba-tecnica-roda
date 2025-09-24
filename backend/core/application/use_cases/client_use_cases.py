from abc import ABC, abstractmethod
from typing import Optional, Dict, Any
from decimal import Decimal


class ClientRepository(ABC):
    """Abstract repository for client operations"""
    
    @abstractmethod
    def get_by_document(self, doc_type: str, doc_number: str):
        pass
    
    @abstractmethod
    def search_by_name(self, name: str):
        pass
    
    @abstractmethod
    def get_by_city(self, city: str):
        pass


class PaymentScheduleRepository(ABC):
    """Abstract repository for payment schedule operations"""
    
    @abstractmethod
    def get_by_client(self, client_id: int):
        pass


class GetClientByDocumentUseCase:
    """Use case for getting client by document number"""
    
    def __init__(self, client_repo: ClientRepository):
        self.client_repo = client_repo
    
    def execute(self, doc_type: str = 'CC', doc_number: str = None):
        if not doc_number:
            raise ValueError("Document number is required")
        
        return self.client_repo.get_by_document(doc_type, doc_number)


class GetClientScheduleUseCase:
    """Use case for getting client payment schedule"""
    
    def __init__(self, client_repo: ClientRepository, schedule_repo: PaymentScheduleRepository):
        self.client_repo = client_repo
        self.schedule_repo = schedule_repo
    
    def execute(self, client_id: int):
        # Get client
        client = self.client_repo.get_by_id(client_id)
        if not client:
            raise ValueError(f"Client with ID {client_id} not found")
        
        # Get payment schedule
        schedules = self.schedule_repo.get_by_client(client_id)
        
        return {
            'client': client,
            'schedules': schedules
        }


class SearchClientsUseCase:
    """Use case for searching clients"""
    
    def __init__(self, client_repo: ClientRepository):
        self.client_repo = client_repo
    
    def execute(self, filters: Dict[str, Any]):
        query = {}
        
        if filters.get('doc_type'):
            query['doc_type'] = filters['doc_type']
        
        if filters.get('doc_number'):
            query['doc_number__icontains'] = filters['doc_number']
        
        if filters.get('name'):
            query['name__icontains'] = filters['name']
        
        if filters.get('city'):
            query['city__icontains'] = filters['city']
        
        return self.client_repo.filter(**query)
