
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/db";
import bcrypt from "bcrypt";
import crypto from "crypto";

if (!process.env.NEXTAUTH_SECRET && process.env.NODE_ENV !== "production") {
  process.env.NEXTAUTH_SECRET = crypto.randomBytes(32).toString("hex");
  console.log("✅ NEXTAUTH_SECRET généré automatiquement (développement)");
}

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Mot de passe", type: "password" },
      },
      async authorize(credentials) {
        try {
          console.log("🔐 Tentative de connexion pour:", credentials?.email);
          
          if (!credentials?.email || !credentials?.password) {
            console.log("❌ Credentials manquants");
            throw new Error("Email et mot de passe requis");
          }

          const user = await prisma.user.findUnique({
            where: { email: credentials.email },
          });

          if (!user) {
            console.log("❌ Utilisateur non trouvé:", credentials.email);
            throw new Error("Email ou mot de passe invalide");
          }

          console.log("✅ Utilisateur trouvé:", user.email, "Role:", user.role);

          const isValid = await bcrypt.compare(
            credentials.password,
            user.password
          );

          if (!isValid) {
            console.log("❌ Mot de passe invalide pour:", credentials.email);
            throw new Error("Email ou mot de passe invalide");
          }

          console.log("✅ Authentification réussie pour:", user.email);

          return {
            id: user.id,
            email: user.email,
            first_name: user.first_name,
            last_name: user.last_name,
            role: user.role,
          };
        } catch (error) {
          console.error("❌ Erreur d'authentification:", error.message);
          throw error;
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 60 * 60 * 24 * 7, // 7 jours
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        console.log("🔑 JWT: Ajout des données utilisateur au token");
        token.id = user.id;
        token.role = user.role;
        token.first_name = user.first_name;
        token.last_name = user.last_name;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        console.log("📝 Session: Ajout des données du token à la session");
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.first_name = token.first_name;
        session.user.last_name = token.last_name;
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth/signin",
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === "development",
};

// Add this to prevent static optimization of this route
export const dynamic = 'force-dynamic';

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
