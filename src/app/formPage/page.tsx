import type { Metadata } from "next";
import Image from "next/image";
import { Footer } from "@/components/LandingPage/Footer";
import { redirect } from "next/navigation";

import { resolveOnboardingAccessToken } from "@/lib/onboarding-token";
import { submitOnboardingForm } from "@/lib/onboarding-submission";
import { OnboardingForm } from "./OnboardingForm";
import type { PlanKey } from "@/lib/onboarding-questions";
import { addOnSlugsFromOrderAddOns } from "@/lib/addon-entitlements";
import { NO_INDEX } from "@/lib/seo";

// Funnel page: kept out of search results entirely. Effective only because
// robots.ts ALLOWS these paths to be crawled — a disallowed page is never
// fetched, so its noindex would never be read.
export const metadata: Metadata = { ...NO_INDEX, title: "Onboarding Brief" };


const PLAN_KEYS: PlanKey[] = ["pulse", "core", "core+", "expert"];
function asPlanKey(value: string | undefined): PlanKey {
  return value && (PLAN_KEYS as string[]).includes(value) ? (value as PlanKey) : "pulse";
}

type FormPageProps = {
    searchParams: Promise<{
        token?: string;
        submitted?: string;
        error?: string;
    }>;
};

async function submitOnboardingAction(formData: FormData) {
    "use server";

    const token = String(formData.get("token") ?? "");
    let researchBrief: unknown = {};
    try {
        researchBrief = JSON.parse(String(formData.get("researchBrief") ?? "{}"));
    } catch {
        redirect(`/formPage?token=${encodeURIComponent(token)}&error=invalid_request`);
    }

    const payload = {
        token,
        fullName: String(formData.get("fullName") ?? ""),
        workEmail: String(formData.get("workEmail") ?? ""),
        jobTitle: String(formData.get("jobTitle") ?? ""),
        companyName: String(formData.get("companyName") ?? ""),
        companyWebsite: String(formData.get("companyWebsite") ?? ""),
        phoneNumber: String(formData.get("phoneNumber") ?? ""),
        termsAccepted: formData.get("termsAccepted") === "on",
        researchBrief,
    };

    let result;
    try {
        result = await submitOnboardingForm(payload);
    } catch {
        redirect(`/formPage?token=${encodeURIComponent(token)}&error=invalid_request`);
    }

    if (result.status === "submitted" || result.status === "already_submitted") {
        redirect(`/formPage?token=${encodeURIComponent(token)}&submitted=1`);
    }

    redirect(`/formPage?token=${encodeURIComponent(token)}&error=${result.status}`);
}

const errorBanners: Record<string, string> = {
    invalid_request:
        "Please check the form fields and try again. All required fields must be filled in.",
    invalid:
        "We could not verify the submission link. Refresh the page and try again.",
    expired:
        "Your onboarding link expired while you were filling out the form. Reply to your purchase email for a new link.",
    used: "This link has already been used to submit a form.",
    unpaid:
        "Your payment is no longer marked as paid. Refresh and try again, or contact support.",
};

export default async function FormPage({ searchParams }: FormPageProps) {
    const { token, submitted, error } = await searchParams;
    const tokenState = token ? await resolveOnboardingAccessToken(token) : null;
    const customer = tokenState?.record?.order.customer;
    const plan = asPlanKey(tokenState?.record?.order.plan);
    // Presentation only. The submit path re-reads Order.addOns from the database
    // and derives its own entitlements, so a tampered client changes nothing.
    const addOnSlugs = addOnSlugsFromOrderAddOns(tokenState?.record?.order.addOns);
    const defaults = {
        fullName: customer?.name ?? "",
        workEmail: customer?.email ?? "",
        companyName: customer?.company ?? "",
        phoneNumber: customer?.mobileNumber ?? "",
    };

    const status = !token || !tokenState
        ? "invalid"
        : tokenState.state.status;
    const isFormReady = status === "ready";

    const errorMessage = error ? errorBanners[error] ?? errorBanners.invalid_request : null;

    return (
        <div className="min-h-screen bg-black text-white">
                    <section className="relative isolate min-h-screen overflow-hidden ">
                        <Image
                            alt=""
                            aria-hidden="true"
                            className="min-h-full object-center brightness-125 "
                            fill
                            priority
                            sizes="100vw"
                            src="/images/hero/bright_img.png"
                        />

                        <div className="relative z-10 mx-auto max-w-7xl px-5 py-24 sm:px-8 lg:px-16 items-center">
                            {!isFormReady && (
                                <>
                                    <h1 className="text-3xl sm:text-4xl font-poppins text-white max-w-3xl mx-auto">Intelligence for the modern enterprise</h1>
                                    <p className="mt-4 text-[16px] font-poppins text-gray-300 text-center text-[ #A1A1A1CC]
">
                                      Intelligence for the modern enterpriseIntelligence for the modern enterpriseIntelligence for the modern enterpriseIntelligence for the modern enterpriseIntelligence for the modern e
                                    </p>
                                </>
                            )}
                            {isFormReady && (
                                <h1 className="text-center text-3xl sm:text-4xl font-poppins text-white max-w-3xl mx-auto">Complete your onboarding form</h1>
                            )}
                            {submitted === "1" || status === "submitted" || status === "used" ? (
                                <StatusPanel
                                    title="Your onboarding form is already submitted."
                                    body="We have the details we need for this paid order."
                                />
                            ) : isFormReady ? (
                                <OnboardingForm
                                    token={token!}
                                    plan={plan}
                                    addOnSlugs={addOnSlugs}
                                    defaults={defaults}
                                    action={submitOnboardingAction}
                                    errorMessage={errorMessage}
                                />
                            ) : status === "expired" ? (
                                <StatusPanel
                                    title="This onboarding link has expired."
                                    body="Onboarding links are valid for 7 days. Reply to your purchase email and we'll send you a new one."
                                />
                            ) : status === "unpaid" ? (
                                <StatusPanel
                                    title="Your payment is still being confirmed."
                                    body="Refresh this page in a minute. If it still isn't ready, your bank may be holding the authorization."
                                />
                            ) : (
                                <StatusPanel
                                    title="We could not verify this onboarding link."
                                    body="Double-check the link from your post-payment email, or contact support if you copied it from somewhere else."
                                />
                            )}
                        </div>
                    </section>
                    <div className="bg-black">
                        <Footer />
                    </div>
                </div>
    )
}

function StatusPanel({ title, body }: { title: string; body: string }) {
    return (
        <div className="mx-auto mt-16 max-w-3xl rounded-lg border border-[#6f4b38]/80 bg-black/65 p-8 text-center">
            <h2 className="font-poppins text-3xl text-white">{title}</h2>
            <p className="mt-4 font-inter text-base text-[#d8c4b8]">{body}</p>
        </div>
    );
}
