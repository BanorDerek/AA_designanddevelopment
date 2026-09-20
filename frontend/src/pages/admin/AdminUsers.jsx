import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import './AdminUsers.css';

export default function AdminUsers() {
  const { authFetch, user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [creating, setCreating] = useState(false);

  const isSuperAdmin = currentUser?.role === 'superadmin';

  const load = () => {
    setLoading(true);
    authFetch('/auth/users').then((r) => r.json()).then(setUsers).finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setError('');
    setCreating(true);
    try {
      const res = await authFetch('/auth/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to create admin');
      }
      setForm({ name: '', email: '', password: '' });
      setShowForm(false);
      load();
    } catch (err) {
      setError(err.message);
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id, email) => {
    if (!confirm(`Remove admin access for ${email}?`)) return;
    const res = await authFetch(`/auth/users/${id}`, { method: 'DELETE' });
    if (!res.ok) {
      const data = await res.json();
      alert(data.error || 'Failed to remove admin');
      return;
    }
    load();
  };

  const handleRoleToggle = async (u) => {
    const newRole = u.role === 'superadmin' ? 'admin' : 'superadmin';
    if (!confirm(`Change ${u.email} to ${newRole}?`)) return;
    const res = await authFetch(`/auth/users/${u.id}/role`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role: newRole }),
    });
    if (!res.ok) {
      const data = await res.json();
      alert(data.error || 'Failed to update role');
      return;
    }
    load();
  };

  return (
    <div>
      <div className="admin-projects__header">
        <div>
          <h1 className="admin-page__title">Admin Users</h1>
          <p className="admin-page__subtitle">
            {isSuperAdmin
              ? 'People with access to this dashboard. Only super admins can add, remove, or promote others.'
              : 'People with access to this dashboard.'}
          </p>
        </div>
        {isSuperAdmin && (
          <button className="admin-btn" onClick={() => setShowForm((v) => !v)}>
            {showForm ? 'Cancel' : '+ New Admin'}
          </button>
        )}
      </div>

      {showForm && isSuperAdmin && (
        <form className="admin-projects__form" onSubmit={handleCreate}>
          <label>
            Name
            <input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
          </label>
          <label>
            Email
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              required
            />
          </label>
          <label>
            Password (min. 8 characters)
            <input
              type="password"
              value={form.password}
              onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
              required
              minLength={8}
            />
          </label>
          {error && <p className="admin-page__error">{error}</p>}
          <button className="admin-btn" type="submit" disabled={creating}>
            {creating ? 'Creating…' : 'Create Admin'}
          </button>
        </form>
      )}

      {loading ? (
        <p>Loading…</p>
      ) : (
        <div className="admin-users__list">
          {users.map((u) => (
            <div className="admin-users__row" key={u.id}>
              <div>
                <span className="admin-users__name">
                  {u.name || u.email}
                  {u.role === 'superadmin' && <span className="admin-users__badge">Super Admin</span>}
                </span>
                <span className="admin-users__email">{u.email}</span>
              </div>

              <div className="admin-users__actions">
                {u.id === currentUser?.id ? (
                  <span className="admin-users__you">You</span>
                ) : isSuperAdmin ? (
                  <>
                    <button className="admin-btn admin-btn--small admin-btn--ghost" onClick={() => handleRoleToggle(u)}>
                      {u.role === 'superadmin' ? 'Demote' : 'Make Super Admin'}
                    </button>
                    <button
                      className="admin-btn admin-btn--small admin-btn--danger"
                      onClick={() => handleDelete(u.id, u.email)}
                    >
                      Remove
                    </button>
                  </>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}