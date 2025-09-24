from ...infrastructure.repositories import (
    ClientRepositoryImpl,
    PaymentScheduleRepositoryImpl
)
from ..use_cases.client_use_cases import (
    GetClientByDocumentUseCase,
    GetClientScheduleUseCase,
    SearchClientsUseCase
)


class ClientService:
    """Application service for client operations"""
    
    def __init__(self):
        self.client_repo = ClientRepositoryImpl()
        self.schedule_repo = PaymentScheduleRepositoryImpl()
        
        # Initialize use cases
        self.get_client_by_document_use_case = GetClientByDocumentUseCase(self.client_repo)
        self.get_client_schedule_use_case = GetClientScheduleUseCase(self.client_repo, self.schedule_repo)
        self.search_clients_use_case = SearchClientsUseCase(self.client_repo)
    
    def get_client_by_document(self, doc_type: str = 'CC', doc_number: str = None):
        """Get client by document number"""
        return self.get_client_by_document_use_case.execute(doc_type, doc_number)
    
    def get_client_schedule(self, client_id: int):
        """Get client payment schedule"""
        return self.get_client_schedule_use_case.execute(client_id)
    
    def search_clients(self, filters: dict):
        """Search clients with filters"""
        return self.search_clients_use_case.execute(filters)
    
    def get_clients_with_overdue(self):
        """Get clients with overdue payments"""
        return self.client_repo.get_with_overdue()
    
    def get_client_dashboard(self, client_id: int):
        """Get client dashboard data"""
        client = self.client_repo.get_by_id(client_id)
        if not client:
            raise ValueError(f"Client with ID {client_id} not found")
        
        schedules = self.schedule_repo.get_by_client(client_id)
        
        # Calculate summary
        summary = self._calculate_client_summary(schedules)
        
        return {
            'client': client,
            'schedules': schedules,
            'summary': summary
        }
    
    def _calculate_client_summary(self, schedules):
        """Calculate client financial summary"""
        total_schedules = schedules.count()
        paid_schedules = schedules.filter(status='paid').count()
        overdue_schedules = schedules.filter(status='overdue').count()
        pending_schedules = schedules.filter(status='pending').count()
        partial_schedules = schedules.filter(status='partial').count()
        
        total_amount = sum(s.installment_value for s in schedules)
        paid_amount = sum(s.amount_paid for s in schedules)
        pending_amount = total_amount - paid_amount
        
        return {
            'total_schedules': total_schedules,
            'paid_schedules': paid_schedules,
            'overdue_schedules': overdue_schedules,
            'pending_schedules': pending_schedules,
            'partial_schedules': partial_schedules,
            'total_amount': total_amount,
            'paid_amount': paid_amount,
            'pending_amount': pending_amount,
            'payment_percentage': (paid_amount / total_amount * 100) if total_amount > 0 else 0
        }
