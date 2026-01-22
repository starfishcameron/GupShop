import { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';

export default function Home() {
  const [amount, setAmount] = useState('1.00');
  const [description, setDescription] = useState('Donation');
  const [loading, setLoading] = useState(false);

  const handleCheckout = async () => {
    setLoading(true);
    const response = await fetch('/api/checkout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ amount, description }),
    });
    const data = await response.json();
    if (data.id) {
      const stripe = await loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY as string);
      await stripe?.redirectToCheckout({ sessionId: data.id });
    }
    setLoading(false);
  };

  const numericAmount = parseFloat(amount || '0');
  const surchargePercent = 0.075;
  const total = numericAmount + numericAmount * surchargePercent;
  const formattedTotal = total.toFixed(2);
  const disabled = isNaN(numericAmount) || numericAmount < 1 || loading;

  return (
    <main style={{ padding: '2rem', maxWidth: '400px', margin: '0 auto' }}>
      <h1>GupShop</h1>
      <label htmlFor="amount">Amount (USD):</label>
      <input
        id="amount"
        type="number"
        min="1"
        step="0.01"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        style={{ width: '100%', marginBottom: '1rem' }}
      />
      <label htmlFor="description">Description:</label>
      <input
        id="description"
        type="text"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        style={{ width: '100%', marginBottom: '1rem' }}
      />
      <button
        onClick={handleCheckout}
        disabled={disabled}
        style={{ padding: '0.5rem 1rem', backgroundColor: '#6366F1', color: 'white', border: 'none', width: '100%' }}
      >
        {loading ? 'Processing...' : `Pay $${formattedTotal} (plus 7.5% fee)`}
      </button>
    </main>
  );
}
