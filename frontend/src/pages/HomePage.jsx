import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useApi } from '../hooks/useApi';
import { ArrowRight, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { CardSkeleton } from '../components/common/Skeleton';
import ProductCard from '../components/common/ProductCard';

export default function HomePage() {
  const { loading, request } = useApi();
  const [sections, setSections] = useState([]);

  const fetchHome = useCallback(async () => {
    try {
      const data = await request({ url: '/api/homepage/', method: 'GET' });
      setSections(data);
    } catch (err) {}
  }, [request]);

  useEffect(() => {
    fetchHome();
  }, [fetchHome]);

  return (
    <div className="home-page">
      {/* Cinematic Hero */}
      <section className="hero-container">
         <img 
            src="https://images.unsplash.com/photo-1512436991641-6745cdb1723f?q=80&w=2070&auto=format&fit=crop" 
            alt="Luxury Streetwear" 
            className="hero-bg" 
         />
         <div className="hero-overlay" />
         
         <div className="hero-content">
            <motion.div
               initial={{ opacity: 0, y: 30 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ duration: 1, delay: 0.2 }}
            >
               <span className="subtitle" style={{ color: '#fff', fontSize: '0.9rem', marginBottom: '1.5rem', display: 'block' }}>
                  AW 2026 Collection
               </span>
               <h1 style={{ 
                  fontFamily: 'var(--font-serif)', 
                  fontSize: 'clamp(3rem, 10vw, 6rem)', 
                  fontWeight: 600, 
                  lineHeight: 0.9, 
                  marginBottom: '2.5rem',
                  letterSpacing: '-0.02em'
               }}>
                  ELEGANCE <br /> REIMAGINED.
               </h1>
               <div style={{ display: 'flex', gap: '1.5rem', justifyContent: 'center' }}>
                  <Link to="/shop" className="btn btn-gold" style={{ padding: '1.2rem 3rem' }}>
                     Explore Shop
                  </Link>
                  <Link to="/collections" className="btn btn-outline" style={{ border: '1px solid white', color: 'white' }}>
                     Lookbook
                  </Link>
               </div>
            </motion.div>
         </div>

         <div style={{ position: 'absolute', bottom: '2rem', left: '50%', transform: 'translateX(-50%)', zIndex: 10, color: 'white' }}>
            <motion.div
               animate={{ y: [0, 10, 0] }}
               transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
            >
               <ChevronDown size={30} opacity={0.6} />
            </motion.div>
         </div>
      </section>

      {/* Dynamic Sections */}
      <AnimatePresence>
      {loading && sections.length === 0 ? (
        <div className="container" style={{ padding: '8rem 0' }}>
           <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem' }}>
              {[1,2,3,4].map(i => <CardSkeleton key={i} />)}
           </div>
        </div>
      ) : (
        sections.map((section, idx) => (
          <SectionWrapper key={idx} section={section} idx={idx} />
        ))
      )}
      </AnimatePresence>

      {/* Newsletter / Aesthetic Mood */}
      <section style={{ padding: '10rem 0', background: '#000', color: '#fff', textAlign: 'center' }}>
         <div className="container" style={{ maxWidth: '800px' }}>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '3rem', marginBottom: '1.5rem' }}>Join the Cult.</h2>
            <p style={{ color: '#888', marginBottom: '3rem', letterSpacing: '0.05em' }}>Be the first to know about archive sales, new drops, and exclusive events.</p>
            <div style={{ display: 'flex', gap: '0.5rem', maxWidth: '500px', margin: '0 auto' }}>
               <input 
                  className="form-input" 
                  placeholder="Enter your email" 
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}
               />
               <button className="btn btn-gold" style={{ padding: '0 2rem' }}>Subscribe</button>
            </div>
         </div>
      </section>
    </div>
  );
}

function SectionWrapper({ section, idx }) {
   return (
      <motion.section 
         initial={{ opacity: 0, y: 50 }}
         whileInView={{ opacity: 1, y: 0 }}
         viewport={{ once: true }}
         transition={{ duration: 0.8, delay: 0.1 }}
         style={{ padding: '10rem 0', backgroundColor: idx % 2 === 0 ? 'var(--color-bg)' : 'var(--color-nude)' }}
      >
         <div className="container">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '4rem' }}>
               <div>
                 <span className="subtitle">{section.subtitle || "The Core Series"}</span>
                 <div className="gold-rule" />
                 <h2 className="title" style={{ fontFamily: 'var(--font-serif)', fontSize: '3.5rem', fontWeight: 500, letterSpacing: '-0.02em' }}>
                    {section.title}
                 </h2>
               </div>
               {section.type === 'PRODUCT_GRID' && (
                  <Link to="/shop" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                     View Collection <ArrowRight size={16} />
                  </Link>
               )}
            </div>

            {section.type === 'PRODUCT_GRID' && (
               <div className="grid grid-cols-4" style={{ gap: '3rem' }}>
                  {section.items.map(p => <ProductCard key={p.id} product={p} />)}
               </div>
            )}
         </div>
      </motion.section>
   );
}
