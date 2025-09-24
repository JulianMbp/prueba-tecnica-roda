"""
Main managers module - imports all custom managers
This file maintains backward compatibility while using the new modular structure
"""

# Import all custom managers
from .domain.repositories import (
    ClientManager,
    CreditManager,
    PaymentScheduleManager
)

# Maintain backward compatibility with old names
ClienteManager = ClientManager
CreditoManager = CreditManager

__all__ = [
    'ClientManager',
    'CreditManager',
    'PaymentScheduleManager',
    # Backward compatibility
    'ClienteManager',
    'CreditoManager'
]