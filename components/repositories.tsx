import { ArrowUpRight, Pin } from "lucide-react";
import { getRepositories, githubUsername } from "../lib/github";

export async function RepositoryList() {
  let repositories;
  try {
    repositories = await getRepositories();
  } catch (error) {
    console.error("Could not load GitHub repositories:", error);
    return (
      <p className="text-sm text-zinc-500">
        Repositories are temporarily unavailable. You can still browse them on GitHub below.
      </p>
    );
  }

  return (
    <ul className="divide-y divide-zinc-200 dark:divide-zinc-800">
      {repositories.map((repo) => (
        <li key={repo.name}>
          <a
            href={repo.html_url}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-start justify-between gap-4 py-2.5"
          >
            <div className="min-w-0 space-y-1">
              <div className="flex items-center gap-2">
                <span className="break-all text-base text-zinc-900 transition-colors group-hover:text-zinc-600 dark:text-zinc-100 dark:group-hover:text-zinc-300">
                  {repo.name}
                </span>
                {repo.pinned && (
                  <span className="shrink-0 text-zinc-500" title="Pinned repository">
                    <Pin aria-hidden="true" className="h-3.5 w-3.5" />
                    <span className="sr-only">Pinned repository</span>
                  </span>
                )}
              </div>
              {repo.description && (
                <p className="text-sm leading-relaxed text-zinc-500">
                  {repo.description}
                </p>
              )}
            </div>
            <ArrowUpRight aria-hidden="true" className="mt-1 h-3.5 w-3.5 shrink-0 text-zinc-500 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </a>
        </li>
      ))}
    </ul>
  );
}

export function AllRepositoriesLink() {
  return (
    <a
      href={`https://github.com/${githubUsername}?tab=repositories`}
      target="_blank"
      rel="noopener noreferrer"
      className="group inline-flex items-center gap-1 text-sm text-zinc-500 transition-colors hover:text-zinc-900 dark:hover:text-zinc-100"
    >
      <span>All repositories</span>
      <ArrowUpRight aria-hidden="true" className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
    </a>
  );
}
