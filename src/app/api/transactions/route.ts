import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const transactions = await prisma.transaction.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(transactions);
  } catch (error) {
    console.error("Erro ao buscar transações:", error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { amount, description } = await req.json();

    if (!amount || !description)
      return NextResponse.json({ error: "Valor e descrição são obrigatórios" }, { status: 400 });

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0)
      return NextResponse.json({ error: "Valor inválido" }, { status: 400 });

    const transaction = await prisma.transaction.create({
      data: {
        amount: parsedAmount,
        description,
        status: "pending",
        userId: session.user.id,
      },
    });

    return NextResponse.json(transaction);
  } catch (error) {
    console.error("Erro ao criar transação:", error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}
