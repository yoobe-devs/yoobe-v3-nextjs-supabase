export async function getStorePublicSettingsTagged(store_id: string, campaign_slug?: string) {
  const u = new URL(`/api/v2/store/public-settings`, typeof window === 'undefined' ? 'http://localhost' : window.location.origin)
  u.searchParams.set('store_id', store_id)
  if (campaign_slug) u.searchParams.set('campaign_slug', campaign_slug)
  // Note: In SSR, Next replaces the origin; the URL's origin is ignored.
  const res = await fetch(u.toString().replace('http://localhost', ''), {
    next: { tags: [`store:${store_id}`] },
  })
  if (!res.ok) throw new Error('failed_to_fetch_store_settings')
  return res.json()
}

