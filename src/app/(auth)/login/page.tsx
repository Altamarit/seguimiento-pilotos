"use client";

import { useState } from "react";
import { loginOrCreate } from "@/lib/actions/auth-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [alias, setAlias] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const result = await loginOrCreate(email.trim(), alias.trim());

    if (!result.success || !result.actionLink) {
      setError(result.error ?? "Error al acceder. Inténtalo de nuevo.");
      setLoading(false);
      return;
    }

    // Redirigir al magic link de Supabase → él se encarga del callback
    window.location.href = result.actionLink;
  }

  return (
    <div className="w-full max-w-sm">
      <div className="bg-white rounded-xl border border-[#E4E7EC] shadow-card p-8">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-[#EFF4FF]">
            <span className="text-lg font-bold text-[#2563EB]">IA</span>
          </div>
          <h1 className="text-xl font-semibold text-[#101828]">Pilotos IA</h1>
          <p className="mt-1 text-sm text-[#667085]">Introduce tus datos para acceder</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="email">Usuario</Label>
            <Input
              id="email"
              type="text"
              placeholder="tu@empresa.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              autoFocus
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="alias">Alias</Label>
            <Input
              id="alias"
              type="text"
              placeholder="¿Cómo quieres que te llamemos?"
              value={alias}
              onChange={(e) => setAlias(e.target.value)}
              required
              autoComplete="nickname"
            />
          </div>

          {error && (
            <div className="rounded-md bg-[#FEF3F2] border border-[#FECDCA] px-3 py-2 text-sm text-[#DC2626]">
              {error}
            </div>
          )}

          <Button type="submit" disabled={loading} className="mt-2 w-full">
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
