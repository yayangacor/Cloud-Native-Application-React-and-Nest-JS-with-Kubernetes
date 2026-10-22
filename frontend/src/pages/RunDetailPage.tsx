import { useEffect, useState, type FormEvent } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api, ApiError } from '../lib/api';
import type { RunDetail } from '../lib/types';
import { useAuth } from '../lib/AuthContext';
import { SkeletonImage } from '../components/SkeletonImage';
import { coverUrl } from '../lib/covers';

export function RunDetailPage() {
  const { runId } = useParams<{ runId: string }>();
  const { isAuthenticated, token } = useAuth();

  const [run, setRun] = useState<RunDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [comment, setComment] = useState('');
  const [posting, setPosting] = useState(false);
  const [commentError, setCommentError] = useState<string | null>(null);

  function loadRun(id: string) {
    setLoading(true);
    api
      .getRun(id)
      .then(setRun)
      .catch((err) =>
        setError(err instanceof ApiError ? err.message : 'Failed to load run'),
      )
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    if (runId) loadRun(runId);
  }, [runId]);

  async function handleAddComment(e: FormEvent) {
    e.preventDefault();
    if (!token || !runId || !comment.trim()) return;
    setPosting(true);
    setCommentError(null);
    try {
      await api.addComment(runId, comment.trim(), token);
      setComment('');
      loadRun(runId);
    } catch (err) {
      setCommentError(
        err instanceof ApiError ? err.message : 'Failed to add comment',
      );
    } finally {
      setPosting(false);
    }
  }

  if (loading) return <p className="empty-state">Loading...</p>;
  if (error) return <div className="error-banner">{error}</div>;
  if (!run) return null;

  return (
    <div>
      <span className="eyebrow">Run</span>

      <div className="run-card">
        <SkeletonImage
          className="run-cover"
          src={coverUrl(run.gameId, 640, 220)}
          alt=""
        />
        <div className="run-card-body">
          <h1>{run.game.gameName} run</h1>
          <div className="stat-row">
            <span className="stat">
              <span className="stat-label">Runner</span>
              {run.user.username}
            </span>
            <span className="stat">
              <span className="stat-label">Country</span>
              {run.user.country}
            </span>
            <span className="stat">
              <span className="stat-label">Time</span>
              {run.runDuration}
            </span>
            <span className="stat">
              <span className="stat-label">Submitted</span>
              {new Date(run.submittedAt).toLocaleString()}
            </span>
          </div>
          <a
            className="btn"
            href={run.vodUrl}
            target="_blank"
            rel="noreferrer"
          >
            Watch VOD
          </a>
        </div>
      </div>

      <div className="section-heading">
        <h2>Comments ({run.comments.length})</h2>
      </div>

      {run.comments.length === 0 ? (
        <p className="empty-state">No comments yet.</p>
      ) : (
        <div className="comment-list">
          {run.comments.map((c) => (
            <div className="comment" key={c.commentId}>
              <div className="comment-meta">
                <strong>{c.user.username}</strong>
                <span>{new Date(c.createdAt).toLocaleString()}</span>
              </div>
              <p>{c.comment}</p>
            </div>
          ))}
        </div>
      )}

      <div className="comment-form-card">
        {isAuthenticated ? (
          <form className="form" onSubmit={handleAddComment}>
            {commentError && <div className="error-banner">{commentError}</div>}
            <div className="field">
              <label htmlFor="new-comment">Add a comment</label>
              <textarea
                id="new-comment"
                rows={3}
                required
                value={comment}
                onChange={(e) => setComment(e.target.value)}
              />
            </div>
            <button className="btn" type="submit" disabled={posting}>
              {posting ? 'Posting...' : 'Post Comment'}
            </button>
          </form>
        ) : (
          <p className="subtitle" style={{ margin: 0 }}>
            <Link to="/auth">Log in</Link> to leave a comment.
          </p>
        )}
      </div>

      <p className="back-link">
        <Link to={`/games/${run.gameId}`}>&larr; Back to {run.game.gameName}</Link>
      </p>
    </div>
  );
}
