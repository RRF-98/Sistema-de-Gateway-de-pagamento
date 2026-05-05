"use client";

import { useState } from "react";
import Link from "next/link";

type PixResult = {
  transactionId?: string;
  pixCode?: string;
  qrCode?: string; // imagem em base64 ou data URI
  paymentLink?: string;
  status?: string;
  [key: string]: unknown;
};

export default function CheckoutPage() {
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [document, setDocument] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<PixResult | null>(null);

  // Usa QR Code direto da API quando disponível, senão gera imagem a partir do pixCode.
  const qrImageSrc = result
    ? result.qrCode
      ? result.qrCode.startsWith("data:")
        ? result.qrCode
        : `data:image/png;base64,${result.qrCode}`
      : result.pixCode
      ? `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(
          result.pixCode as string
        )}&size=300x300`
      : null
    : null;

  // Envia o formulário para a API e trata o resultado ou erro.
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const res = await fetch("/api/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, amount, document, description }),
      });

      let data: any;
      try {
        data = await res.json();
      } catch (e) {
        console.error("Erro ao parsear resposta:", e);
        setError("Erro ao processar resposta da API");
        setLoading(false);
        return;
      }

      if (!res.ok) {
        const errorMessage = data?.error?.message || data?.error || "Erro na API";
        setError(errorMessage);
        setLoading(false);
        return;
      }

      setResult(data);
    } catch (error) {
      console.error("Erro ao enviar requisição:", error);
      setError("Erro ao conectar com a API");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Navbar */}
      <nav className="border-b border-zinc-800 px-6 py-4 flex items-center justify-between">
        <div>
          <span className="text-xl font-bold text-[#eb3300]">Pay</span>
          <span className="text-xl font-bold text-white">Evo</span>
        </div>
        <Link href="/dashboard" className="text-sm text-zinc-400 hover:text-white transition-colors">
          ← Voltar
        </Link>
      </nav>

      <main className="max-w-2xl mx-auto px-6 py-10">
        <h1 className="text-2xl font-semibold text-white mb-2">Gerar Pagamento PIX</h1>
        <p className="text-zinc-500 text-sm mb-8">Preencha os dados para criar uma transação</p>

        {/* Formulário */}
        {!result && (
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm text-zinc-400 mb-1">Nome do comprador</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-[#eb3300] transition-colors"
                  placeholder="João da Silva"
                  required
                />
              </div>

              <div>
                <label className="block text-sm text-zinc-400 mb-1">Valor (R$)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400">R$</span>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg pl-10 pr-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-[#eb3300] transition-colors"
                    placeholder="10.00"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm text-zinc-400 mb-1">CPF (fictício para teste)</label>
                <input
                  type="text"
                  value={document}
                  onChange={(e) => setDocument(e.target.value)}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-[#eb3300] transition-colors"
                  placeholder="000.000.000-00"
                  required
                />
              </div>

              <div>
                <label className="block text-sm text-zinc-400 mb-1">Descrição</label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-[#eb3300] transition-colors"
                  placeholder="Pedido #123"
                  required
                />
              </div>

              {error && (
                <div className="text-sm text-red-400 bg-red-900/20 border border-red-900 rounded-lg px-4 py-3">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#eb3300] hover:bg-[#cc2b00] text-white font-semibold py-4 rounded-xl transition-colors disabled:opacity-50 mt-2"
              >
                {loading ? "Gerando PIX..." : "Gerar PIX"}
              </button>
            </form>
          </div>
        )}

        {/* Resultado */}
        {result && (
          <div className="space-y-6">
            <div className="bg-green-900/20 border border-green-700 rounded-2xl px-6 py-4 flex items-center gap-3">
              <span className="text-green-400 text-lg">✓</span>
              <span className="text-green-400 font-medium">Transação criada com sucesso!</span>
            </div>

            {/* QR Code */}
            {qrImageSrc ? (
              <div className="bg-white rounded-2xl p-6 flex flex-col items-center">
                <p className="text-black text-sm font-medium mb-4">Escaneie o QR Code</p>
                <img src={qrImageSrc} alt="QR Code PIX" className="w-56 h-56" />
              </div>
            ) : (
              <div className="bg-white rounded-2xl p-6 text-black">
                <p className="text-sm font-medium">QR Code não disponível.</p>
                {result.pixCode && (
                  <p className="text-xs text-zinc-500 mt-2">
                    O código PIX foi gerado corretamente, copie-o manualmente abaixo.
                  </p>
                )}
              </div>
            )}

            {/* Dados */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-3">
              {result.transactionId && (
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-500">Transaction ID</span>
                  <span className="text-white font-mono text-xs">{result.transactionId}</span>
                </div>
              )}
              {result.status && (
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-500">Status</span>
                  <span className="text-yellow-400">{result.status}</span>
                </div>
              )}
              {result.pixCode && (
                <div className="space-y-2">
                  <span className="text-zinc-500 text-sm">Pix Copia e Cola</span>
                  <div className="bg-zinc-800 rounded-lg p-3 flex items-center gap-3">
                    <code className="text-xs text-zinc-300 break-all flex-1">{result.pixCode}</code>
                    <button
                      onClick={() => navigator.clipboard.writeText(result.pixCode!)}
                      className="text-xs text-[#eb3300] hover:text-white transition-colors whitespace-nowrap"
                    >
                      Copiar
                    </button>
                  </div>
                </div>
              )}
              {result.paymentLink && (
                <div className="flex justify-between text-sm items-center">
                  <span className="text-zinc-500">Link de pagamento</span>
                  <a
                    href={result.paymentLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#eb3300] hover:underline text-xs"
                  >
                    Abrir →
                  </a>
                </div>
              )}
            </div>

            <button
              onClick={() => setResult(null)}
              className="w-full border border-zinc-700 text-zinc-300 py-3 rounded-xl hover:bg-zinc-800 transition-colors"
            >
              Nova transação
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
