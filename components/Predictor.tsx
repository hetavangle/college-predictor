"use client";

import { useRef, useState, type FormEvent } from "react";
import {
  RotateCcw,
  SlidersHorizontal,
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

const chanceLabels: Record<string, string> = {
  High: "High chance",
  Medium: "Medium chance",
  Low: "Low chance",
};

const courseBadgeColors: Record<Course, string> = {
  MBBS: "border-zinc-300 text-zinc-700",
  BDS: "border-zinc-300 text-zinc-700",
  BAMS: "border-zinc-300 text-zinc-700",
  BHMS: "border-zinc-300 text-zinc-700",
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

  // Refine filters
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
    <div className="grid items-start gap-6 lg:grid-cols-[320px_1fr]">
      <aside className="space-y-4 lg:sticky lg:top-24">
        <form onSubmit={submit} className="panel p-5">
          <h2 className="text-base font-semibold">Your details</h2>

          <fieldset className="mt-5">
            <legend className="mb-2 text-xs font-medium text-zinc-600">Predict using</legend>
            <div className="grid grid-cols-2 rounded-lg bg-zinc-100 p-1">
              {(["rank", "score"] as const).map((item) => (
                <label
                  key={item}
                  className={`cursor-pointer rounded-md px-2 py-2 text-center text-sm font-medium transition has-focus-visible:outline-2 has-focus-visible:outline-zinc-900 ${
                    mode === item ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-500"
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

          <label htmlFor="neet-value" className="mt-5 mb-2 block text-xs font-medium text-zinc-600">
            {mode === "rank" ? "All India Rank (AIR)" : "Expected NEET Score"}
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
            placeholder={mode === "rank" ? "e.g. 12000" : "e.g. 620"}
            className="field"
            aria-describedby="value-help"
          />
          <p id="value-help" className="mt-2 text-xs leading-5 text-zinc-500">
            {mode === "rank"
              ? "Use your overall All India Rank, not your category rank."
              : "Score out of 720. Converted into an illustrative AIR."}
          </p>

          <label htmlFor="category" className="mt-5 mb-2 block text-xs font-medium text-zinc-600">
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

          <label htmlFor="domicile" className="mt-5 mb-2 block text-xs font-medium text-zinc-600">
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

          <fieldset className="mt-5">
            <legend className="mb-2 text-xs font-medium text-zinc-600">Counselling quota</legend>
            <div className="grid grid-cols-2 gap-2">
              <label
                className={`cursor-pointer rounded-lg border p-3 text-left transition ${
                  quota === "State"
                    ? "border-zinc-900 bg-zinc-50"
                    : "border-zinc-200 hover:border-zinc-400"
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
                <span className="text-sm font-medium">State Quota</span>
                <p className="mt-1 text-xs text-zinc-500">85% · home-state seats</p>
              </label>

              <label
                className={`cursor-pointer rounded-lg border p-3 text-left transition ${
                  quota === "AIQ"
                    ? "border-zinc-900 bg-zinc-50"
                    : "border-zinc-200 hover:border-zinc-400"
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
                <span className="text-sm font-medium">All India (AIQ)</span>
                <p className="mt-1 text-xs text-zinc-500">15% · MCC and central institutes</p>
              </label>
            </div>
          </fieldset>

          <fieldset className="mt-5">
            <legend className="mb-2 text-xs font-medium text-zinc-600">Counselling round</legend>
            <div className="grid grid-cols-3 gap-1 rounded-lg bg-zinc-100 p-1">
              {(["Round 1", "Round 2", "Mop-Up / Stray"] as const).map((r) => (
                <label
                  key={r}
                  className={`cursor-pointer rounded-md px-2 py-2 text-center text-xs font-medium transition ${
                    round === r ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-500 hover:text-zinc-900"
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

          <button type="submit" className="primary-button mt-6 w-full">
            Show my colleges
          </button>
          <p className="mt-3 text-center text-xs text-zinc-500">
            No account needed. Runs entirely in your browser.
          </p>
        </form>

        <p className="px-1 text-xs leading-6 text-zinc-500">
          Cutoffs shift across rounds — Round 1 has the strictest thresholds, later rounds are broader.
        </p>
      </aside>

      <section ref={resultsRef} tabIndex={-1} aria-labelledby="results-heading" className="min-w-0 scroll-mt-24 focus:outline-none">
        {!submitted ? (
          <div className="panel flex min-h-[560px] flex-col items-center justify-center p-7 text-center">
            <h2 id="results-heading" className="text-xl font-semibold tracking-tight">
              {colleges.length} institutions to compare
            </h2>
            <p className="mt-3 max-w-md text-sm leading-7 text-zinc-600">
              Fill in your NEET details to simulate All India Quota (15%) or State Quota (85%) admission chances across
              counselling rounds for MBBS, BDS, BAMS and BHMS.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-2">
              {courses.map((c) => (
                <span key={c} className={`rounded-md border px-3 py-1.5 text-xs font-medium ${courseBadgeColors[c]}`}>
                  {c}
                </span>
              ))}
            </div>
          </div>
        ) : (
          <>
            <div className="mb-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 id="results-heading" className="text-xl font-semibold tracking-tight">
                  Your matches
                </h2>
                <div className="flex items-center gap-2 text-xs text-zinc-600">
                  <span>{submitted.quota === "AIQ" ? "15% AIQ (MCC)" : "85% State Quota"}</span>
                  <span aria-hidden="true">·</span>
                  <span>{submitted.round ?? "Round 1"}</span>
                </div>
              </div>
              <p className="mt-2 text-xs leading-6 text-zinc-500">
                {submitted.mode === "score" ? "Illustrative AIR" : "All India Rank"}{" "}
                <strong className="text-zinc-700">{formatNumber(getDemoRank(submitted))}</strong>
                <span className="mx-1">·</span> {submitted.category}
                <span className="mx-1">·</span> Domicile: <strong className="text-zinc-700">{submitted.state}</strong>
              </p>
              {changed && (
                <p role="status" className="mt-3 rounded-lg bg-zinc-100 p-3 text-xs text-zinc-700">
                  Your details changed. Click <strong>Show my colleges</strong> to recalculate.
                </p>
              )}
            </div>

            <div className="mb-5 rounded-2xl border border-zinc-200 p-5">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                <span className="flex items-center gap-2 text-sm font-semibold">
                  <SlidersHorizontal size={15} />
                  Refine
                </span>
                <button
                  onClick={resetFilters}
                  className="flex items-center gap-1 text-xs font-medium text-zinc-600 hover:text-zinc-900 hover:underline"
                >
                  <RotateCcw size={12} />
                  Reset filters
                </button>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <label htmlFor="course-filter" className="mb-1.5 block text-xs text-zinc-500">
                    Course
                  </label>
                  <select
                    id="course-filter"
                    value={course}
                    onChange={(event) => setCourse(event.target.value)}
                    className="field !py-2"
                  >
                    <option value="All">All courses</option>
                    {courses.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="college-type" className="mb-1.5 block text-xs text-zinc-500">
                    College type
                  </label>
                  <select
                    id="college-type"
                    value={type}
                    onChange={(event) => setType(event.target.value)}
                    className="field !py-2"
                  >
                    <option value="All">All types</option>
                    <option value="Government">Government</option>
                    <option value="Private">Private / Deemed</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="max-fees" className="mb-1.5 flex justify-between text-xs text-zinc-500">
                    Max annual tuition
                    <span className="font-medium text-zinc-700">{formatFees(maxFees)}</span>
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
                    className="mt-3 w-full accent-zinc-900"
                  />
                </div>
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-zinc-100 pt-3 text-xs">
                <span className="text-zinc-500">Admission chance:</span>
                <span className="text-zinc-700">High {highCount}</span>
                <span className="text-zinc-700">Medium {medCount}</span>
                <span className="text-zinc-700">Low {lowCount}</span>
              </div>
            </div>

            <p role="status" aria-live="polite" className="mb-3 text-xs text-zinc-500">
              Showing {matches.length} of {colleges.length} colleges
            </p>

            <div className="space-y-3">
              {matches.map((college) => (
                <article key={college.id} className="rounded-2xl border border-zinc-200 p-5">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`rounded border px-1.5 py-0.5 text-[10px] font-semibold ${courseBadgeColors[college.course]}`}>
                          {college.course}
                        </span>
                        {college.isCentralUniversity && (
                          <span className="rounded border border-zinc-300 px-1.5 py-0.5 text-[10px] text-zinc-600">Central institute</span>
                        )}
                        {college.nirfRank && (
                          <span className="rounded border border-zinc-300 px-1.5 py-0.5 text-[10px] text-zinc-600">NIRF #{college.nirfRank}</span>
                        )}
                        <span className="text-[10px] text-zinc-500 uppercase">{college.type}</span>
                      </div>
                      <h3 className="mt-1.5 text-[15px] font-semibold leading-6 text-zinc-900">
                        {college.name}
                      </h3>
                      <p className="mt-1 text-xs text-zinc-500">
                        {college.city}, {college.state} · {college.seats} seats
                      </p>
                    </div>

                    <span className="rounded-md border border-zinc-300 px-2 py-1 text-xs font-medium text-zinc-700">
                      {chanceLabels[college.chance]}
                    </span>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-3 rounded-lg bg-zinc-50 p-4 sm:grid-cols-4">
                    <div>
                      <p className="text-[10px] text-zinc-500 uppercase">Course</p>
                      <p className="mt-1 text-xs font-medium">{college.course}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-zinc-500 uppercase">Annual tuition</p>
                      <p className="mt-1 text-xs font-medium">{formatFees(college.fees)}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-zinc-500 uppercase">
                        Est. {submitted.round ?? "R1"} cutoff
                      </p>
                      <p className="mt-1 text-xs font-medium">AIR {formatNumber(college.adjustedClosingRank)}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-zinc-500 uppercase">Quota context</p>
                      <p className="mt-1 truncate text-xs font-medium" title={college.eligibilityNote}>
                        {college.eligibilityNote}
                      </p>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            {matches.length === 0 && (
              <div className="rounded-2xl border border-dashed border-zinc-300 p-10 text-center">
                <SlidersHorizontal className="mx-auto mb-4 text-zinc-400" />
                <h3 className="font-semibold">No matches with these filters</h3>
                <p className="mt-2 text-sm text-zinc-500">
                  Try broadening your course selection, increasing the tuition budget, or resetting filters.
                </p>
                <button
                  onClick={resetFilters}
                  className="mt-5 text-sm font-medium text-zinc-900 underline underline-offset-4"
                >
                  Reset filters
                </button>
              </div>
            )}

            <details className="mt-5 rounded-xl border border-zinc-200 p-4 text-xs leading-6 text-zinc-600">
              <summary className="cursor-pointer font-medium text-zinc-900">
                How AIQ, State Quota and counselling rounds are calculated
              </summary>
              <div className="mt-3 space-y-2">
                <p>
                  <strong>All India Quota (15% AIQ):</strong> Administered nationwide by MCC for 15% of seats in
                  state government medical colleges, 100% of seats in central institutes (AIIMS, JIPMER, AMU, BHU), and
                  Deemed Universities. Domicile state has no impact under AIQ.
                </p>
                <p>
                  <strong>State Quota (85%):</strong> Administered by individual state counseling authorities for
                  domiciled students. Candidates applying to colleges within their home state receive state reservation
                  benefits (+15% rank buffer). Non-domicile candidates can access private college management quota seats.
                </p>
                <p>
                  <strong>Counselling Progression:</strong> Round 1 reflects base initial closing ranks. Round 2 allows
                  an estimated 14% rank relaxation as students upgrade or vacate seats. Mop-Up and Stray rounds feature
                  the widest cutoff bands (~30% expansion).
                </p>
                <p>
                  <strong>Category Reservation:</strong> Indicative multipliers adjust thresholds (OBC: 1.2x, EWS:
                  1.15x, SC: 1.8x, ST: 2.2x). Figures are for counseling planning only; verify official MCC and state
                  allotment lists.
                </p>
              </div>
            </details>
          </>
        )}
      </section>
    </div>
  );
}
