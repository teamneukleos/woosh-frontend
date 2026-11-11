"use client";

import { inviteTeammateAction } from "@/app/actions";
import { Panel } from "@/components/ui/panel";
import { Button } from "@/components/ui/button";
import { ButtonLink } from "@/components/ui/button-link";
import { Input, Select, Label } from "@/components/ui/field";
import { ActionForm } from "@/components/ui/action-form";
import { Stepper } from "@/components/ui/stepper";

export function AgencyInviteStep({
  brands,
  defaultBrandId,
}: {
  brands: { id: string; name: string }[];
  defaultBrandId?: string | null;
}) {
  const selectedBrandId = defaultBrandId || brands[0]?.id || "";
  return (
    <div className="flex flex-col gap-6">
      <Stepper steps={["Welcome", "First brand", "Invite team"]} current={2} />
      <Panel
        title="Invite a teammate"
        description="Optional. They join only the brand you pick — not every client in the organisation. They get a link to create their own account and choose a password."
      >
        <ActionForm
          action={inviteTeammateAction}
          successTitle="Invite queued"
          className="grid gap-4"
        >
          {brands.length > 1 ? (
            <Label>
              Brand they can access
              <Select name="brandId" defaultValue={selectedBrandId} required>
                {brands.map((brand) => (
                  <option key={brand.id} value={brand.id}>
                    {brand.name}
                  </option>
                ))}
              </Select>
            </Label>
          ) : (
            <input type="hidden" name="brandId" value={selectedBrandId} />
          )}
          <Label>
            Email
            <Input
              type="email"
              name="email"
              required
              placeholder="colleague@agency.ng"
            />
          </Label>
          <Label>
            Role
            <Select name="role" defaultValue="ACCOUNT_MANAGER">
              <option value="ACCOUNT_MANAGER">Account manager</option>
              <option value="MANAGER">Manager</option>
              <option value="FINANCE">Finance</option>
              <option value="VIEWER">Viewer</option>
              <option value="ADMIN">Admin</option>
            </Select>
          </Label>
          <Button type="submit" className="w-full">
            Send invite
          </Button>
        </ActionForm>
        <ButtonLink href="/app" className="mt-3 w-full">
          Go to portfolio
        </ButtonLink>
      </Panel>
    </div>
  );
}
