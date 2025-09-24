"""
Main models module - imports all domain entities
This file maintains backward compatibility while using the new modular structure
"""

# Import all domain entities
from .domain.entities import (
    Client,
    Credit,
    PaymentSchedule,
    Payment
)

# Maintain backward compatibility with old names
Cliente = Client
Credito = Credit
Pago = Payment

__all__ = [
    'Client',
    'Credit', 
    'PaymentSchedule',
    'Payment',
    # Backward compatibility
    'Cliente',
    'Credito',
    'Pago'
]