from rest_framework import serializers
from ...domain.entities import Credit


class CreditSerializer(serializers.ModelSerializer):
    """Serializer for Credit entity"""
    
    client_name = serializers.CharField(source='cliente.nombre', read_only=True)
    installment_value = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True)
    resumen = serializers.SerializerMethodField()
    
    class Meta:
        model = Credit
        fields = [
            'credito_id', 'cliente', 'client_name', 'producto', 'inversion',
            'cuotas_totales', 'tea', 'fecha_desembolso', 
            'fecha_inicio_pago', 'estado', 'installment_value', 'resumen'
        ]

    def get_resumen(self, obj):
        # Import lazily to avoid circulars
        from ...domain.entities import PaymentSchedule, Payment
        schedules = PaymentSchedule.objects.filter(credito=obj)
        total_schedules = schedules.count()
        # Conteos por estado
        pagadas = schedules.filter(estado='pagada').count()
        vencidas = schedules.filter(estado='vencida').count()
        pendientes = schedules.filter(estado__in=['pendiente', 'parcial']).count()
        # Monto
        monto_pagado = float(sum(s.monto_pagado for s in schedules))
        monto_total = float(sum(s.valor_cuota for s in schedules))
        monto_pendiente = max(monto_total - monto_pagado, 0)
        # Pagos asociados y última fecha de pago
        pagos_qs = Payment.objects.filter(schedule__credito=obj)
        pagos_asociados = pagos_qs.count()
        ultimo_pago = pagos_qs.order_by('-fecha_pago').first()
        porcentaje_pagado = (monto_pagado / monto_total * 100) if monto_total > 0 else 0
        # Cuotas restantes conforme a las totales del crédito
        cuotas_restantes = max(obj.cuotas_totales - pagadas, 0)
        return {
            'cuotas_pagadas': pagadas,
            'cuotas_pendientes': pendientes,
            'cuotas_vencidas': vencidas,
            'cuotas_restantes': cuotas_restantes,
            'monto_pagado': monto_pagado,
            'monto_pendiente': monto_pendiente,
            'porcentaje_pagado': porcentaje_pagado,
            'pagos_asociados': pagos_asociados,
            'ultima_fecha_pago': ultimo_pago.fecha_pago if ultimo_pago else None,
        }


class CreditSummarySerializer(serializers.Serializer):
    """Serializer for credit financial summary"""
    
    credit_id = serializers.IntegerField()
    product = serializers.CharField()
    total_installments = serializers.IntegerField()
    paid_installments = serializers.IntegerField()
    overdue_installments = serializers.IntegerField()
    pending_installments = serializers.IntegerField()
    partial_installments = serializers.IntegerField()
    total_value = serializers.DecimalField(max_digits=12, decimal_places=2)
    paid_amount = serializers.DecimalField(max_digits=12, decimal_places=2)
    pending_amount = serializers.DecimalField(max_digits=12, decimal_places=2)
    payment_percentage = serializers.FloatField()
