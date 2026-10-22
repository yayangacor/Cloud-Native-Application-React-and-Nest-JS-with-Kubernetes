# WSpeedrun API

Monolithic NestJS service consolidating the former `auth`, `game`, and `run`
microservices into a single deployable app with one database.

## Project setup

```bash
npm install
```

## Compile and run the project

```bash
# development
npm run start

# watch mode
npm run start:dev

# production mode
npm run start:prod
```

Swagger docs are served at `/api` once the app is running.

## Endpoints (12 core routes)

- `POST /auth/register`
- `POST /auth/login`
- `GET /users/me`
- `GET /games`
- `GET /games/:id`
- `POST /games` (admin)
- `PATCH /games/:id` (admin)
- `DELETE /games/:id` (admin)
- `GET /games/:gameId/runs`
- `POST /runs`
- `GET /runs/:id`
- `POST /runs/:runId/comments`
