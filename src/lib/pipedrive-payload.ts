export function buildPersonCustomFields(args: {
  leadSourceKey?: string
  secondaryLeadSourceKey?: string
  jobTitleKey?: string
  websiteKey?: string
  jobTitle: string
  website?: string | null
}): Record<string, string> {
  const fields: Record<string, string> = {}
  if (args.leadSourceKey) fields[args.leadSourceKey] = "Jewellery Altilos"
  if (args.secondaryLeadSourceKey) fields[args.secondaryLeadSourceKey] = "D2C Jewellery"
  if (args.jobTitleKey && args.jobTitle.trim()) fields[args.jobTitleKey] = args.jobTitle.trim()
  if (args.websiteKey && args.website && args.website.trim()) {
    fields[args.websiteKey] = args.website.trim()
  }
  return fields
}
