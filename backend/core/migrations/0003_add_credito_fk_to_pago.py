from django.db import migrations, models


def backfill_credito(apps, schema_editor):
    Pago = apps.get_model('core', 'Payment')
    for pago in Pago.objects.all().iterator():
        if getattr(pago, 'credito_id', None) is None and getattr(pago, 'schedule_id', None) is not None:
            # Derivar el crédito desde la cuota
            pago.credito_id = pago.schedule.credito_id
            pago.save(update_fields=['credito_id'])


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0002_client_credit_payment_alter_cliente_unique_together_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='payment',
            name='credito',
            field=models.ForeignKey(blank=True, null=True, on_delete=models.deletion.CASCADE, related_name='pagos', to='core.credit', help_text='Credit this payment contributes to'),
        ),
        migrations.RunPython(backfill_credito, migrations.RunPython.noop),
        migrations.AlterField(
            model_name='payment',
            name='credito',
            field=models.ForeignKey(on_delete=models.deletion.CASCADE, related_name='pagos', to='core.credit', help_text='Credit this payment contributes to'),
        ),
    ]


