 
from django.shortcuts import render

def movimientos_view(request):
    return render(request, 'movimientos/Movimientos.html')
