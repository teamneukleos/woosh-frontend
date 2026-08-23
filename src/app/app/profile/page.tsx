import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getWorkspaceContext } from "@/lib/workspace";
import { prisma } from "@/lib/db";
import {
  addPortfolioItemAction,
  createRatePackageAction,
  deletePortfolioItemAction,
  deleteRatePackageAction,
  devOAuthCompleteAction,
  reorderPortfolioItemsAction,
  submitCreatorForReviewAction,
  updateCreatorProfileAction,
  updatePortfolioItemAction,
  uploadCreatorImageAction,
} from "@/app/actions";
import { Panel } from "@/components/ui/panel";
import { AppPage } from "@/components/ui/app-page";
import { ButtonLink } from "@/components/ui/button-link";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ChannelMark } from "@/components/ui/social-icon";
import { VerifiedCheck } from "@/components/ui/verified-check";
import { Button } from "@/components/ui/button";
import { Input, TextArea, Label, Select } from "@/components/ui/field";
import {
  CategoryPicker,
  LanguagePicker,
} from "@/components/ui/taxonomy-pickers";
import { SocialConnections } from "@/components/creator/social-connections";
import {
  BRAND_INDUSTRIES,
  CREATOR_CATEGORIES,
  LANGUAGES,
} from "@/lib/taxonomy";
import { FileDropzone } from "@/components/ui/file-dropzone";
import { ActionForm } from "@/components/ui/action-form";
import { formatHandle } from "@/lib/handle";
import { creatorReadiness } from "@/domains/creator/media";
import { ProgressBar } from "@/components/ui/progress";

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const ctx = await getWorkspaceContext(session.user.id);
  if (!ctx?.creatorProfile) redirect("/app/settings");

  const profile = await prisma.creatorProfile.findUniqueOrThrow({
    where: { id: ctx.creatorProfile.id },
    include: {
      user: { select: { emailVerified: true } },
      socialAccounts: {
        include: {
          snapshots: { orderBy: { capturedAt: "desc" }, take: 1 },
        },
      },
      portfolioItems: { orderBy: { sortOrder: "asc" } },
      ratePackages: { orderBy: { sortOrder: "asc" } },
    },
  });

  const accounts = profile.socialAccounts.map((a) => ({
    id: a.id,
    channel: a.channel,
    handle: a.handle,
    status: a.status,
    lastRefreshedAt: a.lastRefreshedAt,
    followers:
      a.snapshots[0]?.source !== "manual_unverified"
        ? (a.snapshots[0]?.followers ?? null)
        : null,
    source: a.snapshots[0]?.source ?? null,
    engagementRate: a.snapshots[0]?.engagementRate
      ? Number(a.snapshots[0].engagementRate)
      : null,
    averageViews: a.snapshots[0]?.averageViews ?? null,
  }));
  const readiness = creatorReadiness(profile);
  const movedPortfolioOrder = (index: number, offset: number) => {
    const ids = profile.portfolioItems.map((item) => item.id);
    const target = index + offset;
    if (target < 0 || target >= ids.length) return ids.join(",");
    [ids[index], ids[target]] = [ids[target]!, ids[index]!];
    return ids.join(",");
  };

  return (
    <AppPage
      eyebrow="Creator"
      title="Your creator profile"
      description="Build the storefront brands see: your story, work, pricing and verified channel performance."
      actions={
        <ButtonLink href="/app/profile/preview" variant="secondary">
          View as brand
        </ButtonLink>
      }
      width="wide"
      className="max-w-5xl"
    >
      <Panel variant="flush">
        <div className="relative h-44 bg-gradient-to-br from-[var(--woosh-navy)] to-[var(--woosh-blue)]">
          {profile.coverUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={profile.coverUrl}
              alt=""
              className="h-full w-full object-cover"
            />
          ) : null}
        </div>
        <div className="flex flex-wrap items-end gap-4 px-5 pb-5">
          <Avatar
            name={profile.displayName}
            src={profile.avatarUrl}
            size="lg"
            className="-mt-10 size-20 border-4 border-white text-lg"
          />
          <div className="min-w-0 flex-1 pb-1">
            <p className="flex min-w-0 items-center gap-1.5 text-xl font-semibold tracking-[-0.02em] text-[var(--woosh-navy)]">
              <span className="truncate">{profile.displayName}</span>
              {profile.verifiedAt ? <VerifiedCheck size="lg" /> : null}
            </p>
            {accounts[0]?.handle ? (
              <p className="mt-1 text-sm font-medium text-[var(--woosh-navy)]">
                {formatHandle(accounts[0].handle)}
              </p>
            ) : null}
            <div className="mt-2 flex flex-wrap gap-2">
              <Badge tone={profile.profileVisible ? "teal" : "muted"}>
                {profile.marketplaceStatus.replaceAll("_", " ")}
              </Badge>
              <Badge tone={readiness.complete ? "teal" : "warn"}>
                {readiness.percentage}% complete
              </Badge>
            </div>
          </div>
        </div>
      </Panel>

      <Panel
        title="Marketplace readiness"
        description="Complete every item, then submit your profile for review."
      >
        <ProgressBar value={readiness.percentage} className="mb-5 h-2" />
        <ul className="grid gap-2 sm:grid-cols-2">
          {readiness.checks.map((check) => (
            <li
              key={check.id}
              className="flex items-center gap-2 text-sm text-[var(--woosh-dull)]"
            >
              <span
                className={`inline-flex size-5 items-center justify-center rounded-full text-xs font-semibold ${
                  check.complete
                    ? "bg-[var(--success)] text-white"
                    : "bg-[var(--woosh-mist)] text-[var(--woosh-grey)]"
                }`}
              >
                {check.complete ? "✓" : "·"}
              </span>
              {check.label}
            </li>
          ))}
        </ul>
        <ActionForm
          action={submitCreatorForReviewAction}
          successTitle="Profile submitted for review"
          className="mt-5"
        >
          <Button
            type="submit"
            disabled={
              !readiness.complete ||
              profile.marketplaceStatus === "PENDING_REVIEW"
            }
          >
            {profile.marketplaceStatus === "PENDING_REVIEW"
              ? "Review in progress"
              : "Submit for review"}
          </Button>
        </ActionForm>
      </Panel>

      <div className="grid gap-6 lg:grid-cols-2">
        <Panel
          title="Profile photo"
          description="Square JPEG, PNG or WebP. Changes are reviewed before publishing."
        >
          <ActionForm
            action={uploadCreatorImageAction}
            successTitle="Profile photo uploaded"
            className="grid gap-3"
          >
            <input type="hidden" name="kind" value="avatar" />
            <FileDropzone
              name="file"
              accept="image/jpeg,image/png,image/webp"
              required
              label="Choose profile photo"
              hint="Up to 5 MB"
            />
            <Button type="submit" className="w-fit">
              Upload photo
            </Button>
          </ActionForm>
        </Panel>
        <Panel
          title="Cover photo"
          description="A wide image that introduces your visual style."
        >
          <ActionForm
            action={uploadCreatorImageAction}
            successTitle="Cover photo uploaded"
            className="grid gap-3"
          >
            <input type="hidden" name="kind" value="cover" />
            <FileDropzone
              name="file"
              accept="image/jpeg,image/png,image/webp"
              required
              label="Choose cover image"
              hint="Up to 8 MB"
            />
            <Button type="submit" className="w-fit">
              Upload cover
            </Button>
          </ActionForm>
        </Panel>
      </div>

      <Panel title="Edit profile">
        <ActionForm
          action={updateCreatorProfileAction}
          successTitle="Profile saved"
          className="grid gap-4"
        >
          <Label>
            Display name
            <Input
              name="displayName"
              defaultValue={profile.displayName}
              required
            />
          </Label>
          <Label>
            Bio
            <TextArea
              name="bio"
              defaultValue={profile.bio ?? ""}
              rows={5}
              placeholder="Describe your voice, audience and the work you create."
            />
          </Label>
          <Label>
            Website or link-in-bio
            <Input
              name="websiteUrl"
              type="url"
              defaultValue={profile.websiteUrl ?? ""}
              placeholder="https://"
            />
          </Label>
          <div className="grid gap-3 sm:grid-cols-2">
            <Label>
              Country
              <Input
                name="locationCountry"
                defaultValue={profile.locationCountry ?? "NG"}
              />
            </Label>
            <Label>
              State
              <Input
                name="locationState"
                defaultValue={profile.locationState ?? ""}
              />
            </Label>
            <Label>
              City
              <Input
                name="locationCity"
                defaultValue={profile.locationCity ?? ""}
              />
            </Label>
          </div>
          <CategoryPicker
            options={CREATOR_CATEGORIES}
            defaultSelected={profile.categories}
          />
          <LanguagePicker
            options={LANGUAGES}
            defaultSelected={profile.languages}
          />
          <div className="grid gap-3 sm:grid-cols-2">
            <Label>
              Preferred brand industries
              <Select
                name="preferredIndustries"
                multiple
                size={6}
                defaultValue={profile.preferredIndustries}
              >
                {BRAND_INDUSTRIES.map((industry) => (
                  <option key={industry}>{industry}</option>
                ))}
              </Select>
              <span className="text-xs font-normal text-[var(--woosh-dull)]/55">
                Hold Cmd/Ctrl to select more than one.
              </span>
            </Label>
            <Label>
              Industries to exclude
              <Select
                name="excludedIndustries"
                multiple
                size={6}
                defaultValue={profile.excludedIndustries}
              >
                {BRAND_INDUSTRIES.map((industry) => (
                  <option key={industry}>{industry}</option>
                ))}
              </Select>
            </Label>
          </div>
          <Label>
            Availability
            <TextArea
              name="availabilityNotes"
              defaultValue={profile.availabilityNotes ?? ""}
              placeholder="Example: Available for two campaigns per month; Lagos travel preferred."
            />
          </Label>
          <div className="grid gap-3 sm:grid-cols-2">
            <Label>
              Age band (optional)
              <Select name="ageBand" defaultValue={profile.ageBand ?? ""}>
                <option value="">Prefer not to say</option>
                <option value="18-24">18–24</option>
                <option value="25-34">25–34</option>
                <option value="35-44">35–44</option>
                <option value="45+">45+</option>
              </Select>
            </Label>
            <Label>
              Gender (optional)
              <Select name="gender" defaultValue={profile.gender ?? ""}>
                <option value="">Prefer not to say</option>
                <option value="Woman">Woman</option>
                <option value="Man">Man</option>
                <option value="Non-binary">Non-binary</option>
                <option value="Self-described">Self-described</option>
              </Select>
            </Label>
          </div>
          <div className="grid gap-2 text-sm text-[var(--woosh-navy)]">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                name="ageSearchable"
                defaultChecked={profile.ageSearchable}
              />
              Allow brands to filter by my age band
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                name="genderSearchable"
                defaultChecked={profile.genderSearchable}
              />
              Allow brands to filter by my gender
            </label>
          </div>
          <Button type="submit" className="w-fit">
            Save profile
          </Button>
        </ActionForm>
      </Panel>

      <Panel
        title="Connected accounts"
        description="Metrics are read from providers and always labelled with source and freshness."
      >
        <SocialConnections accounts={accounts} />
      </Panel>

      {process.env.WOOSH_ALLOW_DEV_OAUTH === "true" ? (
        <Panel title="Dev social connection">
          <ActionForm
            action={devOAuthCompleteAction}
            successTitle="Demo channel connected"
            className="grid gap-3 sm:grid-cols-3"
          >
            <Label>
              Channel
              <Select name="channel">
                <option value="INSTAGRAM">Instagram</option>
                <option value="TIKTOK">TikTok</option>
                <option value="YOUTUBE">YouTube</option>
              </Select>
            </Label>
            <Label>
              Handle
              <Input name="handle" required placeholder="yourhandle" />
            </Label>
            <Label>
              Followers
              <Input name="followers" type="number" min={0} />
            </Label>
            <Button type="submit" className="w-fit sm:col-span-3">
              Complete demo connection
            </Button>
          </ActionForm>
        </Panel>
      ) : null}

      <Panel
        title="Rate packages"
        description="Tell brands exactly what they can book and what is included."
      >
        <div className="grid gap-3 md:grid-cols-2">
          {profile.ratePackages.map((rate) => (
            <article
              key={rate.id}
              className="rounded-[var(--radius-md)] border border-[var(--woosh-border)] bg-white p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <ChannelMark channel={rate.channel} />
                  <h3 className="mt-2 font-semibold text-[var(--woosh-navy)]">
                    {rate.title}
                  </h3>
                  <p className="mt-1 text-sm text-[var(--woosh-dull)]/70">
                    {rate.deliverableType} · {rate.turnaroundDays ?? "—"} day
                    turnaround · {rate.revisions} revision
                    {rate.revisions === 1 ? "" : "s"}
                  </p>
                </div>
                <strong className="text-[var(--woosh-navy)]">
                  {rate.currency} {Number(rate.price).toLocaleString()}
                </strong>
              </div>
              <ActionForm
                action={deleteRatePackageAction}
                successTitle="Rate removed"
                className="mt-3"
              >
                <input type="hidden" name="ratePackageId" value={rate.id} />
                <Button type="submit" size="sm" variant="ghost">
                  Remove
                </Button>
              </ActionForm>
            </article>
          ))}
        </div>
        <ActionForm
          action={createRatePackageAction}
          successTitle="Rate package added"
          className="mt-5 grid gap-3 rounded-[var(--radius-md)] border border-dashed border-[var(--woosh-border)] p-4 md:grid-cols-2"
        >
          <Label>
            Channel
            <Select name="channel">
              <option value="INSTAGRAM">Instagram</option>
              <option value="TIKTOK">TikTok</option>
              <option value="YOUTUBE">YouTube</option>
            </Select>
          </Label>
          <Label>
            Deliverable type
            <Select name="deliverableType">
              <option>Reel / Short</option>
              <option>Feed post</option>
              <option>Story set</option>
              <option>UGC ad</option>
              <option>Product review</option>
              <option>Event coverage</option>
            </Select>
          </Label>
          <Label>
            Package title
            <Input name="title" required placeholder="1 branded Reel" />
          </Label>
          <Label>
            Price
            <div className="flex gap-2">
              <Input name="currency" defaultValue="NGN" className="w-24" />
              <Input name="price" type="number" min={1} required />
            </div>
          </Label>
          <Label>
            Turnaround days
            <Input name="turnaroundDays" type="number" min={1} />
          </Label>
          <Label>
            Revisions
            <Input name="revisions" type="number" min={0} defaultValue={1} />
          </Label>
          <Label className="md:col-span-2">
            Description
            <TextArea name="description" rows={2} />
          </Label>
          <Label className="md:col-span-2">
            Usage rights
            <Input
              name="usageRights"
              placeholder="Example: 30 days organic usage"
            />
          </Label>
          <Button type="submit" className="w-fit">
            Add package
          </Button>
        </ActionForm>
      </Panel>

      <Panel
        title="Content portfolio"
        description="Add your strongest images, videos and public social posts. New samples are reviewed before brands see them."
      >
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {profile.portfolioItems.map((item, index) => (
            <article
              key={item.id}
              className="overflow-hidden rounded-[var(--radius-md)] border border-[var(--woosh-border)] bg-white"
            >
              <div className="aspect-[4/3] bg-[var(--woosh-mist)]">
                {item.mediaType === "IMAGE" ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={item.url}
                    alt={item.title}
                    className="h-full w-full object-cover"
                  />
                ) : item.mediaType === "VIDEO" ? (
                  <video
                    src={item.url}
                    controls
                    preload="metadata"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex h-full items-center justify-center p-5 text-center font-semibold text-[var(--woosh-blue)]"
                  >
                    Open social post ↗
                  </a>
                )}
              </div>
              <div className="p-3">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-semibold text-[var(--woosh-navy)]">
                    {item.title}
                  </h3>
                  <Badge
                    tone={
                      item.status === "APPROVED"
                        ? "teal"
                        : item.status === "REJECTED"
                          ? "warn"
                          : "muted"
                    }
                  >
                    {item.status}
                  </Badge>
                </div>
                {item.moderationNotes ? (
                  <p className="mt-2 text-xs text-[var(--warning)]">
                    {item.moderationNotes}
                  </p>
                ) : null}
                <details className="mt-3">
                  <summary className="cursor-pointer text-xs font-semibold text-[var(--woosh-blue)]">
                    Edit details
                  </summary>
                  <ActionForm
                    action={updatePortfolioItemAction}
                    successTitle="Portfolio details updated"
                    className="mt-3 grid gap-2"
                  >
                    <input type="hidden" name="itemId" value={item.id} />
                    <Input name="title" defaultValue={item.title} required />
                    <TextArea
                      name="description"
                      defaultValue={item.description ?? ""}
                      rows={2}
                    />
                    <Select
                      name="channel"
                      defaultValue={item.channel ?? ""}
                    >
                      <option value="">Not platform-specific</option>
                      <option value="INSTAGRAM">Instagram</option>
                      <option value="TIKTOK">TikTok</option>
                      <option value="YOUTUBE">YouTube</option>
                    </Select>
                    <Input
                      name="campaignType"
                      defaultValue={item.campaignType ?? ""}
                      placeholder="Campaign type"
                    />
                    <Input
                      name="brandName"
                      defaultValue={item.brandName ?? ""}
                      placeholder="Brand"
                    />
                    <Input
                      name="tags"
                      defaultValue={item.tags.join(", ")}
                      placeholder="Tags"
                    />
                    <Button type="submit" size="sm" className="w-fit">
                      Save details
                    </Button>
                  </ActionForm>
                </details>
                <ActionForm
                  action={deletePortfolioItemAction}
                  successTitle="Portfolio item deleted"
                  className="mt-3"
                >
                  <input type="hidden" name="itemId" value={item.id} />
                  <Button type="submit" size="sm" variant="ghost">
                    Delete
                  </Button>
                </ActionForm>
                <div className="mt-2 flex gap-2">
                  <ActionForm
                    action={reorderPortfolioItemsAction}
                    successTitle="Portfolio reordered"
                  >
                    <input
                      type="hidden"
                      name="orderedIds"
                      value={movedPortfolioOrder(index, -1)}
                    />
                    <Button
                      type="submit"
                      size="sm"
                      variant="ghost"
                      disabled={index === 0}
                    >
                      Move earlier
                    </Button>
                  </ActionForm>
                  <ActionForm
                    action={reorderPortfolioItemsAction}
                    successTitle="Portfolio reordered"
                  >
                    <input
                      type="hidden"
                      name="orderedIds"
                      value={movedPortfolioOrder(index, 1)}
                    />
                    <Button
                      type="submit"
                      size="sm"
                      variant="ghost"
                      disabled={index === profile.portfolioItems.length - 1}
                    >
                      Move later
                    </Button>
                  </ActionForm>
                </div>
              </div>
            </article>
          ))}
        </div>
        <ActionForm
          action={addPortfolioItemAction}
          successTitle="Portfolio sample added"
          className="mt-5 grid gap-3 rounded-[var(--radius-md)] border border-dashed border-[var(--woosh-border)] p-4 md:grid-cols-2"
        >
          <Label>
            Sample title
            <Input name="title" required placeholder="Summer product Reel" />
          </Label>
          <Label>
            Channel
            <Select name="channel" defaultValue="">
              <option value="">Not platform-specific</option>
              <option value="INSTAGRAM">Instagram</option>
              <option value="TIKTOK">TikTok</option>
              <option value="YOUTUBE">YouTube</option>
            </Select>
          </Label>
          <Label>
            Campaign type
            <Select name="campaignType">
              <option>Reel / Short</option>
              <option>Feed post</option>
              <option>Story</option>
              <option>UGC ad</option>
              <option>Review</option>
              <option>Event coverage</option>
            </Select>
          </Label>
          <Label>
            Brand (optional)
            <Input name="brandName" />
          </Label>
          <Label className="md:col-span-2">
            Description
            <TextArea name="description" rows={2} />
          </Label>
          <Label>
            Tags
            <Input name="tags" placeholder="beauty, tutorial, product" />
          </Label>
          <Label>
            Social post URL instead of file
            <Input name="embedUrl" type="url" placeholder="https://..." />
          </Label>
          <div className="md:col-span-2">
            <FileDropzone
              name="file"
              accept="image/jpeg,image/png,image/webp,video/mp4,video/quicktime"
              label="Upload photo or video"
              hint="Images up to 20 MB; videos up to 100 MB. Or use a social URL above."
            />
          </div>
          <Button type="submit" className="w-fit">
            Add sample
          </Button>
        </ActionForm>
      </Panel>
    </AppPage>
  );
}
