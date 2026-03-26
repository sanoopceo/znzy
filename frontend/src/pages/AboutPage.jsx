import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import EditableContent from '../components/EditableContent';

const VALUES = [
  { icon: '◆', title: 'Craft First', body: 'Every stitch is intentional. We partner only with manufacturers who share our obsession for detail and material integrity.' },
  { icon: '◆', title: 'Cult, Not Mass', body: 'ZNZY intentionally limits production. Scarcity is not a strategy — it is a respect for the person wearing our work.' },
  { icon: '◆', title: 'Cultural Roots', body: 'Built in Mumbai. Inspired by the streets. Every collection carries the DNA of a city that never stops moving.' },
];

const TEAM = [
  { name: 'Zia Nair', role: 'Founder & Creative Director', img: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=500&q=80' },
  { name: 'Yara Sethi', role: 'Head of Design', img: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=500&q=80' },
];

export default function AboutPage() {
  return (
    <div style={{ backgroundColor: 'var(--color-bg)' }}>

      {/* ── HERO ── */}
      <section style={{ position: 'relative', height: '70vh', overflow: 'hidden', display: 'flex', alignItems: 'center', backgroundColor: '#0a0a0a' }}>
        <img
          src="https://images.unsplash.com/photo-1536766768598-e09213fdcf22?w=2000&q=80"
          alt="ZNZY Brand Story"
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.35 }}
        />
        <div style={{ position: 'relative', zIndex: 2, padding: '0 2rem', maxWidth: '1600px', margin: '0 auto', width: '100%' }}>
          <span style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.3em', textTransform: 'uppercase', color: 'var(--color-gold)', marginBottom: '1.5rem' }}>
            Est. 2020 — Mumbai
          </span>
          <h1 className="fade-in" style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(3rem, 7vw, 6rem)', fontWeight: 700, color: '#fff', lineHeight: 0.95, letterSpacing: '-0.02em', maxWidth: '700px' }}>
            <EditableContent contentKey="about_hero_title" defaultContent={<>We Build<br />Cult Fashion.</>} />
          </h1>
        </div>
      </section>

      {/* ── MANIFESTO ── */}
      <section style={{ padding: '8rem 0', borderBottom: '1px solid var(--color-border)' }}>
        <div className="container" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6rem', alignItems: 'center' }}>
          <div>
            <span className="subtitle">The Story</span>
            <div className="gold-rule" />
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(2rem, 3.5vw, 3rem)', fontWeight: 600, lineHeight: 1.1, marginBottom: '2rem' }}>
              <EditableContent contentKey="about_story_title" defaultContent="Born from the intersection of street culture and luxury craft." />
            </h2>
            <div style={{ color: 'var(--color-text-light)', lineHeight: 1.9, marginBottom: '1.5rem', fontSize: '0.95rem' }}>
                <EditableContent contentKey="about_story_p1" defaultContent="ZNZY began in 2020 out of a single belief: that the most powerful fashion exists at the boundary between worlds. Between streetwear and tailoring. Between tradition and rebellion. Between Mumbai's raw energy and the quiet precision of European craft." />
            </div>
            <div style={{ color: 'var(--color-text-light)', lineHeight: 1.9, fontSize: '0.95rem' }}>
                <EditableContent contentKey="about_story_p2" defaultContent="Our founder, Zia Nair, started the brand with one hook-up tee and a mission: to create garments that feel like armour. That give the person wearing them a quiet, unshakeable confidence. Every piece we release is designed with that singular intention." />
            </div>
          </div>
          <div style={{ position: 'relative' }}>
            <img
              src="https://in.pinterest.com/pin/133707488997190709/"
              alt="ZNZY Founder"
              style={{ width: '100%', aspectRatio: '3/4', objectFit: 'cover', borderRadius: '2px' }}
            />
            <div style={{ position: 'absolute', bottom: '-1.5rem', right: '-1.5rem', backgroundColor: 'var(--color-gold)', padding: '2rem', color: '#0a0a0a', width: '180px' }}>
              <div style={{ fontFamily: 'var(--font-serif)', fontSize: '3rem', fontWeight: 700, lineHeight: 1 }}>5+</div>
              <div style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', marginTop: '0.5rem' }}>Years of Design</div>
            </div>
          </div>
        </div>
      </section>

      {/* ── VALUES ── */}
      <section style={{ padding: '7rem 0', backgroundColor: 'var(--color-secondary)', borderBottom: '1px solid var(--color-border)' }}>
        <div className="container">
          <div className="section-header">
            <span className="subtitle">What We Stand For</span>
            <div className="gold-rule centered" />
            <h2 className="title">Our Values</h2>
          </div>
          <div className="grid grid-cols-3">
            {VALUES.map((v, i) => (
              <div key={i} className="slide-up" style={{ padding: '3rem 2rem', backgroundColor: 'var(--color-bg)', borderTop: '2px solid var(--color-gold)', animationDelay: `${i * 0.15}s`, opacity: 0, animationFillMode: 'forwards' }}>
                <span style={{ fontSize: '1.2rem', color: 'var(--color-gold)', display: 'block', marginBottom: '1.5rem' }}>{v.icon}</span>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '1rem' }}>{v.title}</h3>
                <p style={{ color: 'var(--color-text-light)', lineHeight: 1.8, fontSize: '0.9rem' }}>{v.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TEAM ── */}
      <section style={{ padding: '7rem 0', borderBottom: '1px solid var(--color-border)' }}>
        <div className="container">
          <div className="section-header">
            <span className="subtitle">The People</span>
            <div className="gold-rule centered" />
            <h2 className="title">Our Team</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 340px)', gap: '3rem', justifyContent: 'center' }}>
            {TEAM.map((member, i) => (
              <div key={i} style={{ textAlign: 'center' }}>
                <div style={{ width: '100%', aspectRatio: '3/4', overflow: 'hidden', borderRadius: '2px', marginBottom: '1.5rem', backgroundColor: 'var(--color-secondary)' }}>
                  <img src={member.img} alt={member.name} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.6s ease' }}
                    onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.04)'}
                    onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                  />
                </div>
                <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.5rem', fontWeight: 600, marginBottom: '0.3rem' }}>{member.name}</h3>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--color-gold)' }}>{member.role}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{ backgroundColor: '#0a0a0a', padding: '6rem 0', textAlign: 'center', color: '#fff' }}>
        <span style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.3em', textTransform: 'uppercase', color: 'var(--color-gold)', marginBottom: '1.5rem' }}>Explore the Work</span>
        <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(2rem, 4vw, 3.5rem)', fontWeight: 600, marginBottom: '2.5rem' }}>Ready to wear ZNZY?</h2>
        <Link to="/new-in" className="btn btn-gold">
          Shop New Arrivals <ArrowRight size={15} style={{ marginLeft: '0.5rem' }} />
        </Link>
      </section>
    </div>
  );
}
