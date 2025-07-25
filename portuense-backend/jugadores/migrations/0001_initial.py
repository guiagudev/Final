# Generated by Django 5.1.6 on 2025-07-04 13:43

import django.db.models.deletion
import django.utils.timezone
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='Categoria',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('codigo', models.CharField(max_length=20, unique=True)),
                ('nombre', models.CharField(max_length=100, unique=True)),
                ('descripcion', models.TextField(blank=True, null=True)),
            ],
        ),
        migrations.CreateModel(
            name='ClubRival',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('nombre', models.CharField(max_length=100, unique=True)),
                ('ciudad', models.CharField(blank=True, max_length=100, null=True)),
                ('categoria', models.CharField(blank=True, choices=[('PREBEN', 'Prebenjamín'), ('BEN', 'Benjamín'), ('ALE', 'Alevín'), ('INF', 'Infantil'), ('CAD', 'Cadete'), ('JUV', 'Juvenil'), ('SEN', 'Sénior')], max_length=20, null=True)),
                ('equipo', models.CharField(blank=True, choices=[('M', 'Masculino'), ('F', 'Femenino')], max_length=1, null=True)),
                ('imagen', models.ImageField(blank=True, null=True, upload_to='clubes/')),
            ],
        ),
        migrations.CreateModel(
            name='Evento',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('subcategoria_equipo', models.CharField(blank=True, choices=[('A', 'A'), ('B', 'B'), ('C', 'C')], help_text='Subcategoría del equipo (e.g., A, B)', max_length=30, null=True)),
                ('descripcion', models.TextField(null=True)),
                ('fecha', models.DateTimeField()),
                ('categoria', models.CharField(choices=[('Partido', 'Partido'), ('Entrenamiento', 'Entrenamiento'), ('Reunion', 'Reunión')], default='Partido', max_length=20)),
                ('equipo1', models.CharField(default='Racing Club Portuense', max_length=45)),
                ('equipo2', models.CharField(blank=True, max_length=45, null=True)),
                ('localizacion', models.CharField(blank=True, max_length=100, null=True)),
                ('categoria_equipo', models.CharField(blank=True, choices=[('PREBEN', 'Prebenjamín'), ('BEN', 'Benjamín'), ('ALE', 'Alevín'), ('INF', 'Infantil'), ('CAD', 'Cadete'), ('JUV', 'Juvenil'), ('SEN', 'Sénior')], help_text='Categoría del equipo para partidos (e.g., Infantil)', max_length=20, null=True)),
                ('equipo_genero', models.CharField(blank=True, choices=[('M', 'Masculino'), ('F', 'Femenino')], help_text='Masculino o Femenino', max_length=1, null=True)),
            ],
        ),
        migrations.CreateModel(
            name='FolderGroup',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=255, unique=True)),
            ],
        ),
        migrations.CreateModel(
            name='Jugador',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('nombre', models.CharField(max_length=100)),
                ('p_apellido', models.CharField(max_length=100, null=True)),
                ('s_apellido', models.CharField(blank=True, max_length=100)),
                ('categoria', models.CharField(choices=[('PREBEN', 'Prebenjamín'), ('BEN', 'Benjamín'), ('ALE', 'Alevín'), ('INF', 'Infantil'), ('CAD', 'Cadete'), ('JUV', 'Juvenil'), ('SEN', 'Sénior')], default='CAD', max_length=20)),
                ('subcategoria', models.CharField(choices=[('A', 'A'), ('B', 'B'), ('C', 'C')], default='A', max_length=6)),
                ('equipo', models.CharField(choices=[('M', 'Masculino'), ('F', 'Femenino')], default='M', max_length=10)),
                ('posicion', models.CharField(max_length=50)),
                ('edad', models.IntegerField()),
                ('imagen', models.ImageField(blank=True, null=True, upload_to='jugadores/')),
                ('descripcion', models.TextField(blank=True, null=True)),
                ('ha_pagado_cuota', models.BooleanField(default=False)),
            ],
        ),
        migrations.CreateModel(
            name='Panel',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('title', models.CharField(max_length=100)),
                ('text', models.TextField()),
                ('query', models.JSONField()),
                ('visible_to', models.JSONField()),
            ],
        ),
        migrations.CreateModel(
            name='ComentarioClubRival',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('titulo', models.CharField(max_length=100)),
                ('contenido', models.TextField()),
                ('fecha_creacion', models.DateTimeField(default=django.utils.timezone.now)),
                ('autor', models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, to=settings.AUTH_USER_MODEL)),
                ('club', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='comentarios', to='jugadores.clubrival')),
            ],
        ),
        migrations.CreateModel(
            name='ExcelPorCategoria',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('categoria', models.CharField(choices=[('PREBEN', 'Prebenjamín'), ('BEN', 'Benjamín'), ('ALE', 'Alevín'), ('INF', 'Infantil'), ('CAD', 'Cadete'), ('JUV', 'Juvenil'), ('SEN', 'Sénior')], max_length=20)),
                ('equipo', models.CharField(choices=[('M', 'Masculino'), ('F', 'Femenino')], default='M', max_length=1)),
                ('archivo', models.FileField(upload_to='excels/')),
                ('nombre', models.CharField(blank=True, max_length=255, null=True)),
            ],
            options={
                'unique_together': {('categoria', 'equipo')},
            },
        ),
        migrations.CreateModel(
            name='ExcelFile',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('file', models.FileField(upload_to='excels/')),
                ('name', models.CharField(blank=True, max_length=255, null=True)),
                ('folder', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='excels', to='jugadores.foldergroup')),
            ],
        ),
        migrations.CreateModel(
            name='Contrato',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('contrato_fijo', models.DecimalField(blank=True, decimal_places=2, max_digits=10, null=True)),
                ('contrato_por_gol', models.DecimalField(blank=True, decimal_places=2, max_digits=10, null=True)),
                ('fijo_ganado', models.DecimalField(blank=True, decimal_places=2, max_digits=10, null=True)),
                ('jugador', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, related_name='contrato', to='jugadores.jugador')),
            ],
        ),
        migrations.CreateModel(
            name='ComentarioJugador',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('titulo', models.CharField(max_length=100)),
                ('contenido', models.TextField()),
                ('fecha_emision', models.DateField(default=django.utils.timezone.now)),
                ('fecha_creacion', models.DateField(default=django.utils.timezone.now)),
                ('autor', models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, to=settings.AUTH_USER_MODEL)),
                ('jugador', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='comentarios', to='jugadores.jugador')),
            ],
        ),
        migrations.CreateModel(
            name='Carpeta',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('nombre', models.CharField(max_length=50)),
                ('carpeta_padre', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='subcarpetas', to='jugadores.carpeta')),
                ('jugador', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='carpetas', to='jugadores.jugador')),
            ],
        ),
        migrations.CreateModel(
            name='JugadorRival',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('nombre', models.CharField(max_length=100)),
                ('dorsal', models.PositiveIntegerField(blank=True, null=True)),
                ('posicion', models.CharField(blank=True, max_length=50)),
                ('edad', models.PositiveIntegerField(blank=True, null=True)),
                ('imagen', models.ImageField(blank=True, null=True, upload_to='rivales/')),
                ('equipo', models.CharField(blank=True, choices=[('M', 'Masculino'), ('F', 'Femenino')], max_length=1, null=True)),
                ('observaciones', models.TextField(blank=True, null=True)),
                ('club', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='jugadores', to='jugadores.clubrival')),
            ],
        ),
        migrations.CreateModel(
            name='ComentarioRival',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('titulo', models.CharField(max_length=100)),
                ('contenido', models.TextField()),
                ('fecha_emision', models.DateTimeField(default=django.utils.timezone.now, null=True)),
                ('autor', models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, to=settings.AUTH_USER_MODEL)),
                ('jugador', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='comentarios', to='jugadores.jugadorrival')),
            ],
        ),
        migrations.CreateModel(
            name='PDF',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('archivo', models.FileField(upload_to='pdfs')),
                ('descripcion', models.CharField(blank=True, max_length=255)),
                ('nombre', models.CharField(blank=True, max_length=255, null=True)),
                ('url', models.URLField(blank=True, max_length=500, null=True)),
                ('carpeta', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='pdfs', to='jugadores.carpeta')),
            ],
        ),
        migrations.CreateModel(
            name='PermisoPersonalizado',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('categoria', models.CharField(choices=[('PREBEN', 'Prebenjamín'), ('BEN', 'Benjamín'), ('ALE', 'Alevín'), ('INF', 'Infantil'), ('CAD', 'Cadete'), ('JUV', 'Juvenil'), ('SEN', 'Sénior'), ('RIV', 'Rivales')], max_length=10)),
                ('subcategoria', models.CharField(choices=[('A', 'A'), ('B', 'B'), ('C', 'C')], default='A', max_length=6)),
                ('equipo', models.CharField(choices=[('M', 'Masculino'), ('F', 'Femenino')], max_length=1)),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='permisos', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'unique_together': {('user', 'categoria', 'equipo', 'subcategoria')},
            },
        ),
        migrations.CreateModel(
            name='PermisoVista',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('vista', models.CharField(max_length=50)),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='vistas', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'unique_together': {('user', 'vista')},
            },
        ),
    ]
