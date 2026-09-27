export function propertyPublicUrl(propertyId: string): string {
  const origin = (
    process.env.NEXT_PUBLIC_PORTAL_URL ||
    process.env.NEXT_PUBLIC_WEB_URL ||
    'http://localhost:8001'
  ).replace(/\/+$/, '');
  return `${origin}/properties/property/${propertyId}`;
}

export function whatsappShareHref(title: string, url: string): string {
  return `https://wa.me/?text=${encodeURIComponent(`${title}\n${url}`)}`;
}

export function facebookShareHref(url: string): string {
  return `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
}
