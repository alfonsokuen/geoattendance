# GeoAttendance PWA - Sistema Empresarial de Asistencia

Un sistema completo de control de asistencia laboral mediante Progressive Web App (PWA) con validación por Geocercas (GPS) y Evidencias Fotográficas (Selfies).

## 🚀 Requisitos Previos
1. **Node.js** v18+ y `npm`.
2. **Docker** y **Docker Compose** (Para levantar PostgreSQL y MinIO de almacenamiento).

## 🛠️ Instalación y Ejecución Local

### Paso 1: Levantar Servicios Base (Base de datos y Almacenamiento)
Abre una terminal en la raíz del proyecto y ejecuta:
```bash
docker compose up -d
```
Esto levantará PostgreSQL en el puerto `5432` y MinIO (compatible con S3) en el puerto `9000` y `9001` (para consola).

### Paso 2: Configurar y Correr el Backend (NestJS)
Abre otra terminal en el directorio `/backend`:
```bash
cd backend
npm install
# Aplicar migraciones y estructura a la BD
npx prisma db push
# Inyectar datos de prueba (SuperAdmin, geocerca HQ, empleado base)
npm run prisma seed
# Levantar el servidor backend
npm run start:dev
```
El servidor backend correrá en `http://localhost:3001`

### Paso 3: Configurar y Correr el Frontend (Next.js PWA)
Abre una tercera terminal en `/frontend`:
```bash
cd frontend
npm install
npm run dev
```
La PWA correrá en `http://localhost:3000`

---

## 👥 Credenciales de Prueba (Seed Data)

**1. Empleado (Para probar la PWA y marcación por GPS/Cámara):**
- **Usuario:** `empleado@geoattendance.com`
- **Contraseña:** `password123`
- *Nota: Asegúrate de dar permisos de Ubicación y Cámara en el navegador.*

**2. Administrador (Para el Dashboard de RRHH):**
- **Usuario:** `admin@geoattendance.com`
- **Contraseña:** `password123`

## 📁 Arquitectura Técnica
- **Frontend**: Next.js (App Router), React, Tailwind CSS, Lucide Icons, `next-pwa`.
- **Backend**: NestJS, Prisma ORM, JWT, `bcrypt`, `@aws-sdk/client-s3`.
- **Database**: PostgreSQL
- **Storage**: MinIO (Compatible con Amazon S3)

## 📱 Funcionalidades MVP Implementadas
- [x] PWA instalable con Next.js Cache Support y Service Workers
- [x] Login con JWT
- [x] Captura de latitud y longitud via Geolocation API
- [x] Validación de distancia con algoritmo Haversine en el backend (Geocercas)
- [x] Captura de Selfie validada (MediaDevices API) evitando galería
- [x] Subida directa de evidencia fotográfica al servidor S3 local (MinIO)
- [x] Panel Administrativo con lista de marcaciones y estados (Dentro/Fuera de zona)
- [x] Seeds automáticos para demostración inmediata
