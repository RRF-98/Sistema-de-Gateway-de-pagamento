import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  const { email, password } = await req.json();

  if (!email || !password)
    return NextResponse.json({ error: "Campos obrigatórios" }, { status: 400 });

  if (password.length < 6)
    return NextResponse.json({ error: "Senha mínima: 6 caracteres" }, { status: 400 });

  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists)
    return NextResponse.json({ error: "Email já cadastrado" }, { status: 409 });

  const hashed = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: { email, password: hashed },
    select: { id: true, email: true, createdAt: true }, // nunca retorna hash
  });

  return NextResponse.json(user, { status: 201 });
}
