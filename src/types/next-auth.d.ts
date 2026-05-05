import NextAuth from "next-auth";

// Extende os tipos padrão do NextAuth para incluir `id` no user e session
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email?: string | null;
      name?: string | null;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
  }
}
