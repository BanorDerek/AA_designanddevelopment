// pages/admin/AdminLayout.jsx
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './AdminLayout.css';

const NAV_ITEMS = [
  { label: 'Dashboard', path: '/admin' },
  { label: 'Home Images', path: '/admin/home-images' },
  { label: 'Projects', path: '/admin/projects' },
  { label: 'Journal', path: '/admin/journal' }, // Main journal
  { label: 'Products', path: '/admin/products' },
  { label: 'Categories', path: '/admin/categories' },
  { label: 'Orders', path: '/admin/orders' },
  { label: 'About Page', path: '/admin/about' },
  { label: 'Site Settings', path: '/admin/settings' },
  { label: 'Admin Users', path: '/admin/users' },
  { label: 'Security', path: '/admin/security' },
  { label: 'Project Sections', path: '/admin/project-sections' },
];
export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="admin-sidebar__brand">AA Admin</div>
        <nav className="admin-sidebar__nav">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/admin'}
              className={({ isActive }) =>
                `admin-sidebar__link ${isActive ? 'admin-sidebar__link--active' : ''}`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="admin-sidebar__footer">
          <span className="admin-sidebar__user">{user?.email}</span>
          <button className="admin-sidebar__logout" onClick={handleLogout}>
            Log out
          </button>
        </div>
      </aside>
      <main className="admin-content">
        <Outlet />
      </main>
    </div>
  );
}