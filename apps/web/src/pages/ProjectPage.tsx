import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { SiteFooter, SiteHeader } from "../components/SiteChrome";
import { apiGet, type Project } from "../lib/api";

export function ProjectPage() {
  const { slug } = useParams<{ slug: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [siteName, setSiteName] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;
    let cancelled = false;
    setError(null);
    setProject(null);
    void apiGet<Project>(`/api/public/projects/${slug}`)
      .then((p) => {
        if (!cancelled) setProject(p);
      })
      .catch(() => {
        if (!cancelled) setError("Project not found");
      });
    void apiGet<{ profile: { name: string } | null }>("/api/public/portfolio")
      .then((d) => {
        if (!cancelled) setSiteName(d.profile?.name ?? null);
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [slug]);

  const paragraphs = (project?.body || project?.summary || "")
    .split(/\n\n+/)
    .map((p) => p.trim())
    .filter(Boolean);

  return (
    <div className="min-h-screen">
      <SiteHeader name={siteName} />

      <main className="mx-auto max-w-3xl px-5 pb-24 pt-10">
        <Link
          to="/#projects"
          className="text-sm text-[var(--muted)] underline-offset-2 hover:text-[var(--ink)] hover:underline"
        >
          ← Projects
        </Link>

        {error ? (
          <p className="mt-8 text-sm text-red-700">{error}</p>
        ) : !project ? (
          <p className="mt-8 text-sm text-[var(--muted)]">Loading…</p>
        ) : (
          <article className="mt-8">
            <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[var(--muted)]">
              Project
            </p>
            <h1 className="mt-2 font-[family-name:var(--display)] text-4xl tracking-tight sm:text-5xl">
              {project.title}
            </h1>
            {project.period ? (
              <p className="mt-2 text-sm text-[var(--muted)]">{project.period}</p>
            ) : null}

            <div className="mt-6 flex flex-wrap gap-3">
              {project.url ? (
                <a
                  href={project.url}
                  target="_blank"
                  rel="noreferrer"
                  className="btn-primary inline-flex items-center rounded-lg px-4 py-2 text-sm font-medium transition"
                >
                  View live
                </a>
              ) : null}
              {project.repoUrl ? (
                <a
                  href={project.repoUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center rounded-lg border border-[var(--rule)] bg-white px-4 py-2 text-sm font-medium text-[var(--ink)] transition hover:border-[var(--ink)]"
                >
                  Source
                </a>
              ) : null}
            </div>

            {project.techStack?.length ? (
              <section className="mt-10">
                <h2 className="text-sm font-semibold tracking-tight">Tech stack</h2>
                <ul className="mt-3 flex flex-wrap gap-2">
                  {project.techStack.map((t) => (
                    <li
                      key={t}
                      className="rounded-md border border-[var(--rule)] bg-white px-2.5 py-1 text-xs font-medium text-[var(--ink)]"
                    >
                      {t}
                    </li>
                  ))}
                </ul>
              </section>
            ) : project.language ? (
              <p className="mt-8 text-sm text-[var(--muted)]">
                <span className="mr-1.5 inline-block h-2 w-2 rounded-full bg-[var(--ink)]" />
                {project.language}
              </p>
            ) : null}

            <section className="mt-10 space-y-4 text-[15px] leading-relaxed text-[var(--ink)]">
              {paragraphs.map((para, i) => (
                <p key={i} className="whitespace-pre-line text-[var(--muted)] first:text-[var(--ink)]">
                  {para}
                </p>
              ))}
            </section>
          </article>
        )}
      </main>

      <SiteFooter name={siteName} />
    </div>
  );
}
