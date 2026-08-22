"use client";

import React, { useEffect, useState } from "react";
import {
  Coins,
  DollarSign,
  Zap,
  Layers,
  RefreshCw,
  Cpu,
  Users as UsersIcon,
} from "lucide-react";
import { getTokenUsage } from "@/services/adminService";

type Period = "7d" | "30d" | "90d" | "all";

interface FeatureRow { feature: string; tokens: number; calls: number; }
interface ModelRow { modelName: string; tokens: number; calls: number; }
interface DayRow { day: string; tokens: number; }
interface UserRow { userId: number; name: string | null; email: string | null; tokens: number; calls: number; }
interface Totals {
  totalTokens: number;
  promptTokens: number;
  completionTokens: number;
  calls: number;
  estimatedCostUSD: number;
}
interface UsageResponse {
  success: boolean;
  period: Period;
  costPer1k: number;
  totals: Totals;
  byFeature: FeatureRow[];
  byModel: ModelRow[];
  byDay: DayRow[];
  topUsers: UserRow[];
}

const PERIODS: { key: Period; label: string }[] = [
  { key: "7d", label: "7 days" },
  { key: "30d", label: "30 days" },
  { key: "90d", label: "90 days" },
  { key: "all", label: "All time" },
];

const nf = new Intl.NumberFormat("en-US");
const fmt = (n: number | undefined | null) => nf.format(Number(n || 0));

const BAR_COLORS = [
  "bg-blue-500",
  "bg-indigo-500",
  "bg-violet-500",
  "bg-emerald-500",
  "bg-amber-500",
  "bg-rose-500",
  "bg-cyan-500",
  "bg-fuchsia-500",
];

export default function TokenUsageTab() {
  const [period, setPeriod] = useState<Period>("30d");
  const [data, setData] = useState<UsageResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async (p: Period) => {
    setLoading(true);
    setError(null);
    try {
      const res = await getTokenUsage(p);
      setData(res);
    } catch (e: any) {
      setError(e?.response?.data?.message || e?.message || "Failed to load token usage");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load(period);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [period]);

  const totals = data?.totals;
  const byFeature = data?.byFeature || [];
  const byModel = data?.byModel || [];
  const byDay = data?.byDay || [];
  const topUsers = data?.topUsers || [];

  const maxFeature = Math.max(1, ...byFeature.map((f) => f.tokens));
  const maxModel = Math.max(1, ...byModel.map((m) => m.tokens));
  const maxDay = Math.max(1, ...byDay.map((d) => d.tokens));

  const summaryCards = totals
    ? [
        { label: "Total Tokens", value: fmt(totals.totalTokens), icon: Coins, tint: "text-blue-600 bg-blue-50" },
        { label: "Est. Cost (USD)", value: `$${fmt(totals.estimatedCostUSD)}`, icon: DollarSign, tint: "text-emerald-600 bg-emerald-50" },
        { label: "LLM Calls", value: fmt(totals.calls), icon: Zap, tint: "text-amber-600 bg-amber-50" },
        {
          label: "Prompt / Completion",
          value: `${fmt(totals.promptTokens)} / ${fmt(totals.completionTokens)}`,
          icon: Layers,
          tint: "text-violet-600 bg-violet-50",
          small: true,
        },
      ]
    : [];

  return (
    <div className="p-6 space-y-6">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-800">Token Usage Analytics</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Where LLM tokens are being spent — overall, by feature, by model, and per user.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex gap-1 bg-slate-100 p-1 rounded-lg">
            {PERIODS.map((p) => (
              <button
                key={p.key}
                onClick={() => setPeriod(p.key)}
                className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${
                  period === p.key
                    ? "bg-white text-slate-800 shadow-sm"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
          <button
            onClick={() => load(period)}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 border border-slate-200 hover:bg-slate-100 rounded-lg text-xs font-bold text-slate-600 transition-all active:scale-95 disabled:opacity-50"
          >
            <RefreshCw size={12} className={loading ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-sm">
          {error}
        </div>
      )}

      {loading && !data ? (
        <div className="py-16 text-center text-slate-400 text-sm">Loading token usage…</div>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {summaryCards.map((c) => {
              const Icon = c.icon;
              return (
                <div key={c.label} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${c.tint}`}>
                    <Icon size={18} />
                  </div>
                  <div className="mt-3 text-[11px] font-bold uppercase tracking-wide text-slate-400">
                    {c.label}
                  </div>
                  <div className={`mt-1 font-extrabold text-slate-800 ${c.small ? "text-base" : "text-2xl"}`}>
                    {c.value}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* By Feature */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <Layers size={16} className="text-slate-400" />
                <h3 className="font-bold text-slate-800 text-sm">By Feature / Flow</h3>
              </div>
              {byFeature.length === 0 ? (
                <p className="text-sm text-slate-400">No data for this period yet.</p>
              ) : (
                <div className="space-y-3">
                  {byFeature.slice(0, 12).map((f, i) => (
                    <div key={f.feature}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="font-semibold text-slate-700">{f.feature}</span>
                        <span className="text-slate-400">{fmt(f.tokens)} · {fmt(f.calls)} calls</span>
                      </div>
                      <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                        <div
                          className={`h-2 rounded-full ${BAR_COLORS[i % BAR_COLORS.length]}`}
                          style={{ width: `${Math.max(2, (f.tokens / maxFeature) * 100)}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* By Model */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <Cpu size={16} className="text-slate-400" />
                <h3 className="font-bold text-slate-800 text-sm">By Model</h3>
              </div>
              {byModel.length === 0 ? (
                <p className="text-sm text-slate-400">No data for this period yet.</p>
              ) : (
                <div className="space-y-3">
                  {byModel.slice(0, 12).map((m, i) => (
                    <div key={m.modelName}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="font-semibold text-slate-700">{m.modelName}</span>
                        <span className="text-slate-400">{fmt(m.tokens)} · {fmt(m.calls)} calls</span>
                      </div>
                      <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                        <div
                          className={`h-2 rounded-full ${BAR_COLORS[i % BAR_COLORS.length]}`}
                          style={{ width: `${Math.max(2, (m.tokens / maxModel) * 100)}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Daily Trend */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
            <h3 className="font-bold text-slate-800 text-sm mb-4">Daily Trend</h3>
            {byDay.length === 0 ? (
              <p className="text-sm text-slate-400">No daily data available.</p>
            ) : (
              <div className="flex items-end gap-1 h-40 overflow-x-auto">
                {byDay.map((d) => (
                  <div
                    key={d.day}
                    className="flex-1 min-w-[6px] flex flex-col justify-end"
                    title={`${new Date(d.day).toLocaleDateString()}: ${fmt(d.tokens)} tokens`}
                  >
                    <div
                      className="w-full bg-gradient-to-t from-blue-500 to-indigo-400 rounded-t hover:opacity-80 transition"
                      style={{ height: `${Math.max(2, (d.tokens / maxDay) * 100)}%` }}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Top Users */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <UsersIcon size={16} className="text-slate-400" />
              <h3 className="font-bold text-slate-800 text-sm">Top Users by Tokens</h3>
            </div>
            {topUsers.length === 0 ? (
              <p className="text-sm text-slate-400">No user-attributed usage yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-slate-400 border-b border-slate-200 text-xs uppercase tracking-wide">
                      <th className="py-2 pr-4 font-bold">#</th>
                      <th className="py-2 pr-4 font-bold">User</th>
                      <th className="py-2 pr-4 font-bold">Email</th>
                      <th className="py-2 pr-4 font-bold text-right">Tokens</th>
                      <th className="py-2 font-bold text-right">Calls</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topUsers.map((u, i) => (
                      <tr key={u.userId} className="border-b border-slate-100 hover:bg-slate-50">
                        <td className="py-2 pr-4 text-slate-400 font-medium">{i + 1}</td>
                        <td className="py-2 pr-4 font-semibold text-slate-700">
                          {u.name || `User #${u.userId}`}
                        </td>
                        <td className="py-2 pr-4 text-slate-500">{u.email || "—"}</td>
                        <td className="py-2 pr-4 text-right font-bold text-slate-800">{fmt(u.tokens)}</td>
                        <td className="py-2 text-right text-slate-500">{fmt(u.calls)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <p className="text-[11px] text-slate-400">
            Cost is an estimate at ${data?.costPer1k}/1K tokens (configurable via TOKEN_COST_PER_1K_USD).
            Features labelled <code className="px-1 bg-slate-100 rounded">tier:*</code> are LLM calls
            not yet given an explicit feature tag.
          </p>
        </>
      )}
    </div>
  );
}
