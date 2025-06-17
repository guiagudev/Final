from django.db import models
from django.contrib.auth.models import User
import django_filters

class Categoria(models.Model):
    codigo = models.CharField(max_length=20, unique=True)
    nombre = models.CharField(max_length=100, unique=True)
    descripcion = models.TextField(blank=True, null=True)

    def __str__(self):
        return self.nombre

class Panel(models.Model):
    title = models.CharField(max_length=100)
    text = models.TextField()
    query = models.JSONField()
    visible_to = models.JSONField()  # ejemplo: ["admin", "entrenador"]

    def __str__(self):
        return self.title

class Jugador(models.Model):
    OPCIONES_CATEGORIA = [
        ('PREBEN', 'Prebenjamín'),
        ('BEN', 'Benjamín'),
        ('ALE', 'Alevín'),
        ('INF', 'Infantil'),
        ('CAD', 'Cadete'),
        ('JUV', 'Juvenil'),
        ('SEN', 'Sénior')
    ]
    OPCIONES_SUBCATEGORIA = [
        ('A', 'A'),
        ('B', 'B'),
        ('C', 'C'),
        # Puedes agregar más si es necesario
    ]
    OPCIONES_EQUIPO = [
        ('M', 'Masculino'),
        ('F', 'Femenino'),
    ]
    nombre = models.CharField(max_length=100)
    p_apellido = models.CharField(max_length=100, null=True)
    s_apellido = models.CharField(max_length=100, blank = True)   
    categoria = models.CharField(max_length=20, choices = OPCIONES_CATEGORIA, default='CAD')
    subcategoria = models.CharField(max_length=6, choices =OPCIONES_SUBCATEGORIA, default='A')
    equipo = models.CharField(max_length=10, choices=OPCIONES_EQUIPO, default = "M")
    posicion = models.CharField(max_length=50)
    edad = models.IntegerField()
    imagen = models.ImageField(upload_to ='jugadores/', blank=True, null=True)
    descripcion = models.TextField(blank=True, null=True)
    ha_pagado_cuota = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.nombre} {self.p_apellido} {self.s_apellido} "

class JugadorFilter(django_filters.FilterSet):
    posicion = django_filters.CharFilter(lookup_expr='icontains')

    class Meta:
        model = Jugador
        fields = ['posicion', 'categoria', 'equipo', 'edad']


class ComentarioJugador(models.Model):
    jugador = models.ForeignKey('Jugador', on_delete=models.CASCADE, related_name='comentarios')
    autor = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    titulo = models.CharField(max_length=100)
    contenido = models.TextField()
    fecha_emision = models.DateField(null=True)
    fecha_creacion = models.DateField(null=True)

    def __str__(self):
        return f"{self.titulo} ({self.jugador.nombre})"
class Contrato(models.Model):
    jugador = models.OneToOneField('Jugador', on_delete=models.CASCADE, related_name='contrato')
    contrato_fijo = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    contrato_por_gol = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    fijo_ganado = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    def __str__(self):
        return f"Contrado de {self.jugador}"
class Carpeta(models.Model):
    jugador = models.ForeignKey(Jugador, related_name ='carpetas', on_delete=models.CASCADE)
    nombre = models.CharField(max_length = 50)
    carpeta_padre = models.ForeignKey('self', on_delete = models.CASCADE, null=True, blank = True, related_name='subcarpetas')
    
    def __str__(self):
        return f"{self.nombre} {self.jugador.nombre}"

class FolderGroup(models.Model):
    name = models.CharField(max_length=255, unique=True)
    

    def __str__(self):
        return self.name
         
class ExcelFile(models.Model):
    folder = models.ForeignKey(FolderGroup, on_delete=models.CASCADE, related_name="excels")
    file = models.FileField(upload_to="excels/")
    name = models.CharField(max_length=255, blank=True, null=True)  # Nuevo campo opcional

    def __str__(self):
        return self.name if self.name else self.file.name.split("/")[-1]

    def __str__(self):
        return self.file.name

    
            
class PDF (models.Model):
    carpeta = models.ForeignKey(Carpeta, related_name='pdfs', on_delete = models.CASCADE, null=True, blank = True)
    archivo = models.FileField(upload_to='pdfs')
    descripcion = models.CharField(max_length=255, blank=True)
    nombre = models.CharField(max_length=255, blank=True, null=True)
    url = models.URLField(max_length=500, blank=True, null=True)
    def save(self, *args, **kwargs):
        if not self.nombre:
            self.nombre = self.archivo.name.split('/')[-1]
        if not self.url:
            self.url = self.archivo.url
            
        super().save(*args, **kwargs)
    def __str__(self):
        return f"{self.nombre} - {self.carpeta.nombre}"
   
   


class Evento(models.Model):
    CATEGORIAS = [
        ('Partido', 'Partido'),
        ('Entrenamiento', 'Entrenamiento'),
        ('Reunion', 'Reunión'),
    ]

    descripcion = models.TextField(null=True)
    fecha = models.DateTimeField()
    categoria = models.CharField(max_length=20, choices=CATEGORIAS, default='Partido')
    equipo1 = models.CharField(max_length=45, default='Racing Club Portuense')
    equipo2 = models.CharField(max_length=45, blank=True, null=True)  # Solo para partidos
    localizacion = models.CharField(max_length=100, blank=True, null=True)

    def __str__(self):
        if self.categoria == 'Partido':
            return f"{self.fecha.strftime('%Y-%m-%d')} - Partido: {self.equipo1} vs {self.equipo2 or 'TBD'}"
        elif self.categoria == 'Entrenamiento':
            return f"{self.fecha.strftime('%Y-%m-%d')} - Entrenamiento ({self.equipo1})"
        else:
            return f"{self.fecha.strftime('%Y-%m-%d')} - Reunión ({self.descripcion[:30]}...)"

                                                     
class PermisoPersonalizado(models.Model):
    CATEGORIAS = [
        ('PREBEN', 'Prebenjamín'),
        ('BEN', 'Benjamín'),
        ('ALE', 'Alevín'),
        ('INF', 'Infantil'),
        ('CAD', 'Cadete'),
        ('JUV', 'Juvenil'),
        ('SEN', 'Sénior')
    ]
    EQUIPOS = [
        ('M', 'Masculino'),
        ('F', 'Femenino')
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='permisos')
    categoria = models.CharField(max_length=10, choices=CATEGORIAS)
    equipo = models.CharField(max_length=1, choices=EQUIPOS)
    vista = models.CharField(max_length=50, blank=True, null=True)  # 👈 nueva
    class Meta:
        unique_together = ('user', 'categoria', 'equipo')

    def __str__(self):
        return f"{self.user.username} → {self.categoria or self.vista }-{self.equipo or ''}"                                                     
class ExcelPorCategoria(models.Model):
    categoria = models.CharField(
        max_length=20,
        choices=Jugador.OPCIONES_CATEGORIA
    )
    equipo = models.CharField(
        max_length=1,
        choices=Jugador.OPCIONES_EQUIPO,
        default='M'
    )
    archivo = models.FileField(upload_to='excels/')
    nombre = models.CharField(max_length=255, blank=True, null=True)

    class Meta:
        unique_together = ('categoria', 'equipo')

    def __str__(self):
        return f"{self.nombre or 'Excel'} - {self.categoria} ({self.equipo})"

class ClubRival(models.Model):
    nombre = models.CharField(max_length=100, unique=True)
    ciudad = models.CharField(max_length=100, blank=True, null=True)
    categoria = models.CharField(max_length=20, choices=Jugador.OPCIONES_CATEGORIA, blank=True, null=True)
    equipo = models.CharField(max_length=1, choices=Jugador.OPCIONES_EQUIPO, blank=True, null=True)
    imagen = models.ImageField(upload_to ='clubes/', blank=True, null=True)
    def __str__(self):
        return self.nombre
class JugadorRival(models.Model):
    club = models.ForeignKey(ClubRival, related_name='jugadores', on_delete=models.CASCADE)
    nombre = models.CharField(max_length=100)
    dorsal = models.PositiveIntegerField(blank=True, null=True)
    posicion = models.CharField(max_length=50, blank=True)
    edad = models.PositiveIntegerField(blank=True, null=True)
    imagen = models.ImageField(upload_to ='rivales/', blank=True, null=True)
    observaciones = models.TextField(blank=True)

    def __str__(self):
        return f"{self.nombre} ({self.club.nombre})"
class ComentarioRival(models.Model):
    jugador = models.ForeignKey('JugadorRival', on_delete=models.CASCADE, related_name='comentarios')
    autor = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    titulo = models.CharField(max_length=100)
    contenido = models.TextField()
    fecha_emision = models.DateField(null=True)
    fecha_creacion = models.DateField(null=True)

    def __str__(self):
        return f"{self.titulo} ({self.jugador.nombre})"
class ComentarioClubRival(models.Model):
    club = models.ForeignKey('ClubRival', on_delete=models.CASCADE, related_name='comentarios')
    autor = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    titulo = models.CharField(max_length=100)
    contenido = models.TextField()
    fecha_creacion = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.titulo} - {self.club.nombre}"
