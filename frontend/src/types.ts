export interface Module {
  id: number;
  slug: string;
  title: string;
  category: string;
  order: number;
  content: string;
}

export interface Progress {
  id: number;
  module_id: number;
  completed_at: string;
}

export interface UTMResult {
  utm_url: string;
  params: Record<string, string>;
}

export interface ABTestResult {
  rate_a: number;
  rate_b: number;
  relative_improvement: number;
  winner: string;
  confidence: string;
}

export interface BudgetResult {
  allocations: Record<string, number>;
  total: number;
}
