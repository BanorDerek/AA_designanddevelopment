// App.js - CLEANED UP
import { useState, useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import LoadingScreen from './components/LoadingScreen';
import BottomBar from './components/BottomBar';
import SiteMetaTags from './components/SiteMetaTags';
import { SiteImagesProvider } from './context/SiteImagesContext';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import ProtectedRoute from './components/admin/ProtectedRoute';

// Public Pages
import Home from './pages/Home';
import About from './pages/About';
import Work from './pages/Work';
import ProjectDetail from './pages/ProjectDetail';
import Contact from './pages/Contact';
import Products from './pages/Products';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import BTSMoodboards from './pages/BTSMoodboards';
import Awards from './pages/Awards';
import Partners from './pages/Partners';
import Journal from './pages/Journal';
import JournalDetail from './pages/JournalDetail';
import ProductDetail from './pages/ProductDetail';


// Admin Pages
import AdminLogin from './pages/admin/AdminLogin';
import AdminLayout from './pages/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminHomeImages from './pages/admin/AdminHomeImages';
import AdminProjects from './pages/admin/AdminProjects';
import AdminProjectEdit from './pages/admin/AdminProjectEdit';
import AdminProducts from './pages/admin/AdminProducts';
import AdminOrders from './pages/admin/AdminOrders';
import AdminAbout from './pages/admin/AdminAbout';
import AdminSettings from './pages/admin/AdminSettings';
import AdminCategories from './pages/admin/AdminCategories';
import AdminUsers from './pages/admin/AdminUsers';
import AdminSecurity from './pages/admin/AdminSecurity';
import AdminProjectSections from './pages/admin/AdminProjectSections';
import AdminBTS from './pages/admin/AdminBTS';
import AdminJournal from './pages/admin/AdminJournal';
import AdminJournalDetails from './pages/admin/AdminJournalDetails';
import AdminProductEdit from './pages/admin/AdminProductEdit';

import './styles/tokens.css';
import './App.css';

const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';

function AppContent() {
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState(null);
  
  const isHomePage = location.pathname === '/';

  // Fetch site settings
  useEffect(() => {
    fetch(`${API_BASE}/settings`)
      .then((r) => r.json())
      .then((data) => {
        console.log('📡 Settings loaded:', data);
        setSettings(data);
      })
      .catch((err) => {
        console.error('❌ Failed to load settings:', err);
        setSettings({});
      });
  }, []);

  // Update title
  useEffect(() => {
    if (settings?.brandName) {
      const tagline = settings?.tagline || 'Architecture & Interior Design';
      document.title = `${settings.brandName} | ${tagline}`;
    }
  }, [settings]);

  // Only show loading on home page
  useEffect(() => {
    if (isHomePage) {
      setLoading(true);
    } else {
      setLoading(false);
    }
  }, [isHomePage]);

  return (
    <>
      <SiteMetaTags settings={settings} />

      <div className="app-content" style={{ position: 'relative' }}>
        <Routes>
          {/* ============================================================
              PUBLIC ROUTES
          ============================================================ */}
          
          <Route
            path="/"
            element={
              <>
                {!loading && <BottomBar settings={settings} />}
                <Home brandName={settings?.brandName} />
              </>
            }
          />
          
          <Route
            path="/about"
            element={
              <>
                <BottomBar settings={settings} />
                <About />
              </>
            }
          />
          
          <Route
            path="/products/:slug"
            element={
              <>
                <BottomBar settings={settings} />
                <ProductDetail />
              </>
            }
          />
          
          <Route
            path="/work"
            element={
              <>
                <BottomBar settings={settings} />
                <Work />
              </>
            }
          />
          <Route path="/work/:slug" element={<ProjectDetail />} />
          
          <Route
            path="/bts-moodboards"
            element={
              <>
                <BottomBar settings={settings} />
                <BTSMoodboards />
              </>
            }
          />
          
          <Route
            path="/awards"
            element={
              <>
                <BottomBar settings={settings} />
                <Awards />
              </>
            }
          />
          
          <Route
            path="/partners"
            element={
              <>
                <BottomBar settings={settings} />
                <Partners />
              </>
            }
          />
          
          <Route
            path="/products"
            element={
              <>
                <BottomBar settings={settings} />
                <Products />
              </>
            }
          />
          
          <Route
            path="/journal"
            element={
              <>
                <BottomBar settings={settings} />
                <Journal />
              </>
            }
          />
          
          <Route
            path="/journal/:slug"
            element={
              <>
                <BottomBar settings={settings} />
                <JournalDetail />
              </>
            }
          />
          
          <Route
            path="/cart"
            element={
              <>
                <BottomBar settings={settings} />
                <Cart />
              </>
            }
          />
          
          <Route
            path="/checkout"
            element={
              <>
                <BottomBar settings={settings} />
                <Checkout />
              </>
            }
          />
          
          <Route
            path="/contact"
            element={
              <>
                <BottomBar settings={settings} />
                <Contact />
              </>
            }
          />

          {/* ============================================================
              ADMIN ROUTES
          ============================================================ */}
          
          <Route path="/admin/login" element={<AdminLogin />} />
          
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<AdminDashboard />} />
            <Route path="home-images" element={<AdminHomeImages />} />
            <Route path="projects" element={<AdminProjects />} />
            <Route path="projects/:id" element={<AdminProjectEdit />} />
            <Route path="bts" element={<AdminBTS />} />
            <Route path="products" element={<AdminProducts />} />
            <Route path="orders" element={<AdminOrders />} />
            <Route path="about" element={<AdminAbout />} />
            <Route path="settings" element={<AdminSettings />} />
            <Route path="categories" element={<AdminCategories />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="security" element={<AdminSecurity />} />
            <Route path="project-sections" element={<AdminProjectSections />} />
            <Route path="journal" element={<AdminJournal />} />
            <Route path="journal/:id/details" element={<AdminJournalDetails />} />
            <Route path="products/edit/:id" element={<AdminProductEdit />} />
          </Route>
        </Routes>
      </div>

      {/* Loading screen only on home page */}
      {isHomePage && loading && <LoadingScreen onComplete={() => setLoading(false)} />}
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <SiteImagesProvider>
          <AppContent />
        </SiteImagesProvider>
      </CartProvider>
    </AuthProvider>
  );
}