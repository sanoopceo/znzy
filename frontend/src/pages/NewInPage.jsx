import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const DUMMY = [
  { id: 1, name: 'Obsidian Oversized Tee', price: '85.00', category: 'Clothing', img: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=600&q=80' },
  { id: 2, name: 'Core Trench Coat', price: '295.00', category: 'Clothing', img: 'https://images.unsplash.com/photo-1539533113208-f6df8cc8b543?w=600&q=80' },
  { id: 3, name: 'Minimalist Oxford', price: '180.00', category: 'Footwear', img: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=600&q=80' },
  { id: 4, name: 'Silk Draped Blouse', price: '150.00', category: 'Clothing', img: 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=600&q=80' },
  { id: 5, name: 'Ribbed Knit Vest', price: '110.00', category: 'Clothing', img: 'https://images.unsplash.com/photo-1552902865-b72c031ac5ea?w=600&q=80' },
  { id: 6, name: 'Wide-Leg Trousers', price: '195.00', category: 'Clothing', img: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=600&q=80' },
  { id: 7, name: 'Leather Derby Shoe', price: '220.00', category: 'Footwear', img: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80' },
  { id: 8, name: 'Essential Hoodie', price: '120.00', category: 'Clothing', img: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=600&q=80' },
];

export default function NewInPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('/api/products/').then(({ data }) => {
      const list = data.products || data;
      setProducts(Array.isArray(list) ? list : []);
    }).catch(() => setProducts(DUMMY)).finally(() => setLoading(false));
  }, []);

  const display = products.length > 0 ? products : DUMMY;

  return (
    <div style={{ minHeight: '80vh', backgroundColor: 'var(--color-bg)' }}>
      {/* Page Header */}
      <div style={{ padding: '5rem 0 3rem', borderBottom: '1px solid var(--color-border)', textAlign: 'center', backgroundColor: 'var(--color-secondary)' }}>
        <span className="subtitle">Just Dropped</span>
        <div className="gold-rule centered" />
        <h1 className="title" style={{ marginBottom: '0.5rem' }}>New In</h1>
        <p style={{ color: 'var(--color-text-light)', fontSize: '0.9rem' }}>The latest arrivals from ZNZY — updated weekly.</p>
      </div>

      <div className="container" style={{ padding: '4rem 2rem' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--color-text-light)', letterSpacing: '0.2em', fontSize: '0.8rem' }}>LOADING…</div>
        ) : (
          <div className="grid grid-cols-4">
            {display.map((p, i) => (
              <Link key={p.id || p._id} to={`/product/${p.id || p._id}`} className="slide-up" style={{ display: 'block', animationDelay: `${i * 0.08}s`, opacity: 0, animationFillMode: 'forwards', color: 'inherit' }}>
                <ProductCard product={p} badge="NEW" />
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ProductCard({ product, badge }) {
  const images = product.images || [];
  const img = images.length > 0 ? (images[0].image_url || images[0].image) : (product.image || product.img);
  const [hover, setHover] = useState(false);

  return (
    <div onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}>
      <div style={{ overflow: 'hidden', backgroundColor: 'var(--color-secondary)', position: 'relative', aspectRatio: '3/4', borderRadius: '2px', marginBottom: '1rem' }}>
        {badge && (
          <span style={{ position: 'absolute', top: '1rem', left: '1rem', zIndex: 2, backgroundColor: 'var(--color-gold)', color: '#0a0a0a', fontSize: '0.6rem', fontWeight: 800, letterSpacing: '0.15em', padding: '0.3rem 0.6rem', textTransform: 'uppercase' }}>
            {badge}
          </span>
        )}
        {img && <img src={img} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.6s ease', transform: hover ? 'scale(1.06)' : 'scale(1)' }} />}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h3 style={{ fontSize: '0.88rem', fontWeight: 600, marginBottom: '0.2rem' }}>{product.name}</h3>
          <span style={{ fontSize: '0.75rem', color: 'var(--color-text-light)' }}>{product.category || 'ZNZY'}</span>
        </div>
        <span style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--color-gold)' }}>${product.price}</span>
      </div>
    </div>
  );
}
