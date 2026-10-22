export type Role = 'USER' | 'GUEST' | 'ADMIN';

export interface AuthUser {
  username: string;
  email: string;
  country: string;
  role: Role;
}

export interface Me {
  userId: string;
  username: string;
  email: string;
  country: string;
  role: Role;
}

export interface Game {
  gameId: string;
  gameName: string;
  gameDescription: string;
}

export interface RunUser {
  userId: string;
  username: string;
  country: string;
}

export interface Run {
  runId: string;
  gameId: string;
  userId: string;
  vodUrl: string;
  runDuration: string;
  submittedAt: string;
  user: RunUser;
}

export interface Comment {
  commentId: string;
  comment: string;
  createdAt: string;
  user: RunUser;
}

export interface RunDetail extends Run {
  game: Game;
  comments: Comment[];
}
