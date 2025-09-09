import { z } from "zod";

const hexColor = z
  .string()
  .regex(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/, "Invalid hex color");

export const ButtonVariantEnum = z.enum(["solid", "outline", "ghost"]);
export const HeaderVariantEnum = z.enum(["logo-left", "logo-center"]);
export const HomeLayoutEnum = z.enum(["hero+grid+featured", "hero+grid", "hero+featured"]);
export const ProductCardVariantEnum = z.enum(["default", "compact", "media-heavy"]);

export const StoreSettingsPatchSchema = z
  .object({
    store_id: z.string().uuid(),
    store_name: z.string().min(1).max(120).optional(),
    domain_whitelabel: z
      .string()
      .toLowerCase()
      .trim()
      .regex(/^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,}$/i, "Invalid domain")
      .optional(),
    theme_primary: hexColor.optional(),
    theme_secondary: hexColor.optional(),
    theme_bg: hexColor.optional(),
    theme_text: hexColor.optional(),
    button_variant: ButtonVariantEnum.optional(),
    border_radius: z.number().int().min(0).max(32).optional(),
    logo_url: z.string().url().optional().or(z.literal("").optional()),
    favicon_url: z.string().url().optional().or(z.literal("").optional()),
    banner_hero_url: z.string().url().optional().or(z.literal("").optional()),
    banner_secondary_url: z.string().url().optional().or(z.literal("").optional()),
    header_variant: HeaderVariantEnum.optional(),
    home_layout: HomeLayoutEnum.optional(),
    product_card_variant: ProductCardVariantEnum.optional(),
  })
  .strict();

export const StoreSettingsSchema = z
  .object({
    store_id: z.string().uuid(),
    store_name: z.string().min(1).max(120),
    domain_whitelabel: z.string().nullable().optional(),
    theme_primary: hexColor.default("#2B5BF6"),
    theme_secondary: hexColor.default("#111827"),
    theme_bg: hexColor.default("#FFFFFF"),
    theme_text: hexColor.default("#0F172A"),
    button_variant: ButtonVariantEnum.default("solid"),
    border_radius: z.number().int().min(0).max(32).default(14),
    logo_url: z.string().url().nullable().optional(),
    favicon_url: z.string().url().nullable().optional(),
    banner_hero_url: z.string().url().nullable().optional(),
    banner_secondary_url: z.string().url().nullable().optional(),
    header_variant: HeaderVariantEnum.default("logo-left"),
    home_layout: HomeLayoutEnum.default("hero+grid+featured"),
    product_card_variant: ProductCardVariantEnum.default("default"),
    updated_by: z.number().int().positive().nullable().optional(),
    updated_at: z.string().datetime().optional(),
  })
  .strict();

export const CouponSchema = z
  .object({
    id: z.number().int().positive().optional(),
    store_id: z.string().uuid(),
    code: z.string().trim().min(2).max(64),
    kind: z.enum(["percent", "fixed", "free_shipping", "points_bonus"]),
    value: z.number().nonnegative().default(0),
    min_order: z.number().nonnegative().optional(),
    start_at: z.string().datetime().optional(),
    end_at: z.string().datetime().optional(),
    max_redemptions: z.number().int().positive().optional(),
    per_user_limit: z.number().int().positive().default(1),
    status: z.enum(["active", "paused", "expired"]).default("active"),
    campaign_version_id: z.number().int().positive().optional(),
  })
  .refine((v) => !v.start_at || !v.end_at || new Date(v.start_at) < new Date(v.end_at), {
    message: "start_at must be before end_at",
    path: ["start_at"],
  });

export const CampaignOverridesSchema = z
  .object({
    primary: hexColor.optional(),
    secondary: hexColor.optional(),
    bg: hexColor.optional(),
    text: hexColor.optional(),
    banner_hero_url: z.string().url().optional(),
    banner_secondary_url: z.string().url().optional(),
    header_variant: HeaderVariantEnum.optional(),
    home_layout: HomeLayoutEnum.optional(),
    product_card_variant: ProductCardVariantEnum.optional(),
  })
  .strict();

export const CampaignSchema = z
  .object({
    id: z.number().int().positive().optional(),
    store_id: z.string().uuid(),
    name: z.string().min(1).max(120),
    slug: z
      .string()
      .toLowerCase()
      .regex(/^[a-z0-9-]{2,64}$/),
    is_active: z.boolean().default(false),
    starts_at: z.string().datetime().optional(),
    ends_at: z.string().datetime().optional(),
    theme_overrides: CampaignOverridesSchema.default({}),
    notes: z.string().optional(),
  })
  .refine((v) => !v.starts_at || !v.ends_at || new Date(v.starts_at) < new Date(v.ends_at), {
    message: "starts_at must be before ends_at",
    path: ["starts_at"],
  });

export type StoreSettings = z.infer<typeof StoreSettingsSchema>;
export type StoreSettingsPatch = z.infer<typeof StoreSettingsPatchSchema>;
export type Coupon = z.infer<typeof CouponSchema>;
export type Campaign = z.infer<typeof CampaignSchema>;
