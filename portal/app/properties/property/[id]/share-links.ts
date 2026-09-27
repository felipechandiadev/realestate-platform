export function propertyPublicPath(id: string): string {
  return `/properties/property/${id}`;
}

export function whatsappShareHref(title: string, url: string): string {
  return `https://wa.me/?text=${encodeURIComponent(`${title}\n${url}`)}`;
}

export function facebookShareHref(url: string): string {
  return `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
}
