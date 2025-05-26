import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import Stripe from "stripe";

@Injectable()
export class StripeService {
  private stripe: Stripe;

  constructor(private readonly configService: ConfigService) {
    this.stripe = new Stripe(this.configService.get<string>('STRIPE_SECRET_KEY'), {
      apiVersion: '2023-10-16',
    });
  }

  async createCheckoutSession(params: { 
    planId: string; 
    userEmail?: string; 
    successUrl: string; 
    cancelUrl: string 
  }) {
    try {
      const session = await this.stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price: params.planId,
            quantity: 1,
          },
        ],
        mode: 'subscription',
        success_url: params.successUrl,
        cancel_url: params.cancelUrl,
        customer_email: params.userEmail,
      });

      return { sessionId: session.id, url: session.url };
    } catch (error) {
      throw new Error(`Error creating checkout session: ${error.message}`);
    }
  }

  async handleWebhook(rawBody: Buffer, signature: string) {
    try {
      const webhookSecret = this.configService.get<string>('STRIPE_WEBHOOK_SECRET');
      const event = this.stripe.webhooks.constructEvent(
        rawBody,
        signature,
        webhookSecret
      );

      // Handle different event types
      switch (event.type) {
        case 'checkout.session.completed':
          // Handle successful checkout
          const checkoutSession = event.data.object as Stripe.Checkout.Session;
          // Process the successful payment
          break;
        case 'invoice.paid':
          // Handle successful payment
          const invoice = event.data.object as Stripe.Invoice;
          // Process the successful payment
          break;
        case 'customer.subscription.updated':
        case 'customer.subscription.deleted':
          // Handle subscription updates
          const subscription = event.data.object as Stripe.Subscription;
          // Process the subscription update
          break;
        default:
          // Unexpected event type
          console.log(`Unhandled event type: ${event.type}`);
      }

      return { received: true };
    } catch (error) {
      throw new Error(`Webhook error: ${error.message}`);
    }
  }
}
