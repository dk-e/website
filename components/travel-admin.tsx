"use client";

import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import { Check, LogOut, Pencil, Plus, Trash2 } from "lucide-react";
import {
  countries,
  countryByCode,
  currentVisitDate,
  flag,
  formatVisitDate,
  travelStats,
} from "../lib/travel/model";
import type { Passport, Visit } from "../lib/travel/model";
import { PassportCard } from "./travel";

const field =
  "mt-2 w-full scroll-mt-28 rounded-lg border border-zinc-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/15 dark:border-zinc-700 dark:bg-zinc-900";
const primary =
  "inline-flex items-center justify-center gap-2 rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-40 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white";

async function api<T>(
  path: string,
  method = "GET",
  body?: unknown,
): Promise<T> {
  const response = await fetch(path, {
    method,
    headers: { "Content-Type": "application/json" },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
    cache: "no-store",
  });
  const result = await response.json();
  if (!response.ok)
    throw new Error(result.error || "Something went wrong. Please try again.");
  return result;
}

export default function TravelAdmin({
  authenticated,
}: {
  authenticated: boolean;
}) {
  const [signedIn, setSignedIn] = useState(authenticated);
  const [password, setPassword] = useState("");
  const [draft, setDraft] = useState<Passport | null>(null);
  const [saved, setSaved] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [countryName, setCountryName] = useState("");
  // null follows today's date until the user explicitly changes or clears it.
  const [date, setDate] = useState<string | null>(null);
  const [city, setCity] = useState("");
  const [preview, setPreview] = useState(false);
  const countryInput = useRef<HTMLInputElement>(null);
  const dirty = draft !== null && JSON.stringify(draft) !== saved;

  useEffect(() => {
    if (!signedIn || draft) return;
    let active = true;
    api<Passport>("/api/admin/travel")
      .then((data) => {
        if (active) {
          setDraft(data);
          setSaved(JSON.stringify(data));
        }
      })
      .catch((reason: Error) => {
        if (active) setError(reason.message);
      });
    return () => {
      active = false;
    };
  }, [signedIn, draft]);

  useEffect(() => {
    if (!dirty) return;
    const warn = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  async function login(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      await api("/api/admin/travel/session", "POST", { password });
      setSignedIn(true);
      setPassword("");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Could not sign in.");
    } finally {
      setBusy(false);
    }
  }

  function resetForm() {
    setEditingId(null);
    setCountryName("");
    setDate(null);
    setCity("");
  }

  function addVisit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!draft) return;
    const country = countries.find(
      (item) =>
        item.name.toLowerCase() === countryName.trim().toLowerCase() ||
        item.code.toLowerCase() === countryName.trim().toLowerCase(),
    );
    if (!country) {
      setError("Choose a country from the suggestions.");
      countryInput.current?.focus();
      return;
    }
    const visit: Visit = {
      id: editingId ?? crypto.randomUUID(),
      country: country.code,
      date: date ?? currentVisitDate(),
      city: city.trim(),
    };
    const visits = editingId
      ? draft.visits.map((item) => (item.id === editingId ? visit : item))
      : [...draft.visits, visit];
    setDraft({
      ...draft,
      visits,
      latestCountry: visits.some((item) => item.country === draft.latestCountry)
        ? draft.latestCountry
        : "",
    });
    setError("");
    setMessage(
      editingId
        ? "Visit updated in your draft. Save changes to publish."
        : "Visit added to your draft. Save changes to publish.",
    );
    resetForm();
  }

  async function save() {
    if (!draft) return;
    setBusy(true);
    setError("");
    setMessage("");
    try {
      const result = await api<Passport>("/api/admin/travel", "PUT", draft);
      setDraft(result);
      setSaved(JSON.stringify(result));
      setMessage("Saved. Your public passport will update within 90 seconds.");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Could not save.");
    } finally {
      setBusy(false);
    }
  }

  async function reload() {
    if (
      dirty &&
      !window.confirm("Discard your unsaved changes and reload saved visits?")
    )
      return;
    setBusy(true);
    setError("");
    try {
      const result = await api<Passport>("/api/admin/travel");
      setDraft(result);
      setSaved(JSON.stringify(result));
      setMessage("");
      resetForm();
    } catch (reason) {
      setError(
        reason instanceof Error ? reason.message : "Could not load visits.",
      );
    } finally {
      setBusy(false);
    }
  }

  async function logout() {
    if (dirty && !window.confirm("Sign out and discard your unsaved changes?"))
      return;
    setBusy(true);
    setError("");
    try {
      await api("/api/admin/travel/session", "DELETE");
      setSignedIn(false);
      setDraft(null);
      setSaved("");
      setMessage("");
      resetForm();
    } catch (reason) {
      setError(
        reason instanceof Error ? reason.message : "Could not sign out.",
      );
    } finally {
      setBusy(false);
    }
  }

  const feedback = (
    <div aria-live="polite">
      {error && (
        <p
          role="alert"
          className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-950/30 dark:text-red-300"
        >
          {error}
        </p>
      )}
      {message && !error && (
        <p className="flex items-start gap-2 text-sm text-zinc-500">
          <Check aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0" />
          {message}
        </p>
      )}
    </div>
  );

  if (!signedIn)
    return (
      <form
        onSubmit={login}
        className="space-y-5 rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900/50"
      >
        <label className="block text-sm font-medium">
          Admin password
          <input
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
            maxLength={512}
            className={field}
          />
        </label>
        {feedback}
        <button disabled={busy} className={primary}>
          {busy ? "Signing in…" : "Sign in"}
        </button>
        <p className="text-xs text-zinc-500">
          You&apos;ll stay signed in on this browser for 7 days.
        </p>
      </form>
    );

  if (!draft)
    return (
      <div className="space-y-4">
        {feedback}
        <p className="text-sm text-zinc-500">
          {error
            ? "Your saved visits could not be loaded."
            : "Loading your passport…"}
        </p>
        {error && (
          <button
            type="button"
            disabled={busy}
            onClick={() => void reload()}
            className={primary}
          >
            Try again
          </button>
        )}
        <button
          type="button"
          onClick={() => void logout()}
          className="ml-4 text-sm text-zinc-500"
        >
          Sign out
        </button>
      </div>
    );

  const stats = travelStats(draft.visits, draft.latestCountry);
  const sortedCountries = [...stats.visited].sort((a, b) =>
    (countryByCode.get(a)?.name ?? "").localeCompare(
      countryByCode.get(b)?.name ?? "",
    ),
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 text-sm">
        <p className="text-zinc-500">
          {stats.visited.length} countries · {stats.continents} continents
        </p>
        <button
          type="button"
          disabled={busy}
          onClick={() => void logout()}
          className="flex items-center gap-1.5 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
        >
          <LogOut aria-hidden="true" className="h-3.5 w-3.5" />
          Sign out
        </button>
      </div>
      <div className="sticky top-4 z-10 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-zinc-200 bg-white/95 p-3 shadow-sm backdrop-blur dark:border-zinc-700 dark:bg-zinc-900/95">
        <span className="pl-1 text-xs text-zinc-500">
          {dirty ? "Unsaved changes" : "All changes saved"}
        </span>
        <div className="flex items-center gap-3">
          <button
            type="button"
            disabled={busy}
            onClick={() => void reload()}
            className="text-xs text-zinc-500"
          >
            Reload saved
          </button>
          <button
            type="button"
            disabled={busy || !dirty || editingId !== null}
            onClick={() => void save()}
            className={primary}
          >
            {busy ? "Saving…" : "Save changes"}
          </button>
        </div>
      </div>
      <form
        onSubmit={addVisit}
        className="space-y-4 rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900/50 sm:p-6"
      >
        <fieldset disabled={busy} className="space-y-4">
          <legend className="mb-4 text-sm font-medium">
            {editingId ? "Edit visit" : "Add a visit"}
          </legend>
          <label className="block text-xs text-zinc-500">
            Country
            <input
              ref={countryInput}
              list="country-options"
              value={countryName}
              onChange={(event) => setCountryName(event.target.value)}
              placeholder="Search for a country…"
              autoComplete="off"
              required
              className={field}
            />
            <datalist id="country-options">
              {countries.map((country) => (
                <option key={country.code} value={country.name} />
              ))}
            </datalist>
          </label>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-xs text-zinc-500">
              City <span className="text-zinc-400">(optional)</span>
              <input
                value={city}
                onChange={(event) => setCity(event.target.value)}
                placeholder="e.g. Paris"
                maxLength={100}
                className={field}
              />
            </label>
            <label className="block text-xs text-zinc-500">
              Visit date <span className="text-zinc-400">(optional)</span>
              <input
                type="date"
                value={date ?? currentVisitDate()}
                onChange={(event) => setDate(event.target.value)}
                min="1900-01-01"
                max={currentVisitDate()}
                className={field}
              />
            </label>
          </div>
          <p className="text-xs leading-relaxed text-zinc-500">
            New visits default to today. Change the date for an earlier trip, or
            clear it if you don&apos;t remember. Each country is counted once.
          </p>
          <div className="flex gap-3">
            <button className={primary}>
              <Plus aria-hidden="true" className="h-4 w-4" />
              {editingId ? "Update visit" : "Add to passport"}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="px-3 text-sm text-zinc-500"
              >
                Cancel edit
              </button>
            )}
          </div>
        </fieldset>
      </form>

      <label className="block text-sm font-medium">
        Most recent country
        <select
          disabled={busy}
          value={draft.latestCountry}
          onChange={(event) => {
            setDraft({ ...draft, latestCountry: event.target.value });
            setMessage("");
          }}
          className={field}
        >
          <option value="">Use latest dated visit</option>
          {sortedCountries.map((code) => (
            <option key={code} value={code}>
              {countryByCode.get(code)?.name}
            </option>
          ))}
        </select>
        <span className="mt-2 block text-xs font-normal text-zinc-500">
          Choose it yourself, even if you haven&apos;t recorded a date.
        </span>
      </label>

      <div>
        <h2 className="section-kicker mb-3">Your visits</h2>
        <ul className="divide-y divide-zinc-200 dark:divide-zinc-800">
          {[...draft.visits]
            .sort(
              (a, b) =>
                b.date.localeCompare(a.date) ||
                (countryByCode.get(a.country)?.name ?? "").localeCompare(
                  countryByCode.get(b.country)?.name ?? "",
                ),
            )
            .map((visit) => (
              <li key={visit.id} className="flex items-center gap-3 py-3">
                <span aria-hidden="true" className="text-xl">
                  {flag(visit.country)}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm">
                    {countryByCode.get(visit.country)?.name}
                  </p>
                  <p className="mt-0.5 text-xs text-zinc-500">
                    {[visit.city, formatVisitDate(visit.date)]
                      .filter(Boolean)
                      .join(" · ")}
                  </p>
                </div>
                <button
                  type="button"
                  disabled={busy}
                  aria-label={`Edit ${countryByCode.get(visit.country)?.name} visit`}
                  onClick={() => {
                    setEditingId(visit.id);
                    setCountryName(
                      countryByCode.get(visit.country)?.name ?? "",
                    );
                    setDate(visit.date);
                    setCity(visit.city);
                    countryInput.current?.focus();
                  }}
                  className="rounded-lg p-2.5 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                >
                  <Pencil aria-hidden="true" className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  disabled={busy}
                  aria-label={`Remove ${countryByCode.get(visit.country)?.name} visit`}
                  onClick={() => {
                    const visits = draft.visits.filter(
                      (item) => item.id !== visit.id,
                    );
                    setDraft({
                      ...draft,
                      visits,
                      latestCountry: visits.some(
                        (item) => item.country === draft.latestCountry,
                      )
                        ? draft.latestCountry
                        : "",
                    });
                    if (editingId === visit.id) resetForm();
                    setMessage(
                      "Visit removed from your draft. Save changes to publish.",
                    );
                  }}
                  className="rounded-lg p-2.5 text-zinc-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/30"
                >
                  <Trash2 aria-hidden="true" className="h-3.5 w-3.5" />
                </button>
              </li>
            ))}
        </ul>
        {!draft.visits.length && (
          <p className="py-6 text-sm text-zinc-500">
            No visits yet. Add your first country above.
          </p>
        )}
      </div>

      {feedback}
      {editingId && (
        <p className="text-xs text-zinc-500">
          Update or cancel the visit you&apos;re editing before saving.
        </p>
      )}
      <button
        type="button"
        onClick={() => setPreview(!preview)}
        aria-expanded={preview}
        className="text-sm text-zinc-500 underline underline-offset-4"
      >
        {preview ? "Hide preview" : "Preview passport"}
      </button>
      {preview && <PassportCard passport={draft} />}
      <p className="text-xs leading-relaxed text-zinc-500">
        Country totals count unique destinations. The selector includes
        countries and territories. Dates and cities you save are public.
      </p>
    </div>
  );
}
