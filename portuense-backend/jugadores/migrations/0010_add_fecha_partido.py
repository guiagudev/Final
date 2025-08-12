# Generated manually to add fecha_partido field to InformeJornada

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('jugadores', '0009_alter_subcategoria_unique_together_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='informejornada',
            name='fecha_partido',
            field=models.DateField(
                help_text='Fecha del partido',
                null=True,
                blank=True
            ),
        ),
    ]
