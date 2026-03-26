import { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { StoreContext } from '../context/StoreContext';
import { Trash2 } from 'lucide-react';

export default function CartPage() {
  const navigate = useNavigate();
  const { state, dispatch } = useContext(StoreContext);
  const { cartItems } = state;

  const removeFromCartHandler = (item) => {
    dispatch({ type: 'CART_REMOVE_ITEM', payload: item });
  };

  const checkoutHandler = () => {
    navigate('/login?redirect=/checkout');
  };

  return (
    <div className="container" style={{ padding: '4rem 2rem' }}>
      <h1 className="title fade-in mb-4">Your Bag</h1>
      {cartItems.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '6rem 0', backgroundColor: 'var(--color-secondary)' }}>
          <p className="subtitle mb-4">Your bag is currently empty.</p>
          <Link to="/" className="btn btn-outline" style={{ marginTop: '2rem' }}>Go Shopping</Link>
        </div>
      ) : (
        <div className="grid grid-cols-3" style={{ gap: '4rem', marginTop: '3rem' }}>
          
          <div style={{ gridColumn: 'span 2' }}>
            <div style={{ borderTop: '1px solid var(--color-border)', marginBottom: '2rem' }}>
              {cartItems.map(item => (
                <div key={item.variantId} style={{ display: 'grid', gridTemplateColumns: '120px 1fr auto', gap: '2rem', padding: '2rem 0', borderBottom: '1px solid var(--color-border)', alignItems: 'center' }}>
                  <img src={item.image} alt={item.name} style={{ width: '100%', borderRadius: 'var(--radius)', aspectRatio: '3/4', objectFit: 'cover' }} />
                  <div>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 500, marginBottom: '0.5rem' }}>{item.name}</h3>
                    <p style={{ color: 'var(--color-text-light)', marginBottom: '0.2rem' }}>Color: {item.color}</p>
                    <p style={{ color: 'var(--color-text-light)', marginBottom: '1rem' }}>Size: {item.size}</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <select value={item.qty} 
                              onChange={(e) => dispatch({ type: 'CART_ADD_ITEM', payload: { ...item, qty: Number(e.target.value) } })}
                              style={{ padding: '0.5rem 1rem', borderRadius: 'var(--radius)', border: '1px solid var(--color-border)', background: 'var(--color-bg)', color: 'var(--color-text)' }}>
                        {[...Array(5).keys()].map(x => (
                          <option key={x + 1} value={x + 1}>{x + 1}</option>
                        ))}
                      </select>
                      <button onClick={() => removeFromCartHandler(item)} style={{ color: 'var(--color-text-light)' }}>
                        <Trash2 size={20} />
                      </button>
                    </div>
                  </div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 600 }}>
                     ${(item.price * item.qty).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <div style={{ padding: '2rem', backgroundColor: 'var(--color-secondary)', borderRadius: 'var(--radius)', position: 'sticky', top: '100px' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '2rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '1rem' }}>Order Summary</h2>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <span>Subtotal ({cartItems.reduce((a, c) => a + c.qty, 0)} items)</span>
                <span>${cartItems.reduce((a, c) => a + c.price * c.qty, 0).toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem' }}>
                <span>Shipping</span>
                <span>Calculated at checkout</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem', fontSize: '1.3rem', fontWeight: 600, borderTop: '1px solid var(--color-border)', paddingTop: '1rem' }}>
                <span>Total</span>
                <span>${cartItems.reduce((a, c) => a + c.price * c.qty, 0).toFixed(2)}</span>
              </div>
              <button onClick={checkoutHandler} disabled={cartItems.length === 0} className="btn btn-primary" style={{ width: '100%', padding: '1.2rem' }}>
                Proceed to Checkout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
