import { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { StoreContext } from '../context/StoreContext';
import GrapesEditor from './GrapesEditor';
import pageService from '../services/pageService';

export default function PageBuilder() {
  const { state } = useContext(StoreContext);
  const token = state.userInfo?.token;
  const isSuperuser = Boolean(state.userInfo?.isSuperuser);
  const [pages, setPages] = useState([]);
  const [activePage, setActivePage] = useState(null);
  const [editor, setEditor] = useState(null);
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [versions, setVersions] = useState([]);
  const [isPreview, setIsPreview] = useState(false);

  const loadPages = useCallback(async () => {
    if (!token) return;
    const data = await pageService.listPages(token);
    setPages(data);
  }, [token]);

  const loadVersions = useCallback(
    async (pageId) => {
      if (!pageId || !token) return;
      const data = await pageService.listVersions(pageId, token);
      setVersions(data);
    },
    [token]
  );

  useEffect(() => {
    loadPages();
  }, [loadPages]);

  const activeProjectData = useMemo(() => activePage?.content_json || {}, [activePage]);

  const handleCreate = async () => {
    if (!title || !slug) return;
    const created = await pageService.createPage({ title, slug, content_json: {} }, token);
    await loadPages();
    setActivePage(created);
    setTitle('');
    setSlug('');
  };

  const handleSave = async () => {
    if (!editor || !activePage) return;
    const content_json = editor.getProjectData();
    const updated = await pageService.updatePage(activePage.id, { content_json }, token);
    setActivePage(updated);
    await loadVersions(activePage.id);
  };

  const handlePublish = async () => {
    if (!activePage) return;
    await pageService.publishPage(activePage.id, token);
    await loadPages();
  };

  const handleRestore = async (versionId) => {
    const updated = await pageService.restoreVersion(versionId, token);
    setActivePage(updated);
    await loadVersions(updated.id);
  };

  const onSelectPage = async (page) => {
    setActivePage(page);
    await loadVersions(page.id);
  };

  if (!isSuperuser) {
    return <div className="container" style={{ padding: '3rem 0' }}>Only superusers can access this page builder.</div>;
  }

  return (
    <div className="container" style={{ padding: '1.5rem 0' }}>
      <h1 style={{ marginBottom: '1rem' }}>Page Builder</h1>

      <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Page title" />
        <input value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="page-slug" />
        <button onClick={handleCreate}>Create</button>
        <button onClick={() => setIsPreview((prev) => !prev)}>{isPreview ? 'Exit Preview' : 'Preview'}</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: 14 }}>
        <aside style={{ border: '1px solid #ddd', padding: 10 }}>
          <h3>Pages</h3>
          {pages.map((p) => (
            <button key={p.id} style={{ display: 'block', width: '100%', marginBottom: 6 }} onClick={() => onSelectPage(p)}>
              {p.title} ({p.slug}) {p.is_published ? 'Published' : 'Draft'}
            </button>
          ))}

          {activePage && (
            <>
              <hr />
              <h4>Versions</h4>
              {versions.map((v) => (
                <button key={v.id} style={{ display: 'block', width: '100%', marginBottom: 6 }} onClick={() => handleRestore(v.id)}>
                  Restore v{v.version_number}
                </button>
              ))}
            </>
          )}
        </aside>

        <section>
          {activePage ? (
            <>
              {!isPreview ? <GrapesEditor initialProjectData={activeProjectData} onReady={setEditor} /> : <pre>{JSON.stringify(activeProjectData, null, 2)}</pre>}
              <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                <button onClick={handleSave}>Save</button>
                <button onClick={handlePublish}>Publish</button>
              </div>
            </>
          ) : (
            <p>Select a page to edit.</p>
          )}
        </section>
      </div>
    </div>
  );
}
