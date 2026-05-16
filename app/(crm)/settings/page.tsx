"use client";

import React from "react";

const packages = [
  { name: "Starter", price: "€690–990", features: ["Social Media (3x/semana)", "Estratégia de conteúdo", "Relatório mensal"] },
  { name: "Growth", price: "€1.500–2.500", features: ["Social Media (5x/semana)", "Meta Ads (gestão)", "Landing Page", "Relatório semanal", "Reunião mensal"] },
  { name: "Recruiting Performance", price: "€2.000–5.000+", features: ["Recruiting Ads", "Qualificação de candidatos", "Relatório de candidaturas", "Meta Ads dedicado", "RH reporting"] },
];

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Configurações</h1>
        <p className="text-sm text-gray-400 mt-0.5">BlackStrategie OS — Configurações e Pacotes</p>
      </div>

      {/* Packages */}
      <div>
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Modelo de Oferta</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {packages.map((pkg, idx) => (
            <div
              key={pkg.name}
              className={`rounded-xl p-5 border ${
                idx === 1
                  ? "bg-[#d4af37]/10 border-[#d4af37]/40"
                  : "bg-[#111] border-[#1f1f1f]"
              }`}
            >
              {idx === 1 && (
                <span className="text-[10px] bg-[#d4af37] text-black font-bold px-2 py-0.5 rounded mb-2 inline-block">
                  POPULAR
                </span>
              )}
              <h3 className="font-bold text-white">{pkg.name}</h3>
              <p className={`text-xl font-bold mt-1 mb-3 ${idx === 1 ? "text-[#d4af37]" : "text-white"}`}>
                {pkg.price}
                <span className="text-xs text-gray-500 font-normal">/mês</span>
              </p>
              <ul className="space-y-1.5">
                {pkg.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-xs text-gray-400">
                    <span className="text-[#d4af37]">✓</span> {f}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Agency Profile */}
      <div className="bg-[#111] border border-[#1f1f1f] rounded-xl p-5">
        <h2 className="text-sm font-semibold text-white mb-4">Perfil da Agência</h2>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-xs text-gray-500 mb-1">Nome</p>
            <p className="text-white">BlackStrategie</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">CEO</p>
            <p className="text-white">Rayana Oliveira</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">País</p>
            <p className="text-white">Áustria 🇦🇹</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">Especialidade</p>
            <p className="text-white">Growth + Recruiting Ads</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">Posicionamento</p>
            <p className="text-white">Agência de Crescimento Local</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">Sistema</p>
            <p className="text-white">BlackStrategie OS v1.0</p>
          </div>
        </div>
      </div>

      {/* Positioning */}
      <div className="bg-[#0d0d0d] border border-[#d4af37]/20 rounded-xl p-5">
        <h2 className="text-sm font-semibold text-[#d4af37] mb-3">Posicionamento Estratégico</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div>
            <p className="text-red-400 font-semibold mb-2">❌ Você NÃO vende:</p>
            <ul className="space-y-1 text-gray-400">
              <li>• "Social media"</li>
              <li>• "Posts no Instagram"</li>
              <li>• "Canva bonito"</li>
            </ul>
          </div>
          <div>
            <p className="text-emerald-400 font-semibold mb-2">✓ Você vende:</p>
            <ul className="space-y-1 text-gray-400">
              <li>• Resultado mensurável</li>
              <li>• Pipeline de leads</li>
              <li>• Candidatos qualificados</li>
              <li>• Crescimento de negócio</li>
            </ul>
          </div>
        </div>
        <div className="mt-4 pt-4 border-t border-[#1f1f1f]">
          <p className="text-xs text-gray-400">
            <span className="text-[#d4af37] font-semibold">Seu diferencial real:</span> Você entende negócio, recrutamento, lead flow, vendas e performance. A maioria das agências na Áustria parece estudante fazendo Canva. Você já está mais perto de uma consultoria de crescimento.
          </p>
        </div>
      </div>
    </div>
  );
}
