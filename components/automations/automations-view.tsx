"use client";

import React, { useState } from "react";
import { Zap, ChevronRight, CheckCircle, ArrowRight, Settings } from "lucide-react";

interface Automation {
  id: string;
  trigger: string;
  actions: string[];
  tool: string;
  active: boolean;
  category: string;
}

const automations: Automation[] = [
  {
    id: "a1",
    trigger: "Lead entra no formulário",
    actions: [
      "Cria card no CRM (Notion)",
      "Envia mensagem automática no WhatsApp",
      "Agenda follow-up em 24h",
      "Notifica equipe no Slack",
    ],
    tool: "Zapier",
    active: true,
    category: "Leads",
  },
  {
    id: "a2",
    trigger: "Cliente fecha contrato",
    actions: [
      "Cria pasta no Google Drive",
      "Cria portal no Notion",
      "Adiciona cliente no Slack",
      "Dispara sequência de onboarding",
      "Gera invoice no sistema financeiro",
    ],
    tool: "Zapier",
    active: true,
    category: "Vendas",
  },
  {
    id: "a3",
    trigger: "Conteúdo aprovado no portal",
    actions: [
      "Move automaticamente para 'Agendamento'",
      "Notifica editor/designer",
      "Agenda post no Meta Business Suite",
    ],
    tool: "Zapier + Meta",
    active: true,
    category: "Conteúdo",
  },
  {
    id: "a4",
    trigger: "Pagamento em atraso (3 dias)",
    actions: [
      "Envia email automático de lembrete",
      "Cria tarefa de cobrança para VA/Admin",
      "Notifica CEO no Slack",
    ],
    tool: "Zapier",
    active: true,
    category: "Financeiro",
  },
  {
    id: "a5",
    trigger: "Lead sem resposta por 48h",
    actions: [
      "Envia follow-up automático",
      "Move para 'Follow-up' no pipeline",
      "Cria lembrete para equipe de vendas",
    ],
    tool: "Zapier",
    active: false,
    category: "Leads",
  },
  {
    id: "a6",
    trigger: "Lead de Recruiting entra",
    actions: [
      "Cria ficha do candidato",
      "Envia confirmação de recebimento",
      "Adiciona ao pipeline de qualificação",
      "Notifica cliente do novo candidato",
    ],
    tool: "Zapier",
    active: true,
    category: "Recruiting",
  },
  {
    id: "a7",
    trigger: "Relatório mensal (dia 28)",
    actions: [
      "Gera relatório de KPIs automaticamente",
      "Exporta dados do Meta Ads",
      "Envia relatório para clientes via email",
      "Agenda reunião de apresentação",
    ],
    tool: "Zapier + Make",
    active: false,
    category: "Relatórios",
  },
];

const categoryColors: Record<string, string> = {
  Leads: "text-blue-400 bg-blue-500/10",
  Vendas: "text-emerald-400 bg-emerald-500/10",
  Conteúdo: "text-[#d4af37] bg-[#d4af37]/10",
  Financeiro: "text-red-400 bg-red-500/10",
  Recruiting: "text-purple-400 bg-purple-500/10",
  Relatórios: "text-orange-400 bg-orange-500/10",
};

const stack = [
  { name: "Notion", role: "CRM + Docs", logo: "N", color: "bg-white text-black" },
  { name: "Zapier", role: "Automações", logo: "Z", color: "bg-orange-500 text-white" },
  { name: "Google Drive", role: "Arquivos", logo: "G", color: "bg-blue-500 text-white" },
  { name: "WhatsApp Business", role: "Comunicação", logo: "W", color: "bg-emerald-500 text-white" },
  { name: "Meta Business", role: "Ads + Agendamento", logo: "M", color: "bg-blue-600 text-white" },
  { name: "Slack", role: "Equipe interna", logo: "S", color: "bg-purple-500 text-white" },
  { name: "Typeform", role: "Formulários", logo: "T", color: "bg-pink-500 text-white" },
  { name: "Make", role: "Automações avançadas", logo: "K", color: "bg-indigo-500 text-white" },
];

export function AutomationsView() {
  const [localAutomations, setLocalAutomations] = useState(automations);
  const [selectedCategory, setSelectedCategory] = useState("all");

  const categories = ["all", ...Array.from(new Set(automations.map((a) => a.category)))];
  const filtered = selectedCategory === "all" ? localAutomations : localAutomations.filter((a) => a.category === selectedCategory);

  const activeCount = localAutomations.filter((a) => a.active).length;

  const toggleAutomation = (id: string) => {
    setLocalAutomations((prev) =>
      prev.map((a) => (a.id === id ? { ...a, active: !a.active } : a))
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Automações</h1>
        <p className="text-sm text-gray-400 mt-0.5">
          {activeCount} de {automations.length} automações ativas
        </p>
      </div>

      {/* Stack */}
      <div className="bg-[#111] border border-[#1f1f1f] rounded-xl p-5">
        <h2 className="text-sm font-semibold text-white mb-4">Stack Recomendada</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {stack.map((tool) => (
            <div key={tool.name} className="flex items-center gap-3 bg-[#0d0d0d] rounded-lg p-3">
              <div className={`w-8 h-8 rounded-lg ${tool.color} flex items-center justify-center text-xs font-black flex-shrink-0`}>
                {tool.logo}
              </div>
              <div>
                <p className="text-xs font-semibold text-white">{tool.name}</p>
                <p className="text-[10px] text-gray-500">{tool.role}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Filter */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`text-xs px-3 py-1.5 rounded-full whitespace-nowrap transition-all ${
              selectedCategory === cat
                ? "bg-[#d4af37] text-black font-semibold"
                : "bg-white/5 text-gray-400 hover:text-white"
            }`}
          >
            {cat === "all" ? "Todas" : cat}
          </button>
        ))}
      </div>

      {/* Automations */}
      <div className="space-y-3">
        {filtered.map((automation) => (
          <div
            key={automation.id}
            className={`bg-[#111] border rounded-xl p-4 transition-all ${
              automation.active ? "border-[#1f1f1f]" : "border-[#1a1a1a] opacity-60"
            }`}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-start gap-3">
                <div className={`p-1.5 rounded-lg ${automation.active ? "bg-[#d4af37]/20 text-[#d4af37]" : "bg-white/5 text-gray-500"}`}>
                  <Zap size={14} />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="text-sm font-semibold text-white">{automation.trigger}</p>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${categoryColors[automation.category] || "text-gray-400 bg-white/5"}`}>
                      {automation.category}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">via {automation.tool}</p>
                </div>
              </div>
              <button
                onClick={() => toggleAutomation(automation.id)}
                className={`relative w-10 h-5 rounded-full transition-all flex-shrink-0 ${
                  automation.active ? "bg-[#d4af37]" : "bg-white/10"
                }`}
              >
                <span
                  className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all ${
                    automation.active ? "left-5" : "left-0.5"
                  }`}
                />
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-2 ml-9">
              {automation.actions.map((action, idx) => (
                <React.Fragment key={idx}>
                  <span className="text-xs text-gray-400 bg-white/5 px-2 py-1 rounded">{action}</span>
                  {idx < automation.actions.length - 1 && (
                    <ArrowRight size={12} className="text-gray-600 flex-shrink-0" />
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Future Stack */}
      <div className="bg-[#d4af37]/5 border border-[#d4af37]/20 rounded-xl p-5">
        <h2 className="text-sm font-semibold text-[#d4af37] mb-3">Arquitetura Futura (Fase 3)</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { name: "HubSpot", desc: "CRM Enterprise" },
            { name: "Make", desc: "Automações avançadas" },
            { name: "AI Copywriter", desc: "Copy automático" },
            { name: "AI Lead Qualifier", desc: "Qualificação automática" },
          ].map((item) => (
            <div key={item.name} className="bg-[#0d0d0d] rounded-lg p-3 text-center opacity-70">
              <p className="text-xs font-semibold text-white">{item.name}</p>
              <p className="text-[10px] text-gray-500 mt-0.5">{item.desc}</p>
              <span className="text-[10px] text-[#d4af37] bg-[#d4af37]/10 px-2 py-0.5 rounded mt-1 inline-block">
                Fase 3
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
