import { useState, useEffect, useCallback } from 'react';
import { useApi } from '../../hooks/useApi';
import axios from 'axios';
import { useContext } from 'react';
import { StoreContext } from '../../context/StoreContext';
import { 
  ShoppingBag, Search, Filter, Eye,
  CheckCircle, Clock, Truck, X,
  MapPin, User, Package, CreditCard,
  Phone, Mail, Tag
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { Skeleton } from '../../components/common/Skeleton';

// ─── STATUS HELPERS ──────────────────────────────────────────────────────────
const STATUS_STYLE = {
  Pending:    { bg: '#fff7ed', color: '#ea580c' },
  Processing: { bg: '#eff6ff', color: '#2563eb' },
  Shipped:    { bg: '#fefce8', color: '#ca8a04' },
  Delivered:  { bg: '#f0fdf4', color: '#16a34a' },
  Cancelled:  { bg: '#fef2f2', color: '#dc2626' },
};

const STATUS_ICON = {
  Delivered:  <CheckCircle size={12} />,
  Shipped:    <Truck size={12} />,
  Processing: <Package size={12} />,
  default:    <Clock size={12} />,
};

// ─── ORDER DETAIL MODAL ───────────────────────────────────────────────────────
function OrderDetailModal({ orderId, token, onClose, onStatusChange }) {
  const [order, setOrder]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      try {
        setLoading(true);
        const { data } = await axios.get(
          `/api/admin/dashboard/orders/${orderId}/detail/`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setOrder(data);
      } catch (e) {
        toast.error('Failed to load order details');
        onClose();
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [orderId]);

  const handleStatus = async (newStatus) => {
    try {
      setUpdatingStatus(true);
      await axios.put(
        `/api/admin/dashboard/orders/${orderId}/status/`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setOrder(prev => ({ ...prev, status: newStatus }));
      onStatusChange();
      toast.success(`Order marked as ${newStatus}`);
    } catch {
      toast.error('Status update failed');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleMarkPaid = async () => {
    try {
      await axios.put(
        `/api/orders/${orderId}/pay/`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setOrder(prev => ({ ...prev, is_paid: true }));
      onStatusChange();
      toast.success('Order marked as PAID');
    } catch {
      toast.error('Payment update failed');
    }
  };

  const statusStyle = order ? (STATUS_STYLE[order.status] || STATUS_STYLE.Pending) : {};

  return (
    <div 
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}
      onClick={onClose}
    >
      <div 
        onClick={e => e.stopPropagation()}
        style={{ 
          background: '#fff', width: '100%', maxWidth: '900px', maxHeight: '90vh',
          overflowY: 'auto', borderRadius: '4px', boxShadow: '0 25px 80px rgba(0,0,0,0.2)'
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.5rem 2rem', borderBottom: '1px solid #f0f0f0', position: 'sticky', top: 0, background: '#fff', zIndex: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ width: '36px', height: '36px', background: '#000', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ShoppingBag size={18} color="#fff" />
            </div>
            <div>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0 }}>
                Order #{orderId}
              </h2>
              {order && (
                <p style={{ fontSize: '0.72rem', color: '#999', margin: 0 }}>
                  {new Date(order.created_at).toLocaleString('en-IN', { dateStyle: 'long', timeStyle: 'short' })}
                </p>
              )}
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            {order && (
              <span style={{ 
                padding: '0.3rem 0.9rem', borderRadius: '20px', fontSize: '0.7rem',
                fontWeight: 700, ...statusStyle
              }}>
                {STATUS_ICON[order.status] || STATUS_ICON.default} {order.status}
              </span>
            )}
            <button onClick={onClose} style={{ background: '#f5f5f5', border: 'none', borderRadius: '50%', width: '34px', height: '34px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <X size={18} />
            </button>
          </div>
        </div>

        {loading ? (
          <div style={{ padding: '3rem' }}>
            {[1,2,3].map(i => <div key={i} style={{ marginBottom: '1rem' }}><Skeleton height="80px" /></div>)}
          </div>
        ) : order && (
          <div style={{ padding: '2rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            
            {/* ── USER INFO ── */}
            <InfoCard icon={<User size={16} />} title="Customer Details">
              <InfoRow label="Name" value={order.user?.name || '—'} />
              <InfoRow label="Email" icon={<Mail size={12} color="#999" />} value={order.user?.email || '—'} />
              {order.user?.phone && <InfoRow label="Phone" icon={<Phone size={12} color="#999" />} value={order.user.phone} />}
              <InfoRow 
                label="Payment" 
                icon={<CreditCard size={12} color="#999" />}
                value={
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                    <span style={{ 
                      fontSize: '0.65rem', fontWeight: 800, padding: '0.2rem 0.6rem', borderRadius: '4px',
                      background: order.is_paid ? 'rgba(22,163,74,0.1)' : 'rgba(220,38,38,0.1)',
                      color: order.is_paid ? '#16a34a' : '#dc2626'
                    }}>
                      {order.is_paid ? '✓ PAID' : '✗ UNPAID'}
                    </span>
                    <span style={{ color: '#999', fontSize: '0.75rem' }}>{order.payment_method}</span>
                  </span>
                }
              />
            </InfoCard>

            {/* ── SHIPPING ADDRESS ── */}
            <InfoCard icon={<MapPin size={16} />} title="Shipping Address">
              {order.shipping_address ? (
                <>
                  <InfoRow label="To" value={<strong>{order.shipping_address.recipient_name}</strong>} />
                  <InfoRow label="Address" value={order.shipping_address.street} />
                  <InfoRow label="City/State" value={`${order.shipping_address.city}, ${order.shipping_address.state}`} />
                  <InfoRow label="Pincode" value={order.shipping_address.postal_code} />
                  <InfoRow label="Phone" value={order.shipping_address.phone_number} />
                </>
              ) : (
                <p style={{ color: '#bbb', fontSize: '0.85rem', margin: 0 }}>No address on record</p>
              )}
            </InfoCard>

            {/* ── ORDER ITEMS ── */}
            <div style={{ gridColumn: '1 / -1' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.2rem' }}>
                <Package size={16} color="#888" />
                <h3 style={{ fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.12em', color: '#555', margin: 0 }}>
                  Order Items ({order.items.length})
                </h3>
              </div>
              <div style={{ border: '1px solid #f0f0f0', borderRadius: '4px', overflow: 'hidden' }}>
                {order.items.map((item, idx) => (
                  <div key={item.id} style={{ 
                    display: 'flex', alignItems: 'center', gap: '1.5rem', padding: '1.25rem 1.5rem',
                    borderBottom: idx < order.items.length - 1 ? '1px solid #f9f9f9' : 'none',
                    background: idx % 2 === 0 ? '#fff' : '#fafafa'
                  }}>
                    {/* Product Image */}
                    <div style={{ width: '64px', height: '80px', flexShrink: 0, borderRadius: '2px', overflow: 'hidden', background: '#f5f5f5', border: '1px solid #eee' }}>
                      {item.image ? (
                        <img src={item.image} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <ShoppingBag size={24} color="#ccc" />
                        </div>
                      )}
                    </div>

                    {/* Product Info */}
                    <div style={{ flex: 1 }}>
                      <p style={{ fontWeight: 700, fontSize: '0.9rem', margin: '0 0 0.4rem 0' }}>{item.name}</p>
                      <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
                        {item.size && item.size !== 'N/A' ? (
                          <span style={{ fontSize: '0.7rem', background: '#0a0a0a', color: '#fff', padding: '0.25rem 0.7rem', borderRadius: '4px', fontWeight: 700, letterSpacing: '0.08em' }}>
                            {item.size}
                          </span>
                        ) : (
                          <span style={{ fontSize: '0.65rem', background: '#f5f5f5', color: '#aaa', padding: '0.25rem 0.6rem', borderRadius: '4px', fontWeight: 500, fontStyle: 'italic' }}>
                            size not recorded
                          </span>
                        )}
                        <span style={{ fontSize: '0.7rem', background: '#f0f0f0', padding: '0.2rem 0.6rem', borderRadius: '4px', fontWeight: 600 }}>
                          Qty: {item.qty}
                        </span>
                      </div>
                    </div>

                    {/* Price */}
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <p style={{ margin: '0 0 0.2rem', fontSize: '0.75rem', color: '#999' }}>₹{item.price.toLocaleString()} × {item.qty}</p>
                      <p style={{ margin: 0, fontWeight: 800, fontSize: '1rem' }}>₹{item.total.toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ── ORDER SUMMARY ── */}
            <div style={{ gridColumn: '1 / -1', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', alignItems: 'start' }}>
              {/* Status Controls */}
              <InfoCard icon={<Tag size={16} />} title="Update Order Status">
                <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
                  {['Pending','Processing','Shipped','Delivered','Cancelled'].map(s => (
                    <button
                      key={s}
                      onClick={() => handleStatus(s)}
                      disabled={updatingStatus || order.status === s}
                      style={{
                        padding: '0.5rem 1rem', fontSize: '0.7rem', fontWeight: 700,
                        borderRadius: '4px', border: 'none', cursor: order.status === s ? 'default' : 'pointer',
                        background: order.status === s ? '#000' : '#f0f0f0',
                        color: order.status === s ? '#fff' : '#333',
                        transition: 'all 0.2s',
                        opacity: updatingStatus ? 0.6 : 1
                      }}
                    >
                      {s}
                    </button>
                  ))}
                </div>
                {!order.is_paid && (
                  <button 
                    onClick={handleMarkPaid}
                    style={{ marginTop: '1rem', padding: '0.6rem 1.5rem', background: '#16a34a', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 800 }}
                  >
                    ✓ Mark as PAID
                  </button>
                )}
              </InfoCard>

              {/* Price Summary */}
              <InfoCard icon={<CreditCard size={16} />} title="Order Summary">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.7rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                    <span style={{ color: '#666' }}>Subtotal</span>
                    <span style={{ fontWeight: 600 }}>₹{order.subtotal?.toLocaleString()}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                    <span style={{ color: '#666' }}>Shipping</span>
                    <span style={{ fontWeight: 600 }}>{order.shipping_price > 0 ? `₹${order.shipping_price}` : 'Free'}</span>
                  </div>
                  <div style={{ height: '1px', background: '#f0f0f0', margin: '0.3rem 0' }} />
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.05rem' }}>
                    <span style={{ fontWeight: 800 }}>Total</span>
                    <span style={{ fontWeight: 900, color: '#000' }}>₹{order.total_price?.toLocaleString()}</span>
                  </div>
                </div>
              </InfoCard>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── SMALL INFO CARD WRAPPER ─────────────────────────────────────────────────
function InfoCard({ icon, title, children }) {
  return (
    <div style={{ border: '1px solid #f0f0f0', borderRadius: '4px', padding: '1.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.2rem' }}>
        <span style={{ color: '#888' }}>{icon}</span>
        <h3 style={{ fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.12em', color: '#555', margin: 0 }}>{title}</h3>
      </div>
      {children}
    </div>
  );
}

function InfoRow({ label, value, icon }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0', borderBottom: '1px solid #fafafa', gap: '1rem' }}>
      <span style={{ fontSize: '0.75rem', color: '#999', display: 'flex', alignItems: 'center', gap: '0.3rem', flexShrink: 0 }}>
        {icon}{label}
      </span>
      <span style={{ fontSize: '0.82rem', fontWeight: 500, textAlign: 'right' }}>{value}</span>
    </div>
  );
}

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────
export default function OrderManagement() {
  const { loading, request } = useApi();
  const { state } = useContext(StoreContext);
  const { userInfo } = state;
  const [orders, setOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewingOrderId, setViewingOrderId] = useState(null);

  const fetchOrders = useCallback(async () => {
    try {
      const data = await request({ url: '/api/admin/dashboard/orders/', method: 'GET' });
      setOrders(data);
    } catch (err) {}
  }, [request]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const updateStatus = async (id, status) => {
    try {
      await request({ url: `/api/admin/dashboard/orders/${id}/status/`, method: 'PUT', data: { status } });
      toast.success(`Order #${id} → ${status}`);
      fetchOrders();
    } catch (err) {}
  };

  const markPaid = async (id) => {
    try {
      await request({ url: `/api/orders/${id}/pay/`, method: 'PUT' });
      toast.success(`Order #${id} marked as PAID`);
      fetchOrders();
    } catch (err) {}
  };

  const filteredOrders = orders.filter(o => {
    const emailMatch = (o.user?.email || '').toLowerCase().includes(searchTerm.toLowerCase());
    const idMatch = o.id?.toString().includes(searchTerm);
    return emailMatch || idMatch;
  });

  return (
    <>
      {viewingOrderId && (
        <OrderDetailModal
          orderId={viewingOrderId}
          token={userInfo?.token}
          onClose={() => setViewingOrderId(null)}
          onStatusChange={fetchOrders}
        />
      )}

      <div className="admin-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Orders</h2>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <div style={{ position: 'relative' }}>
              <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#888' }} />
              <input 
                type="text" placeholder="Search ID or email..."
                value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                className="form-input" style={{ padding: '0.6rem 2.5rem', width: '280px' }}
              />
            </div>
            <button className="btn btn-outline" style={{ padding: '0.6rem 1rem', fontSize: '0.75rem', gap: '0.5rem' }}>
              <Filter size={16} /> Filter
            </button>
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #f0f0f0', color: '#999', fontSize: '0.75rem', textTransform: 'uppercase' }}>
                <th style={{ padding: '1rem' }}>Order ID</th>
                <th style={{ padding: '1rem' }}>Customer</th>
                <th style={{ padding: '1rem' }}>Date</th>
                <th style={{ padding: '1rem' }}>Payment</th>
                <th style={{ padding: '1rem' }}>Total</th>
                <th style={{ padding: '1rem' }}>Status</th>
                <th style={{ padding: '1rem' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading && orders.length === 0 ? (
                [1,2,3,4,5].map(i => (
                  <tr key={i}><td colSpan="7" style={{ padding: '1rem' }}><Skeleton height="40px" /></td></tr>
                ))
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ padding: '3rem', textAlign: 'center', color: '#bbb', fontSize: '0.85rem' }}>
                    No orders found
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => {
                  const s = STATUS_STYLE[order.status] || STATUS_STYLE.Pending;
                  return (
                    <tr key={order.id} style={{ borderBottom: '1px solid #f9f9f9', fontSize: '0.85rem', transition: 'background 0.15s' }}
                      onMouseEnter={e => e.currentTarget.style.background = '#fafafa'}
                      onMouseLeave={e => e.currentTarget.style.background = ''}
                    >
                      <td style={{ padding: '1.25rem 1rem', fontWeight: 700 }}>#{order.id}</td>
                      <td style={{ padding: '1.25rem 1rem' }}>
                        <p style={{ fontWeight: 600, margin: 0 }}>{order.user?.name || 'Guest'}</p>
                        <p style={{ fontSize: '0.72rem', color: '#888', margin: 0 }}>{order.user?.email}</p>
                      </td>
                      <td style={{ padding: '1.25rem 1rem', color: '#888', fontSize: '0.75rem' }}>
                        {order.created_at ? new Date(order.created_at).toLocaleDateString('en-IN') : '—'}
                      </td>
                      <td style={{ padding: '1.25rem 1rem' }}>
                        {order.is_paid ? (
                          <span style={{ color: '#27ae60', background: 'rgba(39,174,96,0.1)', padding: '0.3rem 0.6rem', borderRadius: '4px', fontSize: '0.65rem', fontWeight: 800 }}>PAID</span>
                        ) : (
                          <span style={{ color: '#ff4d4f', background: 'rgba(255,77,79,0.1)', padding: '0.3rem 0.6rem', borderRadius: '4px', fontSize: '0.65rem', fontWeight: 800 }}>UNPAID</span>
                        )}
                      </td>
                      <td style={{ padding: '1.25rem 1rem', fontWeight: 700 }}>₹{parseFloat(order.total_price).toLocaleString()}</td>
                      <td style={{ padding: '1.25rem 1rem' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.4rem 0.8rem', borderRadius: '20px', fontSize: '0.7rem', fontWeight: 700, ...s }}>
                          {STATUS_ICON[order.status] || STATUS_ICON.default}{order.status}
                        </span>
                      </td>
                      <td style={{ padding: '1.25rem 1rem' }}>
                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                          {/* VIEW BUTTON */}
                          <button 
                            onClick={() => setViewingOrderId(order.id)}
                            className="btn-admin-action"
                            title="View Full Details"
                            style={{ color: '#2563eb', display: 'flex', alignItems: 'center', gap: '0.3rem', padding: '0.4rem 0.8rem', fontSize: '0.72rem', fontWeight: 700 }}
                          >
                            <Eye size={14} /> View
                          </button>
                          {!order.is_paid && (
                            <button onClick={() => markPaid(order.id)} className="btn-admin-action" title="Mark as Paid" style={{ color: '#27ae60' }}>₹</button>
                          )}
                          <button onClick={() => updateStatus(order.id, 'Shipped')} className="btn-admin-action" title="Mark as Shipped" style={{ color: '#ea580c' }}>
                            <Truck size={14} />
                          </button>
                          <button onClick={() => updateStatus(order.id, 'Delivered')} className="btn-admin-action" title="Mark as Delivered" style={{ color: '#16a34a' }}>
                            <CheckCircle size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <style>{`
          .btn-admin-action { 
            background: #f8f9fa; border: 1px solid #efefef; padding: 0.4rem; 
            border-radius: 6px; cursor: pointer; transition: all 0.2s; 
            display: inline-flex; align-items: center; justify-content: center; 
          }
          .btn-admin-action:hover { background: #fff; transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
        `}</style>
      </div>
    </>
  );
}
