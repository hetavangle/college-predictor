"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { AnimatePresence, m } from "framer-motion";
import { ArrowLeft, ArrowRight, Check, Phone, ShieldCheck, X } from "lucide-react";

function GoogleMark() {
  return <svg width="17" height="17" viewBox="0 0 48 48" aria-hidden="true"><path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z" /><path fill="#FF3D00" d="m6.306 14.691 6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z" /><path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.211 35.091 26.715 36 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z" /><path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z" /></svg>;
}
import { GoogleAuthProvider, RecaptchaVerifier, signInWithPhoneNumber, signInWithPopup, type ConfirmationResult } from "firebase/auth";
import { firebaseConfigured, getFirebaseAuth } from "@/lib/firebase";
import { useAuth } from "./Providers";

export function AuthModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const verifier = useRef<RecaptchaVerifier | null>(null);
  const confirmation = useRef<ConfirmationResult | null>(null);
  const generation = useRef(0);
  const [step, setStep] = useState<"choose" | "phone" | "otp" | "success">("choose");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [resendAt, setResendAt] = useState(0);
  const { setDemoProfile } = useAuth();

  useEffect(() => {
    if (!open) return;
    const element = dialog.current;
    element?.showModal();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      generation.current += 1;
      element?.close();
      document.body.style.overflow = previousOverflow;
      verifier.current?.clear();
      verifier.current = null;
    };
  }, [open]);

  function close() {
    generation.current += 1;
    setStep("choose"); setError(""); setBusy(false); setPhone(""); setOtp("");
    confirmation.current = null;
    onClose();
  }
  async function run(action: () => Promise<void>) {
    const current = generation.current;
    setBusy(true); setError("");
    try { await action(); } catch (err) {
      if (current === generation.current) {
        const code = (err as { code?: string }).code;
        const messages: Record<string, string> = {
          "auth/popup-closed-by-user": "Sign-in was cancelled. You can try again.",
          "auth/invalid-verification-code": "That code is incorrect. Please check it and try again.",
          "auth/code-expired": "Your code expired. Request a new one.",
          "auth/too-many-requests": "Too many attempts. Please wait before trying again.",
          "auth/invalid-phone-number": "Enter a valid phone number with country code, for example +919876543210.",
          "auth/unauthorized-domain": "This domain needs to be added to Firebase authorized domains.",
          "auth/operation-not-allowed": "Enable this sign-in provider in Firebase Authentication.",
        };
        setError(code ? messages[code] || "Sign-in could not be completed. Check your connection and Firebase settings, then try again." : (err as Error).message);
      }
    } finally { if (current === generation.current) setBusy(false); }
  }
  function google() {
    if (!firebaseConfigured) { setError("Google sign-in needs Firebase configuration. Use Phone Number to try the demo OTP flow."); return; }
    const current = generation.current;
    void run(async () => { await signInWithPopup(getFirebaseAuth(), new GoogleAuthProvider()); if (current === generation.current) setStep("success"); });
  }
  function sendOtp(event?: FormEvent) {
    event?.preventDefault();
    const normalized = phone.replace(/[\s()-]/g, "");
    if (!/^\+[1-9]\d{7,14}$/.test(normalized)) { setError("Include your country code, for example +919876543210."); return; }
    if (Date.now() < resendAt) { setError("Please wait 30 seconds between code requests."); return; }
    const current = generation.current;
    void run(async () => {
      if (firebaseConfigured) {
        verifier.current?.clear();
        verifier.current = new RecaptchaVerifier(getFirebaseAuth(), "recaptcha-container", { size: "invisible" });
        const result = await signInWithPhoneNumber(getFirebaseAuth(), normalized, verifier.current);
        if (current !== generation.current) return;
        confirmation.current = result;
      }
      if (current === generation.current) { setPhone(normalized); setResendAt(Date.now() + 30_000); setStep("otp"); }
    });
  }
  function verify(event: FormEvent) {
    event.preventDefault();
    if (!/^\d{6}$/.test(otp)) { setError("Enter the full 6-digit code."); return; }
    const current = generation.current;
    void run(async () => {
      if (firebaseConfigured) {
        if (!confirmation.current) throw new Error("Request a new code to continue.");
        await confirmation.current.confirm(otp);
      } else {
        if (otp !== "123456") throw new Error("Use 123456 for this demo. No SMS was sent.");
        setDemoProfile();
      }
      if (current === generation.current) setStep("success");
    });
  }

  return <dialog ref={dialog} aria-labelledby="auth-title" onCancel={(event) => { event.preventDefault(); close(); }} onClick={(event) => { if (event.target === event.currentTarget) { const box = event.currentTarget.getBoundingClientRect(); if (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom) close(); } }} className="w-[calc(100%-32px)] max-w-[400px] rounded-2xl border border-zinc-200 bg-white p-0 text-zinc-900 shadow-xl">
    <div className="relative p-6 sm:p-8"><button onClick={close} aria-label="Close sign in" className="absolute top-5 right-5 text-zinc-400 hover:text-zinc-900"><X size={18} /></button>
      <AnimatePresence mode="wait"><m.div key={step} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: .15 }}>
        <h2 id="auth-title" className="text-xl font-semibold tracking-tight">{step === "choose" ? "Sign in to Exam Intel" : step === "phone" ? "Sign in with phone" : step === "otp" ? "Enter the code" : "Signed in"}</h2>
        <p className="mt-2 text-sm leading-6 text-zinc-500">{step === "choose" ? "Optional — the predictor works without an account." : step === "phone" ? "Enter your phone number with its country code." : step === "otp" ? (firebaseConfigured ? `Enter the 6-digit code sent to ${phone}.` : "Demo mode: no SMS was sent. Enter 123456 to continue.") : firebaseConfigured ? "You're signed in." : "Demo sign-in complete. This session stays in memory and resets on refresh."}</p>
        {!firebaseConfigured && step !== "success" && <p className="mt-4 rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-xs leading-5 text-zinc-600">Demo authentication · Firebase is not configured.</p>}
        {step === "choose" && <div className="mt-6 space-y-2.5"><button disabled={busy} onClick={google} className="flex w-full items-center justify-center gap-2.5 rounded-lg border border-zinc-300 bg-white px-4 py-2.5 text-sm font-medium hover:bg-zinc-50"><GoogleMark />{busy ? "Opening Google…" : "Continue with Google"}</button><button onClick={() => { setStep("phone"); setError(""); }} disabled={busy} className="flex w-full items-center justify-center gap-2.5 rounded-lg border border-zinc-300 bg-white px-4 py-2.5 text-sm font-medium hover:bg-zinc-50"><Phone size={16} />Continue with phone number</button></div>}
        {step === "phone" && <form onSubmit={sendOtp} className="mt-6 space-y-4"><label className="block text-xs font-medium text-zinc-600" htmlFor="phone-number">Phone number</label><input autoFocus id="phone-number" type="tel" autoComplete="tel" required value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="+91 98765 43210" className="field" /><p className="text-xs leading-5 text-zinc-500">{firebaseConfigured ? "Firebase uses your phone number for authentication and abuse prevention. Standard SMS rates may apply." : "Use any valid phone format. Demo mode does not send or store your number."}</p><button disabled={busy} className="primary-button w-full">{busy ? "Sending code…" : "Send code"}<ArrowRight size={15} /></button></form>}
        {step === "otp" && <form onSubmit={verify} className="mt-6 space-y-4"><label htmlFor="otp-code" className="block text-xs font-medium text-zinc-600">6-digit verification code</label><input autoFocus id="otp-code" inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6}" required maxLength={6} value={otp} onChange={(event) => setOtp(event.target.value.replace(/\D/g, ""))} placeholder="000000" className="field text-center text-lg tracking-[.5em]" /><button disabled={busy} className="primary-button w-full">{busy ? "Verifying…" : "Verify and continue"}<ArrowRight size={15} /></button><button type="button" disabled={busy} onClick={() => sendOtp()} className="w-full py-1 text-xs font-medium text-zinc-600 hover:text-zinc-900">Resend code</button></form>}
        {step === "success" && <button onClick={close} className="primary-button mt-6 w-full"><Check size={16} />Continue</button>}
      </m.div></AnimatePresence>
      {error && <p role="alert" className="mt-4 rounded-lg bg-red-50 p-3 text-xs leading-5 text-red-700">{error}</p>}
      {(step === "phone" || step === "otp") && <button disabled={busy} onClick={() => { setStep(step === "otp" ? "phone" : "choose"); setError(""); setOtp(""); }} className="mt-5 flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-900"><ArrowLeft size={13} />Back</button>}
      <div id="recaptcha-container" />
      <div className="mt-6 flex items-center justify-center gap-1.5 border-t border-zinc-100 pt-5 text-[11px] text-zinc-500"><ShieldCheck size={13} />{firebaseConfigured ? "Secure sign-in with Firebase" : "The predictor also works without signing in"}</div>
    </div>
  </dialog>;
}
