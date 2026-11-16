
"use client";

import { useState } from "react";
import {
  changePasswordAction,
  createClientBrandAction,
  updateNotificationPreferencesAction,
  updateOrgAction,
} from "@/app/actions";
import { BRAND_INDUSTRIES } from "@/lib/taxonomy";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Panel } from "@/components/ui/panel";
import { Button } from "@/components/ui/button";
import { ButtonLink } from "@/components/ui/button-link";
import { Input, Select, Label } from "@/components/ui/field";
import { ActionForm } from "@/components/ui/action-form";
import { Switch } from "@/components/ui/checkbox-switch";

type Org = {
  publicName: string;
  website: string | null;
  industry: string | null;
};

export function SettingsSections({
  kind,
  hasCreator,
  canManageOrganisation,
  organisation,
  notificationPreferences,
}: {
  kind: string;
  hasCreator: boolean;
  canManageOrganisation: boolean;
  organisation: Org | null;
  notificationPreferences: {
    emailNotifications: boolean;
    weeklyDigest: boolean;
  };
}) {
  const [emailNotifications, setEmailNotifications] = useState(
    notificationPreferences.emailNotifications,
  );
  const [weeklyDigest, setWeeklyDigest] = useState(
    notificationPreferences.weeklyDigest,
  );

  const defaultTab = hasCreator
    ? "profile"
    : organisation
      ? "organisation"
      : "notifications";

  return (
    <Tabs defaultValue={defaultTab} className="w-full min-w-0">
      <div className="mb-6 rounded-2xl border border-[var(--woosh-border)] bg-white p-2 shadow-[var(--shadow-soft)]">
        <TabsList className="flex h-auto w-full flex-wrap items-center justify-start gap-1.5 rounded-xl bg-[var(--woosh-mist)]/65 p-1.5">
          {hasCreator ? (
            <TabsTrigger value="profile">Profile</TabsTrigger>
          ) : null}

          {organisation ? (
            <TabsTrigger value="organisation">Organisation</TabsTrigger>
          ) : null}

          {(kind === "agency" || kind === "brand") && canManageOrganisation ? (
            <TabsTrigger value="brands">Brands</TabsTrigger>
          ) : null}

          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>
      </div>

      {hasCreator ? (
        <TabsContent value="profile" className="mt-0">
          <div className="overflow-hidden rounded-2xl border border-[var(--woosh-border)] bg-white shadow-[var(--shadow-soft)]">
            <div className="h-1 w-full bg-[var(--woosh-blue)]" />
            <div className="p-5 md:p-7">
              <Panel title="Creator profile">
                <div className="flex flex-col items-start gap-5 sm:flex-row sm:items-center sm:justify-between">
                  <p className="max-w-2xl text-sm leading-6 text-[var(--woosh-dull)]/75">
                    Categories, languages, and connected socials live on Profile.
                    Metrics sync after you connect channels — never typed in.
                  </p>
                  <ButtonLink href="/app/profile" className="w-fit shrink-0">
                    Open profile
                  </ButtonLink>
                </div>
              </Panel>
            </div>
          </div>
        </TabsContent>
      ) : null}

      {organisation ? (
        <TabsContent value="organisation" className="mt-0">
          <div className="overflow-hidden rounded-2xl border border-[var(--woosh-border)] bg-white shadow-[var(--shadow-soft)]">
            <div className="h-1 w-full bg-[var(--woosh-blue)]" />
            <div className="p-5 md:p-7">
              <Panel title="Organisation">
                <ActionForm
                  action={updateOrgAction}
                  successTitle="Organisation saved"
                  className="grid w-full gap-5 md:grid-cols-2"
                >
                  <Label>
                    Public name
                    <Input
                      name="publicName"
                      defaultValue={organisation.publicName}
                      disabled={!canManageOrganisation}
                    />
                  </Label>

                  <Label>
                    Website
                    <Input
                      name="website"
                      defaultValue={organisation.website ?? ""}
                      disabled={!canManageOrganisation}
                    />
                  </Label>

                  <Label className="md:col-span-2">
                    Industry
                    <Select
                      name="industry"
                      defaultValue={organisation.industry ?? ""}
                      disabled={!canManageOrganisation}
                    >
                      <option value="">Select industry</option>
                      {BRAND_INDUSTRIES.map((i) => (
                        <option key={i} value={i}>
                          {i}
                        </option>
                      ))}
                    </Select>
                  </Label>

                  {canManageOrganisation ? (
                    <div className="md:col-span-2">
                      <Button type="submit" className="w-fit">
                        Save organisation
                      </Button>
                    </div>
                  ) : null}
                </ActionForm>
              </Panel>
            </div>
          </div>
        </TabsContent>
      ) : null}

      {(kind === "agency" || kind === "brand") && canManageOrganisation ? (
        <TabsContent value="brands" className="mt-0">
          <div className="overflow-hidden rounded-2xl border border-[var(--woosh-border)] bg-white shadow-[var(--shadow-soft)]">
            <div className="h-1 w-full bg-[var(--woosh-blue)]" />
            <div className="p-5 md:p-7">
              <Panel title={kind === "agency" ? "Add client brand" : "Add brand"}>
                <ActionForm
                  action={createClientBrandAction}
                  successTitle="Brand created"
                  className="grid w-full gap-5 md:grid-cols-2"
                >
                  <input type="hidden" name="next" value="/app/brands" />

                  <Label>
                    Brand name
                    <Input name="name" required placeholder="Palm Cola" />
                  </Label>

                  <Label>
                    Industry
                    <Select name="industry" defaultValue="">
                      <option value="">Select industry</option>
                      {BRAND_INDUSTRIES.map((i) => (
                        <option key={i} value={i}>
                          {i}
                        </option>
                      ))}
                    </Select>
                  </Label>

                  <div className="md:col-span-2">
                    <Button type="submit" variant="secondary" className="w-fit">
                      Create brand
                    </Button>
                  </div>
                </ActionForm>
              </Panel>
            </div>
          </div>
        </TabsContent>
      ) : null}

      <TabsContent value="notifications" className="mt-0">
        <div className="overflow-hidden rounded-2xl border border-[var(--woosh-border)] bg-white shadow-[var(--shadow-soft)]">
          <div className="h-1 w-full bg-[var(--woosh-blue)]" />
          <div className="p-5 md:p-7">
            <Panel
              title="Notification preferences"
              description="Control optional email updates. Security and transactional messages are always delivered."
            >
              <ActionForm
                action={updateNotificationPreferencesAction}
                successTitle="Notification preferences saved"
                className="grid w-full gap-4"
              >
                <label className="flex items-center justify-between gap-6 rounded-xl border border-[var(--woosh-border)] bg-[var(--woosh-mist)]/35 p-4 text-sm text-[var(--woosh-navy)] transition-colors hover:bg-[var(--woosh-mist)]/65 sm:p-5">
                  <span className="min-w-0">
                    <span className="font-semibold">Email notifications</span>
                    <span className="mt-1 block leading-5 text-[var(--text-secondary)]">
                      Collaboration updates, deadlines and payment activity.
                    </span>
                  </span>

                  <Switch
                    name="emailNotifications"
                    checked={emailNotifications}
                    onCheckedChange={(checked) => {
                      setEmailNotifications(checked);
                      if (!checked) setWeeklyDigest(false);
                    }}
                    aria-label="Email notifications"
                  />
                </label>

                <label className="flex items-center justify-between gap-6 rounded-xl border border-[var(--woosh-border)] bg-[var(--woosh-mist)]/35 p-4 text-sm text-[var(--woosh-navy)] transition-colors hover:bg-[var(--woosh-mist)]/65 sm:p-5">
                  <span className="min-w-0">
                    <span className="font-semibold">Weekly digest</span>
                    <span className="mt-1 block leading-5 text-[var(--text-secondary)]">
                      A concise summary of applications, campaigns and payouts.
                    </span>
                  </span>

                  <Switch
                    name="weeklyDigest"
                    checked={weeklyDigest}
                    disabled={!emailNotifications}
                    onCheckedChange={setWeeklyDigest}
                    aria-label="Weekly digest"
                  />
                </label>

                <div className="pt-2">
                  <Button type="submit" className="w-fit">
                    Save preferences
                  </Button>
                </div>
              </ActionForm>
            </Panel>
          </div>
        </div>
      </TabsContent>

      <TabsContent value="security" className="mt-0">
        <div className="grid w-full gap-5 xl:grid-cols-[minmax(0,1.5fr)_minmax(280px,0.85fr)]">
          <div className="overflow-hidden rounded-2xl border border-[var(--woosh-border)] bg-white shadow-[var(--shadow-soft)]">
            <div className="h-1 w-full bg-[var(--woosh-blue)]" />
            <div className="p-5 md:p-7">
              <Panel
                title="Change password"
                description="Confirm your current password before choosing a new one."
              >
                <ActionForm
                  action={changePasswordAction}
                  successTitle="Password updated"
                  className="grid w-full gap-5"
                >
                  <Label>
                    Current password
                    <Input
                      name="currentPassword"
                      type="password"
                      required
                      minLength={8}
                      autoComplete="current-password"
                    />
                  </Label>

                  <Label>
                    New password
                    <Input
                      name="newPassword"
                      type="password"
                      required
                      minLength={8}
                      maxLength={128}
                      autoComplete="new-password"
                    />
                  </Label>

                  <Label>
                    Confirm new password
                    <Input
                      name="confirmPassword"
                      type="password"
                      required
                      minLength={8}
                      maxLength={128}
                      autoComplete="new-password"
                    />
                  </Label>

                  <Button type="submit" className="w-fit">
                    Update password
                  </Button>
                </ActionForm>
              </Panel>
            </div>
          </div>

          <div className="overflow-hidden rounded-2xl border border-[var(--woosh-border)] bg-[var(--woosh-mist)]/45 shadow-[var(--shadow-soft)]">
            <div className="h-1 w-full bg-[var(--woosh-navy)]/25" />
            <div className="p-5 md:p-7">
              <Panel
                title="Account data"
                description="Download the account, creator and authorised organisation data stored by Woosh. Provider tokens and full bank details are never included."
                variant="muted"
              >
                <ButtonLink href="/api/account/export" variant="secondary">
                  Download my data
                </ButtonLink>
              </Panel>
            </div>
          </div>
        </div>
      </TabsContent>
    </Tabs>
  );
}
