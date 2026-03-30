import { useState, useEffect } from 'react';
import axios from 'axios';
import ProductCard from '../components/common/ProductCard';
import { CardSkeleton } from '../components/common/Skeleton';
import Paginate from '../components/common/Paginate';

export default function ArchiveSalePage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);

  const fetchProducts = (pNum = 1) => {
    setLoading(true);
    axios.get(`/api/products/?is_archive_sale=true&page=${pNum}`).then(({ data }) => {
      setProducts(data.products || []);
      setPage(data.page || 1);
      setPages(data.pages || 1);
      window.scrollTo(0, 0);
    }).catch(() => {
        setProducts([]);
    }).finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchProducts(1);
  }, []);

  const onPageChange = (pageNum) => {
    fetchProducts(pageNum);
  };

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
          <div className="grid grid-cols-4" style={{ gap: '3rem 2rem' }}>
            {[1, 2, 3, 4, 5, 6, 7, 8].map(i => <CardSkeleton key={i} />)}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-4" style={{ gap: '3rem 2rem' }}>
              {products.map((p) => (
                  <ProductCard key={p.id} product={p} />
              ))}
            </div>
            
            {products.length === 0 && (
                <div style={{ textAlign: 'center', padding: '10rem', color: '#999' }}>
                    <p>No archive pieces available at this moment.</p>
                </div>
            )}

            <Paginate pages={pages} page={page} onPageChange={onPageChange} />
          </>
        )}
      </div>
    </div>
  );
}
