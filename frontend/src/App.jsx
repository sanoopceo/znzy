import React, { Suspense, lazy } from 'react';
import { Toaster } from 'react-hot-toast';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import AdminBuilderNav from './builder/AdminBuilderNav';

// Pages - Lazy Loaded for Code Splitting
const HomePage = lazy(() => import('./pages/HomePage'));
const ShopPage = lazy(() => import('./pages/ShopPage'));
const ProductPage = lazy(() => import('./pages/ProductPage'));
const CartPage = lazy(() => import('./pages/CartPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const CheckoutPage = lazy(() => import('./pages/CheckoutPage'));
const CollectionsPage = lazy(() => import('./pages/CollectionsPage'));
const ArchiveSalePage = lazy(() => import('./pages/ArchiveSalePage'));
const AboutPage = lazy(() => import('./pages/AboutPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const AdminDashboard = lazy(() => import('./pages/Admin/AdminDashboard'));
const DynamicPage = lazy(() => import('./pages/DynamicPage'));

const Loader = () => (
  <div style={{ height: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
     <div className="title-serif" style={{ fontSize: '1.5rem', animation: 'pulse 2s infinite', letterSpacing: '0.2em' }}>ZNZY</div>
  </div>
);

function AppContent() {
  const location = useLocation();
  const isAdminPath = location.pathname.startsWith('/admin');
  const isHomePage = location.pathname === '/';

  return (
    <>
      <Toaster 
        position="top-right" 
        reverseOrder={false} 
        toastOptions={{
          duration: 3000,
          style: {
            borderRadius: '12px',
            background: '#FFFFFF',
            color: '#1a1a1a',
            padding: '16px 24px',
            boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05)',
            fontWeight: '600',
            border: '1px solid #f0f0f0',
            fontSize: '0.9rem'
          },
          success: {
            iconTheme: {
              primary: '#2ecc71',
              secondary: '#FFFAF0',
            },
          },
          error: {
            iconTheme: {
              primary: '#e74c3c',
              secondary: '#FFFAF0',
            },
          },
        }}
      />
      <AdminBuilderNav />
      {!isAdminPath && <Navbar />}
      
      <main style={{ 
         minHeight: '100vh',
         /* Only add padding for non-admin and non-home pages */
         paddingTop: (!isAdminPath && !isHomePage) ? '100px' : '0px'
      }}>
        <Suspense fallback={<Loader />}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/product/:id" element={<ProductPage />} />
            <Route path="/cart/:id?" element={<CartPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/new-in" element={<ShopPage />} />
            <Route path="/bestsellers" element={<ShopPage />} />
            <Route path="/shop" element={<ShopPage />} />
            <Route path="/collections" element={<CollectionsPage />} />
            <Route path="/archive-sale" element={<ArchiveSalePage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/admin/*" element={<AdminDashboard />} />
            <Route path="/page/:slug" element={<DynamicPage />} />
          </Routes>
        </Suspense>
      </main>
      
      {!isAdminPath && <Footer />}
    </>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
