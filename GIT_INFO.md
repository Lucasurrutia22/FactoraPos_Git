# 📊 Git Repository Info

## Repositorio Local Creado: FactoraPos_Git

**Ubicación:** `c:\Users\lucas\Desktop\FactoraPos_Git`

### Información del Repositorio

```
Rama principal: master
Commits: 1
Hash del commit inicial: ec022ab
Mensaje: Initial commit: FACTORA POS Sistema completo con usuarios, CRUD y header dinámico
Autor: Lucas Developer <lucas@factorapos.com>
Fecha: 16 de Noviembre de 2025
```

### Archivos Rastreados (155 archivos)

✅ **Configuración Django**
- FactoraPos/settings.py
- FactoraPos/urls.py
- FactoraPos/wsgi.py
- manage.py

✅ **Módulos de Aplicación**
- core/ (Dashboard, Login)
- usuarios/ (CRUD de usuarios)
- ventas/ (Punto de Venta, Clientes, Compras)
- inventario/ (Gestión de inventario)
- reportes/ (Reportes)
- config/ (Configuración)
- proveedores/ (Proveedores)
- movimientos/ (Movimientos)
- rma/ (RMA/Garantías)

✅ **Archivos Estáticos**
- static/css/ (13 archivos CSS)
- static/js/ (17 archivos JavaScript)
- static/img/ (carpeta de imágenes)

✅ **Base de Datos**
- db.sqlite3 (Base de datos SQLite)

✅ **Documentación**
- README.md (Documentación completa)
- requirements.txt (Dependencias Python)
- .gitignore (Archivos a ignorar)

### Próximos Pasos

#### Opción 1: Subir a GitHub

1. Crear un repositorio nuevo en GitHub (https://github.com/new)
2. No inicializar con README, .gitignore ni LICENSE

3. Ejecutar en la carpeta FactoraPos_Git:
```bash
git remote add origin https://github.com/tu-usuario/FactoraPos.git
git branch -M main
git push -u origin main
```

#### Opción 2: Subir a GitLab

1. Crear un repositorio nuevo en GitLab
2. Ejecutar:
```bash
git remote add origin https://gitlab.com/tu-usuario/FactoraPos.git
git branch -M main
git push -u origin main
```

#### Opción 3: Subir a un Servidor Git Privado

```bash
git remote add origin usuario@servidor:/ruta/al/repositorio.git
git push -u origin master
```

### Comandos Git Útiles

**Ver historial de cambios:**
```bash
git log --oneline
git log --graph --all --decorate
```

**Crear nueva rama:**
```bash
git checkout -b nombre-rama
git push -u origin nombre-rama
```

**Hacer commit de cambios:**
```bash
git add .
git commit -m "Descripción del cambio"
git push
```

**Ver estado actual:**
```bash
git status
git diff
```

### Configuración Actual

- **Usuario:** Lucas Developer
- **Email:** lucas@factorapos.com
- **Rama por defecto:** master

### Archivos Ignorados

El archivo `.gitignore` está configurado para ignorar:
- `__pycache__/` (Archivos compilados Python)
- `*.pyc`, `*.pyo` (Archivos compilados)
- `.env` (Variables de entorno)
- `.vscode/`, `.idea/` (Configuración IDE)
- `venv/`, `ENV/` (Entornos virtuales)
- `*.log` (Archivos de log)
- Y más...

### 📈 Estadísticas del Commit Inicial

- **Archivos creados:** 155
- **Líneas insertadas:** 15,581
- **Líneas eliminadas:** 0

---

**Fecha de creación:** 16 de Noviembre de 2025
**Versión:** 1.0.0
