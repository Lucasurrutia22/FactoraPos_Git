"""
Script para visualizar datos de la base de datos Oracle
Ejecutar: python ver_datos.py
"""
import os
import sys

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'FactoraPos.settings')

import django
django.setup()

from django.db import connection

def mostrar_datos():
    cursor = connection.cursor()
    
    print("\n" + "=" * 70)
    print("          DATOS DE LA BASE DE DATOS FACTORA_POS")
    print("=" * 70)
    
    # Listar tablas
    cursor.execute("SELECT table_name FROM user_tables ORDER BY table_name")
    tablas = cursor.fetchall()
    print("\n[TABLAS EN EL ESQUEMA]")
    for t in tablas:
        cursor.execute(f"SELECT COUNT(*) FROM {t[0]}")
        count = cursor.fetchone()[0]
        print(f"  - {t[0]}: {count} registros")
    
    # Mostrar estructura y datos de cada tabla principal
    tablas_principales = ['PRODUCTOS', 'CLIENTES', 'PROVEEDORES', 'USUARIOS', 'VENTAS']
    
    for tabla in tablas_principales:
        print("\n" + "-" * 70)
        print(f"[{tabla}]")
        print("-" * 70)
        
        # Obtener columnas
        cursor.execute(f"SELECT * FROM {tabla} WHERE ROWNUM <= 5")
        columnas = [col[0] for col in cursor.description]
        print(f"Columnas: {', '.join(columnas)}")
        
        # Obtener datos
        rows = cursor.fetchall()
        if rows:
            print(f"\nPrimeros {len(rows)} registros:")
            for i, row in enumerate(rows, 1):
                print(f"  {i}. {row}")
        else:
            print("\n  (Tabla vacia - sin datos)")
    
    cursor.close()
    print("\n" + "=" * 70)
    print("Consulta completada exitosamente")
    print("=" * 70 + "\n")

if __name__ == "__main__":
    mostrar_datos()
