import { useEffect, useRef } from 'react';
import grapesjs from 'grapesjs';
import 'grapesjs/dist/css/grapes.min.css';
import { registerDefaultBlocks } from './BlockManager';

export default function GrapesEditor({ initialProjectData, onReady }) {
  const editorRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const editor = grapesjs.init({
      container: containerRef.current,
      height: 'calc(100vh - 180px)',
      storageManager: false,
      fromElement: false,
      blockManager: { appendTo: '#gjs-blocks' },
      styleManager: { appendTo: '#gjs-styles' },
      traitManager: { appendTo: '#gjs-traits' },
    });

    registerDefaultBlocks(editor);

    if (initialProjectData && Object.keys(initialProjectData).length > 0) {
      editor.loadProjectData(initialProjectData);
    }

    editorRef.current = editor;
    onReady?.(editor);

    return () => {
      editor.destroy();
      editorRef.current = null;
    };
  }, [initialProjectData, onReady]);

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr 260px', gap: '12px' }}>
      <aside id="gjs-blocks" style={{ border: '1px solid #ddd', padding: 8, overflowY: 'auto' }} />
      <div ref={containerRef} />
      <aside style={{ display: 'grid', gap: 8 }}>
        <div id="gjs-styles" style={{ border: '1px solid #ddd', padding: 8 }} />
        <div id="gjs-traits" style={{ border: '1px solid #ddd', padding: 8 }} />
      </aside>
    </div>
  );
}
