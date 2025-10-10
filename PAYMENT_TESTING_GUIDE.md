# Stripe Payment Gateway Testing Guide

## 🧪 Testing Your Payment Integration

### Prerequisites
1. ✅ Stripe account with test keys
2. ✅ Server running on `http://localhost:3000`
3. ✅ Database with payment tables
4. ✅ API endpoints configured

## 🔧 Testing Tools Needed

### Option 1: Using Postman
Download and install [Postman](https://www.postman.com/downloads/)

### Option 2: Using curl commands
Use the command line examples below

### Option 3: Using a simple HTML test page
Create a basic frontend to test the flow

---

## 🧪 Test Scenarios

### 1. Create Payment Intent
**Endpoint:** `POST /api/payments/create-intent`

**Headers:**
```
Content-Type: application/json
Authorization: Bearer YOUR_JWT_TOKEN
```

**Body:**
```json
{
  "serviceId": "service_id_here",
  "amount": 100,
  "currency": "usd"
}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Payment intent created successfully",
  "data": {
    "paymentId": "payment_id",
    "clientSecret": "pi_xxx_secret_xxx",
    "paymentIntentId": "pi_xxx",
    "amount": 100,
    "platformFee": 5,
    "providerAmount": 95,
    "currency": "usd"
  }
}
```

### 2. Confirm Payment
**Endpoint:** `POST /api/payments/confirm`

**Headers:**
```
Content-Type: application/json
Authorization: Bearer YOUR_JWT_TOKEN
```

**Body:**
```json
{
  "paymentIntentId": "pi_xxx_from_previous_step"
}
```

### 3. Check Payment Status
**Endpoint:** `GET /api/payments/status/{paymentId}`

**Headers:**
```
Authorization: Bearer YOUR_JWT_TOKEN
```

### 4. Get Payment History
**Endpoint:** `GET /api/payments/history`

**Headers:**
```
Authorization: Bearer YOUR_JWT_TOKEN
```

### 5. Get Provider Earnings
**Endpoint:** `GET /api/payments/earnings`

**Headers:**
```
Authorization: Bearer YOUR_JWT_TOKEN
```

---

## 🃏 Stripe Test Cards

Use these test card numbers for different scenarios:

| Card Number | Description |
|-------------|-------------|
| `4242424242424242` | Succeeds |
| `4000000000000002` | Generic decline |
| `4000000000009995` | Insufficient funds |
| `4000000000009987` | Lost card |
| `4000000000009979` | Stolen card |
| `4000002500003155` | Requires authentication |

**Test Details:**
- **CVV:** Any 3 digits
- **Expiry:** Any future date
- **Postal Code:** Any valid postal code

---

## 🔍 Step-by-Step Testing Process

### Step 1: Setup Test Data
First, ensure you have:
- A valid user account with JWT token
- A service in your database
- A service provider

### Step 2: Test Payment Creation
```bash
curl -X POST http://localhost:3000/api/payments/create-intent \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "serviceId": "your_service_id",
    "amount": 100,
    "currency": "usd"
  }'
```

### Step 3: Test Payment Confirmation
```bash
curl -X POST http://localhost:3000/api/payments/confirm \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "paymentIntentId": "pi_xxx_from_step2"
  }'
```

### Step 4: Verify Database Changes
Check your database to ensure:
- Payment record is created
- Provider earnings are updated
- Payment status is correct

---

## 🔧 Troubleshooting Common Issues

### Issue 1: "User not authenticated"
**Solution:** Ensure you have a valid JWT token in the Authorization header

### Issue 2: "Service not found"
**Solution:** Make sure the serviceId exists in your database

### Issue 3: "Stripe API error"
**Solution:** Check your Stripe keys are correct in .env file

### Issue 4: "Payment intent not found"
**Solution:** Ensure you're using the correct paymentIntentId from the create step

---

## 📊 Verification Checklist

After running tests, verify:

- [ ] Payment intent created in Stripe dashboard
- [ ] Payment record saved in database
- [ ] Platform fee calculated correctly (5%)
- [ ] Provider amount calculated correctly (95%)
- [ ] Provider earnings updated
- [ ] Webhook events received (if configured)

---

## 🌐 Testing with Frontend

Create a simple HTML page to test the complete flow:

```html
<!DOCTYPE html>
<html>
<head>
    <title>Payment Test</title>
    <script src="https://js.stripe.com/v3/"></script>
</head>
<body>
    <button id="pay-button">Pay $100</button>
    
    <script>
        const stripe = Stripe('pk_test_your_publishable_key');
        
        document.getElementById('pay-button').addEventListener('click', async () => {
            // 1. Create payment intent via your API
            const response = await fetch('/api/payments/create-intent', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer YOUR_JWT_TOKEN'
                },
                body: JSON.stringify({
                    serviceId: 'your_service_id',
                    amount: 100,
                    currency: 'usd'
                })
            });
            
            const { data } = await response.json();
            
            // 2. Confirm payment with Stripe
            const { error } = await stripe.confirmCardPayment(data.clientSecret, {
                payment_method: {
                    card: {
                        number: '4242424242424242',
                        exp_month: 12,
                        exp_year: 2025,
                        cvc: '123'
                    }
                }
            });
            
            if (error) {
                console.error('Payment failed:', error);
            } else {
                console.log('Payment succeeded!');
                // 3. Confirm with your backend
                await fetch('/api/payments/confirm', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer YOUR_JWT_TOKEN'
                    },
                    body: JSON.stringify({
                        paymentIntentId: data.paymentIntentId
                    })
                });
            }
        });
    </script>
</body>
</html>
```

---

## 📈 Expected Flow

1. **Customer** makes payment → **100% charged**
2. **Platform** keeps **5%** → **$5 commission**
3. **Provider** receives **95%** → **$95 earnings**
4. **Database** updated with transaction details
5. **Webhook** confirms payment status

---

## 🚀 Next Steps After Testing

1. **Configure Webhooks** in Stripe Dashboard
2. **Set up frontend** payment forms
3. **Add error handling** for edge cases
4. **Implement payout system** for providers
5. **Add payment notifications** to users

Ready to test? Start with the curl commands above!