import { useState, useEffect, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import AddressForm from '../components/common/AddressForm';
import { StoreContext } from '../context/StoreContext';
import { useApi } from '../hooks/useApi';
import { 
  ShoppingBag, 
  MapPin, 
  Bell, 
  LogOut, 
  Package,
  CheckCircle2,
  Clock,
  Edit2,
  Save,
  X,
  Plus
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Skeleton } from '../components/common/Skeleton';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const { state, dispatch } = useContext(StoreContext);
  const { userInfo } = state;
  const navigate = useNavigate();
  const { request, loading } = useApi();
  
  const [activeTab, setActiveTab] = useState('orders');
  const [orders, setOrders] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [editingAddressId, setEditingAddressId] = useState(null);
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [addressForm, setAddressForm] = useState({
     recipient_name: '',
     street: '',
     city: '',
     state: '',
     postal_code: '',
     phone_number: ''
  });

  const fetchData = async () => {
    try {
      const orderData = await request({ url: '/api/orders/myorders/', method: 'GET' });
      setOrders(orderData);
      const addrData = await request({ url: '/api/users/addresses/', method: 'GET' });
      setAddresses(addrData);
      const notifData = await request({ url: '/api/orders/notifications/', method: 'GET' });
      setNotifications(notifData);
    } catch (err) {}
  };

  useEffect(() => {
    if (!userInfo) { navigate('/login'); return; }
    fetchData();
  }, [userInfo]);

  const handleLogout = () => {
    dispatch({ type: 'USER_LOGOUT' });
    localStorage.removeItem('userInfo');
    navigate('/login');
  };

  const startEdit = (addr) => {
     setEditingAddressId(addr.id);
     setAddressForm({
        recipient_name: addr.recipient_name,
        street: addr.street,
        city: addr.city,
        state: addr.state,
        postal_code: addr.postal_code,
        phone_number: addr.phone_number
     });
  };

  const saveAddressUpdate = async (id, data) => {
     try {
        await request({
           url: `/api/users/addresses/${id}/update/`,
           method: 'PUT',
           data: data
        });
        toast.success('Address Updated');
        setEditingAddressId(null);
        fetchData();
     } catch (err) {
        toast.error('Failed to update address');
     }
  };

  const addNewAddress = async (data) => {
     try {
        await request({
           url: '/api/users/addresses/',
           method: 'POST',
           data: data
        });
        toast.success('New Address Linked');
        setIsAddingAddress(false);
        fetchData();
     } catch (err) {
        toast.error('Failed to add address');
     }
  };

  const deleteAddress = async (id) => {
     // Replace window.confirm with a custom toast confirm or just a cleaner UX
     // For now, I'll use a standard toast.promise or just a simple toast notification
     // But to truly replace confirm() without a modal, we can use toast with options
     
     toast((t) => (
       <span>
         Remove this address?
         <button 
           onClick={async () => {
             toast.dismiss(t.id);
             try {
               await request({ url: `/api/users/addresses/${id}/`, method: 'DELETE' });
               toast.success('Address Removed');
               fetchData();
             } catch (err) {
               toast.error('Failed to remove address');
             }
           }}
           style={{ marginLeft: '1rem', background: '#ff4d4f', color: '#fff', border: 'none', padding: '0.2rem 0.5rem', borderRadius: '4px', cursor: 'pointer' }}
         >
           Confirm
         </button>
       </span>
     ), { duration: 4000 });
  };

  if (!userInfo) return null;

  return (
    <div className="bg-nude" style={{ minHeight: '100vh', padding: '120px 0 100px 0' }}>
      <div className="container" style={{ maxWidth: '1200px' }}>
        
        {/* Header Section */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4rem' }}>
           <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
              <div style={{ 
                width: '80px', height: '80px', 
                backgroundColor: 'var(--color-primary)', color: 'var(--color-bg)',
                borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '2rem', fontWeight: 700
              }}>
                {(userInfo.name || userInfo.first_name || 'U')[0].toUpperCase()}
              </div>
              <div>
                 <h1 className="title-serif" style={{ fontSize: '3rem', marginBottom: '0.2rem' }}>{userInfo.name || userInfo.first_name}</h1>
                 <p style={{ color: '#888', letterSpacing: '0.1em' }}>Member Since {new Date().getFullYear()}</p>
              </div>
           </div>
           <button onClick={handleLogout} className="btn btn-outline" style={{ display: 'flex', gap: '0.5rem', color: '#ff4d4f', borderColor: 'rgba(255,77,79,0.2)' }}>
              <LogOut size={18} /> LOGOUT
           </button>
        </div>

        <div className="grid grid-cols-4" style={{ gap: '4rem', alignItems: 'flex-start' }}>
           
           {/* SIDEBAR TABS */}
           <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <TabButton active={activeTab === 'orders'} icon={ShoppingBag} label="Purchase History" onClick={() => setActiveTab('orders')} />
              <TabButton active={activeTab === 'address'} icon={MapPin} label="Delivery Addresses" onClick={() => setActiveTab('address')} />
              <TabButton active={activeTab === 'notifications'} icon={Bell} label="Notifications" onClick={() => setActiveTab('notifications')} />
           </nav>

           {/* CONTENT AREA */}
           <div style={{ gridColumn: 'span 3' }}>
              <AnimatePresence mode="wait">
                 {activeTab === 'orders' && (
                    <motion.div key="orders" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                       <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '2rem' }}>Recents Orders</h2>
                       {loading && orders.length === 0 ? <Skeleton height="200px" /> : (
                         <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                            {orders.length === 0 ? (
                               <div className="dashed-box" style={{ textAlign: 'center', padding: '4rem' }}>
                                  <Package size={40} style={{ margin: '0 auto 1.5rem', color: '#ccc' }} />
                                  <p style={{ color: '#666' }}>You haven't placed any orders yet.</p>
                                  <Link to="/shop" className="btn btn-gold" style={{ marginTop: '2rem' }}>Start Shopping</Link>
                               </div>
                            ) : orders.map(order => <OrderCard key={order.id} order={order} />)}
                         </div>
                       )}
                    </motion.div>
                 )}

                 {activeTab === 'address' && (
                    <motion.div key="address" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                       <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                          <h2 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Saved Addresses</h2>
                          {!isAddingAddress && (
                             <button onClick={() => setIsAddingAddress(true)} className="btn btn-gold" style={{ padding: '0.5rem 1rem', fontSize: '0.7rem' }}>
                                <Plus size={14}/> ADD NEW
                             </button>
                          )}
                       </div>
                       
                       <div className="grid grid-cols-1" style={{ gap: '1.5rem' }}>
                          {isAddingAddress && (
                             <div className="admin-card" style={{ padding: '2rem', border: '2px dashed var(--color-gold)' }}>
                                <h3 style={{ marginBottom: '1.5rem', fontWeight: 800 }}>New Delivery Address</h3>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                   <input placeholder="Name" className="form-input" value={addressForm.recipient_name} onChange={e => setAddressForm({...addressForm, recipient_name: e.target.value})} />
                                   <input placeholder="Street / House No" className="form-input" value={addressForm.street} onChange={e => setAddressForm({...addressForm, street: e.target.value})} />
                                   <div style={{ display: 'flex', gap: '1rem' }}>
                                      <input placeholder="City" className="form-input" value={addressForm.city} onChange={e => setAddressForm({...addressForm, city: e.target.value})} />
                                      <input placeholder="State" className="form-input" value={addressForm.state} onChange={e => setAddressForm({...addressForm, state: e.target.value})} />
                                      <input placeholder="Pincode" className="form-input" value={addressForm.postal_code} onChange={e => setAddressForm({...addressForm, postal_code: e.target.value})} />
                                   </div>
                                   <input placeholder="Phone" className="form-input" value={addressForm.phone_number} onChange={e => setAddressForm({...addressForm, phone_number: e.target.value})} />
                                   <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                                      <button onClick={addNewAddress} className="btn btn-primary">SAVE ADDRESS</button>
                                      <button onClick={() => setIsAddingAddress(false)} className="btn btn-outline">CANCEL</button>
                                   </div>
                                </div>
                             </div>
                          )}

                          {addresses.length === 0 && !loading && !isAddingAddress && (
                             <div className="dashed-box" style={{ padding: '3rem', textAlign: 'center', color: '#888' }}>
                                No addresses found in database.
                             </div>
                          )}
                          
                          {addresses.map(addr => (
                             <div key={addr.id} className="admin-card" style={{ padding: '2rem', position: 'relative' }}>
                                {editingAddressId === addr.id ? (
                                   <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                      <input placeholder="Name" className="form-input" value={addressForm.recipient_name} onChange={e => setAddressForm({...addressForm, recipient_name: e.target.value})} />
                                      <input placeholder="Street / House No" className="form-input" value={addressForm.street} onChange={e => setAddressForm({...addressForm, street: e.target.value})} />
                                      <div style={{ display: 'flex', gap: '1rem' }}>
                                         <input placeholder="City" className="form-input" value={addressForm.city} onChange={e => setAddressForm({...addressForm, city: e.target.value})} />
                                         <input placeholder="State" className="form-input" value={addressForm.state} onChange={e => setAddressForm({...addressForm, state: e.target.value})} />
                                         <input placeholder="Pincode" className="form-input" value={addressForm.postal_code} onChange={e => setAddressForm({...addressForm, postal_code: e.target.value})} />
                                      </div>
                                      <input placeholder="Phone" className="form-input" value={addressForm.phone_number} onChange={e => setAddressForm({...addressForm, phone_number: e.target.value})} />
                                      <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                                         <button onClick={() => saveAddressUpdate(addr.id)} className="btn btn-primary" style={{ display: 'flex', gap: '0.5rem' }}><Save size={16}/> SAVE CHANGES</button>
                                         <button onClick={() => setEditingAddressId(null)} className="btn btn-outline" style={{ display: 'flex', gap: '0.5rem' }}><X size={16}/> CANCEL</button>
                                      </div>
                                   </div>
                                ) : (
                                   <>
                                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                         <div>
                                            <div style={{ fontWeight: 800, fontSize: '1.1rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                                               {addr.recipient_name}
                                               {addr.is_default && <span style={{ fontSize: '0.6rem', background: '#000', color: '#fff', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>PRIMARY</span>}
                                            </div>
                                            <div style={{ color: '#666', lineHeight: 1.6, fontSize: '0.9rem' }}>
                                               {addr.flat_house_no}, {addr.area_street_village}<br />
                                               {addr.city}, {addr.state} - {addr.postal_code}<br />
                                               Phone: {addr.phone_number}
                                            </div>
                                         </div>
                                         <div style={{ display: 'flex', gap: '0.5rem' }}>
                                            <button onClick={() => startEdit(addr)} className="btn btn-outline" style={{ padding: '0.5rem', minWidth: 'auto' }}>
                                               <Edit2 size={16} />
                                            </button>
                                            <button onClick={() => deleteAddress(addr.id)} className="btn btn-outline" style={{ padding: '0.5rem', minWidth: 'auto', color: '#ff4d4f' }}>
                                               <X size={16} />
                                            </button>
                                         </div>
                                      </div>
                                   </>
                                )}
                             </div>
                          ))}
                       </div>
                    </motion.div>
                 )}

                 {activeTab === 'notifications' && (
                    <motion.div key="notifications" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                       <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '2rem' }}>Notification Hub</h2>
                       <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                          {notifications.length === 0 ? (
                             <p style={{ color: '#888' }}>No real-time notifications found in DB.</p>
                          ) : notifications.map(notif => (
                             <NotificationCard key={notif.id} title={notif.title} message={notif.message} time={new Date(notif.created_at).toLocaleString()} type={notif.type} />
                          ))}
                       </div>
                    </motion.div>
                 )}
              </AnimatePresence>
           </div>
        </div>
      </div>
    </div>
  );
}

function TabButton({ active, icon: Icon, label, onClick }) {
   return (
      <button 
         onClick={onClick}
         style={{
            display: 'flex', alignItems: 'center', gap: '1rem',
            padding: '1.2rem 1.5rem', borderRadius: '0px',
            backgroundColor: active ? 'var(--color-primary)' : 'transparent',
            color: active ? 'var(--color-bg)' : 'var(--color-text)',
            fontWeight: active ? 700 : 500,
            textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.1em',
            transition: 'var(--transition-fast)',
            borderLeft: active ? '4px solid var(--color-gold)' : '4px solid transparent',
            textAlign: 'left', width: '100%'
         }}
      >
         <Icon size={18} /> {label}
      </button>
   );
}

function OrderCard({ order }) {
   const [showDetails, setShowDetails] = useState(false);
   const isDelivered = order.status === 'Delivered';

   return (
      <div className="admin-card" style={{ padding: '0', overflow: 'hidden' }}>
         <div style={{ padding: '1.5rem 2rem', borderBottom: '1px solid #f5f5f5', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fafafa' }}>
            <div style={{ display: 'flex', gap: '2rem' }}>
               <div>
                  <div style={{ fontSize: '0.65rem', color: '#999', textTransform: 'uppercase', marginBottom: '0.2rem' }}>Order Placed</div>
                  <div style={{ fontWeight: 700, fontSize: '0.85rem' }}>{new Date(order.created_at).toLocaleDateString()}</div>
               </div>
               <div>
                  <div style={{ fontSize: '0.65rem', color: '#999', textTransform: 'uppercase', marginBottom: '0.2rem' }}>Total</div>
                  <div style={{ fontWeight: 700, fontSize: '0.85rem' }}>₹{order.total_price}</div>
               </div>
            </div>
            <div>
               <div style={{ fontSize: '0.65rem', color: '#999', textTransform: 'uppercase', textAlign: 'right', marginBottom: '0.2rem' }}>Order ID</div>
               <div style={{ fontWeight: 800, fontSize: '0.85rem' }}>#{order.id}</div>
            </div>
         </div>
         <div style={{ padding: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
               <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: isDelivered ? '#27ae60' : 'var(--color-gold)', fontWeight: 700, fontSize: '1rem' }}>
                  {isDelivered ? <CheckCircle2 size={18} /> : <Clock size={18} />}
                  {order.status}
               </div>
               <div style={{ fontSize: '0.85rem', color: '#666' }}>
                  {order.items?.[0]?.name} {order.items?.length > 1 ? `+ ${order.items.length - 1} more` : ''}
               </div>
            </div>
            <button 
               onClick={() => setShowDetails(!showDetails)} 
               className="btn btn-outline" 
               style={{ fontSize: '0.65rem', padding: '0.6rem 1.2rem', minWidth: '100px' }}
            >
               {showDetails ? 'CLOSE' : 'VIEW'}
            </button>
         </div>

         <AnimatePresence>
            {showDetails && (
               <motion.div 
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  style={{ borderTop: '1px solid #eee', background: '#fff' }}
               >
                  <div style={{ padding: '2rem' }}>
                     <h4 style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '1.5rem', color: '#999' }}>Order Details</h4>
                     
                     <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
                        {order.items?.map((item, idx) => (
                           <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '1rem', borderBottom: '1px solid #f9f9f9' }}>
                              <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                                 <img src={item.image_url || '/placeholder.png'} alt={item.name} style={{ width: '50px', height: '60px', objectFit: 'cover', borderRadius: '4px' }} />
                                 <div>
                                    <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{item.name}</div>
                                    <div style={{ fontSize: '0.75rem', color: '#888' }}>Size: {item.size_label || 'Default'} | Qty: {item.qty}</div>
                                 </div>
                              </div>
                              <div style={{ fontWeight: 700 }}>₹{item.price * item.qty}</div>
                           </div>
                        ))}
                     </div>

                     <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem' }}>
                        <div>
                           <h5 style={{ fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase', color: '#bbb', marginBottom: '0.8rem' }}>Delivery Address</h5>
                           {order.shipping_address ? (
                              <div style={{ fontSize: '0.85rem', color: '#666', lineHeight: 1.6 }}>
                                 <div style={{ fontWeight: 700, color: '#333' }}>{order.shipping_address.recipient_name}</div>
                                 {order.shipping_address.flat_house_no}, {order.shipping_address.area_street_village}<br />
                                 {order.shipping_address.city}, {order.shipping_address.state} - {order.shipping_address.postal_code}<br />
                                 Phone: {order.shipping_address.phone_number}
                              </div>
                           ) : <div style={{ fontSize: '0.85rem', color: '#999' }}>Address not found</div>}
                        </div>
                        <div style={{ background: '#fafafa', padding: '1.5rem', borderRadius: '8px' }}>
                           <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.85rem' }}>
                              <span style={{ color: '#888' }}>Subtotal</span>
                              <span>₹{order.total_price - order.shipping_price}</span>
                           </div>
                           <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.85rem' }}>
                              <span style={{ color: '#888' }}>Shipping</span>
                              <span>₹{order.shipping_price}</span>
                           </div>
                           <div style={{ height: '1px', background: '#eee', margin: '0.5rem 0' }} />
                           <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: '1rem' }}>
                              <span>Grand Total</span>
                              <span style={{ color: 'var(--color-gold)' }}>₹{order.total_price}</span>
                           </div>
                        </div>
                     </div>
                  </div>
               </motion.div>
            )}
         </AnimatePresence>
      </div>
   );
}

function NotificationCard({ title, message, time, type }) {
   const getIcon = () => {
      switch(type) {
         case 'order_update': return <Package size={18} color="var(--color-gold)" />;
         case 'success': return <CheckCircle2 size={18} color="#27ae60" />;
         case 'error': return <X size={18} color="#ff4d4f" />;
         default: return <Bell size={18} color="#888" />;
      }
   };
   
   return (
      <div className="admin-card" style={{ padding: '1.5rem', display: 'flex', gap: '1.5rem', alignItems: 'flex-start' }}>
         <div style={{ padding: '0.8rem', background: 'rgba(212, 175, 55, 0.05)', borderRadius: '50%' }}>
            {getIcon()}
         </div>
         <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
               <div style={{ fontWeight: 800, fontSize: '0.9rem' }}>{title}</div>
               <div style={{ fontSize: '0.7rem', color: '#999' }}>{time}</div>
            </div>
            <div style={{ fontSize: '0.85rem', color: '#666', lineHeight: 1.5 }}>{message}</div>
         </div>
      </div>
   );
}
