import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

const COLLECTIONS = [
  {
    id: 'summer-2026',
    title: 'Summer Drop 2026',
    subtitle: 'New Season',
    description: 'Lightweight fabrics, clean silhouettes, and bold proportions built for the heat.',
    img: 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=1200&q=80',
    link: '/new-in',
    pieces: '24 pieces',
  },
  {
    id: 'essentials',
    title: 'ZNZY Essentials',
    subtitle: 'Wardrobe Foundation',
    description: 'The permanent collection. Elevated basics designed to outlast every trend.',
    img: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=1200&q=80',
    link: '/shop',
    pieces: '18 pieces',
  },
  {
    id: 'limited',
    title: 'Limited Archive',
    subtitle: 'While Stock Lasts',
    description: 'Unearthed from past seasons. Each piece a statement. None will be restocked.',
    img: 'https://images.unsplash.com/photo-1485125639709-a60c3a500bf1?w=1200&q=80',
    link: '/archive-sale',
    pieces: '12 pieces',
    gold: true,
  },
  {
    id: 'monochrome',
    title: 'The Monochrome Edit',
    subtitle: 'Black & White Edition',
    description: 'A study in contrast. Every piece designed to exist in perfect harmony.',
    img: 'https://images.unsplash.com/photo-1509631179647-0c708bd226ee?w=1200&q=80',
    link: '/shop',
    pieces: '15 pieces',
  },
];

export default function CollectionsPage() {
  return (
    <div style={{ minHeight: '80vh', backgroundColor: 'var(--color-bg)' }}>
      {/* Header */}
      <div style={{ padding: '5rem 0 3rem', borderBottom: '1px solid var(--color-border)', textAlign: 'center', backgroundColor: 'var(--color-secondary)' }}>
        <span className="subtitle">Curated Drops</span>
        <div className="gold-rule centered" />
        <h1 className="title" style={{ marginBottom: '0.5rem' }}>Collections</h1>
        <p style={{ color: 'var(--color-text-light)', fontSize: '0.9rem', maxWidth: '500px', margin: '0 auto' }}>
          Each collection is a chapter. A moment in time captured in fabric, form, and intent.
        </p>
      </div>

      {/* Collection tiles — alternating layout */}
      <div>
        {COLLECTIONS.map((col, i) => (
          <div key={col.id} style={{
            display: 'grid',
            gridTemplateColumns: i % 2 === 0 ? '55% 45%' : '45% 55%',
            minHeight: '500px',
            borderBottom: '1px solid var(--color-border)',
          }}>
            {/* Image side */}
            <div style={{ order: i % 2 === 0 ? 0 : 1, overflow: 'hidden', position: 'relative', backgroundColor: '#111' }}>
              <img
                src={col.img}
                alt={col.title}
                style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.9, transition: 'transform 0.8s ease' }}
                onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.04)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
              />
              {col.gold && (
                <div style={{ position: 'absolute', top: '2rem', right: '2rem', backgroundColor: 'var(--color-gold)', padding: '0.5rem 1rem', color: '#0a0a0a', fontSize: '0.65rem', fontWeight: 800, letterSpacing: '0.15em', textTransform: 'uppercase' }}>
                  Limited
                </div>
              )}
            </div>

            {/* Content side */}
            <div style={{
              order: i % 2 === 0 ? 1 : 0,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              padding: '5rem 4rem',
              backgroundColor: i % 2 !== 0 ? 'var(--color-secondary)' : 'var(--color-bg)',
            }}>
              <span style={{ fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.25em', textTransform: 'uppercase', color: col.gold ? 'var(--color-gold)' : 'var(--color-text-light)', marginBottom: '1rem', display: 'block' }}>
                {col.subtitle} — {col.pieces}
              </span>
              <div className="gold-rule" />
              <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(2rem, 3vw, 3rem)', fontWeight: 600, lineHeight: 1.1, marginBottom: '1.5rem', color: 'var(--color-text)' }}>
                {col.title}
              </h2>
              <p style={{ color: 'var(--color-text-light)', lineHeight: 1.8, marginBottom: '2.5rem', fontSize: '0.95rem', maxWidth: '380px' }}>
                {col.description}
              </p>
              <Link
                to={col.link}
                className={col.gold ? 'btn btn-gold' : 'btn btn-outline'}
                style={{ alignSelf: 'flex-start', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
              >
                Explore Collection <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
