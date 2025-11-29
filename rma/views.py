from django.shortcuts import render

def rma_view(request):
    return render(request, 'rma/RMA.html')
