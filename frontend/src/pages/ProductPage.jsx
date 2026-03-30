import { useState, useContext, useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { StoreContext } from '../context/StoreContext';
import { 
  Ruler, Truck, ChevronRight, Loader, Plus, Minus, 
  ShieldCheck, RotateCcw, MessageCircle, Heart, Share2, 
  Star, Info
} from 'lucide-react';

export default function ProductPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { state, dispatch } = useContext(StoreContext);
  const { userInfo } = state;
  const detailsRef = useRef(null);

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [isStickyVisible, setIsStickyVisible] = useState(false);
  const [zoomStyle, setZoomStyle] = useState({ display: 'none', backgroundPosition: '0% 0%' });
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [isSizeChartOpen, setIsSizeChartOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  // Admin Edit State
  const [isEditMode, setIsEditMode] = useState(false);
  const [editData, setEditData] = useState({ name: '', price: '', description: '' });
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const { data } = await axios.get(`/api/products/${id}/`);
        
        // Build image list from new structure: Main + Sides
        let images = [];
        if (data.main_image) {
            images.push({ id: 'main', url: data.main_image });
        }
        if (data.side_images && data.side_images.length > 0) {
            data.side_images.forEach(img => {
                images.push({ id: img.id, url: img.image });
            });
        }
        
        // Fallback for demo if no images exist
        if (images.length === 0) {
            const fallbackUrls = [
                '/images/redesign/juliet_front.png',
                '/images/redesign/juliet_side.png',
                '/images/redesign/juliet_back.png'
            ];
            images = fallbackUrls.map((url, idx) => ({ id: `fallback-${idx}`, url }));
        }

        const transformedProduct = {
          ...data,
          images: images,
          // Use computed pricing from backend
          price: data.discounted_price || data.price,
          originalPrice: data.original_price,
          isArchive: data.is_archive_sale,
          discount: data.discount_percentage,
          // sizes is now an array of {id, size, stock}
          sizes: Array.isArray(data.sizes) ? data.sizes : [],
          brand: 'ZNZY LUXE',
        };
        setProduct(transformedProduct);
        setActiveImage(transformedProduct.images[0]?.url || '');
        setEditData({ 
          name: transformedProduct.name, 
          price: transformedProduct.originalPrice || transformedProduct.price, 
          description: transformedProduct.description 
        });
      } catch (error) {
        console.error("Error fetching product", error);
        // High-fidelity fallback for Juliet Dress
        const julietFallback = {
          id: id || '99',
          name: 'Juliet Mini Dress (Cherry Red)',
          brand: 'ZNZY LUXE',
          price: 6200,
          description: 'A masterpiece of contemporary draping and silhouette...',
          images: [
            { id: 'f1', url: '/images/redesign/juliet_front.png' },
            { id: 'f2', url: '/images/redesign/juliet_side.png' },
            { id: 'f3', url: '/images/redesign/juliet_back.png' },
            { id: 'f4', url: '/images/redesign/juliet_walking.png' },
            { id: 'f5', url: '/images/redesign/juliet_fabric.png' }
          ],
          sizes: ['XS', 'S', 'M', 'L', 'XL', '2XL'],
          colors: ['Cherry Red'],
          stockLeft: 5,
        };
        setProduct(julietFallback);
        setActiveImage(julietFallback.images[0].url);
        setEditData({ name: julietFallback.name, price: julietFallback.price, description: julietFallback.description });
        setSelectedColor(julietFallback.colors[0]);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const saveProductHandler = async () => {
    try {
      setLoading(true);
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      const { data } = await axios.put(`/api/products/update/${product.id}/`, editData, config);
      setProduct({ ...product, name: data.name, price: data.price, description: data.description });
      setIsEditMode(false);
    } catch (error) {
      toast.error("Error updating product: " + (error.response?.data?.detail || error.message));
    } finally {
      setLoading(false);
    }
  };

  const uploadFileHandler = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('image', file);
    formData.append('product_id', product.id);
    formData.append('is_primary', product.images.length === 0 ? 'true' : 'false');

    setUploading(true);
    try {
      const config = {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${userInfo.token}`
        }
      };
      const { data } = await axios.post('/api/products/upload/', formData, config);
      const newImage = { id: data.id, url: data.image_url || data.image };
      setProduct({ ...product, images: [...product.images, newImage] });
      setActiveImage(newImage.url);
      toast.success('Asset uploaded successfully');
    } catch (error) {
      toast.error("Error uploading image: " + (error.response?.data?.detail || error.message));
    } finally {
      setUploading(false);
    }
  };

  const deleteImageHandler = async (imgId) => {
    if (imgId.toString().startsWith('fallback')) {
        toast.error("Cannot delete fallback images");
        return;
    }
    if (!window.confirm("Are you sure you want to delete this image?")) return;

    try {
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      await axios.delete(`/api/products/image-delete/${imgId}/`, config);
      const newImages = product.images.filter(img => img.id !== imgId);
      setProduct({ ...product, images: newImages });
      if (activeImage.includes(imgId)) setActiveImage(newImages[0]?.url || '');
      toast.success('Asset removed');
    } catch (error) {
      toast.error("Error deleting image: " + (error.response?.data?.detail || error.message));
    }
  };

  useEffect(() => {
    const handleScroll = () => {
        if (!detailsRef.current) return;
        const rect = detailsRef.current.getBoundingClientRect();
        // Show sticky bar when the main Add to Cart button is passed
        setIsStickyVisible(rect.bottom < 0);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const addToCartHandler = (isBuyNow = false) => {
    if (!selectedSize) {
      toast.error('Please select a size before continuing', {
        icon: '⚠️',
        duration: 3000,
        position: 'top-right',
        style: {
          borderRadius: '12px',
          background: '#FFFFFF',
          color: '#1a1a1a',
          padding: '16px 24px',
          boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05)',
          fontWeight: '600',
          border: '1px solid #f0f0f0'
        },
      });
      return;
    }

    const sizeObj = product.sizes.find(s => s.size === selectedSize);

    dispatch({
      type: 'CART_ADD_ITEM',
      payload: {
        product: product.id,
        name: product.name,
        price: product.price,
        image: activeImage,
        qty: quantity,
        variantId: sizeObj ? sizeObj.id : `${selectedSize}`,
        size: selectedSize,
      }
    });
    
    if (isBuyNow) {
        navigate('/checkout');
    } else {
        navigate('/cart');
    }
  };

  const openLightbox = (index) => {
    setLightboxIndex(index);
    setIsLightboxOpen(true);
    document.body.style.overflow = 'hidden';
  };

  const closeLightbox = () => {
    setIsLightboxOpen(false);
    document.body.style.overflow = 'auto';
  };

  const handleMouseMove = (e) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.pageX - left - window.scrollX) / width) * 100;
    const y = ((e.pageY - top - window.scrollY) / height) * 100;
    setZoomStyle({
      display: 'block',
      backgroundPosition: `${x}% ${y}%`,
      backgroundImage: `url(${activeImage})`,
    });
  };

  const handleMouseLeave = () => {
    setZoomStyle({ display: 'none' });
  };

  const [reviewData, setReviewData] = useState({ rating: 5, comment: '' });
  const [submittingReview, setSubmittingReview] = useState(false);

  const submitReviewHandler = async (e) => {
    e.preventDefault();
    if (!userInfo) {
       toast.error("Please login to leave a review");
       return;
    }
    if (!reviewData.comment.trim()) {
        toast.error("Please write a comment");
        return;
    }
    setSubmittingReview(true);
    try {
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      const { data: newReview } = await axios.post(`/api/products/${product.id}/reviews/`, reviewData, config);
      
      toast.success("Review submitted successfully");
      
      // Update UI instantly - prepend the new review to the list
      const updatedReviews = [newReview, ...(product.reviews || [])];
      
      // Update counts and average rating locally for instant feedback
      const newNumReviews = (product.numReviews || 0) + 1;
      const newRating = ((product.rating || 0) * (product.numReviews || 0) + parseInt(reviewData.rating)) / newNumReviews;

      setProduct({ 
        ...product, 
        reviews: updatedReviews, 
        rating: newRating, 
        numReviews: newNumReviews 
      });
      
      // Clear fields
      setReviewData({ rating: 5, comment: '' });
    } catch (error) {
      toast.error(error.response?.data?.detail || "Error submitting review");
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh', color: 'var(--color-gold)' }}>
      <Loader className="animate-spin" size={48} />
    </div>
  );

  if (!product) return <div className="container">Product Not Found</div>;

  return (
    <div className="bg-nude main-page-content" style={{ minHeight: '100vh', transition: 'background-color 0.5s ease' }}>
      
      {/* Lightbox Modal */}
      {isLightboxOpen && (
        <div className="modal-overlay" onClick={closeLightbox}>
           <div className="modal-content glass" onClick={e => e.stopPropagation()} style={{ width: '90vw', maxWidth: '800px', padding: 0, height: '80vh' }}>
              <button className="modal-close" onClick={closeLightbox}><Plus style={{ transform: 'rotate(45deg)' }} /></button>
              <div style={{ position: 'relative', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <button className="nav-btn left" onClick={(e) => { e.stopPropagation(); setLightboxIndex((lightboxIndex - 1 + product.images.length) % product.images.length) }}><Plus style={{ transform: 'rotate(-45deg)'}} /></button>
                  <img 
                    src={product.images[lightboxIndex]?.url || product.images[lightboxIndex]} 
                    alt="" 
                    style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }} 
                  />
                  <button className="nav-btn right" onClick={(e) => { e.stopPropagation(); setLightboxIndex((lightboxIndex + 1) % product.images.length) }}><Plus style={{ transform: 'rotate(135deg)'}} /></button>
              </div>
           </div>
        </div>
      )}

      {/* Size Chart Modal */}
      {isSizeChartOpen && (
        <div className="modal-overlay" onClick={() => setIsSizeChartOpen(false)}>
           <div className="modal-content glass" onClick={e => e.stopPropagation()} style={{ width: '90vw', maxWidth: '600px', padding: '3rem' }}>
              <button className="modal-close" onClick={() => setIsSizeChartOpen(false)}><Plus style={{ transform: 'rotate(45deg)' }} /></button>
              <h2 style={{ fontFamily: 'var(--font-heading)', marginBottom: '2rem', textAlign: 'center' }}>Size Measurement Guide</h2>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid var(--color-border)' }}>
                    <th style={{ padding: '1rem' }}>Size</th>
                    <th style={{ padding: '1rem' }}>Bust (in)</th>
                    <th style={{ padding: '1rem' }}>Waist (in)</th>
                    <th style={{ padding: '1rem' }}>Hip (in)</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ['XS', '32', '24', '34'],
                    ['S', '34', '26', '36'],
                    ['M', '36', '28', '38'],
                    ['L', '38', '30', '40'],
                    ['XL', '40', '32', '42'],
                    ['2XL', '42', '34', '44']
                  ].map(([s, b, w, h]) => (
                    <tr key={s} style={{ borderBottom: '1px solid var(--color-border)' }}>
                      <td style={{ padding: '1rem', fontWeight: 600 }}>{s}</td>
                      <td style={{ padding: '1rem' }}>{b}</td>
                      <td style={{ padding: '1rem' }}>{w}</td>
                      <td style={{ padding: '1rem' }}>{h}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p style={{ marginTop: '2rem', fontSize: '0.8rem', color: 'var(--color-text-light)', textAlign: 'center' }}>
                *All measurements are in inches and refer to body dimensions. 
              </p>
           </div>
        </div>
      )}

      {/* Floating Buttons */}
      <a href="https://wa.me/1234567890" target="_blank" rel="noreferrer" className="whatsapp-btn">
        <MessageCircle size={32} />
      </a>

      {/* Sticky CTA */}
      <div className={`sticky-cta ${isStickyVisible ? 'visible' : ''}`}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <img src={activeImage} alt="" style={{ width: '50px', height: '60px', objectFit: 'cover' }} />
          <div>
            <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{product.name}</div>
            <div style={{ color: 'var(--color-gold)', fontWeight: 700 }}>₹{product.price}</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
            <button onClick={() => addToCartHandler(false)} className="btn btn-outline" style={{ padding: '0.8rem 2rem' }}>
                CART
            </button>
            <button onClick={() => addToCartHandler(true)} className="btn btn-primary" style={{ padding: '0.8rem 2rem' }}>
                BUY NOW
            </button>
        </div>
      </div>

      <div className="container" style={{ padding: '4rem 2rem 8rem 2rem' }}>
        
        {/* Admin Controls */}
        {userInfo && userInfo.isAdmin && (
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '2rem' }}>
            <button 
              onClick={() => setIsEditMode(!isEditMode)}
              className="btn" 
              style={{ padding: '0.6rem 1.5rem', backgroundColor: isEditMode ? 'var(--color-primary)' : 'var(--color-gold)', color: 'white', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            >
              <Plus style={{ transform: isEditMode ? 'rotate(45deg)' : 'none' }} />
              {isEditMode ? 'Cancel Editing' : 'Edit Product'}
            </button>
          </div>
        )}

        <div className="grid grid-cols-2" style={{ gap: '6rem', alignItems: 'flex-start' }}>
          
          {/* LEFT: IMAGE GALLERY */}
          <div className="product-gallery-section" style={{ display: 'flex', gap: '1.5rem', position: 'sticky', top: '100px' }}>
            
            {/* Vertical Thumbnails */}
            <div className="thumbnail-strip" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {product.images.map((img, idx) => (
                <div 
                  key={img.id || idx} 
                  style={{ position: 'relative' }}
                >
                  <div 
                    onClick={() => { setActiveImage(img.url); setLightboxIndex(idx); }}
                    className={`thumb-box ${activeImage === img.url ? 'active' : ''}`}
                    style={{ 
                      width: '70px', height: '90px', cursor: 'pointer', overflow: 'hidden', 
                      border: activeImage === img.url ? '1px solid var(--color-gold)' : '1px solid var(--color-border)',
                      opacity: activeImage === img.url ? 1 : 0.6,
                      transition: 'var(--transition-fast)'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
                    onMouseLeave={(e) => activeImage !== img.url && (e.currentTarget.style.opacity = '0.6')}
                  >
                    <img src={img.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                  {isEditMode && (
                    <button 
                      onClick={() => deleteImageHandler(img.id)}
                      style={{ position: 'absolute', top: '-5px', right: '-5px', background: 'red', color: 'white', border: 'none', borderRadius: '50%', width: '18px', height: '18px', fontSize: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 10 }}
                    >
                      <Plus style={{ transform: 'rotate(45deg)' }} size={12} />
                    </button>
                  )}
                </div>
              ))}
              
              {isEditMode && (
                <div style={{ width: '70px', height: '90px', border: '1px dashed var(--color-gold)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
                    <Plus size={20} color="var(--color-gold)" />
                    <input 
                      type="file" 
                      onChange={uploadFileHandler} 
                      style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer' }}
                      title="Upload new image"
                    />
                </div>
              )}
            </div>

            {/* Main Image with Zoom */}
            <div 
              className="main-image-container"
              style={{ flex: 1, position: 'relative', overflow: 'hidden', backgroundColor: 'var(--color-secondary)', cursor: 'zoom-in', aspectRatio: '3.5/5' }}
              onMouseMove={isEditMode ? null : handleMouseMove}
              onMouseLeave={handleMouseLeave}
              onClick={() => openLightbox(lightboxIndex)}
            >
              {uploading ? (
                 <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(255,255,255,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 20 }}>
                    <Loader className="animate-spin" size={32} />
                 </div>
              ) : null}
              <img src={activeImage} alt={product.name} className="fade-in main-product-img" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              
              {/* Zoom Overlay */}
              {!isEditMode && (
                <div style={{
                  position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                  backgroundRepeat: 'no-repeat', backgroundSize: '200%',
                  pointerEvents: 'none',
                  ...zoomStyle
                }} />
              )}

              {/* Action Icons */}
              <div style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <button className="glass" style={{ width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Heart size={20} />
                </button>
                <button className="glass" style={{ width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Share2 size={20} />
                </button>
              </div>
            </div>
          </div>

          {/* RIGHT: PRODUCT DETAILS */}
          <div className="fade-in product-details-col" ref={detailsRef}>
            <div style={{ fontSize: '0.8rem', fontWeight: 700, letterSpacing: '0.2em', color: 'var(--color-gold)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
              {product.brand}
            </div>

            {isEditMode ? (
              <input 
                value={editData.name}
                onChange={e => setEditData({ ...editData, name: e.target.value })}
                className="form-input"
                style={{ fontSize: '2rem', fontWeight: 600, width: '100%', marginBottom: '1rem' }}
              />
            ) : (
              <div style={{ marginBottom: '1rem' }}>
                <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '2.5rem', fontWeight: 600, marginBottom: '0.5rem', lineHeight: 1.2 }}>
                    {product.name}
                </h1>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <div style={{ display: 'flex', gap: '2px', color: 'var(--color-gold)' }}>
                        {[...Array(5)].map((_, i) => (
                            <Star key={i} size={14} fill={i < Math.round(product.rating || 0) ? "currentColor" : "none"} />
                        ))}
                    </div>
                    <span style={{ fontSize: '0.85rem', color: 'var(--color-text-light)' }}>({product.numReviews || 0} reviews)</span>
                </div>
              </div>
            )}
            
            {/* Price & Discount */}
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '1.5rem', marginBottom: '1.5rem' }}>
              {isEditMode ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                   <span>₹</span>
                   <input 
                    type="number"
                    value={editData.price}
                    onChange={e => setEditData({ ...editData, price: e.target.value })}
                    className="form-input"
                    style={{ fontSize: '1.5rem', fontWeight: 700, width: '150px' }}
                   />
                </div>
              ) : (
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '1rem' }}>
                    <div style={{ fontSize: '1.8rem', fontWeight: 700 }}>₹{product.price}</div>
                    {product.is_archive_sale && (
                        <div style={{ fontSize: '1.2rem', color: '#999', textDecoration: 'line-through' }}>₹{product.originalPrice}</div>
                    )}
                </div>
              )}
              {product.is_archive_sale && !isEditMode && (
                  <div style={{ color: 'var(--color-discount)', fontWeight: 800, fontSize: '0.9rem', letterSpacing: '0.05em' }}>
                    -{product.discount}% OFF
                  </div>
              )}
            </div>

            {isEditMode ? (
              <textarea 
                value={editData.description}
                onChange={e => setEditData({ ...editData, description: e.target.value })}
                className="form-input"
                style={{ width: '100%', height: '150px', marginBottom: '2rem', lineHeight: 1.6 }}
              />
            ) : (
              <div style={{ color: 'var(--color-text-light)', marginBottom: '2.5rem', fontSize: '1rem', lineHeight: 1.8 }}>
                {product.description}
              </div>
            )}

            {isEditMode && (
              <button 
                onClick={saveProductHandler}
                className="btn btn-primary"
                style={{ padding: '1rem 3rem', marginBottom: '2rem', width: '100%' }}
              >
                SAVE ALL CHANGES
              </button>
            )}

            {/* Size Selection */}
            <div style={{ marginBottom: '2.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                 <span style={{ fontWeight: 600, textTransform: 'uppercase', fontSize: '0.8rem', letterSpacing: '0.1em' }}>Select Size</span>
                 <button 
                  onClick={() => setIsSizeChartOpen(true)}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--color-text-light)', fontSize: '0.8rem', textDecoration: 'underline' }}>
                   <Ruler size={14} /> Size Chart
                 </button>
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                 {product.sizes.map(s => (
                   <button 
                    key={s.id} 
                    onClick={() => s.stock > 0 && setSelectedSize(s.size)}
                    disabled={s.stock === 0}
                    className={selectedSize === s.size ? 'size-btn-active' : 'size-btn-inactive'}
                    style={{ 
                      width: '4rem', height: '3.5rem', 
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      border: selectedSize === s.size ? '2px solid var(--color-primary)' : '1px solid var(--color-border)', 
                      backgroundColor: s.stock === 0 ? 'rgba(0,0,0,0.03)' : (selectedSize === s.size ? 'var(--color-primary)' : 'transparent'),
                      color: s.stock === 0 ? '#bbb' : (selectedSize === s.size ? 'var(--color-bg)' : 'var(--color-text)'),
                      fontWeight: 800,
                      transition: 'var(--transition-fast)',
                      cursor: s.stock === 0 ? 'not-allowed' : 'pointer',
                      position: 'relative',
                      overflow: 'hidden',
                      fontSize: '1rem'
                    }}>
                     {s.size}
                     {s.stock === 0 && (
                        <div style={{ position: 'absolute', width: '140%', height: '1px', background: '#ccc', transform: 'rotate(-45deg)' }} />
                     )}
                   </button>
                 ))}
              </div>
              {selectedSize && product.sizes.find(s => s.size === selectedSize)?.stock <= 5 && product.sizes.find(s => s.size === selectedSize)?.stock > 0 && (
                <div style={{ marginTop: '1rem', color: '#c0392b', fontSize: '0.85rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Info size={14} /> Only {product.sizes.find(s => s.size === selectedSize)?.stock} left in stock - order soon
                </div>
              )}
            </div>

            {/* Quantity Selection */}
            <div style={{ marginBottom: '2.5rem' }}>
              <span style={{ display: 'block', fontWeight: 600, textTransform: 'uppercase', fontSize: '0.8rem', letterSpacing: '0.1em', marginBottom: '1rem' }}>Quantity</span>
              <div className="qty-selector">
                <button className="qty-btn" onClick={() => setQuantity(Math.max(1, quantity - 1))}><Minus size={16}/></button>
                <input type="text" className="qty-input" value={quantity} readOnly />
                <button className="qty-btn" onClick={() => setQuantity(quantity + 1)}><Plus size={16}/></button>
              </div>
            </div>

            {/* Main CTA */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '2.5rem' }}>
                <button 
                  onClick={() => addToCartHandler(false)} 
                  className="btn btn-outline" 
                  style={{ padding: '1.25rem', fontSize: '0.9rem', letterSpacing: '0.15em' }}
                >
                  ADD TO CART
                </button>
                <button 
                  onClick={() => addToCartHandler(true)} 
                  className="btn btn-primary" 
                  style={{ padding: '1.25rem', fontSize: '0.9rem', letterSpacing: '0.15em' }}
                >
                  BUY NOW
                </button>
            </div>

            {/* Offers Box */}
            <div className="dashed-box" style={{ marginBottom: '2.5rem' }}>
              <div style={{ fontWeight: 700, fontSize: '0.85rem', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Exclusive Offers</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div style={{ fontSize: '0.9rem' }}><span className="offer-tag">Flat ₹500 Off</span> above ₹8,500</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--color-text-light)', display: 'flex', flexWrap: 'wrap', gap: '1.5rem', marginTop: '1rem' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}><Truck size={14} color="var(--color-gold)"/> Free Shipping</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}><ShieldCheck size={14} color="var(--color-gold)"/> Authentic Only</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}><RotateCcw size={14} color="var(--color-gold)"/> 7-Day Returns</span>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* REVIEWS SECTION */}
        <div style={{ marginTop: '8rem', borderTop: '1px solid var(--color-border)', paddingTop: '5rem' }}>
            <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
                <span className="subtitle">Real Experiences</span>
                <h2 className="title" style={{ marginTop: '1rem' }}>Product Reviews</h2>
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1rem', marginTop: '0.5rem' }}>
                    <div style={{ display: 'flex', gap: '2px', color: 'var(--color-gold)' }}>
                        {[...Array(5)].map((_, i) => (
                            <Star key={i} size={18} fill={i < Math.round(product.rating || 0) ? "currentColor" : "none"} />
                        ))}
                    </div>
                    <span style={{ color: 'var(--color-text)', fontWeight: 700, fontSize: '1.2rem' }}>
                        {product.rating?.toFixed(1) || '0.0'}
                    </span>
                    <span style={{ color: 'var(--color-text-light)', fontSize: '0.9rem' }}>
                        ({product.numReviews || 0} reviews)
                    </span>
                </div>
            </div>

            {/* Add Review Form */}
            {userInfo && (
                <div className="dashed-box" style={{ maxWidth: '800px', margin: '0 auto 4rem auto', backgroundColor: 'var(--color-secondary)' }}>
                    <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1.5rem', textTransform: 'uppercase' }}>Write a Review</h3>
                    <form onSubmit={submitReviewHandler}>
                        <div className="form-group">
                            <label className="form-label">Rating</label>
                            <select 
                                value={reviewData.rating}
                                onChange={e => setReviewData({ ...reviewData, rating: e.target.value })}
                                className="form-input"
                            >
                                <option value="5">5 - Excellent</option>
                                <option value="4">4 - Very Good</option>
                                <option value="3">3 - Good</option>
                                <option value="2">2 - Fair</option>
                                <option value="1">1 - Poor</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label className="form-label">Comment</label>
                            <textarea 
                                value={reviewData.comment}
                                onChange={e => setReviewData({ ...reviewData, comment: e.target.value })}
                                className="form-input"
                                rows="4"
                                placeholder="Share your experience with this product..."
                            />
                        </div>
                        <button type="submit" className="btn btn-gold" disabled={submittingReview}>
                            {submittingReview ? 'Submitting...' : 'Post Review'}
                        </button>
                    </form>
                </div>
            )}

            <div className="grid grid-cols-2" style={{ gap: '2rem' }}>
                {product.reviews && product.reviews.length > 0 ? (
                    product.reviews.map(review => (
                        <div key={review.id} className="dashed-box" style={{ background: 'var(--color-secondary)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                                <div style={{ display: 'flex', gap: '2px', color: 'var(--color-gold)' }}>
                                    {[...Array(5)].map((_, i) => (
                                        <Star key={i} size={14} fill={i < review.rating ? "currentColor" : "none"} />
                                    ))}
                                </div>
                                <span style={{ fontSize: '0.75rem', color: 'var(--color-text-light)' }}>
                                    {new Date(review.created_at).toLocaleDateString()}
                                </span>
                            </div>
                            <p style={{ fontStyle: 'italic', marginBottom: '1rem', lineHeight: 1.6, color: 'var(--color-text)' }}>
                                "{review.comment}"
                            </p>
                            <div style={{ fontWeight: 700, fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                {review.user_name}
                                <ShieldCheck size={14} color="#2ecc71" />
                            </div>
                        </div>
                    ))
                ) : (
                    <div style={{ gridColumn: 'span 2', textAlign: 'center', padding: '4rem', color: 'var(--color-text-light)' }}>
                        No reviews yet. Be the first to share your thoughts!
                    </div>
                )}
            </div>
        </div>

      </div>
    </div>
  );
}
