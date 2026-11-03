import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import * as profileService from '../../services/profileService';
import * as authService from '../../services/authService';
import PersonalInfoForm from '../../components/profile/PersonalInfoForm';
import ChangePasswordForm from '../../components/profile/ChangePasswordForm';
import ProfilePreferences from '../../components/profile/ProfilePreferences';
import '../../styles/perfil.css';

function iniciales(nombre, apellido) {
  return `${nombre?.[0] ?? ''}${apellido?.[0] ?? ''}`.toUpperCase();
}

export default function Perfil() {
  const [perfil, setPerfil] = useState(null);
  const [preferencias, setPreferencias] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([profileService.obtenerPerfil(), profileService.obtenerPreferencias()])
      .then(([p, prefs]) => { setPerfil(p); setPreferencias(prefs); })
      .catch((err) => setError(err.message))
      .finally(() => setCargando(false));
  }, []);

  function cerrarSesion() {
    authService.logout();
    navigate('/');
  }

  if (cargando) return <p>Cargando perfil...</p>;
  if (error) return <p role="alert" className="perfil-error">{error}</p>;

  return (
    <section className="perfil-page">
      <h1>Mi perfil</h1>
      <p className="perfil-subtitulo">Administra tu información personal y configuración de cuenta</p>

      <div className="perfil-resumen">
        <div className="perfil-avatar">{iniciales(perfil.nombre, perfil.apellido)}</div>
        <p className="perfil-resumen-nombre">{perfil.nombre} {perfil.apellido}</p>
        <p className="perfil-resumen-correo">{perfil.correo}</p>
      </div>

      <PersonalInfoForm perfil={perfil} onActualizado={setPerfil} />
      <ChangePasswordForm />
      <ProfilePreferences preferencias={preferencias} onActualizado={setPreferencias} />

      <div className="perfil-card">
        <h2>Sesión</h2>
        <button className="perfil-btn-cerrar" onClick={cerrarSesion}>Cerrar sesión</button>
      </div>
    </section>
  );
}
