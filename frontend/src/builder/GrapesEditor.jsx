import { useEffect, useRef } from 'react';
import grapesjs from 'grapesjs';
import 'grapesjs/dist/css/grapes.min.css';
import { registerDefaultBlocks } from './BlockManager';

export default function GrapesEditor({ projectData, onReady }) {
  const editorRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;
    if (editorRef.current) return;

    const editor = grapesjs.init({
      container: containerRef.current,
      height: 'calc(100vh - 180px)',
      storageManager: false,
      fromElement: false,
      blockManager: { appendTo: '#gjs-blocks' },
      styleManager: { appendTo: '#gjs-styles' },
      traitManager: { appendTo: '#gjs-traits' },
      assetManager: {
        upload: '/api/assets/upload/',
        uploadName: 'files',
        multiUpload: true,
        autoAdd: true,
      },
    });

    registerDefaultBlocks(editor);

    editorRef.current = editor;
    onReady?.(editor);

    return () => {
      editor.destroy();
      editorRef.current = null;
    };
  }, [onReady]);

  useEffect(() => {
    const editor = editorRef.current;
    if (!editor) return;
    const data = projectData && Object.keys(projectData).length > 0 ? projectData : {};
    editor.loadProjectData(data);
  }, [projectData]);

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
