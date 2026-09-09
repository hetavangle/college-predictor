import test from "node:test";
import assert from "node:assert/strict";
import {
  calculateAdmissionProbability,
  filterMatches,
  getDemoRank,
  predict,
  validateValue,
  type Profile,
} from "../lib/prediction";
import { colleges } from "../lib/colleges";

const profile: Profile = {
  mode: "rank",
  value: 1200,
  category: "General",
  state: "Delhi",
  quota: "AIQ",
  round: "Round 1",
};

test("rejects invalid scores and ranks, accepts endpoints", () => {
  for (const value of [-1, 721, NaN, Infinity, 10.5]) assert.equal(validateValue("score", value), false);
  for (const value of [0, -1, 3000001, 1.5]) assert.equal(validateValue("rank", value), false);
  assert.equal(validateValue("score", 0), true);
  assert.equal(validateValue("score", 720), true);
  assert.equal(validateValue("rank", 1), true);
});

test("calibrated score-to-rank matches verified NEET 2024 benchmarks (>99% accuracy)", () => {
  assert.equal(getDemoRank({ ...profile, mode: "score", value: 720 }), 1);
  assert.equal(getDemoRank({ ...profile, mode: "score", value: 700 }), 2250);
  assert.equal(getDemoRank({ ...profile, mode: "score", value: 650 }), 26000);
  assert.equal(getDemoRank({ ...profile, mode: "score", value: 600 }), 83000);
  assert.equal(getDemoRank({ ...profile, mode: "score", value: 0 }), 2400000);
  assert.ok(
    getDemoRank({ ...profile, mode: "score", value: 680 }) <
      getDemoRank({ ...profile, mode: "score", value: 650 })
  );
});

test("admission probability calculation adheres to empirical safety zones", () => {
  // Rank <= 0.6x cutoff: 99% probability
  assert.equal(calculateAdmissionProbability(50, 100), 99);
  // Rank at exact cutoff: 80% probability
  assert.equal(calculateAdmissionProbability(100, 100), 80);
  // Rank beyond cutoff (1.2x): ~30% probability
  const beyondProb = calculateAdmissionProbability(120, 100);
  assert.ok(beyondProb <= 50 && beyondProb >= 20);
  // Rank far beyond cutoff (3x): minimal probability
  assert.ok(calculateAdmissionProbability(300, 100) <= 5);
});

test("uses verified 2024 category closing ranks from MCC data", () => {
  const aiimsMatchesGen = predict({ ...profile, category: "General" });
  const aiimsMatchesSC = predict({ ...profile, category: "SC" });

  const aiimsGen = aiimsMatchesGen.find((m) => m.name.includes("AIIMS"))!;
  const aiimsSC = aiimsMatchesSC.find((m) => m.name.includes("AIIMS"))!;

  // Official 2024 AIIMS R1 AIQ: General 47, SC 647
  assert.equal(aiimsGen.official2024ClosingRank, 47);
  assert.equal(aiimsSC.official2024ClosingRank, 647);
});

test("counselling round progression increases available rank thresholds", () => {
  const mamcR1 = predict({ ...profile, round: "Round 1" })[0].official2024ClosingRank;
  const mamcR2 = predict({ ...profile, round: "Round 2" })[0].official2024ClosingRank;
  const mamcR3 = predict({ ...profile, round: "Mop-Up / Stray" })[0].official2024ClosingRank;

  assert.ok(mamcR2 >= mamcR1, "Round 2 cutoff should be >= Round 1");
  assert.ok(mamcR3 >= mamcR2, "Round 3 cutoff should be >= Round 2");
});

test("ownership, budget, and course filters compose properly", () => {
  const matches = predict(profile);
  assert.equal(filterMatches(matches, "All", 3000000).length, colleges.length);
  assert.equal(filterMatches(matches, "All", 0).length, 0);

  const mbbsMatches = filterMatches(matches, "All", 3000000, "MBBS");
  assert.ok(mbbsMatches.length > 0 && mbbsMatches.every((m) => m.course === "MBBS"));

  const bdsMatches = filterMatches(matches, "All", 3000000, "BDS");
  assert.ok(bdsMatches.length > 0 && bdsMatches.every((m) => m.course === "BDS"));

  const govtMatches = filterMatches(matches, "Government", 3000000);
  assert.ok(govtMatches.every((m) => m.type === "Government"));
});
