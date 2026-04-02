const LEGACY_PROJECT_ASSET_MAP: Record<string, string> = {
  '/projects/thumbnail/epikcart.jpg': '/projects/thumbnail/portfolio-thumbnail.jpg',
  '/projects/thumbnail/property-pro.jpg': '/projects/thumbnail/portfolio-thumbnail.jpg',
  '/projects/images/epikcart-1.png': '/projects/images/portfolio-1.jpg',
  '/projects/images/epikcart-2.png': '/projects/images/portfolio-2.jpg',
  '/projects/images/property-pro-1.png': '/projects/images/portfolio-1.jpg',
  '/projects/images/property-pro-2.png': '/projects/images/portfolio-2.jpg',
}

export function normalizeProjectAssetUrl(url?: string | null): string {
  if (!url) return ''
  const trimmed = url.trim()
  if (!trimmed) return ''

  if (LEGACY_PROJECT_ASSET_MAP[trimmed]) {
    return LEGACY_PROJECT_ASSET_MAP[trimmed]
  }

  try {
    const parsed = new URL(trimmed)
    const mappedPath = LEGACY_PROJECT_ASSET_MAP[parsed.pathname]
    if (mappedPath) {
      return mappedPath
    }
  } catch {
    // Not an absolute URL — ignore.
  }

  return trimmed
}
