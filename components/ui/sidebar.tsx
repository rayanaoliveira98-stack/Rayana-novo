"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  UserCheck,
  Film,
  Megaphone,
  Briefcase,
  DollarSign,
  Settings,
  Zap,
  Target,
} from "lucide-react";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/leads", label: "Pipeline Leads", icon: Target },
  { href: "/clients", label: "Clientes", icon: UserCheck },
  { href: "/content", label: "Conteúdo", icon: Film },
  { href: "/ads", label: "Meta Ads", icon: Megaphone },
  { href: "/recruiting", label: "Recruiting", icon: Users },
  { href: "/financial", label: "Financeiro", icon: DollarSign },
  { href: "/onboarding", label: "Onboarding", icon: Briefcase },
  { href: "/automations", label: "Automações", icon: Zap },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 h-full w-60 bg-[#0d0d0d] border-r border-[#1a1a1a] flex flex-col z-40">
      {/* Logo */}
      <div className="p-6 border-b border-[#1a1a1a]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-[#d4af37] rounded-lg flex items-center justify-center">
            <span className="text-black font-black text-sm">BS</span>
          </div>
          <div>
            <p className="font-bold text-white text-sm leading-tight">BlackStrategie</p>
            <p className="text-[10px] text-gray-500 leading-tight">Agency OS</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 overflow-y-auto">
        <p className="text-[10px] text-gray-600 uppercase tracking-widest px-3 mb-3">Sistema</p>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg mb-0.5 text-sm transition-all ${
                isActive
                  ? "bg-[#d4af37]/15 text-[#d4af37] font-medium"
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <Icon size={16} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-[#1a1a1a]">
        <Link
          href="/settings"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-500 hover:text-white hover:bg-white/5 transition-all"
        >
          <Settings size={16} />
          Configurações
        </Link>
        <div className="mt-3 px-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-[#d4af37] flex items-center justify-center">
              <span className="text-xs font-bold text-black">R</span>
            </div>
            <div>
              <p className="text-xs font-medium text-white">Rayana</p>
              <p className="text-[10px] text-gray-500">CEO</p>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
