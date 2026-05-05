"use client";

import { useEffect, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type Status = "pending" | "paid" | "expired";

type Transaction = {
  id: string;
  amount: number;
  description: string;
  status: Status;
  createdAt: string;
};

const STATUS_LABEL: Record<Status, string> = {
  pending: "Pendente",
  paid: "Pago",
  expired: "Expirado",
};

const STATUS_COLOR: Record<Status, string> = {
  pending: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  paid: "bg-green-500/20 text-green-400 border-green-500/30",
  expired: "bg-zinc-700 text-zinc-400 border-zinc-600",
};

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  const [showCreate, setShowCreate] = useState(false);
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [creating, setCreating] = useState(false);

  const [editTx, setEditTx] = useState<Transaction | null>(null);
  const [editStatus, setEditStatus] = useState<Status>("pending");
  const [editDesc, setEditDesc] = useState("");
  const [editAmount, setEditAmount] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  async function fetchTransactions() {
    try {
      const res = await fetch("/api/transactions");
      
      if (!res.ok) {
        if (res.status === 401) {
          router.push("/login");
          return;
        }
        console.error("Erro ao buscar transações:", res.status);
        setTransactions([]);
        return;
      }
      
      const data = await res.json();
      setTransactions(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Erro ao buscar transações:", error);
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (status === "authenticated") fetchTransactions();
  }, [status]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setCreating(true);

    const res = await fetch("/api/transactions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount, description }),
    });

    setCreating(false);
    if (res.ok) {
      setShowCreate(false);
      setAmount("");
      setDescription("");
      fetchTransactions();
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Confirma exclusão?")) return;
    await fetch(`/api/transactions/${id}`, { method: "DELETE" });
    fetchTransactions();
  }

  async function handleEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!editTx) return;

    await fetch(`/api/transactions/${editTx.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        amount: editAmount,
        description: editDesc,
        status: editStatus,
      }),
    });

    setEditTx(null);
    fetchTransactions();
  }

  function openEdit(tx: Transaction) {
    setEditTx(tx);
    setEditStatus(tx.status);
    setEditDesc(tx.description);
    setEditAmount(String(tx.amount));
  }

  if (status === "loading" || loading)
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-zinc-400">Carregando...</div>
      </div>
    );

  return (
    <div className="min-h-screen bg-black">
      <nav className="border-b border-zinc-800 px-6 py-4 flex items-center justify-between">
        <div>
          <span className="text-xl font-bold text-[#eb3300]">Pay</span>
          <span className="text-xl font-bold text-white">Evo</span>
        </div>
        <div className="flex items-center gap-4">
          <Link
            href="/checkout"
            className="text-sm text-zinc-400 hover:text-white transition-colors"
          >
            PIX
          </Link>
          <span className="text-sm text-zinc-500">{session?.user?.email}</span>
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="text-sm text-zinc-400 hover:text-red-400 transition-colors"
          >
            Sair
          </button>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold text-white">Transações</h1>
          <button
            onClick={() => setShowCreate(true)}
            className="bg-[#eb3300] hover:bg-[#cc2b00] text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
          >
            + Nova transação
          </button>
        </div>

        {transactions.length === 0 ? (
          <div className="text-center text-zinc-500 py-20">
            Nenhuma transação ainda.
          </div>
        ) : (
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-zinc-800 text-left">
                  <th className="px-6 py-4 text-xs text-zinc-500 uppercase tracking-wider">Descrição</th>
                  <th className="px-6 py-4 text-xs text-zinc-500 uppercase tracking-wider">Valor</th>
                  <th className="px-6 py-4 text-xs text-zinc-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-xs text-zinc-500 uppercase tracking-wider">Data</th>
                  <th className="px-6 py-4 text-xs text-zinc-500 uppercase tracking-wider">Ações</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((tx) => (
                  <tr key={tx.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/30">
                    <td className="px-6 py-4 text-white">{tx.description}</td>
                    <td className="px-6 py-4 text-white">
                      {tx.amount.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-xs border rounded-full px-3 py-1 ${STATUS_COLOR[tx.status]}`}>
                        {STATUS_LABEL[tx.status]}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-zinc-400 text-sm">
                      {new Date(tx.createdAt).toLocaleDateString("pt-BR")}
                    </td>
                    <td className="px-6 py-4 flex gap-3">
                      <button
                        onClick={() => openEdit(tx)}
                        className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDelete(tx.id)}
                        className="text-xs text-red-400 hover:text-red-300 transition-colors"
                      >
                        Excluir
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>

      {showCreate && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 px-4">
          <div className="bg-zinc-900 border border-zinc-700 rounded-2xl p-6 w-full max-w-md">
            <h2 className="text-lg font-semibold text-white mb-4">Nova transação</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm text-zinc-400 mb-1">Valor (R$)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#eb3300]"
                  required
                />
              </div>
              <div>
                <label className="block text-sm text-zinc-400 mb-1">Descrição</label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#eb3300]"
                  required
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreate(false)}
                  className="flex-1 border border-zinc-700 text-zinc-300 py-3 rounded-lg hover:bg-zinc-800 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="flex-1 bg-[#eb3300] text-white py-3 rounded-lg hover:bg-[#cc2b00] transition-colors disabled:opacity-50"
                >
                  {creating ? "Criando..." : "Criar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {editTx && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 px-4">
          <div className="bg-zinc-900 border border-zinc-700 rounded-2xl p-6 w-full max-w-md">
            <h2 className="text-lg font-semibold text-white mb-4">Editar transação</h2>
            <form onSubmit={handleEdit} className="space-y-4">
              <div>
                <label className="block text-sm text-zinc-400 mb-1">Valor (R$)</label>
                <input
                  type="number"
                  step="0.01"
                  value={editAmount}
                  onChange={(e) => setEditAmount(e.target.value)}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#eb3300]"
                />
              </div>
              <div>
                <label className="block text-sm text-zinc-400 mb-1">Descrição</label>
                <input
                  type="text"
                  value={editDesc}
                  onChange={(e) => setEditDesc(e.target.value)}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#eb3300]"
                />
              </div>
              <div>
                <label className="block text-sm text-zinc-400 mb-1">Status</label>
                <select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value as Status)}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#eb3300]"
                >
                  <option value="pending">Pendente</option>
                  <option value="paid">Pago</option>
                  <option value="expired">Expirado</option>
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setEditTx(null)}
                  className="flex-1 border border-zinc-700 text-zinc-300 py-3 rounded-lg hover:bg-zinc-800 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-[#eb3300] text-white py-3 rounded-lg hover:bg-[#cc2b00] transition-colors"
                >
                  Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
