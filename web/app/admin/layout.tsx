"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Link from "next/link";
import { validateAdminCode, isAdminConfigured } from "@/lib/admin";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [authenticated, setAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem("admin_auth");
    if (stored === "true") {
      setAuthenticated(true);
    }
    setLoading(false);
  }, []);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const code = fd.get("code") as string;

    if (validateAdminCode(code)) {
      localStorage.setItem("admin_auth", "true");
      setAuthenticated(true);
    } else {
      alert("Invalid admin code");
    }
  }

  function handleLogout() {
    localStorage.removeItem("admin_auth");
    setAuthenticated(false);
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-stone-500">Loading...</p>
      </div>
    );
  }

  if (!authenticated) {
    const configured = isAdminConfigured();
    if (!configured) {
      return (
        <main className="mx-auto max-w-md px-4 py-16 sm:px-6">
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-6">
            <h1 className="font-serif text-xl text-amber-900">Admin not configured</h1>
            <p className="mt-2 text-sm text-amber-800">
              Set <code className="bg-amber-100 px-1">ADMIN_CODE</code> environment variable to enable admin access.
            </p>
          </div>
        </main>
      );
    }

    return (
      <main className="mx-auto max-w-md px-4 py-16 sm:px-6">
        <h1 className="font-serif text-2xl text-stone-900">Admin Login</h1>
        <form className="mt-6 space-y-4" onSubmit={onSubmit}>
          <div>
            <label className="text-sm text-stone-700">Admin code</label>
            <input
              type="password"
              name="code"
              defaultValue={"admin123"}
              required
              className="mt-1 w-full rounded-xl border border-stone-300 px-3 py-2.5 outline-none transition focus:border-stone-500"
            />
          </div>
          <button
            type="submit"
            className="w-full rounded-full bg-stone-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-stone-800"
          >
            Sign in
          </button>
        </form>
      </main>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50">
      <header className="border-b border-stone-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
          <Link href="/admin/submissions" className="font-serif text-lg text-stone-900">
            Admin
          </Link>
          <nav className="flex items-center gap-4 text-sm">
            <Link href="/admin/submissions" className="text-stone-600 hover:text-stone-900">
              Submissions
            </Link>
            <Link href="/" className="text-stone-600 hover:text-stone-900">
              View site
            </Link>
            <button onClick={handleLogout} className="text-stone-500 hover:text-stone-700">
              Logout
            </button>
          </nav>
        </div>
      </header>
      {children}
    </div>
  );
}