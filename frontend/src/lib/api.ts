import type { AuthUser, Comment, Game, Me, Run, RunDetail } from './types';

const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

async function request<T>(
  path: string,
  options: RequestInit = {},
  token?: string | null,
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers });

  if (!res.ok) {
    let message = res.statusText;
    try {
      const body = await res.json();
      message = body?.error ?? body?.message ?? message;
    } catch {
      // ignore body parse failure, fall back to statusText
    }
    throw new ApiError(res.status, message);
  }

  if (res.status === 204) {
    return undefined as T;
  }
  return res.json() as Promise<T>;
}

export const api = {
  register: (data: {
    username: string;
    email: string;
    password: string;
    country: string;
  }) => request<{ msg: string }>('/auth/register', {
    method: 'POST',
    body: JSON.stringify(data),
  }),

  login: (data: { email: string; password: string }) =>
    request<{ token: string } & AuthUser>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getMe: (token: string) => request<Me>('/users/me', {}, token),

  getGames: () => request<Game[]>('/games'),

  getGame: (gameId: string) => request<Game>(`/games/${gameId}`),

  createGame: (
    data: { gameName: string; gameDescription: string },
    token: string,
  ) =>
    request<Game>(
      '/games',
      { method: 'POST', body: JSON.stringify(data) },
      token,
    ),

  updateGame: (
    gameId: string,
    data: { gameName: string; gameDescription: string },
    token: string,
  ) =>
    request<Game>(
      `/games/${gameId}`,
      { method: 'PATCH', body: JSON.stringify(data) },
      token,
    ),

  deleteGame: (gameId: string, token: string) =>
    request<Game>(`/games/${gameId}`, { method: 'DELETE' }, token),

  getRunsByGame: (gameId: string) =>
    request<Run[]>(`/games/${gameId}/runs`),

  getRun: (runId: string) => request<RunDetail>(`/runs/${runId}`),

  submitRun: (
    data: { gameId: string; vodUrl: string; runDuration: number },
    token: string,
  ) =>
    request<Run>('/runs', { method: 'POST', body: JSON.stringify(data) }, token),

  addComment: (runId: string, comment: string, token: string) =>
    request<Comment>(
      `/runs/${runId}/comments`,
      { method: 'POST', body: JSON.stringify({ comment }) },
      token,
    ),
};
