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
                try {
                    console.log('Starting authorization...');
                    
                    if (!credentials?.email || !credentials?.password) {
                        console.log('Missing credentials');
                        throw new Error("Missing credentials");
                    }

                    console.log('Getting user by email...');
                    const { user, error } = await getUserByEmail(credentials.email);
                    
                    if (error || !user) {
                        console.log('User not found or error:', error?.message);
                        throw new Error("Invalid email or password");
                    }

                    console.log('Getting password hash...');
                    const { data: userData, error: pwError } = await supabase
                        .from('users')
                        .select('password_hash')
                        .eq('id', user.id)
                        .single();

                    if (pwError || !userData?.password_hash) {
                        console.log('Password hash error:', pwError?.message);
                        throw new Error("Invalid user data");
                    }

                    console.log('Verifying password...');
                    const isValid = await verifyPassword(
                        credentials.password,
                        userData.password_hash
                    );

                    if (!isValid) {
                        console.log('Invalid password');
                        throw new Error("Invalid email or password");
                    }

                    console.log('Authorization successful');
                    return {
                        id: user.id,
                        email: user.email,
                        name: user.name,
                        role: user.role
                    };
                } catch (error) {
                    console.error('Auth error:', error);
                    throw error;
                }
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
    debug: true, // Enable debug mode
};
