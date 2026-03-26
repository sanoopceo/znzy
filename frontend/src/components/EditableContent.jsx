import React, { useState, useContext } from 'react';
import { AdminContext } from '../context/AdminContext';
import { Edit2, Check, X, Upload, Loader } from 'lucide-react';

/**
 * EditableContent - renders plain content normally,
 * and provides inline editing UI when admin edit mode is active.
 */
export default function EditableContent({
  contentKey,
  defaultContent,
  type = 'text',
  style = {},
  className = '',
  tag: Tag = 'div',
}) {
  const { globalEditMode, siteContent, updateContent } = useContext(AdminContext);
  const [isEditing, setIsEditing] = useState(false);
  const [tempValue, setTempValue] = useState('');
  const [loading, setLoading] = useState(false);

  const currentContent = siteContent[contentKey] !== undefined ? siteContent[contentKey] : defaultContent;

  // Extract plain string from content for editing
  const getStringValue = (val) => {
    if (typeof val === 'string') return val;
    if (React.isValidElement(val)) {
      try {
        return React.Children.toArray(val.props?.children)
          .map(child => typeof child === 'string' ? child : (child?.type === 'br' ? '\n' : ''))
          .join('');
      } catch {
        return '';
      }
    }
    return String(val ?? '');
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await updateContent(contentKey, tempValue, 'text');
      setIsEditing(false);
    } catch {
      alert('Save failed. Make sure you are logged in as admin.');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLoading(true);
    try {
      await updateContent(contentKey, file, 'image');
    } catch {
      alert('Upload failed. Make sure you are logged in as admin.');
    } finally {
      setLoading(false);
    }
  };

  // ── IMAGE TYPE ──
  if (type === 'image') {
    return (
      <div style={{ ...style, position: 'relative' }} className={className}>
        {loading && (
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10 }}>
            <Loader size={24} style={{ animation: 'spin 1s linear infinite' }} />
          </div>
        )}
        <img
          src={typeof currentContent === 'string' ? currentContent : ''}
          alt=""
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
        />
        {globalEditMode && (
          <label style={{
            position: 'absolute', inset: 0,
            background: 'rgba(0,0,0,0.45)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexDirection: 'column', gap: '0.5rem',
            cursor: 'pointer', color: 'white',
            transition: 'opacity 0.3s',
            opacity: 0,
          }}
          onMouseEnter={e => e.currentTarget.style.opacity = '1'}
          onMouseLeave={e => e.currentTarget.style.opacity = '0'}
          >
            <Upload size={28} />
            <span style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.1em' }}>REPLACE IMAGE</span>
            <input type="file" accept="image/*" onChange={handleFileChange} style={{ display: 'none' }} />
          </label>
        )}
        <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  // ── TEXT TYPE — EDITING MODE ──
  if (globalEditMode && isEditing) {
    return (
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.4rem', width: '100%' }}>
        <textarea
          value={tempValue}
          onChange={e => setTempValue(e.target.value)}
          autoFocus
          style={{
            flex: 1,
            padding: '0.4rem 0.6rem',
            border: '2px solid var(--color-gold)',
            borderRadius: '2px',
            background: 'rgba(255,255,255,0.95)',
            color: '#000',
            font: 'inherit',
            minHeight: '2.5em',
            resize: 'vertical',
          }}
        />
        <button
          onClick={handleSave}
          disabled={loading}
          title="Save"
          style={{ padding: '0.4rem', color: '#22c55e', background: 'white', border: '1px solid #22c55e', borderRadius: '2px', cursor: 'pointer' }}
        >
          {loading ? <Loader size={14} /> : <Check size={14} />}
        </button>
        <button
          onClick={() => setIsEditing(false)}
          title="Cancel"
          style={{ padding: '0.4rem', color: '#ef4444', background: 'white', border: '1px solid #ef4444', borderRadius: '2px', cursor: 'pointer' }}
        >
          <X size={14} />
        </button>
      </div>
    );
  }

  // ── TEXT TYPE — VIEW/HOVER MODE ──
  const displayContent = typeof currentContent === 'string'
    ? currentContent.split('\n').map((line, i, arr) => (
        <React.Fragment key={i}>{line}{i < arr.length - 1 && <br />}</React.Fragment>
      ))
    : currentContent;

  return (
    <Tag
      className={className}
      style={{
        ...style,
        position: 'relative',
        outline: globalEditMode ? '1px dashed rgba(212,175,55,0.7)' : 'none',
        cursor: globalEditMode ? 'pointer' : 'auto',
      }}
      title={globalEditMode ? 'Click to edit' : undefined}
      onClick={() => {
        if (globalEditMode) {
          setTempValue(getStringValue(currentContent));
          setIsEditing(true);
        }
      }}
    >
      {displayContent}
      {globalEditMode && (
        <span style={{
          position: 'absolute',
          top: '-8px',
          right: '-8px',
          background: 'var(--color-gold)',
          color: '#fff',
          borderRadius: '50%',
          width: '18px',
          height: '18px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          pointerEvents: 'none',
          zIndex: 5,
        }}>
          <Edit2 size={9} />
        </span>
      )}
    </Tag>
  );
}
