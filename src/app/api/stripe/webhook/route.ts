import { NextRequest, NextResponse } from "next/server";
import { getStripeClient } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import Stripe from "stripe";
import { env } from "@/lib/env";
import { Prisma } from "@/generated/prisma/client";
import { finalizePaidCheckoutSession, markCheckoutSessionExpired } from "@/lib/order-finalization";
export const runtime = "nodejs"



export async function POST(req: NextRequest) {

  //read raw body 
  const rawBody = await req.text()
  const sigHeader = req.headers.get("stripe-signature")

  if(!sigHeader){
    return NextResponse.json({
      error: "Missing stripe-signature header"},
      {status: 400
    })
  }

  //verify the signature 
  let event: Stripe.Event
  try {
    event = getStripeClient().webhooks.constructEvent(
      rawBody,
      sigHeader,
      env.STRIPE_WEBHOOK_SECRET
    )
    
  } catch (error) {

    console.error("Webhook signature verification failed", error)
    return NextResponse.json({
      error: "Webhook signature verification failed"},
      {status: 400
    })
  }
  //idempotency gate - insert event , ignore if duplicates
  try {
    await prisma.webhookEvent.create({
      data:{
        id: event.id,
        type: event.type,
        payload: event.data.object as unknown as Prisma.InputJsonValue
      }
    })

    
  } catch (error: unknown) {

    if(isPrismaUniqueError(error)){
      return NextResponse.json({
        received: true,
      })
    }
    throw error
  }

  //4. dispatch on event types
  try {

    if(event.type === "checkout.session.completed"){
      await handleSessionCompleted(event.data.object as Stripe.Checkout.Session) 
    }

    if(event.type === "checkout.session.expired"){
      await handleSessionExpired(event.data.object as Stripe.Checkout.Session)
    }

    //mark the event as processed 
    await prisma.webhookEvent.update({
      where:{id: event.id},
      data:{processedAt: new Date()}
    })
    
  } catch (error) {

    console.error(`Error processing event ${event.id}`, error)
    await prisma.webhookEvent.update({
      where:{id: event.id},
      data:{processingError: String(error)}
    })
    return NextResponse.json({
      error: "Webhook processing failed",
    }, {status: 500})
  }
  return NextResponse.json({
    received: true,
  })
}

function isPrismaUniqueError(error: unknown): error is { code: "P2002" } {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === "P2002"
  )
}

async function handleSessionCompleted(session: Stripe.Checkout.Session){
  await finalizePaidCheckoutSession(session)
}

async function handleSessionExpired(session: Stripe.Checkout.Session){
  await markCheckoutSessionExpired(session.id)
}
