from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import *
from . import views
from rest_framework_simplejwt.views import (
        TokenObtainPairView,
        TokenRefreshView,
    )
router = DefaultRouter()
router.register(r'jugadores', JugadorViewSet)
router.register(r'carpetas', CarpetaViewSet, basename='carpeta')
router.register(r'pdfs',PDFViewSet)
router.register(r'eventos',EventoViewSet)
router.register(r'folders', FolderGroupViewSet)
router.register(r'files', ExcelFileViewSet)
router.register(r'usuarios', UserViewSet, basename='usuario')
router.register(r'contratos', ContratoViewSet)
router.register(r'groups', GroupViewSet)
router.register(r'comentarios-jugador', ComentarioJugadorViewSet)
router.register(r'excels-categoria', ExcelPorCategoriaViewSet, basename='excel-categoria')
router.register(r'clubes-rivales', ClubRivalViewSet)
router.register(r'jugadores-rivales', JugadorRivalViewSet)
router.register(r'comentarios-rivales',ComentarioRivalViewset)
router.register(r'comentarios-club-rival', ComentarioClubRivalViewSet)
router.register(r'comentarios-direccion-deportiva', ComentarioDireccionDeportivaViewSet, basename='comentario-direccion-deportiva')

urlpatterns = [
    path('api/', include(router.urls)),
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/me/', me_view),
    path('api/panels/', panel_list_create_view),
    path('api/crear-usuario/', views.crear_usuario, name='crear_usuario'),
    path('api/usuarios/', views.listar_usuarios, name='listar_usuarios'),
    path('api/actualizar-usuario/<int:user_id>/', views.actualizar_usuario, name='actualizar_usuario'),
    path('jugadores/cuota-pendiente/', jugadores_con_cuota_pendiente, name='cuota-pendiente'),
   
    # path('api/jugadores/<int:jugador_id>/comentarios/', views.comentarios_por_jugador, name='comentarios_por_jugador'),

] + router.urls
