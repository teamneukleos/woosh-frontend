"use server";

import { z } from "zod";
import { ApiError, publicApi } from "@/lib/api";
import { isStrongPassword, PASSWORD_HINT } from "@/lib/password";

const registerSchema = z
  .object({
    name: z.string().min(2).max(120),
    email: z.string().email(),
    password: z
      .string()
      .min(8)
      .max(128)
      .refine(isStrongPassword, { message: PASSWORD_HINT }),
    confirmPassword: z.string().min(1),
    invite: z.string().optional(),
    accountType: z.enum(["creator", "brand", "agency"]).optional(),
    terms: z.literal("on"),
  })
  .refine((value) => Boolean(value.invite?.trim() || value.accountType), {
    message: "Account type is required",
  })
  .refine((value) => value.password === value.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

export type RegisterState = {
  ok: boolean;
  error?: string;
  viaInvite?: boolean;
};

export async function registerUser(
  _prev: RegisterState,
  formData: FormData,
): Promise<RegisterState> {
  const parsed = registerSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
    invite: String(formData.get("invite") || "").trim() || undefined,
    accountType: formData.get("accountType") || undefined,
    terms: formData.get("terms") === "on" ? "on" : "",
  });

  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    const field = issue?.path[0];
    if (field === "confirmPassword") {
      return { ok: false, error: "Passwords do not match." };
    }
    if (field === "password") {
      return { ok: false, error: PASSWORD_HINT };
    }
    return { ok: false, error: "Check name, email, password, and accept the terms." };
  }

  try {
    await publicApi("/auth/register", {
      method: "POST",
      body: {
        name: parsed.data.name,
        email: parsed.data.email,
        password: parsed.data.password,
        ...(parsed.data.invite
          ? { inviteToken: parsed.data.invite }
          : { accountType: parsed.data.accountType }),
      },
    });
    return { ok: true, viaInvite: Boolean(parsed.data.invite) };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof ApiError ? error.message : "Could not create the account.",
    };
  }
}
