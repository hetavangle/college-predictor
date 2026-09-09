import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Predictor } from "@/components/Predictor";
export const metadata: Metadata = { title: "NEET College Predictor | Exam Intel" };

export default function PredictorPage() {
  return <main id="main" className="min-h-[80dvh] pb-16"><div className="page-shell pt-8">
    <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-900"><ArrowLeft size={14} />Home</Link>
    <div className="my-8">
      <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">NEET College Predictor</h1>
      <p className="mt-2 text-sm text-zinc-600">Enter your rank or score to see illustrative admission chances across counselling quotas and rounds.</p>
    </div>
    <Predictor />
  </div></main>;
}
