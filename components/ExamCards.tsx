"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

export function ExamCards() {
  return <div className="mt-6 grid gap-4 md:grid-cols-2">
    <div className="flex flex-col rounded-2xl border border-zinc-200 bg-zinc-50 p-6 sm:p-7">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium tracking-wide text-zinc-500 uppercase">Engineering</span>
        <span className="rounded-full border border-zinc-300 px-2.5 py-0.5 text-xs text-zinc-500">Coming 2027</span>
      </div>
      <h3 className="mt-8 text-xl font-semibold tracking-tight">JEE College Predictor</h3>
      <p className="mt-1.5 text-sm text-zinc-500">The 2026 session is complete. The 2027 session opens after JEE results.</p>
    </div>
    <Link href="/predictor" className="group flex flex-col rounded-2xl bg-zinc-900 p-6 text-white sm:p-7">
      <span className="text-xs font-medium tracking-wide text-zinc-400 uppercase">Medical</span>
      <h3 className="mt-8 text-xl font-semibold tracking-tight">NEET College Predictor</h3>
      <p className="mt-1.5 text-sm text-zinc-400">Check MBBS, BDS and AYUSH admission chances by rank, category and state.</p>
      <span className="mt-8 inline-flex items-center gap-1.5 text-sm font-medium underline-offset-4 group-hover:underline">
        Open predictor <ArrowUpRight size={15} className="transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
      </span>
    </Link>
  </div>;
}
