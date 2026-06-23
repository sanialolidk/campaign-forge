import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../api';
import type { Module } from '../types';

const CATEGORY_COLORS: Record<string, string> = {
  SEO:       'bg-green-100 text-green-700 border-green-200',
  Paid:      'bg-blue-100 text-blue-700 border-blue-200',
  Email:     'bg-yellow-100 text-yellow-700 border-yellow-200',
  Social:    'bg-pink-100 text-pink-700 border-pink-200',
  Analytics: 'bg-purple-100 text-purple-700 border-purple-200',
  Strategy:  'bg-orange-100 text-orange-700 border-orange-200',
};

const CATEGORY_EMOJI: Record<string, string> = {
  SEO: '🔍', Paid: '💰', Email: '📧', Social: '📱', Analytics: '📊', Strategy: '🎯',
};

function renderMarkdown(text: string) {
  return text
    .replace(/^## (.+)$/gm, '<h2 class="text-base font-bold text-gray-900 mt-6 mb-2 pb-1 border-b border-gray-100">$1</h2>')
    .replace(/^### (.+)$/gm, '<h3 class="text-sm font-semibold text-gray-800 mt-4 mb-1">$1</h3>')
    .replace(/\*\*(.+?)\*\*/g, '<strong class="font-semibold text-gray-900">$1</strong>')
    .replace(/`(.+?)`/g, '<code class="bg-orange-50 text-orange-700 px-1.5 py-0.5 rounded text-xs font-mono">$1</code>')
    .replace(/^\| (.+) \|$/gm, (_, row) => {
      const cells = row.split(' | ');
      return `<tr>${cells.map((c: string) => `<td class="border border-gray-200 px-3 py-1.5 text-sm">${c}</td>`).join('')}</tr>`;
    })
    .replace(/(<tr>.*<\/tr>\n?)+/gs, (match) => `<div class="overflow-x-auto my-3"><table class="border-collapse w-full text-sm">${match}</table></div>`)
    .replace(/^- (.+)$/gm, '<li class="ml-4 text-sm text-gray-700 leading-relaxed" style="list-style:disc">$1</li>')
    .replace(/^\d+\. (.+)$/gm, '<li class="ml-4 text-sm text-gray-700 leading-relaxed" style="list-style:decimal">$1</li>')
    .replace(/\n\n/g, '<div class="my-2"></div>');
}

export function LearnTab() {
  const [selected, setSelected] = useState<Module | null>(null);
  const [justCompleted, setJustCompleted] = useState(false);
  const qc = useQueryClient();

  const { data: modules = [] } = useQuery({ queryKey: ['modules'], queryFn: api.listModules });
  const { data: progress = [] } = useQuery({ queryKey: ['progress'], queryFn: api.myProgress });

  const completedIds = new Set(progress.map(p => p.module_id));
  const pct = modules.length ? Math.round((completedIds.size / modules.length) * 100) : 0;

  const complete = useMutation({
    mutationFn: (slug: string) => api.completeModule(slug),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['progress'] });
      setJustCompleted(true);
      setTimeout(() => setJustCompleted(false), 2000);
    },
  });

  if (selected) {
    const done = completedIds.has(selected.id);
    return (
      <div className="animate-fade-up">
        <button onClick={() => setSelected(null)} className="text-sm text-orange-500 font-semibold hover:underline mb-5 flex items-center gap-1">
          ← All modules
        </button>
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
          <div className="px-6 pt-6 pb-4 border-b border-gray-100">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xl">{CATEGORY_EMOJI[selected.category] ?? '📚'}</span>
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${CATEGORY_COLORS[selected.category] ?? 'bg-gray-100 text-gray-600 border-gray-200'}`}>
                {selected.category}
              </span>
              {done && <span className="ml-auto text-xs font-semibold text-green-600 bg-green-50 border border-green-200 px-2.5 py-1 rounded-full">✓ Completed</span>}
            </div>
            <h2 className="text-xl font-bold text-gray-900">{selected.title}</h2>
          </div>
          <div
            className="px-6 py-5 text-gray-700 leading-relaxed"
            dangerouslySetInnerHTML={{ __html: renderMarkdown(selected.content) }}
          />
          {!done && (
            <div className="px-6 pb-6">
              <button
                onClick={() => complete.mutate(selected.slug)}
                disabled={complete.isPending}
                className={`w-full rounded-xl py-3 text-sm font-bold text-white transition-all shadow-lg ${justCompleted ? 'bg-green-500 shadow-green-200 animate-pop' : 'bg-orange-500 hover:bg-orange-600 shadow-orange-200'} disabled:opacity-40`}
              >
                {justCompleted ? '🎉 Completed!' : complete.isPending ? 'Saving…' : 'Mark as complete ✓'}
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-up">
      {/* Progress header */}
      <div className="bg-white rounded-2xl border border-gray-200 p-5 mb-5 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="font-bold text-gray-900">Your progress</p>
            <p className="text-sm text-gray-400">{completedIds.size} of {modules.length} modules completed</p>
          </div>
          <span className="text-3xl font-black text-orange-500">{pct}%</span>
        </div>
        <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-3 bg-gradient-to-r from-orange-400 to-orange-500 rounded-full progress-animate transition-all duration-700"
            style={{ width: `${pct}%` }}
          />
        </div>
        {pct === 100 && (
          <p className="text-sm text-green-600 font-semibold mt-2">🏆 All modules complete! You're a marketing pro.</p>
        )}
      </div>

      {/* Module list */}
      <div className="space-y-3">
        {modules.map((m, i) => {
          const done = completedIds.has(m.id);
          return (
            <button
              key={m.id}
              onClick={() => setSelected(m)}
              className={`w-full bg-white rounded-2xl border p-4 text-left card-hover flex items-center gap-4 ${done ? 'border-green-200' : 'border-gray-200'}`}
              style={{ animationDelay: `${i * 0.05}s` }}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0 ${done ? 'bg-green-50' : 'bg-orange-50'}`}>
                {done ? '✓' : CATEGORY_EMOJI[m.category] ?? '📚'}
              </div>
              <div className="flex-1 min-w-0">
                <p className={`font-semibold text-sm ${done ? 'text-green-700' : 'text-gray-900'}`}>{m.title}</p>
                <p className="text-xs text-gray-400 mt-0.5">{m.category}</p>
              </div>
              <span className={`text-sm flex-shrink-0 ${done ? 'text-green-500' : 'text-gray-300'}`}>
                {done ? '✓' : '→'}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
