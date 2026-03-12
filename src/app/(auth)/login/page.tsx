"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, CheckCircle2 } from "lucide-react";

type Mode = "login" | "register";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [registerSuccess, setRegisterSuccess] = useState(false);

  function switchMode(next: Mode) {
    setMode(next);
    setError(null);
    setPassword("");
    setConfirmPassword("");
    setRegisterSuccess(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (mode === "register") {
      if (password !== confirmPassword) {
        setError("Las contraseñas no coinciden.");
        return;
      }
      if (password.length < 6) {
        setError("La contraseña debe tener al menos 6 caracteres.");
        return;
      }
    }

    setLoading(true);
    const supabase = createClient();

    if (mode === "login") {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setError("Email o contraseña incorrectos. Inténtalo de nuevo.");
        setLoading(false);
        return;
      }
      router.push("/");
      router.refresh();
    } else {
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) {
        if (error.message?.toLowerCase().includes("already registered")) {
          setError("Ya existe una cuenta con este email. Accede con tu contraseña.");
        } else {
          setError(error.message);
        }
        setLoading(false);
        return;
      }

      // Si la sesión se crea directamente (email confirm desactivado), redirigir
      if (data.session) {
        router.push("/");
        router.refresh();
        return;
      }

      // Si requiere confirmación por email
      setRegisterSuccess(true);
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-sm">
      <div className="bg-white rounded-xl border border-[#E4E7EC] shadow-card p-8">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-[#EFF4FF]">
            <span className="text-lg font-bold text-[#2563EB]">IA</span>
          </div>
          <h1 className="text-xl font-semibold text-[#101828]">Pilotos IA</h1>
          <p className="mt-1 text-sm text-[#667085]">
            {mode === "login" ? "Accede a tu dashboard" : "Crea tu cuenta"}
          </p>
        </div>

        {/* Selector de modo */}
        <div className="mb-6 flex rounded-lg border border-[#E4E7EC] p-0.5 bg-[#F9FAFB]">
          <button
            type="button"
            onClick={() => switchMode("login")}
            className={`flex-1 rounded-md py-1.5 text-sm font-medium transition-colors ${
              mode === "login"
                ? "bg-white text-[#101828] shadow-sm"
                : "text-[#667085] hover:text-[#101828]"
            }`}
          >
            Acceder
          </button>
          <button
            type="button"
            onClick={() => switchMode("register")}
            className={`flex-1 rounded-md py-1.5 text-sm font-medium transition-colors ${
              mode === "register"
                ? "bg-white text-[#101828] shadow-sm"
                : "text-[#667085] hover:text-[#101828]"
            }`}
          >
            Registrarse
          </button>
        </div>

        {registerSuccess ? (
          <div className="flex flex-col items-center gap-3 py-4 text-center">
            <CheckCircle2 className="h-10 w-10 text-[#16A34A]" />
            <p className="font-medium text-[#101828]">¡Cuenta creada!</p>
            <p className="text-sm text-[#667085]">
              Revisa tu email para confirmar tu cuenta y poder acceder.
            </p>
            <button
              type="button"
              onClick={() => switchMode("login")}
              className="mt-2 text-sm font-medium text-[#2563EB] hover:underline"
            >
              Volver al acceso
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="tu@empresa.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete={mode === "login" ? "current-password" : "new-password"}
                minLength={mode === "register" ? 6 : undefined}
              />
            </div>

            {mode === "register" && (
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="confirmPassword">Confirmar contraseña</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  autoComplete="new-password"
                />
              </div>
            )}

            {error && (
              <div className="rounded-md bg-[#FEF3F2] border border-[#FECDCA] px-3 py-2 text-sm text-[#DC2626]">
                {error}
              </div>
            )}

            <Button type="submit" disabled={loading} className="mt-2 w-full">
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {mode === "login" ? "Accediendo..." : "Creando cuenta..."}
                </>
              ) : mode === "login" ? (
                "Acceder"
              ) : (
                "Crear cuenta"
              )}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
