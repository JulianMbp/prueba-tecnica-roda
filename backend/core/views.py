from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from django.shortcuts import get_object_or_404
from django.db.models import Q
from django.utils import timezone

from .models import Cliente, Credito, PaymentSchedule, Pago
from .serializers import (
    ClienteSerializer, CreditoSerializer, PaymentScheduleSerializer,
    PaymentScheduleSummarySerializer, ClienteCronogramaSerializer,
    PagoCreateSerializer
)
from .services import (
    PaymentScheduleService, CreditoService, ClienteService
)


class ClienteViewSet(viewsets.ModelViewSet):
    """ViewSet para gestión de clientes"""
    
    queryset = Cliente.objects.all()
    serializer_class = ClienteSerializer
    permission_classes = [AllowAny]
    
    def get_queryset(self):
        """Filtra clientes según parámetros"""
        queryset = Cliente.objects.all()
        
        # Filtrar por tipo de documento
        tipo_doc = self.request.query_params.get('tipo_doc')
        if tipo_doc:
            queryset = queryset.filter(tipo_doc=tipo_doc)
        
        # Filtrar por número de documento
        num_doc = self.request.query_params.get('num_doc')
        if num_doc:
            queryset = queryset.filter(num_doc__icontains=num_doc)
        
        # Filtrar por nombre
        nombre = self.request.query_params.get('nombre')
        if nombre:
            queryset = queryset.filter(nombre__icontains=nombre)
        
        # Filtrar por ciudad
        ciudad = self.request.query_params.get('ciudad')
        if ciudad:
            queryset = queryset.filter(ciudad__icontains=ciudad)
        
        return queryset.order_by('nombre')
    
    def get_serializer_class(self):
        """Retorna el serializer apropiado según la acción"""
        if self.action == 'cronograma':
            return ClienteCronogramaSerializer
        return ClienteSerializer
    
    @action(detail=True, methods=['get'])
    def cronograma(self, request, pk=None):
        """Obtiene el cronograma completo de un cliente"""
        try:
            cliente_data = PaymentScheduleService.get_cliente_cronograma(pk)
            serializer = self.get_serializer(cliente_data['cliente'])
            
            return Response({
                'cliente': serializer.data,
                'resumen': cliente_data['resumen']
            })
        except ValueError as e:
            return Response(
                {'error': str(e)}, 
                status=status.HTTP_404_NOT_FOUND
            )
    
    @action(detail=True, methods=['get'])
    def resumen(self, request, pk=None):
        """Obtiene resumen completo de un cliente"""
        try:
            resumen = ClienteService.get_resumen_cliente(pk)
            return Response(resumen)
        except ValueError as e:
            return Response(
                {'error': str(e)}, 
                status=status.HTTP_404_NOT_FOUND
            )
    
    @action(detail=False, methods=['get'])
    def con_mora(self, request):
        """Obtiene clientes con cuotas en mora"""
        clientes = ClienteService.get_clientes_con_mora()
        serializer = self.get_serializer(clientes, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def buscar_por_cedula(self, request):
        """Busca cliente por número de cédula"""
        tipo_doc = request.query_params.get('tipo_doc', 'CC')
        num_doc = request.query_params.get('num_doc')
        
        if not num_doc:
            return Response(
                {'error': 'El parámetro num_doc es requerido'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            cliente = Cliente.objects.get(
                tipo_doc=tipo_doc,
                num_doc=num_doc
            )
            
            # Obtener cronograma completo del cliente
            cronograma_data = PaymentScheduleService.get_cliente_cronograma(cliente.cliente_id)
            
            return Response({
                'cliente': ClienteSerializer(cliente).data,
                'cronograma': PaymentScheduleSummarySerializer(
                    cronograma_data['cronogramas'], many=True
                ).data,
                'resumen': cronograma_data['resumen']
            })
            
        except Cliente.DoesNotExist:
            return Response(
                {'error': f'Cliente con {tipo_doc} {num_doc} no encontrado'}, 
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            return Response(
                {'error': f'Error interno: {str(e)}'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=False, methods=['get'])
    def buscar_cliente(self, request):
        """Busca solo la información básica del cliente por cédula"""
        tipo_doc = request.query_params.get('tipo_doc', 'CC')
        num_doc = request.query_params.get('num_doc')
        
        if not num_doc:
            return Response(
                {'error': 'El parámetro num_doc es requerido'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            cliente = Cliente.objects.get(
                tipo_doc=tipo_doc,
                num_doc=num_doc
            )
            
            serializer = ClienteSerializer(cliente)
            return Response(serializer.data)
            
        except Cliente.DoesNotExist:
            return Response(
                {'error': f'Cliente con {tipo_doc} {num_doc} no encontrado'}, 
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            return Response(
                {'error': f'Error interno: {str(e)}'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class CreditoViewSet(viewsets.ModelViewSet):
    """ViewSet para gestión de créditos"""
    
    queryset = Credito.objects.all()
    serializer_class = CreditoSerializer
    permission_classes = [AllowAny]
    
    def get_queryset(self):
        """Filtra créditos según parámetros"""
        queryset = Credito.objects.select_related('cliente').all()
        
        # Filtrar por cliente
        cliente_id = self.request.query_params.get('cliente_id')
        if cliente_id:
            queryset = queryset.filter(cliente_id=cliente_id)
        
        # Filtrar por producto
        producto = self.request.query_params.get('producto')
        if producto:
            queryset = queryset.filter(producto=producto)
        
        # Filtrar por estado
        estado = self.request.query_params.get('estado')
        if estado:
            queryset = queryset.filter(estado=estado)
        
        return queryset
    
    @action(detail=True, methods=['get'])
    def cronograma(self, request, pk=None):
        """Obtiene el cronograma de un crédito"""
        try:
            cronograma_data = PaymentScheduleService.get_credito_cronograma(pk)
            serializer = PaymentScheduleSummarySerializer(
                cronograma_data['cronogramas'], many=True
            )
            
            return Response({
                'credito': CreditoSerializer(cronograma_data['credito']).data,
                'cronograma': serializer.data,
                'resumen': cronograma_data['resumen']
            })
        except ValueError as e:
            return Response(
                {'error': str(e)}, 
                status=status.HTTP_404_NOT_FOUND
            )
    
    @action(detail=True, methods=['get'])
    def resumen_financiero(self, request, pk=None):
        """Obtiene resumen financiero de un crédito"""
        try:
            resumen = CreditoService.get_resumen_financiero(pk)
            return Response(resumen)
        except ValueError as e:
            return Response(
                {'error': str(e)}, 
                status=status.HTTP_404_NOT_FOUND
            )

    @action(detail=False, methods=['get'])
    def resumen(self, request):
        """Resumen agregado de créditos del cliente incluyendo pagos.

        Respuesta:
        {
          total_creditos,
          creditos_vigentes,
          creditos_cancelados,
          creditos_castigados,
          inversion_total,
          inversion_vigente,
          monto_pagado_total,
          monto_pendiente_total
        }
        """
        cliente_id = request.query_params.get('cliente_id')
        if not cliente_id:
            return Response(
                {'error': 'Parámetro cliente_id es requerido'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Créditos del cliente
        qs = Credito.objects.filter(cliente_id=cliente_id)
        total_creditos = qs.count()
        creditos_vigentes = qs.filter(estado='vigente').count()
        creditos_cancelados = qs.filter(estado='cancelado').count()
        creditos_castigados = qs.filter(estado='castigado').count()
        inversion_total = float(sum(c.inversion for c in qs))
        inversion_vigente = float(sum(c.inversion for c in qs.filter(estado='vigente')))

        # Totales pagados/pedientes desde cronograma
        schedules = PaymentSchedule.objects.filter(credito__cliente_id=cliente_id)
        monto_pagado_total = float(sum(s.monto_pagado for s in schedules))
        monto_total_cuotas = float(sum(s.valor_cuota for s in schedules))
        monto_pendiente_total = max(monto_total_cuotas - monto_pagado_total, 0)

        return Response({
            'total_creditos': total_creditos,
            'creditos_vigentes': creditos_vigentes,
            'creditos_cancelados': creditos_cancelados,
            'creditos_castigados': creditos_castigados,
            'inversion_total': inversion_total,
            'inversion_vigente': inversion_vigente,
            'monto_pagado_total': monto_pagado_total,
            'monto_pendiente_total': monto_pendiente_total,
        })


class PaymentScheduleViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet para consulta de cronograma de pagos"""
    
    queryset = PaymentSchedule.objects.all()
    serializer_class = PaymentScheduleSerializer
    permission_classes = [AllowAny]
    
    def get_queryset(self):
        """Filtra cronograma según parámetros"""
        queryset = PaymentSchedule.objects.select_related(
            'credito', 'credito__cliente'
        ).prefetch_related('pagos').all()
        
        # Filtrar por cliente
        cliente_id = self.request.query_params.get('cliente_id')
        if cliente_id:
            queryset = queryset.filter(credito__cliente_id=cliente_id)
        
        # Filtrar por crédito
        credito_id = self.request.query_params.get('credito_id')
        if credito_id:
            queryset = queryset.filter(credito_id=credito_id)
        
        # Ordenar por fecha de vencimiento por defecto
        return queryset.order_by('fecha_vencimiento')
        
        # Filtrar por estado
        estado = self.request.query_params.get('estado')
        if estado:
            queryset = queryset.filter(estado=estado)
        
        # Filtrar por rango de fechas
        fecha_desde = self.request.query_params.get('fecha_desde')
        fecha_hasta = self.request.query_params.get('fecha_hasta')
        
        if fecha_desde:
            queryset = queryset.filter(fecha_vencimiento__gte=fecha_desde)
        if fecha_hasta:
            queryset = queryset.filter(fecha_vencimiento__lte=fecha_hasta)
        
        return queryset.order_by('fecha_vencimiento')
    
    @action(detail=False, methods=['get'])
    def vencidas(self, request):
        """Obtiene cuotas vencidas"""
        cliente_id = request.query_params.get('cliente_id')
        cuotas = PaymentScheduleService.get_cuotas_vencidas(cliente_id)
        
        serializer = PaymentScheduleSummarySerializer(cuotas, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def por_estado(self, request):
        """Obtiene cuotas filtradas por estado"""
        estado = request.query_params.get('estado')
        cliente_id = request.query_params.get('cliente_id')
        
        if not estado:
            return Response(
                {'error': 'Parámetro estado es requerido'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        cuotas = PaymentScheduleService.get_cuotas_por_estado(estado, cliente_id)
        serializer = PaymentScheduleSummarySerializer(cuotas, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'])
    def calcular_mora(self, request, pk=None):
        """Calcula el monto de mora para una cuota"""
        try:
            cuota = get_object_or_404(PaymentSchedule, pk=pk)
            tasa_mora = float(request.query_params.get('tasa_mora', 0.02))
            
            monto_mora = PaymentScheduleService.calcular_mora(
                cuota, tasa_mora
            )
            
            return Response({
                'cuota': PaymentScheduleSummarySerializer(cuota).data,
                'dias_mora': cuota.dias_mora,
                'tasa_mora': tasa_mora,
                'monto_mora': monto_mora,
                'saldo_pendiente': cuota.saldo_pendiente
            })
        except Exception as e:
            return Response(
                {'error': str(e)}, 
                status=status.HTTP_400_BAD_REQUEST
            )


class PagoViewSet(viewsets.ModelViewSet):
    """ViewSet para gestión de pagos"""
    
    queryset = Pago.objects.all()
    permission_classes = [AllowAny]
    
    def get_serializer_class(self):
        """Retorna el serializer apropiado según la acción"""
        if self.action == 'create':
            return PagoCreateSerializer
        return PagoCreateSerializer
    
    def get_queryset(self):
        """Filtra pagos según parámetros"""
        queryset = Pago.objects.select_related(
            'schedule', 'schedule__credito', 'schedule__credito__cliente'
        ).all()
        
        # Filtrar por cliente
        cliente_id = self.request.query_params.get('cliente_id')
        if cliente_id:
            queryset = queryset.filter(schedule__credito__cliente_id=cliente_id)
        
        # Filtrar por crédito
        credito_id = self.request.query_params.get('credito_id')
        if credito_id:
            queryset = queryset.filter(schedule__credito_id=credito_id)
        
        # Filtrar por cuota
        schedule_id = self.request.query_params.get('schedule_id')
        if schedule_id:
            queryset = queryset.filter(schedule_id=schedule_id)
        
        return queryset.order_by('-fecha_pago')
    
    def create(self, request, *args, **kwargs):
        """Crea un nuevo pago"""
        try:
            schedule_id = request.data.get('schedule')
            monto = request.data.get('monto')
            medio = request.data.get('medio', 'app')
            
            pago = PaymentScheduleService.procesar_pago(
                schedule_id, monto, medio
            )
            
            serializer = PagoCreateSerializer(pago)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
            
        except ValueError as e:
            return Response(
                {'error': str(e)}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            return Response(
                {'error': f'Error interno: {str(e)}'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=False, methods=['get'])
    def resumen_por_cliente(self, request):
        """Obtiene resumen de pagos por cliente"""
        cliente_id = request.query_params.get('cliente_id')
        
        if not cliente_id:
            return Response(
                {'error': 'Parámetro cliente_id es requerido'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            pagos = self.get_queryset().filter(
                schedule__credito__cliente_id=cliente_id
            )
            
            resumen = {
                'total_pagos': pagos.count(),
                'monto_total_pagado': sum(p.monto for p in pagos),
                'pagos_por_medio': {},
                'ultimo_pago': None
            }
            
            # Agrupar por medio de pago
            for pago in pagos:
                medio = pago.medio or 'sin_especificar'
                if medio not in resumen['pagos_por_medio']:
                    resumen['pagos_por_medio'][medio] = {
                        'cantidad': 0,
                        'monto_total': 0
                    }
                resumen['pagos_por_medio'][medio]['cantidad'] += 1
                resumen['pagos_por_medio'][medio]['monto_total'] += float(pago.monto)
            
            # Último pago
            if pagos.exists():
                ultimo_pago = pagos.first()
                resumen['ultimo_pago'] = {
                    'fecha': ultimo_pago.fecha_pago,
                    'monto': ultimo_pago.monto,
                    'medio': ultimo_pago.medio,
                    'cuota': ultimo_pago.schedule.num_cuota
                }
            
            return Response(resumen)
            
        except Exception as e:
            return Response(
                {'error': str(e)}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class RepartidorCronogramaViewSet(viewsets.ViewSet):
    """ViewSet específico para cronograma del repartidor"""
    permission_classes = [AllowAny]
    
    @action(detail=False, methods=['get'])
    def cronograma_completo(self, request):
        """Obtiene cronograma completo por cliente con información del crédito"""
        cliente_id = request.query_params.get('cliente_id')
        
        if not cliente_id:
            return Response(
                {'error': 'Parámetro cliente_id es requerido'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            # Obtener cliente
            cliente = get_object_or_404(Cliente, cliente_id=cliente_id)
            
            # Obtener todos los créditos del cliente
            creditos = Credito.objects.filter(cliente_id=cliente_id, estado='vigente')
            
            cronograma_completo = []
            
            for credito in creditos:
                # Obtener cronograma del crédito
                cuotas = PaymentSchedule.objects.filter(
                    credito=credito
                ).order_by('num_cuota')
                
                # Agregar información del crédito a cada cuota
                for cuota in cuotas:
                    cuota_data = PaymentScheduleSerializer(cuota).data
                    cuota_data['credito_info'] = {
                        'credito_id': credito.credito_id,
                        'producto': credito.producto,
                        'inversion': float(credito.inversion),
                        'cuotas_totales': credito.cuotas_totales,
                        'fecha_desembolso': credito.fecha_desembolso,
                        'cliente_nombre': cliente.nombre
                    }
                    cronograma_completo.append(cuota_data)
            
            # Ordenar por fecha de vencimiento
            cronograma_completo.sort(key=lambda x: x['fecha_vencimiento'])
            
            return Response({
                'cliente': {
                    'cliente_id': cliente.cliente_id,
                    'nombre': cliente.nombre,
                    'tipo_doc': cliente.tipo_doc,
                    'num_doc': cliente.num_doc,
                    'ciudad': cliente.ciudad
                },
                'cronograma': cronograma_completo,
                'resumen': {
                    'total_cuotas': len(cronograma_completo),
                    'cuotas_pagadas': sum(1 for c in cronograma_completo if c.get('estado') == 'pagada'),
                    'cuotas_vencidas': sum(1 for c in cronograma_completo if c.get('estado') == 'vencida'),
                    'cuotas_pendientes': sum(1 for c in cronograma_completo if c.get('estado') == 'pendiente'),
                    'cuotas_parciales': sum(1 for c in cronograma_completo if c.get('estado') == 'parcial'),
                    'estado_general': 'en_mora' if any(c.get('estado') == 'vencida' for c in cronograma_completo) else 'al_dia'
                }
            })
            
        except Exception as e:
            return Response(
                {'error': f'Error interno: {str(e)}'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=False, methods=['get'])
    def estado_pago(self, request):
        """Obtiene estado actual de pago del cliente"""
        cliente_id = request.query_params.get('cliente_id')
        
        if not cliente_id:
            return Response(
                {'error': 'Parámetro cliente_id es requerido'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            # Obtener todas las cuotas del cliente
            cuotas = PaymentSchedule.objects.filter(
                credito__cliente_id=cliente_id,
                credito__estado='vigente'
            ).order_by('fecha_vencimiento')
            
            hoy = timezone.now().date()
            
            cuotas_pendientes = cuotas.filter(
                fecha_vencimiento__gte=hoy,
                estado__in=['pendiente', 'parcial']
            )
            
            cuotas_vencidas = cuotas.filter(
                fecha_vencimiento__lt=hoy,
                estado__in=['pendiente', 'parcial']
            )
            
            cuotas_pagadas = cuotas.filter(estado='pagada')
            
            # Próxima cuota a pagar
            proxima_cuota = cuotas_pendientes.first()
            
            # Cuota más reciente vencida
            cuota_mas_reciente_vencida = cuotas_vencidas.order_by('-fecha_vencimiento').first()
            
            estado = {
                'estado_general': 'al_dia' if not cuotas_vencidas.exists() else 'en_mora',
                'total_cuotas': cuotas.count(),
                'cuotas_pagadas': cuotas_pagadas.count(),
                'cuotas_pendientes': cuotas_pendientes.count(),
                'cuotas_vencidas': cuotas_vencidas.count(),
                'proxima_cuota': PaymentScheduleSerializer(proxima_cuota).data if proxima_cuota else None,
                'cuota_mas_reciente_vencida': PaymentScheduleSerializer(cuota_mas_reciente_vencida).data if cuota_mas_reciente_vencida else None,
                'dias_mora': cuota_mas_reciente_vencida.dias_mora if cuota_mas_reciente_vencida else 0
            }
            
            return Response(estado)
            
        except Exception as e:
            return Response(
                {'error': f'Error interno: {str(e)}'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=False, methods=['get'])
    def cronograma_resumido(self, request):
        """Obtiene cronograma resumido por fecha para el repartidor"""
        cliente_id = request.query_params.get('cliente_id')
        
        if not cliente_id:
            return Response(
                {'error': 'Parámetro cliente_id es requerido'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            # Obtener cliente
            cliente = get_object_or_404(Cliente, cliente_id=cliente_id)
            
            # Obtener todas las cuotas del cliente ordenadas por fecha
            cuotas = PaymentSchedule.objects.filter(
                credito__cliente_id=cliente_id,
                credito__estado='vigente'
            ).select_related('credito').order_by('fecha_vencimiento')
            
            hoy = timezone.now().date()
            
            # Separar cuotas por estado
            cuotas_pasadas = cuotas.filter(fecha_vencimiento__lt=hoy)
            cuotas_actuales = cuotas.filter(fecha_vencimiento__gte=hoy)
            
            cronograma_resumido = []
            
            for cuota in cuotas:
                cuota_data = {
                    'cuota_id': cuota.schedule_id,
                    'num_cuota': cuota.num_cuota,
                    'fecha_vencimiento': cuota.fecha_vencimiento,
                    'valor_cuota': float(cuota.valor_cuota),
                    'estado': cuota.estado,
                    'producto': cuota.credito.producto,
                    'credito_id': cuota.credito.credito_id,
                    'dias_restantes': (cuota.fecha_vencimiento - hoy).days if cuota.fecha_vencimiento >= hoy else 0,
                    'dias_vencido': (hoy - cuota.fecha_vencimiento).days if cuota.fecha_vencimiento < hoy else 0,
                    'monto_pagado': float(cuota.monto_pagado),
                    'saldo_pendiente': float(cuota.saldo_pendiente)
                }
                cronograma_resumido.append(cuota_data)
            
            # Calcular resumen
            resumen = self._calcular_resumen_repartidor(cronograma_resumido)
            
            return Response({
                'cliente': {
                    'cliente_id': cliente.cliente_id,
                    'nombre': cliente.nombre,
                    'tipo_doc': cliente.tipo_doc,
                    'num_doc': cliente.num_doc
                },
                'cronograma': cronograma_resumido,
                'resumen': resumen,
                'estado_actual': 'al_dia' if resumen['cuotas_vencidas'] == 0 else 'en_mora'
            })
            
        except Exception as e:
            return Response(
                {'error': f'Error interno: {str(e)}'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    def _calcular_resumen_repartidor(self, cronograma):
        """Calcula resumen específico para el repartidor"""
        from decimal import Decimal
        
        total_cuotas = len(cronograma)
        cuotas_pagadas = sum(1 for c in cronograma if c['estado'] == 'pagada')
        cuotas_vencidas = sum(1 for c in cronograma if c['estado'] == 'vencida')
        cuotas_pendientes = sum(1 for c in cronograma if c['estado'] == 'pendiente')
        cuotas_parciales = sum(1 for c in cronograma if c['estado'] == 'parcial')
        
        total_monto = sum(c['valor_cuota'] for c in cronograma)
        monto_pagado = sum(c['monto_pagado'] for c in cronograma)
        monto_pendiente = sum(c['saldo_pendiente'] for c in cronograma)
        
        return {
            'total_cuotas': total_cuotas,
            'cuotas_pagadas': cuotas_pagadas,
            'cuotas_vencidas': cuotas_vencidas,
            'cuotas_pendientes': cuotas_pendientes,
            'cuotas_parciales': cuotas_parciales,
            'total_monto': total_monto,
            'monto_pagado': monto_pagado,
            'monto_pendiente': monto_pendiente,
            'porcentaje_pagado': (monto_pagado / total_monto * 100) if total_monto > 0 else 0
        }