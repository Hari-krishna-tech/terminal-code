import { useState } from 'react';
import { API_BASE_URL } from '../../utils/constants';

const GOOGLE_OAUTH_URL = `${API_BASE_URL}/oauth2/authorization/google`;

export function LoginButton() {
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);

    let isTauri = false;
    try {
      isTauri = typeof window !== 'undefined' && '__TAURI__' in window;
    } catch {
      // not in Tauri
    }

    if (isTauri) {
      window.open(GOOGLE_OAUTH_URL, '_blank');
    } else {
      const redirectUri = window.location.origin + '/auth/callback';
      window.location.href = GOOGLE_OAUTH_URL + '?fe_redirect=' + encodeURIComponent(redirectUri);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center gap-3 px-6 py-3 bg-white rounded-md font-medium shadow-lg opacity-60">
        <svg className="animate-spin h-5 w-5 text-gray-500" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
        Signing in...
      </div>
    );
  }

  return (
    <button
      onClick={handleLogin}
      className="flex items-center gap-3 px-6 py-3 bg-white hover:bg-gray-100
                 text-gray-800 rounded-md font-medium transition-colors
                 shadow-lg hover:shadow-xl"
    >
      <svg className="w-5 h-5" viewBox="0 0 24 24">
        <path
          fill="#4285F4"
          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
        />
        <path
          fill="#34A853"
          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        />
        <path
          fill="#FBBC05"
          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        />
        <path
          fill="#EA4335"
          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        />
      </svg>
      Sign in with Google
    </button>
  );
}
