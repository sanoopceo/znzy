import { useState, useContext, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { StoreContext } from '../context/StoreContext';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, Truck, ShieldCheck, ArrowRight, Package, MapPin, Plus, User, Edit3, X } from 'lucide-react';
import toast from 'react-hot-toast';
import AddressForm from '../components/common/AddressForm';

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { state, dispatch } = useContext(StoreContext);
  const { cartItems, userInfo } = state;

  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [isEditing, setIsEditing] = useState(null); // stores the address object being edited

  const [isGuest, setIsGuest] = useState(!userInfo);
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [orderId, setOrderId] = useState(null);

  const [guestForm, setGuestForm] = useState({
     fullName: '', email: '', phone: '',
     addressLine1: '', roadName: '', city: '', state: '', pincode: ''
  });

  const fetchAddresses = async () => {
     if (!userInfo) return;
     try {
        const { data } = await axios.get('/api/users/addresses/', {
           headers: { Authorization: `Bearer ${userInfo.token}` }
        });
        setAddresses(data);
        if (data.length === 0) {
           setIsAddingNew(true);
        } else {
           const def = data.find(a => a.is_default);
           if (def) setSelectedAddressId(def.id);
           else if (data.length > 0) setSelectedAddressId(data[0].id);
        }
     } catch (e) {}
  };

  useEffect(() => {
    if (cartItems.length === 0) { navigate('/cart'); return; }
    fetchAddresses();
  }, [userInfo]);

  const addNewAddressHandler = async (formData) => {
    setLoading(true);
    try {
      const config = {
        headers: { Authorization: `Bearer ${userInfo.token}` },
      };
      const { data } = await axios.post('/api/users/addresses/', formData, config);
      setAddresses([...addresses, data]);
      setSelectedAddressId(data.id);
      setIsAddingNew(false);
      toast.success('Address Added');
    } catch (err) {
      toast.error('Failed to save address');
    } finally {
      setLoading(false);
    }
  };

  const editAddressHandler = async (formData) => {
    setLoading(true);
    try {
      const config = {
        headers: { Authorization: `Bearer ${userInfo.token}` },
      };
      const { data } = await axios.put(`/api/users/addresses/${isEditing.id}/update/`, formData, config);
      setAddresses(addresses.map(a => a.id === data.id ? data : a));
      setIsEditing(null);
      toast.success('Address Updated');
    } catch (err) {
      toast.error('Failed to update address');
    } finally {
      setLoading(false);
    }
  };

  const submitHandler = async (e) => {
    e.preventDefault();
    if (!userInfo && !guestForm.email) { toast.error('Please fill guest details'); return; }
    if (userInfo && !selectedAddressId) { toast.error('Please select a shipping address'); return; }

    setLoading(true);
    try {
      const config = userInfo ? {
        headers: { Authorization: `Bearer ${userInfo.token}` },
      } : {};

      const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.qty, 0);
      
      let shippingInfo = {};
      if (userInfo) {
         const addr = addresses.find(a => a.id === selectedAddressId);
         if (!addr) { toast.error('Address error'); setLoading(false); return; }
         shippingInfo = {
            recipient_name: addr.recipient_name,
            street: addr.street,
            city: addr.city,
            state: addr.state,
            postal_code: addr.postal_code,
            phone_number: addr.phone_number
         };
      } else {
         shippingInfo = {
            recipient_name: guestForm.fullName,
            street: `${guestForm.addressLine1}${guestForm.roadName ? ', ' + guestForm.roadName : ''}`,
            city: guestForm.city,
            state: guestForm.state,
            postal_code: guestForm.pincode,
            phone_number: guestForm.phone
         };
      }

      const orderData = {
        orderItems: cartItems.map(i => ({
          product: i.product,
          qty: i.qty,
          price: i.price,
          variant: i.variantId || null,
          size: i.size || '',
          image: i.image || '',
        })),
        shippingAddress: shippingInfo,
        ...(userInfo && selectedAddressId ? { shippingAddressId: selectedAddressId } : {}),
        paymentMethod: 'COD',
        guest_email: !userInfo ? guestForm.email : null,
        totalPrice: subtotal + 10,
        shippingPrice: 10,
      };

      const { data } = await axios.post('/api/orders/add/', orderData, config);
      setOrderId(data.id);
      setIsSuccess(true);
      dispatch({ type: 'CART_CLEAR_ITEMS' });
      localStorage.removeItem('cartItems');
    } catch (err) {
      toast.error('Order creation failed');
    } finally {
      setLoading(false);
    }
  };

  if (isSuccess) return <SuccessModal orderId={orderId} navigate={navigate} />;

  return (
    <div className="bg-nude" style={{ minHeight: '100vh', padding: '120px 2rem 100px 2rem' }}>
      <div className="container" style={{ maxWidth: '1200px' }}>
        <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
           <h1 className="title-serif" style={{ fontSize: '3rem' }}>Checkout Flow</h1>
           <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', marginTop: '1rem' }}>
              <span style={{ color: 'var(--color-gold)', fontWeight: 800, fontSize: '0.7rem' }}>1. SHIPPING</span>
              <div style={{ width: '40px', height: '1px', background: '#ccc' }} />
              <span style={{ color: '#aaa', fontWeight: 800, fontSize: '0.7rem' }}>2. PAYMENT (COD)</span>
           </div>
        </div>

        <div className="grid grid-cols-2" style={{ gap: '4rem', alignItems: 'flex-start' }}>
           
           {/* LEFT COLUMN: Shipping Configuration */}
           <div>
              {userInfo ? (
                 <div className="admin-card" style={{ padding: '3rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
                        <h2 style={{ fontSize: '1.2rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                           <MapPin size={22} color="var(--color-gold)" /> 
                           {isAddingNew ? 'ADD NEW ADDRESS' : isEditing ? 'EDIT ADDRESS' : 'SHIPPING DESTINATION'}
                        </h2>
                        {!isAddingNew && !isEditing && (
                           <button onClick={() => setIsAddingNew(true)} className="btn btn-gold btn-sm" style={{ padding: '0.4rem 0.8rem', fontSize: '0.65rem' }}>
                              <Plus size={14} /> NEW
                           </button>
                        )}
                    </div>
                    
                    <AnimatePresence mode="wait">
                       {isAddingNew ? (
                          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} key="add">
                             <AddressForm onSubmit={addNewAddressHandler} onCancel={addresses.length > 0 ? () => setIsAddingNew(false) : null} loading={loading} />
                          </motion.div>
                       ) : isEditing ? (
                          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} key="edit">
                             <AddressForm initialData={isEditing} onSubmit={editAddressHandler} onCancel={() => setIsEditing(null)} loading={loading} />
                          </motion.div>
                       ) : (
                          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} key="list" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                             {addresses.length === 0 ? (
                                <div style={{ textAlign: 'center', padding: '2rem', background: '#f9f9f9', borderRadius: '12px', border: '1px dashed #ddd' }}>
                                   <p style={{ color: '#999', fontSize: '0.9rem' }}>No addresses found. Please add one to continue.</p>
                                </div>
                             ) : addresses.map(addr => (
                                <div key={addr.id} style={{ position: 'relative' }}>
                                   <label style={{ 
                                      display: 'block', padding: '1.5rem', borderRadius: '12px', border: '1px solid',
                                      borderColor: selectedAddressId === addr.id ? 'var(--color-gold)' : 'var(--color-border)',
                                      background: selectedAddressId === addr.id ? 'rgba(212, 175, 55, 0.03)' : '#fff',
                                      cursor: 'pointer', transition: '0.3s'
                                   }}>
                                      <div style={{ display: 'flex', gap: '1.2rem', alignItems: 'flex-start' }}>
                                         <div style={{ marginTop: '0.3rem' }}>
                                             <input type="radio" name="addr" checked={selectedAddressId === addr.id} onChange={() => setSelectedAddressId(addr.id)} />
                                         </div>
                                         <div style={{ flex: 1 }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                <div style={{ fontWeight: 800, fontSize: '0.85rem' }}>{addr.name || 'Personal'}</div>
                                                <button type="button" onClick={(e) => { e.preventDefault(); setIsEditing(addr); }} style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer' }}>
                                                   <Edit3 size={14} />
                                                </button>
                                            </div>
                                            <div style={{ fontWeight: 700, fontSize: '0.95rem', margin: '0.5rem 0' }}>{addr.recipient_name}</div>
                                            <div style={{ fontSize: '0.8rem', color: '#666', lineHeight: 1.6 }}>
                                               {addr.street}<br />
                                               {addr.city}, {addr.state} - {addr.postal_code}<br />
                                               <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>Ph: {addr.phone_number}</span>
                                            </div>
                                         </div>
                                      </div>
                                   </label>
                                </div>
                             ))}
                          </motion.div>
                       )}
                    </AnimatePresence>
                 </div>
              ) : (
                 <div className="admin-card" style={{ padding: '3rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
                       <h2 style={{ fontSize: '1.2rem', fontWeight: 800 }}>GUEST ORDER</h2>
                       <Link to="/login" style={{ fontSize: '0.7rem', color: 'var(--color-gold)', fontWeight: 700, textTransform: 'uppercase' }}>Sign In</Link>
                    </div>
                    
                    <div className="form-group">
                       <label className="form-label">Full Name</label>
                       <input value={guestForm.fullName} onChange={e => setGuestForm({...guestForm, fullName: e.target.value})} required className="form-input" />
                    </div>
                    <div className="grid grid-cols-2" style={{ gap: '1.5rem' }}>
                       <div className="form-group">
                          <label className="form-label">Email</label>
                          <input type="email" value={guestForm.email} onChange={e => setGuestForm({...guestForm, email: e.target.value})} required className="form-input" />
                       </div>
                       <div className="form-group">
                          <label className="form-label">Phone</label>
                          <input value={guestForm.phone} onChange={e => setGuestForm({...guestForm, phone: e.target.value})} required className="form-input" />
                       </div>
                    </div>
                    <div className="form-group">
                       <label className="form-label">Street Address</label>
                       <input value={guestForm.addressLine1} onChange={e => setGuestForm({...guestForm, addressLine1: e.target.value})} placeholder="Area, Building, House No." required className="form-input" />
                    </div>
                    <div className="grid grid-cols-3" style={{ gap: '1rem' }}>
                       <input placeholder="City" value={guestForm.city} onChange={e => setGuestForm({...guestForm, city: e.target.value})} className="form-input" />
                       <input placeholder="State" value={guestForm.state} onChange={e => setGuestForm({...guestForm, state: e.target.value})} className="form-input" />
                       <input placeholder="Zip" value={guestForm.pincode} onChange={e => setGuestForm({...guestForm, pincode: e.target.value})} className="form-input" />
                    </div>
                 </div>
              )}
           </div>

           {/* RIGHT COLUMN: Order Review */}
           <div>
              <div className="admin-card" style={{ padding: '3rem', position: 'sticky', top: '120px' }}>
                 <h2 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '2rem' }}>Bag Summary</h2>
                 
                 <div style={{ maxHeight: '250px', overflowY: 'auto', marginBottom: '2rem', paddingRight: '0.5rem' }}>
                    {cartItems.map(i => (
                       <div key={i.variantId} style={{ display: 'flex', gap: '1rem', padding: '1rem 0', borderBottom: '1px solid #f9f9f9' }}>
                          <img src={i.image || '/placeholder.png'} style={{ width: '50px', height: '65px', objectFit: 'cover', borderRadius: '4px' }} alt={i.name} />
                          <div style={{ flex: 1 }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
                                 <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>{i.name}</span>
                                 <span style={{ fontWeight: 800, fontSize: '0.9rem' }}>₹{i.price * i.qty}</span>
                              </div>
                              <div style={{ fontSize: '0.7rem', color: '#999' }}>Qty: {i.qty} | Size: {i.size || 'N/A'}</div>
                          </div>
                       </div>
                    ))}
                 </div>

                 <div style={{ background: '#fcfcfc', padding: '2rem', borderRadius: '16px', marginBottom: '2rem', border: '1px solid #f0f0f0' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', fontSize: '0.85rem' }}>
                       <span style={{ color: '#888' }}>Subtotal</span>
                       <span style={{ fontWeight: 600 }}>₹{cartItems.reduce((a,c) => a+c.price*c.qty, 0)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', fontSize: '0.85rem' }}>
                       <span style={{ color: '#888' }}>Standard Delivery</span>
                       <span style={{ color: '#27ae60', fontWeight: 700 }}>₹10.00</span>
                    </div>
                    <div style={{ height: '1px', background: '#eee', margin: '1rem 0' }} />
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 900, fontSize: '1.3rem' }}>
                       <span>Total Pay</span>
                       <span style={{ color: 'var(--color-gold)' }}>₹{cartItems.reduce((a,c) => a+c.price*c.qty, 0) + 10}</span>
                    </div>
                 </div>

                 <button 
                    onClick={submitHandler}
                    disabled={loading || isAddingNew || isEditing} 
                    className="btn btn-primary btn-block" 
                    style={{ padding: '1.5rem', opacity: (isAddingNew || isEditing) ? 0.5 : 1 }}
                 >
                    {loading ? 'SECURING ORDER...' : 'PLACE ORDER (COD)'}
                 </button>
                 
                 <div style={{ marginTop: '2.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.7rem', color: '#bbb' }}>
                    <ShieldCheck size={20} />
                    <span style={{ fontSize: '0.65rem', letterSpacing: '0.1em', fontWeight: 700 }}>VERIFIED BY ZNZY SECURE</span>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}

function SuccessModal({ orderId, navigate }) {
   return (
      <div style={{ position: 'fixed', inset: 0, background: '#fff', zIndex: 3000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
         <motion.div initial={{y: 20, opacity: 0}} animate={{y: 0, opacity: 1}} style={{ textAlign: 'center', maxWidth: '500px' }}>
            <div style={{ width: '100px', height: '100px', background: 'var(--color-gold)', borderRadius: '50%', margin: '0 auto 2rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
               <CheckCircle size={50} color="#fff" />
            </div>
            <h1 className="title-serif" style={{ fontSize: '3.5rem', marginBottom: '1.5rem' }}>Thank You!</h1>
            <p style={{ color: '#666', lineHeight: 1.8, fontSize: '1.1rem', marginBottom: '2.5rem' }}>
               Your order <span style={{ fontWeight: 800, color: '#000' }}>#{orderId}</span> is confirmed. We've sent a notification to your email. You can view your purchase history in your profile.
            </p>
            <div style={{ display: 'flex', gap: '1rem' }}>
               <button onClick={() => navigate('/')} className="btn btn-outline flex-1" style={{ padding: '1.2rem' }}>SHOP MORE</button>
               <button onClick={() => navigate('/profile')} className="btn btn-primary flex-1" style={{ padding: '1.2rem' }}>VIEW HISTORY</button>
            </div>
         </motion.div>
      </div>
   );
}
