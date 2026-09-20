import { Link } from 'react-router-dom';
import './AdminDashboard.css';

const SECTIONS = [
  { label: 'Home Page Images', desc: '5 hero image slots', path: '/admin/home-images' },
  { label: 'Projects', desc: 'Select Work portfolio entries', path: '/admin/projects' },
  { label: 'About Page', desc: 'Hero, sections, team, values', path: '/admin/about' },
  { label: 'Site Settings', desc: 'Social links, contact email', path: '/admin/settings' },
];

export default function AdminDashboard() {
  return (
    <div>
      <h1 className="admin-dashboard__title">Welcome back</h1>
      <div className="admin-dashboard__grid">
        {SECTIONS.map((s) => (
          <Link to={s.path} className="admin-dashboard__card" key={s.path}>
            <h2>{s.label}</h2>
            <p>{s.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}