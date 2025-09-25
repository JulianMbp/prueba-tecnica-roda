"""
Paginación personalizada para la aplicación
"""
from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response


class CustomPageNumberPagination(PageNumberPagination):
    """
    Paginación personalizada que permite desactivar la paginación
    cuando se pasa el parámetro 'all=true'
    """
    page_size = 20
    page_size_query_param = 'page_size'
    max_page_size = 1000
    
    def paginate_queryset(self, queryset, request, view=None):
        """
        Pagina el queryset. Si se pasa 'all=true', retorna None para desactivar paginación
        """
        # Verificar si se solicita obtener todos los resultados
        if request.query_params.get('all', '').lower() == 'true':
            return None
            
        return super().paginate_queryset(queryset, request, view)
    
    def get_paginated_response(self, data):
        """
        Retorna respuesta paginada con metadatos adicionales
        """
        return Response({
            'count': self.page.paginator.count,
            'next': self.get_next_link(),
            'previous': self.get_previous_link(),
            'total_pages': self.page.paginator.num_pages,
            'current_page': self.page.number,
            'page_size': self.get_page_size(self.request),
            'results': data
        })


class SmallResultsPagination(CustomPageNumberPagination):
    """
    Paginación para resultados pequeños (10 elementos por página)
    """
    page_size = 10
    max_page_size = 100


class LargeResultsPagination(CustomPageNumberPagination):
    """
    Paginación para resultados grandes (50 elementos por página)
    """
    page_size = 50
    max_page_size = 500
