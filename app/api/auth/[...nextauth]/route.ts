import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcrypt';
import { JWT } from 'next-auth/jwt';
import { Session, User } from 'next-auth';
import prisma from '../../../lib/prisma';

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        username: { label: 'Username', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) return null;

        const user = await prisma.user.findUnique({
          where: { username: credentials.username },
        });

        if (!user) return null;

        const isValidPassword = await bcrypt.compare(credentials.password, user.password);

        if (!isValidPassword) return null;

        return {
          id: user.id,
          username: user.username,
          name: user.username,
          role: user.role,
          hotelId: user.hotelId,
        };
      },
    }),
  ],
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: 'jwt' as const,
  },
  callbacks: {
    async jwt({ token, user }: { token: JWT; user: User & { hotelId?: string } }) {
      if (user) {
        token.role = user.role;
        token.hotelId = user.hotelId;
      }
      return token;
    },
    async session({ session, token }: { session: Session & { user: { hotelId?: string } }; token: JWT }) {
      session.user.role = token.role;
      session.user.hotelId = token.hotelId as string;
      return session;
    },
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };