"use client";

import React from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
} from "recharts";
import {
  Users,
  TrendingUp,
  DollarSign,
  Target,
  Film,
  Megaphone,
  Phone,
  BarChart2,
  UserCheck,
  Zap,
} from "lucide-react";
import { StatCard } from "@/components/ui/stat-card";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { kpis, mrrChartData, leadsChartData, clients, leads } from "@/lib/data";

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: { value: number; name: string; color: string }[]; label?: string }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-3 text-sm">
        <p className="text-gray-400 mb-1">{label}</p>
        {payload.map((p) => (
          <p key={p.name} style={{ color: p.color }} className="font-semibold">
            {p.name}: {typeof p.value === "number" && p.name.includes("€") ? `€${p.value.toLocaleString()}` : p.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export function CEODashboard() {
  const recentLeads = leads.slice(0, 4);
  const activeClients = clients.filter((c) => c.status === "active");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Dashboard CEO</h1>
          <p className="text-sm text-gray-400 mt-0.5">BlackStrategie Agency OS — Maio 2026</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-400 pulse-gold" />
          <span className="text-xs text-gray-400">Sistema ativo</span>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <StatCard
          title="MRR"
          value={`€${kpis.mrr.toLocaleString()}`}
          subtitle="Receita Recorrente"
          icon={<DollarSign size={18} />}
          trend={{ value: "+24% vs Abr", positive: true }}
          accent
        />
        <StatCard
          title="Clientes Ativos"
          value={kpis.activeClients}
          subtitle="em retainer"
          icon={<UserCheck size={18} />}
          trend={{ value: "+1 este mês", positive: true }}
        />
        <StatCard
          title="Leads do Mês"
          value={kpis.leadsMonth}
          subtitle="novos contatos"
          icon={<Target size={18} />}
          trend={{ value: "+21% vs Abr", positive: true }}
        />
        <StatCard
          title="Calls Agendadas"
          value={kpis.callsScheduled}
          subtitle="esta semana"
          icon={<Phone size={18} />}
        />
        <StatCard
          title="Previsão Receita"
          value={`€${kpis.forecastRevenue.toLocaleString()}`}
          subtitle="este mês"
          icon={<TrendingUp size={18} />}
          trend={{ value: "+30% vs MRR", positive: true }}
        />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <StatCard
          title="CAC"
          value={`€${kpis.cac}`}
          subtitle="custo aquisição"
          icon={<BarChart2 size={18} />}
        />
        <StatCard
          title="ROAS Médio"
          value={`${kpis.avgRoas}x`}
          subtitle="média clientes"
          icon={<Megaphone size={18} />}
          trend={{ value: "meta: 4x", positive: true }}
        />
        <StatCard
          title="Produção Pendente"
          value={kpis.pendingProduction}
          subtitle="conteúdos"
          icon={<Film size={18} />}
        />
        <StatCard
          title="Reels Entregues"
          value={kpis.reelsDelivered}
          subtitle="este mês"
          icon={<Film size={18} />}
          trend={{ value: "+18% vs Abr", positive: true }}
        />
        <StatCard
          title="Ads Ativos"
          value={kpis.activeAds}
          subtitle="campanhas"
          icon={<Zap size={18} />}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Crescimento MRR</CardTitle>
            <p className="text-xs text-gray-500 mt-0.5">Receita recorrente mensal (€)</p>
          </CardHeader>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={mrrChartData}>
              <defs>
                <linearGradient id="mrrGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#d4af37" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#d4af37" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f1f1f" />
              <XAxis dataKey="month" tick={{ fill: "#666", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#666", fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `€${(v / 1000).toFixed(0)}k`} />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="mrr"
                name="MRR €"
                stroke="#d4af37"
                fill="url(#mrrGradient)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Leads vs Fechamentos</CardTitle>
            <p className="text-xs text-gray-500 mt-0.5">Volume de leads e conversões por mês</p>
          </CardHeader>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={leadsChartData} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f1f1f" />
              <XAxis dataKey="month" tick={{ fill: "#666", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#666", fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: "11px", color: "#888" }} />
              <Bar dataKey="leads" name="Leads" fill="#d4af37" radius={[3, 3, 0, 0]} />
              <Bar dataKey="fechados" name="Fechados" fill="#22c55e" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Recent Leads */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Leads Recentes</CardTitle>
              <Badge variant="gold">Pipeline</Badge>
            </div>
          </CardHeader>
          <div className="space-y-3">
            {recentLeads.map((lead) => (
              <div key={lead.id} className="flex items-center justify-between py-2 border-b border-[#1a1a1a] last:border-0">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#d4af37]/20 flex items-center justify-center text-[#d4af37] text-xs font-bold">
                    {lead.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">{lead.name}</p>
                    <p className="text-xs text-gray-500">{lead.company} · {lead.niche}</p>
                  </div>
                </div>
                <div className="text-right">
                  <StatusBadge status={lead.status} />
                  <p className="text-xs text-gray-500 mt-1">{lead.ticket}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Active Clients */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Clientes Ativos</CardTitle>
              <Badge variant="green">{activeClients.length} ativos</Badge>
            </div>
          </CardHeader>
          <div className="space-y-3">
            {activeClients.map((client) => (
              <div key={client.id} className="flex items-center justify-between py-2 border-b border-[#1a1a1a] last:border-0">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-white text-xs font-bold">
                    {client.company.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">{client.company}</p>
                    <p className="text-xs text-gray-500">{client.city} · {client.niche}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-[#d4af37]">€{client.monthlyFee.toLocaleString()}</p>
                  <PaymentBadge status={client.paymentStatus} />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; variant: "gold" | "green" | "blue" | "orange" | "red" | "gray" | "purple" }> = {
    novo_lead: { label: "Novo", variant: "blue" },
    qualificacao: { label: "Qualificação", variant: "purple" },
    call_agendada: { label: "Call", variant: "gold" },
    proposta_enviada: { label: "Proposta", variant: "orange" },
    negociacao: { label: "Negociação", variant: "orange" },
    fechado: { label: "Fechado", variant: "green" },
    onboarding: { label: "Onboarding", variant: "green" },
    retainer: { label: "Retainer", variant: "green" },
    upsell: { label: "Upsell", variant: "gold" },
    perdido: { label: "Perdido", variant: "red" },
  };
  const { label, variant } = map[status] || { label: status, variant: "gray" };
  return <Badge variant={variant}>{label}</Badge>;
}

function PaymentBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; variant: "green" | "gold" | "red" | "gray" }> = {
    pago: { label: "Pago", variant: "green" },
    pendente: { label: "Pendente", variant: "gold" },
    atrasado: { label: "Atrasado", variant: "red" },
    cancelado: { label: "Cancelado", variant: "gray" },
  };
  const { label, variant } = map[status] || { label: status, variant: "gray" };
  return <Badge variant={variant}>{label}</Badge>;
}
