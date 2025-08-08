from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from django_filters.rest_framework import DjangoFilterBackend
from django.contrib.auth.models import User, Group
from django.shortcuts import get_object_or_404
from datetime import date
from rest_framework import serializers

from .models import *
from .serializers import *


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def jugadores_con_cuota_pendiente(request):
    jugadores = Jugador.objects.exclude(categoria='SEN').filter(ha_pagado_cuota=False)
    serializer = JugadorSerializer(jugadores, many=True)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAdminUser])
def listar_usuarios(request):
    users = User.objects.all()
    user_data = []
    for user in users:
        permisos = PermisoPersonalizado.objects.filter(user=user).values('categoria', 'equipo')
        vistas = PermisoVista.objects.filter(user=user).values_list('vista', flat=True)
        user_data.append({
            'id': user.id,
            'username': user.username,
            'grupo': user.groups.first().name if user.groups.exists() else '',
            'permisos': list(permisos),
            'vistas': list(vistas),
        })
    return Response(user_data)

@api_view(['PUT'])
@permission_classes([IsAdminUser])
def actualizar_usuario(request, user_id):
    try:
        user = User.objects.get(id=user_id)
    except User.DoesNotExist:
        return Response({'error': 'Usuario no encontrado'}, status=404)

    data = request.data
    username = data.get('username')
    grupo = data.get('grupo')
    permisos = data.get('permisos', [])
    vistas = data.get('vistas', [])
    password = data.get('password')

    if username:
        user.username = username

    if password:
        user.set_password(password)

    if grupo:
        user.groups.clear()
        try:
            group = Group.objects.get(name=grupo)
            user.groups.add(group)
        except Group.DoesNotExist:
            return Response({'error': 'Grupo no válido'}, status=400)

        user.is_staff = grupo == "admin"

    user.save()

    # Limpiar permisos previos
    PermisoPersonalizado.objects.filter(user=user).delete()
    PermisoVista.objects.filter(user=user).delete()

    # Guardar nuevos permisos
    for permiso in permisos:
        categoria = permiso.get('categoria')
        subcategoria = permiso.get('subcategoria')
        equipo = permiso.get('equipo')

        if categoria and equipo:
            PermisoPersonalizado.objects.create(user=user, categoria=categoria, subcategoria=subcategoria, equipo=equipo)

    for vista in vistas:
        PermisoVista.objects.create(user=user, vista=vista)

    return Response({'message': 'Usuario actualizado correctamente'})


@api_view(['POST'])
@permission_classes([IsAdminUser])
def crear_usuario(request):
    data = request.data
    username = data.get('username')
    password = data.get('password')
    grupo = data.get('grupo')
    permisos = data.get('permisos', [])
    vistas = data.get('vistas', [])

    if not username or not password or not grupo:
        return Response({'error': 'Faltan datos requeridos'}, status=400)

    user = User.objects.create_user(username=username, password=password)

    try:
        group = Group.objects.get(name=grupo)
        user.groups.add(group)
    except Group.DoesNotExist:
        return Response({'error': 'Grupo no válido'}, status=400)

    user.is_staff = grupo == "admin"
    user.save()

    for permiso in permisos:
        categoria = permiso.get('categoria')
        equipo = permiso.get('equipo')
        if categoria and equipo:
            PermisoPersonalizado.objects.create(user=user, categoria=categoria, equipo=equipo)

    for vista in vistas:
        PermisoVista.objects.create(user=user, vista=vista)

    return Response({'message': 'Usuario creado con éxito'}, status=201)



@api_view(['GET'])
@permission_classes([IsAuthenticated])
def me_view(request):
    user = request.user
    permisos = PermisoPersonalizado.objects.filter(user=user)
    vistas = PermisoVista.objects.filter(user=user).values_list('vista', flat=True)

    return Response({
        "username": user.username,
        "is_staff": user.is_staff,
        "is_superuser": user.is_superuser,
        "groups": [group.name for group in user.groups.all()],
        "permisos": list(permisos.values('categoria', 'subcategoria', 'equipo')),
        "vistas": list(vistas),
    })

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def panels_view(request):
    return Response([
        {
            "title": "Primer Equipo pepe",
            "text": "Jugadores del equipo masculino.",
            "query": {"equipo": "M", "categoria": "SEN"},
            "visibleTo": ["admin", "coordinador"]
        },
    ])


@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def panel_list_create_view(request):
    if request.method == 'GET':
        panels = Panel.objects.all()
        serializer = PanelSerializer(panels, many=True)
        return Response(serializer.data)

    if request.method == 'POST':
        if not request.user.groups.filter(name='admin').exists():
            return Response({'detail': 'No autorizado'}, status=status.HTTP_403_FORBIDDEN)

        serializer = PanelSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAdminUser]


class JugadorViewSet(viewsets.ModelViewSet):
    queryset = Jugador.objects.all()
    serializer_class = JugadorSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_class = JugadorFilter
    permission_classes = [IsAuthenticated]

    @action(detail=False, methods=['get'])
    def opciones(self, request):
        return Response({
            "categorias": Jugador.OPCIONES_CATEGORIA,
            "subcategorias": Jugador.OPCIONES_SUBCATEGORIA,
            "equipos": Jugador.OPCIONES_EQUIPO,
        })

    def get_queryset(self):
        queryset = super().get_queryset()
        equipo = self.request.query_params.get('equipo')
        categoria = self.request.query_params.get('categoria')
        subcategoria = self.request.query_params.get('subcategoria')
        nombre = self.request.query_params.get('nombre')
        edad_min = self.request.query_params.get('edad_min')
        edad_max = self.request.query_params.get('edad_max')

        if equipo:
            queryset = queryset.filter(equipo=equipo)
        if categoria:
            queryset = queryset.filter(categoria=categoria)
        if subcategoria:
            queryset = queryset.filter(subcategoria=subcategoria)
        if nombre:
            queryset = queryset.filter(nombre__icontains=nombre)
        if edad_min:
            queryset = queryset.filter(edad__gte=int(edad_min))
        if edad_max:
            queryset = queryset.filter(edad__lte=int(edad_max))

        return queryset

    def perform_update(self, serializer):
        jugador = serializer.save()
        print(f"Jugador {jugador.id} actualizado con éxito")


# Aquí irían los demás viewsets como ComentarioJugadorViewSet, EventoViewSet, etc.
# Puedes pedir que los complete si quieres incluir todos los detalles faltantes.

class ComentarioJugadorViewSet(viewsets.ModelViewSet):
    queryset = ComentarioJugador.objects.all().order_by('-fecha_creacion')
    serializer_class = ComentarioJugadorSerializer
    # permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(
            autor=self.request.user,
            fecha_emision=date.today(auto_now_add=True),
            fecha_creacion=date.today(auto_now_add=True)
        )

    @action(detail=False, methods=['get', 'post'], url_path='jugador/(?P<jugador_id>[^/.]+)')
    def por_jugador(self, request, jugador_id=None):
        jugador = get_object_or_404(Jugador, pk=jugador_id)

        if request.method == 'GET':
            comentarios = ComentarioJugador.objects.filter(jugador=jugador).order_by('-fecha_creacion')
            serializer = self.get_serializer(comentarios, many=True)
            return Response(serializer.data)

        elif request.method == 'POST':
            data = request.data.copy()
            data['jugador'] = jugador.id
            data['autor'] = request.user.id
            serializer = self.get_serializer(data=data)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class ContratoViewSet(viewsets.ModelViewSet):
    queryset = Contrato.objects.all()
    serializer_class = ContratoSerializer
    permission_classes = [IsAuthenticated]

    @action(detail=False, methods=['get'], url_path='jugador/(?P<jugador_id>[^/.]+)')
    def contrato_por_jugador(self, request, jugador_id=None):
        try:
            contrato = Contrato.objects.get(jugador__id=jugador_id)
            serializer = self.get_serializer(contrato)
            return Response(serializer.data)
        except Contrato.DoesNotExist:
            return Response({"detail": "Contrato no encontrado"}, status=status.HTTP_404_NOT_FOUND)
class FolderGroupViewSet(viewsets.ModelViewSet):
    queryset = FolderGroup.objects.all()
    serializer_class = FolderGroupSerializer

class ExcelFileViewSet(viewsets.ModelViewSet):
    queryset = ExcelFile.objects.all()
    serializer_class = ExcelFileSerializer
    def get_queryset(self):
        queryset = ExcelFile.objects.all()
        folder_id = self.request.query_params.get('folder')  # Captura el parámetro de la URL
        
        if folder_id:  
            queryset = queryset.filter(folder_id=folder_id)  # Filtra los archivos por carpeta

        return queryset       
class CarpetaViewSet(viewsets.ModelViewSet):
    queryset = Carpeta.objects.all()  # Definir un queryset básico
    serializer_class = CarpetaSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        jugador_id = self.request.query_params.get('jugador_id')
        carpeta_id = self.request.query_params.get('id')

        queryset = Carpeta.objects.all()  # Usar el queryset predeterminado

        if jugador_id:
            queryset = queryset.filter(jugador_id=jugador_id, carpeta_padre=None)  # Solo carpetas raíz

        if carpeta_id:
            queryset = queryset.filter(id=carpeta_id)

        return queryset
class PDFViewSet(viewsets.ModelViewSet): 
      
    queryset = PDF.objects.all()
    serializer_class = PDFSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        # Aquí puedes asignar automáticamente la carpeta al PDF
        carpeta_id = self.request.data.get('carpeta')
        carpeta = Carpeta.objects.get(id=carpeta_id)
        serializer.save(carpeta=carpeta)
        
        
class EventoViewSet (viewsets.ModelViewSet):
    queryset = Evento.objects.all()
    serializer_class = EventoSerializer
    permission_classes = [IsAuthenticated]
    
    
  #  def perform_create(self, serializer):
   #     serializer.save(creado_por=self.request.user)
class GroupViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Group.objects.all()
    serializer_class = GroupSerializer
    permission_classes = [IsAuthenticated] 

@api_view(['GET'])
@permission_classes([IsAuthenticated])  # o quítalo si quieres acceso público
def obtener_opciones_permisos(request):
    categorias = [{'value': cat[0], 'label': cat[1]} for cat in PermisoPersonalizado.CATEGORIAS]
    equipos = [{'value': eq[0], 'label': eq[1]} for eq in PermisoPersonalizado.EQUIPOS]
    return Response({'categorias': categorias, 'equipos': equipos})
@api_view(['GET'])
@permission_classes([IsAuthenticated])  # o deja sin protección si es para formularios públicos
def opciones_primer_equipo(request):
    from .models import PermisoPersonalizado

    categorias = [{'value': 'SEN', 'label': 'Sénior'}]
    equipos = [{'value': e[0], 'label': e[1]} for e in PermisoPersonalizado.EQUIPOS]

    return Response({'categorias': categorias, 'equipos': equipos})
class ExcelPorCategoriaViewSet(viewsets.ModelViewSet):
    queryset = ExcelPorCategoria.objects.all()
    serializer_class = ExcelPorCategoriaSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = super().get_queryset()
        categoria = self.request.query_params.get('categoria')
        equipo = self.request.query_params.get('equipo')
        if categoria and equipo:
            return queryset.filter(categoria=categoria, equipo=equipo)
        return queryset
class ClubRivalViewSet(viewsets.ModelViewSet):
    queryset = ClubRival.objects.all()
    serializer_class = ClubRivalSerializer
    permission_classes = [IsAuthenticated]


class JugadorRivalViewSet(viewsets.ModelViewSet):
    queryset = JugadorRival.objects.all()
    serializer_class = JugadorRivalSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = super().get_queryset()
        club_id = self.request.query_params.get("club")
        posicion = self.request.query_params.get("posicion")
        edad_min = self.request.query_params.get("edad_min")
        edad_max = self.request.query_params.get("edad_max")

        if club_id:
            queryset = queryset.filter(club_id=club_id)
        if posicion:
            queryset = queryset.filter(posicion__icontains=posicion)
        if edad_min:
            queryset = queryset.filter(edad__gte=edad_min)
        if edad_max:
            queryset = queryset.filter(edad__lte=edad_max)

        return queryset
class ComentarioRivalViewset(viewsets.ModelViewSet):
    queryset = ComentarioRival.objects.all()
    serializer_class = ComentarioRivalSerializer
    permission_classes=[IsAuthenticated]
    @action(detail=False, methods=['get'], url_path='jugador/(?P<jugador_id>[^/.]+)')
    def por_jugador(self, request, jugador_id=None):
        comentarios = self.get_queryset().filter(jugador_id=jugador_id)
        serializer = self.get_serializer(comentarios, many=True)
        return Response(serializer.data)
class ComentarioClubRivalViewSet(viewsets.ModelViewSet):
    queryset = ComentarioClubRival.objects.select_related("autor", "club").all().order_by('-fecha_creacion')
    serializer_class = ComentarioClubRivalSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(autor=self.request.user)

    @action(detail=False, methods=["get"], url_path="club/(?P<club_id>[^/.]+)")
    def por_club(self, request, club_id=None):
        comentarios = ComentarioClubRival.objects.filter(club_id=club_id).select_related("autor")
        serializer = self.get_serializer(comentarios, many=True)
        return Response(serializer.data)

class ComentarioDireccionDeportivaViewSet(viewsets.ModelViewSet):
    queryset = ComentarioDireccionDeportiva.objects.all().order_by('-fecha_modificacion')
    serializer_class = ComentarioDireccionDeportivaSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(autor=self.request.user)

    def perform_update(self, serializer):
        serializer.save(autor=self.request.user)

    @action(detail=False, methods=['get', 'put', 'delete'], url_path='(?P<categoria>[^/.]+)/(?P<subcategoria>[^/.]+)/(?P<equipo>[^/.]+)')
    def por_categoria_equipo(self, request, categoria=None, subcategoria=None, equipo=None):
        try:
            comentario = ComentarioDireccionDeportiva.objects.get(
                categoria=categoria,
                subcategoria=subcategoria,
                equipo=equipo
            )
        except ComentarioDireccionDeportiva.DoesNotExist:
            return Response({'error': 'Comentario no encontrado'}, status=404)

        if request.method == 'GET':
            serializer = self.get_serializer(comentario)
            return Response(serializer.data)
        elif request.method == 'PUT':
            serializer = self.get_serializer(comentario, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save(autor=request.user)
                return Response(serializer.data)
            return Response(serializer.errors, status=400)
        elif request.method == 'DELETE':
            comentario.delete()
            return Response(status=204)

class InformeJugadorViewSet(viewsets.ModelViewSet):
    queryset = InformeJugador.objects.all()
    serializer_class = InformeJugadorSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # Permitir informes para todas las categorías
        return InformeJugador.objects.all()

    def perform_create(self, serializer):
        # Obtener el jugador_id del request
        jugador_id = self.request.data.get('jugador')
        if not jugador_id:
            # Si no se proporciona jugador_id, intentar obtenerlo de la URL
            jugador_id = self.request.query_params.get('jugador_id')
        
        if jugador_id:
            try:
                jugador = Jugador.objects.get(id=jugador_id)
                serializer.save(
                    jugador=jugador,
                    creado_por=self.request.user, 
                    modificado_por=self.request.user
                )
            except Jugador.DoesNotExist:
                raise serializers.ValidationError("Jugador no encontrado")
        else:
            raise serializers.ValidationError("Se requiere el ID del jugador")

    def perform_update(self, serializer):
        serializer.save(modificado_por=self.request.user)

    @action(detail=False, methods=['get'], url_path='jugador/(?P<jugador_id>[^/.]+)')
    def por_jugador(self, request, jugador_id=None):
        try:
            informe = InformeJugador.objects.get(jugador_id=jugador_id)
            serializer = self.get_serializer(informe)
            return Response(serializer.data)
        except InformeJugador.DoesNotExist:
            return Response({'error': 'Informe no encontrado'}, status=404)

class SubcategoriaViewSet(viewsets.ModelViewSet):
    queryset = Subcategoria.objects.all()
    serializer_class = SubcategoriaSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = Subcategoria.objects.filter(activa=True)
        
        # Filtrar por categoría si se proporciona
        categoria = self.request.query_params.get('categoria')
        if categoria:
            queryset = queryset.filter(categoria=categoria)
        
        # Filtrar por equipo si se proporciona
        equipo = self.request.query_params.get('equipo')
        if equipo:
            queryset = queryset.filter(equipo=equipo)
        
        return queryset

    @action(detail=False, methods=['get'], url_path='categoria/(?P<categoria>[^/.]+)/equipo/(?P<equipo>[^/.]+)')
    def por_categoria_equipo(self, request, categoria=None, equipo=None):
        subcategorias = self.get_queryset().filter(
            categoria=categoria,
            equipo=equipo
        )
        serializer = self.get_serializer(subcategorias, many=True)
        return Response(serializer.data)


class TipoEntrenamientoViewSet(viewsets.ModelViewSet):
    queryset = TipoEntrenamiento.objects.filter(activo=True)
    serializer_class = TipoEntrenamientoSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return TipoEntrenamiento.objects.filter(activo=True)


class EntrenamientoViewSet(viewsets.ModelViewSet):
    queryset = Entrenamiento.objects.all()
    serializer_class = EntrenamientoSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = Entrenamiento.objects.all()
        
        # Filtrar por categoría si se proporciona
        categoria = self.request.query_params.get('categoria')
        if categoria:
            queryset = queryset.filter(categoria=categoria)
        
        # Filtrar por equipo si se proporciona
        equipo = self.request.query_params.get('equipo')
        if equipo:
            queryset = queryset.filter(equipo=equipo)
        
        # Filtrar por fecha si se proporciona
        fecha = self.request.query_params.get('fecha')
        if fecha:
            queryset = queryset.filter(fecha=fecha)
        
        return queryset

    def perform_create(self, serializer):
        serializer.save(creado_por=self.request.user)