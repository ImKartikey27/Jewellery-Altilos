import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { CheckoutGateway } from "@/components/CheckoutPage/CheckoutGateway";
import { isPlanKey } from "@/lib/plans";
import { NO_INDEX } from "@/lib/seo";

// Funnel page: kept out of search results entirely. Effective only because
// robots.ts ALLOWS these paths to be crawled — a disallowed page is never
// fetched, so its noindex would never be read.
export const metadata: Metadata = { ...NO_INDEX, title: "Checkout" };


export default async function CheckoutPage({
  searchParams,
}: {
  searchParams: Promise<{ plan?: string | string[] }>;
}) {
  const params = await searchParams;
  const plan = Array.isArray(params.plan) ? params.plan[0] : params.plan;

  if (!isPlanKey(plan)) {
    redirect("/#plans");
  }

  return <CheckoutGateway key={plan} plan={plan} />;
}
