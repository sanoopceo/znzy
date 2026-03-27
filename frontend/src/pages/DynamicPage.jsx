import { useContext, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { StoreContext } from '../context/StoreContext';
import pageService from '../services/pageService';
import PageRenderer from './PageRenderer';

function toRenderableHtml(contentJson) {
  if (!contentJson) return '';
  const pages = contentJson.pages || [];
  if (pages.length > 0 && pages[0].component) {
    return pages[0].component;
  }
  if (typeof contentJson.html === 'string') {
    return contentJson.html;
  }
  return '';
}

export default function DynamicPage() {
  const { slug } = useParams();
  const { state } = useContext(StoreContext);
  const token = state.userInfo?.token;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(null);

  useEffect(() => {
    let ignore = false;
    const run = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await pageService.getPublicPageBySlug(slug, token);
        if (!ignore) setPage(data);
      } catch {
        if (!ignore) setError('Page not found.');
      } finally {
        if (!ignore) setLoading(false);
      }
    };
    run();
    return () => {
      ignore = true;
    };
  }, [slug, token]);

  if (loading) return <div className="container" style={{ padding: '3rem 0' }}>Loading page...</div>;
  if (error) return <div className="container" style={{ padding: '3rem 0' }}>{error}</div>;

  const html = toRenderableHtml(page?.content_json);
  return (
    <main className="container" style={{ padding: '2rem 0' }}>
      <PageRenderer html={html} context={{ product: { name: 'Demo Product', price: '99.00' } }} />
    </main>
  );
}
