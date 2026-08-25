import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { AppHeader } from "@/components/navigation/AppHeader";
import { SettingsForm } from "./SettingsForm";

export default async function SettingsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { accounts: true },
  });

  if (!user) redirect("/login");

  const authProvider = user.accounts.length > 0 ? user.accounts[0].provider : "email";

  return (
    <div className="min-h-screen bg-black text-white selection:bg-white selection:text-black">
      <AppHeader userName={user.name} userEmail={user.email} />

      <main className="mx-auto max-w-2xl px-6 py-12">
        <div className="mb-10 border-b border-white/10 pb-8">
          <h1 className="text-3xl font-extrabold tracking-tight text-white">⚙️ Settings</h1>
          <p className="mt-2 text-sm text-neutral-400">
            Manage your account details and preferences.
          </p>
        </div>

        {/* Profile Section */}
        <div className="mb-8 border border-white/10 bg-neutral-950 p-6">
          <h2 className="mb-4 text-xs uppercase tracking-widest text-neutral-400">Your Profile</h2>
          <SettingsForm currentName={user.name || ""} />
        </div>

        {/* Account Info (read-only) */}
        <div className="mb-8 border border-white/10 bg-neutral-950 p-6">
          <h2 className="mb-4 text-xs uppercase tracking-widest text-neutral-400">Account Information</h2>
          <div className="space-y-4">
            <div>
              <p className="text-[11px] uppercase text-neutral-500">Email</p>
              <p className="mt-1 text-sm text-white">{user.email}</p>
            </div>
            <div>
              <p className="text-[11px] uppercase text-neutral-500">Sign-in Method</p>
              <p className="mt-1 text-sm capitalize text-white">
                {authProvider === "google" ? "🔵 Google Account" : "📧 Email & Password"}
              </p>
            </div>
            <div>
              <p className="text-[11px] uppercase text-neutral-500">Joined</p>
              <p className="mt-1 text-sm text-white">
                {new Date(user.createdAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="border border-white/20 bg-neutral-950 p-6">
          <h2 className="mb-2 text-xs uppercase tracking-widest text-neutral-400">⚠️ Danger Zone</h2>
          <p className="mb-4 text-xs text-neutral-500">
            Deleting your account will permanently remove all your projects, reviews, and scores.
            This action cannot be undone.
          </p>
          <button
            disabled
            className="rounded border border-white/30 bg-black px-4 py-2 text-xs font-bold text-neutral-400 opacity-50"
          >
            Delete Account (coming soon)
          </button>
        </div>
      </main>
    </div>
  );
}
