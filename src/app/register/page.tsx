"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    // 1. Cadastra o usuário
    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (!res.ok) {
      let errorMessage = "Erro ao cadastrar";
      try {
        const data = await res.json();
        errorMessage = data.error || "Erro ao cadastrar";
      } catch (e) {
        // Se não conseguir parsear JSON, usa mensagem padrão
        console.error("Erro ao parsear resposta:", e);
      }
      setError(errorMessage);
      setLoading(false);
      return;
    }

    // 2. Loga automaticamente após cadastro
    await signIn("credentials", { email, password, redirect: false });
    router.push("/dashboard");
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <span className="text-3xl font-bold text-[#eb3300]">Pay</span>
          <span className="text-3xl font-bold text-white">Evo</span>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8">
          <h1 className="text-xl font-semibold text-white mb-6">Criar conta</h1>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm text-zinc-400 mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-[#eb3300] transition-colors"
                placeholder="seu@email.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm text-zinc-400 mb-1">Senha</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-[#eb3300] transition-colors"
                placeholder="mínimo 6 caracteres"
                minLength={6}
                required
              />
            </div>

            {error && (
              <p className="text-sm text-red-400 bg-red-900/20 border border-red-900 rounded-lg px-4 py-3">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#eb3300] hover:bg-[#cc2b00] text-white font-semibold py-3 rounded-lg transition-colors disabled:opacity-50"
            >
              {loading ? "Criando conta..." : "Criar conta"}
            </button>
          </form>

          <p className="text-center text-zinc-400 text-sm mt-6">
            Já tem conta?{" "}
            <Link href="/login" className="text-[#eb3300] hover:underline">
              Entrar
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
