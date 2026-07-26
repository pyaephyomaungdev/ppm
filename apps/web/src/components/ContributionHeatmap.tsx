import { useEffect, useMemo, useState } from "react";
import { apiGet, type ContributionYear } from "../lib/api";

const LEVEL = [
  "bg-[#ebedf0]",
  "bg-[#ffd4c2]",
  "bg-[#ff9b6b]",
  "bg-[#f56a2c]",
  "bg-[#f54e00]",
];

export function ContributionHeatmap() {
  const thisYear = new Date().getUTCFullYear();
  const years = useMemo(() => [thisYear, thisYear - 1, thisYear - 2, thisYear - 3], [thisYear]);
  const [year, setYear] = useState(thisYear);
  const [data, setData] = useState<ContributionYear | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    void apiGet<ContributionYear>(`/api/public/github/contributions?year=${year}`)
      .then((d) => {
        if (!cancelled) setData(d);
      })
      .catch(() => {
        if (!cancelled) setData({ year, total: 0, days: [], source: "empty", username: null });
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [year]);

  const weeks = useMemo(() => {
    const days = data?.days ?? [];
    const chunks: typeof days[] = [];
    for (let i = 0; i < days.length; i += 7) chunks.push(days.slice(i, i + 7));
    return chunks;
  }, [data]);

  return (
    <section className="mt-14">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[var(--muted)]">
            Contributions
          </p>
          <h2 className="mt-1 text-2xl font-semibold tracking-tight">
            {loading ? "…" : `${(data?.total ?? 0).toLocaleString()} contributions`}
            <span className="ml-2 text-base font-normal text-[var(--muted)]">in {year}</span>
          </h2>
        </div>
        <div className="flex gap-1">
          {years.map((y) => (
            <button
              key={y}
              type="button"
              onClick={() => setYear(y)}
              className={`rounded-md px-2.5 py-1 text-sm ${
                y === year
                  ? "bg-[var(--ink)] text-[var(--paper)]"
                  : "text-[var(--muted)] hover:bg-[var(--soft)]"
              }`}
            >
              {y}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-[var(--rule)] bg-white p-4">
        <div className="inline-flex gap-[3px]">
          {weeks.map((week, wi) => (
            <div key={wi} className="flex flex-col gap-[3px]">
              {week.map((d) => (
                <div
                  key={d.date}
                  title={`${d.date}: ${d.count} contribution${d.count === 1 ? "" : "s"}`}
                  className={`h-[11px] w-[11px] rounded-[3px] ${LEVEL[d.level] ?? LEVEL[0]} transition-transform hover:scale-125`}
                />
              ))}
            </div>
          ))}
        </div>
        <div className="mt-3 flex items-center justify-end gap-1 text-xs text-[var(--muted)]">
          <span>Less</span>
          {LEVEL.map((c, i) => (
            <span key={i} className={`inline-block h-[11px] w-[11px] rounded-[3px] ${c}`} />
          ))}
          <span>More</span>
        </div>
        {data?.source === "empty" ? (
          <p className="mt-2 text-xs text-[var(--muted)]">
            GitHub heatmap unavailable — set GITHUB_TOKEN on the API to enable live data.
          </p>
        ) : null}
      </div>
    </section>
  );
}
