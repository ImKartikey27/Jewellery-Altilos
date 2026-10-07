// Money formatting. Pure — safe to import from tests and from client components.
//
// Amounts are in MINOR units (paise for INR, cents for legacy USD orders).
// INR uses Indian digit grouping: 10_000_000 paise renders as "₹1,00,000",
// not "₹100,000". `Intl.NumberFormat("en-IN")` handles the lakh/crore grouping.

const MINOR_UNITS_PER_MAJOR = 100

export function minorToMajor(amountMinor: number): number {
  return amountMinor / MINOR_UNITS_PER_MAJOR
}

export function formatMinor(amountMinor: number, currency: string): string {
  const normalized = currency.toUpperCase()
  const locale = normalized === "INR" ? "en-IN" : "en-US"

  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: normalized,
    maximumFractionDigits: 0,
  }).format(minorToMajor(amountMinor))
}
