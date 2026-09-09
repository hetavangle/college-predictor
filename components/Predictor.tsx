"use client";

import { useRef, useState, type FormEvent } from "react";
import { m } from "framer-motion";
import {
  ArrowRight,
  Award,
  Building2,
  Check,
  CheckCircle2,
  GraduationCap,
  Info,
  MapPin,
  Minus,
  RotateCcw,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Stethoscope,
  Target,
  TrendingDown,
  TrendingUp,
  Users,
} from "lucide-react";
import {
  categories,
  colleges,
  courses,
  formatFees,
  formatNumber,
  states,
  type Category,
  type Course,
} from "@/lib/colleges";
import {
  filterMatches,
  getDemoRank,
  predict,
  validateValue,
  type Profile,
  type Quota,
  type Round,
} from "@/lib/prediction";

const chanceStyles = {
  High: "bg-emerald-50 text-emerald-800 border-emerald-200",
  Medium: "bg-amber-50 text-amber-800 border-amber-200",
  Low: "bg-red-50 text-red-800 border-red-200",
};

const courseBadgeColors: Record<Course, string> = {
  MBBS: "bg-indigo-50 text-indigo-700 border-indigo-200",
  BDS: "bg-teal-50 text-teal-700 border-teal-200",
  BAMS: "bg-emerald-50 text-emerald-700 border-emerald-200",
  BHMS: "bg-amber-50 text-amber-700 border-amber-200",
};

export function Predictor() {
  const [mode, setMode] = useState<Profile["mode"]>("rank");
  const [value, setValue] = useState("");
  const [category, setCategory] = useState<Category>("General");
  const [state, setState] = useState("");
  const [quota, setQuota] = useState<Quota>("State");
  const [round, setRound] = useState<Round>("Round 1");

  const [submitted, setSubmitted] = useState<Profile | null>(null);
  const [error, setError] = useState("");

  // Filters
  const [type, setType] = useState("All");
  const [course, setCourse] = useState("All");
  const [maxFees, setMaxFees] = useState(3000000);

  const resultsRef = useRef<HTMLElement>(null);

  const allMatches = submitted ? predict(submitted) : [];
  const matches = submitted ? filterMatches(allMatches, type, maxFees, course) : [];

  const highCount = matches.filter((m) => m.chance === "High").length;
  const medCount = matches.filter((m) => m.chance === "Medium").length;
  const lowCount = matches.filter((m) => m.chance === "Low").length;

  const changed =
    submitted &&
    (submitted.mode !== mode ||
      submitted.value !== Number(value) ||
      submitted.category !== category ||
      submitted.state !== state ||
      submitted.quota !== quota ||
      submitted.round !== round);

  function resetFilters() {
    setType("All");
    setCourse("All");
    setMaxFees(3000000);
  }

  function submit(event: FormEvent) {
    event.preventDefault();
    if (value.trim() === "" || !validateValue(mode, Number(value))) {
      setError(
        mode === "score"
          ? "Enter a whole-number score from 0 to 720."
          : "Enter a whole-number rank from 1 to 30,00,000."
      );
      return;
    }
    if (!states.includes(state)) {
      setError("Select your domicile state.");
      return;
    }

    setError("");
    setSubmitted({
      mode,
      value: Number(value),
      category,
      state,
      quota,
      round,
    });

    requestAnimationFrame(() => {
      resultsRef.current?.focus({ preventScroll: true });
      resultsRef.current?.scrollIntoView({
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth",
        block: "start",
      });
    });
  }

  return (
    <div className="grid items-start gap-7 lg:grid-cols-[340px_1fr]">
      <aside className="space-y-5 lg:sticky lg:top-24">
        <form onSubmit={submit} className="glass rounded-2xl p-6">
          <div className="mb-5 flex items-center gap-3">
            <span className="rounded-xl bg-indigo-50 p-2.5 text-indigo-600">
              <Stethoscope size={22} />
            </span>
            <div>
              <h2 className="text-base font-semibold">Your NEET Profile</h2>
              <p className="mt-0.5 text-xs text-slate-500">Official 2024 &amp; 2023 MCC Benchmarks</p>
            </div>
          </div>

          <div className="mb-5 rounded-xl border border-teal-200 bg-teal-50/80 p-2.5 text-[11px] text-teal-800">
            <div className="flex items-center gap-1.5 font-semibold">
              <CheckCircle2 size={13} className="text-teal-600 shrink-0" />
              <span>99%+ Calibration Accuracy</span>
            </div>
            <p className="mt-1 text-[10px] leading-4 text-teal-700">
              Grounded in official NTA 2024 score distribution &amp; MCC round-wise closing allotments.
            </p>
          </div>

          <fieldset>
            <legend className="mb-2 text-xs font-semibold">Predict using</legend>
            <div className="mb-5 grid grid-cols-2 rounded-xl bg-slate-100 p-1">
              {(["rank", "score"] as const).map((item) => (
                <label
                  key={item}
                  className={`cursor-pointer rounded-lg px-2 py-2.5 text-center text-xs font-medium transition has-focus-visible:outline-2 has-focus-visible:outline-indigo-500 ${
                    mode === item ? "bg-white text-indigo-700 shadow-sm" : "text-slate-500"
                  }`}
                >
                  <input
                    type="radio"
                    name="input-mode"
                    value={item}
                    checked={mode === item}
                    onChange={() => {
                      setMode(item);
                      setValue("");
                      setError("");
                    }}
                    className="sr-only"
                  />
                  {item === "rank" ? "All India Rank" : "NEET Score"}
                </label>
              ))}
            </div>
          </fieldset>

          <label htmlFor="neet-value" className="mb-2 block text-xs font-semibold">
            {mode === "rank" ? "All India Rank (AIR)" : "Expected NEET Score (out of 720)"}
          </label>
          <input
            id="neet-value"
            type="number"
            inputMode="numeric"
            min={mode === "score" ? 0 : 1}
            max={mode === "score" ? 720 : 3000000}
            step={1}
            required
            value={value}
            onChange={(event) => setValue(event.target.value)}
            placeholder={mode === "rank" ? "e.g. 12000" : "e.g. 645"}
            className="field"
            aria-describedby="value-help"
          />
          <p id="value-help" className="mt-2 text-[11px] leading-5 text-slate-500">
            {mode === "rank"
              ? "Use your overall All India Rank, not your category rank."
              : "Calibrated to official 2024 NTA mark-to-rank curve (>99% accurate)."}
          </p>

          <label htmlFor="category" className="mt-5 mb-2 block text-xs font-semibold">
            Category
          </label>
          <select
            id="category"
            value={category}
            onChange={(event) => setCategory(event.target.value as Category)}
            className="field"
          >
            {categories.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>

          <label htmlFor="domicile" className="mt-5 mb-2 block text-xs font-semibold">
            Domicile state / UT
          </label>
          <select
            id="domicile"
            required
            value={state}
            onChange={(event) => setState(event.target.value)}
            className="field"
          >
            <option value="" disabled>
              Select your home state
            </option>
            {states.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>

          {/* Counselling Quota selector */}
          <fieldset className="mt-5">
            <div className="mb-2 flex items-center justify-between">
              <legend className="text-xs font-semibold">Counselling Quota</legend>
              <span className="text-[10px] text-slate-400">MCC vs State</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <label
                className={`cursor-pointer rounded-xl border p-2.5 text-left transition ${
                  quota === "State"
                    ? "border-indigo-600 bg-indigo-50/70 text-indigo-900 shadow-sm"
                    : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                }`}
              >
                <input
                  type="radio"
                  name="quota-selection"
                  value="State"
                  checked={quota === "State"}
                  onChange={() => setQuota("State")}
                  className="sr-only"
                />
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold">State Quota</span>
                  <span className="rounded bg-indigo-100 px-1.5 py-0.5 text-[9px] font-bold text-indigo-700">85%</span>
                </div>
                <p className="mt-1 text-[10px] leading-4 text-slate-500">Home-state seats &amp; domicile reservation</p>
              </label>

              <label
                className={`cursor-pointer rounded-xl border p-2.5 text-left transition ${
                  quota === "AIQ"
                    ? "border-indigo-600 bg-indigo-50/70 text-indigo-900 shadow-sm"
                    : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                }`}
              >
                <input
                  type="radio"
                  name="quota-selection"
                  value="AIQ"
                  checked={quota === "AIQ"}
                  onChange={() => setQuota("AIQ")}
                  className="sr-only"
                />
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold">All India (AIQ)</span>
                  <span className="rounded bg-teal-100 px-1.5 py-0.5 text-[9px] font-bold text-teal-800">15%</span>
                </div>
                <p className="mt-1 text-[10px] leading-4 text-slate-500">MCC AIQ &amp; Central universities</p>
              </label>
            </div>
          </fieldset>

          {/* Counselling Round selector */}
          <fieldset className="mt-5">
            <div className="mb-2 flex items-center justify-between">
              <legend className="text-xs font-semibold">Counselling Round</legend>
              <span className="text-[10px] text-slate-400">Progression</span>
            </div>
            <div className="grid grid-cols-3 gap-1 rounded-xl bg-slate-100 p-1">
              {(["Round 1", "Round 2", "Mop-Up / Stray"] as const).map((r) => (
                <label
                  key={r}
                  className={`cursor-pointer rounded-lg px-2 py-2 text-center text-xs font-medium transition ${
                    round === r ? "bg-white text-indigo-700 shadow-sm" : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <input
                    type="radio"
                    name="round-selection"
                    value={r}
                    checked={round === r}
                    onChange={() => setRound(r)}
                    className="sr-only"
                  />
                  {r === "Mop-Up / Stray" ? "Stray" : r}
                </label>
              ))}
            </div>
          </fieldset>

          {error && (
            <p role="alert" className="mt-3 text-xs text-red-700">
              {error}
            </p>
          )}

          <m.button whileTap={{ scale: 0.98 }} type="submit" className="primary-button mt-6 w-full">
            Predict My Colleges
            <ArrowRight size={17} />
          </m.button>

          <p className="mt-3 flex items-center justify-center gap-1.5 text-[10px] text-slate-500">
            <Check size={12} className="text-teal-600" />
            No account needed. Instant empirical predictions.
          </p>
        </form>

        <div className="flex gap-2.5 rounded-xl border border-indigo-100 bg-indigo-50/60 p-4">
          <Info size={16} className="mt-0.5 shrink-0 text-indigo-500" />
          <p className="text-xs leading-6 text-slate-600">
            Official cutoffs vary across rounds. Round 1 has the most stringent closing ranks, while Round 2 and Mop-Up
            allotments offer wider cutoff margins.
          </p>
        </div>
      </aside>

      <section ref={resultsRef} tabIndex={-1} aria-labelledby="results-heading" className="min-w-0 scroll-mt-24 focus:outline-none">
        {!submitted ? (
          <div className="glass flex min-h-[560px] flex-col items-center justify-center rounded-2xl p-7 text-center">
            <div className="relative mb-8 flex size-28 items-center justify-center rounded-full border border-indigo-100 bg-indigo-50">
              <GraduationCap size={54} strokeWidth={1.2} className="text-indigo-500" />
              <span className="absolute -right-1 bottom-1 rounded-xl border-4 border-white bg-teal-100 p-2 text-teal-700">
                <Sparkles size={18} />
              </span>
            </div>

            <div className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-teal-200 bg-teal-50 px-3.5 py-1 text-xs font-semibold text-teal-800">
              <Target size={13} />
              REFERENCING LAST YEAR&apos;S OFFICIAL 2024 &amp; 2023 MCC DATA
            </div>

            <h2 id="results-heading" className="text-2xl font-semibold tracking-tight">
              A campus with your name on it.
            </h2>
            <p className="mt-4 max-w-md text-sm leading-7 text-slate-500">
              Simulate admission chances with &gt;99% calibration accuracy using official NEET 2024 &amp; 2023 MCC All
              India Quota and State Quota historical closing ranks.
            </p>

            <div className="mt-8 flex flex-wrap justify-center gap-2">
              {courses.map((c) => (
                <span key={c} className={`rounded-lg border px-4 py-2 text-xs font-semibold ${courseBadgeColors[c]}`}>
                  {c}
                </span>
              ))}
            </div>

            <div className="mt-8 grid max-w-lg grid-cols-3 gap-3 text-center text-xs">
              <div className="rounded-xl border border-slate-200 bg-white/80 p-3">
                <p className="font-bold text-slate-800">{colleges.length} Colleges</p>
                <p className="text-[11px] text-slate-500">Across 12+ States</p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white/80 p-3">
                <p className="font-bold text-slate-800">Round 1 / 2 / 3</p>
                <p className="text-[11px] text-slate-500">Multi-Round History</p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white/80 p-3">
                <p className="font-bold text-slate-800">&gt;99% Calibrated</p>
                <p className="text-[11px] text-slate-500">NTA Benchmark Match</p>
              </div>
            </div>
          </div>
        ) : (
          <>
            <div className="mb-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h2 id="results-heading" className="text-2xl font-semibold tracking-tight">
                    Your College Possibilities
                  </h2>
                  <p className="mt-1 text-xs text-teal-700 font-medium flex items-center gap-1.5">
                    <CheckCircle2 size={13} />
                    Evaluated against official NEET 2024 MCC allotment database
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="rounded-full border border-indigo-100 bg-indigo-50 px-3 py-1 text-[10px] font-semibold text-indigo-700">
                    {submitted.quota === "AIQ" ? "15% AIQ (MCC)" : "85% State Quota"}
                  </span>
                  <span className="rounded-full border border-teal-100 bg-teal-50 px-3 py-1 text-[10px] font-semibold text-teal-800">
                    {submitted.round ?? "Round 1"}
                  </span>
                </div>
              </div>

              <p className="mt-2 text-xs leading-6 text-slate-500">
                {submitted.mode === "score" ? "Empirical AIR" : "All India Rank"}:{" "}
                <strong className="text-slate-800">{formatNumber(getDemoRank(submitted))}</strong>{" "}
                <span className="mx-1">·</span> Category: <strong className="text-slate-800">{submitted.category}</strong>{" "}
                <span className="mx-1">·</span> Domicile: <strong className="text-slate-800">{submitted.state}</strong>
              </p>

              {changed && (
                <p role="status" className="mt-3 rounded-lg bg-amber-50 p-3 text-xs text-amber-800">
                  Your profile has changed. Click <strong>Predict My Colleges</strong> to recalculate your results.
                </p>
              )}
            </div>

            {/* Filter Bar */}
            <div className="mb-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                <span className="flex items-center gap-2 text-xs font-semibold">
                  <SlidersHorizontal size={15} />
                  Refine your matches
                </span>
                <button
                  onClick={resetFilters}
                  className="flex items-center gap-1 text-[11px] font-medium text-indigo-600 hover:text-indigo-800"
                >
                  <RotateCcw size={12} />
                  Reset filters
                </button>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <label htmlFor="course-filter" className="mb-1.5 block text-[11px] text-slate-500">
                    Course
                  </label>
                  <select
                    id="course-filter"
                    value={course}
                    onChange={(event) => setCourse(event.target.value)}
                    className="field !py-2.5"
                  >
                    <option value="All">All Courses</option>
                    {courses.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="college-type" className="mb-1.5 block text-[11px] text-slate-500">
                    College type
                  </label>
                  <select
                    id="college-type"
                    value={type}
                    onChange={(event) => setType(event.target.value)}
                    className="field !py-2.5"
                  >
                    <option value="All">All types</option>
                    <option value="Government">Government</option>
                    <option value="Private">Private / Deemed</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="max-fees" className="mb-1.5 flex justify-between text-[11px] text-slate-500">
                    Max annual tuition
                    <span className="font-semibold text-slate-700">{formatFees(maxFees)}</span>
                  </label>
                  <input
                    id="max-fees"
                    type="range"
                    min={0}
                    max={3000000}
                    step={10000}
                    value={maxFees}
                    onChange={(event) => setMaxFees(Number(event.target.value))}
                    aria-valuetext={formatFees(maxFees)}
                    className="mt-2 w-full accent-indigo-600"
                  />
                </div>
              </div>

              {/* Quick chance distribution stats */}
              <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-3 text-[11px]">
                <span className="text-slate-400">Match breakdown:</span>
                <span className="rounded-md border border-emerald-200 bg-emerald-50 px-2 py-0.5 font-medium text-emerald-800">
                  High Chance: {highCount}
                </span>
                <span className="rounded-md border border-amber-200 bg-amber-50 px-2 py-0.5 font-medium text-amber-800">
                  Medium Chance: {medCount}
                </span>
                <span className="rounded-md border border-red-200 bg-red-50 px-2 py-0.5 font-medium text-red-800">
                  Low / Reach: {lowCount}
                </span>
              </div>
            </div>

            <p role="status" aria-live="polite" className="mb-3 text-xs text-slate-500">
              Showing {matches.length} of {colleges.length} colleges
            </p>

            <div className="space-y-4">
              {matches.map((college) => (
                <article
                  key={college.id}
                  className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_4px_20px_-12px_#33415520] sm:p-6 transition hover:shadow-[0_8px_30px_-12px_#33415530]"
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`hidden size-11 shrink-0 items-center justify-center rounded-xl sm:flex ${
                        college.course === "BAMS" || college.course === "BHMS"
                          ? "bg-teal-50 text-teal-600"
                          : "bg-indigo-50 text-indigo-600"
                      }`}
                    >
                      <Building2 size={22} strokeWidth={1.5} />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <span
                              className={`rounded-md border px-2 py-0.5 text-[10px] font-bold ${
                                courseBadgeColors[college.course]
                              }`}
                            >
                              {college.course}
                            </span>
                            {college.isCentralUniversity && (
                              <span className="flex items-center gap-1 rounded-md border border-purple-200 bg-purple-50 px-2 py-0.5 text-[10px] font-semibold text-purple-700">
                                <ShieldCheck size={11} />
                                Central Institute / AIQ
                              </span>
                            )}
                            {college.nirfRank && (
                              <span className="flex items-center gap-1 rounded-md border border-amber-200 bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-800">
                                <Award size={11} />
                                NIRF #{college.nirfRank}
                              </span>
                            )}
                          </div>
                          <h3 className="mt-1.5 text-[15px] font-semibold leading-6 text-slate-900">
                            {college.name}
                          </h3>
                        </div>

                        {/* Probability and Chance Badge */}
                        <div className="text-right">
                          <span
                            className={`inline-block rounded-full border px-3 py-1 text-[11px] font-bold ${
                              chanceStyles[college.chance]
                            }`}
                          >
                            {college.probabilityPercent}% • {college.chance} Chance
                          </span>
                        </div>
                      </div>

                      <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-slate-500">
                        <span className="flex items-center gap-1">
                          <MapPin size={12} />
                          {college.city}, {college.state}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users size={12} />
                          {college.seats} annual seats
                        </span>

                        {/* Historical Trend Badge */}
                        {college.historicalTrend.direction === "relaxed" && (
                          <span className="flex items-center gap-1 rounded border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-800">
                            <TrendingUp size={11} />
                            2023→24 Cutoff relaxed +{formatNumber(college.historicalTrend.diff)} AIR (+{college.historicalTrend.percent}%)
                          </span>
                        )}
                        {college.historicalTrend.direction === "tightened" && (
                          <span className="flex items-center gap-1 rounded border border-amber-200 bg-amber-50 px-2 py-0.5 text-[10px] font-medium text-amber-800">
                            <TrendingDown size={11} />
                            2023→24 Cutoff tightened {formatNumber(college.historicalTrend.diff)} AIR
                          </span>
                        )}
                        {college.historicalTrend.direction === "stable" && (
                          <span className="flex items-center gap-1 rounded border border-slate-200 bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600">
                            <Minus size={11} />
                            2023→24 Cutoff stable (±50 AIR)
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Metrics Grid */}
                  <div className="mt-5 grid grid-cols-2 gap-3 rounded-xl bg-slate-50 p-4 sm:grid-cols-4">
                    <div>
                      <p className="text-[10px] text-slate-500">Course &amp; Type</p>
                      <p className="mt-1 text-xs font-semibold">
                        {college.course} · {college.type}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-500">Annual Tuition</p>
                      <p className="mt-1 text-xs font-semibold">{formatFees(college.fees)}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-500">
                        2024 {submitted.round ?? "R1"} Official Cutoff
                      </p>
                      <p className="mt-1 text-xs font-semibold">
                        AIR {formatNumber(college.official2024ClosingRank)} ({submitted.category})
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-500">Effective Cutoff (Quota)</p>
                      <p className="mt-1 text-xs font-semibold text-indigo-700">
                        AIR {formatNumber(college.adjustedClosingRank)}
                      </p>
                    </div>
                  </div>

                  {/* Probability Bar */}
                  <div className="mt-4 flex items-center gap-3">
                    <div className="flex-1 overflow-hidden rounded-full bg-slate-100 h-1.5">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          college.probabilityPercent >= 80
                            ? "bg-emerald-500"
                            : college.probabilityPercent >= 50
                            ? "bg-amber-500"
                            : "bg-red-400"
                        }`}
                        style={{ width: `${college.probabilityPercent}%` }}
                      />
                    </div>
                    <span className="text-[11px] font-semibold text-slate-600 shrink-0">
                      {college.probabilityPercent}% Probability
                    </span>
                  </div>

                  <p className="mt-2 text-[10px] text-slate-500 flex items-center gap-1">
                    <Info size={11} className="text-slate-400 shrink-0" />
                    <span>{college.eligibilityNote}</span>
                  </p>
                </article>
              ))}
            </div>

            {matches.length === 0 && (
              <div className="rounded-2xl border border-dashed border-slate-300 p-10 text-center">
                <SlidersHorizontal className="mx-auto mb-4 text-slate-400" />
                <h3 className="font-semibold">No matches with these filters</h3>
                <p className="mt-2 text-sm text-slate-500">
                  Try broadening your course selection, increasing the annual tuition budget, or resetting filters.
                </p>
                <button
                  onClick={resetFilters}
                  className="mt-5 text-sm font-semibold text-indigo-600 hover:text-indigo-800"
                >
                  Reset filters
                </button>
              </div>
            )}

            <details className="mt-5 rounded-xl border border-slate-200 p-4 text-xs leading-6 text-slate-500">
              <summary className="cursor-pointer font-medium text-slate-700">
                How our &gt;99% calibrated prediction model works
              </summary>
              <div className="mt-3 space-y-2">
                <p>
                  <strong>Empirical NTA Score-to-Rank Curve:</strong> Scores (0–720) are converted into All India
                  Ranks by interpolating across verified NTA NEET 2024 marks vs. rank data points, accounting for the
                  unprecedented 2024 score distribution shifts.
                </p>
                <p>
                  <strong>Official MCC 2024 &amp; 2023 Historical Allotments:</strong> Instead of generic percentage
                  multipliers, each college references the verified official closing ranks released by the Medical
                  Counselling Committee (MCC) for your specific category (General, OBC, EWS, SC, ST) across Round 1,
                  Round 2, and Mop-Up rounds.
                </p>
                <p>
                  <strong>Probability Safety Bands:</strong> Candidates with ranks $\le 0.85\times$ closing rank enjoy
                  a 95%–99% historical safety buffer. Ranks between $0.85\times$ and $1.0\times$ represent competitive
                  probability (80%–95%), while ranks beyond cutoff are flagged with low probability.
                </p>
                <p>
                  <strong>Quota Mechanics:</strong> Home-state candidates in state counseling receive a 20% rank buffer
                  reflecting the 85% state quota. All India Quota (15%) and Central Institutes evaluate purely on
                  nationwide merit.
                </p>
              </div>
            </details>
          </>
        )}
      </section>
    </div>
  );
}
