/* =====================================================================
   01_estructura.sql
   Cartera Digital - Estructura de la base de datos (SQL Server 2022)

   - Es IDEMPOTENTE: se puede ejecutar varias veces sin error.
   - NO borra datos ni tablas existentes (no hay DROP en este script).
   - Orden de ejecucion: 01_estructura.sql -> 02_datos_prueba.sql
   ===================================================================== */

/* ---------------------------------------------------------------------
   1. Base de datos (solo se crea si no existe)
   --------------------------------------------------------------------- */
IF DB_ID(N'CarteraDigital') IS NULL
BEGIN
    CREATE DATABASE CarteraDigital;
END
GO

USE CarteraDigital;
GO

/* ---------------------------------------------------------------------
   2. Tabla Usuario
   --------------------------------------------------------------------- */
IF OBJECT_ID(N'dbo.Usuario', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.Usuario (
        IDUsuario       INT IDENTITY(1,1)  NOT NULL,
        Nombre          VARCHAR(50)        NOT NULL,
        Apellido        VARCHAR(50)        NOT NULL,
        Correo          VARCHAR(100)       NOT NULL,
        FotoPerfil      VARCHAR(500)       NULL,      -- URL de la imagen
        Contrasena      VARCHAR(255)       NOT NULL,  -- SIEMPRE el hash (bcrypt), nunca texto plano
        FechaRegistro   DATETIME           NOT NULL CONSTRAINT DF_Usuario_FechaRegistro DEFAULT (GETDATE()),
        SaldoPrincipal  DECIMAL(12,2)      NOT NULL CONSTRAINT DF_Usuario_SaldoPrincipal DEFAULT (0),
        UltimaEdicion   DATETIME           NOT NULL CONSTRAINT DF_Usuario_UltimaEdicion  DEFAULT (GETDATE()),

        CONSTRAINT PK_Usuario          PRIMARY KEY (IDUsuario),
        CONSTRAINT UQ_Usuario_Correo   UNIQUE (Correo),
        CONSTRAINT CK_Usuario_Saldo    CHECK (SaldoPrincipal >= 0)
    );
END
GO

/* ---------------------------------------------------------------------
   3. Tabla Categoria  (los "sobres" del usuario)
   --------------------------------------------------------------------- */
IF OBJECT_ID(N'dbo.Categoria', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.Categoria (
        IDCategoria      INT IDENTITY(1,1) NOT NULL,
        IDUsuario        INT               NOT NULL,
        Nombre           VARCHAR(50)       NOT NULL,
        FechaCreacion    DATE              NOT NULL CONSTRAINT DF_Categoria_FechaCreacion DEFAULT (CAST(GETDATE() AS DATE)),
        SaldoDisponible  DECIMAL(12,2)     NOT NULL CONSTRAINT DF_Categoria_Saldo DEFAULT (0),
        Activo           BIT               NOT NULL CONSTRAINT DF_Categoria_Activo DEFAULT (1),  -- eliminacion logica

        CONSTRAINT PK_Categoria         PRIMARY KEY (IDCategoria),
        CONSTRAINT FK_Categoria_Usuario FOREIGN KEY (IDUsuario) REFERENCES dbo.Usuario (IDUsuario),
        CONSTRAINT CK_Categoria_Saldo   CHECK (SaldoDisponible >= 0)
    );
END
GO

/* ---------------------------------------------------------------------
   4. Tabla Transaccion
      Tipo: 'ingresoSaldo' | 'asignacion' | 'gasto'
        - ingresoSaldo : suma al SaldoPrincipal (sin categoria)
        - asignacion    : resta del SaldoPrincipal, suma a la categoria
        - gasto         : resta del SaldoDisponible de la categoria
   --------------------------------------------------------------------- */
IF OBJECT_ID(N'dbo.Transaccion', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.Transaccion (
        IDTransaccion  INT IDENTITY(1,1) NOT NULL,
        IDUsuario      INT               NOT NULL,
        IDCategoria    INT               NULL,       -- NULL cuando es ingresoSaldo
        Tipo           VARCHAR(20)       NOT NULL,
        Monto          DECIMAL(12,2)     NOT NULL,
        Descripcion    VARCHAR(200)      NULL,
        Fecha          DATETIME          NOT NULL CONSTRAINT DF_Transaccion_Fecha DEFAULT (GETDATE()),

        CONSTRAINT PK_Transaccion           PRIMARY KEY (IDTransaccion),
        CONSTRAINT FK_Transaccion_Usuario   FOREIGN KEY (IDUsuario)   REFERENCES dbo.Usuario (IDUsuario),
        CONSTRAINT FK_Transaccion_Categoria FOREIGN KEY (IDCategoria) REFERENCES dbo.Categoria (IDCategoria),

        CONSTRAINT CK_Transaccion_Tipo  CHECK (Tipo IN ('ingresoSaldo', 'asignacion', 'gasto')),
        CONSTRAINT CK_Transaccion_Monto CHECK (Monto > 0),

        -- Coherencia entre Tipo y Categoria
        CONSTRAINT CK_Transaccion_TipoCategoria CHECK (
               (Tipo = 'ingresoSaldo' AND IDCategoria IS NULL)
            OR (Tipo IN ('asignacion', 'gasto') AND IDCategoria IS NOT NULL)
        )
    );
END
GO

/* ---------------------------------------------------------------------
   5. Indices
   --------------------------------------------------------------------- */

-- No permitir dos categorias ACTIVAS con el mismo nombre para un mismo usuario
-- (las inactivas no cuentan, asi se puede reutilizar un nombre "eliminado")
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'UX_Categoria_Usuario_Nombre_Activa'
               AND object_id = OBJECT_ID(N'dbo.Categoria'))
BEGIN
    CREATE UNIQUE INDEX UX_Categoria_Usuario_Nombre_Activa
        ON dbo.Categoria (IDUsuario, Nombre)
        WHERE Activo = 1;
END
GO

-- Historial cronologico por usuario
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'IX_Transaccion_Usuario_Fecha'
               AND object_id = OBJECT_ID(N'dbo.Transaccion'))
BEGIN
    CREATE INDEX IX_Transaccion_Usuario_Fecha
        ON dbo.Transaccion (IDUsuario, Fecha DESC);
END
GO

-- Historial filtrado por tipo y categoria
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'IX_Transaccion_Usuario_Tipo_Categoria'
               AND object_id = OBJECT_ID(N'dbo.Transaccion'))
BEGIN
    CREATE INDEX IX_Transaccion_Usuario_Tipo_Categoria
        ON dbo.Transaccion (IDUsuario, Tipo, IDCategoria)
        INCLUDE (Monto, Fecha);
END
GO

PRINT 'Estructura de CarteraDigital verificada/creada correctamente.';
GO