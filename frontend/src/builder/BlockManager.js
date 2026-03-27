export function registerDefaultBlocks(editor) {
  const blockManager = editor.BlockManager;

  blockManager.add('hero-section', {
    label: 'Hero Section',
    category: 'Hero',
    content: `
      <section class="hero-section" style="padding: 64px 24px; text-align:center; background:#111; color:#fff;">
        <h1>Hero Title</h1>
        <p>Hero subtitle goes here.</p>
        <a href="/shop" style="display:inline-block; padding:10px 16px; background:#d4af37; color:#111; text-decoration:none;">Shop Now</a>
      </section>
    `,
  });

  blockManager.add('product-card-placeholder', {
    label: 'Product Card',
    category: 'Product',
    content: `
      <div class="product-card" style="border:1px solid #ddd; padding:16px;">
        <h3>{{product.name}}</h3>
        <p>{{product.price}}</p>
        <button>View Product</button>
      </div>
    `,
  });

  blockManager.add('banner-section', {
    label: 'Banner',
    category: 'Banner',
    content: `
      <section class="banner" style="padding:24px; background:#f7f7f7; text-align:center;">
        <h2>Banner Title</h2>
      </section>
    `,
  });

  blockManager.add('cta-button', {
    label: 'Button',
    category: 'Basic',
    content: `<a href="#" style="display:inline-block;padding:10px 16px;background:#111;color:#fff;text-decoration:none;">Click Me</a>`,
  });
}
