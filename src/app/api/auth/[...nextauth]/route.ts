import NextAuth from "next-auth";
import SpotifyProvider from "next-auth/providers/spotify";
import type { NextAuthOptions } from "next-auth";

const authOptions: NextAuthOptions = {
  providers: [
    SpotifyProvider({
      clientId: process.env.SPOTIFY_CLIENT_ID!,
      clientSecret: process.env.SPOTIFY_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: "user-read-email user-library-read user-read-private",
        },
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, account}) {
      if (account) {
        token.accessToken = account.access_token;
        token.refreshToken = account.refresh_token;
        token.expiresAt = account.expires_at;
      }
      return token;
    },
    async session({ session, token }) {
      (session as unknown as Record<string, unknown>).accessToken = token.accessToken;
      (session as unknown as Record<string, unknown>).refreshToken = token.refreshToken;
      (session as unknown as Record<string, unknown>).expiresAt = token.expiresAt;
      return session;
    },
  },
  pages: {
    signIn: "/music/transfer", // Redirige vers la page de transfert pour la connexion
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST }; 