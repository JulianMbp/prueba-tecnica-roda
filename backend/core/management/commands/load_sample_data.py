from django.core.management.base import BaseCommand
from django.db import transaction
from decimal import Decimal
from datetime import date, timedelta
import random

from core.models import Cliente, Credito, PaymentSchedule, Pago


class Command(BaseCommand):
    help = 'Carga datos de muestra para el sistema de cronograma de pagos'

    def add_arguments(self, parser):
        parser.add_argument(
            '--clear',
            action='store_true',
            help='Limpiar datos existentes antes de cargar',
        )

    def handle(self, *args, **options):
        if options['clear']:
            self.clear_data()
        
        self.load_clients()
        self.load_credits()
        self.load_payment_schedules()
        self.load_payments()
        self.update_payment_states()
        
        self.stdout.write(
            self.style.SUCCESS('✅ Datos de muestra cargados exitosamente')
        )

    def clear_data(self):
        """Limpia todos los datos existentes"""
        Pago.objects.all().delete()
        PaymentSchedule.objects.all().delete()
        Credito.objects.all().delete()
        Cliente.objects.all().delete()
        self.stdout.write('🧹 Datos existentes eliminados')

    def load_clients(self):
        """Carga clientes de muestra"""
        ciudades = ['Bogotá', 'Medellín', 'Cali', 'Barranquilla']
        
        for i in range(1, 11):
            Cliente.objects.create(
                tipo_doc='CC',
                num_doc=f'{10000000 + i:08d}',
                nombre=f'Cliente {i}',
                ciudad=random.choice(ciudades)
            )
        
        self.stdout.write('👥 10 clientes creados')

    def load_credits(self):
        """Carga créditos de muestra"""
        clientes = list(Cliente.objects.all())
        productos = ['e-bike', 'e-moped']
        
        for cliente in clientes:
            # Cada cliente tiene 2 créditos
            for _ in range(2):
                Credito.objects.create(
                    cliente=cliente,
                    producto=random.choice(productos),
                    inversion=round(random.uniform(2000000, 5000000), -3),
                    cuotas_totales=random.choice([6, 9, 12]),
                    tea=Decimal('0.28'),
                    fecha_desembolso=date.today() - timedelta(days=random.randint(1, 60)),
                    fecha_inicio_pago=date.today() - timedelta(days=random.randint(1, 30)),
                    estado='vigente'
                )
        
        self.stdout.write('💰 20 créditos creados')

    def load_payment_schedules(self):
        """Carga cronograma de pagos"""
        creditos = Credito.objects.all()
        
        for credito in creditos:
            valor_cuota = round(float(credito.inversion / credito.cuotas_totales), -1)
            fecha_inicio = credito.fecha_inicio_pago
            
            for num_cuota in range(1, credito.cuotas_totales + 1):
                fecha_vencimiento = fecha_inicio + timedelta(days=30 * (num_cuota - 1))
                
                PaymentSchedule.objects.create(
                    credito=credito,
                    num_cuota=num_cuota,
                    fecha_vencimiento=fecha_vencimiento,
                    valor_cuota=valor_cuota,
                    estado='pendiente'
                )
        
        self.stdout.write('📅 Cronogramas de pago creados')

    def load_payments(self):
        """Carga pagos de muestra"""
        schedules = PaymentSchedule.objects.all()
        medios = ['app', 'efectivo', 'link']
        
        for schedule in schedules:
            # Replicar la lógica exacta del SQL de referencia
            rand = random.random()
            if rand < 0.3:
                # 30% probabilidad de pago parcial
                factor_pago = Decimal('0.5')
            elif rand < 0.7:
                # 40% probabilidad de pago completo
                factor_pago = Decimal('1.0')
            else:
                # 30% probabilidad de NO PAGO
                factor_pago = Decimal('0')
            
            if factor_pago > 0:  # Solo crear pago si factor_pago > 0
                monto_pago = round(float(schedule.valor_cuota * factor_pago), -1)
                
                # Fecha de pago (puede ser antes o después del vencimiento)
                dias_diferencia = random.randint(-5, 15)
                fecha_pago = schedule.fecha_vencimiento + timedelta(days=dias_diferencia)
                
                Pago.objects.create(
                    schedule=schedule,
                    credito=schedule.credito,
                    fecha_pago=fecha_pago,
                    monto=monto_pago,
                    medio=random.choice(medios)
                )
        
        self.stdout.write('💳 Pagos de muestra creados')

    def update_payment_states(self):
        """Actualiza estados de cuotas basado en pagos"""
        schedules = PaymentSchedule.objects.all()
        
        for schedule in schedules:
            monto_pagado = sum(pago.monto for pago in schedule.pagos.all())
            hoy = date.today()
            
            if monto_pagado >= schedule.valor_cuota:
                schedule.estado = 'pagada'
            elif schedule.fecha_vencimiento < hoy and monto_pagado < schedule.valor_cuota:
                schedule.estado = 'vencida'
            elif monto_pagado > 0:
                schedule.estado = 'parcial'
            else:
                schedule.estado = 'pendiente'
            
            schedule.save()
        
        self.stdout.write('🔄 Estados de cuotas actualizados')
