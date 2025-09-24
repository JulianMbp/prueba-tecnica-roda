from rest_framework import serializers
from ...domain.entities import Credit


class CreditSerializer(serializers.ModelSerializer):
    """Serializer for Credit entity"""
    
    client_name = serializers.CharField(source='cliente.nombre', read_only=True)
    installment_value = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True)
    
    class Meta:
        model = Credit
        fields = [
            'credito_id', 'cliente', 'client_name', 'producto', 'inversion',
            'cuotas_totales', 'tea', 'fecha_desembolso', 
            'fecha_inicio_pago', 'estado', 'installment_value'
        ]


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
