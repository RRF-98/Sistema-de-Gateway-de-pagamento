"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      setError("Email ou senha incorretos");
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <span className="text-3xl font-bold text-[#eb3300]">Pay</span>
          <span className="text-3xl font-bold text-white">Evo</span>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8">
          <h1 className="text-xl font-semibold text-white mb-6">Entrar na conta</h1>

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
                placeholder="••••••••"
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
              className="w-full bg-[#eb3300] hover:bg-[#cc2b00] text-white font-semibold py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Entrando..." : "Entrar"}
            </button>
          </form>

          <p className="text-center text-zinc-400 text-sm mt-6">
            Não tem conta?{" "}
            <Link href="/register" className="text-[#eb3300] hover:underline">
              Cadastrar-se
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
