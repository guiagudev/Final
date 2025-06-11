from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import action, api_view, permission_classes
from .models import *
from .serializers import *
from django.contrib.auth import authenticate, login
from rest_framework import filters
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from django_filters.rest_framework import DjangoFilterBackend
from django.shortcuts import get_object_or_404
from datetime import date


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
        user_data.append({
            'id': user.id,
            'username': user.username,
            'grupo': user.groups.first().name if user.groups.exists() else '',
            'permisos': list(permisos)
        })
    return Response(user_data)



@api_view(['PUT'])
@permission_classes([IsAdminUser])
def actualizar_usuario(request, pk):
    try:
        user = User.objects.get(pk=pk)
    except User.DoesNotExist:
        return Response({'error': 'Usuario no encontrado'}, status=404)

    data = request.data
    username = data.get('username')
    password = data.get('password')
    grupo = data.get('grupo')
    permisos = data.get('permisos', [])

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

    user.save()

    # Reemplazar permisos
    PermisoPersonalizado.objects.filter(user=user).delete()
    for permiso in permisos:
        categoria = permiso.get('categoria')
        equipo = permiso.get('equipo')
        if categoria and equipo:
            PermisoPersonalizado.objects.create(user=user, categoria=categoria, equipo=equipo)

    return Response({'message': 'Usuario actualizado con éxito'})

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
    password = data.get('password')

    if username:
        user.username = username

    if password:
        user.set_password(password)

    if grupo:
        # Limpiar grupos anteriores y asignar el nuevo
        user.groups.clear()
        try:
            group = Group.objects.get(name=grupo)
            user.groups.add(group)
        except Group.DoesNotExist:
            return Response({'error': 'Grupo no válido'}, status=400)

    user.save()

    # Eliminar permisos antiguos
    PermisoPersonalizado.objects.filter(user=user).delete()

    # Crear los nuevos
    for permiso in permisos:
        categoria = permiso.get('categoria')
        equipo = permiso.get('equipo')
        if categoria and equipo:
            PermisoPersonalizado.objects.create(
                user=user, categoria=categoria, equipo=equipo)

    return Response({'message': 'Usuario actualizado correctamente'})

@api_view(['POST'])
# @permission_classes([IsAdminUser])
def crear_usuario(request):
    data = request.data
    username = data.get('username')
    password = data.get('password')
    grupo = data.get('grupo')
    permisos = data.get('permisos', [])

    if not username or not password or not grupo:
        return Response({'error': 'Faltan datos requeridos'}, status=400)

    # Crear usuario
    user = User.objects.create_user(username=username, password=password)

    # Asignar grupo
    try:
        group = Group.objects.get(name=grupo)
        user.groups.add(group)
    except Group.DoesNotExist:
        return Response({'error': 'Grupo no válido'}, status=400)

    # Asignar permisos personalizados
    for permiso in permisos:
        categoria = permiso.get('categoria')
        equipo = permiso.get('equipo')
        if categoria and equipo:
            PermisoPersonalizado.objects.create(user=user, categoria=categoria, equipo=equipo)

    return Response({'message': 'Usuario creado con éxito'}, status=201)
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def me_view(request):
    user = request.user
    permisos = PermisoPersonalizado.objects.filter(user=user).values('categoria', 'equipo')
    
    return Response({
        "username": user.username,
        "is_staff": user.is_staff,
        "is_superuser": user.is_superuser,
        "groups": [group.name for group in user.groups.all()],
        "permisos": list(permisos)  # 👈 añade los permisos personalizados aquí
    })
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def panels_view(request):
    return Response([
        {
            "title": "Primer Equipo pepe",
            "text": "Jugadores del equipo masculino.",
            "query": { "equipo": "M", "categoria": "SEN" },
            "visibleTo": ["admin", "coordinador"]
        },
        ...

    ])
@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def panel_list_create_view(request):
    if request.method == 'GET':
        panels = Panel.objects.all()
        serializer = PanelSerializer(panels, many=True)
        return Response(serializer.data)

    if request.method == 'POST':
        # Solo permitir a admins crear
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
    
    # Método para obtener las opciones para poblar dropdowns
    @action(detail=False, methods=['get'])
    def opciones(self, request):
        """
        Devuelve las opciones de categoría y subcategorías para poblar dropdowns
        """
        return Response({
            "categorias": Jugador.OPCIONES_CATEGORIA,
            "subcategorias": Jugador.OPCIONES_SUBCATEGORIA,
            "equipos": Jugador.OPCIONES_EQUIPO,
        })

    def get_queryset(self):
        """
        Filtra los jugadores en base a los parámetros 'equipo', 'categoria' y 'subcategoria'
        """
        queryset = super().get_queryset()

    # Obtener los parámetros de consulta
        equipo = self.request.query_params.get('equipo', None)
        categoria = self.request.query_params.get('categoria', None)
        subcategoria = self.request.query_params.get('subcategoria', None)
        nombre = self.request.query_params.get('nombre', None)
        edad_min = self.request.query_params.get('edad_min',None)
        edad_max = self.request.query_params.get('edad_max',None)

    # Aplicar filtros si los parámetros están presentes
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
        """
        Sobrescribe el método perform_update para agregar validación o depuración antes de guardar
        """
        jugador = serializer.save()  # Guarda el objeto actualizado
        print(f"Jugador {jugador.id} actualizado con éxito")  # Aquí podemos hacer una depuración

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