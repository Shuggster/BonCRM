import { redirect } from "next/navigation";
import { getSession } from "../lib/session";
import LoginForm from "./components/LoginForm";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: 'Sign In - Lovable CRM',
    description: 'Sign in to your Lovable CRM account',
};

export default async function LoginPage() {
    const session = await getSession();
    
    // Redirect to dashboard if already authenticated
    if (session?.user) {
        redirect("/dashboard");
    }

    return (
        <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-gray-50">
            <LoginForm />
        </div>
    );
}
