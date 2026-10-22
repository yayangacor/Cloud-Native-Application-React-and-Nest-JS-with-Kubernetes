import { useEffect, useState, type FormEvent } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { api, ApiError } from '../lib/api';
import type { Game, Run } from '../lib/types';
import { useAuth } from '../lib/AuthContext';
import { Modal } from '../components/Modal';
import { SkeletonImage } from '../components/SkeletonImage';
import { coverUrl } from '../lib/covers';

export function GameDetailPage() {
  const { gameId } = useParams<{ gameId: string }>();
  const navigate = useNavigate();
  const { isAdmin, isAuthenticated, token } = useAuth();

  const [game, setGame] = useState<Game | null>(null);
  const [runs, setRuns] = useState<Run[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showEdit, setShowEdit] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [showSubmitRun, setShowSubmitRun] = useState(false);

  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');

  const [vodUrl, setVodUrl] = useState('');
  const [runDuration, setRunDuration] = useState('');

  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  function loadData(id: string) {
    setLoading(true);
    Promise.all([api.getGame(id), api.getRunsByGame(id)])
      .then(([gameData, runData]) => {
        setGame(gameData);
        setEditName(gameData.gameName);
        setEditDescription(gameData.gameDescription);
        setRuns(runData);
      })
      .catch((err) =>
        setError(err instanceof ApiError ? err.message : 'Failed to load game'),
      )
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    if (gameId) loadData(gameId);
  }, [gameId]);

  async function handleEdit(e: FormEvent) {
    e.preventDefault();
    if (!token || !gameId) return;
    setSaving(true);
    setFormError(null);
    try {
      const updated = await api.updateGame(
        gameId,
        { gameName: editName, gameDescription: editDescription },
        token,
      );
      setGame(updated);
      setShowEdit(false);
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : 'Failed to update game');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!token || !gameId) return;
    setSaving(true);
    setFormError(null);
    try {
      await api.deleteGame(gameId, token);
      navigate('/');
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : 'Failed to delete game');
      setSaving(false);
    }
  }

  async function handleSubmitRun(e: FormEvent) {
    e.preventDefault();
    if (!token || !gameId) return;
    setSaving(true);
    setFormError(null);
    try {
      await api.submitRun(
        { gameId, vodUrl, runDuration: Number(runDuration) },
        token,
      );
      setShowSubmitRun(false);
      setVodUrl('');
      setRunDuration('');
      loadData(gameId);
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : 'Failed to submit run');
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <p className="empty-state">Loading...</p>;
  if (error) return <div className="error-banner">{error}</div>;
  if (!game) return null;

  return (
    <div>
      <SkeletonImage
        className="game-banner"
        src={coverUrl(game.gameId, 1000, 260)}
        alt=""
      />
      <span className="eyebrow">Game</span>
      <div className="page-header">
        <h1>{game.gameName}</h1>
        <div className="btn-row">
          {isAuthenticated && (
            <button type="button" className="btn" onClick={() => setShowSubmitRun(true)}>
              Submit Run
            </button>
          )}
          {isAdmin && (
            <>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setShowEdit(true)}
              >
                Edit
              </button>
              <button
                type="button"
                className="btn btn-danger"
                onClick={() => setShowDelete(true)}
              >
                Delete
              </button>
            </>
          )}
        </div>
      </div>
      <p className="game-detail-meta">{game.gameDescription}</p>

      <div className="section-heading">
        <h2>Leaderboard</h2>
      </div>

      {runs.length === 0 ? (
        <p className="empty-state">No runs submitted for this game yet.</p>
      ) : (
        <div className="leaderboard-wrap">
          <table className="leaderboard">
            <thead>
              <tr>
                <th>Rank</th>
                <th>Runner</th>
                <th>Country</th>
                <th>Time</th>
                <th>Submitted</th>
              </tr>
            </thead>
            <tbody>
              {runs.map((run, index) => (
                <tr
                  key={run.runId}
                  className="clickable"
                  onClick={() => navigate(`/runs/${run.runId}`)}
                >
                  <td>
                    <span className={`rank ${index < 3 ? `rank-${index + 1}` : ''}`}>
                      {index + 1}
                    </span>
                  </td>
                  <td>{run.user.username}</td>
                  <td>{run.user.country}</td>
                  <td>{run.runDuration}</td>
                  <td>{new Date(run.submittedAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showSubmitRun && (
        <Modal title="Submit a Run" onClose={() => setShowSubmitRun(false)}>
          {formError && <div className="error-banner">{formError}</div>}
          <form className="form" onSubmit={handleSubmitRun}>
            <div className="field">
              <label htmlFor="vod-url">VOD URL</label>
              <input
                id="vod-url"
                type="url"
                required
                placeholder="https://..."
                value={vodUrl}
                onChange={(e) => setVodUrl(e.target.value)}
              />
            </div>
            <div className="field">
              <label htmlFor="run-duration">Duration (seconds)</label>
              <input
                id="run-duration"
                type="number"
                min={1}
                required
                value={runDuration}
                onChange={(e) => setRunDuration(e.target.value)}
              />
            </div>
            <button className="btn" type="submit" disabled={saving}>
              {saving ? 'Submitting...' : 'Submit Run'}
            </button>
          </form>
        </Modal>
      )}

      {showEdit && (
        <Modal title="Edit Game" onClose={() => setShowEdit(false)}>
          {formError && <div className="error-banner">{formError}</div>}
          <form className="form" onSubmit={handleEdit}>
            <div className="field">
              <label htmlFor="edit-game-name">Name</label>
              <input
                id="edit-game-name"
                required
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
              />
            </div>
            <div className="field">
              <label htmlFor="edit-game-desc">Description</label>
              <textarea
                id="edit-game-desc"
                required
                rows={3}
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
              />
            </div>
            <button className="btn" type="submit" disabled={saving}>
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        </Modal>
      )}

      {showDelete && (
        <Modal title="Delete Game" onClose={() => setShowDelete(false)}>
          {formError && <div className="error-banner">{formError}</div>}
          <p>
            Are you sure you want to delete <strong>{game.gameName}</strong>? This
            will also delete all of its runs and comments.
          </p>
          <div className="btn-row">
            <button
              type="button"
              className="btn btn-danger"
              onClick={handleDelete}
              disabled={saving}
            >
              {saving ? 'Deleting...' : 'Delete'}
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setShowDelete(false)}
            >
              Cancel
            </button>
          </div>
        </Modal>
      )}

      <p style={{ marginTop: 32 }}>
        <Link to="/">Back to games</Link>
      </p>
    </div>
  );
}
