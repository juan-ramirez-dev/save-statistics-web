# Backend de Save Statistics

API REST desarrollada con NestJS para el rastreo y análisis de estadísticas de clicks. Este backend proporciona endpoints seguros para recopilar, almacenar y analizar datos de interacción de usuarios en tiempo real.

## Características Principales

- **Recopilación de Datos**: Endpoints optimizados para rastrear clicks
- **Estadísticas en Tiempo Real**: Procesamiento y análisis inmediato
- **Autenticación Segura**: Sistema basado en JWT para proteger la API
- **Análisis de Datos**: Métricas avanzadas para clicks normales y únicos
- **Escalabilidad**: Arquitectura diseñada para manejar grandes volúmenes de datos
- **Documentación API**: Interfaz Swagger completa
- **Protección contra Abusos**: Limitación de tasa para prevenir ataques
- **Validación de Datos**: Esquemas estrictos para garantizar la integridad

## Estructura del Proyecto

```
src/
├── modules/                     # Módulos funcionales
│   ├── auth/                    # Autenticación y autorización
│   ├── user/                    # Gestión de usuarios
│   ├── click-statistic/         # Estadísticas de clicks normales
│   └── unique-click-statistic/  # Estadísticas de clicks únicos
├── config/                      # Configuraciones de la aplicación
├── app.module.ts                # Módulo principal
└── main.ts                      # Punto de entrada
```

## Módulos Principales

### Click-Statistic
Gestiona el registro y análisis de todos los clicks recibidos:
- Registro de clicks por token de usuario
- Filtrado por fecha, URL, elemento
- Agrupación y agregación de datos
- Exportación de informes

### Unique-Click-Statistic
Maneja clicks únicos utilizando algoritmos avanzados:
- Detección de sesiones únicas
- Prevención de conteo duplicado
- Métrica de usuarios únicos
- Comparación con clicks totales

### Auth
Sistema completo de autenticación:
- Registro e inicio de sesión
- Generación de tokens personales
- Validación de solicitudes
- Protección de rutas

### User
Gestión de usuarios y perfiles:
- CRUD completo de usuarios
- Gestión de tokens personales
- Preferencias de usuario
- Límites y permisos

## Tecnologías Utilizadas

- **NestJS**: Framework backend basado en Node.js
- **TypeScript**: Tipado estático para código robusto
- **MongoDB**: Base de datos NoSQL para almacenamiento de datos
- **Mongoose**: ODM para MongoDB
- **JWT**: JSON Web Tokens para autenticación
- **Class-Validator**: Validación de datos
- **Swagger**: Documentación de API
- **Throttler**: Protección contra ataques de fuerza bruta

## Inicio Rápido

### Requisitos Previos
- Node.js (v18 o superior)
- MongoDB
- npm o yarn

### Instalación

1. Instala las dependencias:
```bash
npm install
```

2. Configura las variables de entorno:
```bash
cp .env.example .env
# Edita el archivo .env con tus configuraciones
```

3. Inicia el servidor de desarrollo:
```bash
npm run start:dev
```

La API estará disponible en [http://localhost:3001](http://localhost:3001).
La documentación Swagger estará en [http://localhost:3001/api/docs](http://localhost:3001/api/docs).

## Documentación de API

Endpoints principales:

### Autenticación
- `POST /api/auth/register` - Registro de usuario
- `POST /api/auth/login` - Inicio de sesión
- `GET /api/auth/profile` - Perfil del usuario autenticado

### Estadísticas
- `POST /api/click-statistics` - Registrar un click
- `POST /api/unique-click-statistics` - Registrar un click único
- `GET /api/click-statistics` - Obtener estadísticas con filtros
- `GET /api/click-statistics/summary` - Resumen de estadísticas

### Usuarios
- `GET /api/users/me/token` - Obtener token personal
- `PUT /api/users/me/token` - Regenerar token personal

## Variables de Entorno

```
# .env
PORT=3001
MONGODB_URI=mongodb://localhost:27017/save-statistics
JWT_SECRET=tu_secreto_jwt
JWT_EXPIRATION=24h
RATE_LIMIT_TTL=60
RATE_LIMIT_MAX=100
```

## Despliegue

Para desplegar en producción:

1. Construye la aplicación:
```bash
npm run build
```

2. Inicia en modo producción:
```bash
npm run start:prod
```

Recomendamos usar PM2 para gestionar el proceso:
```bash
npm install -g pm2
pm2 start dist/main.js --name save-statistics-api
```

## Desarrollo

### Crear Nuevo Módulo
```bash
nest generate module nuevo-modulo
nest generate controller nuevo-modulo
nest generate service nuevo-modulo
```

### Pruebas
```bash
# Pruebas unitarias
npm run test

# Pruebas e2e
npm run test:e2e

# Cobertura
npm run test:cov
```

## Licencia

Este proyecto está licenciado bajo la [Licencia MIT](LICENSE).
