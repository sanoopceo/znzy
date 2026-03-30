import { useState, useEffect, useCallback, useRef } from 'react';
import { useApi } from '../../hooks/useApi';
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  X,
  Plus as PlusIcon,
  Image as ImageIcon,
  Check
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { CardSkeleton } from '../../components/common/Skeleton';
import axios from 'axios';

export default function ProductManagement() {
  const { loading, request } = useApi();
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({ 
    name: '', 
    price: '', 
    category: 'Clothing', 
    description: '',
    stock: 0,
    is_new: false,
    is_bestseller: false,
    is_archive_sale: false,
    discount_percentage: 0,
    collection_name: ''
  });

  // Size Stock State
  const [productSizes, setProductSizes] = useState([
    { size: 'S', stock: 0 },
    { size: 'M', stock: 0 },
    { size: 'L', stock: 0 },
    { size: 'XL', stock: 0 },
  ]);

  // Image State
  const [mainImage, setMainImage] = useState(null);
  const [mainPreview, setMainPreview] = useState(null);
  const [sideImages, setSideImages] = useState([]); // Array of File objects for NEW uploads
  const [sidePreviews, setSidePreviews] = useState([]); // Array of { id, url, isExisting }

  const mainInputRef = useRef(null);
  const sideInputRef = useRef(null);

  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);

  const fetchProducts = useCallback(async (p = 1) => {
    try {
      const data = await request({ 
        url: `/api/admin/dashboard/products/?page=${p}&page_size=20`, 
        method: 'GET' 
      });
      setProducts(data.products || []);
      setPage(data.page || 1);
      setPages(data.pages || 1);
      setTotalProducts(data.count || 0);
    } catch (err) {
      console.error(err);
    }
  }, [request]);

  useEffect(() => {
    fetchProducts(page);
  }, [fetchProducts, page]);

  const openForm = (product = null) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name,
        price: product.original_price || product.price,
        category: product.category_name || product.category || 'Clothing',
        description: product.description || '',
        stock: product.stock || 0,
        is_new: product.is_new || false,
        is_bestseller: product.is_bestseller || false,
        is_archive_sale: product.is_archive_sale || false,
        discount_percentage: product.discount_percentage || 0,
        collection_name: product.collection_name || ''
      });
      setMainPreview(product.main_image);
      setSidePreviews(product.side_images?.map(img => ({ id: img.id, url: img.image, isExisting: true })) || []);
      
      // Fetch sizes if editing
      fetchProductSizes(product.id);
    } else {
      setEditingProduct(null);
      setFormData({ name: '', price: '', category: 'Clothing', description: '', stock: 0, is_new: false, is_bestseller: false, is_archive_sale: false, discount_percentage: 0, collection_name: '' });
      setMainPreview(null);
      setSidePreviews([]);
      setProductSizes([
        { size: 'S', stock: 0 },
        { size: 'M', stock: 0 },
        { size: 'L', stock: 0 },
        { size: 'XL', stock: 0 },
      ]);
    }
    setMainImage(null);
    setSideImages([]);
    setShowModal(true);
  };

  const fetchProductSizes = async (productId) => {
    try {
        const { data } = await axios.get(`/api/products/${productId}/sizes/`);
        if (data && data.length > 0) {
            setProductSizes(data);
        } else {
            setProductSizes([
                { size: 'S', stock: 0 },
                { size: 'M', stock: 0 },
                { size: 'L', stock: 0 },
                { size: 'XL', stock: 0 },
            ]);
        }
    } catch (err) {
        console.error("Failed to fetch sizes", err);
    }
  };

  const handleSizeStockChange = (size, value) => {
    setProductSizes(prev => prev.map(s => s.size === size ? { ...s, stock: parseInt(value) || 0 } : s));
  };

  const handleMainImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setMainImage(file);
      setMainPreview(URL.createObjectURL(file));
      toast.success('Main image selected');
    }
  };

  const handleSideImagesChange = (e) => {
    const files = Array.from(e.target.files);
    const availableSlots = 4 - sidePreviews.length;
    
    if (files.length > availableSlots) {
      toast.error(`You can only add ${availableSlots} more side images`);
      return;
    }

    const newSideImages = [...sideImages, ...files];
    setSideImages(newSideImages);

    const newPreviews = files.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      url: URL.createObjectURL(file),
      isExisting: false,
      file: file
    }));
    
    setSidePreviews([...sidePreviews, ...newPreviews]);
    toast.success(`${files.length} images added`);
  };

  const removeSideImage = async (preview) => {
    if (preview.isExisting) {
      toast((t) => (
        <span>
            Confirm image removal from server?
            <button 
                onClick={async () => {
                    toast.dismiss(t.id);
                    try {
                        const userInfo = JSON.parse(localStorage.getItem('userInfo'));
                        await axios.delete(`/api/admin/dashboard/products/${editingProduct.id}/side-images/${preview.id}/delete/`, {
                            headers: { Authorization: `Bearer ${userInfo.token}` }
                        });
                        toast.success('Image deleted from server');
                        setSidePreviews(prev => prev.filter(p => p.id !== preview.id));
                    } catch (err) {
                        toast.error('Failed to delete image');
                    }
                }}
                style={{ marginLeft: '1rem', background: '#dc2626', color: '#fff', border: 'none', padding: '0.2rem 0.5rem', borderRadius: '4px', cursor: 'pointer' }}
            >
                DELETE
            </button>
        </span>
      ), { duration: 5000 });
      return;
    }
    
    setSidePreviews(sidePreviews.filter(p => p.id !== preview.id));
    if (!preview.isExisting) {
        // If it was a newly added file not yet uploaded
        setSideImages(sideImages.filter(f => f !== preview.file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const userInfo = JSON.parse(localStorage.getItem('userInfo'));
    
    const uploadData = new FormData();
    Object.keys(formData).forEach(key => {
        uploadData.append(key, formData[key]);
    });
    
    if (mainImage) {
        uploadData.append('main_image', mainImage);
    }
    
    sideImages.forEach(file => {
        uploadData.append('side_images', file);
    });

    try {
      const config = {
        headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${userInfo.token}`
        }
      };

      if (editingProduct) {
        await axios.put(`/api/admin/dashboard/products/${editingProduct.id}/update/`, uploadData, config);
        toast.success('Product updated');
      } else {
        const { data: newProd } = await axios.post('/api/admin/dashboard/products/create/', uploadData, config);
        // Also save sizes for new product
        await axios.put(`/api/products/${newProd.id}/sizes/update/`, { sizes: productSizes }, config);
        toast.success('Product created with sizes');
      }

      if (editingProduct) {
        // Also update sizes
        await axios.put(`/api/products/${editingProduct.id}/sizes/update/`, { sizes: productSizes }, config);
      }
      setShowModal(false);
      fetchProducts(page);
    } catch (err) {
        toast.error(err.response?.data?.detail || 'Execution failed');
    }
  };

  const deleteProduct = async (id) => {
    toast((t) => (
      <span>
          Permanently delete this product?
          <button 
              onClick={async () => {
                  toast.dismiss(t.id);
                  try {
                    await request({ url: `/api/admin/dashboard/products/${id}/delete/`, method: 'DELETE' });
                    toast.success('Product deleted');
                    fetchProducts(page);
                  } catch (err) {
                    toast.error('Deletion failed');
                  }
              }}
              style={{ marginLeft: '1rem', background: '#dc2626', color: '#fff', border: 'none', padding: '0.2rem 0.5rem', borderRadius: '4px', cursor: 'pointer' }}
          >
              CONFIRM
          </button>
      </span>
    ), { duration: 5000 });
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="admin-card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Inventory Hub</h2>
        
        <div style={{ display: 'flex', gap: '1rem' }}>
          <div style={{ position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#888' }} />
            <input 
              type="text" 
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="form-input"
              style={{ padding: '0.6rem 2.5rem', width: '250px' }}
            />
          </div>
          <button 
             onClick={() => openForm()}
             className="btn btn-primary" 
             style={{ padding: '0.6rem 1.2rem', gap: '0.5rem', borderRadius: '10px' }}
          >
            <Plus size={16} /> NEW PRODUCT
          </button>
        </div>
      </div>

      {loading && products.length === 0 ? (
        <CardSkeleton height="200px" />
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #f0f0f0', color: '#999', fontSize: '0.75rem', textTransform: 'uppercase' }}>
                <th style={{ padding: '1rem' }}>Product</th>
                <th style={{ padding: '1rem' }}>Category</th>
                <th style={{ padding: '1rem' }}>Stock</th>
                <th style={{ padding: '1rem' }}>Base Price</th>
                <th style={{ padding: '1rem' }}>Sale Status</th>
                <th style={{ padding: '1rem', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((p) => (
                <tr key={p.id} style={{ borderBottom: '1px solid #f9f9f9', fontSize: '0.85rem' }}>
                  <td style={{ padding: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <img 
                          src={p.main_image || 'https://via.placeholder.com/150'} 
                          alt={p.name} 
                          style={{ width: '40px', height: '50px', objectFit: 'cover', borderRadius: '4px' }} 
                        />
                        <div>
                            <p style={{ fontWeight: 700 }}>{p.name}</p>
                            <p style={{ fontSize: '0.7rem', color: '#aaa' }}>ID: {p.id}</p>
                        </div>
                    </div>
                  </td>
                  <td style={{ padding: '1rem', color: '#666' }}>{p.category_name}</td>
                  <td style={{ padding: '1rem' }}>
                    <span style={{ 
                        padding: '0.2rem 0.6rem', 
                        borderRadius: '4px', 
                        backgroundColor: p.stock > 0 ? '#f0fdf4' : '#fef2f2',
                        color: p.stock > 0 ? '#15803d' : '#dc2626',
                        fontWeight: 700,
                        fontSize: '0.75rem'
                    }}>
                        {p.stock} units
                    </span>
                  </td>
                  <td style={{ padding: '1rem', fontWeight: 600 }}>₹{p.original_price}</td>
                  <td style={{ padding: '1rem' }}>
                    {p.is_archive_sale ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--color-gold)', fontWeight: 800 }}>
                            <Check size={14} /> ACTIVE ({p.discount_percentage}%)
                        </div>
                    ) : (
                        <span style={{ color: '#ccc' }}>Regular Piece</span>
                    )}
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                        <button onClick={() => openForm(p)} className="btn-admin-action"><Edit size={16} /></button>
                        <button onClick={() => deleteProduct(p.id)} className="btn-admin-action" style={{ color: '#dc2626' }}><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {/* Pagination Controls */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '2rem', padding: '1rem' }}>
             <p style={{ fontSize: '0.8rem', color: '#888' }}>
                Showing page <strong>{page}</strong> of <strong>{pages}</strong> ({totalProducts} total products)
             </p>
             <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button 
                    disabled={page === 1} 
                    onClick={() => setPage(page - 1)}
                    className="btn-admin-action"
                    style={{ opacity: page === 1 ? 0.5 : 1, cursor: page === 1 ? 'not-allowed' : 'pointer', fontSize: '0.75rem', padding: '0.5rem 1rem' }}
                >
                    PREVIOUS
                </button>
                {[...Array(pages).keys()].map(x => (
                    <button 
                        key={x + 1}
                        onClick={() => setPage(x + 1)}
                        className="btn-admin-action"
                        style={{ 
                            background: page === x + 1 ? 'var(--color-primary)' : '#fff',
                            color: page === x + 1 ? '#fff' : '#666',
                            fontWeight: page === x + 1 ? 800 : 400,
                            padding: '0.5rem 1rem'
                        }}
                    >
                        {x + 1}
                    </button>
                ))}
                <button 
                    disabled={page === pages} 
                    onClick={() => setPage(page + 1)}
                    className="btn-admin-action"
                    style={{ opacity: page === pages ? 0.5 : 1, cursor: page === pages ? 'not-allowed' : 'pointer', fontSize: '0.75rem', padding: '0.5rem 1rem' }}
                >
                    NEXT
                </button>
             </div>
          </div>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" style={{ display: 'flex', zIndex: 3000 }}>
          <div className="admin-card" style={{ width: '100%', maxWidth: '800px', padding: '2.5rem', position: 'relative', maxHeight: '90vh', overflowY: 'auto' }}>
            <button onClick={() => setShowModal(false)} style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'none', border: 'none', cursor: 'pointer' }}>
               <X />
            </button>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '2.5rem' }}>
               {editingProduct ? 'Update Product Assets' : 'New Collection Piece'}
            </h3>
            
            <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '2rem' }}>
               
               {/* Image Section */}
               <div style={{ display: 'grid', gridTemplateColumns: '2fr 3fr', gap: '2rem' }}>
                    <div>
                        <label className="form-label">Main Campaign Image</label>
                        <div 
                          onClick={() => mainInputRef.current.click()}
                          style={{ 
                            width: '100%', height: '300px', border: '1.5px dashed #ddd', 
                            borderRadius: '12px', overflow: 'hidden', cursor: 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            backgroundColor: '#fafafa', position: 'relative'
                        }}>
                            {mainPreview ? (
                                <img src={mainPreview} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : (
                                <div style={{ textAlign: 'center', color: '#888' }}>
                                    <PlusIcon size={32} style={{ margin: '0 auto 1rem' }} />
                                    <p style={{ fontSize: '0.8rem', fontWeight: 600 }}>Click to upload main image</p>
                                </div>
                            )}
                            <input ref={mainInputRef} type="file" hidden onChange={handleMainImageChange} accept="image/*" />
                        </div>
                    </div>
                    <div>
                        <label className="form-label">Side Details (Max 4)</label>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
                            {sidePreviews.map((prev) => (
                                <div key={prev.id} style={{ position: 'relative', height: '140px', borderRadius: '10px', overflow: 'hidden' }}>
                                    <img src={prev.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    <button 
                                      type="button"
                                      onClick={() => removeSideImage(prev)}
                                      style={{ position: 'absolute', top: '5px', right: '5px', background: 'rgba(255,0,0,0.8)', color: 'white', border: 'none', borderRadius: '50%', width: '22px', height: '22px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                                    >
                                        <X size={12} />
                                    </button>
                                </div>
                            ))}
                            {sidePreviews.length < 4 && (
                                <div 
                                    onClick={() => sideInputRef.current.click()}
                                    style={{ 
                                        height: '140px', border: '1.5px dashed #eee', borderRadius: '10px',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        cursor: 'pointer', backgroundColor: '#fdfdfd', color: '#aaa'
                                    }}
                                >
                                    <ImageIcon size={24} />
                                    <input ref={sideInputRef} type="file" hidden multiple onChange={handleSideImagesChange} accept="image/*" />
                                </div>
                            )}
                        </div>
                    </div>
               </div>

               {/* Text Section */}
               <div className="form-group">
                  <label className="form-label">Product Title</label>
                  <input className="form-input" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required />
               </div>
               
               <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }}>
                  <div className="form-group">
                     <label className="form-label">Base Price (INR)</label>
                     <input type="number" className="form-input" value={formData.price} onChange={(e) => setFormData({...formData, price: e.target.value})} required />
                  </div>
                  <div className="form-group">
                     <label className="form-label">Inventory Stock</label>
                     <input type="number" className="form-input" value={formData.stock} onChange={(e) => setFormData({...formData, stock: e.target.value})} required />
                  </div>
                  <div className="form-group">
                     <label className="form-label">Collection Path</label>
                     <select className="form-input" value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})}>
                        <option>Clothing</option>
                        <option>Accessories</option>
                        <option>Footwear</option>
                        <option>Luxe Series</option>
                     </select>
                  </div>
               </div>

               <div style={{ display: 'flex', gap: '2rem', background: '#f8f9fa', padding: '1.5rem', borderRadius: '12px', border: '1px solid #eee' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', fontSize: '0.75rem', fontWeight: 800, color: formData.is_new ? '#000' : '#888', cursor: 'pointer' }}>
                     <input type="checkbox" checked={formData.is_new} onChange={e => setFormData({...formData, is_new: e.target.checked})} /> NEW IN
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', fontSize: '0.75rem', fontWeight: 800, color: formData.is_bestseller ? '#fb923c' : '#888', cursor: 'pointer' }}>
                     <input type="checkbox" checked={formData.is_bestseller} onChange={e => setFormData({...formData, is_bestseller: e.target.checked})} /> BESTSELLER
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', fontSize: '0.75rem', fontWeight: 800, color: formData.is_archive_sale ? '#dc2626' : '#888', cursor: 'pointer' }}>
                     <input type="checkbox" checked={formData.is_archive_sale} onChange={e => setFormData({...formData, is_archive_sale: e.target.checked})} /> ARCHIVE SALE
                  </label>
               </div>

               {formData.is_archive_sale && (
                  <div className="form-group slide-up">
                     <label className="form-label">Instant Discount (%)</label>
                     <input type="number" className="form-input" value={formData.discount_percentage} onChange={(e) => setFormData({...formData, discount_percentage: e.target.value})} />
                     <p style={{ fontSize: '0.7rem', color: '#999', marginTop: '0.5rem' }}>Final price will be ₹{(formData.price * (1 - formData.discount_percentage / 100)).toFixed(0)}</p>
                  </div>
               )}

               {/* Size Stock Management Section */}
               <div style={{ padding: '2rem', background: '#fafafa', borderRadius: '12px', border: '1px solid #eee' }}>
                  <h4 style={{ fontSize: '0.85rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '1.5rem', color: '#555' }}>
                    <PlusIcon size={14} style={{ marginRight: '0.5rem' }} /> Size Stock Management
                  </h4>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
                    {['S', 'M', 'L', 'XL'].map(sizeName => {
                        const sObj = productSizes.find(s => s.size === sizeName) || { size: sizeName, stock: 0 };
                        return (
                            <div key={sizeName}>
                                <label className="form-label" style={{ fontSize: '0.7rem', color: '#999' }}>Stock ({sizeName})</label>
                                <input 
                                    type="number" 
                                    className="form-input" 
                                    value={sObj.stock} 
                                    onChange={(e) => handleSizeStockChange(sizeName, e.target.value)}
                                    style={{ borderRadius: '8px' }}
                                />
                            </div>
                        );
                    })}
                  </div>
               </div>

               <div className="form-group">
                  <label className="form-label">Editorial Description</label>
                  <textarea className="form-input" rows={4} value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} placeholder="Craft a narrative for this piece..." />
               </div>
               
               <button type="submit" disabled={loading} className="btn btn-primary btn-block" style={{ padding: '1.5rem', borderRadius: '12px' }}>
                  {loading ? 'SYNCHRONIZING ASSETS...' : (editingProduct ? 'UPDATE ARCHIVE' : 'ADD TO REPOSITORY')}
               </button>
            </form>
          </div>
        </div>
      )}
      <style>{`
         .btn-admin-action { background: #fff; border: 1px solid #f0f0f0; padding: 0.6rem; border-radius: 8px; cursor: pointer; transition: all 0.2s; display: flex; align-items: center; justify-content: center; color: #666; }
         .btn-admin-action:hover { background: #fdfdfd; transform: translateY(-3px); box-shadow: 0 10px 20px rgba(0,0,0,0.04); color: #000; border-color: #ddd; }
      `}</style>
    </div>
  );
}
