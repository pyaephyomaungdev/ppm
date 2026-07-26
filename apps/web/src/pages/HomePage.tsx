import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { ContributionHeatmap } from "../components/ContributionHeatmap";
import { ExperienceSection } from "../components/ExperienceSection";
import { SiteFooter, SiteHeader } from "../components/SiteChrome";
import { apiGet, type Portfolio } from "../lib/api";
import { scrollToId } from "../lib/scrollToId";

export function HomePage() {
  const [data, setData] = useState<Portfolio | null>(null);
  const [error, setError] = useState<string | null>(null);
  const location = useLocation();

  useEffect(() => {
    void apiGet<Portfolio>("/api/public/portfolio")
      .then(setData)
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to load"));
  }, []);

  useEffect(() => {
    const id = location.hash.replace(/^#/, "");
    if (!id) return;
    scrollToId(id);
  }, [location.hash, data]);

  const p = data?.profile;

  return (
    <div className="min-h-screen">
      <SiteHeader name={p?.name} />

      <main className="mx-auto max-w-3xl px-5 pb-24 pt-10">
        {error ? (
          <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
            {error}. Start the API (`npm run dev:api`) and ensure Postgres is up.
          </p>
        ) : null}

        <section className="flex flex-wrap items-start gap-5">
          {p?.avatarUrl ? (
            <img
              src={p.avatarUrl}
              alt=""
              className="h-20 w-20 rounded-2xl border border-[var(--rule)] object-cover"
            />
          ) : (
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl border border-[var(--rule)] bg-[var(--soft)] text-2xl font-semibold text-[var(--muted)]">
              {(p?.name || "?").slice(0, 1)}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <h1 className="font-[family-name:var(--display)] text-4xl tracking-tight sm:text-5xl">
              {p?.name || "Your name"}
            </h1>
            <p className="mt-1 text-[var(--muted)]">
              @{p?.handle || "handle"}
              {p?.headline ? ` · ${p.headline}` : ""}
            </p>
            <div className="mt-3 flex min-w-0 flex-wrap items-center gap-x-4 gap-y-1 text-sm text-[var(--muted)]">
              {p?.joinedLabel ? <span>{p.joinedLabel}</span> : null}
              {p?.location ? <span>{p.location}</span> : null}
              {p?.githubUrl ? (
                <a
                  href={p.githubUrl}
                  className="underline-offset-2 hover:underline"
                  target="_blank"
                  rel="noreferrer"
                >
                  GitHub
                </a>
              ) : null}
              {p?.emailPublic ? (
                <a
                  href={`mailto:${p.emailPublic}`}
                  title={p.emailPublic}
                  className="block max-w-[12.5rem] truncate underline-offset-2 hover:underline sm:max-w-none"
                >
                  {p.emailPublic}
                </a>
              ) : null}
            </div>
            {p?.bio ? <p className="mt-4 max-w-xl text-[15px] leading-relaxed">{p.bio}</p> : null}
          </div>
        </section>

        {data?.stats?.length ? (
          <section className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {data.stats.map((s) => (
              <div key={s.id}>
                <p className="text-xs font-medium text-[var(--muted)]">{s.label}</p>
                <p className="mt-1 text-2xl font-semibold tracking-tight">{s.value}</p>
              </div>
            ))}
          </section>
        ) : null}

        <ContributionHeatmap />

        {data?.projects?.length ? (
          <section id="projects" className="mt-16 scroll-mt-24">
            <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[var(--muted)]">
              Projects
            </p>
            <h2 className="mt-1 font-[family-name:var(--display)] text-3xl tracking-tight">
              Selected work
            </h2>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {data.projects.map((proj, i) => (
                <Link
                  key={proj.id}
                  to={`/projects/${proj.slug}`}
                  className="group relative rounded-xl border border-[var(--rule)] bg-white p-4 transition hover:border-[color-mix(in_oklab,var(--ink)_25%,var(--rule))]"
                >
                  <span className="absolute right-3 top-3 text-xs text-[var(--muted)]">{i + 1}</span>
                  <h3 className="pr-6 font-semibold tracking-tight group-hover:underline">
                    {proj.title}
                  </h3>
                  {proj.period ? (
                    <p className="mt-1 text-xs text-[var(--muted)]">{proj.period}</p>
                  ) : null}
                  {proj.summary ? (
                    <p className="mt-1.5 line-clamp-3 text-sm text-[var(--muted)]">{proj.summary}</p>
                  ) : null}
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    {proj.language ? (
                      <p className="text-xs text-[var(--muted)]">
                        <span className="mr-1.5 inline-block h-2 w-2 rounded-full bg-[var(--ink)]" />
                        {proj.language}
                      </p>
                    ) : null}
                    {proj.url ? (
                      <span className="text-xs font-medium text-[var(--ink)]">Live →</span>
                    ) : null}
                  </div>
                </Link>
              ))}
            </div>
          </section>
        ) : null}

        <ExperienceSection companies={data?.experience ?? []} />

        {data?.education?.length ? (
          <section id="education" className="mt-16 scroll-mt-24">
            <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[var(--muted)]">
              Education
            </p>
            <ul className="mt-4 space-y-4">
              {data.education.map((e) => (
                <li key={e.id} className="border-b border-[var(--rule)] pb-4 last:border-0">
                  <h3 className="font-semibold">{e.school}</h3>
                  <p className="text-sm text-[var(--muted)]">
                    {[e.degree, e.field].filter(Boolean).join(" · ")}
                  </p>
                  <p className="text-sm text-[var(--muted)]">
                    {[e.startDate, e.endDate].filter(Boolean).join(" – ")}
                  </p>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        {data?.honors?.length ? (
          <section className="mt-16">
            <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[var(--muted)]">
              Honors & awards
            </p>
            <ul className="mt-4 space-y-4">
              {data.honors.map((h) => (
                <li key={h.id}>
                  <h3 className="font-semibold">{h.title}</h3>
                  <p className="text-sm text-[var(--muted)]">
                    {[h.issuer, h.date].filter(Boolean).join(" · ")}
                  </p>
                  {h.description ? <p className="mt-1 text-sm">{h.description}</p> : null}
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        {data?.licenses?.length ? (
          <section className="mt-16">
            <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[var(--muted)]">
              Licenses & certifications
            </p>
            <ul className="mt-4 space-y-4">
              {data.licenses.map((l) => (
                <li key={l.id}>
                  <h3 className="font-semibold">{l.name}</h3>
                  <p className="text-sm text-[var(--muted)]">
                    {[l.issuer, l.issueDate].filter(Boolean).join(" · ")}
                  </p>
                </li>
              ))}
            </ul>
          </section>
        ) : null}
      </main>

      <SiteFooter name={p?.name} />
    </div>
  );
}
