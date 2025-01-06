import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { verifyPassword } from "./bcrypt";
import { createClient } from "@supabase/supabase-js";
import fs from 'fs';
import path from 'path';

// Debug logging function
const logToFile = (message: string) => {
    const logPath = path.join(process.cwd(), 'auth-debug.log');
    fs.appendFileSync(logPath, `${new Date().toISOString()}: ${message}\n`);
};

// Initialize Supabase client for database operations only
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY! // Use service role key for auth
);

logToFile(`Starting auth service with URL: ${process.env.NEXT_PUBLIC_SUPABASE_URL}`);
logToFile(`Auth Secret exists: ${!!process.env.NEXTAUTH_SECRET}`);

export const authOptions: NextAuthOptions = {
    debug: true,
    providers: [
        CredentialsProvider({
            id: "credentials",
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                logToFile('Starting authorization...');
                
                if (!credentials?.email || !credentials?.password) {
                    logToFile('Missing credentials');
                    throw new Error("Missing credentials");
                }

                logToFile(`Attempting login for email: ${credentials.email}`);

                try {
                    // Fetch user from database
                    const { data: user, error } = await supabase
                        .from("users")
                        .select("id, email, password_hash, name, role")
                        .eq("email", credentials.email)
                        .single();

                    logToFile(`Database response: ${JSON.stringify({ 
                        hasUser: !!user, 
                        error: error?.message 
                    })}`);

                    if (error || !user) {
                        logToFile(`No user found or error: ${error?.message}`);
                        throw new Error("No user found");
                    }

                    if (!user.password_hash) {
                        logToFile('User has no password hash');
                        throw new Error("Invalid user data");
                    }

                    // Verify password
                    const isValid = await verifyPassword(
                        credentials.password,
                        user.password_hash
                    );

                    logToFile(`Password verification result: ${isValid}`);

                    if (!isValid) {
                        logToFile('Invalid password');
                        throw new Error("Invalid credentials");
                    }

                    logToFile('Authorization successful');

                    // Return user object (will be encoded in the JWT)
                    return {
                        id: user.id,
                        email: user.email,
                        name: user.name,
                        role: user.role
                    };
                } catch (error) {
                    logToFile(`Authorization error: ${error instanceof Error ? error.message : 'Unknown error'}`);
                    throw error;
                }
            }
        })
    ],
    pages: {
        signIn: "/login",
        error: "/login",
    },
    session: {
        strategy: "jwt",
        maxAge: 30 * 24 * 60 * 60, // 30 days
    },
    callbacks: {
        async jwt({ token, user }) {
            logToFile('JWT Callback started');
            if (user) {
                token.id = user.id;
                token.email = user.email;
                token.role = user.role;
                logToFile('JWT updated with user data');
            }
            return token;
        },
        async session({ session, token }) {
            logToFile('Session Callback started');
            if (token) {
                session.user.id = token.id as string;
                session.user.role = token.role as string;
                logToFile('Session updated with token data');
            }
            return session;
        }
    },
    secret: process.env.NEXTAUTH_SECRET,
}; 