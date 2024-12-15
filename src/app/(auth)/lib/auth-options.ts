import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { verifyPassword } from "./bcrypt";
import { getUserByEmail } from "./auth";
import { supabase } from "./supabase";

export const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { 
                    label: "Email", 
                    type: "email",
                    placeholder: "Enter your email" 
                },
                password: { 
                    label: "Password", 
                    type: "password",
                    placeholder: "Enter your password" 
                }
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    throw new Error("Missing credentials");
                }

                const { user, error } = await getUserByEmail(credentials.email);
                
                if (error || !user) {
                    throw new Error("Invalid email or password");
                }

                // Get password_hash from database
                const { data: userData } = await supabase
                    .from('users')
                    .select('password_hash')
                    .eq('id', user.id)
                    .single();

                if (!userData?.password_hash) {
                    throw new Error("Invalid user data");
                }

                const isValid = await verifyPassword(
                    credentials.password,
                    userData.password_hash
                );

                if (!isValid) {
                    throw new Error("Invalid email or password");
                }

                return {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    role: user.role
                };
            }
        })
    ],
    pages: {
        signIn: "/login",
        error: "/login",
    },
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
                token.email = user.email;
                token.role = user.role;
                token.name = user.name;
            }
            return token;
        },
        async session({ session, token }) {
            if (token) {
                session.user.id = token.id as string;
                session.user.role = token.role as string;
                session.user.email = token.email as string;
                session.user.name = token.name as string || null;
            }
            return session;
        }
    },
    session: {
        strategy: "jwt",
        maxAge: 24 * 60 * 60, // 24 hours
    },
    secret: process.env.NEXTAUTH_SECRET,
};
