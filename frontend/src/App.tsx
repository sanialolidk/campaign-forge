import { useState, useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthForm } from './components/AuthForm';
import { LearnTab } from './components/LearnTab';
import { PracticeTab } from './components/PracticeTab';

const qc = new QueryClient();

type Tab = 'learn' | 'practice';

function App() {
  const [token, setToken] = useState<string | null>(localStorage.getItem('cf_token'));

  const handleAuth = (t: string) => {
    localStorage.setItem('cf_token', t);
    setToken(t);
  };

  const handleLogout = () => {
    localStorage.removeItem('cf_token');
    setToken(null);
    qc.clear();
  };

  useEffect(() => {
    const handler = () => handleLogout();
    window.addEventListener('cf:logout', handler);
    return () => window.removeEventListener('cf:logout', handler);
  }, []);

  return (
    <QueryClientProvider client={qc}>
      {!token ? <AuthForm onAuth={handleAuth} /> : <Dashboard onLogout={handleLogout} />}
    </QueryClientProvider>
  );
}

function Dashboard({ onLogout }: { onLogout: () => void }) {
  const [tab, setTab] = useState<Tab>('learn');

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-lg font-black text-orange-500 tracking-tight font-heading">Campaign Forge</span>
            <span className="text-xs bg-orange-50 text-orange-400 border border-orange-200 px-2 py-0.5 rounded-full font-medium">beta</span>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
              {(['learn', 'practice'] as Tab[]).map(t => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`px-4 py-1.5 rounded-md text-sm font-semibold capitalize tab-transition ${tab === t ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                >
                  {t === 'learn' ? '📖 Learn' : '🛠 Practice'}
                </button>
              ))}
            </div>
            <button onClick={onLogout} className="text-xs text-gray-400 hover:text-gray-600 transition-colors font-medium">
              Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-8">
        {tab === 'learn' && <LearnTab />}
        {tab === 'practice' && <PracticeTab />}
      </main>
    </div>
  );
}

export default App;
