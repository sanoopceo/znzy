import { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { ArrowRight, Play } from 'lucide-react';

const COLLECTIONS = [
  {
    id: 'summer',
    title: 'Summer Drop 2026',
    subtitle: 'New Season',
    img: 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?ixlib=rb-4.0.3&auto=format&fit=crop&w=900&q=80',
    link: '/collections',
    span: 2,
  },
  {
    id: 'essentials',
    title: 'ZNZY Essentials',
    subtitle: 'Timeless Wardrobe',
    img: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
    link: '/collections',
    span: 1,
  },
  {
    id: 'limited',
    title: 'Limited Archive',
    subtitle: 'While Stock Lasts',
    img: 'https://images.unsplash.com/photo-1485125639709-a60c3a500bf1?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
    link: '/archive-sale',
    span: 1,
    gold: true,
  },
];

const LOOKBOOK = [
  'https://pub-1407f82391df4ab1951418d04be76914.r2.dev/uploads/a59503f6-a141-44dc-a5dc-a8c47f7deb1b.png',
  'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=500&q=80',
  'https://pub-1407f82391df4ab1951418d04be76914.r2.dev/uploads/27d00445-a435-44b5-86fa-c3878cb9b61c.png',
  'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=500&q=80',
  'https://images.unsplash.com/photo-1581044777550-4cfa60707c03?w=500&q=80',
  'https://images.unsplash.com/photo-1536766768598-e09213fdcf22?w=500&q=80',
];

export default function HomePage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('/api/products/').then(({ data }) => {
      const list = data.products || data;
      setProducts(Array.isArray(list) ? list.slice(0, 8) : []);
    }).catch(() => setProducts([])).finally(() => setLoading(false));
  }, []);

  return (
    <div>
      {/* ── HERO ── */}
      <section style={{ position: 'relative', height: '92vh', overflow: 'hidden', display: 'flex', alignItems: 'flex-end' }}>
        <img
          src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80"
          alt="Hero"
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
        />
        {/* Dark gradient overlay */}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.2) 50%, transparent 100%)' }} />

        <div style={{ position: 'relative', zIndex: 2, padding: '0 2rem 5rem 2rem', maxWidth: '1600px', margin: '0 auto', width: '100%' }}>
          <span className="fade-in" style={{ display: 'inline-block', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.3em', textTransform: 'uppercase', color: 'var(--color-gold)', marginBottom: '1.2rem' }}>
            Spring / Summer 2026
          </span>
            <h1
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: 'clamp(3.5rem, 9vw, 8rem)',
                fontWeight: 700,
                color: '#fff',
                lineHeight: 0.95,
                letterSpacing: '-0.02em',
                marginBottom: '2rem',
                maxWidth: '700px',
              }}
            >
              Redefine<br />Classic.
            </h1>
          <p
             className="fade-in"
             style={{ color: 'rgba(255,255,255,0.75)', fontSize: '1rem', fontWeight: 300, maxWidth: '420px', marginBottom: '2.5rem', lineHeight: 1.7, animationDelay: '0.2s', opacity: 0, animationFillMode: 'forwards' }}
          >
            A new season of bold minimalism. Crafted for those who move through the world with intent.
          </p>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', animationDelay: '0.4s' }} className="fade-in">
            <Link to="/new-in" className="btn btn-gold">
              Shop New In <ArrowRight size={15} style={{ marginLeft: '0.5rem' }} />
            </Link>
            <Link to="/collections" className="btn" style={{ color: '#fff', border: '1px solid rgba(255,255,255,0.5)', backdropFilter: 'blur(4px)' }}>
              View Collections
            </Link>
          </div>
        </div>
      </section>

      {/* ── NEW IN STRIP ── */}
      <section style={{ padding: '6rem 0', backgroundColor: 'var(--color-bg)' }}>
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '3rem' }}>
            <div>
              <span className="subtitle">
                Just Dropped
              </span>
              <div className="gold-rule" />
              <h2 className="title" style={{ marginBottom: 0 }}>
                New In
              </h2>
            </div>
            <Link to="/new-in" style={{ fontSize: '0.78rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-gold)', display: 'flex', alignItems: 'center', gap: '0.4rem', borderBottom: '1px solid var(--color-gold)', paddingBottom: '0.15rem' }}>
              View All <ArrowRight size={13} />
            </Link>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--color-text-light)', fontSize: '0.9rem', letterSpacing: '0.1em' }}>LOADING…</div>
          ) : products.length === 0 ? (
            /* Dummy fallback cards */
            <div className="grid grid-cols-4">
              {[
                { id: 1, name: 'Obsidian Hoodie', price: '120.00', img: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=600&q=80' },
                { id: 2, name: 'Core Trench Coat', price: '295.00', img: 'https://images.unsplash.com/photo-1539533113208-f6df8cc8b543?w=600&q=80' },
                { id: 3, name: 'Minimalist Oxford', price: '180.00', img: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=600&q=80' },
                { id: 4, name: 'Silk Draped Blouse', price: '150.00', img: 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=600&q=80' },
              ].map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          ) : (
            <div className="grid grid-cols-4">
              {products.slice(0, 4).map(p => <ProductCard key={p.id || p._id} product={p} />)}
            </div>
          )}
        </div>
      </section>

      {/* ── COLLECTIONS GRID ── */}
      <section style={{ padding: '0 0 6rem 0', backgroundColor: 'var(--color-bg)' }}>
        <div className="container">
          <div className="section-header">
            <span className="subtitle">Curated Drops</span>
            <div className="gold-rule centered" />
            <h2 className="title">Collections</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }}>
            {COLLECTIONS.map((col, i) => (
              <Link
                key={col.id}
                to={col.link}
                style={{
                  gridColumn: i === 0 ? 'span 2' : 'span 1',
                  position: 'relative',
                  overflow: 'hidden',
                  aspectRatio: i === 0 ? '16/9' : '4/5',
                  display: 'block',
                  borderRadius: '2px',
                  backgroundColor: '#111',
                }}
                className="collection-tile"
              >
                <img src={col.img} alt={col.title} style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.8, transition: 'transform 0.7s ease, opacity 0.4s ease' }} className="col-img" />
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 60%)', zIndex: 1 }} />
                <div style={{ position: 'absolute', bottom: '2rem', left: '2rem', zIndex: 2, color: '#fff' }}>
                  <span style={{ fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: col.gold ? 'var(--color-gold)' : 'rgba(255,255,255,0.7)', display: 'block', marginBottom: '0.5rem' }}>{col.subtitle}</span>
                  <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: i === 0 ? '2.2rem' : '1.6rem', fontWeight: 600, lineHeight: 1.1 }}>{col.title}</h3>
                </div>
              </Link>
            ))}
          </div>
        </div>
        <style>{`.collection-tile:hover .col-img { transform: scale(1.05); opacity: 1; }`}</style>
      </section>

      {/* ── BRAND STORY TEASER ── */}
      <section style={{ backgroundColor: 'var(--color-primary)', color: 'var(--color-bg)', padding: '8rem 0' }}>
        <div className="container" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6rem', alignItems: 'center' }}>
          <div>
            <span style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.25em', textTransform: 'uppercase', color: 'var(--color-gold)', marginBottom: '1.5rem' }}>Our Identity</span>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(2rem, 4vw, 3.5rem)', fontWeight: 600, lineHeight: 1.05, marginBottom: '2rem', color: 'inherit' }}>
              Born from the intersection of street culture and luxury craft.
            </h2>
            <div style={{ color: 'rgba(255,255,255,0.6)', lineHeight: 1.9, marginBottom: '2.5rem', fontSize: '0.95rem' }}>
              ZNZY is not a brand. It&apos;s a movement. Each piece is designed with a singular intention — to be worn by those who refuse to be invisible. From concept to stitch, every garment carries our obsession with detail, form, and cultural rebellion.
            </div>
            <Link to="/about" className="btn btn-outline-gold">
              Read Our Story <ArrowRight size={14} style={{ marginLeft: '0.5rem' }} />
            </Link>
          </div>
          <div style={{ position: 'relative', aspectRatio: '3/4', overflow: 'hidden' }}>
            <img
              src="https://pub-1407f82391df4ab1951418d04be76914.r2.dev/uploads/a59503f6-a141-44dc-a5dc-a8c47f7deb1b.png"
              alt="ZNZY Brand"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
            <div style={{ position: 'absolute', bottom: '2rem', right: '-1rem', backgroundColor: 'var(--color-gold)', padding: '1.5rem 2rem', color: '#0a0a0a' }}>
              <div style={{ fontSize: '2rem', fontWeight: 800, fontFamily: 'var(--font-serif)', lineHeight: 1 }}>2020</div>
              <div style={{ fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', marginTop: '0.25rem' }}>Est. Mumbai</div>
            </div>
          </div>
        </div>
      </section>

      {/* ── LOOKBOOK / INSTAGRAM GRID ── */}
      <section style={{ padding: '6rem 0', backgroundColor: 'var(--color-bg)' }}>
        <div className="container">
          <div className="section-header">
            <span className="subtitle">Community</span>
            <div className="gold-rule centered" />
            <h2 className="title">#ZNZYWorld</h2>
            <p style={{ color: 'var(--color-text-light)', maxWidth: '500px', margin: '0 auto', fontSize: '0.9rem' }}>
              Tag @znzy on Instagram for a chance to be featured in our next campaign.
            </p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '0.5rem' }}>
            {LOOKBOOK.map((src, i) => (
              <div key={i} style={{ aspectRatio: '1/1', overflow: 'hidden', position: 'relative', cursor: 'pointer' }}
                className="lookbook-tile"
              >
                <img src={src} alt={`#ZNZYWorld ${i + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s ease' }} className="lb-img" />
              </div>
            ))}
          </div>
        </div>
        <style>{`.lookbook-tile:hover .lb-img { transform: scale(1.08); }`}</style>
      </section>

      {/* ── CAMPAIGN STRIP ── */}
      <section style={{ position: 'relative', overflow: 'hidden', height: '380px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#0a0a0a' }}>
        <img
          src="https://images.unsplash.com/photo-1536766768598-e09213fdcf22?w=2000&q=80"
          alt="Campaign"
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.35 }}
        />
        <div style={{ position: 'relative', zIndex: 2, textAlign: 'center', color: '#fff', padding: '0 2rem' }}>
          <p style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.3em', textTransform: 'uppercase', color: 'var(--color-gold)', marginBottom: '1rem' }}>ZNZY World</p>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(1.8rem, 4vw, 3.2rem)', fontWeight: 600, lineHeight: 1.15, marginBottom: '2rem' }}>
            "Worn by the bold.<br />Loved by the few."
          </h2>
          <Link to="/shop" className="btn btn-gold">
            Shop The Collection
          </Link>
        </div>
      </section>
    </div>
  );
}

function ProductCard({ product }) {
  const images = product.images || [];
  const img = images.length > 0 ? (images[0].image_url || images[0].image) : (product.image || product.img);
  const id = product.id || product._id;
  const [hover, setHover] = useState(false);

  return (
    <Link
      to={`/product/${id}`}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{ display: 'block', color: 'inherit' }}
    >
      <div style={{
        overflow: 'hidden',
        backgroundColor: 'var(--color-secondary)',
        position: 'relative',
        aspectRatio: '3/4',
        borderRadius: '2px',
        marginBottom: '1rem',
      }}>
        {img && <img src={img} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.6s ease', transform: hover ? 'scale(1.06)' : 'scale(1)' }} />}
        <div style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          padding: '0.75rem',
          background: 'linear-gradient(to top, rgba(0,0,0,0.5), transparent)',
          opacity: hover ? 1 : 0,
          transition: 'opacity 0.3s ease',
        }}>
          <span style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#fff', border: '1px solid rgba(255,255,255,0.5)', padding: '0.35rem 0.75rem' }}>
            Quick View
          </span>
        </div>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h3 style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '0.2rem', letterSpacing: '0.02em' }}>{product.name}</h3>
          <span style={{ fontSize: '0.75rem', color: 'var(--color-text-light)', textTransform: 'capitalize' }}>{product.category || 'ZNZY'}</span>
        </div>
        <span style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--color-gold)', whiteSpace: 'nowrap' }}>${product.price}</span>
      </div>
    </Link>
  );
}
