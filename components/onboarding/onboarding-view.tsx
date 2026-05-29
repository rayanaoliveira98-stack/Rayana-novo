"use client";

import React, { useState } from "react";
import { CheckCircle, Circle, Mail, FileText, FolderOpen, MessageCircle, Globe, Users } from "lucide-react";

interface ChecklistItem {
  id: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  automated: boolean;
}

const onboardingSteps: ChecklistItem[] = [
  {
    id: "email",
    label: "Welcome Email",
    description: "Email de boas-vindas com próximos passos e o que esperar",
    icon: <Mail size={16} />,
    automated: true,
  },
  {
    id: "form",
    label: "Formulário de Onboarding",
    description: "Typeform com todas as informações necessárias: marca, objetivos, acessos",
    icon: <FileText size={16} />,
    automated: true,
  },
  {
    id: "contract",
    label: "Contrato Assinado",
    description: "Contrato enviado via DocuSign ou similar",
    icon: <FileText size={16} />,
    automated: false,
  },
  {
    id: "invoice",
    label: "Invoice Gerado",
    description: "Primeira fatura criada e enviada automaticamente",
    icon: <FileText size={16} />,
    automated: true,
  },
  {
    id: "drive",
    label: "Pasta Google Drive",
    description: "Estrutura de pasta criada: Assets, Aprovações, Relatórios, Contratos",
    icon: <FolderOpen size={16} />,
    automated: true,
  },
  {
    id: "whatsapp",
    label: "Grupo WhatsApp",
    description: "Grupo criado com cliente + equipe responsável",
    icon: <MessageCircle size={16} />,
    automated: false,
  },
  {
    id: "portal",
    label: "Client Portal",
    description: "Portal Notion personalizado com calendário, relatórios e aprovações",
    icon: <Globe size={16} />,
    automated: false,
  },
  {
    id: "slack",
    label: "Canal Slack Interno",
    description: "Canal criado para comunicação interna sobre o cliente",
    icon: <Users size={16} />,
    automated: true,
  },
  {
    id: "kickoff",
    label: "Call de Kickoff",
    description: "Reunião de 60 min para alinhar estratégia, metas e primeiras ações",
    icon: <Users size={16} />,
    automated: false,
  },
];

const sops = [
  { title: "Onboarding Cliente", desc: "Processo completo do momento do fechamento até primeira entrega", steps: 9 },
  { title: "Criação de Reels", desc: "Do briefing ao upload: roteiro, filmagem, edição, aprovação", steps: 7 },
  { title: "Setup Meta Ads", desc: "Pixel, evento, campanha, adset, creative, copy, lançamento", steps: 12 },
  { title: "Resposta a Leads", desc: "Script e tempo máximo de resposta por canal", steps: 4 },
  { title: "Reunião Comercial", desc: "Estrutura da call de vendas: rapport, discovery, proposta, fechamento", steps: 6 },
  { title: "Aprovação Conteúdo", desc: "Fluxo de aprovação com cliente: draft → revisão → aprovado → agendado", steps: 5 },
  { title: "Entrega Relatório", desc: "Relatório mensal: KPIs, análise, próximos passos", steps: 4 },
  { title: "Recruiting Ads Setup", desc: "Briefing da vaga → criativo → targeting → qualificação → entrega", steps: 8 },
];

interface ClientOnboardingState {
  [key: string]: boolean;
}

export function OnboardingView() {
  const [checkedItems, setCheckedItems] = useState<ClientOnboardingState>({});

  const toggleItem = (id: string) => {
    setCheckedItems((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const completedCount = Object.values(checkedItems).filter(Boolean).length;
  const progress = Math.round((completedCount / onboardingSteps.length) * 100);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Sistema de Onboarding</h1>
        <p className="text-sm text-gray-400 mt-0.5">
          Checklist de onboarding + SOPs da agência
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Onboarding Checklist */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-white">Checklist de Onboarding</h2>
            <span className="text-xs text-gray-400">{completedCount}/{onboardingSteps.length} completos</span>
          </div>

          {/* Progress bar */}
          <div className="h-1.5 bg-white/10 rounded-full overflow-hidden mb-4">
            <div
              className="h-full bg-[#d4af37] rounded-full transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="space-y-2">
            {onboardingSteps.map((step) => {
              const checked = checkedItems[step.id] || false;
              return (
                <div
                  key={step.id}
                  onClick={() => toggleItem(step.id)}
                  className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                    checked
                      ? "bg-emerald-500/5 border-emerald-500/20"
                      : "bg-[#111] border-[#1f1f1f] hover:border-[#d4af37]/30"
                  }`}
                >
                  <div className={`mt-0.5 ${checked ? "text-emerald-400" : "text-gray-600"}`}>
                    {checked ? <CheckCircle size={18} /> : <Circle size={18} />}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className={`text-sm font-medium ${checked ? "text-gray-400 line-through" : "text-white"}`}>
                        {step.label}
                      </p>
                      {step.automated && (
                        <span className="text-[10px] bg-[#d4af37]/20 text-[#d4af37] px-1.5 py-0.5 rounded">Auto</span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">{step.description}</p>
                  </div>
                  <div className={`${checked ? "text-emerald-400/50" : "text-gray-700"}`}>{step.icon}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* SOPs */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-white">SOPs da Agência</h2>
            <span className="text-xs text-[#d4af37]">Standard Operating Procedures</span>
          </div>

          <div className="bg-[#d4af37]/5 border border-[#d4af37]/20 rounded-xl p-3 mb-4">
            <p className="text-xs text-[#d4af37] font-semibold mb-1">Por que SOPs são essenciais?</p>
            <p className="text-xs text-gray-400">
              SOPs transformam freelancer em empresa. Com processos documentados, você pode delegar sem perder qualidade, onboardar novos membros rapidamente e escalar sem caos.
            </p>
          </div>

          <div className="space-y-2">
            {sops.map((sop, idx) => (
              <div
                key={idx}
                className="bg-[#111] border border-[#1f1f1f] rounded-xl p-4 hover:border-[#d4af37]/20 transition-all cursor-pointer group"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-semibold text-white group-hover:text-[#d4af37] transition-colors">
                      {sop.title}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">{sop.desc}</p>
                  </div>
                  <span className="text-xs text-gray-600 bg-white/5 px-2 py-1 rounded flex-shrink-0 ml-3">
                    {sop.steps} etapas
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Team Structure */}
      <div className="bg-[#111] border border-[#1f1f1f] rounded-xl p-5">
        <h2 className="text-sm font-semibold text-white mb-4">Estrutura de Equipe Ideal</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {[
            { role: "CEO + Strategy", name: "Rayana", color: "bg-[#d4af37]/20 text-[#d4af37]", highlight: true },
            { role: "Designer", name: "Execução visual", color: "bg-blue-500/20 text-blue-400", highlight: false },
            { role: "Editor", name: "Vídeo", color: "bg-purple-500/20 text-purple-400", highlight: false },
            { role: "Copywriter", name: "Hooks + captions", color: "bg-orange-500/20 text-orange-400", highlight: false },
            { role: "Media Buyer", name: "Ads", color: "bg-emerald-500/20 text-emerald-400", highlight: false },
            { role: "VA/Admin", name: "CRM + follow-ups", color: "bg-gray-500/20 text-gray-400", highlight: false },
          ].map((member) => (
            <div
              key={member.role}
              className={`rounded-xl p-3 text-center border ${
                member.highlight ? "border-[#d4af37]/30 bg-[#d4af37]/10" : "border-[#1f1f1f] bg-[#0d0d0d]"
              }`}
            >
              <div className={`w-8 h-8 rounded-full ${member.color} mx-auto mb-2 flex items-center justify-center text-xs font-bold`}>
                {member.role.charAt(0)}
              </div>
              <p className="text-xs font-semibold text-white">{member.role}</p>
              <p className="text-xs text-gray-500 mt-0.5">{member.name}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
