export function ConfigBanner() {
  return (
    <div className="border-b border-amber-200 bg-amber-50 px-4 py-3 text-center text-sm text-amber-950">
      <p className="font-medium">Supabase environment variables are not set.</p>
      <p className="mt-1 text-amber-900/80">
        Copy{" "}
        <code className="rounded bg-amber-100/80 px-1 py-0.5 text-xs">
          web/.env.local.example
        </code>{" "}
        to{" "}
        <code className="rounded bg-amber-100/80 px-1 py-0.5 text-xs">
          web/.env.local
        </code>{" "}
        and run the SQL migration in your Supabase project.
      </p>
    </div>
  );
}
