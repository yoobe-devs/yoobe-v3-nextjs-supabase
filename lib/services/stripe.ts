import Stripe from 'stripe';

export function stripeFor(currency: 'BRL' | 'USD') {
  const key = currency === 'BRL' ? process.env.STRIPE_SECRET_BR! : process.env.STRIPE_SECRET_US!;
  return new Stripe(key);
}

export function getStripeWebhookSecret(currency: 'BRL' | 'USD') {
  return currency === 'BRL' ? process.env.STRIPE_WEBHOOK_SECRET_BR! : process.env.STRIPE_WEBHOOK_SECRET_US!;
}

export function validateStripeSignature(rawBody: string, signature: string, currency: 'BRL' | 'USD') {
  const stripe = stripeFor(currency);
  const secret = getStripeWebhookSecret(currency);
  
  try {
    return stripe.webhooks.constructEvent(rawBody, signature, secret);
  } catch (error) {
    return null;
  }
}
