import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import ProductCard from '../components/common/ProductCard';
import { CardSkeleton } from '../components/common/Skeleton';
import Paginate from '../components/common/Paginate';

export default function ShopPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);
  const keyword = searchParams.get('keyword') || '';
  const isNew = searchParams.get('is_new') || (location.pathname === '/new-in' ? 'true' : '');
  const category = searchParams.get('category') || '';
  const bestseller = searchParams.get('is_bestseller') || (location.pathname === '/bestsellers' ? 'true' : '');

  const fetchProducts = (pNum = 1) => {
    setLoading(true);
    let url = `/api/products/?page=${pNum}`;
    if (keyword) url += `&keyword=${encodeURIComponent(keyword)}`;
    if (isNew) url += `&is_new=true`;
    if (category) url += `&category=${encodeURIComponent(category)}`;
    if (bestseller) url += `&is_bestseller=true`;

    axios.get(url).then(({ data }) => {
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
  }, [keyword, isNew, category, bestseller]);

  const onPageChange = (pageNum) => {
    fetchProducts(pageNum);
  };

  const getPageHeader = () => {
    if (keyword) return { title: `Results for "${keyword}"`, subtitle: 'Search Results' };
    if (location.pathname === '/new-in') return { title: 'New Arrivals', subtitle: 'Just Dropped' };
    if (location.pathname === '/bestsellers') return { title: 'Bestsellers', subtitle: 'Customer Favourites' };
    return { title: 'The Collection', subtitle: 'Our Full Catalog' };
  };

  const { title, subtitle } = getPageHeader();

  return (
    <div style={{ minHeight: '80vh', backgroundColor: 'var(--color-bg)' }}>
      {/* Page Header */}
      <div style={{ padding: '6rem 0 4rem', borderBottom: '1px solid var(--color-border)', textAlign: 'center', backgroundColor: 'var(--color-secondary)' }}>
        <span className="subtitle">{subtitle}</span>
        <div className="gold-rule centered" />
        <h1 className="title" style={{ marginBottom: '1rem', fontFamily: 'var(--font-serif)', fontSize: '3.5rem' }}>{title}</h1>
        <p style={{ color: 'var(--color-text-light)', fontSize: '0.9rem', maxWidth: '600px', margin: '0 auto' }}>
            {keyword ? `We found ${products.length} matching pieces.` : (location.pathname === '/new-in' ? 'The latest arrivals from ZNZY — updated weekly.' : 'Refined style for the modern individual. Quality over quantity, always.')}
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
                <div style={{ textAlign: 'center', padding: '10rem 2rem', backgroundColor: 'var(--color-bg)' }}>
                    <div style={{ fontSize: '1.2rem', marginBottom: '1.5rem', color: 'var(--color-text)', fontWeight: 600 }}>
                       No results found for {keyword ? <span>"{keyword}"</span> : "this collection"}.
                    </div>
                    <p style={{ fontSize: '0.9rem', color: 'var(--color-text-light)', maxWidth: '400px', margin: '0 auto 2.5rem' }}>
                        Check your spelling or try using more general keywords. You might find what you're looking for in our latest arrivals.
                    </p>
                    <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                         <button onClick={() => navigate('/shop')} className="btn btn-outline" style={{ padding: '0.8rem 2rem' }}>View All Products</button>
                         <button onClick={() => navigate('/new-in')} className="btn btn-primary" style={{ padding: '0.8rem 2rem' }}>New Arrivals</button>
                    </div>
                </div>
            )}

            {pages > 1 && <Paginate pages={pages} page={page} onPageChange={onPageChange} />}
          </>
        )}
      </div>
    </div>
  );
}
