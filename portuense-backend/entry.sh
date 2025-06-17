#!/bin/sh

echo "⏳ Esperando a la base de datos..."

while ! nc -z db 5432; do
  sleep 1
done

echo "✅ Base de datos disponible, generando migraciones si hacen falta..."
python manage.py makemigrations --noinput

echo "⚙️ Aplicando migraciones..."
python manage.py migrate

echo "⚙️ Creando superusuario y grupo si no existen..."

python manage.py shell <<EOF
from django.contrib.auth import get_user_model
from django.contrib.auth.models import Group

User = get_user_model()

# Crear superusuario si no existe
admin_user, created = User.objects.get_or_create(
    username='admin',
    defaults={'email': 'admin@example.com'}
)
if created:
    admin_user.set_password('adminpass')
    admin_user.is_superuser = True
    admin_user.is_staff = True
    admin_user.save()
    print("✅ Superusuario 'admin' creado.")
else:
    print("ℹ️ Superusuario 'admin' ya existe.")

# Crear grupo 'admin' si no existe
admin_group, group_created = Group.objects.get_or_create(name='admin')
if group_created:
    print("✅ Grupo 'admin' creado.")
else:
    print("ℹ️ Grupo 'admin' ya existe.")
user_group, user_group_created = Group.objects.get_or_create(name='usuario')
if user_group_created:
    print("Grupo 'usuario' creado)
else:
    print("Grupo 'usuario' ya existe)

# Asignar grupo 'admin' al usuario 'admin'
if not admin_user.groups.filter(name='admin').exists():
    admin_user.groups.add(admin_group)
    print("✅ Grupo 'admin' asignado al usuario 'admin'.")
else:
    print("ℹ️ Usuario 'admin' ya pertenece al grupo 'admin'.")
EOF

echo "🚀 Iniciando servidor Django..."
python manage.py runserver 0.0.0.0:8000
