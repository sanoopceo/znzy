import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { StoreContext } from '../context/StoreContext';
import axios from 'axios';

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { state, dispatch } = useContext(StoreContext);
  const { cartItems, userInfo, shippingAddress } = state;

  const [address, setAddress] = useState(shippingAddress.street || '');
  const [city, setCity] = useState(shippingAddress.city || '');
  const [postalCode, setPostalCode] = useState(shippingAddress.postal_code || '');
  const [country, setCountry] = useState(shippingAddress.country || '');
  const [paymentMethod, setPaymentMethod] = useState('COD');
  const [guestEmail, setGuestEmail] = useState('');

  const submitHandler = async (e) => {
    e.preventDefault();
    const currentShipping = { street: address, city, postal_code: postalCode, country };
    dispatch({ type: 'SAVE_SHIPPING_ADDRESS', payload: currentShipping });
    localStorage.setItem('shippingAddress', JSON.stringify(currentShipping));

    try {
      const config = userInfo ? {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userInfo.token}`,
        },
      } : { headers: { 'Content-Type': 'application/json' } };

      const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.qty, 0);

      const orderData = {
        orderItems: cartItems.map(i => ({ product: i.product, qty: i.qty, price: i.price, variant: null })),
        shippingAddress: currentShipping,
        paymentMethod,
        guest_email: !userInfo ? guestEmail : null,
        taxPrice: 0,
        shippingPrice: 10,
        totalPrice: subtotal + 10,
      };

      const { data } = await axios.post('/api/orders/add/', orderData, config);
      dispatch({ type: 'CART_CLEAR_ITEMS' });
      localStorage.removeItem('cartItems');
      
      alert(`Order placed successfully! Order ID: ${data.id}`);
      navigate('/');
    } catch (err) {
      alert('Fail to create order. Please check console for details.');
      console.error(err);
    }
  };

  if (cartItems.length === 0) {
    navigate('/cart');
    return null;
  }

  return (
    <div className="container" style={{ padding: '4rem 2rem', maxWidth: '800px' }}>
      <h1 className="title" style={{ textAlign: 'center', marginBottom: '3rem' }}>Checkout securely</h1>
      
      <form onSubmit={submitHandler} className="slide-up">
        {!userInfo && (
          <div style={{ marginBottom: '2rem', padding: '1.5rem', border: '1px solid var(--color-border)', borderRadius: 'var(--radius)' }}>
            <h2 className="subtitle" style={{ marginBottom: '1rem', color: 'var(--color-text)', fontWeight: 600 }}>Guest Information</h2>
            <div className="form-group">
              <label className="form-label" htmlFor="guestEmail">Email Address</label>
              <input type="email" id="guestEmail" required className="form-input" value={guestEmail} onChange={(e) => setGuestEmail(e.target.value)} />
            </div>
          </div>
        )}

        <div style={{ marginBottom: '2rem', padding: '1.5rem', border: '1px solid var(--color-border)', borderRadius: 'var(--radius)' }}>
          <h2 className="subtitle" style={{ marginBottom: '1rem', color: 'var(--color-text)', fontWeight: 600 }}>Shipping Address</h2>
          <div className="form-group">
            <label className="form-label" htmlFor="address">Address</label>
            <input type="text" id="address" required className="form-input" value={address} onChange={(e) => setAddress(e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="city">City</label>
            <input type="text" id="city" required className="form-input" value={city} onChange={(e) => setCity(e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="postalCode">Postal Code</label>
            <input type="text" id="postalCode" required className="form-input" value={postalCode} onChange={(e) => setPostalCode(e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="country">Country</label>
            <input type="text" id="country" required className="form-input" value={country} onChange={(e) => setCountry(e.target.value)} />
          </div>
        </div>

        <div style={{ marginBottom: '2rem', padding: '1.5rem', border: '1px solid var(--color-border)', borderRadius: 'var(--radius)' }}>
          <h2 className="subtitle" style={{ marginBottom: '1rem', color: 'var(--color-text)', fontWeight: 600 }}>Payment Method</h2>
          <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <input type="radio" id="cod" name="paymentOption" value="COD" checked={paymentMethod === 'COD'} onChange={(e) => setPaymentMethod(e.target.value)} />
            <label htmlFor="cod">Cash On Delivery</label>
          </div>
          <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <input type="radio" id="card" name="paymentOption" value="CARD" checked={paymentMethod === 'CARD'} onChange={(e) => setPaymentMethod(e.target.value)} />
            <label htmlFor="card">Credit Card (Stripe integration ready)</label>
          </div>
        </div>

        <button type="submit" className="btn btn-primary btn-block" style={{ padding: '1.5rem' }}>
          Complete Order
        </button>
      </form>
    </div>
  );
}
