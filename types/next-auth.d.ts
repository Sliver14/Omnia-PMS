import NextAuth, { DefaultSession, DefaultUser } from "next-auth"
import { JWT } from "next-auth/jwt"

declare module "next-auth" {
  interface Session {
    user: {
      role: string;
      username: string; // Added username
    } & DefaultSession["user"]
  }

  interface User extends DefaultUser {
    role: string
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role: string
  }
}
