import { useEffect, useState } from 'react';
import * as categoryService from '../../services/categoryService';
import * as balanceService from '../../services/balanceService';
import CategoriaForm from './CategoriaForm';

const formatoQuetzales = new Intl.NumberFormat('es-GT', { style: 'currency', currency: 'GTQ' });

function AsignarForm({ onAsignar }) {
  const [monto, setMonto] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState('');

  async function manejarEnvio(evento) {
    evento.preventDefault();
    const montoNumero = Number(monto);

    if (!montoNumero || montoNumero <= 0) {
      setError('Ingresa un monto mayor que 0');
      return;
    }

    setEnviando(true);
    setError('');
    try {
      await onAsignar(montoNumero);
      setMonto('');
    } catch (err) {
      setError(err.message);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <form onSubmit={manejarEnvio}>
      <input
        type="number"
        min="0.01"
        step="0.01"
        placeholder="Monto a asignar"
        aria-label="Monto a asignar"
        value={monto}
        onChange={(e) => setMonto(e.target.value)}
        required
      />
      <button type="submit" disabled={enviando}>
        {enviando ? 'Asignando...' : 'Asignar'}
      </button>
      {error && <p role="alert">{error}</p>}
    </form>
  );
}

export default function Categorias() {
  const [categorias, setCategorias] = useState([]);
  const [sinAsignar, setSinAsignar] = useState(0);
  const [editandoId, setEditandoId] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  async function cargarDatos() {
    try {
      const [listaCategorias, saldo] = await Promise.all([
        categoryService.listarCategorias(),
        balanceService.obtenerSaldo(),
      ]);
      setCategorias(listaCategorias);
      setSinAsignar(saldo.saldoPrincipal);
      setError('');
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    cargarDatos();
  }, []);

  async function crear(nombre) {
    await categoryService.crearCategoria(nombre);
    await cargarDatos();
  }

  async function renombrar(id, nombre) {
    await categoryService.editarCategoria(id, nombre);
    setEditandoId(null);
    await cargarDatos();
  }

  async function asignar(id, monto) {
    await categoryService.asignarPresupuesto(id, monto);
    await cargarDatos();
  }

  async function desactivar(categoria) {
    if (!window.confirm(`¿Desactivar la categoría "${categoria.nombre}"?`)) return;
    try {
      await categoryService.desactivarCategoria(categoria.id);
      await cargarDatos();
    } catch (err) {
      setError(err.message);
    }
  }

  if (cargando) return <p>Cargando categorías...</p>;

  return (
    <section>
      <h1>Mis categorías</h1>
      <p>Dinero sin asignar: <strong>{formatoQuetzales.format(sinAsignar)}</strong></p>

      {error && <p role="alert">{error}</p>}

      <h2>Nueva categoría</h2>
      <CategoriaForm onGuardar={crear} />

      {categorias.length === 0 ? (
        <p>Todavía no tienes categorías.</p>
      ) : (
        <div>
          {categorias.map((categoria) => (
            <article key={categoria.id}>
              {editandoId === categoria.id ? (
                <CategoriaForm
                  nombreInicial={categoria.nombre}
                  textoBoton="Guardar"
                  onGuardar={(nombre) => renombrar(categoria.id, nombre)}
                  onCancelar={() => setEditandoId(null)}
                />
              ) : (
                <h3>{categoria.nombre}</h3>
              )}

              <p>Asignado: {formatoQuetzales.format(categoria.asignado)}</p>
              <p>Gastado: {formatoQuetzales.format(categoria.gastado)}</p>
              <p>Disponible: {formatoQuetzales.format(categoria.disponible)}</p>

              <AsignarForm onAsignar={(monto) => asignar(categoria.id, monto)} />

              <button type="button" onClick={() => setEditandoId(categoria.id)}>Renombrar</button>
              <button type="button" onClick={() => desactivar(categoria)}>Desactivar</button>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
