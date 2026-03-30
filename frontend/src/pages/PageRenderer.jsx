import DOMPurify from 'dompurify';

function resolvePlaceholders(input, context = {}) {
  if (!input || typeof input !== 'string') return input;
  return input.replace(/\{\{\s*([a-zA-Z0-9_.]+)\s*\}\}/g, (_, token) => {
    const value = token.split('.').reduce((acc, part) => (acc ? acc[part] : undefined), context);
    return value !== undefined && value !== null ? String(value) : `{{${token}}}`;
  });
}

export default function PageRenderer({ html = '', css = '', context = {} }) {
  const resolved = resolvePlaceholders(html, context);
  const sanitized = DOMPurify.sanitize(resolved);
  const safeCss = typeof css === 'string' ? css : '';
  return (
    <>
      {safeCss && <style>{safeCss}</style>}
      <div dangerouslySetInnerHTML={{ __html: sanitized }} />
    </>
  );
}
