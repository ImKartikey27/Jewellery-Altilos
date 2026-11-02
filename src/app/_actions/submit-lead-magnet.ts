"use server"

import { submitLeadMagnet } from "@/lib/lead-magnet-submission"

export type LeadMagnetActionState = {
  status:
    | "idle"
    | "submitted"
    | "already_submitted"
    | "invalid_email"
    | "missing_company"
    | "error"
  message?: string
}

export async function submitLeadMagnetAction(
  _prev: LeadMagnetActionState,
  formData: FormData
): Promise<LeadMagnetActionState> {
  const email = String(formData.get("email") ?? "")
  const companyName = String(formData.get("companyName") ?? "")
  const category = String(formData.get("category") ?? "")

  try {
    const result = await submitLeadMagnet({ email, companyName, category })
    switch (result.status) {
      case "submitted":
        return { status: "submitted" }
      case "already_submitted":
        return { status: "already_submitted" }
      case "invalid_email":
        return {
          status: "invalid_email",
          message: "Please use your work email so we can send the study.",
        }
      case "missing_company":
        return {
          status: "missing_company",
          message: "Enter your brand or company name.",
        }
    }
  } catch (error) {
    // Keep the detail server-side: the raw error can carry database and
    // upstream-provider internals, and this value is rendered to the visitor.
    console.error("Lead magnet submission failed", error)
    return {
      status: "error",
      message: "Something went wrong. Please try again.",
    }
  }
}
