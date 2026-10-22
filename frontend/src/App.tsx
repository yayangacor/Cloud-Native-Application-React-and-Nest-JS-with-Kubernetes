import { Route, Routes } from 'react-router-dom';
import './App.css';
import { Layout } from './components/Layout';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AuthPage } from './pages/AuthPage';
import { GamesListPage } from './pages/GamesListPage';
import { GameDetailPage } from './pages/GameDetailPage';
import { RunDetailPage } from './pages/RunDetailPage';
import { ProfilePage } from './pages/ProfilePage';

function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<GamesListPage />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/games/:gameId" element={<GameDetailPage />} />
        <Route path="/runs/:runId" element={<RunDetailPage />} />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />
      </Route>
    </Routes>
  );
}

export default App;
