import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const DUMMY = [
  { id: 1, name: 'Obsidian Hoodie', price: '68.00', originalPrice: '120.00', category: 'Clothing', img: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=600&q=80' },
  { id: 2, name: 'Core Trench Coat', price: '149.00', originalPrice: '295.00', category: 'Clothing', img: 'https://images.unsplash.com/photo-1539533113208-f6df8cc8b543?w=600&q=80' },
  { id: 3, name: 'Oxford Shoe', price: '95.00', originalPrice: '180.00', category: 'Footwear', img: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=600&q=80' },
  { id: 4, name: 'Silk Blouse', price: '72.00', originalPrice: '150.00', category: 'Clothing', img: 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=600&q=80' },
  { id: 5, name: 'Ribbed Knit Vest', price: '55.00', originalPrice: '110.00', category: 'Clothing', img: 'https://images.unsplash.com/photo-1552902865-b72c031ac5ea?w=600&q=80' },
  { id: 6, name: 'Wide-Leg Trousers', price: '98.00', originalPrice: '195.00', category: 'Clothing', img: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=600&q=80' },
];

export default function ArchiveSalePage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('/api/products/').then(({ data }) => {
      const list = data.products || data;
      setProducts(Array.isArray(list) ? list : []);
    }).catch(() => setProducts(DUMMY)).finally(() => setLoading(false));
  }, []);

  const display = products.length > 0
    ? products.map(p => ({ ...p, originalPrice: (parseFloat(p.price) * 1.6).toFixed(2) }))
    : DUMMY;

  const getDiscount = (orig, sale) => Math.round(((orig - sale) / orig) * 100);

  return (
    <div style={{ minHeight: '80vh', backgroundColor: 'var(--color-bg)' }}>
      {/* Bold Sale Banner */}
      <div style={{
        backgroundColor: '#0a0a0a',
        color: '#fff',
        padding: '5rem 2rem 3rem',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', inset: 0, background: `repeating-linear-gradient(45deg, rgba(201,168,76,0.04) 0px, rgba(201,168,76,0.04) 1px, transparent 1px, transparent 12px)` }} />
        <span className="subtitle" style={{ position: 'relative' }}>Final Clearance</span>
        <div className="gold-rule centered" />
        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(3rem, 7vw, 6rem)', fontWeight: 700, color: 'var(--color-gold)', lineHeight: 1, marginBottom: '0.5rem', position: 'relative' }}>
          Archive Sale
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem', position: 'relative' }}>
          Past season pieces — marked down. None will be restocked.
        </p>
      </div>

      <div className="container" style={{ padding: '4rem 2rem' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--color-text-light)', letterSpacing: '0.2em', fontSize: '0.8rem' }}>LOADING…</div>
        ) : (
          <div className="grid grid-cols-3">
            {display.map((p, i) => {
              const orig = parseFloat(p.originalPrice);
              const sale = parseFloat(p.price);
              const disc = getDiscount(orig, sale);
              const img = p.image || p.img;
              const id = p.id || p._id;
              return (
                <Link key={id} to={`/product/${id}`} className="slide-up" style={{ display: 'block', animationDelay: `${i * 0.08}s`, opacity: 0, animationFillMode: 'forwards', color: 'inherit' }}>
                  <SaleCard product={p} img={img} disc={disc} orig={orig} sale={sale} />
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function SaleCard({ product, img, disc, orig, sale }) {
  const [hover, setHover] = useState(false);
  return (
    <div onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}>
      <div style={{ overflow: 'hidden', backgroundColor: 'var(--color-secondary)', position: 'relative', aspectRatio: '3/4', borderRadius: '2px', marginBottom: '1rem' }}>
        <span style={{ position: 'absolute', top: '1rem', left: '1rem', zIndex: 2, backgroundColor: '#c0392b', color: '#fff', fontSize: '0.6rem', fontWeight: 800, letterSpacing: '0.1em', padding: '0.3rem 0.65rem', textTransform: 'uppercase' }}>
          -{disc}%
        </span>
        {img && <img src={img} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.6s ease', transform: hover ? 'scale(1.06)' : 'scale(1)' }} />}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h3 style={{ fontSize: '0.88rem', fontWeight: 600, marginBottom: '0.2rem' }}>{product.name}</h3>
          <span style={{ fontSize: '0.75rem', color: 'var(--color-text-light)' }}>{product.category || 'ZNZY'}</span>
        </div>
        <div style={{ textAlign: 'right' }}>
          <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--color-text-light)', textDecoration: 'line-through', marginBottom: '0.1rem' }}>${orig.toFixed(2)}</span>
          <span style={{ fontWeight: 700, fontSize: '0.95rem', color: '#c0392b' }}>${sale.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
}
