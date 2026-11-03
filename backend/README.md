# Cartera Digital — Backend y base de datos

API en Node.js + Express con SQL Server 2022 (en Docker) para la app de finanzas personales **Cartera Digital**, basada en presupuesto por sobres: el usuario registra su saldo principal, lo reparte en categorías y registra sus gastos.

## Contenido

1. [Requisitos](#1-requisitos)
2. [Estructura del proyecto](#2-estructura-del-proyecto)
3. [Inicio rápido (desde cero)](#3-inicio-rápido-desde-cero)
4. [Variables de entorno](#4-variables-de-entorno)
5. [Base de datos](#5-base-de-datos)
6. [Usuario de la aplicación y permisos](#6-usuario-de-la-aplicación-y-permisos)
7. [Datos de prueba](#7-datos-de-prueba)
8. [Backend y rutas](#8-backend-y-rutas)
9. [Comandos útiles de Docker](#9-comandos-útiles-de-docker)
10. [Problemas comunes](#10-problemas-comunes)
11. [Flujo de trabajo del equipo](#11-flujo-de-trabajo-del-equipo)

---

## 1. Requisitos

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (incluye Docker Compose)
- [Node.js](https://nodejs.org/) 20 LTS o superior
- Git

Opcional: un cliente SQL (Azure Data Studio o la extensión *SQL Server (mssql)* de VS Code) para revisar la base de datos.

## 2. Estructura del proyecto

```
backend/
├── docker-compose.yml          # SQL Server en Docker
├── .env.example                # Plantilla de variables (se sube al repo)
├── .env                        # Tus credenciales locales (NO se sube)
├── package.json
├── database/
│   ├── 01_estructura.sql       # Crea la BD, tablas, relaciones y restricciones
│   └── 02_datos_prueba.sql     # Datos ficticios para pruebas
├── scripts/
│   └── crear-usuario-app.js    # Crea el usuario SQL de la aplicación
└── src/
    ├── server.js               # Servidor Express
    ├── config/
    │   └── db.js               # Conexión a SQL Server (paquete mssql)
    ├── middleware/
    └── modules/                # Un módulo por carpeta (auth, balance, ...)
```

## 3. Inicio rápido (desde cero)

Todos los comandos se ejecutan desde la carpeta `backend/`.

**1. Instalar dependencias**

```bash
npm install
```

**2. Crear tu archivo `.env`**

```bash
cp .env.example .env        # En PowerShell: Copy-Item .env.example .env
```

Abre el `.env` y completa **como mínimo**:

- `DB_ADMIN_PASSWORD`: la contraseña que tendrá `sa` en tu contenedor (mínimo 8 caracteres con mayúsculas, minúsculas, números y símbolos; evita `$` y comillas).
- `DB_PASSWORD`: la contraseña que quieras para el usuario de la aplicación.

**3. Levantar SQL Server**

```bash
docker compose up -d
docker compose ps
```

Espera a que el estado diga `healthy` (entre 20 y 40 segundos).

**4. Ejecutar los scripts SQL** (reemplaza `TU_DB_ADMIN_PASSWORD` por el valor de tu `.env`)

```bash
docker cp database/01_estructura.sql cartera_sqlserver:/tmp/
docker cp database/02_datos_prueba.sql cartera_sqlserver:/tmp/

docker exec cartera_sqlserver /opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P "TU_DB_ADMIN_PASSWORD" -C -i /tmp/01_estructura.sql
docker exec cartera_sqlserver /opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P "TU_DB_ADMIN_PASSWORD" -C -i /tmp/02_datos_prueba.sql
```

El orden importa: primero `01`, luego `02`.

**5. Crear el usuario de la aplicación**

```bash
npm run db:crear-usuario
```

Debe mostrar `Usuario "..." creado/actualizado` y `Verificado: conectado como ...`.

**6. Probar la conexión**

```bash
node src/config/db.js
```

Debe mostrar `[DB] Conexion exitosa. Base de datos: CarteraDigital`.

**7. Levantar el backend**

```bash
npm run dev
```

**8. Verificar**

Abre `http://localhost:3000/api/health` (o el puerto que hayas definido en `PORT`). Debe responder:

```json
{ "mensaje": "Backend de Cartera Digital funcionando", "baseDatos": "conectada" }
```

> **¿Ya tienes un SQL Server instalado o en otro contenedor?** No necesitas el compose. Ejecuta los scripts `01` y `02` en tu servidor con cualquier cliente, y configura en el `.env` los valores de `DB_SERVER`, `DB_PORT` y `DB_ADMIN_*` que correspondan al tuyo.

## 4. Variables de entorno

Se definen en `backend/.env` (copia de `.env.example`). El archivo `.env` **nunca** se sube a Git.

| Variable | Descripción | Valor por defecto |
|---|---|---|
| `PORT` | Puerto del backend. Cámbialo si el 3000 está ocupado (por ejemplo, `3001`) | `3000` |
| `FRONTEND_URL` | Origen permitido por CORS (el frontend) | `http://localhost:5173` |
| `DB_SERVER` | Host de SQL Server | `localhost` |
| `DB_PORT` | Puerto de SQL Server. Lo usan el backend **y** Docker Compose. Cámbialo (por ejemplo, `1434`) si el 1433 está ocupado | `1433` |
| `DB_NAME` | Nombre de la base de datos | `CarteraDigital` |
| `DB_USER` | Usuario SQL de la aplicación | `app_cartera` |
| `DB_PASSWORD` | Contraseña del usuario de la aplicación (la eliges tú) | — |
| `DB_ADMIN_USER` | Administrador, solo para `npm run db:crear-usuario` | `sa` |
| `DB_ADMIN_PASSWORD` | Contraseña de `sa` del contenedor | — |
| `DB_TRUST_CERT` | `true` en local (el contenedor usa un certificado autofirmado) | `true` |
| `DB_ENCRYPT` | Cifrado de la conexión | `true` |

Notas importantes:

- Si cambias `PORT`, el frontend debe apuntar al mismo puerto.
- `DB_ADMIN_PASSWORD` solo se aplica **la primera vez** que se crea el volumen de Docker. Si la cambias después en el `.env`, el contenedor ya creado conserva la anterior. Para empezar de cero: `docker compose down -v` y vuelve al paso 3.

## 5. Base de datos

Base: `CarteraDigital` (SQL Server 2022). Los scripts son **idempotentes**: se pueden ejecutar varias veces sin duplicar ni borrar datos. Ninguno contiene `DROP`.

### Tablas

**Usuario**

| Columna | Tipo | Notas |
|---|---|---|
| `IDUsuario` | int, PK, identity | |
| `Nombre`, `Apellido` | varchar(50) | |
| `Correo` | varchar(100) | Único |
| `FotoPerfil` | varchar(500), null | URL de la imagen |
| `Contrasena` | varchar(255) | **Siempre el hash bcrypt**, nunca texto plano. Sin ñ en el nombre |
| `FechaRegistro` | datetime | Por defecto `GETDATE()` |
| `SaldoPrincipal` | decimal(12,2) | No puede ser negativo |
| `UltimaEdicion` | datetime | `GETDATE()` al crear; el backend debe actualizarla al editar |

**Categoria** (los "sobres")

| Columna | Tipo | Notas |
|---|---|---|
| `IDCategoria` | int, PK, identity | |
| `IDUsuario` | int, FK → Usuario | |
| `Nombre` | varchar(50) | Único entre las categorías **activas** de un mismo usuario |
| `FechaCreacion` | date | |
| `SaldoDisponible` | decimal(12,2) | No puede ser negativo |
| `Activo` | bit | `1` activa, `0` eliminada (eliminación lógica) |

**Transaccion**

| Columna | Tipo | Notas |
|---|---|---|
| `IDTransaccion` | int, PK, identity | |
| `IDUsuario` | int, FK → Usuario | |
| `IDCategoria` | int, FK → Categoria, **null** | Null solo en `ingreso_saldo` |
| `Tipo` | varchar(20) | `'ingreso_saldo'`, `'asignacion'` o `'gasto'` (en minúsculas, validado con `CHECK`) |
| `Monto` | decimal(12,2) | Siempre mayor que 0 |
| `Descripcion` | varchar(200), null | |
| `Fecha` | datetime | Por defecto `GETDATE()` |

### Reglas de negocio

Cada tipo de transacción mueve el dinero así:

| Tipo | Categoría | Efecto |
|---|---|---|
| `ingreso_saldo` | No lleva (`NULL`) | Suma al `SaldoPrincipal` |
| `asignacion` | Obligatoria | Resta del `SaldoPrincipal` y suma al `SaldoDisponible` de la categoría |
| `gasto` | Obligatoria | Resta del `SaldoDisponible` de la categoría |

- Toda modificación de saldo **debe registrarse como una transacción**, para que el historial siempre explique el saldo actual.
- Una operación que mueve dinero (por ejemplo, una asignación) debe actualizar el saldo y registrar la transacción **en una sola transacción SQL**, para evitar inconsistencias.
- **Eliminar una categoría** = `UPDATE Categoria SET Activo = 0`. Nunca `DELETE`. Solo se permite si `SaldoDisponible = 0`; si tiene dinero, primero hay que devolverlo al saldo principal o moverlo a otra categoría.
- Las listas para registrar gastos y asignaciones filtran `WHERE Activo = 1`. El historial **no** filtra por `Activo`, para conservar el contexto de las transacciones antiguas.

> **Importante para todo el equipo:** los nombres son exactamente `Usuario`, `Categoria` y `Transaccion` (sin tildes), la columna es `Contrasena` (sin ñ) y los valores de `Tipo` son los tres de arriba.

## 6. Usuario de la aplicación y permisos

El backend **no** usa `sa`. Usa un usuario propio (`app_cartera` por defecto) con permisos mínimos:

- `db_datareader`: puede hacer `SELECT`.
- `db_datawriter`: puede hacer `INSERT`, `UPDATE` y `DELETE`.
- **No** puede crear ni borrar tablas, ni crear usuarios, ni acceder a otras bases.

Se crea con `npm run db:crear-usuario`, usando las credenciales de tu `.env`. Así, ninguna contraseña queda escrita en el repositorio. El comando es idempotente: si el usuario ya existe, actualiza su contraseña con la del `.env` y confirma los permisos.

`sa` solo se usa para administrar: ejecutar los scripts `01` y `02` y crear el usuario.

## 7. Datos de prueba

El script `02_datos_prueba.sql` crea tres usuarios. La contraseña de todos es **`Test1234!`** (guardada como hash bcrypt).

| Usuario | Qué permite probar |
|---|---|
| `maria.lopez@test.com` | Caso completo: ingresos, 5 categorías, asignaciones y gastos. **Ocio** y **Vivienda** quedan casi agotadas (alertas) |
| `carlos.perez@test.com` | 3 categorías activas y 1 inactiva (**Gimnasio**, eliminación lógica); **Deudas** en 0 |
| `ana.garcia@test.com` | Usuario nuevo sin saldo ni categorías (flujo "sin saldo principal") |

Saldos esperados (para verificar que todo quedó bien):

| Usuario | Saldo principal | Categorías |
|---|---|---|
| María | 4200 | Comida 4640 · Transporte 1540 · Vivienda 150 · Ocio 50 · Ahorro 1000 |
| Carlos | 1600 | Comida 150 · Transporte 500 · Deudas 0 · Gimnasio 0 (inactiva) |
| Ana | 0 | — |

Los saldos se recalculan a partir de las transacciones, por lo que siempre son consistentes con el historial. El script solo toca a los usuarios `@test.com`.

## 8. Backend y rutas

### Scripts de npm

| Comando | Qué hace |
|---|---|
| `npm run dev` | Inicia el servidor y lo reinicia al guardar cambios |
| `npm start` | Inicia el servidor |
| `npm run db:crear-usuario` | Crea o actualiza el usuario SQL de la aplicación |

Al arrancar, el servidor prueba la conexión a la base de datos. Si falla, avisa en consola pero sigue arriba (útil para quien solo trabaja en el frontend), y `/api/health` responde `503`. Si el puerto está ocupado, muestra un mensaje claro y se cierra.

### Rutas automáticas

`server.js` **no se edita** para agregar rutas. Cada carpeta de `src/modules/` que tenga un archivo con este nombre exacto se monta sola:

```
src/modules/<nombre>/<nombre>.routes.js   →   /api/<nombre>
```

Por ejemplo, `src/modules/auth/auth.routes.js` queda disponible en `/api/auth`. Así, nadie pisa el trabajo de otro en `server.js` ni genera conflictos de Git.

Plantilla mínima de un módulo:

```js
import { Router } from 'express';
import { getPool, sql } from '../../config/db.js';

const router = Router();

router.get('/', async (req, res) => {
  const pool = await getPool();
  const result = await pool
    .request()
    .input('id', sql.Int, 1)
    .query('SELECT * FROM Usuario WHERE IDUsuario = @id');
  res.json(result.recordset);
});

export default router;
```

Reglas a tener en cuenta:

- El archivo debe llamarse **exactamente** `<carpeta>.routes.js`. Si tiene otro nombre, el servidor lo ignora sin avisar.
- Debe exportar el router con `export default`.
- El proyecto usa ES Modules: los imports **llevan la extensión `.js`** (`'../../config/db.js'`).
- Usa siempre consultas con parámetros (`.input(...)`) y nunca concatenes valores en el SQL.
- Las rutas `/api/...` que no existen devuelven un `404` en JSON.

### Módulos actuales

`auth`, `balance`, `categories`, `expenses`, `overview`, `profile`.

## 9. Comandos útiles de Docker

| Comando | Qué hace |
|---|---|
| `docker compose up -d` | Levanta SQL Server |
| `docker compose ps` | Muestra el estado (espera `healthy`) |
| `docker compose logs -f sqlserver` | Ver los logs |
| `docker compose stop` / `docker compose start` | Pausar / reanudar |
| `docker compose down` | Apaga el contenedor (**los datos se conservan**) |
| `docker compose down -v` | Apaga y **borra los datos**. Úsalo para reiniciar desde cero |

Para reiniciar la base desde cero: `docker compose down -v`, y repite los pasos 3 a 5 del inicio rápido.

## 10. Problemas comunes

| Mensaje o síntoma | Causa y solución |
|---|---|
| `self-signed certificate` | Falta `DB_TRUST_CERT=true` en el `.env` (sin comillas, en minúsculas, sin espacios) |
| `Cannot open database "CarteraDigital"` | La base no existe todavía. Ejecuta `01_estructura.sql` |
| `Login failed for user ...` | Contraseña incorrecta en el `.env`, o falta ejecutar `npm run db:crear-usuario` |
| `Failed to connect to localhost:1433` | El contenedor no está corriendo o no está `healthy`. Revisa `docker compose ps` |
| `bind: address already in use` al levantar Docker | El puerto 1433 está ocupado. Cambia `DB_PORT` (por ejemplo, a `1434`) en el `.env` |
| El contenedor se cierra al iniciar | La contraseña de `DB_ADMIN_PASSWORD` no cumple la política de SQL Server (8+ caracteres con mayúsculas, minúsculas, números y símbolos) |
| Cambié `DB_ADMIN_PASSWORD` y no hace efecto | Solo se aplica al crear el volumen. Haz `docker compose down -v` y vuelve a levantar |
| `El puerto 3000 ya está en uso` | Otro programa lo usa. Cambia `PORT` en el `.env` (y el puerto al que apunta el frontend) |
| `Cannot GET /api/health` | Casi seguro hay otro programa respondiendo en ese puerto. Revisa quién lo usa |
| Mi módulo no aparece en `/api/...` | Revisa que el archivo se llame `<carpeta>.routes.js`, que exporte con `export default` y que reinicies el servidor |
| `ERR_MODULE_NOT_FOUND` al importar | Falta la extensión `.js` en el import |
|`Cannot add the principal '...'` al ejecutar `db:crear-usuario`|La contraseña de `DB_PASSWORD` no cumple la política de SQL Server (por ejemplo, contiene el nombre del usuario). Elige una más fuerte y vuelve a ejecutar|

## 11. Flujo de trabajo del equipo

- Cada integrante trabaja con **su propia copia local** de la base de datos, levantada con `docker compose`.
- Los scripts oficiales viven en `backend/database/`. Quien mantiene la base de datos publica los cambios en esos archivos y avisa al equipo. Cada quien los vuelve a ejecutar (son idempotentes).
- Si hay un cambio en la estructura de tablas, se coordina con todos antes de subirlo.
- Trabaja siempre en una rama (`feature/...`) y abre un Pull Request.
- **Nunca** subas el `.env`. Verifica con `git status` antes de cada commit.