import { useState } from 'react';
import { api } from '../api';

interface Props {
  onAuth: (token: string) => void;
}

export function AuthForm({ onAuth }: Props) {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const fn = mode === 'login' ? api.login : api.register;
      const { access_token } = await fn(email, password);
      onAuth(access_token);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left panel */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 bg-orange-500 p-12 text-white">
        <div>
          <span className="text-2xl font-black tracking-tight font-heading">Campaign Forge</span>
        </div>
        <div>
          <p className="text-4xl font-bold leading-tight mb-4">
            Learn digital marketing<br />by actually doing it.
          </p>
          <p className="text-orange-100 text-lg">6 modules. 3 real tools. Zero fluff.</p>
        </div>
        <div className="flex gap-6">
          {[['6', 'Modules'], ['3', 'Tools'], ['100%', 'Free']].map(([n, l]) => (
            <div key={l}>
              <p className="text-3xl font-black">{n}</p>
              <p className="text-orange-200 text-sm">{l}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-sm animate-fade-up">
          <div className="lg:hidden mb-8">
            <span className="text-xl font-black text-orange-500 font-heading">Campaign Forge</span>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-1 font-heading">
            {mode === 'login' ? 'Welcome back' : 'Get started free'}
          </h2>
          <p className="text-sm text-gray-400 mb-8">
            {mode === 'login' ? 'Sign in to continue learning' : 'Create your account in seconds'}
          </p>

          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 text-sm focus:outline-none focus:border-orange-400 transition-colors"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 text-sm focus:outline-none focus:border-orange-400 transition-colors"
                placeholder="••••••••"
              />
            </div>
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-sm text-red-600">
                {error}
              </div>
            )}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-orange-500 py-3 text-sm font-bold text-white hover:bg-orange-600 disabled:opacity-40 transition-colors shadow-lg shadow-orange-200"
            >
              {loading ? '…' : mode === 'login' ? 'Sign in →' : 'Create account →'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-400">
            {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
            <button
              onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(''); }}
              className="text-orange-500 font-semibold hover:underline"
            >
              {mode === 'login' ? 'Sign up free' : 'Sign in'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
