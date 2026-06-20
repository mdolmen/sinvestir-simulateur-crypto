"use client";

import { useEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";

const BASE =
  "inline-flex w-full items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-light outline-none transition-all duration-300 focus-visible:ring-2 focus-visible:ring-blue-sky focus-visible:ring-offset-2 focus-visible:ring-offset-sim-bg";

const VARIANTS = {
  primary:
    "border border-transparent bg-gradient-to-r from-[#0049C6] to-[#04265F] text-white hover:border-violet-blue hover:to-[#0049C6]",
  white: "border border-white bg-white text-blue-night hover:bg-transparent hover:text-white",
} as const;

interface ComingSoonButtonProps {
  children: React.ReactNode;
  variant?: keyof typeof VARIANTS;
}

export function ComingSoonButton({ children, variant = "primary" }: ComingSoonButtonProps) {
  const [show, setShow] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  const onClick = () => {
    setShow(true);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setShow(false), 1800);
  };

  return (
    <div className="relative">
      <button type="button" onClick={onClick} className={cn(BASE, VARIANTS[variant])}>
        {children}
      </button>
      {show && (
        <span
          role="status"
          className="absolute -top-11 left-1/2 -translate-x-1/2 rounded-tr-2xl rounded-bl-2xl border border-blue-sky/10 bg-blue-sky/10 px-3 py-2 text-xs whitespace-nowrap text-white backdrop-blur"
        >
          Pas encore implémenté
        </span>
      )}
    </div>
  );
}
