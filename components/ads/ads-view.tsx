"use client";

import React, { useState } from "react";
import { campaigns } from "@/lib/data";
import type { Campaign } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Minus, Plus, Activity } from "lucide-react";

function MetricBox({ label, value, sub, good }: { label: string; value: string; sub?: string; good?: "high" | "low" | "neutral" }) {
  return (
    <div className="bg-[#0d0d0d] rounded-lg p-3 text-center">
      <p className="text-xs text-gray-500 mb-1">{label}</p>
      <p className="text-base font-bold text-white">{value}</p>
      {sub && <p className="text-[10px] text-gray-600 mt-0.5">{sub}</p>}
    </div>
  );
}

const objectiveLabels: Record<string, string> = {
  leads: "Lead Gen",
  recruiting: "Recruiting",
  awareness: "Awareness",
  conversion: "Conversão",
};

const objectiveColors: Record<string, "gold" | "blue" | "green" | "purple"> = {
  leads: "gold",
  recruiting: "blue",
  awareness: "purple",
  conversion: "green",
};

const statusColors: Record<string, "green" | "gold" | "gray" | "red"> = {
  ativa: "green",
  pausada: "gold",
  encerrada: "gray",
  draft: "gray",
};

function CampaignCard({ campaign }: { campaign: Campaign }) {
  const [expanded, setExpanded] = useState(false);
  const spendPct = Math.round((campaign.spend / campaign.budget) * 100);
  const daysLeft = Math.ceil(
    (new Date(campaign.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
  );

  return (
    <Card onClick={() => setExpanded(!expanded)}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-white text-sm">{campaign.name}</h3>
            <Badge variant={statusColors[campaign.status]}>{campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}</Badge>
          </div>
          <p className="text-xs text-gray-500">{campaign.clientName}</p>
        </div>
        <Badge variant={objectiveColors[campaign.objective] || "gray"}>
          {objectiveLabels[campaign.objective]}
        </Badge>
      </div>

      {/* Budget bar */}
      <div className="mt-3">
        <div className="flex justify-between text-xs mb-1">
          <span className="text-gray-500">Budget utilizado</span>
          <span className="text-white">€{campaign.spend.toLocaleString()} / €{campaign.budget.toLocaleString()}</span>
        </div>
        <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-[#d4af37] rounded-full transition-all"
            style={{ width: `${Math.min(spendPct, 100)}%` }}
          />
        </div>
        <div className="flex justify-between text-xs mt-1">
          <span className="text-gray-600">{spendPct}% gasto</span>
          {daysLeft > 0 && <span className="text-gray-600">{daysLeft} dias restantes</span>}
        </div>
      </div>

      {/* Quick metrics */}
      <div className="grid grid-cols-4 gap-2 mt-3">
        <MetricBox label="CPM" value={`€${campaign.cpm}`} />
        <MetricBox label="CTR" value={`${campaign.ctr}%`} />
        <MetricBox label="CPL" value={campaign.cpl > 0 ? `€${campaign.cpl}` : "—"} />
        {campaign.roas > 0 ? (
          <MetricBox label="ROAS" value={`${campaign.roas}x`} />
        ) : (
          <MetricBox label="Leads" value={String(campaign.leads)} />
        )}
      </div>

      {expanded && (
        <div className="mt-4 pt-4 border-t border-[#1f1f1f] fade-in">
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <p className="text-gray-500 mb-1">Período</p>
              <p className="text-white">
                {new Date(campaign.startDate).toLocaleDateString("pt-BR")} —{" "}
                {new Date(campaign.endDate).toLocaleDateString("pt-BR")}
              </p>
            </div>
            <div>
              <p className="text-gray-500 mb-1">Frequência</p>
              <p className="text-white">{campaign.frequency}x</p>
            </div>
            <div>
              <p className="text-gray-500 mb-1">Leads gerados</p>
              <p className="text-emerald-400 font-semibold">{campaign.leads}</p>
            </div>
            <div>
              <p className="text-gray-500 mb-1">Gasto total</p>
              <p className="text-[#d4af37] font-semibold">€{campaign.spend.toLocaleString()}</p>
            </div>
          </div>

          {/* Performance analysis */}
          <div className="mt-3 grid grid-cols-1 gap-2">
            {campaign.ctr >= 2 ? (
              <div className="flex items-center gap-2 text-xs text-emerald-400 bg-emerald-500/10 rounded p-2">
                <TrendingUp size={12} /> CTR acima da média ({campaign.ctr}% — meta: 2%)
              </div>
            ) : (
              <div className="flex items-center gap-2 text-xs text-orange-400 bg-orange-500/10 rounded p-2">
                <TrendingDown size={12} /> CTR abaixo da meta ({campaign.ctr}% — meta: 2%)
              </div>
            )}
            {campaign.roas > 0 && campaign.roas >= 3 && (
              <div className="flex items-center gap-2 text-xs text-emerald-400 bg-emerald-500/10 rounded p-2">
                <TrendingUp size={12} /> ROAS saudável ({campaign.roas}x — meta: 3x)
              </div>
            )}
          </div>
        </div>
      )}
    </Card>
  );
}

export function AdsView() {
  const activeCampaigns = campaigns.filter((c) => c.status === "ativa");
  const totalSpend = campaigns.reduce((s, c) => s + c.spend, 0);
  const totalLeads = campaigns.reduce((s, c) => s + c.leads, 0);
  const avgCTR = (campaigns.reduce((s, c) => s + c.ctr, 0) / campaigns.length).toFixed(1);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Meta Ads System</h1>
          <p className="text-sm text-gray-400 mt-0.5">
            {activeCampaigns.length} campanhas ativas · {totalLeads} leads gerados
          </p>
        </div>
        <button className="flex items-center gap-2 bg-[#d4af37] text-black text-sm font-semibold px-4 py-2 rounded-lg hover:bg-[#c9a227] transition-all">
          <Plus size={16} /> Nova Campanha
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-[#111] border border-[#1f1f1f] rounded-xl p-4">
          <p className="text-xs text-gray-400 mb-1">Campanhas Ativas</p>
          <p className="text-2xl font-bold text-white">{activeCampaigns.length}</p>
        </div>
        <div className="bg-[#d4af37]/10 border border-[#d4af37]/30 rounded-xl p-4">
          <p className="text-xs text-gray-400 mb-1">Gasto Total</p>
          <p className="text-2xl font-bold text-[#d4af37]">€{totalSpend.toLocaleString()}</p>
        </div>
        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4">
          <p className="text-xs text-gray-400 mb-1">Leads Gerados</p>
          <p className="text-2xl font-bold text-emerald-400">{totalLeads}</p>
        </div>
        <div className="bg-[#111] border border-[#1f1f1f] rounded-xl p-4">
          <p className="text-xs text-gray-400 mb-1">CTR Médio</p>
          <p className="text-2xl font-bold text-white">{avgCTR}%</p>
        </div>
      </div>

      {/* Campaigns */}
      <div className="space-y-3">
        {campaigns.map((campaign) => (
          <CampaignCard key={campaign.id} campaign={campaign} />
        ))}
      </div>
    </div>
  );
}
