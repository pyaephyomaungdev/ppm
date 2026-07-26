export type ContributionDay = {
  date: string;
  count: number;
  level: number;
};

export type ContributionYear = {
  year: number;
  total: number;
  days: ContributionDay[];
  source: "github" | "cache" | "empty";
};

const CACHE_TTL = 60 * 60; // 1 hour

function levelFromCount(count: number): number {
  if (count <= 0) return 0;
  if (count <= 2) return 1;
  if (count <= 5) return 2;
  if (count <= 10) return 3;
  return 4;
}

export async function fetchGithubContributions(
  year: number,
  opts: {
    username: string;
    token?: string;
    redisGet: (key: string) => Promise<string | null>;
    redisSet: (key: string, value: string, ttl: number) => Promise<void>;
  },
): Promise<ContributionYear> {
  const cacheKey = `gh:contrib:${opts.username}:${year}`;
  const cached = await opts.redisGet(cacheKey);
  if (cached) {
    try {
      const parsed = JSON.parse(cached) as ContributionYear;
      return { ...parsed, source: "cache" };
    } catch {
      /* fall through */
    }
  }

  if (!opts.token) {
    return { year, total: 0, days: [], source: "empty" };
  }

  const from = `${year}-01-01T00:00:00Z`;
  const to = `${year}-12-31T23:59:59Z`;
  const query = `
    query($login: String!, $from: DateTime!, $to: DateTime!) {
      user(login: $login) {
        contributionsCollection(from: $from, to: $to) {
          contributionCalendar {
            totalContributions
            weeks {
              contributionDays {
                date
                contributionCount
                contributionLevel
              }
            }
          }
        }
      }
    }
  `;

  const res = await fetch("https://api.github.com/graphql", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${opts.token}`,
      "Content-Type": "application/json",
      "User-Agent": "ppm-portfolio",
    },
    body: JSON.stringify({
      query,
      variables: { login: opts.username, from, to },
    }),
  });

  if (!res.ok) {
    console.error("GitHub GraphQL failed", res.status, await res.text());
    return { year, total: 0, days: [], source: "empty" };
  }

  const json = (await res.json()) as {
    data?: {
      user?: {
        contributionsCollection?: {
          contributionCalendar?: {
            totalContributions: number;
            weeks: Array<{
              contributionDays: Array<{
                date: string;
                contributionCount: number;
                contributionLevel: string;
              }>;
            }>;
          };
        };
      };
    };
    errors?: unknown;
  };

  if (json.errors || !json.data?.user?.contributionsCollection) {
    console.error("GitHub GraphQL errors", json.errors);
    return { year, total: 0, days: [], source: "empty" };
  }

  const cal = json.data.user.contributionsCollection.contributionCalendar!;
  const levelMap: Record<string, number> = {
    NONE: 0,
    FIRST_QUARTILE: 1,
    SECOND_QUARTILE: 2,
    THIRD_QUARTILE: 3,
    FOURTH_QUARTILE: 4,
  };

  const days: ContributionDay[] = [];
  for (const week of cal.weeks) {
    for (const d of week.contributionDays) {
      days.push({
        date: d.date,
        count: d.contributionCount,
        level: levelMap[d.contributionLevel] ?? levelFromCount(d.contributionCount),
      });
    }
  }

  const payload: ContributionYear = {
    year,
    total: cal.totalContributions,
    days,
    source: "github",
  };
  await opts.redisSet(cacheKey, JSON.stringify(payload), CACHE_TTL);
  return payload;
}
