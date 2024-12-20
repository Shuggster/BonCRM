import { getServerSession } from "next-auth";
import { authOptions } from "./auth-options";

export async function getSession() {
    return await getServerSession(authOptions);
}

export async function getCurrentUser() {
    const session = await getSession();
    return session?.user;
}

export async function requireAuth() {
    const user = await getCurrentUser();
    
    if (!user) {
        throw new Error('Not authenticated');
    }
    
    return user;
}

export async function requireRole(allowedRoles: string[]) {
    const user = await requireAuth();
    
    if (!allowedRoles.includes(user.role)) {
        throw new Error('Not authorized');
    }
    
    return user;
}
