export function isValidCompanyWebsite(value: string): boolean {
  const trimmed = value.trim()
  if (!trimmed) return true

  const candidate = trimmed.startsWith("www.") ? `https://${trimmed}` : trimmed
  if (!URL.canParse(candidate) || !/^https?:\/\//i.test(candidate)) return false

  const { hostname } = new URL(candidate)
  return hostname.includes(".") && !hostname.endsWith(".")
}
