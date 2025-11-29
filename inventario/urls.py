from django.urls import path
from . import views

urlpatterns = [
    path('', views.inventario_view, name='inventario'),
    
    # APIs de Productos
    path('api/productos/', views.api_productos_list, name='api_productos_list'),
    path('api/productos/create/', views.api_productos_create, name='api_productos_create'),
    path('api/productos/<int:id>/update/', views.api_productos_update, name='api_productos_update'),
    path('api/productos/<int:id>/delete/', views.api_productos_delete, name='api_productos_delete'),
    
    # APIs de Proveedores
    path('api/proveedores/', views.api_proveedores_list, name='api_proveedores_list'),
    path('api/proveedores/create/', views.api_proveedores_create, name='api_proveedores_create'),
    
    # APIs de Movimientos
    path('api/movimientos/', views.api_movimientos_list, name='api_movimientos_list'),
    path('api/movimientos/create/', views.api_movimientos_create, name='api_movimientos_create'),
]
