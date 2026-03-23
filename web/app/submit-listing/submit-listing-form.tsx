"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { initialSubmissionForm, validateSubmission } from "@/lib/submissions";
import type { CategoryRow } from "@/types/listing";

type Props = {
  categories: CategoryRow[];
};

export function SubmitListingForm({ categories }: Props) {
  const router = useRouter();
  const [form, setForm] = useState(initialSubmissionForm);
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("submitting");
    setMessage("");

    const validation = validateSubmission(form, categories);
    if (!validation.ok) {
      setStatus("error");
      setMessage(validation.message);
      return;
    }

    try {
      const response = await fetch("/api/listing-submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = (await response.json()) as { error?: string; message?: string };
      console.log("Response:", response.status, data);
      
      if (!response.ok) {
        throw new Error(data.error ?? `Error: ${response.status}`);
      }

      setStatus("success");
      setMessage(data.message ?? "Application received. Our team will review it before publication.");
      setForm(initialSubmissionForm);
    } catch (error) {
      console.error("Submit error:", error);
      const nextMessage = error instanceof Error
        ? error.message
        : "We could not submit your application. Please try again.";
      setStatus("error");
      setMessage(nextMessage);
    }
  }

  function updateField<K extends keyof typeof initialSubmissionForm>(
    key: K,
    value: (typeof initialSubmissionForm)[K],
  ) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  if (status === "success") {
    return (
      <main className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-8 text-center">
          <h1 className="font-serif text-2xl text-emerald-800">Thank you!</h1>
          <p className="mt-4 text-emerald-700">{message}</p>
          <Link
            href="/"
            className="mt-6 inline-block rounded-full bg-emerald-600 px-6 py-2.5 text-sm font-medium text-white transition hover:bg-emerald-700"
          >
            Back to directory
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-2xl px-4 py-10 sm:px-6 sm:py-14">
      <Link
        href="/"
        className="text-sm font-medium text-stone-600 underline-offset-4 hover:text-stone-900 hover:underline"
      >
        ← Back to directory
      </Link>

      <article className="mt-8">
        <h1 className="font-serif text-3xl text-stone-900">
          Submit a listing
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-stone-600">
          Share your retreat details for editorial review. Approved listings are
          published after a quality check.
        </p>

        <form className="mt-8 space-y-6" onSubmit={onSubmit}>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="text-sm text-stone-700">
              <span className="mb-1.5 block font-medium text-stone-900">Business name</span>
              <input
                required
                maxLength={120}
                value={form.businessName}
                onChange={(e) => updateField("businessName", e.target.value)}
                className="w-full rounded-xl border border-stone-300 px-3 py-2.5 outline-none transition focus:border-stone-500"
              />
            </label>
            <label className="text-sm text-stone-700">
              <span className="mb-1.5 block font-medium text-stone-900">Contact name</span>
              <input
                required
                maxLength={120}
                value={form.contactName}
                onChange={(e) => updateField("contactName", e.target.value)}
                className="w-full rounded-xl border border-stone-300 px-3 py-2.5 outline-none transition focus:border-stone-500"
              />
            </label>
            <label className="text-sm text-stone-700">
              <span className="mb-1.5 block font-medium text-stone-900">Contact email</span>
              <input
                required
                type="email"
                maxLength={160}
                value={form.contactEmail}
                onChange={(e) => updateField("contactEmail", e.target.value)}
                className="w-full rounded-xl border border-stone-300 px-3 py-2.5 outline-none transition focus:border-stone-500"
              />
            </label>
            <label className="text-sm text-stone-700">
              <span className="mb-1.5 block font-medium text-stone-900">Website</span>
              <input
                type="url"
                placeholder="https://"
                value={form.websiteUrl}
                onChange={(e) => updateField("websiteUrl", e.target.value)}
                className="w-full rounded-xl border border-stone-300 px-3 py-2.5 outline-none transition focus:border-stone-500"
              />
            </label>
            <label className="text-sm text-stone-700">
              <span className="mb-1.5 block font-medium text-stone-900">Location</span>
              <input
                value={form.location}
                onChange={(e) => updateField("location", e.target.value)}
                className="w-full rounded-xl border border-stone-300 px-3 py-2.5 outline-none transition focus:border-stone-500"
              />
            </label>
            <label className="text-sm text-stone-700">
              <span className="mb-1.5 block font-medium text-stone-900">Primary category</span>
              <select
                value={form.categorySlug}
                onChange={(e) => updateField("categorySlug", e.target.value)}
                className="w-full rounded-xl border border-stone-300 bg-white px-3 py-2.5 outline-none transition focus:border-stone-500"
              >
                <option value="">Select a category</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.slug}>
                    {category.name}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <input
            type="text"
            tabIndex={-1}
            autoComplete="off"
            value={form.company}
            onChange={(e) => updateField("company", e.target.value)}
            className="hidden"
            aria-hidden="true"
          />

          <label className="block text-sm text-stone-700">
            <span className="mb-1.5 block font-medium text-stone-900">Short summary</span>
            <textarea
              required
              rows={4}
              minLength={40}
              maxLength={1200}
              value={form.summary}
              onChange={(e) => updateField("summary", e.target.value)}
              className="w-full rounded-xl border border-stone-300 px-3 py-2.5 outline-none transition focus:border-stone-500"
            />
            <span className="mt-1 block text-xs text-stone-500">
              Include who it helps, what the format is, and what makes it credible.
            </span>
          </label>

          <label className="block text-sm text-stone-700">
            <span className="mb-1.5 block font-medium text-stone-900">Notes for review</span>
            <textarea
              rows={3}
              maxLength={2000}
              value={form.notes}
              onChange={(e) => updateField("notes", e.target.value)}
              className="w-full rounded-xl border border-stone-300 px-3 py-2.5 outline-none transition focus:border-stone-500"
            />
          </label>

          {message ? (
            <p
              className={`rounded-xl px-3 py-2 text-sm ${
                status === "error"
                  ? "bg-rose-50 text-rose-700"
                  : "bg-emerald-50 text-emerald-800"
              }`}
            >
              {message}
            </p>
          ) : null}

          <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
            <Link
              href="/"
              className="rounded-full border border-stone-300 px-5 py-2.5 text-center text-sm font-medium text-stone-800 transition hover:bg-stone-50"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={status === "submitting"}
              className="rounded-full bg-stone-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-stone-800 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {status === "submitting" ? "Submitting..." : "Submit for review"}
            </button>
          </div>
        </form>
      </article>
    </main>
  );
}