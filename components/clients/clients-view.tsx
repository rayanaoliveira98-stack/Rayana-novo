"use client";

import React, { useState } from "react";
import { clients as allClients } from "@/lib/data";
import type { Client } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  Globe,
  AtSign,
  Phone,
  Mail,
  MapPin,
  ChevronDown,
  ChevronUp,
  Plus,
  DollarSign,
} from "lucide-react";

const serviceLabels: Record<string, string> = {
  social_media: "Social Media",
  meta_ads: "Meta Ads",
  google_ads: "Google Ads",
  landing_page: "Landing Page",
  recruiting_ads: "Recruiting Ads",
  branding: "Branding",
};

const serviceColors: Record<string, "gold" | "blue" | "green" | "purple" | "orange" | "gray"> = {
  social_media: "gold",
  meta_ads: "blue",
  google_ads: "green",
  landing_page: "purple",
  recruiting_ads: "orange",
  branding: "gray",
};

function ClientCard({ client }: { client: Client }) {
  const [expanded, setExpanded] = useState(false);

  const paymentColor: Record<string, "green" | "gold" | "red" | "gray"> = {
    pago: "green",
    pendente: "gold",
    atrasado: "red",
    cancelado: "gray",
  };

  return (
    <Card className="fade-in">
      <div
        className="flex items-start justify-between cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#d4af37]/15 flex items-center justify-center text-[#d4af37] font-bold text-sm">
            {client.company.charAt(0)}
          </div>
          <div>
            <h3 className="font-semibold text-white">{client.company}</h3>
            <p className="text-xs text-gray-500">{client.owner} · {client.city}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-lg font-bold text-[#d4af37]">€{client.monthlyFee.toLocaleString()}</p>
            <Badge variant={paymentColor[client.paymentStatus]}>
              {client.paymentStatus.charAt(0).toUpperCase() + client.paymentStatus.slice(1)}
            </Badge>
          </div>
          {expanded ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
        </div>
      </div>

      {/* Services */}
      <div className="flex flex-wrap gap-1.5 mt-3">
        {client.services.map((s) => (
          <Badge key={s} variant={serviceColors[s] || "gray"}>{serviceLabels[s] || s}</Badge>
        ))}
      </div>

      {/* Expanded Details */}
      {expanded && (
        <div className="mt-4 pt-4 border-t border-[#1f1f1f] fade-in">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Dados */}
            <div>
              <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Contato</h4>
              <div className="space-y-1.5 text-xs">
                <div className="flex items-center gap-2 text-gray-300">
                  <Phone size={12} className="text-gray-500" /> {client.phone}
                </div>
                <div className="flex items-center gap-2 text-gray-300">
                  <Mail size={12} className="text-gray-500" /> {client.email}
                </div>
                <div className="flex items-center gap-2 text-gray-300">
                  <MapPin size={12} className="text-gray-500" /> {client.city}
                </div>
                {client.website && (
                  <div className="flex items-center gap-2 text-gray-300">
                    <Globe size={12} className="text-gray-500" /> {client.website}
                  </div>
                )}
                {client.instagram && (
                  <div className="flex items-center gap-2 text-gray-300">
                    <AtSign size={12} className="text-gray-500" /> {client.instagram}
                  </div>
                )}
              </div>
            </div>

            {/* Marketing */}
            <div>
              <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Marketing</h4>
              <div className="space-y-2 text-xs">
                <div>
                  <p className="text-gray-500">Objetivo</p>
                  <p className="text-gray-300">{client.objective}</p>
                </div>
                <div>
                  <p className="text-gray-500">ICP</p>
                  <p className="text-gray-300">{client.icp}</p>
                </div>
                <div>
                  <p className="text-gray-500">Nicho</p>
                  <p className="text-gray-300">{client.niche}</p>
                </div>
              </div>
            </div>

            {/* Financeiro */}
            <div>
              <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Financeiro</h4>
              <div className="space-y-2 text-xs">
                <div>
                  <p className="text-gray-500">Mensalidade</p>
                  <p className="text-[#d4af37] font-semibold text-sm">€{client.monthlyFee.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-gray-500">Vencimento</p>
                  <p className="text-gray-300">Dia {client.dueDate}</p>
                </div>
                <div>
                  <p className="text-gray-500">Cliente desde</p>
                  <p className="text-gray-300">{new Date(client.startDate).toLocaleDateString("pt-BR")}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Dores e Diferenciais */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
            <div className="bg-red-500/5 border border-red-500/10 rounded-lg p-3">
              <p className="text-xs font-semibold text-red-400 mb-1">Dores</p>
              <p className="text-xs text-gray-400">{client.pains}</p>
            </div>
            <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-lg p-3">
              <p className="text-xs font-semibold text-emerald-400 mb-1">Diferenciais</p>
              <p className="text-xs text-gray-400">{client.differentials}</p>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}

export function ClientsView() {
  const activeClients = allClients.filter((c) => c.status === "active");
  const totalMRR = activeClients.reduce((sum, c) => sum + c.monthlyFee, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Clientes</h1>
          <p className="text-sm text-gray-400 mt-0.5">
            {activeClients.length} clientes ativos · MRR total:{" "}
            <span className="text-[#d4af37]">€{totalMRR.toLocaleString()}</span>
          </p>
        </div>
        <button className="flex items-center gap-2 bg-[#d4af37] text-black text-sm font-semibold px-4 py-2 rounded-lg hover:bg-[#c9a227] transition-all">
          <Plus size={16} /> Novo Cliente
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-[#111] border border-[#1f1f1f] rounded-xl p-4">
          <p className="text-xs text-gray-400 mb-1">Clientes Ativos</p>
          <p className="text-2xl font-bold text-white">{activeClients.length}</p>
        </div>
        <div className="bg-[#d4af37]/10 border border-[#d4af37]/30 rounded-xl p-4">
          <p className="text-xs text-gray-400 mb-1">MRR Total</p>
          <p className="text-2xl font-bold text-[#d4af37]">€{totalMRR.toLocaleString()}</p>
        </div>
        <div className="bg-[#111] border border-[#1f1f1f] rounded-xl p-4">
          <p className="text-xs text-gray-400 mb-1">Ticket Médio</p>
          <p className="text-2xl font-bold text-white">€{Math.round(totalMRR / activeClients.length).toLocaleString()}</p>
        </div>
        <div className="bg-[#111] border border-[#1f1f1f] rounded-xl p-4">
          <p className="text-xs text-gray-400 mb-1">Em Atraso</p>
          <p className="text-2xl font-bold text-red-400">
            {allClients.filter((c) => c.paymentStatus === "atrasado").length}
          </p>
        </div>
      </div>

      {/* Client List */}
      <div className="space-y-3">
        {allClients.map((client) => (
          <ClientCard key={client.id} client={client} />
        ))}
      </div>
    </div>
  );
}
