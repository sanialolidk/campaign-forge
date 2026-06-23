import { useState } from 'react';
import { api } from '../api';
import type { UTMResult, ABTestResult, BudgetResult } from '../types';

const CHANNELS = ['SEO', 'Paid Search', 'Social Media', 'Email', 'Display', 'Other'];

function ToolCard({ emoji, title, description, children }: {
  emoji: string; title: string; description: string; children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
      <div className="flex items-center gap-3 mb-1">
        <span className="text-2xl">{emoji}</span>
        <h3 className="font-bold text-gray-900">{title}</h3>
      </div>
      <p className="text-sm text-gray-400 mb-5 ml-10">{description}</p>
      {children}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">{label}</label>
      {children}
    </div>
  );
}

const inputCls = "w-full rounded-xl border-2 border-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-orange-400 transition-colors";

function UTMBuilder() {
  const [form, setForm] = useState({ url: '', source: '', medium: '', campaign: '', term: '', content: '' });
  const [result, setResult] = useState<UTMResult | null>(null);
  const [err, setErr] = useState('');
  const [copied, setCopied] = useState(false);

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const run = async () => {
    setErr('');
    try { setResult(await api.buildUTM(form)); }
    catch (e: unknown) { setErr(e instanceof Error ? e.message : 'Error'); }
  };

  const copy = () => {
    if (result) { navigator.clipboard.writeText(result.utm_url); setCopied(true); setTimeout(() => setCopied(false), 2000); }
  };

  return (
    <ToolCard emoji="🔗" title="UTM Builder" description="Tag your URLs to track where traffic comes from in analytics.">
      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2"><Field label="Website URL *"><input value={form.url} onChange={e => set('url', e.target.value)} placeholder="https://yoursite.com/page" className={inputCls} /></Field></div>
        <Field label="Source *"><input value={form.source} onChange={e => set('source', e.target.value)} placeholder="newsletter" className={inputCls} /></Field>
        <Field label="Medium *"><input value={form.medium} onChange={e => set('medium', e.target.value)} placeholder="email" className={inputCls} /></Field>
        <Field label="Campaign *"><input value={form.campaign} onChange={e => set('campaign', e.target.value)} placeholder="summer-sale" className={inputCls} /></Field>
        <Field label="Content (optional)"><input value={form.content} onChange={e => set('content', e.target.value)} placeholder="header-cta" className={inputCls} /></Field>
      </div>
      {err && <p className="text-red-500 text-xs mt-2">{err}</p>}
      <button onClick={run} className="mt-4 rounded-xl bg-orange-500 px-5 py-2.5 text-sm font-bold text-white hover:bg-orange-600 transition-colors shadow-md shadow-orange-100">
        Generate URL →
      </button>
      {result && (
        <div className="mt-4 bg-orange-50 border border-orange-200 rounded-xl p-4">
          <p className="text-xs font-semibold text-orange-600 mb-2 uppercase tracking-wide">Your tagged URL</p>
          <p className="text-xs font-mono text-gray-700 break-all leading-relaxed">{result.utm_url}</p>
          <button onClick={copy} className="mt-3 text-xs font-semibold text-orange-500 hover:underline">
            {copied ? '✓ Copied!' : 'Copy to clipboard'}
          </button>
        </div>
      )}
    </ToolCard>
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
      setResult(await api.abTest({
        visitors_a: Number(form.visitors_a), conversions_a: Number(form.conversions_a),
        visitors_b: Number(form.visitors_b), conversions_b: Number(form.conversions_b),
      }));
    } catch (e: unknown) { setErr(e instanceof Error ? e.message : 'Error'); }
  };

  return (
    <ToolCard emoji="⚗️" title="A/B Test Calculator" description="Check if your test results are statistically significant — or just luck.">
      <div className="grid grid-cols-2 gap-4">
        {[['A', 'visitors_a', 'conversions_a'], ['B', 'visitors_b', 'conversions_b']].map(([label, vk, ck]) => (
          <div key={label} className="bg-gray-50 rounded-xl p-4">
            <p className="text-sm font-bold text-gray-700 mb-3">Variant {label}</p>
            <div className="space-y-2">
              <Field label="Visitors"><input type="number" value={(form as Record<string,string>)[vk]} onChange={e => set(vk, e.target.value)} placeholder="1000" className={inputCls} /></Field>
              <Field label="Conversions"><input type="number" value={(form as Record<string,string>)[ck]} onChange={e => set(ck, e.target.value)} placeholder="45" className={inputCls} /></Field>
            </div>
          </div>
        ))}
      </div>
      {err && <p className="text-red-500 text-xs mt-2">{err}</p>}
      <button onClick={run} className="mt-4 rounded-xl bg-orange-500 px-5 py-2.5 text-sm font-bold text-white hover:bg-orange-600 transition-colors shadow-md shadow-orange-100">
        Calculate →
      </button>
      {result && (
        <div className="mt-4 space-y-3">
          <div className="grid grid-cols-3 gap-3">
            {[['Rate A', `${result.rate_a}%`], ['Rate B', `${result.rate_b}%`], ['Lift', `${result.relative_improvement > 0 ? '+' : ''}${result.relative_improvement}%`]].map(([l, v]) => (
              <div key={l} className="bg-gray-50 rounded-xl p-3 text-center">
                <p className="text-xl font-black text-gray-900">{v}</p>
                <p className="text-xs text-gray-400 mt-0.5">{l}</p>
              </div>
            ))}
          </div>
          <div className={`rounded-xl p-4 text-center ${result.confidence === 'Not significant' ? 'bg-gray-50' : 'bg-green-50 border border-green-200'}`}>
            <p className={`font-bold text-sm ${result.confidence === 'Not significant' ? 'text-gray-500' : 'text-green-700'}`}>
              {result.confidence === 'Not significant'
                ? '⚠️ Not statistically significant yet — collect more data'
                : `🎉 Variant ${result.winner} wins with ${result.confidence} confidence`}
            </p>
          </div>
        </div>
      )}
    </ToolCard>
  );
}

function BudgetSplitter() {
  const [total, setTotal] = useState('');
  const [selected, setSelected] = useState<string[]>([]);
  const [result, setResult] = useState<BudgetResult | null>(null);
  const [err, setErr] = useState('');

  const toggle = (c: string) => setSelected(s => s.includes(c) ? s.filter(x => x !== c) : [...s, c]);

  const run = async () => {
    setErr('');
    try { setResult(await api.splitBudget({ total_budget: Number(total), channels: selected })); }
    catch (e: unknown) { setErr(e instanceof Error ? e.message : 'Error'); }
  };

  return (
    <ToolCard emoji="💸" title="Budget Splitter" description="Allocate your marketing spend across channels using industry benchmarks.">
      <Field label="Total budget ($)">
        <input type="number" value={total} onChange={e => setTotal(e.target.value)} placeholder="10,000" className={inputCls} />
      </Field>
      <div className="mt-4">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Select channels</p>
        <div className="flex flex-wrap gap-2">
          {CHANNELS.map(c => (
            <button key={c} onClick={() => toggle(c)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold border-2 transition-all ${selected.includes(c) ? 'bg-orange-500 text-white border-orange-500 shadow-md shadow-orange-100' : 'bg-white text-gray-600 border-gray-200 hover:border-orange-300'}`}>
              {c}
            </button>
          ))}
        </div>
      </div>
      {err && <p className="text-red-500 text-xs mt-2">{err}</p>}
      <button onClick={run} disabled={!total || selected.length === 0}
        className="mt-4 rounded-xl bg-orange-500 px-5 py-2.5 text-sm font-bold text-white hover:bg-orange-600 disabled:opacity-40 transition-colors shadow-md shadow-orange-100">
        Split budget →
      </button>
      {result && (
        <div className="mt-4 space-y-2">
          {Object.entries(result.allocations).map(([channel, amount]) => {
            const pct = (amount / result.total) * 100;
            return (
              <div key={channel}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-700 font-medium">{channel}</span>
                  <span className="font-bold text-gray-900">${amount.toLocaleString()}</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-2 bg-gradient-to-r from-orange-400 to-orange-500 rounded-full progress-animate" style={{ width: `${pct}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </ToolCard>
  );
}

export function PracticeTab() {
  return (
    <div className="space-y-4 animate-fade-up">
      <UTMBuilder />
      <ABTester />
      <BudgetSplitter />
    </div>
  );
}
