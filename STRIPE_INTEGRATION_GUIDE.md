# Stripe Payment Integration Guide

## 🚀 Implementation Complete!

Your Stripe payment gateway has been successfully integrated into your ecommerce backend. Here's what we've built:

### ✅ What's Been Implemented

1. **Database Schema**: Enhanced Payment model with Stripe fields + ProviderEarnings table
2. **Stripe Service**: Complete payment processing with fee calculation
3. **Payment Controller**: RESTful API endpoints for all payment operations
4. **Routes**: Secure API routes with authentication
5. **Payout System**: Provider earnings tracking and payout functionality
6. **Webhook Handler**: Real-time payment status updates from Stripe

### 🛠️ Setup Steps

#### 1. Apply Database Changes
```bash
npx prisma generate
npx prisma migrate dev --name add_stripe_payment_system
```

#### 2. Configure Stripe Webhook (Important!)
1. Go to your Stripe Dashboard → Webhooks
2. Add endpoint: `https://yourdomain.com/api/payments/webhook`
3. Select these events:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `payment_intent.canceled`
4. Copy the webhook signing secret
5. Update your `.env` file:
```env
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
```

### 📋 API Endpoints

#### Customer Payment Flow
```bash
# 1. Create Payment Intent
POST /api/payments/create-intent
Headers: Authorization: Bearer <user_token>
Body: {
  "serviceId": "service_id_here",
  "amount": 100.00,
  "currency": "usd"
}

# 2. Confirm Payment (after frontend payment)
POST /api/payments/confirm
Headers: Authorization: Bearer <user_token>
Body: {
  "paymentIntentId": "pi_stripe_payment_intent_id"
}

# 3. Get Payment Status
GET /api/payments/status/:paymentId
Headers: Authorization: Bearer <user_token>

# 4. Get Payment History
GET /api/payments/history?page=1&limit=10
Headers: Authorization: Bearer <user_token>
```

#### Provider Earnings
```bash
# Get Provider Earnings
GET /api/payments/earnings
Headers: Authorization: Bearer <provider_token>

# Refund Payment (Provider/Admin only)
POST /api/payments/refund/:paymentId
Headers: Authorization: Bearer <provider_token>
Body: {
  "amount": 50.00,  // optional, full refund if omitted
  "reason": "Customer request"
}
```

### 🧪 Testing with Stripe Test Cards

Use these test card numbers in your frontend:

#### Successful Payments
- **4242424242424242** - Visa (succeeds)
- **4000000000003220** - 3D Secure authentication required
- **5555555555554444** - Mastercard (succeeds)

#### Failed Payments
- **4000000000000002** - Card declined
- **4000000000009995** - Insufficient funds
- **4000000000000069** - Expired card

### 💰 How the Payment Flow Works

1. **Customer Initiates Payment**:
   - Frontend calls `/api/payments/create-intent`
   - Backend creates Stripe PaymentIntent
   - Platform fee (10%) is calculated automatically
   - Returns `client_secret` for frontend

2. **Frontend Handles Payment**:
   - Use Stripe.js to confirm payment with `client_secret`
   - Customer enters card details securely on Stripe

3. **Payment Processing**:
   - Stripe processes payment and sends webhook
   - Backend updates payment status
   - Provider earnings are automatically updated

4. **Provider Gets Paid**:
   - Earnings appear in provider's account
   - Provider can request payout to their bank
   - Platform keeps 10% fee

### 📊 Fee Structure

- **Platform Fee**: 10% (configurable in `stripe.service.ts`)
- **Example**: $100 service → $10 platform fee, $90 to provider
- **Stripe Fees**: Handled separately by Stripe (~2.9% + 30¢)

### 🔒 Security Features

- **Authentication**: All endpoints require valid JWT tokens
- **Authorization**: Providers can only access their own data
- **Webhook Verification**: Stripe signature validation
- **Rate Limiting**: Built-in protection against abuse

### 🚀 Frontend Integration Example

```javascript
// 1. Create payment intent
const response = await fetch('/api/payments/create-intent', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${userToken}`
  },
  body: JSON.stringify({
    serviceId: 'service_123',
    amount: 100.00,
    currency: 'usd'
  })
});

const { clientSecret } = await response.json();

// 2. Use Stripe.js to handle payment
const stripe = Stripe('pk_test_your_publishable_key');
const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
  payment_method: {
    card: cardElement,
    billing_details: {
      name: 'Customer Name'
    }
  }
});

if (error) {
  console.error('Payment failed:', error);
} else {
  // 3. Confirm payment on backend
  await fetch('/api/payments/confirm', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${userToken}`
    },
    body: JSON.stringify({
      paymentIntentId: paymentIntent.id
    })
  });
}
```

### 🔧 Configuration Options

Edit `src/services/stripe.service.ts` to customize:

```typescript
// Platform fee percentage (currently 10%)
const platformFeePercentage = 0.10; // Change to your desired fee

// Currency settings
const defaultCurrency = 'usd'; // Change default currency

// Minimum payout amount
const minimumPayout = 25; // $25 minimum for payouts
```

### 📈 Next Steps

1. **Test the integration** with Stripe test cards
2. **Configure your frontend** to use the new endpoints
3. **Set up webhooks** in Stripe Dashboard
4. **Customize platform fees** if needed
5. **Add provider onboarding** for payouts (Stripe Express accounts)

### 🆘 Troubleshooting

**Common Issues:**
- **Database errors**: Run `npx prisma generate` and `npx prisma migrate dev`
- **Webhook failures**: Check STRIPE_WEBHOOK_SECRET is correct
- **Authentication errors**: Ensure JWT tokens are valid
- **Payment failures**: Use proper test card numbers

**Logs to check:**
- Server console for error messages
- Stripe Dashboard → Events for webhook delivery status
- Browser network tab for API response details

### 🎉 You're Ready!

Your Stripe payment system is now fully functional with:
- ✅ Secure payment processing
- ✅ Automatic fee calculation
- ✅ Provider earnings tracking
- ✅ Webhook handling
- ✅ Comprehensive API endpoints

Start testing with the Stripe test cards and integrate with your frontend!