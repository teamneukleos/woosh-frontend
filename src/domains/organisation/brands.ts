import { z } from "zod";
import { prisma } from "@/lib/db";
import { writeAudit } from "@/lib/audit";
import { setActiveBrandId } from "@/lib/brand-cookie";
import { BRAND_INDUSTRIES } from "@/lib/taxonomy";
import { requireOrganisationPermission } from "@/domains/work/access";

const industryEnum = z.enum(
  BRAND_INDUSTRIES as unknown as [string, ...string[]],
);

const brandSchema = z.object({
  organisationId: z.string(),
  name: z.string().min(2).max(120),
  industry: industryEnum.optional(),
  country: z.string().default("NG"),
});

export async function createBrandForOrganisation(
  input: z.infer<typeof brandSchema>,
  ownerUserId: string,
) {
  const parsed = brandSchema.parse(input);
  await requireOrganisationPermission(
    ownerUserId,
    parsed.organisationId,
    "team.manage",
  );
  const brand = await prisma.brand.create({
    data: {
      organisationId: parsed.organisationId,
      name: parsed.name,
      industry: parsed.industry,
      country: parsed.country,
    },
  });

  await setActiveBrandId(brand.id);
  await writeAudit({
    actorId: ownerUserId,
    action: "brand.create",
    targetType: "Brand",
    targetId: brand.id,
  });

  return brand;
}

export async function updateOrganisationProfile(
  organisationId: string,
  input: { publicName?: string; website?: string; industry?: string },
  actorId: string,
) {
  await requireOrganisationPermission(actorId, organisationId, "team.manage");
  const org = await prisma.organisation.update({
    where: { id: organisationId },
    data: {
      publicName: input.publicName,
      website: input.website,
      industry:
        input.industry === undefined
          ? undefined
          : input.industry === "" ||
              !(BRAND_INDUSTRIES as readonly string[]).includes(input.industry)
            ? null
            : input.industry,
    },
  });
  await writeAudit({
    actorId,
    action: "organisation.update",
    targetType: "Organisation",
    targetId: organisationId,
  });
  return org;
}
