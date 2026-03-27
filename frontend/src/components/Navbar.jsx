import { useContext, useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { StoreContext } from '../context/StoreContext';
import { ShoppingBag, User, Moon, Sun, Search, X, Menu, ChevronDown } from 'lucide-react';
import axios from 'axios';

const NAV_LINKS = [
  { label: 'Home', path: '/' },
  { label: 'NEW IN', path: '/new-in' },
  { label: 'Bestsellers', path: '/bestsellers' },
  { label: 'Shop', path: '/shop' },
  { label: 'Collections', path: '/collections' },
  { label: 'ARCHIVE SALE', path: '/archive-sale', gold: true },
  { label: 'About Us', path: '/about' },
];

export default function Navbar() {
  const { state, dispatch } = useContext(StoreContext);
  const { cartItems, userInfo, theme } = state;
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const searchRef = useRef(null);
  const userMenuRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const cartCount = cartItems.reduce((a, c) => a + (c.qty || 1), 0);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setSearchOpen(false);
    setSearchQuery('');
    setUserMenuOpen(false);
  }, [location]);

  useEffect(() => {
    if (!searchQuery.trim()) { setSearchResults([]); return; }
    const timer = setTimeout(async () => {
      try {
        const { data } = await axios.get(`/api/products/?keyword=${searchQuery}`);
        setSearchResults((data.products || data).slice(0, 6));
      } catch { setSearchResults([]); }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    const handleClick = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setSearchOpen(false);
        setSearchQuery('');
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const toggleTheme = () => dispatch({ type: 'TOGGLE_THEME' });

  return (
    <>
      <header style={{
        position: 'sticky',
        top: 0,
        zIndex: 200,
        backgroundColor: scrolled ? 'var(--color-bg)' : 'var(--color-bg)',
        borderBottom: '1px solid var(--color-border)',
        boxShadow: scrolled ? '0 4px 20px rgba(0,0,0,0.08)' : 'none',
        transition: 'box-shadow 0.3s ease, background-color 0.3s ease',
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr auto 1fr',
          alignItems: 'center',
          height: '70px',
          padding: '0 2rem',
          maxWidth: '1600px',
          margin: '0 auto',
        }}>

          {/* LEFT — Logo */}
          <Link to="/" style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.3rem',
          }}>
            <span style={{
              fontFamily: 'var(--font-serif)',
              fontSize: '1.9rem',
              fontWeight: 700,
              letterSpacing: '0.08em',
              color: 'var(--color-text)',
              lineHeight: 1,
            }}>ZNZY</span>
          </Link>

          {/* CENTRE — Nav links (desktop) */}
          <nav style={{ display: 'flex', alignItems: 'center', gap: '0.15rem' }} className="desktop-nav">
            {NAV_LINKS.map(link => (
              <Link
                key={link.path}
                to={link.path}
                style={{
                  padding: '0.4rem 0.75rem',
                  fontSize: '0.72rem',
                  fontWeight: 600,
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  color: link.gold ? 'var(--color-gold)' : (location.pathname === link.path ? 'var(--color-text)' : 'var(--color-text-light)'),
                  borderBottom: location.pathname === link.path ? '1px solid var(--color-gold)' : '1px solid transparent',
                  transition: 'all 0.2s ease',
                  whiteSpace: 'nowrap',
                }}
                onMouseEnter={e => { e.currentTarget.style.color = link.gold ? 'var(--color-gold-dark)' : 'var(--color-text)'; }}
                onMouseLeave={e => { e.currentTarget.style.color = link.gold ? 'var(--color-gold)' : (location.pathname === link.path ? 'var(--color-text)' : 'var(--color-text-light)'); }}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* RIGHT — Search, Login, Cart, Theme */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '1rem' }}>

            {/* Search */}
            <div ref={searchRef} style={{ position: 'relative' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                {searchOpen && (
                  <div style={{ position: 'relative' }}>
                    <input
                      autoFocus
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      placeholder="Search styles..."
                      style={{
                        width: '200px',
                        padding: '0.45rem 0.75rem',
                        border: '1px solid var(--color-gold)',
                        borderRadius: '2px',
                        fontSize: '0.8rem',
                        background: 'var(--color-bg)',
                        color: 'var(--color-text)',
                        fontFamily: 'var(--font-main)',
                        outline: 'none',
                        transition: 'all 0.3s ease',
                      }}
                    />
                    {/* Results Dropdown */}
                    {searchResults.length > 0 && (
                      <div style={{
                        position: 'absolute',
                        top: '110%',
                        left: 0,
                        right: 0,
                        backgroundColor: 'var(--color-bg)',
                        border: '1px solid var(--color-border)',
                        borderTop: '2px solid var(--color-gold)',
                        boxShadow: '0 10px 30px rgba(0,0,0,0.12)',
                        zIndex: 300,
                        maxHeight: '320px',
                        overflowY: 'auto',
                        minWidth: '260px',
                      }}>
                        {searchResults.map(p => (
                          <Link
                            key={p.id || p._id}
                            to={`/product/${p.id || p._id}`}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.75rem',
                              padding: '0.75rem 1rem',
                              borderBottom: '1px solid var(--color-border)',
                              transition: 'background 0.2s',
                            }}
                            onMouseEnter={e => e.currentTarget.style.background = 'var(--color-secondary)'}
                            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                          >
                            {p.image && (
                              <img src={p.image} alt={p.name} style={{ width: 40, height: 50, objectFit: 'cover', borderRadius: '1px' }} />
                            )}
                            <div>
                              <div style={{ fontSize: '0.82rem', fontWeight: 600 }}>{p.name}</div>
                              <div style={{ fontSize: '0.75rem', color: 'var(--color-gold)' }}>${p.price}</div>
                            </div>
                          </Link>
                        ))}
                        {searchQuery && searchResults.length === 0 && (
                          <div style={{ padding: '1rem', fontSize: '0.8rem', color: 'var(--color-text-light)', textAlign: 'center' }}>
                            No results for "{searchQuery}"
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
                <button
                  onClick={() => { setSearchOpen(!searchOpen); setSearchQuery(''); setSearchResults([]); }}
                  aria-label="Search"
                  style={{ color: 'var(--color-text)', display: 'flex', alignItems: 'center' }}
                >
                  {searchOpen ? <X size={19} /> : <Search size={19} />}
                </button>
              </div>
            </div>

            {/* Theme Toggle */}
            <button onClick={toggleTheme} aria-label="Toggle Theme" style={{ color: 'var(--color-text)', display: 'flex', alignItems: 'center' }}>
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            {/* Login / User Dropdown */}
            <div ref={userMenuRef} style={{ position: 'relative' }} className="user-menu-container">
              {userInfo ? (
                <div 
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: 'var(--color-text)', fontSize: '0.72rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', cursor: 'pointer' }}
                >
                  <User size={18} />
                  <span className="desktop-nav">{userInfo.name?.split(' ')[0]}</span>
                  <ChevronDown size={14} style={{ transform: userMenuOpen ? 'rotate(180deg)' : 'none', transition: '0.3s' }} />
                  
                  {/* Dropdown Menu */}
                  <div className={`user-dropdown ${userMenuOpen ? 'visible' : ''}`} onClick={e => e.stopPropagation()}>
                    <Link to="/profile" onClick={() => setUserMenuOpen(false)}>Profile</Link>
                    <Link to="/orders" onClick={() => setUserMenuOpen(false)}>My Orders</Link>
                    <button onClick={() => {
                       dispatch({ type: 'USER_LOGOUT' });
                       localStorage.removeItem('userInfo');
                       setUserMenuOpen(false);
                       navigate('/login');
                    }}>Logout</button>
                  </div>
                </div>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <Link to="/login" style={{ fontSize: '0.72rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-text)' }}>
                    Login
                  </Link>
                  <span style={{ color: 'var(--color-border)' }}>|</span>
                  <Link to="/register" style={{ fontSize: '0.72rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-gold)' }}>
                    Register
                  </Link>
                </div>
              )}
            </div>

            {/* Cart */}
            <Link to="/cart" style={{ position: 'relative', color: 'var(--color-text)', display: 'flex', alignItems: 'center' }}>
              <ShoppingBag size={20} />
              {cartCount > 0 && (
                <span style={{
                  position: 'absolute',
                  top: '-8px',
                  right: '-8px',
                  background: 'var(--color-gold)',
                  color: '#0a0a0a',
                  fontSize: '0.6rem',
                  fontWeight: 700,
                  width: '17px',
                  height: '17px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  {cartCount}
                </span>
              )}
            </Link>

            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="mobile-menu-btn"
              aria-label="Menu"
              style={{ color: 'var(--color-text)', display: 'none' }}
            >
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Nav Drawer */}
      {mobileOpen && (
        <div style={{
          position: 'fixed',
          top: '70px',
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'var(--color-bg)',
          zIndex: 199,
          padding: '2rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.5rem',
          overflowY: 'auto',
          borderTop: '1px solid var(--color-border)',
        }}>
          {NAV_LINKS.map(link => (
            <Link
              key={link.path}
              to={link.path}
              style={{
                padding: '1rem 0',
                fontSize: '1.1rem',
                fontWeight: 600,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: link.gold ? 'var(--color-gold)' : 'var(--color-text)',
                borderBottom: '1px solid var(--color-border)',
              }}
            >
              {link.label}
            </Link>
          ))}
        </div>
      )}

      <style>{`
        @media (max-width: 900px) {
          .desktop-nav { display: none !important; }
          .mobile-menu-btn { display: flex !important; }
        }
      `}</style>
    </>
  );
}
