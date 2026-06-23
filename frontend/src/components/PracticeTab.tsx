import { useState } from 'react';
import { api } from '../api';
import type { UTMResult, ABTestResult, BudgetResult } from '../types';

const CHANNELS = ['SEO', 'Paid Search', 'Social Media', 'Email', 'Display', 'Other'];

function UTMBuilder() {
  const [form, setForm] = useState({ url: '', source: '', medium: '', campaign: '', term: '', content: '' });
  const [result, setResult] = useState<UTMResult | null>(null);
  const [err, setErr] = useState('');
  const [copied, setCopied] = useState(false);

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const run = async () => {
    setErr('');
    try {
      const res = await api.buildUTM(form);
      setResult(res);
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : 'Error');
    }
  };

  const copy = () => {
    if (result) {
      navigator.clipboard.writeText(result.utm_url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <h3 className="font-semibold text-gray-800 mb-1">UTM Builder</h3>
      <p className="text-xs text-gray-400 mb-4">Tag your URLs to track traffic sources in analytics.</p>
      <div className="grid grid-cols-2 gap-3">
        {[
          ['url', 'Website URL *', 'https://example.com/page'],
          ['source', 'Source *', 'newsletter'],
          ['medium', 'Medium *', 'email'],
          ['campaign', 'Campaign *', 'summer-sale'],
          ['term', 'Term (optional)', 'running shoes'],
          ['content', 'Content (optional)', 'header-cta'],
        ].map(([key, label, placeholder]) => (
          <div key={key} className={key === 'url' ? 'col-span-2' : ''}>
            <label className="block text-xs text-gray-500 mb-1">{label}</label>
            <input
              value={(form as Record<string, string>)[key]}
              onChange={e => set(key, e.target.value)}
              placeholder={placeholder}
              className="w-full rounded-lg border border-gray-200 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
            />
          </div>
        ))}
      </div>
      {err && <p className="text-red-500 text-xs mt-2">{err}</p>}
      <button onClick={run} className="mt-4 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700">
        Build URL
      </button>
      {result && (
        <div className="mt-4 bg-gray-50 rounded-lg p-3">
          <p className="text-xs text-gray-500 mb-1">Your tagged URL:</p>
          <p className="text-xs font-mono text-gray-800 break-all">{result.utm_url}</p>
          <button onClick={copy} className="mt-2 text-xs text-indigo-600 hover:underline">
            {copied ? 'Copied!' : 'Copy to clipboard'}
          </button>
        </div>
      )}
    </div>
  );
}

function ABTester() {
  const [form, setForm] = useState({ visitors_a: '', conversions_a: '', visitors_b: '', conversions_b: '' });
  const [result, setResult] = useState<ABTestResult | null>(null);
  const [err, setErr] = useState('');

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const run = async () => {
    setErr('');
    try {
      const res = await api.abTest({
        visitors_a: Number(form.visitors_a),
        conversions_a: Number(form.conversions_a),
        visitors_b: Number(form.visitors_b),
        conversions_b: Number(form.conversions_b),
      });
      setResult(res);
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : 'Error');
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <h3 className="font-semibold text-gray-800 mb-1">A/B Test Calculator</h3>
      <p className="text-xs text-gray-400 mb-4">Compare two variants and check if the difference is statistically significant.</p>
      <div className="grid grid-cols-2 gap-4">
        {[['A', 'visitors_a', 'conversions_a'], ['B', 'visitors_b', 'conversions_b']].map(([label, vk, ck]) => (
          <div key={label} className="bg-gray-50 rounded-lg p-3">
            <p className="text-sm font-medium text-gray-700 mb-2">Variant {label}</p>
            <div className="space-y-2">
              <div>
                <label className="text-xs text-gray-500">Visitors</label>
                <input type="number" value={(form as Record<string, string>)[vk]} onChange={e => set(vk, e.target.value)}
                  className="w-full rounded border border-gray-200 px-2 py-1 text-sm mt-0.5" placeholder="1000" />
              </div>
              <div>
                <label className="text-xs text-gray-500">Conversions</label>
                <input type="number" value={(form as Record<string, string>)[ck]} onChange={e => set(ck, e.target.value)}
                  className="w-full rounded border border-gray-200 px-2 py-1 text-sm mt-0.5" placeholder="50" />
              </div>
            </div>
          </div>
        ))}
      </div>
      {err && <p className="text-red-500 text-xs mt-2">{err}</p>}
      <button onClick={run} className="mt-4 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700">
        Calculate
      </button>
      {result && (
        <div className="mt-4 grid grid-cols-3 gap-3">
          {[
            ['Conversion Rate A', `${result.rate_a}%`],
            ['Conversion Rate B', `${result.rate_b}%`],
            ['Improvement', `${result.relative_improvement > 0 ? '+' : ''}${result.relative_improvement}%`],
          ].map(([label, value]) => (
            <div key={label} className="bg-gray-50 rounded-lg p-3 text-center">
              <p className="text-lg font-bold text-gray-800">{value}</p>
              <p className="text-xs text-gray-500">{label}</p>
            </div>
          ))}
          <div className="col-span-3 bg-indigo-50 rounded-lg p-3 text-center">
            <p className="text-sm font-semibold text-indigo-700">
              Variant {result.winner} wins — {result.confidence} confidence
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

function BudgetSplitter() {
  const [total, setTotal] = useState('');
  const [selected, setSelected] = useState<string[]>([]);
  const [result, setResult] = useState<BudgetResult | null>(null);
  const [err, setErr] = useState('');

  const toggle = (c: string) =>
    setSelected(s => s.includes(c) ? s.filter(x => x !== c) : [...s, c]);

  const run = async () => {
    setErr('');
    try {
      const res = await api.splitBudget({ total_budget: Number(total), channels: selected });
      setResult(res);
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : 'Error');
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <h3 className="font-semibold text-gray-800 mb-1">Budget Splitter</h3>
      <p className="text-xs text-gray-400 mb-4">Allocate your marketing budget across channels using industry benchmarks.</p>
      <div className="mb-3">
        <label className="text-xs text-gray-500 block mb-1">Total budget ($)</label>
        <input type="number" value={total} onChange={e => setTotal(e.target.value)}
          className="w-full rounded-lg border border-gray-200 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
          placeholder="10000" />
      </div>
      <p className="text-xs text-gray-500 mb-2">Select channels:</p>
      <div className="flex flex-wrap gap-2 mb-4">
        {CHANNELS.map(c => (
          <button key={c} onClick={() => toggle(c)}
            className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${selected.includes(c) ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-600 border-gray-200 hover:border-indigo-300'}`}>
            {c}
          </button>
        ))}
      </div>
      {err && <p className="text-red-500 text-xs mb-2">{err}</p>}
      <button onClick={run} disabled={!total || selected.length === 0}
        className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-40">
        Split budget
      </button>
      {result && (
        <div className="mt-4 space-y-2">
          {Object.entries(result.allocations).map(([channel, amount]) => (
            <div key={channel} className="flex items-center justify-between">
              <span className="text-sm text-gray-700">{channel}</span>
              <div className="flex items-center gap-3">
                <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-2 bg-indigo-500 rounded-full" style={{ width: `${(amount / result.total) * 100}%` }} />
                </div>
                <span className="text-sm font-medium text-gray-800 w-20 text-right">${amount.toLocaleString()}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function PracticeTab() {
  return (
    <div className="space-y-4">
      <UTMBuilder />
      <ABTester />
      <BudgetSplitter />
    </div>
  );
}
