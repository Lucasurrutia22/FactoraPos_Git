from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),

    # rutas del sistema
    path('', include('core.urls')),              # index y dashboard
    path('inventario/', include('inventario.urls')),
    path('movimientos/', include('movimientos.urls')),
    path('proveedores/', include('proveedores.urls')),
    path('reportes/', include('reportes.urls')),
    path('rma/', include('rma.urls')),
    path('usuarios/', include('usuarios.urls')),
    path('ventas/', include('ventas.urls')),
    path('config/', include('config.urls')),
]
