from django.shortcuts import render

def reportes_view(request):
    return render(request, 'reportes/reportes.html')
