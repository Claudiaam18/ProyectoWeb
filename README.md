# 💳 Cartera Digital

Aplicación web fullstack para gestión de finanzas personales. Permite registrar ingresos, organizar el dinero en categorías y llevar un historial de movimientos.

## Tecnologías

| Capa | Stack |
|---|---|
| Frontend | React 19, React Router 7, Chart.js, Vite |
| Backend | Node.js, Express 5, JWT, bcryptjs |
| Base de datos | SQL Server 2022 (Docker) |

## Estructura del proyecto

```
ProyectoWeb/
├── frontend/   # React + Vite
└── backend/    # Express API REST
    └── database/   # Scripts SQL (estructura + datos de prueba)
```

## Requisitos previos

- Node.js 18+
- Docker Desktop

## Instalación y puesta en marcha

### 1. Base de datos

```bash
cd backend
cp .env.example .env   # Edita las variables según tu entorno
docker compose up -d   # Levanta SQL Server y ejecuta los scripts SQL
docker compose ps      # Espera a que el estado sea "healthy"
```

### 2. Backend

```bash
cd backend
npm install
npm run dev            # Servidor en http://localhost:3000
```

### 3. Frontend

```bash
cd frontend
npm install
npm run dev            # App en http://localhost:5173
```

## Variables de entorno (backend)

Copia `backend/.env.example` a `backend/.env` y ajusta los valores:

```env
PORT=3000
FRONTEND_URL=http://localhost:5173

DB_SERVER=localhost
DB_PORT=1433
DB_NAME=CarteraDigital
DB_ADMIN_PASSWORD=<contraseña_sa_del_contenedor>
DB_USER=usuario_app
DB_PASSWORD=<contraseña_usuario_app>
DB_TRUST_CERT=true
JWT_SECRET=<clave_secreta_larga_y_aleatoria>
```

> La contraseña de SQL Server debe tener mínimo 8 caracteres con mayúsculas, minúsculas, números y símbolos. Evita `$` y comillas.

Puedes generar un `JWT_SECRET` seguro con Node.js:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

## Scripts disponibles

### Backend

| Comando | Descripción |
|---|---|
| `npm run dev` | Servidor con hot-reload |
| `npm start` | Servidor en producción |
| `npm run db:crear-usuario` | Crea el usuario de aplicación en la BD |

### Frontend

| Comando | Descripción |
|---|---|
| `npm run dev` | App en modo desarrollo |
| `npm run build` | Build de producción |
| `npm run preview` | Vista previa del build |

## Módulos de la API

Todos los endpoints están bajo `/api/`:

| Ruta | Módulo |
|---|---|
| `/api/auth` | Registro e inicio de sesión (JWT) |
| `/api/balance` | Saldo principal del usuario |
| `/api/categories` | Gestión de categorías |
| `/api/expenses` | Gastos por categoría |
| `/api/overview` | Dashboard / resumen |
| `/api/profile` | Perfil y preferencias |
| `/api/health` | Estado del servidor y la BD |

## Cómo funciona la app

1. **Registro e inicio de sesión** — el usuario crea una cuenta o inicia sesión. El backend devuelve un JWT que el frontend guarda en `localStorage` y adjunta en cada petición.

2. **Saldo** — el usuario registra ingresos que suman al saldo principal. Desde esta vista también puede ver el total asignado a categorías y el total gastado.

3. **Categorías** — funcionan como "sobres" de dinero. El usuario crea categorías y les asigna dinero desde su saldo principal. Cada asignación descuenta del saldo principal y suma al disponible de la categoría. También se puede ajustar el presupuesto o desactivar una categoría.

4. **Movimientos** — el usuario registra gastos asociados a una categoría. Cada gasto descuenta del saldo disponible de esa categoría. La vista también muestra el historial completo de transacciones.

5. **Dashboard** — resumen visual con tarjetas de saldo, ingresos y gastos del mes, gráfica de torta de gastos por categoría, gráfica de barras de flujo mensual (ingresos vs gastos) y los últimos movimientos.

6. **Perfil** — el usuario puede actualizar sus datos personales y preferencias (moneda: GTQ/USD, tema: claro/oscuro).

## Modelo de datos

- **Usuario** — cuenta con saldo principal y preferencias (moneda: GTQ/USD, tema: claro/oscuro).
- **Categoria** — "sobres" de dinero asignados por el usuario.
- **Transaccion** — tres tipos:
  - `ingresoSaldo`: suma al saldo principal.
  - `asignacion`: mueve dinero del saldo principal a una categoría.
  - `gasto`: descuenta de una categoría.
