import { useEffect, useState } from 'react';
import { api, ApiError } from '../lib/api';
import type { Me } from '../lib/types';
import { useAuth } from '../lib/AuthContext';

export function ProfilePage() {
  const { token } = useAuth();
  const [me, setMe] = useState<Me | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    api
      .getMe(token)
      .then(setMe)
      .catch((err) =>
        setError(err instanceof ApiError ? err.message : 'Failed to load profile'),
      )
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) return <p className="empty-state">Loading...</p>;
  if (error) return <div className="error-banner">{error}</div>;
  if (!me) return null;

  return (
    <div>
      <span className="eyebrow">Account</span>
      <div className="page-header">
        <h1>My Profile</h1>
      </div>
      <dl className="profile-grid">
        <dt>Username</dt>
        <dd>{me.username}</dd>
        <dt>Email</dt>
        <dd>{me.email}</dd>
        <dt>Country</dt>
        <dd>{me.country}</dd>
        <dt>Role</dt>
        <dd>
          <span className="role-badge">{me.role}</span>
        </dd>
      </dl>
    </div>
  );
}
