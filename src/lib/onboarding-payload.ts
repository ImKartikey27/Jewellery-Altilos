import type { OnboardingSubmissionInput } from "@/lib/onboarding-schema"

export function emptyToNull(value: string | undefined | null): string | null {
  return value && value.trim() ? value : null
}

export function sanitizeSubmissionPayload(input: OnboardingSubmissionInput) {
  return {
    fullName: input.fullName,
    workEmail: input.workEmail,
    jobTitle: input.jobTitle,
    companyName: input.companyName,
    companyWebsite: emptyToNull(input.companyWebsite),
    phoneNumber: emptyToNull(input.phoneNumber),
    termsAccepted: input.termsAccepted,
    researchBrief: input.researchBrief,
  }
}
