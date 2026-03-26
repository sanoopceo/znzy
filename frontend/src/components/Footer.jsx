import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer style={{ backgroundColor: '#0a0a0a', color: '#fff', padding: '5rem 0 0' }}>
      <div className="container grid grid-cols-4" style={{ paddingBottom: '4rem', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>

        {/* Brand */}
        <div>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.2rem', fontWeight: 700, letterSpacing: '0.05em', marginBottom: '1rem', color: 'var(--color-gold)' }}>ZNZY</h2>
          <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.85rem', lineHeight: 1.8, maxWidth: '220px' }}>
            Luxury streetwear crafted for those who move with intent. Est. 2020, Mumbai.
          </p>
          <div style={{ marginTop: '1.5rem', display: 'flex', gap: '0.75rem' }}>
            {['IG', 'TW', 'PT'].map(s => (
              <a key={s} href="#" style={{ width: '34px', height: '34px', border: '1px solid rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.05em', color: 'rgba(255,255,255,0.5)', transition: 'all 0.2s' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--color-gold)'; e.currentTarget.style.color = 'var(--color-gold)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'; e.currentTarget.style.color = 'rgba(255,255,255,0.5)'; }}
              >{s}</a>
            ))}
          </div>
        </div>

        {/* Shop */}
        <div>
          <h3 style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '1.5rem', color: 'rgba(255,255,255,0.4)' }}>Shop</h3>
          <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {[
              { label: 'New In', path: '/new-in' },
              { label: 'Bestsellers', path: '/bestsellers' },
              { label: 'Collections', path: '/collections' },
              { label: 'Archive Sale', path: '/archive-sale' },
              { label: 'All Products', path: '/shop' },
            ].map(l => (
              <li key={l.path}>
                <Link to={l.path} style={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.88rem', transition: 'color 0.2s' }}
                  onMouseEnter={e => e.currentTarget.style.color = 'var(--color-gold)'}
                  onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.55)'}
                >{l.label}</Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Help */}
        <div>
          <h3 style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '1.5rem', color: 'rgba(255,255,255,0.4)' }}>Help</h3>
          <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {[
              { label: 'About Us', path: '/about' },
              { label: 'FAQ', path: '#' },
              { label: 'Shipping & Returns', path: '#' },
              { label: 'Contact Us', path: '#' },
              { label: 'Size Guide', path: '#' },
            ].map((l, i) => (
              <li key={i}>
                <Link to={l.path} style={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.88rem', transition: 'color 0.2s' }}
                  onMouseEnter={e => e.currentTarget.style.color = 'var(--color-gold)'}
                  onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.55)'}
                >{l.label}</Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Newsletter */}
        <div>
          <h3 style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '1.5rem', color: 'rgba(255,255,255,0.4)' }}>Exclusive Access</h3>
          <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.85rem', marginBottom: '1.25rem', lineHeight: 1.7 }}>
            Get early drop access, archive previews, and members-only offers.
          </p>
          <div style={{ display: 'flex' }}>
            <input
              type="email"
              placeholder="your@email.com"
              aria-label="Email"
              style={{
                flex: 1,
                padding: '0.75rem 1rem',
                border: '1px solid rgba(255,255,255,0.15)',
                borderRight: 'none',
                background: 'rgba(255,255,255,0.05)',
                color: '#fff',
                fontFamily: 'var(--font-main)',
                fontSize: '0.82rem',
                outline: 'none',
              }}
            />
            <button style={{
              padding: '0.75rem 1.25rem',
              backgroundColor: 'var(--color-gold)',
              color: '#0a0a0a',
              fontFamily: 'var(--font-main)',
              fontSize: '0.7rem',
              fontWeight: 700,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              cursor: 'pointer',
              border: 'none',
              whiteSpace: 'nowrap',
            }}>Join</button>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="container" style={{ padding: '1.75rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.78rem' }}>
          © {new Date().getFullYear()} ZNZY. All rights reserved.
        </p>
        <div style={{ display: 'flex', gap: '1.5rem' }}>
          {['Privacy Policy', 'Terms of Service', 'Cookie Policy'].map(t => (
            <a key={t} href="#" style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.78rem', transition: 'color 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.color = 'var(--color-gold)'}
              onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.3)'}
            >{t}</a>
          ))}
        </div>
      </div>
    </footer>
  );
}
