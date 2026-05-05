import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const payload = await req.json();

    console.log("Webhook PayEvo recebido:", payload);

    // PayEvo envia um `metadata` que contém o transactionId
    const transactionId = payload.metadata;

    if (!transactionId) {
      return NextResponse.json(
        { error: "Metadata (transactionId) ausente" },
        { status: 400 }
      );
    }

    // Mapear status PayEvo para nosso status
    const statusMap: { [key: string]: "pending" | "paid" | "expired" } = {
      CREATED: "pending",
      PENDING: "pending",
      PAID: "paid",
      COMPLETED: "paid",
      APPROVED: "paid",
      EXPIRED: "expired",
      CANCELED: "expired",
      FAILED: "expired",
    };

    const newStatus = statusMap[payload.status] || "pending";

    // Atualizar transação no banco
    const transaction = await prisma.transaction.update({
      where: { id: transactionId },
      data: { status: newStatus },
    });

    console.log("Transação atualizada:", transaction);

    return NextResponse.json({
      success: true,
      transactionId,
      status: newStatus,
    });
  } catch (error) {
    console.error("Erro ao processar webhook PayEvo:", error);
    return NextResponse.json(
      { error: "Erro ao processar webhook" },
      { status: 500 }
    );
  }
}
