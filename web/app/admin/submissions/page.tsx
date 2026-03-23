"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getSubmissions, updateSubmissionStatus } from "@/lib/admin";

type Submission = {
  id: string;
  business_name: string;
  contact_name: string;
  contact_email: string;
  website_url: string | null;
  location: string | null;
  category_slug: string | null;
  summary: string;
  notes: string | null;
  status: string;
  created_at: string;
};

type Props = {
  searchParams: Promise<{ status?: string }>;
};

export default function AdminSubmissionsPage({ searchParams }: Props) {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("");
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const sp = await searchParams;
      setFilter(sp.status || "");
      const res = await getSubmissions(sp.status || undefined);
      if (res.ok && res.submissions) {
        setSubmissions(res.submissions);
      }
      setLoading(false);
    }
    load();
  }, [searchParams]);

  async function handleUpdate(id: string, status: string) {
    setUpdating(id);
    const res = await updateSubmissionStatus(id, status);
    if (res.ok) {
      setSubmissions((prev) =>
        prev.map((s) => (s.id === id ? { ...s, status } : s))
      );
    }
    setUpdating(null);
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <p className="text-stone-500">Loading...</p>
      </div>
    );
  }

  const counts = {
    all: submissions.length,
    pending: submissions.filter((s) => s.status === "pending").length,
    reviewed: submissions.filter((s) => s.status === "reviewed").length,
    approved: submissions.filter((s) => s.status === "approved").length,
    rejected: submissions.filter((s) => s.status === "rejected").length,
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <h1 className="font-serif text-2xl text-stone-900">Submissions</h1>

      <div className="mt-4 flex gap-2">
        {["", "pending", "reviewed", "approved", "rejected"].map((status) => (
          <Link
            key={status}
            href={status ? `/admin/submissions?status=${status}` : "/admin/submissions"}
            className={`rounded-full px-3 py-1 text-sm ${
              filter === status
                ? "bg-stone-900 text-white"
                : "bg-stone-100 text-stone-700 hover:bg-stone-200"
            }`}
          >
            {status || "All"} ({counts[status as keyof typeof counts] ?? counts.all})
          </Link>
        ))}
      </div>

      {submissions.length === 0 ? (
        <p className="mt-8 text-stone-500">No submissions found.</p>
      ) : (
        <ul className="mt-6 space-y-4">
          {submissions.map((submission) => (
            <li
              key={submission.id}
              className="rounded-xl border border-stone-200 bg-white p-4"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium text-stone-900">
                      {submission.business_name}
                    </h3>
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs ${
                        submission.status === "pending"
                          ? "bg-amber-100 text-amber-800"
                          : submission.status === "reviewed"
                          ? "bg-blue-100 text-blue-800"
                          : submission.status === "approved"
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-rose-100 text-rose-800"
                      }`}
                    >
                      {submission.status}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-stone-600">
                    {submission.contact_name} · {submission.contact_email}
                  </p>
                  {submission.location && (
                    <p className="mt-1 text-sm text-stone-500">{submission.location}</p>
                  )}
                  {submission.category_slug && (
                    <p className="mt-1 text-sm text-stone-500">
                      Category: {submission.category_slug}
                    </p>
                  )}
                  <p className="mt-2 text-sm text-stone-700">{submission.summary}</p>
                  {submission.notes && (
                    <p className="mt-1 text-sm text-stone-500">
                      Notes: {submission.notes}
                    </p>
                  )}
                  {submission.website_url && (
                    <a
                      href={submission.website_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2 block text-sm text-stone-600 hover:text-stone-900"
                    >
                      {submission.website_url}
                    </a>
                  )}
                  <p className="mt-2 text-xs text-stone-400">
                    {new Date(submission.created_at).toLocaleString()}
                  </p>
                </div>
                {submission.status === "pending" && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleUpdate(submission.id, "approved")}
                      disabled={updating === submission.id}
                      className="rounded-full bg-emerald-600 px-3 py-1 text-sm text-white hover:bg-emerald-700 disabled:opacity-50"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleUpdate(submission.id, "rejected")}
                      disabled={updating === submission.id}
                      className="rounded-full bg-rose-600 px-3 py-1 text-sm text-white hover:bg-rose-700 disabled:opacity-50"
                    >
                      Reject
                    </button>
                  </div>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}