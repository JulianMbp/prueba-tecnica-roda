from rest_framework import serializers
from ...domain.entities import Payment, PaymentSchedule
from .credit_serializers import CreditSerializer


class PaymentSerializer(serializers.ModelSerializer):
    """Serializer for Payment entity"""
    
    cuota_info = serializers.SerializerMethodField()
    credito_info = serializers.SerializerMethodField()

    class Meta:
        model = Payment
        fields = '__all__'
        read_only_fields = ('pago_id',)

    def get_cuota_info(self, obj):
        """Información resumida de la cuota y crédito asociado para UI"""
        schedule = getattr(obj, 'schedule', None)
        if not schedule:
            return None
        credito = getattr(schedule, 'credito', None)
        return {
            'num_cuota': getattr(schedule, 'num_cuota', None),
            'fecha_vencimiento': getattr(schedule, 'fecha_vencimiento', None),
            'valor_cuota': float(getattr(schedule, 'valor_cuota', 0) or 0),
            'estado': getattr(schedule, 'estado', None),
            'producto': getattr(credito, 'producto', None) if credito else None,
        }

    def get_credito_info(self, obj):
        credito = getattr(obj, 'credito', None) or getattr(getattr(obj, 'schedule', None), 'credito', None)
        if not credito:
            return None
        return {
            'credito_id': getattr(credito, 'credito_id', None),
            'producto': getattr(credito, 'producto', None),
            'cliente_id': getattr(credito, 'cliente_id', None),
        }


class PaymentScheduleSerializer(serializers.ModelSerializer):
    """Serializer for PaymentSchedule entity"""
    
    credit_info = CreditSerializer(source='credito', read_only=True)
    payments = PaymentSerializer(many=True, read_only=True)
    amount_paid = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True)
    pending_balance = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True)
    days_overdue = serializers.IntegerField(read_only=True)
    is_overdue = serializers.BooleanField(read_only=True)
    
    class Meta:
        model = PaymentSchedule
        fields = [
            'schedule_id', 'credito', 'credit_info', 'num_cuota', 
            'fecha_vencimiento', 'valor_cuota', 'estado', 'amount_paid', 
            'pending_balance', 'days_overdue', 'is_overdue', 'payments'
        ]
        read_only_fields = ('schedule_id', 'estado', 'amount_paid', 'pending_balance', 'days_overdue', 'is_overdue')


class PaymentSummarySerializer(serializers.Serializer):
    """Serializer for payment summary"""
    
    total_schedules = serializers.IntegerField()
    paid_schedules = serializers.IntegerField()
    overdue_schedules = serializers.IntegerField()
    pending_schedules = serializers.IntegerField()
    partial_schedules = serializers.IntegerField()
    total_amount = serializers.DecimalField(max_digits=12, decimal_places=2)
    paid_amount = serializers.DecimalField(max_digits=12, decimal_places=2)
    pending_amount = serializers.DecimalField(max_digits=12, decimal_places=2)
    payment_percentage = serializers.FloatField()
    average_overdue_days = serializers.FloatField()


class OverdueInterestSerializer(serializers.Serializer):
    """Serializer for overdue interest calculation"""
    
    schedule_id = serializers.IntegerField()
    days_overdue = serializers.IntegerField()
    pending_balance = serializers.DecimalField(max_digits=12, decimal_places=2)
    overdue_interest = serializers.DecimalField(max_digits=12, decimal_places=2)
    total_with_overdue = serializers.DecimalField(max_digits=12, decimal_places=2)
