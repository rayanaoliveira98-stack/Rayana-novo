"use client";

import React, { useState } from "react";
import { contentItems } from "@/lib/data";
import type { ContentItem, ContentStatus } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Film, Image, BookOpen, LayoutGrid, Plus, Calendar } from "lucide-react";

const stages: { id: ContentStatus; label: string; color: string }[] = [
  { id: "ideia", label: "Ideia", color: "bg-gray-500" },
  { id: "roteiro", label: "Roteiro", color: "bg-blue-500" },
  { id: "aprovado", label: "Aprovado", color: "bg-[#d4af37]" },
  { id: "design", label: "Design", color: "bg-purple-500" },
  { id: "edicao", label: "Edição", color: "bg-orange-500" },
  { id: "agendamento", label: "Agendamento", color: "bg-cyan-500" },
  { id: "postado", label: "Postado", color: "bg-emerald-500" },
];

const typeIcons: Record<string, React.ReactNode> = {
  reel: <Film size={12} />,
  post: <Image size={12} />,
  story: <BookOpen size={12} />,
  carousel: <LayoutGrid size={12} />,
};

const typeColors: Record<string, "gold" | "blue" | "purple" | "orange"> = {
  reel: "gold",
  post: "blue",
  story: "purple",
  carousel: "orange",
};

function ContentCard({ item }: { item: ContentItem }) {
  const isOverdue = new Date(item.deadline) < new Date() && item.status !== "postado";

  return (
    <div className="bg-[#161616] border border-[#222] rounded-lg p-3 hover:border-[#d4af37]/20 transition-all">
      <div className="flex items-start gap-2 mb-2">
        <span className="text-[#d4af37]">{typeIcons[item.type]}</span>
        <p className="text-xs font-semibold text-white leading-tight flex-1">{item.title}</p>
      </div>

      <p className="text-xs text-gray-500 mb-2">{item.clientName}</p>

      <div className="flex flex-wrap gap-1 mb-2">
        <Badge variant={typeColors[item.type] || "gray"}>{item.type}</Badge>
        {item.platform.map((p) => (
          <span key={p} className="text-[10px] text-gray-500 bg-white/5 px-1.5 py-0.5 rounded">{p}</span>
        ))}
      </div>

      <div className="flex items-center justify-between text-xs">
        <span className="text-gray-500">{item.assignedTo}</span>
        <span className={`${isOverdue ? "text-red-400" : "text-gray-500"}`}>
          {new Date(item.deadline).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" })}
        </span>
      </div>

      {item.notes && (
        <p className="text-xs text-gray-600 mt-2 pt-2 border-t border-[#222] truncate">{item.notes}</p>
      )}
    </div>
  );
}

export function ContentView() {
  const [filter, setFilter] = useState<string>("all");

  const clients = Array.from(new Set(contentItems.map((i) => i.clientName)));
  const filtered = filter === "all" ? contentItems : contentItems.filter((i) => i.clientName === filter);

  const totalPending = contentItems.filter((i) => i.status !== "postado").length;
  const totalPosted = contentItems.filter((i) => i.status === "postado").length;
  const reels = contentItems.filter((i) => i.type === "reel").length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Content OS</h1>
          <p className="text-sm text-gray-400 mt-0.5">
            {totalPending} pendentes · {totalPosted} postados · {reels} reels total
          </p>
        </div>
        <button className="flex items-center gap-2 bg-[#d4af37] text-black text-sm font-semibold px-4 py-2 rounded-lg hover:bg-[#c9a227] transition-all">
          <Plus size={16} /> Novo Conteúdo
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3">
        <div className="bg-[#111] border border-[#1f1f1f] rounded-xl p-4">
          <p className="text-xs text-gray-400 mb-1">Em Produção</p>
          <p className="text-2xl font-bold text-white">{totalPending}</p>
        </div>
        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4">
          <p className="text-xs text-gray-400 mb-1">Postados</p>
          <p className="text-2xl font-bold text-emerald-400">{totalPosted}</p>
        </div>
        <div className="bg-[#d4af37]/10 border border-[#d4af37]/30 rounded-xl p-4">
          <p className="text-xs text-gray-400 mb-1">Reels</p>
          <p className="text-2xl font-bold text-[#d4af37]">{reels}</p>
        </div>
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
          <p className="text-xs text-gray-400 mb-1">Atrasados</p>
          <p className="text-2xl font-bold text-red-400">
            {contentItems.filter((i) => new Date(i.deadline) < new Date() && i.status !== "postado").length}
          </p>
        </div>
      </div>

      {/* Filter */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        <button
          onClick={() => setFilter("all")}
          className={`text-xs px-3 py-1.5 rounded-full whitespace-nowrap transition-all ${
            filter === "all"
              ? "bg-[#d4af37] text-black font-semibold"
              : "bg-white/5 text-gray-400 hover:text-white"
          }`}
        >
          Todos
        </button>
        {clients.map((c) => (
          <button
            key={c}
            onClick={() => setFilter(c)}
            className={`text-xs px-3 py-1.5 rounded-full whitespace-nowrap transition-all ${
              filter === c
                ? "bg-[#d4af37] text-black font-semibold"
                : "bg-white/5 text-gray-400 hover:text-white"
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      {/* Kanban Board */}
      <div className="flex gap-3 overflow-x-auto pb-4">
        {stages.map((stage) => {
          const stageItems = filtered.filter((i) => i.status === stage.id);
          return (
            <div key={stage.id} className="flex-shrink-0 w-56">
              <div className="flex items-center justify-between mb-3 px-1">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${stage.color}`} />
                  <span className="text-xs font-semibold text-gray-300">{stage.label}</span>
                </div>
                <span className="text-xs text-gray-500 bg-white/5 px-2 py-0.5 rounded-full">
                  {stageItems.length}
                </span>
              </div>
              <div className="space-y-2 min-h-[80px]">
                {stageItems.map((item) => (
                  <ContentCard key={item.id} item={item} />
                ))}
                {stageItems.length === 0 && (
                  <div className="bg-[#111] border border-dashed border-[#222] rounded-lg p-4 text-center">
                    <p className="text-xs text-gray-600">Vazio</p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
