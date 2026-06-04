import { Request, Response } from "express";
import Stripe from "stripe";
import { prisma } from "../config/prisma.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "sk_test_mock", {
  apiVersion: "2025-01-27.acacia"
});

const services = {
  "marketing-pro": { name: "Pro Marketing Package", price: 4999 }, // 49.99 INR or USD, stripe uses smallest unit. Let's use INR, so 4999 = 49.99 INR
  "author-copies-10": { name: "10 Author Copies", price: 150000 }, // 1500.00 INR
  "cover-design": { name: "Premium Cover Design", price: 250000 } // 2500.00 INR
};

export const createCheckoutSession = async (req: Request, res: Response): Promise<void> => {
  try {
    const { serviceId } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const service = services[serviceId as keyof typeof services];
    if (!service) {
      res.status(400).json({ error: "Invalid service ID" });
      return;
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "inr",
            product_data: {
              name: service.name,
            },
            unit_amount: service.price,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${process.env.FRONTEND_URL}/author/services/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/author/services`,
      client_reference_id: userId,
      metadata: {
        serviceId,
      }
    });

    if (!session.url) {
      throw new Error("Failed to create Stripe session URL");
    }

    // Save pending transaction
    await prisma.transaction.create({
      data: {
        userId,
        stripeSessionId: session.id,
        serviceName: service.name,
        amount: service.price / 100, // Store in actual currency unit (INR)
        status: "PENDING"
      }
    });

    res.json({ url: session.url });
  } catch (error) {
    console.error("Stripe checkout error:", error);
    res.status(500).json({ error: "Failed to create checkout session" });
  }
};

export const stripeWebhook = async (req: Request, res: Response): Promise<void> => {
  const sig = req.headers["stripe-signature"];

  if (!sig) {
    res.status(400).send("Webhook Error: Missing signature");
    return;
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET || "whsec_mock"
    );
  } catch (err: any) {
    console.error(`Webhook Error: ${err.message}`);
    res.status(400).send(`Webhook Error: ${err.message}`);
    return;
  }

  // Handle the event
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    
    if (session.id) {
      await prisma.transaction.update({
        where: { stripeSessionId: session.id },
        data: { status: "COMPLETED" }
      });
      console.log(`Payment successful for session ${session.id}`);
    }
  }

  // Return a 200 response to acknowledge receipt of the event
  res.json({ received: true });
};
