import { isValidEmail } from "./email-validation"

export const LEAD_CATEGORIES = [
  "Fine jewellery",
  "Silver",
  "Lab-grown",
  "Diamond",
  "Gold coins and bars",
  "Other",
] as const

export type LeadMagnetValidationInput = {
  email: string
  companyName?: string
  category?: string
  source?: string
}

export type LeadMagnetValidationResult =
  | {
      status: "valid"
      email: string
      companyName: string
      category: string | null
      source: string
    }
  | { status: "invalid_email" }
  | { status: "missing_company" }

export function validateLeadMagnetSubmissionInput(
  input: LeadMagnetValidationInput
): LeadMagnetValidationResult {
  const email = input.email.trim().toLowerCase()
  if (!isValidEmail(email)) {
    return { status: "invalid_email" }
  }

  const companyName = input.companyName?.trim()
  if (!companyName) {
    return { status: "missing_company" }
  }

  return {
    status: "valid",
    email,
    companyName,
    category: (LEAD_CATEGORIES as readonly string[]).includes(input.category ?? "")
      ? (input.category as string)
      : null,
    source: input.source?.trim() || "email-gate",
  }
}
