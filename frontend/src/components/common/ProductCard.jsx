import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * Standardized Product Card used across all shop sections (New In, Bestsellers, Shop, Archive)
 * Ensures consistent UI for price, category, and image display.
 */
export default function ProductCard({ product, badge }) {
  const [hover, setHover] = useState(false);
  
  // Robust image selection
  const img = product.main_image || 
              (product.side_images && product.side_images.length > 0 ? product.side_images[0].image : null) || 
              product.image || 
              product.img || 
              '/placeholder.png';
  
  const isArchive = product.is_archive_sale;
  const showBadge = badge || (isArchive ? `-${product.discount_percentage}%` : null);

  return (
    <Link 
      to={`/product/${product.id}`}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{ display: 'block', color: 'inherit', position: 'relative', textDecoration: 'none' }}
      className="product-card-container"
    >
      <div style={{
         overflow: 'hidden',
         backgroundColor: 'var(--color-secondary, #f9f9f9)',
         position: 'relative',
         aspectRatio: '3/4',
         borderRadius: '0px',
         marginBottom: '1.2rem',
         border: '1px solid var(--color-border, #eee)'
      }}>
         {showBadge && (
            <span style={{ 
               position: 'absolute', top: '1rem', left: '1rem', zIndex: 10, 
               backgroundColor: isArchive ? '#c0392b' : 'var(--color-gold, #d4af37)', 
               color: '#fff', fontSize: '0.65rem', 
               fontWeight: 800, padding: '0.35rem 0.7rem', letterSpacing: '0.15em',
               textTransform: 'uppercase'
            }}>
               {showBadge}
            </span>
         )}
         
         <img 
            src={img} 
            alt={product.name} 
            loading="lazy"
            style={{ 
               width: '100%', height: '100%', objectFit: 'cover', 
               transition: 'transform 1.2s cubic-bezier(0.16, 1, 0.3, 1)', 
               transform: hover ? 'scale(1.08)' : 'scale(1)' 
            }} 
         />

         <AnimatePresence>
            {hover && (
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    style={{
                        position: 'absolute', inset: 0, 
                        background: 'linear-gradient(to top, rgba(0,0,0,0.4) 0%, transparent 40%)',
                        display: 'flex', alignItems: 'flex-end', padding: '1.5rem',
                        zIndex: 5
                    }}
                >
                    <span style={{ color: '#fff', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.2em' }}>
                        View Product
                    </span>
                </motion.div>
            )}
         </AnimatePresence>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
         <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
            <h3 style={{ 
                fontSize: '0.95rem', 
                fontWeight: 600, 
                margin: 0, 
                fontFamily: 'var(--font-primary)',
                letterSpacing: '-0.01em',
                flex: 1
            }}>
                {product.name}
            </h3>
            
            <div style={{ textAlign: 'right', flexShrink: 0 }}>
               {isArchive ? (
                  <>
                     <span style={{ 
                        display: 'block', fontSize: '0.75rem', color: '#999', 
                        textDecoration: 'line-through', marginBottom: '0.1rem' 
                     }}>
                        ₹{parseFloat(product.original_price).toLocaleString()}
                     </span>
                     <span style={{ fontWeight: 800, fontSize: '1rem', color: '#c0392b' }}>
                        ₹{parseFloat(product.discounted_price).toLocaleString()}
                     </span>
                  </>
               ) : (
                  <span style={{ fontWeight: 800, fontSize: '1rem', color: '#0a0a0a' }}>
                    ₹{parseFloat(product.price).toLocaleString()}
                  </span>
               )}
            </div>
         </div>
         
         <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <span style={{ 
                fontSize: '0.7rem', color: '#888', 
                textTransform: 'uppercase', letterSpacing: '0.12em',
                fontWeight: 500
            }}>
                {product.category_name || 'ZNZY'}
            </span>
            {product.is_new && !isArchive && (
                <span style={{ width: '4px', height: '4px', borderRadius: '50%', backgroundColor: 'var(--color-gold)' }} />
            )}
            {product.is_new && !isArchive && (
                <span style={{ fontSize: '0.6rem', color: 'var(--color-gold)', fontWeight: 700, letterSpacing: '0.1em' }}>NEW</span>
            )}
         </div>
      </div>
    </Link>
  );
}
