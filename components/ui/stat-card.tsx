"use client";

import React from "react";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  trend?: { value: string; positive: boolean };
  accent?: boolean;
}

export function StatCard({ title, value, subtitle, icon, trend, accent }: StatCardProps) {
  return (
    <div
      className={`rounded-xl p-5 border ${
        accent
          ? "bg-[#d4af37]/10 border-[#d4af37]/30"
          : "bg-[#111111] border-[#1f1f1f]"
      }`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-gray-400 uppercase tracking-widest mb-1">{title}</p>
          <p className={`text-2xl font-bold ${accent ? "text-[#d4af37]" : "text-white"}`}>
            {value}
          </p>
          {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
          {trend && (
            <p className={`text-xs mt-1 ${trend.positive ? "text-emerald-400" : "text-red-400"}`}>
              {trend.positive ? "▲" : "▼"} {trend.value}
            </p>
          )}
        </div>
        <div
          className={`p-2.5 rounded-lg ${
            accent ? "bg-[#d4af37]/20 text-[#d4af37]" : "bg-white/5 text-gray-400"
          }`}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}
