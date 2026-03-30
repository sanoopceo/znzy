import { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { StoreContext } from '../context/StoreContext';
import GrapesEditor from './GrapesEditor';
import pageService from '../services/pageService';

export default function PageBuilder() {
  const navigate = useNavigate();
  const { pageId } = useParams();
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
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');
  const lastLoadedPageIdRef = useRef(null);

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

  const activeProjectData = useMemo(() => {
    const cj = activePage?.content_json;
    if (cj && typeof cj === 'object' && cj.projectData) return cj.projectData;
    return cj || {};
  }, [activePage]);

  const loadActivePage = useCallback(async () => {
    if (!token || !pageId) return;
    const idNum = Number(pageId);
    if (!Number.isFinite(idNum)) return;
    const data = await pageService.getPageById(idNum, token);
    setActivePage(data);
    await loadVersions(idNum);
  }, [token, pageId, loadVersions]);

  useEffect(() => {
    loadActivePage();
  }, [loadActivePage]);

  const handleCreate = async () => {
    if (!title || !slug) return;
    const created = await pageService.createPage({ title, slug, content_json: {} }, token);
    await loadPages();
    setActivePage(created);
    navigate(`/admin/page-builder/${created.id}`);
    setTitle('');
    setSlug('');
  };

  const handleSave = async () => {
    if (!editor || !activePage) return;
    setSaving(true);
    setStatusMsg('');
    try {
      const projectData = editor.getProjectData();
      const html = editor.getHtml();
      const css = editor.getCss();
      const content_json = { projectData, html, css };
      const updated = await pageService.updatePage(activePage.id, { content_json }, token);
      setActivePage(updated);
      await loadVersions(activePage.id);
      setStatusMsg('Saved');
    } catch (e) {
      setStatusMsg('Save failed');
    } finally {
      setSaving(false);
      setTimeout(() => setStatusMsg(''), 1500);
    }
  };

  const handlePublish = async () => {
    if (!activePage) return;
    setPublishing(true);
    setStatusMsg('');
    try {
      await pageService.publishPage(activePage.id, token);
      await loadPages();
      const refreshed = await pageService.getPageById(activePage.id, token);
      setActivePage(refreshed);
      setStatusMsg('Published');
    } catch {
      setStatusMsg('Publish failed');
    } finally {
      setPublishing(false);
      setTimeout(() => setStatusMsg(''), 1500);
    }
  };

  const handleRestore = async (versionId) => {
    const updated = await pageService.restoreVersion(versionId, token);
    setActivePage(updated);
    await loadVersions(updated.id);
  };

  const onSelectPage = async (page) => {
    navigate(`/admin/page-builder/${page.id}`);
  };

  if (!isSuperuser) {
    return <div className="container" style={{ padding: '3rem 0' }}>Only superusers can access this page builder.</div>;
  }

  // Ensure we only call loadProjectData when the selected page changes (not on every state refresh)
  useEffect(() => {
    if (!editor || !activePage?.id) return;
    if (lastLoadedPageIdRef.current === activePage.id) return;
    lastLoadedPageIdRef.current = activePage.id;
    // GrapesEditor also loads projectData, this is a safety net for timing issues
    editor.loadProjectData(activeProjectData || {});
  }, [editor, activePage?.id, activeProjectData]);

  return (
    <div className="container" style={{ padding: '1.25rem 0' }}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 12, marginBottom: '1rem' }}>
        <div>
          <h1 style={{ marginBottom: 4 }}>Page Builder</h1>
          <div style={{ color: 'var(--color-text-light)', fontSize: '0.9rem' }}>
            {activePage ? (
              <>
                Editing: <b>{activePage.title}</b> <span style={{ opacity: 0.7 }}>({activePage.slug})</span> ·{' '}
                <span style={{ color: activePage.is_published ? 'var(--color-gold)' : 'var(--color-text-light)' }}>
                  {activePage.is_published ? 'Published' : 'Draft'}
                </span>
              </>
            ) : (
              'Select a page on the left to start editing.'
            )}
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {statusMsg && <span style={{ color: 'var(--color-text-light)' }}>{statusMsg}</span>}
          <button onClick={handleSave} disabled={!activePage || !editor || saving} className="btn btn-gold">
            {saving ? 'Saving…' : 'Save'}
          </button>
          <button onClick={handlePublish} disabled={!activePage || publishing} className="btn">
            {publishing ? 'Publishing…' : 'Publish'}
          </button>
          <button onClick={() => setIsPreview((prev) => !prev)} className="btn" style={{ border: '1px solid var(--color-border)' }}>
            {isPreview ? 'Exit Preview' : 'Preview'}
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="New page title" style={{ minWidth: 220 }} />
        <input value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="new-page-slug" style={{ minWidth: 220 }} />
        <button onClick={handleCreate} className="btn" style={{ border: '1px solid var(--color-border)' }}>
          Create Page
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: 14 }}>
        <aside style={{ border: '1px solid var(--color-border)', padding: 12, background: 'var(--color-bg)' }}>
          <h3 style={{ marginBottom: 10 }}>Pages</h3>
          <div style={{ display: 'grid', gap: 8 }}>
            {pages.map((p) => {
              const active = String(p.id) === String(pageId);
              return (
                <button
                  key={p.id}
                  onClick={() => onSelectPage(p)}
                  style={{
                    textAlign: 'left',
                    padding: '10px 10px',
                    border: active ? '1px solid var(--color-gold)' : '1px solid var(--color-border)',
                    background: active ? 'rgba(212,175,55,0.08)' : 'transparent',
                    cursor: 'pointer',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                    <div style={{ fontWeight: 700 }}>{p.title}</div>
                    <div style={{ fontSize: '0.75rem', color: p.is_published ? 'var(--color-gold)' : 'var(--color-text-light)' }}>
                      {p.is_published ? 'Published' : 'Draft'}
                    </div>
                  </div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--color-text-light)', marginTop: 4 }}>{p.slug}</div>
                </button>
              );
            })}
          </div>

          {activePage && (
            <>
              <hr style={{ margin: '14px 0' }} />
              <h4 style={{ marginBottom: 8 }}>Versions</h4>
              <div style={{ display: 'grid', gap: 8 }}>
                {versions.map((v) => (
                  <button
                    key={v.id}
                    style={{ display: 'block', width: '100%', padding: '10px', border: '1px solid var(--color-border)', textAlign: 'left' }}
                    onClick={() => handleRestore(v.id)}
                  >
                    Restore v{v.version_number}
                  </button>
                ))}
              </div>
            </>
          )}
        </aside>

        <section>
          {activePage ? (
            <>
              {!isPreview ? (
                <GrapesEditor projectData={activeProjectData} onReady={setEditor} />
              ) : (
                <pre style={{ border: '1px solid var(--color-border)', padding: 12, overflow: 'auto' }}>{JSON.stringify(activeProjectData, null, 2)}</pre>
              )}
            </>
          ) : (
            <p>Select a page to edit.</p>
          )}
        </section>
      </div>
    </div>
  );
}
