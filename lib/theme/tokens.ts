import { StoreSettings } from "@/lib/validators/storeSettings";

type Overrides = Partial<{
  primary: string;
  secondary: string;
  bg: string;
  text: string;
  banner_hero_url: string;
  banner_secondary_url: string;
  header_variant: string;
  home_layout: string;
  product_card_variant: string;
}>;

export function buildEffectiveTheme(
  settings: StoreSettings,
  overrides?: Overrides
) {
  const t = {
    primary: overrides?.primary ?? settings.theme_primary,
    secondary: overrides?.secondary ?? settings.theme_secondary,
    bg: overrides?.bg ?? settings.theme_bg,
    text: overrides?.text ?? settings.theme_text,
    borderRadius: settings.border_radius,
    buttonVariant: settings.button_variant,
    headerVariant: overrides?.header_variant ?? settings.header_variant,
    homeLayout: overrides?.home_layout ?? settings.home_layout,
    productCardVariant: overrides?.product_card_variant ?? settings.product_card_variant,
    logoUrl: settings.logo_url ?? undefined,
    faviconUrl: settings.favicon_url ?? undefined,
    bannerHeroUrl: overrides?.banner_hero_url ?? settings.banner_hero_url ?? undefined,
    bannerSecondaryUrl: overrides?.banner_secondary_url ?? settings.banner_secondary_url ?? undefined,
  };
  return t;
}

export function tokensToCssVars(theme: ReturnType<typeof buildEffectiveTheme>): string {
  const vars: Record<string, string | number | undefined> = {
    "--brand-primary": theme.primary,
    "--brand-secondary": theme.secondary,
    "--bg": theme.bg,
    "--text": theme.text,
    "--radius": `${theme.borderRadius}px`,
  };
  return Object.entries(vars)
    .filter(([, v]) => v !== undefined)
    .map(([k, v]) => `${k}:${v}`)
    .join(";");
}

