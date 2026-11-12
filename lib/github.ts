export const githubUsername = "dk-e";

// Set to another repository name to pin it, or null to show just the latest three.
export const pinnedRepository: string | null = "website";

type Repository = {
  name: string;
  description: string | null;
  html_url: string;
  pushed_at: string;
  fork: boolean;
};

async function githubFetch<T>(path: string): Promise<T> {
  const response = await fetch(`https://api.github.com${path}`, {
    headers: { Accept: "application/vnd.github+json" },
    next: { revalidate: 3600 },
    signal: AbortSignal.timeout(8000),
  });

  if (!response.ok) {
    throw new Error(`GitHub returned ${response.status}`);
  }

  return response.json() as Promise<T>;
}

async function getLatestRepositories() {
  const repositories: Repository[] = [];
  for (let page = 1; repositories.length < 3; page++) {
    const batch = await githubFetch<Repository[]>(
      `/users/${githubUsername}/repos?sort=pushed&direction=desc&per_page=100&page=${page}`,
    );
    repositories.push(...batch.filter((repo) => !repo.fork));
    if (batch.length < 100) break;
  }
  return repositories.slice(0, 3);
}

export async function getRepositories() {
  const [latest, pinnedResult] = await Promise.all([
    getLatestRepositories(),
    pinnedRepository
      ? githubFetch<Repository>(
          `/repos/${githubUsername}/${encodeURIComponent(pinnedRepository)}`,
        ).catch((error: unknown) => {
          console.error("Could not load pinned GitHub repository:", error);
          return null;
        })
      : Promise.resolve(null),
  ]);
  const pinned = pinnedResult && !pinnedResult.fork ? pinnedResult : null;

  return [
    ...(pinned ? [pinned] : []),
    ...latest.filter((repo) => repo.name !== pinned?.name),
  ].slice(0, 3).map((repo) => ({ ...repo, pinned: repo.name === pinned?.name }));
}
