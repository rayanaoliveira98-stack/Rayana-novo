"use client";

import React from "react";
import { recruitingJobs } from "@/lib/data";
import type { RecruitingJob } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Users, MapPin, Plus, CheckCircle, TrendingUp } from "lucide-react";

const stages: { id: RecruitingJob["status"]; label: string }[] = [
  { id: "briefing", label: "Briefing" },
  { id: "criativo", label: "Criativo" },
  { id: "meta_ads", label: "Meta Ads" },
  { id: "leads", label: "Leads" },
  { id: "qualificacao", label: "Qualificação" },
  { id: "entrega_rh", label: "Entrega RH" },
  { id: "contratado", label: "Contratado ✓" },
];

const statusColors: Record<string, "gold" | "blue" | "green" | "purple" | "orange" | "gray"> = {
  briefing: "gray",
  criativo: "purple",
  meta_ads: "blue",
  leads: "orange",
  qualificacao: "gold",
  entrega_rh: "blue",
  contratado: "green",
};

function JobCard({ job }: { job: RecruitingJob }) {
  const currentStageIdx = stages.findIndex((s) => s.id === job.status);
  const conversionRate = job.leads > 0 ? Math.round((job.qualified / job.leads) * 100) : 0;

  return (
    <Card>
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-semibold text-white">{job.position}</h3>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs text-gray-500">{job.clientName}</span>
            <span className="text-gray-700">·</span>
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <MapPin size={10} /> {job.location}
            </div>
          </div>
        </div>
        <Badge variant={statusColors[job.status]}>
          {stages.find((s) => s.id === job.status)?.label || job.status}
        </Badge>
      </div>

      {/* Progress bar */}
      <div className="flex items-center gap-1 mb-3">
        {stages.map((stage, idx) => (
          <div
            key={stage.id}
            className={`flex-1 h-1 rounded-full transition-all ${
              idx <= currentStageIdx ? "bg-[#d4af37]" : "bg-white/10"
            }`}
          />
        ))}
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-4 gap-3">
        <div className="bg-[#0d0d0d] rounded-lg p-3 text-center">
          <p className="text-xs text-gray-500 mb-1">Budget</p>
          <p className="text-sm font-bold text-[#d4af37]">€{job.budget.toLocaleString()}</p>
        </div>
        <div className="bg-[#0d0d0d] rounded-lg p-3 text-center">
          <p className="text-xs text-gray-500 mb-1">Leads</p>
          <p className="text-sm font-bold text-white">{job.leads}</p>
        </div>
        <div className="bg-[#0d0d0d] rounded-lg p-3 text-center">
          <p className="text-xs text-gray-500 mb-1">Qualificados</p>
          <p className="text-sm font-bold text-orange-400">{job.qualified}</p>
        </div>
        <div className="bg-[#0d0d0d] rounded-lg p-3 text-center">
          <p className="text-xs text-gray-500 mb-1">Contratados</p>
          <p className={`text-sm font-bold ${job.hired > 0 ? "text-emerald-400" : "text-gray-400"}`}>
            {job.hired}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between mt-3 text-xs">
        <span className="text-gray-500">
          CPL: <span className="text-white">€{job.cpl}</span>
        </span>
        <span className="text-gray-500">
          Conversão: <span className={conversionRate >= 20 ? "text-emerald-400" : "text-orange-400"}>{conversionRate}%</span>
        </span>
        <span className="text-gray-500">
          Briefing: {new Date(job.briefingDate).toLocaleDateString("pt-BR")}
        </span>
      </div>
    </Card>
  );
}

export function RecruitingView() {
  const totalLeads = recruitingJobs.reduce((s, j) => s + j.leads, 0);
  const totalHired = recruitingJobs.reduce((s, j) => s + j.hired, 0);
  const activeJobs = recruitingJobs.filter((j) => j.status !== "contratado").length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Recruiting System</h1>
          <p className="text-sm text-gray-400 mt-0.5">
            {activeJobs} vagas ativas · {totalLeads} candidatos · {totalHired} contratados
          </p>
        </div>
        <button className="flex items-center gap-2 bg-[#d4af37] text-black text-sm font-semibold px-4 py-2 rounded-lg hover:bg-[#c9a227] transition-all">
          <Plus size={16} /> Nova Vaga
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-[#111] border border-[#1f1f1f] rounded-xl p-4">
          <p className="text-xs text-gray-400 mb-1">Vagas Ativas</p>
          <p className="text-2xl font-bold text-white">{activeJobs}</p>
        </div>
        <div className="bg-[#111] border border-[#1f1f1f] rounded-xl p-4">
          <p className="text-xs text-gray-400 mb-1">Total Candidatos</p>
          <p className="text-2xl font-bold text-white">{totalLeads}</p>
        </div>
        <div className="bg-[#d4af37]/10 border border-[#d4af37]/30 rounded-xl p-4">
          <p className="text-xs text-gray-400 mb-1">Qualificados</p>
          <p className="text-2xl font-bold text-[#d4af37]">
            {recruitingJobs.reduce((s, j) => s + j.qualified, 0)}
          </p>
        </div>
        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4">
          <p className="text-xs text-gray-400 mb-1">Contratados</p>
          <p className="text-2xl font-bold text-emerald-400">{totalHired}</p>
        </div>
      </div>

      {/* Vantagem competitiva */}
      <div className="bg-[#d4af37]/5 border border-[#d4af37]/20 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <TrendingUp size={18} className="text-[#d4af37] mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-semibold text-[#d4af37]">Seu Diferencial Competitivo</p>
            <p className="text-xs text-gray-400 mt-1">
              Recruiting Ads via Meta Ads é uma vantagem única no mercado austríaco. A maioria das agências na Áustria faz apenas "social media estético". Você conecta empresas a candidatos qualificados com performance mensurável — isso muda seu ticket e posicionamento.
            </p>
          </div>
        </div>
      </div>

      {/* Pipeline */}
      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Vagas em Andamento</h2>
        {recruitingJobs.map((job) => (
          <JobCard key={job.id} job={job} />
        ))}
      </div>
    </div>
  );
}
