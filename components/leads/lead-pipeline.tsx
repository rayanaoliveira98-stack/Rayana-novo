"use client";

import React, { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { leads as allLeads } from "@/lib/data";
import type { Lead, LeadStatus } from "@/lib/types";
import { Phone, Mail, Plus } from "lucide-react";

const stages: { id: LeadStatus; label: string; color: string }[] = [
  { id: "novo_lead", label: "Novo Lead", color: "bg-blue-500" },
  { id: "qualificacao", label: "Qualificação", color: "bg-purple-500" },
  { id: "call_agendada", label: "Call Agendada", color: "bg-[#d4af37]" },
  { id: "proposta_enviada", label: "Proposta Enviada", color: "bg-orange-500" },
  { id: "negociacao", label: "Negociação", color: "bg-amber-500" },
  { id: "fechado", label: "Fechado ✓", color: "bg-emerald-500" },
];

const sourceLabels: Record<string, string> = {
  instagram: "Instagram",
  tiktok: "TikTok",
  meta_ads: "Meta Ads",
  indicacao: "Indicação",
  site: "Site",
  networking: "Networking",
};

const sourceColors: Record<string, "blue" | "purple" | "orange" | "green" | "gold" | "gray"> = {
  instagram: "purple",
  tiktok: "blue",
  meta_ads: "blue",
  indicacao: "green",
  site: "gray",
  networking: "gold",
};

function LeadCard({ lead }: { lead: Lead }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      className="bg-[#161616] border border-[#222] rounded-lg p-3 cursor-pointer hover:border-[#d4af37]/30 transition-all"
      onClick={() => setExpanded(!expanded)}
    >
      <div className="flex items-start justify-between mb-2">
        <div>
          <p className="text-sm font-semibold text-white">{lead.name}</p>
          <p className="text-xs text-gray-500">{lead.company}</p>
        </div>
        <Badge variant={sourceColors[lead.source] || "gray"}>{sourceLabels[lead.source]}</Badge>
      </div>

      <div className="flex items-center gap-2 mb-2">
        <span className="text-xs text-gray-400 bg-white/5 px-2 py-0.5 rounded">{lead.niche}</span>
        <span className="text-xs font-semibold text-[#d4af37]">{lead.ticket}</span>
      </div>

      {expanded && (
        <div className="mt-3 pt-3 border-t border-[#222] space-y-2 fade-in">
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <p className="text-gray-500">Faturamento</p>
              <p className="text-white">{lead.revenue}</p>
            </div>
            <div>
              <p className="text-gray-500">Necessidade</p>
              <p className="text-white">{lead.need}</p>
            </div>
            <div>
              <p className="text-gray-500">Já anuncia?</p>
              <p className="text-white">{lead.advertises ? "Sim" : "Não"}</p>
            </div>
            <div>
              <p className="text-gray-500">Último contato</p>
              <p className="text-white">{new Date(lead.lastContact).toLocaleDateString("pt-BR")}</p>
            </div>
          </div>
          {lead.notes && (
            <div className="bg-white/5 rounded p-2">
              <p className="text-xs text-gray-400">{lead.notes}</p>
            </div>
          )}
          <div className="flex gap-2 pt-1">
            <button className="flex items-center gap-1 text-xs text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 px-2 py-1 rounded transition-all">
              <Phone size={12} /> Ligar
            </button>
            <button className="flex items-center gap-1 text-xs text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 px-2 py-1 rounded transition-all">
              <Mail size={12} /> Email
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export function LeadPipeline() {
  const activeLeads = allLeads.filter((l) => l.status !== "perdido");

  const totalValue = allLeads
    .filter((l) => l.status === "negociacao" || l.status === "proposta_enviada")
    .reduce((sum, l) => sum + parseInt(l.ticket.replace(/[^0-9]/g, "") || "0"), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Pipeline de Leads</h1>
          <p className="text-sm text-gray-400 mt-0.5">
            {activeLeads.length} leads ativos · Pipeline estimado: <span className="text-[#d4af37]">€{totalValue.toLocaleString()}/mês</span>
          </p>
        </div>
        <button className="flex items-center gap-2 bg-[#d4af37] text-black text-sm font-semibold px-4 py-2 rounded-lg hover:bg-[#c9a227] transition-all">
          <Plus size={16} /> Novo Lead
        </button>
      </div>

      {/* Kanban Board */}
      <div className="flex gap-3 overflow-x-auto pb-4">
        {stages.map((stage) => {
          const stageLeads = activeLeads.filter((l) => l.status === stage.id);
          const stageValue = stageLeads.reduce(
            (sum, l) => sum + parseInt(l.ticket.replace(/[^0-9]/g, "") || "0"),
            0
          );

          return (
            <div key={stage.id} className="flex-shrink-0 w-64">
              {/* Column Header */}
              <div className="flex items-center justify-between mb-3 px-1">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${stage.color}`} />
                  <span className="text-xs font-semibold text-gray-300">{stage.label}</span>
                </div>
                <span className="text-xs text-gray-500 bg-white/5 px-2 py-0.5 rounded-full">
                  {stageLeads.length}
                </span>
              </div>

              {stageValue > 0 && (
                <p className="text-xs text-[#d4af37] px-1 mb-2">€{stageValue.toLocaleString()}/mês</p>
              )}

              {/* Cards */}
              <div className="space-y-2 min-h-[100px]">
                {stageLeads.map((lead) => (
                  <LeadCard key={lead.id} lead={lead} />
                ))}
                {stageLeads.length === 0 && (
                  <div className="bg-[#111] border border-dashed border-[#222] rounded-lg p-4 text-center">
                    <p className="text-xs text-gray-600">Nenhum lead</p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Perdidos */}
      <div>
        <h2 className="text-sm font-semibold text-gray-400 mb-3">Leads Perdidos</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {allLeads
            .filter((l) => l.status === "perdido")
            .map((lead) => (
              <div key={lead.id} className="bg-[#111] border border-[#1f1f1f] rounded-lg p-3 opacity-60">
                <p className="text-sm font-medium text-gray-300">{lead.name}</p>
                <p className="text-xs text-gray-500">{lead.company} · {lead.notes}</p>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
