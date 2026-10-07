import { isValidEmail } from "./email-validation"

export type LeadMagnetValidationInput = {
  email: string
  companyName?: string
  source?: string
}

export type LeadMagnetValidationResult =
  | {
      status: "valid"
      email: string
      companyName: string
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
    source: input.source?.trim() || "email-gate",
  }
}
