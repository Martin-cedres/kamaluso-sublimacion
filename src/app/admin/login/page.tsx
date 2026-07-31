"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { ALLOWED_ADMIN_EMAILS, isAllowedAdminEmail, setLocalAdminUser, getLocalAdminUser } from "@/lib/auth";
import { supabase, isSupabaseConfigured } from "@/lib/supabase/client";
import { ShieldCheck, LogIn, Lock, AlertCircle } from "lucide-react";

export default function AdminLoginPage() {
  const router = Router();
  const [selectedEmail, setSelectedEmail] = useState(ALLOWED_ADMIN_EMAILS[0]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Si ya está autenticado, redirigir al Dashboard
    const user = getLocalAdminUser();
    if (user && isAllowedAdminEmail(user.email)) {
      router.push("/admin");
      return;
    }

    // Verificar si regresó de Google OAuth vía Supabase
    if (isSupabaseConfigured && supabase) {
      const client = supabase;
      client.auth.getSession().then(({ data: { session } }) => {
        if (session?.user?.email) {
          if (isAllowedAdminEmail(session.user.email)) {
            setLocalAdminUser({
              email: session.user.email,
              name: session.user.user_metadata?.full_name || session.user.email,
              avatarUrl: session.user.user_metadata?.avatar_url,
            });
            router.push("/admin");
          } else {
            setErrorMessage(
              `El correo ${session.user.email} no está registrado en la lista blanca de administradores.`
            );
            client.auth.signOut();
          }
        }
      });
    }

  }, [router]);

  const handleGoogleLogin = async () => {
    setLoading(true);
    setErrorMessage(null);

    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/admin`,
        },
      });
      if (error) {
        setErrorMessage("Error de conexión con Google OAuth: " + error.message);
        setLoading(false);
      }
    } else {
      // Modo Demo Local (Simula login con una de las 3 cuentas autorizadas)
      if (isAllowedAdminEmail(selectedEmail)) {
        setLocalAdminUser({
          email: selectedEmail,
          name: selectedEmail.split("@")[0],
        });
        router.push("/admin");
      } else {
        setErrorMessage("Este correo no tiene permisos de administración.");
        setLoading(false);
      }
    }
  };

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

        <div className="space-y-4">
          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full py-3.5 px-4 bg-slate-900 hover:bg-black text-white font-semibold rounded-xl shadow-lg flex items-center justify-center gap-3 transition-all duration-200 border border-slate-800 hover:scale-[1.01]"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
              />
              <path
                fill="#34A853"
                d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.24v3.15C3.26 21.37 7.37 24 12 24z"
              />
              <path
                fill="#FBBC05"
                d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.24C.45 8.15 0 9.99 0 12s.45 3.85 1.24 5.42l4.04-3.15z"
              />
              <path
                fill="#EA4335"
                d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.37 0 3.26 2.63 1.24 6.58l4.04 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
              />
            </svg>
            <span>Iniciar Sesión con Google</span>
          </button>
        </div>
      </div>
    </div>
  );
}

// Router helper wrapper
function Router() {
  return useRouter();
}
