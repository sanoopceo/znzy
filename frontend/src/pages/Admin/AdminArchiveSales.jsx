import { useState, useEffect } from 'react';
import axios from 'axios';
import { Tag, TrendingDown, Edit2, Check, X } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function AdminArchiveSales() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [discountValue, setDiscountValue] = useState(0);

  const fetchArchiveProducts = async () => {
    try {
      // Use the existing getProducts with filter
      const { data } = await axios.get('/api/products/?is_archive_sale=true');
      const list = data.products || data;
      setProducts(Array.isArray(list) ? list : []);
    } catch (err) {
      toast.error('Failed to load archive products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArchiveProducts();
  }, []);

  const handleUpdateDiscount = async (id) => {
    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      const config = { 
        headers: { 
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${userInfo.token}` 
        } 
      };
      
      const formData = new FormData();
      formData.append('discount_percentage', discountValue);
      formData.append('is_archive_sale', 'true');
      
      await axios.put(`/api/admin/dashboard/products/${id}/update/`, formData, config);
      
      toast.success('Discount updated');
      setEditingId(null);
      fetchArchiveProducts();
    } catch (err) {
      toast.error('Update failed');
    }
  };

  const removeFromArchive = async (id) => {
    toast((t) => (
      <span>
          Remove from Archive Sale?
          <button 
              onClick={async () => {
                  toast.dismiss(t.id);
                  try {
                    const userInfo = JSON.parse(localStorage.getItem('userInfo'));
                    const config = { 
                      headers: { 
                        'Content-Type': 'multipart/form-data',
                        Authorization: `Bearer ${userInfo.token}` 
                      } 
                    };
                    
                    const formData = new FormData();
                    formData.append('is_archive_sale', 'false');
                    formData.append('discount_percentage', 0);
                    
                    await axios.put(`/api/admin/dashboard/products/${id}/update/`, formData, config);
                    
                    toast.success('Removed from Archive');
                    fetchArchiveProducts();
                  } catch (err) {
                    toast.error('Operation failed');
                  }
              }}
              style={{ marginLeft: '1rem', background: '#dc2626', color: '#fff', border: 'none', padding: '0.2rem 0.5rem', borderRadius: '4px', cursor: 'pointer' }}
          >
              CONFIRM
          </button>
      </span>
    ), { duration: 5000 });
  };

  if (loading) return <div>Loading Archive Sales...</div>;

  return (
    <div className="fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Archive Sale Management</h2>
        <div style={{ display: 'flex', gap: '1rem', background: '#fff', padding: '0.8rem 1.5rem', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.03)' }}>
            <TrendingDown size={20} color="var(--color-gold)" />
            <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>{products.length} Items Live</span>
        </div>
      </div>

      <div className="admin-card" style={{ padding: 0, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ backgroundColor: '#fafafa', borderBottom: '1px solid #eee' }}>
              <th style={{ padding: '1.2rem 2rem', fontSize: '0.75rem', textTransform: 'uppercase', color: '#999' }}>Product</th>
              <th style={{ padding: '1.2rem 2rem', fontSize: '0.75rem', textTransform: 'uppercase', color: '#999' }}>Base Price</th>
              <th style={{ padding: '1.2rem 2rem', fontSize: '0.75rem', textTransform: 'uppercase', color: '#999' }}>Discount %</th>
              <th style={{ padding: '1.2rem 2rem', fontSize: '0.75rem', textTransform: 'uppercase', color: '#999' }}>Sale Price</th>
              <th style={{ padding: '1.2rem 2rem', fontSize: '0.75rem', textTransform: 'uppercase', color: '#999', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => {
              return (
                <tr key={p.id} style={{ borderBottom: '1px solid #f5f5f5', transition: 'background 0.2s' }}>
                  <td style={{ padding: '1.5rem 2rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <img 
                          src={p.main_image || '/placeholder.png'} 
                          alt="" 
                          style={{ width: '45px', height: '55px', objectFit: 'cover', borderRadius: '4px' }} 
                        />
                        <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{p.name}</div>
                    </div>
                  </td>
                  <td style={{ padding: '1.5rem 2rem', fontSize: '0.9rem', color: '#666' }}>₹{p.original_price}</td>
                  <td style={{ padding: '1.5rem 2rem' }}>
                    {editingId === p.id ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <input 
                          type="number" 
                          value={discountValue} 
                          onChange={(e) => setDiscountValue(e.target.value)}
                          style={{ width: '60px', padding: '0.4rem', borderRadius: '6px', border: '1px solid var(--color-gold)', outline: 'none' }}
                        />
                        <button onClick={() => handleUpdateDiscount(p.id)} style={{ color: '#27ae60' }}><Check size={18}/></button>
                        <button onClick={() => setEditingId(null)} style={{ color: '#ff4d4f' }}><X size={18}/></button>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontWeight: 800, color: 'var(--color-gold)' }}>
                        {p.discount_percentage}%
                        <button onClick={() => { setEditingId(p.id); setDiscountValue(p.discount_percentage); }} style={{ color: '#ccc' }}><Edit2 size={14}/></button>
                      </div>
                    )}
                  </td>
                  <td style={{ padding: '1.5rem 2rem', fontWeight: 800, color: '#000', fontSize: '1rem' }}>
                    ₹{p.discounted_price}
                  </td>
                  <td style={{ padding: '1.5rem 2rem', textAlign: 'right' }}>
                    <button 
                      onClick={() => removeFromArchive(p.id)}
                      className="btn btn-outline" 
                      style={{ padding: '0.5rem 1rem', fontSize: '0.65rem' }}
                    >
                      REMOVE ARCHIVE
                    </button>
                  </td>
                </tr>
              );
            })}
            {products.length === 0 && (
              <tr>
                <td colSpan="5" style={{ padding: '4rem', textAlign: 'center', color: '#999' }}>
                   <Tag size={40} style={{ margin: '0 auto 1rem', opacity: 0.2 }} />
                   No products in Archive Sale currently.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
