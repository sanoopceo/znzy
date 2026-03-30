import { useContext } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { StoreContext } from '../context/StoreContext';

export default function AdminBuilderNav() {
  const { state, dispatch } = useContext(StoreContext);
  const navigate = useNavigate();
  const location = useLocation();
  const isSuperuser = Boolean(state.userInfo?.isAdmin); 

  // Don't show if already in Dashboard or not admin
  if (!isSuperuser || location.pathname.startsWith('/admin')) return null;

  return (
    <div style={{ position: 'sticky', top: 0, zIndex: 2000, background: '#000', color: '#fff' }}>
      <div style={{ maxWidth: 1600, margin: '0 auto', padding: '0.6rem 2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <span style={{ fontWeight: 800, letterSpacing: '0.1em', fontSize: '0.7rem' }}>ZNZY MANAGEMENT</span>
          <nav style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <Link to="/admin" style={{ color: 'var(--color-gold)', fontSize: '0.75rem', fontWeight: 600 }}>DASHBOARD</Link>
            <a href="/admin/" target="_blank" rel="noreferrer" style={{ color: '#aaa', fontSize: '0.75rem' }}>ADMIN</a>
          </nav>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <span style={{ color: '#666', fontSize: '0.7rem' }}>{state.userInfo?.email}</span>
        </div>
      </div>
    </div>
  );
}
