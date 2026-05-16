"use client";

import React from "react";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "gold" | "green" | "red" | "blue" | "purple" | "orange" | "gray";
  size?: "sm" | "md";
}

const variantClasses = {
  gold: "bg-[#d4af37]/20 text-[#d4af37] border border-[#d4af37]/30",
  green: "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30",
  red: "bg-red-500/20 text-red-400 border border-red-500/30",
  blue: "bg-blue-500/20 text-blue-400 border border-blue-500/30",
  purple: "bg-purple-500/20 text-purple-400 border border-purple-500/30",
  orange: "bg-orange-500/20 text-orange-400 border border-orange-500/30",
  gray: "bg-white/10 text-gray-400 border border-white/10",
};

export function Badge({ children, variant = "gray", size = "sm" }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full font-medium ${
        size === "sm" ? "px-2 py-0.5 text-xs" : "px-3 py-1 text-sm"
      } ${variantClasses[variant]}`}
    >
      {children}
    </span>
  );
}
