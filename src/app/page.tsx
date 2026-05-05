import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function Home() {
  const session = await getServerSession(authOptions);
  // Redireciona baseado na sessão — sem renderizar nada
  if (session) redirect("/dashboard");
  redirect("/login");
}
