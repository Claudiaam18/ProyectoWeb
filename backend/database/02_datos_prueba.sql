/* =====================================================================
   02_datos_prueba.sql
   Cartera Digital - Datos ficticios para pruebas (SQL Server 2022)

   - Requiere haber ejecutado antes 01_estructura.sql
   - Es IDEMPOTENTE: no duplica datos si se ejecuta varias veces.
   - NO borra ni modifica datos de usuarios reales: solo toca los
     usuarios de prueba (correos @test.com).
   - Contrasena de TODOS los usuarios de prueba: Test1234!
     (guardada como hash bcrypt, igual que en produccion)
   - Texto sin tildes ni enie a proposito, para evitar problemas de
     codificacion al ejecutar el archivo desde distintos clientes.

   Usuarios de prueba:
     maria.lopez@test.com   -> caso completo: ingresos, 5 categorias,
                               gastos, categorias casi agotadas (alertas)
     carlos.perez@test.com  -> caso medio: 3 categorias + 1 inactiva
                               (eliminacion logica), una categoria en 0
     ana.garcia@test.com    -> usuario nuevo SIN saldo ni categorias
                               (para probar el flujo "sin saldo principal")
   ===================================================================== */

USE CarteraDigital;
GO

SET NOCOUNT ON;
SET XACT_ABORT ON;

BEGIN TRY
    BEGIN TRANSACTION;

    DECLARE @Hash VARCHAR(255) = '$2b$10$FXeLA6nQ2hpiDpiqJD9HUOBtyDDKlQxNm7vkZkvs2EBtDVWXzoRSO';

    /* -----------------------------------------------------------------
       1. Usuarios
       ----------------------------------------------------------------- */
    IF NOT EXISTS (SELECT 1 FROM dbo.Usuario WHERE Correo = 'maria.lopez@test.com')
        INSERT INTO dbo.Usuario (Nombre, Apellido, Correo, Contrasena, FotoPerfil)
        VALUES ('Maria', 'Lopez', 'maria.lopez@test.com', @Hash, NULL);

    IF NOT EXISTS (SELECT 1 FROM dbo.Usuario WHERE Correo = 'carlos.perez@test.com')
        INSERT INTO dbo.Usuario (Nombre, Apellido, Correo, Contrasena, FotoPerfil)
        VALUES ('Carlos', 'Perez', 'carlos.perez@test.com', @Hash, NULL);

    IF NOT EXISTS (SELECT 1 FROM dbo.Usuario WHERE Correo = 'ana.garcia@test.com')
        INSERT INTO dbo.Usuario (Nombre, Apellido, Correo, Contrasena, FotoPerfil)
        VALUES ('Ana', 'Garcia', 'ana.garcia@test.com', @Hash, NULL);

    DECLARE @Maria  INT = (SELECT IDUsuario FROM dbo.Usuario WHERE Correo = 'maria.lopez@test.com');
    DECLARE @Carlos INT = (SELECT IDUsuario FROM dbo.Usuario WHERE Correo = 'carlos.perez@test.com');

    /* -----------------------------------------------------------------
       2. Categorias (SaldoDisponible se recalcula al final)
       ----------------------------------------------------------------- */
    -- Maria
    IF NOT EXISTS (SELECT 1 FROM dbo.Categoria WHERE IDUsuario = @Maria AND Nombre = 'Comida')
        INSERT INTO dbo.Categoria (IDUsuario, Nombre) VALUES (@Maria, 'Comida');
    IF NOT EXISTS (SELECT 1 FROM dbo.Categoria WHERE IDUsuario = @Maria AND Nombre = 'Transporte')
        INSERT INTO dbo.Categoria (IDUsuario, Nombre) VALUES (@Maria, 'Transporte');
    IF NOT EXISTS (SELECT 1 FROM dbo.Categoria WHERE IDUsuario = @Maria AND Nombre = 'Vivienda')
        INSERT INTO dbo.Categoria (IDUsuario, Nombre) VALUES (@Maria, 'Vivienda');
    IF NOT EXISTS (SELECT 1 FROM dbo.Categoria WHERE IDUsuario = @Maria AND Nombre = 'Ocio')
        INSERT INTO dbo.Categoria (IDUsuario, Nombre) VALUES (@Maria, 'Ocio');
    IF NOT EXISTS (SELECT 1 FROM dbo.Categoria WHERE IDUsuario = @Maria AND Nombre = 'Ahorro')
        INSERT INTO dbo.Categoria (IDUsuario, Nombre) VALUES (@Maria, 'Ahorro');

    -- Carlos (Gimnasio queda inactiva: prueba de eliminacion logica)
    IF NOT EXISTS (SELECT 1 FROM dbo.Categoria WHERE IDUsuario = @Carlos AND Nombre = 'Comida')
        INSERT INTO dbo.Categoria (IDUsuario, Nombre) VALUES (@Carlos, 'Comida');
    IF NOT EXISTS (SELECT 1 FROM dbo.Categoria WHERE IDUsuario = @Carlos AND Nombre = 'Transporte')
        INSERT INTO dbo.Categoria (IDUsuario, Nombre) VALUES (@Carlos, 'Transporte');
    IF NOT EXISTS (SELECT 1 FROM dbo.Categoria WHERE IDUsuario = @Carlos AND Nombre = 'Deudas')
        INSERT INTO dbo.Categoria (IDUsuario, Nombre) VALUES (@Carlos, 'Deudas');
    IF NOT EXISTS (SELECT 1 FROM dbo.Categoria WHERE IDUsuario = @Carlos AND Nombre = 'Gimnasio')
        INSERT INTO dbo.Categoria (IDUsuario, Nombre, Activo) VALUES (@Carlos, 'Gimnasio', 0);

    -- IDs de categorias de Maria
    DECLARE @MComida     INT = (SELECT IDCategoria FROM dbo.Categoria WHERE IDUsuario = @Maria AND Nombre = 'Comida');
    DECLARE @MTransporte INT = (SELECT IDCategoria FROM dbo.Categoria WHERE IDUsuario = @Maria AND Nombre = 'Transporte');
    DECLARE @MVivienda   INT = (SELECT IDCategoria FROM dbo.Categoria WHERE IDUsuario = @Maria AND Nombre = 'Vivienda');
    DECLARE @MOcio       INT = (SELECT IDCategoria FROM dbo.Categoria WHERE IDUsuario = @Maria AND Nombre = 'Ocio');
    DECLARE @MAhorro     INT = (SELECT IDCategoria FROM dbo.Categoria WHERE IDUsuario = @Maria AND Nombre = 'Ahorro');

    -- IDs de categorias de Carlos
    DECLARE @CComida     INT = (SELECT IDCategoria FROM dbo.Categoria WHERE IDUsuario = @Carlos AND Nombre = 'Comida');
    DECLARE @CTransporte INT = (SELECT IDCategoria FROM dbo.Categoria WHERE IDUsuario = @Carlos AND Nombre = 'Transporte');
    DECLARE @CDeudas     INT = (SELECT IDCategoria FROM dbo.Categoria WHERE IDUsuario = @Carlos AND Nombre = 'Deudas');
    DECLARE @CGimnasio   INT = (SELECT IDCategoria FROM dbo.Categoria WHERE IDUsuario = @Carlos AND Nombre = 'Gimnasio');

    /* -----------------------------------------------------------------
       3. Transacciones
          Solo se insertan si el usuario de prueba aun no tiene ninguna.
       ----------------------------------------------------------------- */

    -- ===== MARIA =====
    IF NOT EXISTS (SELECT 1 FROM dbo.Transaccion WHERE IDUsuario = @Maria)
    BEGIN
        INSERT INTO dbo.Transaccion (IDUsuario, IDCategoria, Tipo, Monto, Descripcion, Fecha) VALUES
        -- Ingresos al saldo principal
        (@Maria, NULL, 'ingresoSaldo', 8000.00, 'Sueldo septiembre',        '20260901 08:00:00'),
        (@Maria, NULL, 'ingresoSaldo', 1500.00, 'Bono de productividad',    '20260915 12:30:00'),
        (@Maria, NULL, 'ingresoSaldo', 8000.00, 'Sueldo octubre',           '20261001 08:00:00'),
        -- Asignaciones a categorias
        (@Maria, @MComida,     'asignacion', 3000.00, 'Presupuesto comida septiembre',     '20260901 09:00:00'),
        (@Maria, @MTransporte, 'asignacion', 1000.00, 'Presupuesto transporte septiembre', '20260901 09:05:00'),
        (@Maria, @MVivienda,   'asignacion', 3500.00, 'Presupuesto vivienda septiembre',   '20260902 18:00:00'),
        (@Maria, @MOcio,       'asignacion',  800.00, 'Presupuesto ocio septiembre',       '20260902 18:10:00'),
        (@Maria, @MAhorro,     'asignacion', 1000.00, 'Ahorro del bono',                   '20260915 13:00:00'),
        (@Maria, @MComida,     'asignacion', 3000.00, 'Presupuesto comida octubre',        '20261001 09:00:00'),
        (@Maria, @MTransporte, 'asignacion', 1000.00, 'Presupuesto transporte octubre',    '20261002 09:00:00'),
        -- Gastos
        (@Maria, @MComida,     'gasto',  450.00, 'Supermercado',               '20260905 17:20:00'),
        (@Maria, @MTransporte, 'gasto',  200.00, 'Gasolina',                   '20260906 08:15:00'),
        (@Maria, @MComida,     'gasto',  120.00, 'Almuerzo en restaurante',    '20260908 13:40:00'),
        (@Maria, @MVivienda,   'gasto', 3000.00, 'Alquiler septiembre',        '20260903 10:00:00'),
        (@Maria, @MVivienda,   'gasto',  350.00, 'Luz y agua',                 '20260910 11:00:00'),
        (@Maria, @MTransporte, 'gasto',   60.00, 'Bus y taxi',                 '20260910 19:30:00'),
        (@Maria, @MOcio,       'gasto',  250.00, 'Cine',                       '20260912 20:00:00'),
        (@Maria, @MComida,     'gasto',  380.00, 'Supermercado',               '20260919 16:45:00'),
        (@Maria, @MOcio,       'gasto',  300.00, 'Cena con amigos',            '20260920 21:00:00'),
        (@Maria, @MOcio,       'gasto',  200.00, 'Suscripcion streaming',      '20260925 09:00:00'),
        (@Maria, @MComida,     'gasto',  410.00, 'Supermercado',               '20261005 17:10:00'),
        (@Maria, @MTransporte, 'gasto',  200.00, 'Gasolina',                   '20261005 08:00:00');
    END

    -- ===== CARLOS =====
    IF NOT EXISTS (SELECT 1 FROM dbo.Transaccion WHERE IDUsuario = @Carlos)
    BEGIN
        INSERT INTO dbo.Transaccion (IDUsuario, IDCategoria, Tipo, Monto, Descripcion, Fecha) VALUES
        -- Ingresos al saldo principal
        (@Carlos, NULL, 'ingresoSaldo', 5000.00, 'Sueldo septiembre',  '20260901 08:00:00'),
        (@Carlos, NULL, 'ingresoSaldo', 1200.00, 'Trabajo freelance',  '20260920 15:00:00'),
        -- Asignaciones
        (@Carlos, @CComida,     'asignacion', 2000.00, 'Presupuesto comida',     '20260901 10:00:00'),
        (@Carlos, @CTransporte, 'asignacion',  800.00, 'Presupuesto transporte', '20260901 10:05:00'),
        (@Carlos, @CDeudas,     'asignacion', 1500.00, 'Pago de tarjeta',        '20260901 10:10:00'),
        (@Carlos, @CGimnasio,   'asignacion',  300.00, 'Mensualidad gimnasio',   '20260902 07:00:00'),
        -- Gastos
        (@Carlos, @CGimnasio,   'gasto',  300.00, 'Mensualidad gimnasio',  '20260903 07:30:00'),
        (@Carlos, @CComida,     'gasto',  900.00, 'Supermercado',          '20260907 18:00:00'),
        (@Carlos, @CTransporte, 'gasto',  300.00, 'Transporte semanal',    '20260909 07:45:00'),
        (@Carlos, @CComida,     'gasto',  950.00, 'Supermercado y comida', '20260922 18:30:00'),
        (@Carlos, @CDeudas,     'gasto', 1500.00, 'Pago de tarjeta',       '20260928 12:00:00');
    END

    /* -----------------------------------------------------------------
       4. Recalcular saldos SOLO de los usuarios de prueba
          Garantiza que los saldos coincidan con el historial:
            SaldoPrincipal  = ingresosSaldo - asignaciones
            SaldoDisponible = asignaciones   - gastos
       ----------------------------------------------------------------- */
    UPDATE c
    SET c.SaldoDisponible = ISNULL((
            SELECT SUM(CASE t.Tipo WHEN 'asignacion' THEN t.Monto
                                   WHEN 'gasto'      THEN -t.Monto END)
            FROM dbo.Transaccion t
            WHERE t.IDCategoria = c.IDCategoria), 0)
    FROM dbo.Categoria c
    JOIN dbo.Usuario u ON u.IDUsuario = c.IDUsuario
    WHERE u.Correo LIKE '%@test.com';

    UPDATE u
    SET u.SaldoPrincipal = ISNULL((
            SELECT SUM(CASE t.Tipo WHEN 'ingresoSaldo' THEN t.Monto
                                   WHEN 'asignacion'    THEN -t.Monto END)
            FROM dbo.Transaccion t
            WHERE t.IDUsuario = u.IDUsuario), 0),
        u.UltimaEdicion = GETDATE()
    FROM dbo.Usuario u
    WHERE u.Correo LIKE '%@test.com';

    COMMIT TRANSACTION;
    PRINT 'Datos de prueba insertados/verificados correctamente.';
END TRY
BEGIN CATCH
    IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
    PRINT 'ERROR al insertar datos de prueba: ' + ERROR_MESSAGE();
    THROW;
END CATCH
GO

/* ---------------------------------------------------------------------
   5. Verificacion rapida (opcional): saldos esperados
      Maria : SaldoPrincipal 4200 | Comida 4640 | Transporte 1540
              Vivienda 150 | Ocio 50 | Ahorro 1000
      Carlos: SaldoPrincipal 1600 | Comida 150 | Transporte 500
              Deudas 0 | Gimnasio 0 (inactiva)
      Ana   : SaldoPrincipal 0, sin categorias
   --------------------------------------------------------------------- */
SELECT u.Nombre, u.SaldoPrincipal, c.Nombre AS Categoria, c.SaldoDisponible, c.Activo
FROM dbo.Usuario u
LEFT JOIN dbo.Categoria c ON c.IDUsuario = u.IDUsuario
WHERE u.Correo LIKE '%@test.com'
ORDER BY u.IDUsuario, c.IDCategoria;
GO