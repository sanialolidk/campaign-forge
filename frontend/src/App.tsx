import { useState } from 'react';
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

  if (!token) {
    return (
      <QueryClientProvider client={qc}>
        <AuthForm onAuth={handleAuth} />
      </QueryClientProvider>
    );
  }

  return (
    <QueryClientProvider client={qc}>
      <Dashboard onLogout={handleLogout} />
    </QueryClientProvider>
  );
}

function Dashboard({ onLogout }: { onLogout: () => void }) {
  const [tab, setTab] = useState<Tab>('learn');

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-lg font-bold text-indigo-600">Campaign Forge</span>
          <span className="text-xs bg-indigo-50 text-indigo-500 px-2 py-0.5 rounded">beta</span>
        </div>
        <button onClick={onLogout} className="text-xs text-gray-400 hover:text-gray-600 transition-colors">
          Sign out
        </button>
      </header>

      <div className="max-w-3xl mx-auto px-6 py-6">
        <div className="flex gap-1 bg-gray-100 rounded-lg p-1 mb-6 w-fit">
          {(['learn', 'practice'] as Tab[]).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-5 py-1.5 rounded-md text-sm font-medium capitalize transition-colors ${tab === t ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              {t}
            </button>
          ))}
        </div>

        {tab === 'learn' && <LearnTab />}
        {tab === 'practice' && <PracticeTab />}
      </div>
    </div>
  );
}

export default App;
