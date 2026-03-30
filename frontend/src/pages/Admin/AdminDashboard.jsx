import { useState, useEffect, useContext } from 'react';
import { StoreContext } from '../../context/StoreContext';
import { useNavigate, Link, Routes, Route, useLocation } from 'react-router-dom';
import axios from 'axios';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingBag, 
  Users, 
  Settings, 
  LogOut, 
  ArrowUpRight, 
  ArrowDownRight,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  Edit,
  Trash,
  Percent
} from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';

// Sub-components
import DashboardOverview from './DashboardOverview';
import OrderManagement from './OrderManagement';
import ProductManagement from './ProductManagement';
import UserManagement from './UserManagement';
import AdminArchiveSales from './AdminArchiveSales';

export default function AdminDashboard() {
  const { state, dispatch } = useContext(StoreContext);
  const { userInfo } = state;
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!userInfo || !userInfo.isAdmin) {
      toast.error('Access Denied');
      navigate('/login');
    }
  }, [userInfo, navigate]);

  const handleLogout = () => {
    dispatch({ type: 'USER_LOGOUT' });
    toast.success('Logged out successfully');
    navigate('/login');
  };

  if (!userInfo || !userInfo.isAdmin) return null;

  const navItems = [
    { name: 'Overview', path: '/admin', icon: LayoutDashboard },
    { name: 'Orders', path: '/admin/orders', icon: ShoppingBag },
    { name: 'Products', path: '/admin/products', icon: Package },
    { name: 'Archive Sales', path: '/admin/archive', icon: Percent },
    { name: 'Users', path: '/admin/users', icon: Users },
    { name: 'Storefront', path: '/admin/settings', icon: Settings },
  ];

  return (
    <div className="admin-container" style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f9f9f9' }}>
      {/* Sidebar */}
      <aside className="admin-sidebar" style={{
        width: '260px',
        backgroundColor: '#fff',
        borderRight: '1px solid #eee',
        display: 'flex',
        flexDirection: 'column',
        position: 'sticky',
        top: 0,
        height: '100vh'
      }}>
        <div style={{ padding: '2rem', borderBottom: '1px solid #f5f5f5' }}>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.5rem', fontWeight: 700 }}>ZNZY ADMIN</h2>
          <span style={{ fontSize: '0.65rem', color: '#999', textTransform: 'uppercase', letterSpacing: '0.2em' }}>Control Center</span>
        </div>

        <nav style={{ padding: '1.5rem', flexGrow: 1 }}>
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            return (
              <Link 
                key={item.path} 
                to={item.path}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  padding: '1rem',
                  borderRadius: '12px',
                  marginBottom: '0.5rem',
                  color: isActive ? 'var(--color-primary)' : '#666',
                  backgroundColor: isActive ? 'rgba(0,0,0,0.04)' : 'transparent',
                  fontWeight: isActive ? 600 : 500,
                  fontSize: '0.85rem',
                  transition: 'all 0.2s'
                }}
              >
                <Icon size={18} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div style={{ padding: '1.5rem', borderTop: '1px solid #f5f5f5' }}>
          <button 
            onClick={handleLogout}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              padding: '1rem',
              width: '100%',
              color: '#ff4d4f',
              fontSize: '0.85rem',
              fontWeight: 600
            }}
          >
            <LogOut size={18} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main style={{ flexGrow: 1, padding: '2.5rem', overflowY: 'auto' }}>
        <header style={{ marginBottom: '2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ fontSize: '1.8rem', fontWeight: 700, marginBottom: '0.25rem' }}>
              Welcome back, {userInfo.name.split(' ')[0]}
            </h1>
            <p style={{ color: '#888', fontSize: '0.9rem' }}>Here&apos;s what&apos;s happening with your store today.</p>
          </div>
          
          <div style={{ display: 'flex', gap: '1rem' }}>
            <Link to="/" className="btn btn-outline" style={{ padding: '0.6rem 1.2rem', fontSize: '0.7rem' }}>
              View Storefront
            </Link>
          </div>
        </header>

        <Routes>
          <Route path="/" element={<DashboardOverview />} />
          <Route path="/orders" element={<OrderManagement />} />
          <Route path="/products" element={<ProductManagement />} />
          <Route path="/archive" element={<AdminArchiveSales />} />
          <Route path="/users" element={<UserManagement />} />
          <Route path="*" element={<DashboardOverview />} />
        </Routes>
      </main>

      <style>{`
        .admin-sidebar a:hover {
          background-color: rgba(0,0,0,0.02);
          color: var(--color-primary);
        }
        .admin-card {
           background: #fff;
           padding: 2rem;
           border-radius: 16px;
           box-shadow: 0 4px 20px rgba(0,0,0,0.02);
           border: 1px solid #f0f0f0;
        }
        .stat-card {
           display: flex;
           flex-direction: column;
           gap: 1rem;
        }
      `}</style>
    </div>
  );
}
