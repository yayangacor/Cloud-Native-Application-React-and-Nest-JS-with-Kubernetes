import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/AuthContext';

export function Layout() {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/');
  }

  return (
    <div className="shell">
      <header className="navbar">
        <Link to="/" className="brand">
          WSpeedrun
        </Link>
        <nav className="nav-links">
          <NavLink to="/" end>
            Games
          </NavLink>
          {isAuthenticated ? (
            <>
              <NavLink to="/profile">Profile</NavLink>
              <span className="nav-user">{user?.username}</span>
              <button type="button" className="btn-link" onClick={handleLogout}>
                Log out
              </button>
            </>
          ) : (
            <NavLink to="/auth">Log in</NavLink>
          )}
        </nav>
      </header>
      <main className="content">
        <Outlet />
      </main>
    </div>
  );
}
