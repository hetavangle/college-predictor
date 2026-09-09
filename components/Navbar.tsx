"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import dynamic from "next/dynamic";
import { useAuth } from "./Providers";

const AuthModal = dynamic(() => import("./AuthModal").then((module) => module.AuthModal), { ssr: false });

export function Navbar() {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState("");
  const { profile, logout } = useAuth();
  const pathname = usePathname();
  return <>
    <header className="sticky top-0 z-40 border-b border-zinc-200 bg-white/95 backdrop-blur">
      <div className="page-shell flex h-16 items-center justify-between gap-4">
        <Link href="/" aria-label="Exam Intel home" className="text-[15px] font-semibold tracking-tight">Exam Intel</Link>
        <nav aria-label="Main navigation" className="hidden items-center gap-6 text-sm text-zinc-600 md:flex">
          <Link href="/" className={pathname === "/" ? "text-zinc-900 font-medium" : "hover:text-zinc-900"}>Predictor</Link>
          <Link href="/#how-it-works" className="hover:text-zinc-900">How it works</Link>
          <Link href="/#faqs" className="hover:text-zinc-900">FAQs</Link>
        </nav>
        {profile ? <button onClick={() => { void logout().catch(() => setError("Sign out failed. Please try again.")); }} className="text-sm font-medium text-zinc-600 hover:text-zinc-900">{profile.name} · Sign out</button> : <button onClick={() => setOpen(true)} className="text-sm font-medium text-zinc-600 hover:text-zinc-900">Sign in</button>}
      </div>
      {error && <p role="alert" className="page-shell pb-2 text-sm text-red-700">{error}</p>}
    </header>
    {open && <AuthModal open={open} onClose={() => setOpen(false)} />}
  </>;
}
