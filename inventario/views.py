from django.shortcuts import render
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.db import connection
import json

def inventario_view(request):
    return render(request, 'inventario/Inventario.html')

# =============================================
# API REST para PRODUCTOS
# =============================================

def api_productos_list(request):
    """GET: Obtener todos los productos"""
    cursor = connection.cursor()
    cursor.execute("""
        SELECT p.ID_PRODUCTO, p.NOMBRE, p.DESCRIPCION, p.STOCK, p.PRECIO, 
               p.ID_PROVEEDOR, pr.NOMBRE as PROVEEDOR_NOMBRE
        FROM PRODUCTOS p
        LEFT JOIN PROVEEDORES pr ON p.ID_PROVEEDOR = pr.ID_PROVEEDOR
        ORDER BY p.ID_PRODUCTO
    """)
    columns = [col[0].lower() for col in cursor.description]
    productos = [dict(zip(columns, row)) for row in cursor.fetchall()]
    cursor.close()
    return JsonResponse({'success': True, 'data': productos})

@csrf_exempt
def api_productos_create(request):
    """POST: Crear un nuevo producto"""
    if request.method != 'POST':
        return JsonResponse({'success': False, 'error': 'Método no permitido'}, status=405)
    
    try:
        data = json.loads(request.body)
        cursor = connection.cursor()
        
        # Obtener el próximo ID
        cursor.execute("SELECT NVL(MAX(ID_PRODUCTO), 0) + 1 FROM PRODUCTOS")
        next_id = cursor.fetchone()[0]
        
        cursor.execute("""
            INSERT INTO PRODUCTOS (ID_PRODUCTO, NOMBRE, DESCRIPCION, STOCK, PRECIO, ID_PROVEEDOR)
            VALUES (%s, %s, %s, %s, %s, %s)
        """, [
            next_id,
            data.get('nombre'),
            data.get('descripcion', ''),
            data.get('stock', 0),
            data.get('precio', 0),
            data.get('id_proveedor')
        ])
        connection.commit()
        cursor.close()
        
        return JsonResponse({'success': True, 'id': next_id, 'message': 'Producto creado'})
    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)}, status=400)

@csrf_exempt
def api_productos_update(request, id):
    """PUT: Actualizar un producto"""
    if request.method not in ['PUT', 'POST']:
        return JsonResponse({'success': False, 'error': 'Método no permitido'}, status=405)
    
    try:
        data = json.loads(request.body)
        cursor = connection.cursor()
        
        cursor.execute("""
            UPDATE PRODUCTOS 
            SET NOMBRE = %s, DESCRIPCION = %s, STOCK = %s, PRECIO = %s, ID_PROVEEDOR = %s
            WHERE ID_PRODUCTO = %s
        """, [
            data.get('nombre'),
            data.get('descripcion', ''),
            data.get('stock', 0),
            data.get('precio', 0),
            data.get('id_proveedor'),
            id
        ])
        connection.commit()
        cursor.close()
        
        return JsonResponse({'success': True, 'message': 'Producto actualizado'})
    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)}, status=400)

@csrf_exempt
def api_productos_delete(request, id):
    """DELETE: Eliminar un producto"""
    if request.method not in ['DELETE', 'POST']:
        return JsonResponse({'success': False, 'error': 'Método no permitido'}, status=405)
    
    try:
        cursor = connection.cursor()
        
        # Contar registros relacionados
        cursor.execute("SELECT COUNT(*) FROM MOVIMIENTOS_INVENTARIO WHERE ID_PRODUCTO = %s", [id])
        movimientos = cursor.fetchone()[0]
        
        cursor.execute("SELECT COUNT(*) FROM GARANTIAS WHERE ID_PRODUCTO = %s", [id])
        garantias = cursor.fetchone()[0]
        
        cursor.execute("SELECT COUNT(*) FROM DETALLE_VENTA WHERE ID_PRODUCTO = %s", [id])
        detalles = cursor.fetchone()[0]
        
        # Obtener nombre del producto
        cursor.execute("SELECT NOMBRE FROM PRODUCTOS WHERE ID_PRODUCTO = %s", [id])
        row = cursor.fetchone()
        nombre_producto = row[0] if row else 'Producto'
        
        # Si hay registros relacionados y es solo consulta (check=true), devolver info
        if request.GET.get('check') == 'true':
            cursor.close()
            return JsonResponse({
                'success': True,
                'producto': nombre_producto,
                'registros_relacionados': {
                    'movimientos': movimientos,
                    'garantias': garantias,
                    'detalles_venta': detalles,
                    'total': movimientos + garantias + detalles
                }
            })
        
        # Eliminar registros dependientes
        cursor.execute("DELETE FROM MOVIMIENTOS_INVENTARIO WHERE ID_PRODUCTO = %s", [id])
        cursor.execute("DELETE FROM GARANTIAS WHERE ID_PRODUCTO = %s", [id])
        cursor.execute("DELETE FROM DETALLE_VENTA WHERE ID_PRODUCTO = %s", [id])
        
        # Ahora eliminar el producto
        cursor.execute("DELETE FROM PRODUCTOS WHERE ID_PRODUCTO = %s", [id])
        connection.commit()
        cursor.close()
        
        return JsonResponse({
            'success': True, 
            'message': 'Producto eliminado',
            'eliminados': {
                'movimientos': movimientos,
                'garantias': garantias,
                'detalles_venta': detalles
            }
        })
    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)}, status=400)

# =============================================
# API REST para PROVEEDORES
# =============================================

def api_proveedores_list(request):
    """GET: Obtener todos los proveedores"""
    cursor = connection.cursor()
    cursor.execute("SELECT * FROM PROVEEDORES ORDER BY ID_PROVEEDOR")
    columns = [col[0].lower() for col in cursor.description]
    proveedores = [dict(zip(columns, row)) for row in cursor.fetchall()]
    cursor.close()
    return JsonResponse({'success': True, 'data': proveedores})

@csrf_exempt
def api_proveedores_create(request):
    """POST: Crear un nuevo proveedor"""
    if request.method != 'POST':
        return JsonResponse({'success': False, 'error': 'Método no permitido'}, status=405)
    
    try:
        data = json.loads(request.body)
        cursor = connection.cursor()
        
        cursor.execute("SELECT NVL(MAX(ID_PROVEEDOR), 0) + 1 FROM PROVEEDORES")
        next_id = cursor.fetchone()[0]
        
        cursor.execute("""
            INSERT INTO PROVEEDORES (ID_PROVEEDOR, NOMBRE, CONTACTO, TELEFONO, CORREO)
            VALUES (%s, %s, %s, %s, %s)
        """, [
            next_id,
            data.get('nombre'),
            data.get('contacto', ''),
            data.get('telefono', ''),
            data.get('correo', '')
        ])
        connection.commit()
        cursor.close()
        
        return JsonResponse({'success': True, 'id': next_id, 'message': 'Proveedor creado'})
    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)}, status=400)

# =============================================
# API REST para MOVIMIENTOS DE INVENTARIO
# =============================================

def api_movimientos_list(request):
    """GET: Obtener todos los movimientos"""
    cursor = connection.cursor()
    cursor.execute("""
        SELECT m.ID_MOV, m.ID_PRODUCTO, p.NOMBRE as PRODUCTO_NOMBRE, 
               m.TIPO, m.CANTIDAD, m.FECHA
        FROM MOVIMIENTOS_INVENTARIO m
        LEFT JOIN PRODUCTOS p ON m.ID_PRODUCTO = p.ID_PRODUCTO
        ORDER BY m.FECHA DESC
    """)
    columns = [col[0].lower() for col in cursor.description]
    movimientos = []
    for row in cursor.fetchall():
        mov = dict(zip(columns, row))
        if mov.get('fecha'):
            mov['fecha'] = mov['fecha'].isoformat()
        movimientos.append(mov)
    cursor.close()
    return JsonResponse({'success': True, 'data': movimientos})

@csrf_exempt
def api_movimientos_create(request):
    """POST: Crear un nuevo movimiento"""
    if request.method != 'POST':
        return JsonResponse({'success': False, 'error': 'Método no permitido'}, status=405)
    
    try:
        data = json.loads(request.body)
        cursor = connection.cursor()
        
        cursor.execute("SELECT NVL(MAX(ID_MOV), 0) + 1 FROM MOVIMIENTOS_INVENTARIO")
        next_id = cursor.fetchone()[0]
        
        cursor.execute("""
            INSERT INTO MOVIMIENTOS_INVENTARIO (ID_MOV, ID_PRODUCTO, TIPO, CANTIDAD, FECHA)
            VALUES (%s, %s, %s, %s, SYSDATE)
        """, [
            next_id,
            data.get('id_producto'),
            data.get('tipo'),
            data.get('cantidad', 0)
        ])
        
        # Actualizar stock del producto
        tipo = data.get('tipo', '').upper()
        cantidad = int(data.get('cantidad', 0))
        id_producto = data.get('id_producto')
        
        if tipo == 'ENTRADA':
            cursor.execute("UPDATE PRODUCTOS SET STOCK = STOCK + %s WHERE ID_PRODUCTO = %s", [cantidad, id_producto])
        elif tipo == 'SALIDA':
            cursor.execute("UPDATE PRODUCTOS SET STOCK = STOCK - %s WHERE ID_PRODUCTO = %s", [cantidad, id_producto])
        
        connection.commit()
        cursor.close()
        
        return JsonResponse({'success': True, 'id': next_id, 'message': 'Movimiento registrado'})
    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)}, status=400)

