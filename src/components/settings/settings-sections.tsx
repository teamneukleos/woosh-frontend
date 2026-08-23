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
    <Tabs defaultValue={defaultTab}>
      <TabsList className="flex h-auto flex-wrap">
        {hasCreator ? (
          <TabsTrigger value="profile">Profile</TabsTrigger>
        ) : null}
        {organisation ? (
          <TabsTrigger value="organisation">Organisation</TabsTrigger>
        ) : null}
        {kind === "agency" && canManageOrganisation ? (
          <TabsTrigger value="brands">Brands</TabsTrigger>
        ) : null}
        <TabsTrigger value="notifications">Notifications</TabsTrigger>
        <TabsTrigger value="security">Security</TabsTrigger>
      </TabsList>

      {hasCreator ? (
        <TabsContent value="profile">
          <Panel title="Creator profile">
            <p className="text-sm text-[var(--woosh-dull)]/75">
              Categories, languages, and connected socials live on Profile.
              Metrics sync after you connect channels — never typed in.
            </p>
            <ButtonLink href="/app/profile" className="mt-4 w-fit">
              Open profile
            </ButtonLink>
          </Panel>
        </TabsContent>
      ) : null}

      {organisation ? (
        <TabsContent value="organisation">
          <Panel title="Organisation">
            <ActionForm
              action={updateOrgAction}
              successTitle="Organisation saved"
              className="grid gap-4"
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
              <Label>
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
                <Button type="submit" className="w-fit">
                  Save organisation
                </Button>
              ) : null}
            </ActionForm>
          </Panel>
        </TabsContent>
      ) : null}

      {kind === "agency" && canManageOrganisation ? (
        <TabsContent value="brands">
          <Panel title="Add client brand">
            <ActionForm
              action={createClientBrandAction}
              successTitle="Brand created"
              className="grid gap-3"
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
              <Button type="submit" variant="secondary" className="w-fit">
                Create brand
              </Button>
            </ActionForm>
          </Panel>
        </TabsContent>
      ) : null}

      <TabsContent value="notifications">
        <Panel
          title="Notification preferences"
          description="Control optional email updates. Security and transactional messages are always delivered."
        >
          <ActionForm
            action={updateNotificationPreferencesAction}
            successTitle="Notification preferences saved"
            className="grid gap-5"
          >
            <label className="flex items-center justify-between gap-4 text-sm text-[var(--woosh-navy)]">
              <span>
                <span className="font-semibold">Email notifications</span>
                <span className="mt-0.5 block text-[var(--text-secondary)]">
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
            <label className="flex items-center justify-between gap-4 border-t border-[var(--woosh-border)] pt-5 text-sm text-[var(--woosh-navy)]">
              <span>
                <span className="font-semibold">Weekly digest</span>
                <span className="mt-0.5 block text-[var(--text-secondary)]">
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
            <Button type="submit" className="w-fit">
              Save preferences
            </Button>
          </ActionForm>
        </Panel>
      </TabsContent>

      <TabsContent value="security">
        <div className="grid gap-4">
        <Panel
          title="Change password"
          description="Confirm your current password before choosing a new one."
        >
          <ActionForm
            action={changePasswordAction}
            successTitle="Password updated"
            className="grid gap-4"
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
      </TabsContent>
    </Tabs>
  );
}
