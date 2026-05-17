import { LoginButton } from '../components/auth/LoginButton';
import { APP_NAME } from '../utils/constants';

export function LoginPage() {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-[#1e1e1e] gap-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-white mb-2">{APP_NAME}</h1>
        <p className="text-gray-400">Developer Workspace Manager</p>
      </div>
      <LoginButton />
    </div>
  );
}
