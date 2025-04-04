import NextAuth from "next-auth";
import { authConfig } from "../../../auth.config";
import Credentials from "next-auth/providers/credentials";
import { signInSchema } from "@/features/signin/schema";
import { getUserByEmail } from "../prisma/user";
import * as bcrypt from "bcrypt";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      async authorize(credentials) {
        const parsedCredentials = signInSchema.safeParse(credentials);

        if (!parsedCredentials.success) return null;

        const { email, password } = parsedCredentials.data;
        const user = await getUserByEmail(email);

        if (!user) return null;

        const passwordMatch = await bcrypt.compare(password, user.password);

        if (!passwordMatch) return null;

        return user;
      },
    }),
  ],
});
