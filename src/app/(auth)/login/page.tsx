"use client";

import { Suspense, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { loginOrCreate } from "@/lib/actions/auth-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";

const ERROR_MESSAGES: Record<string, string> = {
  usuario: "El usuario es obligatorio.",
  alias: "El alias no puede estar en blanco.",
  password_required: "La contraseña es obligatoria para este flujo.",
  bad_password: "No se ha podido acceder con esa contraseña.",
  auth: "Error de autenticación. Inténtalo de nuevo.",
};

function LoginForm() {
  const searchParams = useSearchParams();
  const [userIdentifier, setUserIdentifier] = useState("");
  const [alias, setAlias] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const err = searchParams.get("error");
    if (err) {
      try {
        setError(ERROR_MESSAGES[err] ?? decodeURIComponent(err));
      } catch {
        setError(ERROR_MESSAGES[err] ?? "Error al acceder.");
      }
    }
  }, [searchParams]);

  async function handleSubmit(e: React.FormEvent) {
    setError(null);
    if (password) {
      setLoading(true);
      return;
    }
    e.preventDefault();
    setLoading(true);

    const result = await loginOrCreate(userIdentifier, alias);

    if (!result.success) {
      setError(result.error ?? "Error al acceder. Inténtalo de nuevo.");
      setLoading(false);
      return;
    }

    window.location.href = result.actionLink ?? "/";
  }

  return (
    <div className="w-full max-w-sm">
      <div className="bg-white rounded-xl border border-[#E4E7EC] shadow-card p-8">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-[#0F4C81]">
            <span className="text-lg font-bold text-white">IA</span>
          </div>
          <h1 className="text-xl font-semibold text-[#101828]">Pilotos IA</h1>
          <p className="mt-1 text-sm text-[#667085]">Introduce tu usuario, alias y, si quieres, una contraseña</p>
        </div>

        <form
          action={password ? "/api/auth/login" : undefined}
          method="post"
          onSubmit={handleSubmit}
          className="flex flex-col gap-4"
        >
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="userIdentifier">Usuario</Label>
            <Input
              id="userIdentifier"
              name="userIdentifier"
              type="text"
              placeholder="usuario123"
              value={userIdentifier}
              onChange={(e) => setUserIdentifier(e.target.value)}
              required
              autoComplete="username"
              autoFocus
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="alias">Alias</Label>
            <Input
              id="alias"
              name="alias"
              type="text"
              placeholder="¿Cómo quieres que te llamemos?"
              value={alias}
              onChange={(e) => setAlias(e.target.value)}
              required
              autoComplete="nickname"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="password">Contraseña</Label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="Opcional"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
            />
            <p className="text-xs text-[#667085]">
              Si la dejas vacía, se mantendrá el acceso automático actual.
            </p>
          </div>

          {error && (
            <div className="rounded-md bg-[#FEF3F2] border border-[#FECDCA] px-3 py-2 text-sm text-[#DC2626]">
              {error}
            </div>
          )}

          <Button type="submit" disabled={loading} className="mt-2 w-full bg-[#0F4C81] hover:bg-[#0E3D6B]">
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Accediendo...
              </>
            ) : (
              "Acceder"
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="w-full max-w-sm animate-pulse rounded-xl border border-[#E4E7EC] bg-white p-8 shadow-card" />}>
      <LoginForm />
    </Suspense>
  );
}
