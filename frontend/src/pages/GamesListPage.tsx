import { useEffect, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { api, ApiError } from '../lib/api';
import type { Game } from '../lib/types';
import { useAuth } from '../lib/AuthContext';
import { Modal } from '../components/Modal';
import { SkeletonImage } from '../components/SkeletonImage';
import { coverUrl } from '../lib/covers';

export function GamesListPage() {
  const { isAdmin, token } = useAuth();
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showCreate, setShowCreate] = useState(false);
  const [gameName, setGameName] = useState('');
  const [gameDescription, setGameDescription] = useState('');
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  function loadGames() {
    setLoading(true);
    api
      .getGames()
      .then(setGames)
      .catch((err) =>
        setError(err instanceof ApiError ? err.message : 'Failed to load games'),
      )
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    loadGames();
  }, []);

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    if (!token) return;
    setSaving(true);
    setFormError(null);
    try {
      await api.createGame({ gameName, gameDescription }, token);
      setShowCreate(false);
      setGameName('');
      setGameDescription('');
      loadGames();
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : 'Failed to create game');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <span className="eyebrow">Leaderboards</span>
      <div className="page-header">
        <h1>Games</h1>
        {isAdmin && (
          <button type="button" className="btn" onClick={() => setShowCreate(true)}>
            Add Game
          </button>
        )}
      </div>
      <p className="subtitle">Browse games and jump into their leaderboards.</p>

      {loading && <p className="empty-state">Loading games...</p>}
      {error && <div className="error-banner">{error}</div>}

      {!loading && !error && games.length === 0 && (
        <p className="empty-state">No games have been added yet.</p>
      )}

      <div className="card-grid">
        {games.map((game) => (
          <Link key={game.gameId} to={`/games/${game.gameId}`} className="card">
            <SkeletonImage
              className="card-cover"
              src={coverUrl(game.gameId)}
              alt=""
            />
            <div className="card-body">
              <h3>{game.gameName}</h3>
              <p>{game.gameDescription}</p>
            </div>
          </Link>
        ))}
      </div>

      {showCreate && (
        <Modal title="Add a New Game" onClose={() => setShowCreate(false)}>
          {formError && <div className="error-banner">{formError}</div>}
          <form className="form" onSubmit={handleCreate}>
            <div className="field">
              <label htmlFor="new-game-name">Name</label>
              <input
                id="new-game-name"
                required
                value={gameName}
                onChange={(e) => setGameName(e.target.value)}
              />
            </div>
            <div className="field">
              <label htmlFor="new-game-desc">Description</label>
              <textarea
                id="new-game-desc"
                required
                rows={3}
                value={gameDescription}
                onChange={(e) => setGameDescription(e.target.value)}
              />
            </div>
            <button className="btn" type="submit" disabled={saving}>
              {saving ? 'Saving...' : 'Create Game'}
            </button>
          </form>
        </Modal>
      )}
    </div>
  );
}
