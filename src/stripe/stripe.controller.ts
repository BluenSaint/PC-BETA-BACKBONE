import { Controller, Post, Headers, Body, Req, RawBodyRequest } from "@nestjs/common"
import { ApiTags } from "@nestjs/swagger"
import { StripeService } from "./stripe.service"

@ApiTags("Stripe")
@Controller("api/stripe")
export class StripeController {
  constructor(private readonly stripeService: StripeService) {}

  @Post("create-checkout")
  async createCheckoutSession(@Body() body: { planId: string; userEmail?: string; successUrl: string; cancelUrl: string }) {
    return this.stripeService.createCheckoutSession(body)
  }

  @Post("webhook")
  async handleWebhook(@Req() req: RawBodyRequest<Request>, @Headers('stripe-signature') signature: string) {
    return this.stripeService.handleWebhook(req.rawBody, signature)
  }
}
