"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AdminUser, removeLocalAdminUser, setLocalAdminUser } from "@/lib/auth";
import { ShieldCheck, Lock, Mail, AlertCircle, Eye, EyeOff, Loader2, LogIn } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);

  useEffect(() => {
    let active = true;

    fetch("/api/admin/auth/session", { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data: { authenticated?: boolean; user?: AdminUser | null } | null) => {
        if (!active) return;
        if (data?.authenticated && data?.user) {
          setLocalAdminUser(data.user);
          router.replace("/admin");
          return;
        }
        removeLocalAdminUser();
        setCheckingSession(false);
      })
      .catch(() => {
        if (!active) return;
        setCheckingSession(false);
      });

    return () => {
      active = false;
    };
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null);

    try {
      const res = await fetch("/api/admin/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          password,
        }),
      });

      const data = (await res.json().catch(() => null)) as {
        success?: boolean;
        user?: AdminUser;
        error?: string;
      } | null;

      if (!res.ok || !data?.success || !data?.user) {
        setErrorMessage(data?.error || "Credenciales inválidas.");
        setLoading(false);
        return;
      }

      setLocalAdminUser(data.user);
      router.push("/admin");
    } catch {
      setErrorMessage("Error de conexión al verificar credenciales.");
      setLoading(false);
    }
  };

  if (checkingSession) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="flex items-center gap-2.5 text-slate-300 text-sm font-semibold">
          <Loader2 className="w-5 h-5 animate-spin text-pink-500" />
          <span>Verificando sesión...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl border border-slate-800 space-y-6">
        <div className="text-center space-y-2">
          <div className="w-16 h-16 bg-pink-100 rounded-2xl flex items-center justify-center mx-auto text-pink-600 mb-4 shadow-inner">
            <ShieldCheck className="w-9 h-9" />
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Panel Administrador <span className="text-pink-600">Kamaluso</span>
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            Acceso exclusivo restringido a administradores autorizados.
          </p>
        </div>

        {errorMessage && (
          <div className="bg-red-50 text-red-700 p-4 rounded-xl text-xs font-medium border border-red-200 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>{errorMessage}</div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="admin-email"
              className="block text-xs font-bold text-slate-700 mb-1"
            >
              Correo de administrador
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                id="admin-email"
                type="email"
                required
                autoComplete="email"
                placeholder="tu-correo@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-pink-500"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="admin-password"
              className="block text-xs font-bold text-slate-700 mb-1"
            >
              Contraseña
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                id="admin-password"
                type={showPassword ? "text" : "password"}
                required
                autoComplete="current-password"
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-10 py-2.5 border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-pink-500"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition"
                aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-4 bg-slate-900 hover:bg-black disabled:opacity-60 text-white font-semibold rounded-xl shadow-lg flex items-center justify-center gap-2.5 transition-all duration-200 border border-slate-800 hover:scale-[1.01] cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Verificando acceso...</span>
              </>
            ) : (
              <>
                <LogIn className="w-4 h-4 text-pink-400" />
                <span>Ingresar al Panel</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
