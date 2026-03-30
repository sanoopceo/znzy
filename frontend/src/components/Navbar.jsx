import { useContext, useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { StoreContext } from '../context/StoreContext';
import { ShoppingBag, User, Moon, Sun, Search, X, Menu, ChevronDown, Bell } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import MarqueeBanner from './MarqueeBanner';

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
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [recentSearches, setRecentSearches] = useState([]);
  
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);

  const searchRef = useRef(null);
  const userMenuRef = useRef(null);
  const notifRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  const cartCount = cartItems.reduce((a, c) => a + (c.qty || 1), 0);
  const unreadCount = notifications.filter(n => !n.is_read).length;

  const fetchNotifications = async () => {
    if (!userInfo) return;
    try {
      const res = await axios.get('/api/orders/notifications/', {
        headers: { Authorization: `Bearer ${userInfo.token}` }
      });
      setNotifications(res.data);
    } catch (e) {}
  };

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll);
    
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000); // Polling every 30s

    return () => {
       window.removeEventListener('scroll', onScroll);
       clearInterval(interval);
    };
  }, [userInfo, location.pathname]);

  useEffect(() => {
    setMobileOpen(false);
    setShowDropdown(false);
    setUserMenuOpen(false);
    setNotifOpen(false);
    setSelectedIndex(-1);
  }, [location.pathname]);

  // Load Recent Searches
  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem('znzy_recent_searches') || '[]');
    setRecentSearches(stored);
  }, []);

  // Debounced Search Suggestions
  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchQuery.length >= 2) {
        try {
          const { data } = await axios.get(`/api/products/search/suggestions/?q=${searchQuery}`);
          setSuggestions(data);
          setShowDropdown(true);
        } catch (e) {
          setSuggestions([]);
        }
      } else {
        setSuggestions([]);
      }
    }, 400);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearch = (q) => {
    const term = q || searchQuery;
    if (!term.trim()) return;
    
    // Save to Recent
    const updated = [term.trim(), ...recentSearches.filter(s => s !== term.trim())].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem('znzy_recent_searches', JSON.stringify(updated));

    setShowDropdown(false);
    navigate(`/shop?keyword=${encodeURIComponent(term.trim())}`);
    setSearchQuery('');
  };

  const onKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev < suggestions.length - 1 ? prev + 1 : prev));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev > -1 ? prev - 1 : prev));
    } else if (e.key === 'Enter') {
      if (selectedIndex >= 0 && suggestions[selectedIndex]) {
        navigate(`/product/${suggestions[selectedIndex].id}`);
        setShowDropdown(false);
      } else {
        handleSearch();
      }
    } else if (e.key === 'Escape') {
      setShowDropdown(false);
    }
  };
  const toggleTheme = () => dispatch({ type: 'TOGGLE_THEME' });

  const markRead = async (id) => {
     try {
       await axios.put(`/api/orders/notifications/${id}/read/`, {}, {
          headers: { Authorization: `Bearer ${userInfo.token}` }
       });
       setNotifications(notifications.map(n => n.id === id ? { ...n, is_read: true } : n));
     } catch (e) {}
  };

  const isHome = location.pathname === '/';
  const isTransparent = isHome && !scrolled;
  const navBg = isTransparent ? 'transparent' : 'var(--color-bg)';
  const navColor = isTransparent ? '#ffffff' : 'var(--color-text)';
  const navBorder = isTransparent ? '1px solid rgba(255,255,255,0.1)' : '1px solid var(--color-border)';
  const navShadow = scrolled ? '0 10px 40px rgba(0,0,0,0.1)' : 'none';

  return (
    <>
      <header style={{
        position: 'fixed',
        left: 0, right: 0, top: 0,
        zIndex: 1000,
        transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        backgroundColor: navBg,
        boxShadow: navShadow,
      }}>
        <MarqueeBanner />
        
        <div style={{
          borderBottom: navBorder,
          height: '75px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0 3rem', maxWidth: '1600px', margin: '0 auto', transition: 'border 0.4s ease'
        }}>
          {/* LOGO */}
          <Link to="/" style={{ display: 'flex', alignItems: 'center' }}>
            <span style={{ fontFamily: 'var(--font-serif)', fontSize: '2.4rem', fontWeight: 700, letterSpacing: '0.05em', color: navColor, transition: 'color 0.4s ease' }}>ZNZY</span>
          </Link>

          {/* DESKTOP LINKS */}
          <nav className="desktop-nav" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            {NAV_LINKS.map(link => (
              <Link key={link.path} to={link.path} style={{ padding: '0.5rem 0.8rem', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: link.gold ? 'var(--color-gold)' : (location.pathname === link.path ? navColor : (isTransparent ? 'rgba(255,255,255,0.8)' : 'var(--color-text-light)')), borderBottom: location.pathname === link.path ? `1px solid ${link.gold ? 'var(--color-gold)' : navColor}` : '1px solid transparent', transition: 'all 0.3s ease', whiteSpace: 'nowrap' }}>
                {link.label}
              </Link>
            ))}
          </nav>

          {/* ICONS CONTAINER */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', color: navColor }}>
            
             {/* AMAZON-STYLE SEARCH BAR */}
            <div className="search-container" ref={searchRef} style={{ flex: 1, maxWidth: '400px', margin: '0 2rem', position: 'relative' }}>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                    <Search size={18} style={{ position: 'absolute', left: '1.2rem', color: '#999', pointerEvents: 'none' }} />
                    <input 
                        type="text"
                        placeholder="Search for products, brands and more..."
                        style={{
                            width: '100%',
                            padding: '0.8rem 1rem 0.8rem 3rem',
                            borderRadius: '50px',
                            backgroundColor: 'var(--color-secondary)',
                            border: '1px solid var(--color-border)',
                            color: 'var(--color-text)',
                            fontSize: '0.85rem',
                            outline: 'none',
                            transition: 'all 0.3s ease'
                        }}
                        value={searchQuery}
                        onChange={e => { setSearchQuery(e.target.value); setShowDropdown(true); setSelectedIndex(-1); }}
                        onFocus={() => setShowDropdown(true)}
                        onKeyDown={onKeyDown}
                    />
                    {searchQuery && (
                        <X 
                            size={16} 
                            style={{ position: 'absolute', right: '1.2rem', cursor: 'pointer', color: '#999' }} 
                            onClick={() => { setSearchQuery(''); setSuggestions([]); }}
                        />
                    )}
                </div>

                <AnimatePresence>
                    {showDropdown && (searchQuery.length >= 2 || recentSearches.length > 0) && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 10 }}
                            className="search-dropdown glass"
                            style={{
                                position: 'absolute', top: '110%', left: 0, right: 0,
                                background: 'var(--color-bg)',
                                border: '1px solid var(--color-border)',
                                borderRadius: '12px',
                                boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
                                zIndex: 1000,
                                overflow: 'hidden'
                            }}
                        >
                            {/* Suggestions */}
                            {suggestions.length > 0 ? (
                                <div style={{ padding: '0.5rem 0' }}>
                                    <div style={{ padding: '0.8rem 1.5rem', fontSize: '0.65rem', fontWeight: 800, color: 'var(--color-gold)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Suggestions</div>
                                    {suggestions.map((item, idx) => (
                                        <div 
                                            key={item.id}
                                            onClick={() => navigate(`/product/${item.id}`)}
                                            onMouseEnter={() => setSelectedIndex(idx)}
                                            style={{
                                                padding: '0.8rem 1.5rem',
                                                display: 'flex', alignItems: 'center', gap: '1rem',
                                                cursor: 'pointer',
                                                backgroundColor: selectedIndex === idx ? 'var(--color-secondary)' : 'transparent',
                                                transition: 'background 0.2s ease'
                                            }}
                                        >
                                            <img src={item.main_image} alt="" style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px' }} />
                                            <div style={{ flex: 1 }}>
                                                <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>{item.name}</div>
                                                <div style={{ fontSize: '0.75rem', color: 'var(--color-gold)' }}>₹{item.price}</div>
                                            </div>
                                        </div>
                                    ))}
                                    <div 
                                        onClick={() => handleSearch()}
                                        style={{ padding: '1rem 1.5rem', borderTop: '1px solid var(--color-border)', fontSize: '0.8rem', fontWeight: 700, textAlign: 'center', cursor: 'pointer', color: 'var(--color-text-light)' }}
                                    >
                                        See all results for "{searchQuery}"
                                    </div>
                                </div>
                            ) : searchQuery.length >= 2 ? (
                                <div style={{ padding: '2rem', textAlign: 'center', fontSize: '0.8rem', color: '#888' }}>
                                    No products found for "{searchQuery}"
                                </div>
                            ) : null}

                            {/* Recent Searches */}
                            {recentSearches.length > 0 && searchQuery.length < 2 && (
                                <div style={{ padding: '0.5rem 0' }}>
                                    <div style={{ padding: '0.8rem 1.5rem', fontSize: '0.65rem', fontWeight: 800, color: 'var(--color-text-light)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Recent Searches</div>
                                    {recentSearches.map((s, idx) => (
                                        <div 
                                            key={s}
                                            onClick={() => handleSearch(s)}
                                            style={{
                                                padding: '0.8rem 1.5rem',
                                                display: 'flex', alignItems: 'center', gap: '1rem',
                                                cursor: 'pointer',
                                                backgroundColor: selectedIndex === idx ? 'var(--color-secondary)' : 'transparent'
                                            }}
                                        >
                                            <Search size={14} color="#ccc" />
                                            <span style={{ fontSize: '0.85rem' }}>{s}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>            
            {/* Notification Bell */}
            {userInfo && (
               <div ref={notifRef} style={{ position: 'relative' }}>
                  <Bell size={20} style={{ cursor: 'pointer' }} onClick={() => setNotifOpen(!notifOpen)} />
                  {unreadCount > 0 && <span style={{ position: 'absolute', top: '-5px', right: '-5px', padding: '0.2rem', background: 'var(--color-gold)', borderRadius: '50%', border: '2px solid var(--color-bg)', minWidth: '10px', height: '10px' }}></span>}
                  {notifOpen && (
                     <div className="user-dropdown visible" style={{ top: '40px', right: '-50px', width: '320px', padding: '1.5rem', boxShadow: '20px 20px 80px rgba(0,0,0,0.1)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid #f0f0f0', paddingBottom: '0.8rem' }}>
                           <div style={{ fontWeight: 800, fontSize: '0.75rem', letterSpacing: '0.1em' }}>ALERTS ({unreadCount})</div>
                           <button onClick={fetchNotifications} style={{ fontSize: '0.65rem', color: 'var(--color-gold)', fontWeight: 700 }}>REFRESH</button>
                        </div>
                        <div style={{ maxHeight: '350px', overflowY: 'auto' }}>
                          {notifications.length === 0 ? (
                             <div style={{ fontSize: '0.75rem', color: '#888', textAlign: 'center', padding: '2rem' }}>
                                <Bell size={30} style={{ margin: '0 auto 1rem', opacity: 0.2 }} />
                                No pending alerts
                             </div>
                          ) : notifications.map(n => (
                             <div 
                               key={n.id} 
                               onClick={() => markRead(n.id)}
                               style={{ display: 'block', padding: '1rem 0', borderBottom: '1px solid #f9f9f9', fontSize: '0.8rem', cursor: 'pointer', transition: 'var(--transition-fast)' }}
                             >
                                <div style={{ fontWeight: n.is_read ? 400 : 700, display: 'flex', gap: '1rem' }}>
                                   <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: n.is_read ? 'transparent' : 'var(--color-gold)', marginTop: '0.3rem' }} />
                                   <div style={{ flex: 1 }}>
                                      <div style={{ color: n.is_read ? '#888' : 'var(--color-text)', marginBottom: '0.2rem' }}>{n.title}</div>
                                      <div style={{ fontSize: '0.7rem', color: '#aaa', fontWeight: 400 }}>{n.message}</div>
                                      <div style={{ fontSize: '0.6rem', color: '#ddd', marginTop: '0.4rem' }}>{new Date(n.created_at).toLocaleTimeString()}</div>
                                   </div>
                                </div>
                             </div>
                          ))}
                        </div>
                        <Link to="/profile" onClick={() => setNotifOpen(false)} style={{ display: 'block', textAlign: 'center', fontSize: '0.7rem', marginTop: '1.2rem', color: 'var(--color-text)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Notification Center</Link>
                     </div>
                  )}
               </div>
            )}

            <div onClick={toggleTheme} style={{ cursor: 'pointer' }}>
               {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            </div>

            <div ref={userMenuRef} style={{ position: 'relative' }}>
              <User size={20} style={{ cursor: 'pointer' }} onClick={() => setUserMenuOpen(!userMenuOpen)} />
              {userMenuOpen && (
                <div className="user-dropdown visible" style={{ top: '40px', right: 0 }}>
                  {userInfo ? (
                    <>
                      <Link to="/profile" style={{ fontWeight: 700 }}>DASHBOARD</Link>
                      <button onClick={() => { dispatch({ type: 'USER_LOGOUT' }); localStorage.removeItem('userInfo'); navigate('/login'); }} style={{ color: '#ff4d4f' }}>SIGN OUT</button>
                    </>
                  ) : (
                    <Link to="/login">ACCESS ACCOUNT</Link>
                  )}
                </div>
              )}
            </div>

            <Link to="/cart" style={{ position: 'relative' }}>
              <ShoppingBag size={22} />
              {cartCount > 0 && (
                <span style={{ position: 'absolute', top: '-8px', right: '-10px', background: 'var(--color-gold)', color: '#000', fontSize: '0.6rem', fontWeight: 800, width: '18px', height: '18px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {cartCount}
                </span>
              )}
            </Link>

            <Menu size={24} className="mobile-menu-btn" onClick={() => setMobileOpen(true)} style={{ display: 'none', cursor: 'pointer' }} />
          </div>
        </div>
      </header>

      {/* MOBILE NAV OVERLAY */}
      {mobileOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'var(--color-bg)', zIndex: 1100, padding: '3rem' }}>
           <X size={30} style={{ position: 'absolute', top: '2rem', right: '2rem' }} onClick={() => setMobileOpen(false)} />
           <div style={{ marginTop: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {NAV_LINKS.map(l => (
                <Link key={l.path} to={l.path} style={{ fontSize: '1.5rem', fontWeight: 800, textTransform: 'uppercase', borderBottom: '1px solid #eee', paddingBottom: '0.5rem' }}>
                   {l.label}
                </Link>
              ))}
           </div>
        </div>
      )}



      <style>{`
        @media (max-width: 1100px) {
          .desktop-nav { display: none !important; }
          .mobile-menu-btn { display: flex !important; }
        }
      `}</style>
    </>
  );
}
