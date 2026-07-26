import { useEffect, useMemo, useRef, useState } from "react";
import { apiGet, type ContributionDay, type ContributionYear } from "../lib/api";

/** Ink scale — empty gray → near-black */
const LEVEL = ["#ececea", "#c4c4c0", "#8a8a86", "#3d3d3a", "#111110"] as const;

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const MIN_CELL = 11;
const GAP = 3;

type Tip = { x: number; y: number; text: string };

function monthLabelForWeek(week: ContributionDay[], weekIndex: number, weeks: ContributionDay[][]): string | null {
  const day = week.find((d) => d.date)?.date;
  if (!day) return null;
  const month = new Date(`${day}T12:00:00Z`).getUTCMonth();
  if (weekIndex === 0) return MONTHS[month];
  const prev = weeks[weekIndex - 1]?.find((d) => d.date)?.date;
  if (!prev) return MONTHS[month];
  const prevMonth = new Date(`${prev}T12:00:00Z`).getUTCMonth();
  return month !== prevMonth ? MONTHS[month] : null;
}

export function ContributionHeatmap() {
  const thisYear = new Date().getUTCFullYear();
  const years = useMemo(() => [thisYear, thisYear - 1, thisYear - 2, thisYear - 3], [thisYear]);
  const [year, setYear] = useState(thisYear);
  const [data, setData] = useState<ContributionYear | null>(null);
  const [loading, setLoading] = useState(true);
  const [tip, setTip] = useState<Tip | null>(null);
  const [cell, setCell] = useState(MIN_CELL);
  const [needsScroll, setNeedsScroll] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const measureRef = useRef<HTMLDivElement>(null);

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
    const chunks: ContributionDay[][] = [];
    for (let i = 0; i < days.length; i += 7) chunks.push(days.slice(i, i + 7));
    return chunks;
  }, [data]);

  const monthLabels = useMemo(
    () => weeks.map((w, i) => monthLabelForWeek(w, i, weeks)),
    [weeks],
  );

  useEffect(() => {
    const el = measureRef.current;
    if (!el || weeks.length === 0) return;

    const update = () => {
      const width = el.clientWidth;
      const fluid = (width - GAP * Math.max(0, weeks.length - 1)) / weeks.length;
      if (fluid < MIN_CELL) {
        setCell(MIN_CELL);
        setNeedsScroll(true);
      } else {
        setCell(Math.floor(fluid * 100) / 100);
        setNeedsScroll(false);
      }
    };

    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [weeks.length]);

  const showTip = (el: HTMLElement, text: string) => {
    const wrap = wrapRef.current;
    if (!wrap) return;
    const wr = wrap.getBoundingClientRect();
    const r = el.getBoundingClientRect();
    setTip({
      x: r.left + r.width / 2 - wr.left,
      y: r.top - wr.top - 8,
      text,
    });
  };

  const gridWidth = weeks.length > 0 ? weeks.length * cell + Math.max(0, weeks.length - 1) * GAP : 0;

  return (
    <section className="mt-14">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[var(--muted)]">
            Contributions
          </p>
          <h2 className="mt-1 text-2xl font-semibold tracking-tight">
            {loading ? "…" : `${(data?.total ?? 0).toLocaleString()} contributions`}
            <span className="ml-2 text-base font-normal text-[var(--muted)]">in {year}</span>
          </h2>
        </div>
        <div className="flex rounded-lg border border-[var(--rule)] bg-white p-0.5">
          {years.map((y) => (
            <button
              key={y}
              type="button"
              onClick={() => setYear(y)}
              className={`rounded-md px-2.5 py-1 text-sm transition-colors ${
                y === year ? "btn-primary" : "text-[var(--muted)] hover:text-[var(--ink)]"
              }`}
            >
              {y}
            </button>
          ))}
        </div>
      </div>

      <div
        ref={wrapRef}
        className="relative w-full overflow-hidden rounded-xl border border-[var(--rule)] bg-white px-3 py-4 sm:px-4"
      >
        <div ref={measureRef} className="w-full">
          {weeks.length > 0 ? (
            <div className={needsScroll ? "heatmap-scroll" : undefined}>
              <div
                style={
                  needsScroll
                    ? { width: gridWidth, minWidth: gridWidth }
                    : { width: "100%" }
                }
              >
                <div
                  className="mb-1.5 grid"
                  style={{
                    gridTemplateColumns: needsScroll
                      ? `repeat(${weeks.length}, ${cell}px)`
                      : `repeat(${weeks.length}, minmax(0, 1fr))`,
                    gap: GAP,
                  }}
                  aria-hidden
                >
                  {monthLabels.map((label, i) => (
                    <div
                      key={i}
                      className="overflow-visible text-[10px] leading-none text-[var(--muted)] sm:text-[11px]"
                    >
                      {label ?? ""}
                    </div>
                  ))}
                </div>

                <div
                  className="grid"
                  style={{
                    gridTemplateColumns: needsScroll
                      ? `repeat(${weeks.length}, ${cell}px)`
                      : `repeat(${weeks.length}, minmax(0, 1fr))`,
                    gap: GAP,
                  }}
                  role="img"
                  aria-label={`${data?.total ?? 0} contributions in ${year}`}
                >
                  {weeks.map((week, wi) => (
                    <div
                      key={wi}
                      className="grid"
                      style={{
                        gridTemplateRows: needsScroll
                          ? `repeat(7, ${cell}px)`
                          : "repeat(7, minmax(0, 1fr))",
                        gap: GAP,
                      }}
                    >
                      {week.map((d, di) => {
                        const level = Math.min(4, Math.max(0, d.level)) as 0 | 1 | 2 | 3 | 4;
                        const delay = Math.min(wi * 8 + di * 4, 400);
                        return (
                          <button
                            key={d.date}
                            type="button"
                            aria-label={`${d.date}: ${d.count} contribution${d.count === 1 ? "" : "s"}`}
                            onMouseEnter={(e) => showTip(e.currentTarget, `${d.count} on ${d.date}`)}
                            onMouseLeave={() => setTip(null)}
                            onFocus={(e) => showTip(e.currentTarget, `${d.count} on ${d.date}`)}
                            onBlur={() => setTip(null)}
                            className={`heatmap-cell rounded-[2px] border-0 p-0 outline-none focus-visible:ring-2 focus-visible:ring-[var(--ink)] focus-visible:ring-offset-1 sm:rounded-[3px] ${
                              needsScroll ? "" : "aspect-square w-full min-w-0"
                            }`}
                            style={{
                              ...(needsScroll ? { width: cell, height: cell } : null),
                              backgroundColor: LEVEL[level],
                              animationDelay: `${delay}ms`,
                            }}
                          />
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex h-24 items-center justify-center text-sm text-[var(--muted)]">
              {loading ? "Loading…" : "No contribution data"}
            </div>
          )}
        </div>

        {needsScroll ? (
          <p className="mt-2 text-[11px] text-[var(--muted)] sm:hidden">Swipe sideways to see the full year</p>
        ) : null}

        <div className="mt-3 flex items-center justify-between gap-3 text-[11px] text-[var(--muted)] sm:text-xs">
          <span className="tabular-nums">
            {data?.source === "cache"
              ? "Cached from GitHub"
              : data?.source === "github"
                ? "Live from GitHub"
                : ""}
          </span>
          <div className="flex items-center gap-1">
            <span>Less</span>
            {LEVEL.map((c, i) => (
              <span
                key={i}
                className="inline-block h-2.5 w-2.5 rounded-[2px] sm:h-3 sm:w-3 sm:rounded-[3px]"
                style={{ backgroundColor: c }}
              />
            ))}
            <span>More</span>
          </div>
        </div>

        {data?.source === "empty" ? (
          <p className="mt-2 text-xs text-[var(--muted)]">
            GitHub heatmap unavailable — set GITHUB_TOKEN on the API to enable live data.
          </p>
        ) : null}

        {tip ? (
          <div
            className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-full rounded-md bg-[var(--ink)] px-2 py-1 text-[11px] font-medium text-[var(--paper)] shadow-md"
            style={{ left: tip.x, top: tip.y, color: "var(--paper)" }}
          >
            {tip.text}
          </div>
        ) : null}
      </div>
    </section>
  );
}
