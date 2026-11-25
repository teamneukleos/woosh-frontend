
"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Input, Label, Select } from "@/components/ui/field";
import {
  searchDiscoverySuggestions,
  type DiscoverySuggestion,
} from "@/domains/creator/discovery-suggestion";
import { DISCOVERY_CITIES } from "@/lib/discovery-catalog";
import { CREATOR_CATEGORIES, LANGUAGES, SOCIAL_CHANNELS } from "@/lib/taxonomy";

const COUNTRIES = [
  { value: "NG", label: "Nigeria" },
  { value: "GH", label: "Ghana" },
  { value: "KE", label: "Kenya" },
  { value: "ZA", label: "South Africa" },
] as const;

type Filters = {
  q?: string;
  channel?: string;
  category?: string;
  city?: string;
  minFollowers?: string;
  sort?: string;
  country?: string;
  language?: string;
  minEngagement?: string;
  minAverageViews?: string;
  type?: string;
};

const FILTER_KEYS = [
  "q",
  "channel",
  "category",
  "city",
  "minFollowers",
  "sort",
  "country",
  "language",
  "minEngagement",
  "minAverageViews",
  "type",
] as const;

export function CreatorDiscoveryFilters({
  q,
  channel,
  category,
  city,
  minFollowers,
  sort,
  country,
  language,
  minEngagement,
  minAverageViews,
  type,
}: Filters) {
  const router = useRouter();
  const pathname = usePathname();
  const formRef = useRef<HTMLFormElement>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const suggestionTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const requestIdRef = useRef(0);

  const [search, setSearch] = useState(q ?? "");
  const [engagement, setEngagement] = useState(minEngagement ?? "");
  const [averageViews, setAverageViews] = useState(minAverageViews ?? "");
  const [suggestions, setSuggestions] = useState<DiscoverySuggestion[]>([]);
  const [suggestionsOpen, setSuggestionsOpen] = useState(false);
  const [suggestionsLoading, setSuggestionsLoading] = useState(false);

  const moreOpen = Boolean(
    country || language || minEngagement || minAverageViews,
  );

  useEffect(() => {
    setSearch(q ?? "");
    setEngagement(minEngagement ?? "");
    setAverageViews(minAverageViews ?? "");
  }, [q, minEngagement, minAverageViews]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (suggestionTimeoutRef.current) {
        clearTimeout(suggestionTimeoutRef.current);
      }
      requestIdRef.current += 1;
    };
  }, []);

  function updateFilters(searchOverride?: string) {
    const form = formRef.current;
    if (!form) return;

    const formData = new FormData(form);

    if (searchOverride !== undefined) {
      formData.set("q", searchOverride);
    }

    const params = new URLSearchParams();

    for (const key of FILTER_KEYS) {
      const value = String(formData.get(key) ?? "").trim();

      if (value && !(key === "sort" && value === "followers")) {
        params.set(key, value);
      }
    }

    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, {
      scroll: false,
    });
  }

  function applyImmediately() {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    updateFilters();
  }

  function applyAfterTyping() {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    timeoutRef.current = setTimeout(() => {
      updateFilters();
      timeoutRef.current = null;
    }, 300);
  }

  function handleSearchChange(value: string) {
    setSearch(value);
    setSuggestions([]);
    setSuggestionsLoading(false);

    if (suggestionTimeoutRef.current) {
      clearTimeout(suggestionTimeoutRef.current);
    }

    const requestId = ++requestIdRef.current;
    const query = value.trim();

    if (query.length < 2) {
      setSuggestionsOpen(false);
      return;
    }

    setSuggestionsOpen(true);
    setSuggestionsLoading(true);

    suggestionTimeoutRef.current = setTimeout(async () => {
      try {
        const results = await searchDiscoverySuggestions(query);

        if (requestId === requestIdRef.current) {
          setSuggestions(results);
        }
      } catch {
        if (requestId === requestIdRef.current) {
          setSuggestions([]);
        }
      } finally {
        if (requestId === requestIdRef.current) {
          setSuggestionsLoading(false);
        }
      }
    }, 250);
  }

  function selectSuggestion(suggestion: DiscoverySuggestion) {
    if (suggestionTimeoutRef.current) {
      clearTimeout(suggestionTimeoutRef.current);
    }

    requestIdRef.current += 1;
    setSearch(suggestion.handle || suggestion.displayName);
    setSuggestions([]);
    setSuggestionsOpen(false);
    setSuggestionsLoading(false);
    updateFilters(suggestion.handle || suggestion.displayName);
  }

  function submitSearch() {
    if (suggestionTimeoutRef.current) {
      clearTimeout(suggestionTimeoutRef.current);
    }

    requestIdRef.current += 1;
    setSuggestions([]);
    setSuggestionsOpen(false);
    setSuggestionsLoading(false);
    updateFilters();
  }

  return (
    <form
      ref={formRef}
      action="/app/creators"
      method="get"
      onSubmit={(event) => {
        event.preventDefault();
        submitSearch();
      }}
      onChange={(event) => {
        const target = event.target;

        if (target instanceof HTMLSelectElement) {
          applyImmediately();
        }
      }}
      className="flex w-full min-w-0 flex-col gap-4"
    >
      <Label>
        Search
        <div className="relative">
          <Input
            name="q"
            value={search}
            onChange={(event) => handleSearchChange(event.target.value)}
            onFocus={() => {
              if (search.trim().length >= 2) {
                setSuggestionsOpen(true);
              }
            }}
            onBlur={() => {
              setTimeout(() => setSuggestionsOpen(false), 150);
            }}
            placeholder="Name or handle"
            autoComplete="off"
          />

          {suggestionsOpen && (
            <div
            className="absolute left-0 right-0 top-full z-[100] mt-1 overflow-hidden rounded-[var(--radius-md)] border border-[var(--woosh-border)] bg-[var(--surface-sunken)] shadow-xl"
            role="listbox"
            >
              {suggestionsLoading && (
                <p className="px-3 py-2 text-sm text-[var(--muted-foreground)]">
                  Searching...
                </p>
              )}

              {!suggestionsLoading && suggestions.length === 0 && (
                <p className="px-3 py-2 text-sm text-[var(--muted-foreground)]">
                  No matching creators found.
                </p>
              )}

              {suggestions.map((suggestion) => (
                <button
                  key={`${suggestion.type}-${suggestion.id}`}
                  type="button"
                  role="option"
                  aria-selected={false}
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => selectSuggestion(suggestion)}
                  className="flex w-full flex-col gap-0.5 border-b border-[var(--woosh-border)] px-3 py-2.5 text-left last:border-b-0 hover:bg-[var(--surface-sunken)]"
                >
                  <span className="text-sm font-medium">
                    {suggestion.displayName}
                  </span>
                  <span className="text-xs text-[var(--muted-foreground)]">
                    {suggestion.handle ? `@${suggestion.handle.replace(/^@/, "")}` : ""}
                    {suggestion.channel ? ` · ${suggestion.channel}` : ""}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </Label>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <Label>
          Roster
          <Select name="type" defaultValue={type ?? ""}>
            <option value="">All creators</option>
            <option value="saved">Shortlisted</option>
            <option value="claimed">Claimed</option>
            <option value="prospect">Prospects</option>
          </Select>
        </Label>

        <Label>
          Platform
          <Select name="channel" defaultValue={channel ?? ""}>
            <option value="">All platforms</option>
            {SOCIAL_CHANNELS.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </Select>
        </Label>

        <Label>
          Category
          <Select name="category" defaultValue={category ?? ""}>
            <option value="">All niches</option>
            {CREATOR_CATEGORIES.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </Select>
        </Label>

        <Label>
          City
          <Select name="city" defaultValue={city ?? ""}>
            <option value="">All cities</option>
            {DISCOVERY_CITIES.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </Select>
        </Label>

        <Label>
          Followers
          <Select name="minFollowers" defaultValue={minFollowers ?? ""}>
            <option value="">Any reach</option>
            <option value="10000">10k+</option>
            <option value="50000">50k+</option>
            <option value="100000">100k+</option>
            <option value="250000">250k+</option>
          </Select>
        </Label>

        <Label>
          Sort
          <Select name="sort" defaultValue={sort ?? "followers"}>
            <option value="followers">Most followers</option>
            <option value="engagement">Highest engagement</option>
            <option value="views">Highest avg views</option>
            <option value="newest">Newest</option>
            <option value="price">Price low to high</option>
          </Select>
        </Label>
      </div>

      <details
        className="rounded-[var(--radius-md)] border border-[var(--woosh-border)] bg-[var(--surface-sunken)]/40"
        open={moreOpen || undefined}
      >
        <summary className="cursor-pointer list-none px-3 py-2.5 text-sm font-medium text-[var(--woosh-blue)] [&::-webkit-details-marker]:hidden">
          More filters
        </summary>

        <div className="grid grid-cols-1 gap-3 border-t border-[var(--woosh-border)] p-3 sm:grid-cols-2 lg:grid-cols-4">
          <Label>
            Country
            <Select name="country" defaultValue={country ?? ""}>
              <option value="">All countries</option>
              {COUNTRIES.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </Select>
          </Label>

          <Label>
            Language
            <Select name="language" defaultValue={language ?? ""}>
              <option value="">All languages</option>
              {LANGUAGES.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </Select>
          </Label>

          <Label>
            Min engagement
            <Input
              name="minEngagement"
              type="number"
              min={0}
              step="0.1"
              value={engagement}
              onChange={(event) => {
                setEngagement(event.target.value);
                applyAfterTyping();
              }}
              placeholder="e.g. 3"
            />
          </Label>

          <Label>
            Min avg views
            <Input
              name="minAverageViews"
              type="number"
              min={0}
              value={averageViews}
              onChange={(event) => {
                setAverageViews(event.target.value);
                applyAfterTyping();
              }}
              placeholder="e.g. 10000"
            />
          </Label>
        </div>
      </details>
    </form>
  );
}
