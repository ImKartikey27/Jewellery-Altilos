import type { Metadata } from "next";
import Image from "next/image";
import { Check } from 'lucide-react';
import { ConfirmationCard } from "@/components/LandingPage/ConfirmationCard";
import { PrimaryButton } from "@/components/LandingPage/ui/PrimaryButton";
import { confirmationCards } from "@/lib/content";
import { resolveConfirmationState } from "@/lib/onboarding-confirmation";
import { NO_INDEX } from "@/lib/seo";

// Funnel page: kept out of search results entirely. Effective only because
// robots.ts ALLOWS these paths to be crawled — a disallowed page is never
// fetched, so its noindex would never be read.
export const metadata: Metadata = { ...NO_INDEX, title: "Order Confirmed" };


type ConfirmPageProps = {
    searchParams: Promise<{
        session_id?: string;
    }>;
};

export default async function confirmPage({ searchParams }: ConfirmPageProps) {
    const { session_id: sessionId } = await searchParams;
    const confirmation = await resolveConfirmationState(sessionId);
    const isReady = confirmation.status === "ready" || confirmation.status === "already_submitted";
    let headline = "We Could Not Find This Payment";
    let body = "Open the onboarding form from the email we send after payment, or contact support if the email does not arrive.";

    if (isReady) {
        headline = "Thank you. Your order is confirmed.";
        body = `We've sent a confirmation to ${confirmation.email}. The next step takes 3 to 5 minutes: please complete your engagement brief so we can configure your study and start collecting real consumer signals.`;
    } else if (confirmation.status === "not_paid") {
        headline = "Payment Confirmation Is Still Processing";
        body = "Stripe has not marked this checkout as paid yet. If your payment succeeded, your email link will still get you back to the form.";
    } else if (confirmation.status === "configuration_missing") {
        headline = "Confirmation Link Is Not Configured Yet";
        body = "The onboarding link cannot be generated until ONBOARDING_TOKEN_PEPPER and NEXT_PUBLIC_BASE_URL are set in the environment.";
    }

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
                <div className="relative z-10 mx-auto max-w-7xl px-5 py-24 sm:px-8 lg:px-16">
                    <div className="max-w-3xl mx-auto text-center items-center">
                      

                            <div className="rounded-full bg-[#FFB787] mx-auto  w-14 items-center text-center ">
                                <Check className="mx-auto h-14 w-14 text-black" />
                            </div>
                        
                    </div>
                    <div className="max-w-3xl mx-auto text-center items-center mt-5">
                    <h1 className="text-4xl font-plusJakartaSans leading-tight text-white sm:text-5xl">
                        {isReady ? (
                            <>
                                <span className="text-[#f97316] font-plusJakartaSans">Thank you.</span > Your order is confirmed.
                            </>
                        ) : (
                            headline
                        )}
                    </h1>
                    <p className="mt-10 max-w-130 text-center mx-auto  font-inter  text-[18px] leading-tight text-[#a1a1a1]/80">
                        {body}
                    </p>

                    <div className="my-5 flex-row items-center gap-5 justify-center flex">
                        {isReady ? (
                            <PrimaryButton href={confirmation.formUrl}>Complete Brief</PrimaryButton>
                        ) : (
                            <PrimaryButton href="/">Back to Plans</PrimaryButton>
                        )}
                    </div>
                    </div>
                    <div className="mt-14 grid gap-6 md:grid-cols-3">
                        {confirmationCards.map((card) => (
                            <ConfirmationCard key={card.title} card={card} />
                        ))}
                    </div>
                </div>


        
            </section >
        </div >
    )
}
