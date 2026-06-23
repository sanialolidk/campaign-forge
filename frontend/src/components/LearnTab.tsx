import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../api';
import type { Module } from '../types';

const CATEGORY_COLORS: Record<string, string> = {
  SEO: 'bg-green-100 text-green-700',
  Paid: 'bg-blue-100 text-blue-700',
  Email: 'bg-yellow-100 text-yellow-700',
  Social: 'bg-pink-100 text-pink-700',
  Analytics: 'bg-purple-100 text-purple-700',
  Strategy: 'bg-orange-100 text-orange-700',
};

function renderMarkdown(text: string) {
  return text
    .replace(/^## (.+)$/gm, '<h2 class="text-lg font-semibold text-gray-800 mt-6 mb-2">$1</h2>')
    .replace(/^### (.+)$/gm, '<h3 class="text-base font-semibold text-gray-700 mt-4 mb-1">$1</h3>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/`(.+?)`/g, '<code class="bg-gray-100 px-1 rounded text-sm font-mono">$1</code>')
    .replace(/^\| (.+) \|$/gm, (_, row) => {
      const cells = row.split(' | ');
      return `<tr>${cells.map((c: string) => `<td class="border border-gray-200 px-3 py-1 text-sm">${c}</td>`).join('')}</tr>`;
    })
    .replace(/^- (.+)$/gm, '<li class="ml-4 list-disc text-sm text-gray-700">$1</li>')
    .replace(/^\d+\. (.+)$/gm, '<li class="ml-4 list-decimal text-sm text-gray-700">$1</li>')
    .replace(/\n\n/g, '<br/>')
    .replace(/<tr>(.+?)<\/tr>/gs, (match) => `<table class="border-collapse w-full my-3">${match}</table>`);
}

export function LearnTab() {
  const [selected, setSelected] = useState<Module | null>(null);
  const qc = useQueryClient();

  const { data: modules = [] } = useQuery({ queryKey: ['modules'], queryFn: api.listModules });
  const { data: progress = [] } = useQuery({ queryKey: ['progress'], queryFn: api.myProgress });

  const completedIds = new Set(progress.map(p => p.module_id));

  const complete = useMutation({
    mutationFn: (slug: string) => api.completeModule(slug),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['progress'] }),
  });

  if (selected) {
    const done = completedIds.has(selected.id);
    return (
      <div className="max-w-2xl mx-auto">
        <button onClick={() => setSelected(null)} className="text-sm text-indigo-600 hover:underline mb-4 block">
          ← Back to modules
        </button>
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${CATEGORY_COLORS[selected.category] ?? 'bg-gray-100 text-gray-600'}`}>
              {selected.category}
            </span>
            {done && <span className="text-xs text-green-600 font-medium">✓ Completed</span>}
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-4">{selected.title}</h2>
          <div
            className="text-sm text-gray-700 leading-relaxed space-y-1"
            dangerouslySetInnerHTML={{ __html: renderMarkdown(selected.content) }}
          />
          {!done && (
            <button
              onClick={() => complete.mutate(selected.slug)}
              disabled={complete.isPending}
              className="mt-6 w-full rounded-lg bg-indigo-600 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-40 transition-colors"
            >
              {complete.isPending ? 'Marking…' : 'Mark as complete'}
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-gray-500">{completedIds.size} / {modules.length} completed</p>
        <div className="h-2 w-48 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-2 bg-indigo-500 rounded-full transition-all"
            style={{ width: `${modules.length ? (completedIds.size / modules.length) * 100 : 0}%` }}
          />
        </div>
      </div>
      <div className="grid gap-3">
        {modules.map(m => (
          <button
            key={m.id}
            onClick={() => setSelected(m)}
            className="bg-white rounded-xl border border-gray-200 p-4 text-left hover:border-indigo-300 hover:shadow-sm transition-all flex items-center justify-between"
          >
            <div>
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${CATEGORY_COLORS[m.category] ?? 'bg-gray-100 text-gray-600'} mb-2 inline-block`}>
                {m.category}
              </span>
              <p className="font-medium text-gray-800 text-sm">{m.title}</p>
            </div>
            {completedIds.has(m.id) ? (
              <span className="text-green-500 text-lg">✓</span>
            ) : (
              <span className="text-gray-300 text-lg">→</span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
