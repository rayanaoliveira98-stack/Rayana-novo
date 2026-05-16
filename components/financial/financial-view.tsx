"use client";

import React, { useState } from "react";
import { financialRecords, clients } from "@/lib/data";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { TrendingUp, AlertTriangle, CheckCircle, DollarSign, Plus } from "lucide-react";

const mrrData = [
  { month: "Jan", receita: 4800, despesa: 1200 },
  { month: "Fev", receita: 6200, despesa: 1400 },
  { month: "Mar", receita: 8900, despesa: 1800 },
  { month: "Abr", receita: 11400, despesa: 2100 },
  { month: "Mai", receita: 14200, despesa: 2300 },
];

const paymentColors: Record<string, "green" | "gold" | "red" | "gray"> = {
  pago: "green",
  pendente: "gold",
  atrasado: "red",
  cancelado: "gray",
};

const paymentLabels: Record<string, string> = {
  pago: "Pago",
  pendente: "Pendente",
  atrasado: "Atrasado",
  cancelado: "Cancelado",
};

export function FinancialView() {
  const [filter, setFilter] = useState<"all" | "receita" | "despesa">("all");

  const receitas = financialRecords.filter((r) => r.type === "receita");
  const despesas = financialRecords.filter((r) => r.type === "despesa");

  const totalReceita = receitas.filter((r) => r.status === "pago").reduce((s, r) => s + r.amount, 0);
  const totalPendente = receitas.filter((r) => r.status === "pendente" || r.status === "atrasado").reduce((s, r) => s + r.amount, 0);
  const totalDespesa = despesas.reduce((s, r) => s + r.amount, 0);
  const lucro = totalReceita - totalDespesa;
  const margem = Math.round((lucro / totalReceita) * 100);

  const filtered = filter === "all" ? financialRecords : financialRecords.filter((r) => r.type === filter);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Sistema Financeiro</h1>
          <p className="text-sm text-gray-400 mt-0.5">
            Controle de receitas, despesas e lucratividade
          </p>
        </div>
        <button className="flex items-center gap-2 bg-[#d4af37] text-black text-sm font-semibold px-4 py-2 rounded-lg hover:bg-[#c9a227] transition-all">
          <Plus size={16} /> Novo Registro
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-[#d4af37]/10 border border-[#d4af37]/30 rounded-xl p-4">
          <p className="text-xs text-gray-400 mb-1">Receita Confirmada</p>
          <p className="text-2xl font-bold text-[#d4af37]">€{totalReceita.toLocaleString()}</p>
          <p className="text-xs text-gray-500 mt-1">este mês</p>
        </div>
        <div className="bg-orange-500/10 border border-orange-500/20 rounded-xl p-4">
          <p className="text-xs text-gray-400 mb-1">A Receber</p>
          <p className="text-2xl font-bold text-orange-400">€{totalPendente.toLocaleString()}</p>
          <p className="text-xs text-gray-500 mt-1">pendente/atrasado</p>
        </div>
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
          <p className="text-xs text-gray-400 mb-1">Despesas</p>
          <p className="text-2xl font-bold text-red-400">€{totalDespesa.toLocaleString()}</p>
          <p className="text-xs text-gray-500 mt-1">este mês</p>
        </div>
        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4">
          <p className="text-xs text-gray-400 mb-1">Lucro Líquido</p>
          <p className="text-2xl font-bold text-emerald-400">€{lucro.toLocaleString()}</p>
          <p className="text-xs text-gray-500 mt-1">margem {margem}%</p>
        </div>
      </div>

      {/* Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Receita vs Despesas</CardTitle>
        </CardHeader>
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={mrrData}>
            <defs>
              <linearGradient id="recGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#d4af37" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#d4af37" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="despGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1f1f1f" />
            <XAxis dataKey="month" tick={{ fill: "#666", fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: "#666", fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `€${(v / 1000).toFixed(0)}k`} />
            <Tooltip
              contentStyle={{ background: "#1a1a1a", border: "1px solid #2a2a2a", borderRadius: "8px", fontSize: "12px" }}
              labelStyle={{ color: "#888" }}
            />
            <Area type="monotone" dataKey="receita" name="Receita €" stroke="#d4af37" fill="url(#recGrad)" strokeWidth={2} />
            <Area type="monotone" dataKey="despesa" name="Despesa €" stroke="#ef4444" fill="url(#despGrad)" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </Card>

      {/* Alerts */}
      {financialRecords.filter((r) => r.status === "atrasado").length > 0 && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-start gap-3">
          <AlertTriangle size={18} className="text-red-400 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-semibold text-red-400">Pagamentos em Atraso</p>
            <p className="text-xs text-gray-400 mt-1">
              {financialRecords.filter((r) => r.status === "atrasado").map((r) => r.clientName).join(", ")} — entrar em contato imediatamente.
            </p>
          </div>
        </div>
      )}

      {/* Records */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          {(["all", "receita", "despesa"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`text-xs px-3 py-1.5 rounded-full transition-all ${
                filter === f
                  ? "bg-[#d4af37] text-black font-semibold"
                  : "bg-white/5 text-gray-400 hover:text-white"
              }`}
            >
              {f === "all" ? "Todos" : f.charAt(0).toUpperCase() + f.slice(1) + "s"}
            </button>
          ))}
        </div>

        <div className="space-y-2">
          {filtered.map((record) => (
            <div
              key={record.id}
              className="bg-[#111] border border-[#1f1f1f] rounded-xl p-4 flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    record.type === "receita" ? "bg-emerald-500/20 text-emerald-400" : "bg-red-500/20 text-red-400"
                  }`}
                >
                  <DollarSign size={14} />
                </div>
                <div>
                  <p className="text-sm font-medium text-white">{record.clientName}</p>
                  <p className="text-xs text-gray-500">
                    {record.category} · {new Date(record.date).toLocaleDateString("pt-BR")}
                    {record.invoice && ` · ${record.invoice}`}
                  </p>
                  {record.notes && <p className="text-xs text-gray-600 mt-0.5">{record.notes}</p>}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <p className={`font-bold ${record.type === "receita" ? "text-emerald-400" : "text-red-400"}`}>
                  {record.type === "receita" ? "+" : "−"}€{record.amount.toLocaleString()}
                </p>
                <Badge variant={paymentColors[record.status]}>{paymentLabels[record.status]}</Badge>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Per-client profitability */}
      <Card>
        <CardHeader>
          <CardTitle>Lucratividade por Cliente</CardTitle>
          <p className="text-xs text-gray-500 mt-0.5">Nem todo cliente "bonzinho" é lucrativo</p>
        </CardHeader>
        <div className="space-y-3">
          {clients.map((client) => {
            const clientRevenue = financialRecords
              .filter((r) => r.clientId === client.id && r.type === "receita" && r.status === "pago")
              .reduce((s, r) => s + r.amount, 0);
            const estimatedCost = Math.round(client.monthlyFee * 0.35);
            const profit = clientRevenue - estimatedCost;
            const margin = clientRevenue > 0 ? Math.round((profit / clientRevenue) * 100) : 0;

            return (
              <div key={client.id} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded bg-white/5 flex items-center justify-center text-xs text-gray-400">
                    {client.company.charAt(0)}
                  </div>
                  <p className="text-sm text-white">{client.company}</p>
                </div>
                <div className="flex items-center gap-4 text-xs">
                  <span className="text-gray-500">€{client.monthlyFee.toLocaleString()}/mês</span>
                  <span className={margin >= 60 ? "text-emerald-400" : margin >= 40 ? "text-[#d4af37]" : "text-orange-400"}>
                    {margin}% margem
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
