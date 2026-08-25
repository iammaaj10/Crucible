export { auth as middleware } from "@/lib/auth";

export const config = {
  matcher: ["/dashboard/:path*", "/design/:path*", "/review/:path*", "/incidents/:path*", "/profile/:path*"],
};
