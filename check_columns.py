import oracledb

conn = oracledb.connect('FACTORA_POS/factorapass@localhost:1521/XEPDB1')
cur = conn.cursor()
cur.execute("SELECT column_name FROM user_tab_columns WHERE table_name='CLIENTES'")
print("Columnas de CLIENTES:")
for r in cur.fetchall():
    print(f"  - {r[0]}")
conn.close()
