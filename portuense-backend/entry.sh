#!/bin/sh

echo "⏳ Esperando a la base de datos..."

while ! nc -z db 5432; do
  sleep 1
done

echo "✅ Base de datos disponible, corriendo migraciones..."
python manage.py migrate

# Crear superusuario admin si no existe (puedes cambiar datos)
echo "from django.contrib.auth import get_user_model; \
User = get_user_model(); \
User.objects.filter(username='admin').exists() or \
User.objects.create_superuser('admin', 'admin@example.com', 'adminpass')" | python manage.py shell

echo "🚀 Iniciando servidor Django..."
python manage.py runserver 0.0.0.0:8000
