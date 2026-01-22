import { NextApiRequest, NextApiResponse } from 'next';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2022-11-15',
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).end('Method Not Allowed');
  }

  const { amount, description } = req.body;
  const numericAmount = parseFloat(amount);
  if (isNaN(numericAmount) || numericAmount < 1) {
    return res.status(400).json({ error: 'Amount must be at least $1' });
  }

  // Add 7.5% surcharge
  const totalAmount = numericAmount * 1.075;
  const totalInCents = Math.round(totalAmount * 100);

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: process.env.NEXT_PUBLIC_CURRENCY || 'usd',
            product_data: {
              name: 'Donation',
            },
            unit_amount: totalInCents,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_SUCCESS_URL}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: 'https:/:camerongupta.com',

    return res.status(200).json({ id: session.id });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Unable to create checkout session' });
  }
}
