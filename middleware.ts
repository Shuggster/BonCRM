import { withAuth } from "next-auth/middleware";

export default withAuth({
    callbacks: {
        authorized: ({ token }) => !!token
    },
});

export const config = {
    matcher: [
        "/dashboard/:path*",
        "/contacts/:path*",
        "/tasks/:path*",
        "/tools/:path*",
        "/settings/:path*",
    ]
}; 