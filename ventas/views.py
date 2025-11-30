from django.shortcuts import render
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.db import connection
import json

def punto_venta_view(request):
    return render(request, 'ventas/PuntoDeVenta.html')

def compras_view(request):
    return render(request, 'ventas/Compras.html')

def clientes_view(request):
    return render(request, 'ventas/Clientes.html')

# =============================================
# API REST para CLIENTES
# =============================================

def api_clientes_list(request):
    """GET: Obtener todos los clientes"""
    cursor = connection.cursor()
    cursor.execute("SELECT * FROM CLIENTES ORDER BY ID_CLIENTE")
    columns = [col[0].lower() for col in cursor.description]
    clientes = [dict(zip(columns, row)) for row in cursor.fetchall()]
    cursor.close()
    return JsonResponse({'success': True, 'data': clientes})

@csrf_exempt
def api_clientes_create(request):
    """POST: Crear un nuevo cliente"""
    if request.method != 'POST':
        return JsonResponse({'success': False, 'error': 'Método no permitido'}, status=405)
    
    try:
        data = json.loads(request.body)
        cursor = connection.cursor()
        
        # Obtener columnas disponibles
        cursor.execute("SELECT * FROM CLIENTES WHERE ROWNUM = 0")
        available_cols = [col[0].upper() for col in cursor.description]
        
        cursor.execute("SELECT NVL(MAX(ID_CLIENTE), 0) + 1 FROM CLIENTES")
        next_id = cursor.fetchone()[0]
        
        # Construir INSERT dinámicamente según las columnas disponibles
        columns = ['ID_CLIENTE']
        values = [next_id]
        
        col_mapping = {
            'NOMBRE': data.get('nombre', ''),
            'RUT': data.get('rut', ''),
            'EMAIL': data.get('correo', data.get('email', '')),
            'CORREO': data.get('correo', data.get('email', '')),
            'TELEFONO': data.get('telefono', ''),
            'DIRECCION': data.get('direccion', ''),
        }
        
        for col, val in col_mapping.items():
            if col in available_cols:
                columns.append(col)
                values.append(val)
        
        placeholders = ', '.join(['%s'] * len(values))
        sql = f"INSERT INTO CLIENTES ({', '.join(columns)}) VALUES ({placeholders})"
        
        cursor.execute(sql, values)
        connection.commit()
        cursor.close()
        
        return JsonResponse({'success': True, 'id': next_id, 'message': 'Cliente creado'})
    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)}, status=400)

@csrf_exempt
def api_clientes_update(request, id):
    """PUT: Actualizar un cliente"""
    if request.method not in ['PUT', 'POST']:
        return JsonResponse({'success': False, 'error': 'Método no permitido'}, status=405)
    
    try:
        data = json.loads(request.body)
        cursor = connection.cursor()
        
        # Obtener columnas disponibles
        cursor.execute("SELECT * FROM CLIENTES WHERE ROWNUM = 0")
        available_cols = [col[0].upper() for col in cursor.description]
        
        # Construir UPDATE dinámicamente
        updates = []
        values = []
        
        col_mapping = {
            'NOMBRE': data.get('nombre'),
            'RUT': data.get('rut'),
            'EMAIL': data.get('correo', data.get('email')),
            'CORREO': data.get('correo', data.get('email')),
            'TELEFONO': data.get('telefono'),
            'DIRECCION': data.get('direccion'),
        }
        
        for col, val in col_mapping.items():
            if col in available_cols and val is not None:
                updates.append(f"{col} = %s")
                values.append(val)
        
        if updates:
            values.append(id)
            sql = f"UPDATE CLIENTES SET {', '.join(updates)} WHERE ID_CLIENTE = %s"
            cursor.execute(sql, values)
            connection.commit()
        
        cursor.close()
        
        return JsonResponse({'success': True, 'message': 'Cliente actualizado'})
    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)}, status=400)

@csrf_exempt
def api_clientes_delete(request, id):
    """DELETE: Eliminar un cliente"""
    if request.method not in ['DELETE', 'POST']:
        return JsonResponse({'success': False, 'error': 'Método no permitido'}, status=405)
    
    try:
        cursor = connection.cursor()
        cursor.execute("DELETE FROM CLIENTES WHERE ID_CLIENTE = %s", [id])
        connection.commit()
        cursor.close()
        
        return JsonResponse({'success': True, 'message': 'Cliente eliminado'})
    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)}, status=400)

# =============================================
# API REST para VENTAS
# =============================================

def api_ventas_list(request):
    """GET: Obtener todas las ventas"""
    cursor = connection.cursor()
    cursor.execute("""
        SELECT v.ID_VENTA, v.FECHA, v.ID_USUARIO, u.NOMBRE as VENDEDOR, v.TOTAL
        FROM VENTAS v
        LEFT JOIN USUARIOS u ON v.ID_USUARIO = u.ID_USUARIO
        ORDER BY v.FECHA DESC
    """)
    columns = [col[0].lower() for col in cursor.description]
    ventas = []
    for row in cursor.fetchall():
        venta = dict(zip(columns, row))
        if venta.get('fecha'):
            venta['fecha'] = venta['fecha'].isoformat()
        ventas.append(venta)
    cursor.close()
    return JsonResponse({'success': True, 'data': ventas})

@csrf_exempt
def api_ventas_create(request):
    """POST: Crear una nueva venta"""
    if request.method != 'POST':
        return JsonResponse({'success': False, 'error': 'Método no permitido'}, status=405)
    
    try:
        data = json.loads(request.body)
        cursor = connection.cursor()
        
        cursor.execute("SELECT NVL(MAX(ID_VENTA), 0) + 1 FROM VENTAS")
        next_id = cursor.fetchone()[0]
        
        cursor.execute("""
            INSERT INTO VENTAS (ID_VENTA, FECHA, ID_USUARIO, TOTAL)
            VALUES (%s, SYSDATE, %s, %s)
        """, [
            next_id,
            data.get('id_usuario', 1),
            data.get('total', 0)
        ])
        connection.commit()
        cursor.close()
        
        return JsonResponse({'success': True, 'id': next_id, 'message': 'Venta registrada'})
    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)}, status=400)

# =============================================
# API REST para USUARIOS (Login)
# =============================================

def api_usuarios_list(request):
    """GET: Obtener todos los usuarios"""
    cursor = connection.cursor()
    cursor.execute("SELECT ID_USUARIO, NOMBRE, CORREO, ROL, FECHA_CREACION FROM USUARIOS ORDER BY ID_USUARIO")
    columns = [col[0].lower() for col in cursor.description]
    usuarios = []
    for row in cursor.fetchall():
        usuario = dict(zip(columns, row))
        if usuario.get('fecha_creacion'):
            usuario['fecha_creacion'] = usuario['fecha_creacion'].isoformat()
        usuarios.append(usuario)
    cursor.close()
    return JsonResponse({'success': True, 'data': usuarios})

@csrf_exempt
def api_login(request):
    """POST: Verificar credenciales de usuario"""
    if request.method != 'POST':
        return JsonResponse({'success': False, 'error': 'Método no permitido'}, status=405)
    
    try:
        data = json.loads(request.body)
        username = data.get('username', '').strip()
        password = data.get('password', '')
        
        cursor = connection.cursor()
        cursor.execute("""
            SELECT ID_USUARIO, NOMBRE, CORREO, ROL 
            FROM USUARIOS 
            WHERE (LOWER(NOMBRE) = LOWER(%s) OR LOWER(CORREO) = LOWER(%s))
            AND PASSWORD = %s
        """, [username, username, password])
        
        row = cursor.fetchone()
        cursor.close()
        
        if row:
            return JsonResponse({
                'success': True,
                'user': {
                    'id': row[0],
                    'nombre': row[1],
                    'correo': row[2],
                    'rol': row[3]
                }
            })
        else:
            return JsonResponse({'success': False, 'error': 'Credenciales incorrectas'}, status=401)
    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)}, status=400)

