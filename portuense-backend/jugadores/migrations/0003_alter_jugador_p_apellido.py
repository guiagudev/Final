# Generated by Django 5.1.6 on 2025-07-14 16:35

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('jugadores', '0002_alter_comentariojugador_fecha_creacion_and_more'),
    ]

    operations = [
        migrations.AlterField(
            model_name='jugador',
            name='p_apellido',
            field=models.CharField(blank=True, max_length=100, null=True),
        ),
    ]
