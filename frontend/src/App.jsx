import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MarqueeBanner from './components/MarqueeBanner';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import PageBuilder from './builder/PageBuilder';
import DynamicPage from './pages/DynamicPage';

// Pages
import HomePage from './pages/HomePage';
import ProductPage from './pages/ProductPage';
import CartPage from './pages/CartPage';
import LoginPage from './pages/LoginPage';
import CheckoutPage from './pages/CheckoutPage';
import NewInPage from './pages/NewInPage';
import BestsellersPage from './pages/BestsellersPage';
import CollectionsPage from './pages/CollectionsPage';
import ArchiveSalePage from './pages/ArchiveSalePage';
import AboutPage from './pages/AboutPage';
import RegisterPage from './pages/RegisterPage';

function App() {
  return (
    <Router>
      <MarqueeBanner />
      <Navbar />
      <main style={{ minHeight: '80vh' }}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/product/:id" element={<ProductPage />} />
          <Route path="/cart/:id?" element={<CartPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          {/* New premium pages */}
          <Route path="/new-in" element={<NewInPage />} />
          <Route path="/bestsellers" element={<BestsellersPage />} />
          <Route path="/shop" element={<NewInPage />} />
          <Route path="/collections" element={<CollectionsPage />} />
          <Route path="/archive-sale" element={<ArchiveSalePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/admin/page-builder" element={<PageBuilder />} />
          <Route path="/page/:slug" element={<DynamicPage />} />
        </Routes>
      </main>
      <Footer />
    </Router>
  );
}

export default App;
