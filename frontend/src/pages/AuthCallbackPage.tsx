import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { storeToken } from '../tauri/commands';

export function AuthCallbackPage() {
  const navigate = useNavigate();
  const { setAuthenticated, setUser } = useAuthStore();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const accessToken = params.get('access_token');
    const refreshToken = params.get('refresh_token');

    if (!accessToken || !refreshToken) {
      navigate('/login', { replace: true });
      return;
    }

    storeToken('access_token', accessToken)
      .then(() => storeToken('refresh_token', refreshToken))
      .then(async () => {
        const resp = await fetch('http://localhost:8080/api/users/me', {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        if (!resp.ok) throw new Error(`API error ${resp.status}`);
        const user = await resp.json();
        setUser(user);
        setAuthenticated(true);
        navigate('/workspaces', { replace: true });
      })
      .catch((err) => {
        setError('Failed to complete sign in: ' + String(err));
      });
  }, [navigate, setAuthenticated, setUser]);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-[#1e1e1e] gap-4">
        <p className="text-red-400">Authentication failed</p>
        <p className="text-gray-400 text-sm">{error}</p>
        <button
          onClick={() => navigate('/login', { replace: true })}
          className="px-4 py-2 bg-[#007acc] text-white rounded hover:bg-[#005999]"
        >
          Back to Login
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center h-screen bg-[#1e1e1e]">
      <p className="text-gray-400">Completing sign in...</p>
    </div>
  );
}
