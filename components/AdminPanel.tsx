"use client";

import { useState } from "react";

type HomestayOption = {
  id: string;
  name: string;
};

export default function AdminPanel({
  homestays,
}: {
  homestays: HomestayOption[];
}) {
  const [secret, setSecret] = useState("");
  const [homestayId, setHomestayId] = useState(homestays[0]?.id ?? "");
  const [count, setCount] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [links, setLinks] = useState<string[]>([]);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLinks([]);
    setLoading(true);
    try {
      const res = await fetch("/api/admin/tokens", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ secret, homestayId, count }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong.");
        return;
      }
      const base = window.location.origin;
      setLinks(
        (data.tokens as string[]).map(
          (t) => `${base}/homestays/${homestayId}/review?token=${t}`,
        ),
      );
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <form
        onSubmit={onSubmit}
        className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-zinc-200"
      >
        <div className="space-y-5">
          <div>
            <label
              htmlFor="secret"
              className="block text-sm font-medium text-zinc-700"
            >
              Admin secret
            </label>
            <input
              id="secret"
              type="password"
              value={secret}
              onChange={(e) => setSecret(e.target.value)}
              required
              autoComplete="off"
              placeholder="Set as ADMIN_SECRET"
              className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
            />
          </div>

          <div>
            <label
              htmlFor="homestay"
              className="block text-sm font-medium text-zinc-700"
            >
              Homestay
            </label>
            <select
              id="homestay"
              value={homestayId}
              onChange={(e) => setHomestayId(e.target.value)}
              className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
            >
              {homestays.map((h) => (
                <option key={h.id} value={h.id}>
                  {h.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="count"
              className="block text-sm font-medium text-zinc-700"
            >
              Number of links
            </label>
            <input
              id="count"
              type="number"
              min={1}
              max={100}
              value={count}
              onChange={(e) => setCount(Number(e.target.value))}
              required
              className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-orange-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-orange-700 disabled:opacity-50"
          >
            {loading ? "Generating…" : "Generate links"}
          </button>
        </div>
      </form>

      {error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 ring-1 ring-red-200">
          {error}
        </p>
      )}

      {links.length > 0 && (
        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-zinc-200">
          <p className="text-sm font-medium text-zinc-700">
            {links.length} review link{links.length === 1 ? "" : "s"} generated:
          </p>
          <ol className="mt-3 space-y-2">
            {links.map((link, i) => (
              <li
                key={link}
                className="flex items-center gap-2 rounded-lg bg-zinc-50 px-3 py-2"
              >
                <span className="text-xs font-semibold text-zinc-400">
                  {i + 1}.
                </span>
                <span className="flex-1 truncate text-xs text-zinc-700">
                  {link}
                </span>
                <button
                  type="button"
                  onClick={() => navigator.clipboard.writeText(link)}
                  className="shrink-0 rounded-md bg-zinc-200 px-2 py-1 text-xs font-medium text-zinc-700 transition hover:bg-zinc-300"
                >
                  Copy
                </button>
              </li>
            ))}
          </ol>
          <p className="mt-3 text-xs text-zinc-400">
            Send each link to a separate guest after their stay. Each link works
            once only.
          </p>
        </div>
      )}
    </div>
  );
}
