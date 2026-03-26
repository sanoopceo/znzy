import { useState, useContext, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { StoreContext } from '../context/StoreContext';
import axios from 'axios';

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { state, dispatch } = useContext(StoreContext);
  const { userInfo } = state;

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Set redirect based on querystring or root
  const redirect = location.search ? location.search.split('=')[1] : '/';

  useEffect(() => {
    if (userInfo) navigate(redirect);
  }, [navigate, userInfo, redirect]);

  const submitHandler = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Attempting backend API authentication
    try {
      const config = { headers: { 'Content-Type': 'application/json' } };
      const { data } = await axios.post('/api/users/login/', { email, password }, config);
      dispatch({ type: 'USER_LOGIN', payload: data });
      localStorage.setItem('userInfo', JSON.stringify(data));
      navigate(redirect);
    } catch (err) {
      if (err.response && err.response.data.detail) {
         setError(err.response.data.detail);
      } else {
         setError('Network error, please try again.');
      }
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper slide-up">
      <div className="auth-card">
        <h1 className="title" style={{ textAlign: 'center', marginBottom: '2rem' }}>Sign In</h1>
        {error && <div style={{ color: 'red', marginBottom: '1rem', textAlign: 'center' }}>{error}</div>}
        <form onSubmit={submitHandler}>
          <div className="form-group">
            <label className="form-label" htmlFor="email">Email</label>
            <input 
              type="email" 
              id="email" 
              className="form-input" 
              placeholder="Enter your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="password">Password</label>
            <input 
              type="password" 
              id="password" 
              className="form-input" 
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="btn btn-primary btn-block" disabled={loading} style={{ padding: '1rem', marginTop: '1rem' }}>
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>
        <div style={{ marginTop: '2rem', textAlign: 'center', color: 'var(--color-text-light)' }}>
          Don't have an account? <Link to={`/register?redirect=${redirect}`} style={{ color: 'var(--color-primary)', textDecoration: 'underline' }}>Register</Link>
        </div>
      </div>
    </div>
  );
}
