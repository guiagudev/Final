from rest_framework import serializers
from .models import *
from django.contrib.auth.models import User
from django.contrib.auth.models import Group
class PanelSerializer(serializers.ModelSerializer):
    class Meta:
        model = Panel
        fields = '__all__'
class UserSerializer(serializers.ModelSerializer):
    grupo = serializers.SerializerMethodField()
    permisos = serializers.SerializerMethodField()
    vistas = serializers.SerializerMethodField()

    groups = serializers.SlugRelatedField(
        many=True,
        slug_field='name',
        queryset=Group.objects.all(),
        write_only=True
    )

    class Meta:
        model = User
        fields = [
            'id',
            'username',
            'password',
            'grupo',
            'groups',
            'permisos',
            'vistas'
        ]
        extra_kwargs = {'password': {'write_only': True}}

    def get_grupo(self, obj):
        return obj.groups.first().name if obj.groups.exists() else ""

    def get_permisos(self, obj):
        return list(obj.permisos.values('categoria', 'subcategoria', 'equipo'))

    def get_vistas(self, obj):
        return list(obj.vistas.values_list('vista', flat=True))

    def create(self, validated_data):
        groups = validated_data.pop('groups', [])
        password = validated_data.pop('password', None)
        user = User(**validated_data)
        if password:
            user.set_password(password)
        user.save()
        user.groups.set(groups)
        return user

    def update(self, instance, validated_data):
        groups = validated_data.pop('groups', None)
        password = validated_data.pop('password', None)

        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        if password:
            instance.set_password(password)
        if groups is not None:
            instance.groups.set(groups)

        instance.save()
        return instance

class ContratoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Contrato
        fields = '__all__'
class CategoriaSerializer(serializers.ModelSerializer):
    class Meta:
        model=Categoria
        fields = ['id','nombre']
class JugadorSerializer(serializers.ModelSerializer):
    # Usamos ChoiceField para los campos
    categoria = serializers.ChoiceField(choices=Jugador.OPCIONES_CATEGORIA)
    subcategoria = serializers.ChoiceField(choices=Jugador.OPCIONES_SUBCATEGORIA)
    equipo = serializers.ChoiceField(choices=Jugador.OPCIONES_EQUIPO)

    class Meta:
        model = Jugador
        fields = '__all__'

    def to_representation(self, instance):
        representation = super().to_representation(instance)

    # Añadir etiquetas legibles sin modificar los campos originales
        representation['categoria_display'] = dict(Jugador.OPCIONES_CATEGORIA).get(instance.categoria)
        representation['subcategoria_display'] = dict(Jugador.OPCIONES_SUBCATEGORIA).get(instance.subcategoria)
        representation['equipo_display'] = dict(Jugador.OPCIONES_EQUIPO).get(instance.equipo)

    # Ocultar cuota si es jugador Sénior
        if instance.categoria == 'SEN':
            representation.pop('ha_pagado_cuota', None)

        return representation


    def get_imagen_url(self, obj):
        request = self.context.get("request")
        if obj.imagen:
            return request.build_absolute_uri(obj.imagen.url)
        return None
class ComentarioJugadorSerializer(serializers.ModelSerializer):
    autor_nombre = serializers.CharField(source='autor.username', read_only=True)
    class Meta:
        model = ComentarioJugador
        fields= '__all__'
class CarpetaSerializer(serializers.ModelSerializer):
    subcarpetas = serializers.SerializerMethodField()

    class Meta:
        model = Carpeta
        fields = '__all__'

    def get_subcarpetas(self, obj):
        # Aquí estamos accediendo a las subcarpetas a través de la relación inversa
        # "subcarpetas" es el `related_name` que definimos en `ForeignKey` para la relación recursiva
        return CarpetaSerializer(obj.subcarpetas.all(), many=True).data if obj.subcarpetas.exists() else []
class FolderGroupSerializer(serializers.ModelSerializer):
    class Meta:
        model = FolderGroup
        fields = '__all__'

class ExcelFileSerializer(serializers.ModelSerializer):
    class Meta:
        model = ExcelFile
        fields = '__all__'

class PDFSerializer(serializers.ModelSerializer):
    class Meta:
        model = PDF
        fields = '__all__'
 
class EventoSerializer(serializers.ModelSerializer):
     class Meta:
         model = Evento
         fields = '__all__'
        # read_only_fields = ['creado_por']


class GroupSerializer(serializers.ModelSerializer):
    class Meta:
        model = Group
        fields = ['id', 'name']
# serializers.py


class ExcelPorCategoriaSerializer(serializers.ModelSerializer):
    class Meta:
        model = ExcelPorCategoria
        fields = '__all__'


class ClubRivalSerializer(serializers.ModelSerializer):
    class Meta:
        model = ClubRival
        fields = '__all__'


class JugadorRivalSerializer(serializers.ModelSerializer):
    club_nombre = serializers.CharField(source='club.nombre', read_only=True)

    class Meta:
        model = JugadorRival
        fields = '__all__'
        
class ComentarioRivalSerializer(serializers.ModelSerializer):
    autor_nombre = serializers.CharField(source='autor.username', read_only=True)
    class Meta:
        model = ComentarioRival
        fields= '__all__'
class ComentarioClubRivalSerializer(serializers.ModelSerializer):
    autor = serializers.SerializerMethodField()

    class Meta:
        model = ComentarioClubRival
        fields = '__all__'

    def get_autor(self, obj):
        if obj.autor:
            return {"id": obj.autor.id, "username": obj.autor.username}
        return None