"use client";

import { useEffect, useMemo, useState } from "react";

type MeResponse = {
  user: {
    id: number;
    displayName: string;
  };
};

type Opinion = {
  id: number;
  content: string;
  created_at: string;
  display_name: string;
  likes: number;
  dislikes: number;
  my_reaction: "like" | "dislike" | null;
};

type OpinionsResponse = {
  opinions: Opinion[];
};

export default function Page() {
  const [me, setMe] = useState<MeResponse["user"] | null>(null);
  const [opinions, setOpinions] = useState<Opinion[]>([]);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState("");

  const remaining = useMemo(() => 500 - content.length, [content]);

  async function loadAll() {
    setLoading(true);
    setError("");

    try {
      const [meRes, opinionsRes] = await Promise.all([
        fetch("/api/me", { cache: "no-store" }),
        fetch("/api/opinions", { cache: "no-store" }),
      ]);

      if (!meRes.ok || !opinionsRes.ok) {
        throw new Error("Failed to load data.");
      }

      const meJson: MeResponse = await meRes.json();
      const opinionsJson: OpinionsResponse = await opinionsRes.json();

      setMe(meJson.user);
      setOpinions(opinionsJson.opinions);
    } catch (e: any) {
      setError(e.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAll();
  }, []);

  async function submitOpinion(e: React.FormEvent) {
    e.preventDefault();

    const trimmed = content.trim();

    if (trimmed.length < 2) {
      setError("Write at least 2 characters.");
      return;
    }

    if (trimmed.length > 500) {
      setError("Keep it under 500 characters.");
      return;
    }

    setPosting(true);
    setError("");

    try {
      const res = await fetch("/api/opinions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content: trimmed }),
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.error || "Failed to post opinion.");
      }

      setContent("");
      await loadAll();
    } catch (e: any) {
      setError(e.message || "Something went wrong.");
    } finally {
      setPosting(false);
    }
  }

  async function react(opinionId: number, reaction: "like" | "dislike") {
    try {
      const res = await fetch(`/api/opinions/${opinionId}/reaction`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ reaction }),
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.error || "Failed to react.");
      }

      await loadAll();
    } catch (e: any) {
      setError(e.message || "Something went wrong.");
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.18),_transparent_35%),radial-gradient(circle_at_bottom,_rgba(168,85,247,0.14),_transparent_30%)] px-4 py-10 text-white">
      <div className="mx-auto max-w-4xl">
        <header className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-blue-400">
              Global anonymous wall
            </p>
            <h1 className="text-4xl font-black tracking-tight text-white md:text-5xl">
              Share opinions. React honestly.
            </h1>
            <p className="mt-3 text-sm text-slate-300 md:text-base">
              No accounts, no profiles, just one global feed.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 px-5 py-4 shadow-2xl backdrop-blur">
            <span className="block text-xs text-slate-400">You are</span>
            <strong className="text-lg text-white">
              {me?.displayName ?? "Loading..."}
            </strong>
          </div>
        </header>

        <section className="mb-6 rounded-2xl border border-white/10 bg-white/5 p-5 shadow-2xl backdrop-blur">
          <form onSubmit={submitOpinion} className="space-y-4">
            <label
              htmlFor="opinion"
              className="block text-sm font-semibold text-white"
            >
              Post an opinion
            </label>

            <textarea
              id="opinion"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              maxLength={500}
              placeholder="Write what you really think..."
              className="min-h-[140px] w-full resize-y rounded-2xl border border-white/10 bg-slate-900/70 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-blue-400 focus:ring-4 focus:ring-blue-500/20"
            />

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <span
                className={`text-sm ${
                  remaining < 40 ? "text-amber-300" : "text-slate-400"
                }`}
              >
                {remaining} characters left
              </span>

              <button
                type="submit"
                disabled={posting}
                className="inline-flex items-center justify-center rounded-xl bg-blue-500 px-5 py-2.5 font-semibold text-white transition hover:bg-blue-400 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {posting ? "Posting..." : "Post opinion"}
              </button>
            </div>
          </form>

          {error ? (
            <p className="mt-4 rounded-xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
              {error}
            </p>
          ) : null}
        </section>

        <section>
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="text-xl font-bold text-white md:text-2xl">
              Latest opinions
            </h2>

            <button
              onClick={loadAll}
              disabled={loading}
              className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-slate-200 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading ? "Refreshing..." : "Refresh"}
            </button>
          </div>

          {loading ? (
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-center text-slate-300 shadow-xl backdrop-blur">
              Loading feed...
            </div>
          ) : opinions.length === 0 ? (
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-center text-slate-300 shadow-xl backdrop-blur">
              No opinions yet. Be the first.
            </div>
          ) : (
            <div className="space-y-4">
              {opinions.map((opinion) => {
                const myReaction = opinion.my_reaction;

                return (
                  <article
                    key={opinion.id}
                    className="rounded-2xl border border-white/10 bg-white/5 p-5 shadow-2xl backdrop-blur"
                  >
                    <div className="mb-3 flex flex-wrap items-center gap-2 text-sm text-slate-400">
                      <strong className="text-slate-100">
                        {opinion.display_name}
                      </strong>
                      <span>•</span>
                      <span>
                        {new Date(opinion.created_at).toLocaleString()}
                      </span>
                    </div>

                    <p className="mb-4 whitespace-pre-wrap break-words text-base leading-7 text-slate-100">
                      {opinion.content}
                    </p>

                    <div className="flex flex-wrap gap-3">
                      <button
                        onClick={() => react(opinion.id, "like")}
                        className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2 font-medium transition ${
                          myReaction === "like"
                            ? "border-blue-400 bg-blue-500/20 text-blue-200 ring-2 ring-blue-400/20"
                            : "border-white/10 bg-white/5 text-slate-200 hover:bg-white/10"
                        }`}
                      >
                        <span>👍</span>
                        <span>Like</span>
                        <span className="rounded-md bg-black/20 px-2 py-0.5 text-xs">
                          {opinion.likes}
                        </span>
                      </button>

                      <button
                        onClick={() => react(opinion.id, "dislike")}
                        className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2 font-medium transition ${
                          myReaction === "dislike"
                            ? "border-red-400 bg-red-500/20 text-red-200 ring-2 ring-red-400/20"
                            : "border-white/10 bg-white/5 text-slate-200 hover:bg-white/10"
                        }`}
                      >
                        <span>👎</span>
                        <span>Dislike</span>
                        <span className="rounded-md bg-black/20 px-2 py-0.5 text-xs">
                          {opinion.dislikes}
                        </span>
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}