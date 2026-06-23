import type { Module, Progress, UTMResult, ABTestResult, BudgetResult } from './types';

const BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:8000';

function getToken() {
  return localStorage.getItem('cf_token');
}

async function req<T>(path: string, init?: RequestInit): Promise<T> {
  const token = getToken();
  const res = await fetch(`${BASE}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...init,
  });
  if (res.status === 401) {
    localStorage.removeItem('cf_token');
    window.location.reload();
  }
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail ?? `HTTP ${res.status}`);
  }
  return res.json();
}

export const api = {
  register: (email: string, password: string) =>
    req<{ access_token: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  login: (email: string, password: string) =>
    req<{ access_token: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  listModules: () => req<Module[]>('/modules'),

  getModule: (slug: string) => req<Module>(`/modules/${slug}`),

  completeModule: (slug: string) =>
    req<Progress>(`/modules/${slug}/complete`, { method: 'POST' }),

  myProgress: () => req<Progress[]>('/modules/progress/me'),

  buildUTM: (body: object) =>
    req<UTMResult>('/tools/utm', { method: 'POST', body: JSON.stringify(body) }),

  abTest: (body: object) =>
    req<ABTestResult>('/tools/abtest', { method: 'POST', body: JSON.stringify(body) }),

  splitBudget: (body: object) =>
    req<BudgetResult>('/tools/budget', { method: 'POST', body: JSON.stringify(body) }),
};
