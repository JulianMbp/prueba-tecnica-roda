from rest_framework import serializers
from ...domain.entities import Client


class ClientSerializer(serializers.ModelSerializer):
    """Serializer for Client entity"""
    
    class Meta:
        model = Client
        fields = '__all__'


class ClientSearchSerializer(serializers.Serializer):
    """Serializer for client search filters"""
    
    doc_type = serializers.CharField(required=False, max_length=2)
    doc_number = serializers.CharField(required=False, max_length=20)
    name = serializers.CharField(required=False, max_length=100)
    city = serializers.CharField(required=False, max_length=50)


class ClientDashboardSerializer(ClientSerializer):
    """Extended serializer for client dashboard with financial summary"""
    
    total_credits = serializers.SerializerMethodField()
    total_investment = serializers.SerializerMethodField()
    active_credits = serializers.SerializerMethodField()
    overdue_payments = serializers.SerializerMethodField()
    
    class Meta:
        model = Client
        fields = [
            'cliente_id', 'tipo_doc', 'num_doc', 'nombre', 'ciudad', 'created_at',
            'total_credits', 'total_investment', 'active_credits', 'overdue_payments'
        ]
    
    def get_total_credits(self, obj):
        return obj.creditos.count()
    
    def get_total_investment(self, obj):
        return sum(credit.inversion for credit in obj.creditos.all())
    
    def get_active_credits(self, obj):
        return obj.creditos.filter(estado='vigente').count()
    
    def get_overdue_payments(self, obj):
        return obj.creditos.filter(
            payment_schedules__estado='vencida'
        ).distinct().count()
