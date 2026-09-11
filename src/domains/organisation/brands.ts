import { api } from "@/lib/api";
import { setActiveBrandId } from "@/lib/brand-cookie";

export async function createBrandForOrganisation(
  input: {
    organisationId: string;
    name: string;
    industry?: string;
    country?: string;
  },
  _ownerUserId?: string,
) {
  const brand = await api<{ id: string }>("/brands", {
    method: "POST",
    body: {
      name: input.name,
      industry: input.industry,
      country: input.country,
    },
  });
  await setActiveBrandId(brand.id);
  return brand;
}

export async function updateOrganisationProfile(
  organisationIdOrInput:
    | string
    | {
        organisationId: string;
        publicName?: string;
        website?: string;
        industry?: string;
      },
  inputOrActor?:
    | {
        publicName?: string;
        website?: string;
        industry?: string;
      }
    | string,
  _actorUserId?: string,
) {
  const body =
    typeof organisationIdOrInput === "string"
      ? (inputOrActor as {
          publicName?: string;
          website?: string;
          industry?: string;
        })
      : organisationIdOrInput;
  return api("/organisation", {
    method: "PATCH",
    body: {
      publicName: body.publicName,
      website: body.website,
      industry: body.industry,
    },
  });
}
