FROM python:3.11-slim

# Set work directory
WORKDIR /app

# Instalar netcat (la versión correcta en Debian slim)
RUN apt-get update && apt-get install -y netcat-openbsd && apt-get clean

# Instalar dependencias Python
COPY requirements.txt .
RUN pip install --upgrade pip && pip install -r requirements.txt

# Copiar la app
COPY . .

# Exponer puerto
EXPOSE 8000
