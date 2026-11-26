"use client";

import React, { useEffect, useState } from "react";
import {
  Mail,
  KeyRound,
  ArrowRight,
  Loader2,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  ShieldCheck,
} from "lucide-react";

export interface CustomerOtpLoginCardProps {
  initialEmail?: string;
  compact?: boolean;
  title?: string;
  subtitle?: string;
  onAuthenticated?: (session: { email: string; name?: string }) => void;
}

export function CustomerOtpLoginCard({
  initialEmail = "",
  compact = false,
  title = "Ingresá con tu correo",
  subtitle = "Te enviamos un código de 6 dígitos (sin contraseñas). Tu sesión queda guardada por 6 meses en este dispositivo.",
  onAuthenticated,
}: CustomerOtpLoginCardProps) {
  const [step, setStep] = useState<"email" | "code">("email");
  const [email, setEmail] = useState(initialEmail);
  const [code, setCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (initialEmail && step === "email" && initialEmail !== email) {
      setEmail(initialEmail);
    }
  }, [initialEmail, step, email]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((prev) => (prev > 1 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const requestOtpCode = async (targetEmail: string) => {
    const cleanEmail = targetEmail.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!cleanEmail || !emailRegex.test(cleanEmail)) {
      setError("Ingresá un correo electrónico válido.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setInfoMessage(null);

    try {
      const res = await fetch("/api/customer/auth/request-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: cleanEmail }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        if (typeof data.waitSeconds === "number" && data.waitSeconds > 0) {
          setCooldown(data.waitSeconds);
        }
        setError(data.error || "No pudimos enviar el código.");
        return;
      }

      setEmail(cleanEmail);
      setStep("code");
      setCooldown(45);
      setInfoMessage(`Enviamos un código de 6 dígitos a ${cleanEmail}. Revisá tu bandeja o spam.`);
    } catch {
      setError("Error de conexión al enviar el código.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRequestSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    await requestOtpCode(email);
  };

  const handleVerifySubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanCode = code.replace(/\D/g, "");
    if (cleanCode.length !== 6) {
      setError("Ingresá los 6 dígitos del código.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/customer/auth/verify-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          code: cleanCode,
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.success) {
        setError(data.error || "Código inválido o vencido.");
        return;
      }

      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("kamaluso-customer-auth-changed"));
      }

      if (onAuthenticated && data.session) {
        onAuthenticated(data.session);
      }
    } catch {
      setError("Error de conexión al verificar el código.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className={`bg-white border border-slate-200 shadow-sm ${
        compact ? "rounded-2xl p-4 space-y-3" : "rounded-3xl p-6 sm:p-8 space-y-5"
      }`}
    >
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center justify-center w-8 h-8 rounded-xl bg-pink-50 text-pink-600 border border-pink-100 shrink-0">
            {step === "email" ? <Mail className="w-4 h-4" /> : <KeyRound className="w-4 h-4" />}
          </span>
          <h3 className={`font-black text-slate-900 ${compact ? "text-sm" : "text-lg sm:text-xl"}`}>
            {title}
          </h3>
        </div>
        <p className={`text-slate-600 leading-relaxed ${compact ? "text-[11px]" : "text-xs sm:text-sm"}`}>
          {subtitle}
        </p>
      </div>

      {error && (
        <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-bold flex items-start gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {infoMessage && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-semibold flex items-start gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          <span>{infoMessage}</span>
        </div>
      )}

      {step === "email" ? (
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Correo electrónico de tus compras
            </label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (error) setError(null);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleRequestSubmit();
                  }
                }}
                placeholder="tuempresa@gmail.com"
                className="w-full px-3.5 py-2.5 pr-10 border border-slate-300 rounded-xl text-xs sm:text-sm font-medium bg-white text-slate-900 focus:ring-2 focus:ring-pink-500 focus:outline-none"
              />
              <Mail className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <button
            type="button"
            disabled={isLoading}
            onClick={() => handleRequestSubmit()}
            className="w-full py-3 px-4 bg-pink-600 hover:bg-pink-700 disabled:opacity-60 text-white font-extrabold rounded-xl text-xs sm:text-sm shadow-md shadow-pink-600/20 flex items-center justify-center gap-2 transition active:scale-98 cursor-pointer"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Enviando código...</span>
              </>
            ) : (
              <>
                <span>Enviar código de 6 dígitos</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-bold text-slate-700">
                Código de 6 dígitos enviado a{" "}
                <span className="text-pink-600">{email}</span>
              </label>
              <button
                type="button"
                onClick={() => {
                  setStep("email");
                  setCode("");
                  setError(null);
                  setInfoMessage(null);
                }}
                className="text-[11px] font-bold text-slate-500 hover:text-pink-600 underline"
              >
                Cambiar correo
              </button>
            </div>
            <input
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              autoFocus
              value={code}
              onChange={(e) => {
                const digits = e.target.value.replace(/\D/g, "").slice(0, 6);
                setCode(digits);
                if (error) setError(null);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleVerifySubmit();
                }
              }}
              placeholder="000000"
              className="w-full px-4 py-3 border-2 border-slate-300 focus:border-pink-500 rounded-xl text-center font-mono text-xl sm:text-2xl font-black tracking-[0.4em] bg-white text-slate-900 focus:outline-none"
            />
          </div>

          <button
            type="button"
            disabled={isLoading || code.length !== 6}
            onClick={() => handleVerifySubmit()}
            className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-extrabold rounded-xl text-xs sm:text-sm shadow-md flex items-center justify-center gap-2 transition active:scale-98 cursor-pointer"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Verificando...</span>
              </>
            ) : (
              <>
                <ShieldCheck className="w-4 h-4" />
                <span>Confirmar e Ingresar</span>
              </>
            )}
          </button>

          <div className="flex items-center justify-between pt-1 text-[11px] text-slate-500">
            <span>Válido por 15 minutos</span>
            <button
              type="button"
              disabled={cooldown > 0 || isLoading}
              onClick={() => requestOtpCode(email)}
              className="inline-flex items-center gap-1 font-bold text-pink-600 hover:text-pink-700 disabled:text-slate-400 disabled:cursor-not-allowed"
            >
              <RefreshCw className="w-3 h-3" />
              <span>
                {cooldown > 0 ? `Reenviar en ${cooldown}s` : "Reenviar código"}
              </span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
