from rest_framework.views import exception_handler
from rest_framework.response import Response
from rest_framework import status
from django.http import Http404
from django.core.exceptions import ValidationError
import logging

logger = logging.getLogger(__name__)


class PaymentScheduleException(Exception):
    """Excepción base para errores del cronograma de pagos"""
    pass


class InsufficientPaymentException(PaymentScheduleException):
    """Excepción cuando el pago es insuficiente"""
    pass


class OverpaymentException(PaymentScheduleException):
    """Excepción cuando el pago excede el monto de la cuota"""
    pass


class InvalidScheduleStateException(PaymentScheduleException):
    """Excepción cuando el estado del cronograma es inválido"""
    pass


def custom_exception_handler(exc, context):
    """
    Manejo personalizado de excepciones para la API
    """
    # Obtener respuesta estándar de DRF
    response = exception_handler(exc, context)
    
    if response is not None:
        # Personalizar mensajes de error
        custom_response_data = {
            'error': True,
            'message': 'Ha ocurrido un error',
            'details': response.data,
            'status_code': response.status_code
        }
        
        # Manejar diferentes tipos de errores
        if isinstance(exc, Http404):
            custom_response_data['message'] = 'Recurso no encontrado'
        elif isinstance(exc, ValidationError):
            custom_response_data['message'] = 'Error de validación'
        elif isinstance(exc, PaymentScheduleException):
            custom_response_data['message'] = str(exc)
            custom_response_data['error_type'] = exc.__class__.__name__
        elif response.status_code == 400:
            custom_response_data['message'] = 'Solicitud inválida'
        elif response.status_code == 401:
            custom_response_data['message'] = 'No autorizado'
        elif response.status_code == 403:
            custom_response_data['message'] = 'Acceso denegado'
        elif response.status_code == 404:
            custom_response_data['message'] = 'Recurso no encontrado'
        elif response.status_code == 500:
            custom_response_data['message'] = 'Error interno del servidor'
            logger.error(f"Error interno: {exc}", exc_info=True)
        
        response.data = custom_response_data
    
    return response


def handle_payment_errors(func):
    """
    Decorador para manejar errores específicos de pagos
    """
    def wrapper(*args, **kwargs):
        try:
            return func(*args, **kwargs)
        except InsufficientPaymentException as e:
            return Response(
                {
                    'error': True,
                    'message': 'Pago insuficiente',
                    'details': str(e)
                },
                status=status.HTTP_400_BAD_REQUEST
            )
        except OverpaymentException as e:
            return Response(
                {
                    'error': True,
                    'message': 'Pago excede el monto de la cuota',
                    'details': str(e)
                },
                status=status.HTTP_400_BAD_REQUEST
            )
        except InvalidScheduleStateException as e:
            return Response(
                {
                    'error': True,
                    'message': 'Estado inválido del cronograma',
                    'details': str(e)
                },
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            logger.error(f"Error inesperado en {func.__name__}: {e}", exc_info=True)
            return Response(
                {
                    'error': True,
                    'message': 'Error interno del servidor',
                    'details': 'Contacte al administrador'
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    return wrapper
