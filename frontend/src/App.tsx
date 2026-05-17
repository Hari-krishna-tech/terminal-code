import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthGuard } from './components/auth/AuthGuard';
import { LoginPage } from './pages/LoginPage';
import { WorkspacePage } from './pages/WorkspacePage';
import { AuthCallbackPage } from './pages/AuthCallbackPage';
import { useAuthStore } from './store/authStore';

export default function App() {
  const { setAuthenticated, setUser, setLoading } = useAuthStore();

  useEffect(() => {
    initializeAuth(setAuthenticated, setUser, setLoading);
  }, [setAuthenticated, setUser, setLoading]);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/auth/callback" element={<AuthCallbackPage />} />
        <Route
          path="/workspaces/*"
          element={
            <AuthGuard>
              <WorkspacePage />
            </AuthGuard>
          }
        />
        <Route path="*" element={<Navigate to="/workspaces" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

async function initializeAuth(
  setAuthenticated: (v: boolean) => void,
  setUser: (user: { id: string; email: string; displayName: string; avatarUrl: string | null }) => void,
  setLoading: (v: boolean) => void,
) {
  try {
    const { getToken } = await import('./tauri/commands');
    const token = await getToken('access_token');

    if (!token) {
      setAuthenticated(false);
      setLoading(false);
      return;
    }

    const { getMe } = await import('./api/auth');
    const user = await getMe();
    setUser(user);
    setAuthenticated(true);
  } catch {
    setAuthenticated(false);
  } finally {
    setLoading(false);
  }

  try {
    const deepLink = await import('@tauri-apps/plugin-deep-link');
    deepLink.onOpenUrl(handleDeepLink);
    const current = await deepLink.getCurrent();
    if (current && current.length > 0) {
      handleDeepLink(current);
    }
  } catch {
    // not in Tauri
  }
}

async function handleDeepLink(urls: string[]) {
  for (const raw of urls) {
    try {
      const url = new URL(raw);
      const accessToken = url.searchParams.get('access_token');
      const refreshToken = url.searchParams.get('refresh_token');
      if (!accessToken || !refreshToken) continue;

      const { storeToken } = await import('./tauri/commands');
      await storeToken('access_token', accessToken);
      await storeToken('refresh_token', refreshToken);

      const { getMe } = await import('./api/auth');
      const user = await getMe();

      useAuthStore.getState().setUser(user);
      useAuthStore.getState().setAuthenticated(true);

      window.location.href = '/workspaces';
    } catch {
      // ignore malformed deep links
    }
  }
}
