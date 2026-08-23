import { Button } from "@/components/ui/button";
import { Input, Label, Select } from "@/components/ui/field";
import { DISCOVERY_CITIES } from "@/lib/discovery-catalog";
import { CREATOR_CATEGORIES, LANGUAGES, SOCIAL_CHANNELS } from "@/lib/taxonomy";

const COUNTRIES = [
  { value: "NG", label: "Nigeria" },
  { value: "GH", label: "Ghana" },
  { value: "KE", label: "Kenya" },
  { value: "ZA", label: "South Africa" },
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
}: {
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
}) {
  const moreOpen = Boolean(
    country || language || minEngagement || minAverageViews,
  );

  return (
    <form className="flex w-full min-w-0 flex-col gap-4">
      <Label>
        Search
        <Input name="q" defaultValue={q} placeholder="Name or handle" />
      </Label>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
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
              defaultValue={minEngagement}
              placeholder="e.g. 3"
            />
          </Label>
          <Label>
            Min avg views
            <Input
              name="minAverageViews"
              type="number"
              min={0}
              defaultValue={minAverageViews}
              placeholder="e.g. 10000"
            />
          </Label>
        </div>
      </details>

      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button type="submit" className="w-full sm:w-auto sm:min-w-28">
          Apply
        </Button>
      </div>
    </form>
  );
}
