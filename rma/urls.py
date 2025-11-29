from django.urls import path
from .views import rma_view

urlpatterns = [
    path('', rma_view, name='rma'),
]
