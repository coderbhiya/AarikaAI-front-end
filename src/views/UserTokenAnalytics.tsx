"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  Coins,
  Search,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
  Layers,
  Cpu,
  DollarSign,
  Zap,
  X,
} from "lucide-react";
import { getTokenUsageByUser, getUserTokenBreakdown } from "@/services/adminService";

type Period = "7d" | "30d" | "90d" | "all";

interface UserRow {
  userId: number;
  name: string | null;
  email: string | null;
  role: string | null;
  tokens: number;
  promptTokens: number;
  completionTokens: number;
  calls: number;
  estimatedCostUSD: number;
  lastUsedAt: string | null;
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
  "bg-blue-500", "bg-indigo-500", "bg-violet-500", "bg-emerald-500",
  "bg-amber-500", "bg-rose-500", "bg-cyan-500", "bg-fuchsia-500",
];

export default function UserTokenAnalytics() {
  const [period, setPeriod] = useState<Period>("30d");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [rows, setRows] = useState<UserRow[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Drill-down state
  const [selectedUser, setSelectedUser] = useState<UserRow | null>(null);

  // Debounce search input
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, period]);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getTokenUsageByUser({ period, page, limit: 15, search: debouncedSearch });
      setRows(res.users || []);
      setTotalPages(res.pagination?.totalPages || 1);
      setTotal(res.pagination?.total || 0);
    } catch (e: any) {
      setError(e?.response?.data?.message || e?.message || "Failed to load user token usage");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [period, page, debouncedSearch]);

  return (
    <div className="p-6 space-y-6">
      {/* Header + controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-800">User Token Analytics</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Every user ranked by LLM token spend. Click a row to see their feature / model breakdown.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex gap-1 bg-slate-100 p-1 rounded-lg">
            {PERIODS.map((p) => (
              <button
                key={p.key}
                onClick={() => setPeriod(p.key)}
                className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${
                  period === p.key ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-700"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
          <button
            onClick={load}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 border border-slate-200 hover:bg-slate-100 rounded-lg text-xs font-bold text-slate-600 transition-all active:scale-95 disabled:opacity-50"
          >
            <RefreshCw size={12} className={loading ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or email…"
          className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-lg text-xs outline-none focus:border-blue-500"
        />
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-sm">{error}</div>
      )}

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        {loading && rows.length === 0 ? (
          <div className="py-16 text-center text-slate-400 text-sm">Loading user token usage…</div>
        ) : rows.length === 0 ? (
          <div className="py-16 text-center text-slate-400 italic text-xs">No token usage found for this period.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="px-6 py-3.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">#</th>
                  <th className="px-6 py-3.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">User</th>
                  <th className="px-6 py-3.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider text-right">Total Tokens</th>
                  <th className="px-6 py-3.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider text-right">Prompt / Completion</th>
                  <th className="px-6 py-3.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider text-right">Calls</th>
                  <th className="px-6 py-3.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider text-right">Est. Cost</th>
                  <th className="px-6 py-3.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider text-right">Last Used</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {rows.map((u, i) => (
                  <tr
                    key={u.userId}
                    onClick={() => setSelectedUser(u)}
                    className="hover:bg-blue-50/40 cursor-pointer transition-colors"
                  >
                    <td className="px-6 py-4 text-xs font-bold text-slate-400">
                      {(page - 1) * 15 + i + 1}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-xs font-bold text-slate-800">{u.name || `User #${u.userId}`}</div>
                      <div className="text-[10px] text-slate-400">{u.email || "—"}</div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-blue-50 text-blue-600 border border-blue-100">
                        <Coins size={11} />
                        {fmt(u.tokens)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right text-[11px] text-slate-500 font-medium">
                      {fmt(u.promptTokens)} / {fmt(u.completionTokens)}
                    </td>
                    <td className="px-6 py-4 text-right text-xs text-slate-600 font-medium">{fmt(u.calls)}</td>
                    <td className="px-6 py-4 text-right text-xs font-semibold text-emerald-600">
                      ${u.estimatedCostUSD}
                    </td>
                    <td className="px-6 py-4 text-right text-[11px] text-slate-400 font-medium">
                      {u.lastUsedAt ? new Date(u.lastUsedAt).toLocaleDateString() : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        <div className="bg-slate-50 border-t border-slate-200 px-6 py-3 flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500">
            {fmt(total)} users · Page {page} of {totalPages}
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="flex items-center gap-1 px-3 py-1 bg-white border border-slate-200 rounded text-xs font-bold text-slate-600 disabled:opacity-50 hover:bg-slate-100"
            >
              <ChevronLeft size={12} /> Prev
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="flex items-center gap-1 px-3 py-1 bg-white border border-slate-200 rounded text-xs font-bold text-slate-600 disabled:opacity-50 hover:bg-slate-100"
            >
              Next <ChevronRight size={12} />
            </button>
          </div>
        </div>
      </div>

      {/* Drill-down modal */}
      {selectedUser && (
        <UserBreakdownModal
          user={selectedUser}
          period={period}
          onClose={() => setSelectedUser(null)}
        />
      )}
    </div>
  );
}

/* ---------------- Drill-down modal ---------------- */

interface Breakdown {
  user: { id: number; name: string | null; email: string | null; role?: string | null };
  totals: { totalTokens: number; promptTokens: number; completionTokens: number; calls: number; estimatedCostUSD: number };
  byFeature: { feature: string; tokens: number; calls: number }[];
  byModel: { modelName: string; tokens: number; calls: number }[];
  byDay: { day: string; tokens: number }[];
}

function UserBreakdownModal({
  user,
  period,
  onClose,
}: {
  user: UserRow;
  period: Period;
  onClose: () => void;
}) {
  const [data, setData] = useState<Breakdown | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await getUserTokenBreakdown(user.userId, period);
        if (active) setData(res);
      } catch (e: any) {
        if (active) setError(e?.response?.data?.message || e?.message || "Failed to load breakdown");
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, [user.userId, period]);

  const maxFeature = useMemo(() => Math.max(1, ...(data?.byFeature || []).map((f) => f.tokens)), [data]);
  const maxModel = useMemo(() => Math.max(1, ...(data?.byModel || []).map((m) => m.tokens)), [data]);
  const maxDay = useMemo(() => Math.max(1, ...(data?.byDay || []).map((d) => d.tokens)), [data]);

  const totals = data?.totals;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm px-4">
      <div className="w-full max-w-3xl max-h-[88vh] overflow-y-auto bg-white border border-slate-100 rounded-xl shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
            >
              <ArrowLeft size={16} />
            </button>
            <div>
              <h3 className="text-sm font-bold text-slate-800">{user.name || `User #${user.userId}`}</h3>
              <p className="text-[11px] text-slate-400">{user.email || "—"}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-red-500 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {loading ? (
            <div className="py-16 text-center text-slate-400 text-sm">Loading breakdown…</div>
          ) : error ? (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-sm">{error}</div>
          ) : (
            <>
              {/* Summary cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {[
                  { label: "Total Tokens", value: fmt(totals?.totalTokens), icon: Coins, tint: "text-blue-600 bg-blue-50" },
                  { label: "Est. Cost", value: `$${totals?.estimatedCostUSD ?? 0}`, icon: DollarSign, tint: "text-emerald-600 bg-emerald-50" },
                  { label: "Calls", value: fmt(totals?.calls), icon: Zap, tint: "text-amber-600 bg-amber-50" },
                  { label: "Prompt / Compl.", value: `${fmt(totals?.promptTokens)} / ${fmt(totals?.completionTokens)}`, icon: Layers, tint: "text-violet-600 bg-violet-50", small: true },
                ].map((c) => {
                  const Icon = c.icon;
                  return (
                    <div key={c.label} className="bg-white border border-slate-200 rounded-xl p-3 shadow-sm">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${c.tint}`}>
                        <Icon size={16} />
                      </div>
                      <div className="mt-2 text-[10px] font-bold uppercase tracking-wide text-slate-400">{c.label}</div>
                      <div className={`mt-0.5 font-extrabold text-slate-800 ${c.small ? "text-sm" : "text-xl"}`}>{c.value}</div>
                    </div>
                  );
                })}
              </div>

              {/* By feature */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Layers size={15} className="text-slate-400" />
                  <h4 className="font-bold text-slate-800 text-sm">By Feature / Flow</h4>
                </div>
                {(data?.byFeature || []).length === 0 ? (
                  <p className="text-xs text-slate-400">No data.</p>
                ) : (
                  <div className="space-y-2.5">
                    {data!.byFeature.slice(0, 12).map((f, i) => (
                      <div key={f.feature}>
                        <div className="flex justify-between text-[11px] mb-1">
                          <span className="font-semibold text-slate-700">{f.feature}</span>
                          <span className="text-slate-400">{fmt(f.tokens)} · {fmt(f.calls)} calls</span>
                        </div>
                        <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                          <div className={`h-2 rounded-full ${BAR_COLORS[i % BAR_COLORS.length]}`}
                            style={{ width: `${Math.max(2, (f.tokens / maxFeature) * 100)}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* By model */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Cpu size={15} className="text-slate-400" />
                  <h4 className="font-bold text-slate-800 text-sm">By Model</h4>
                </div>
                {(data?.byModel || []).length === 0 ? (
                  <p className="text-xs text-slate-400">No data.</p>
                ) : (
                  <div className="space-y-2.5">
                    {data!.byModel.slice(0, 12).map((m, i) => (
                      <div key={m.modelName}>
                        <div className="flex justify-between text-[11px] mb-1">
                          <span className="font-semibold text-slate-700">{m.modelName}</span>
                          <span className="text-slate-400">{fmt(m.tokens)} · {fmt(m.calls)} calls</span>
                        </div>
                        <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                          <div className={`h-2 rounded-full ${BAR_COLORS[i % BAR_COLORS.length]}`}
                            style={{ width: `${Math.max(2, (m.tokens / maxModel) * 100)}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Daily trend */}
              <div>
                <h4 className="font-bold text-slate-800 text-sm mb-3">Daily Trend</h4>
                {(data?.byDay || []).length === 0 ? (
                  <p className="text-xs text-slate-400">No daily data.</p>
                ) : (
                  <div className="flex items-end gap-1 h-28 overflow-x-auto">
                    {data!.byDay.map((d) => (
                      <div key={d.day} className="flex-1 min-w-[5px] flex flex-col justify-end"
                        title={`${new Date(d.day).toLocaleDateString()}: ${fmt(d.tokens)} tokens`}>
                        <div className="w-full bg-gradient-to-t from-blue-500 to-indigo-400 rounded-t"
                          style={{ height: `${Math.max(2, (d.tokens / maxDay) * 100)}%` }} />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
