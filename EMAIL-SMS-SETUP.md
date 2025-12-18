# Email and SMS Stock Alert Setup Guide

This guide explains how to configure Email and SMS notifications for low stock alerts in your inventory management system.

## Prerequisites

1. For Email: An SMTP server or email service provider account (like Gmail, SendGrid, etc.)
2. For SMS: A Fast2SMS account (BEST for beginners & cheap)

## Setting Up Email Notifications

### Option 1: Using SMTP (Gmail, Outlook, etc.)

1. Obtain your SMTP server details:
   - Host (e.g., smtp.gmail.com for Gmail)
   - Port (587 for TLS, 465 for SSL)
   - Username (your email address)
   - Password (your email password or app-specific password)

2. Update your `.env` file:
```env
VITE_SMTP_HOST=smtp.gmail.com
VITE_SMTP_PORT=587
VITE_SMTP_USER=youremail@gmail.com
VITE_SMTP_PASS=yourpassword
VITE_OWNER_EMAIL=manager@yourcompany.com
```

### Option 2: Using SendGrid

1. Sign up for a SendGrid account
2. Create an API key
3. Update your `.env` file:
```env
VITE_SENDGRID_API_KEY=your_sendgrid_api_key
VITE_OWNER_EMAIL=manager@yourcompany.com
```

## Setting Up SMS Notifications with Fast2SMS

Fast2SMS is recommended for beginners due to its simplicity and cost-effectiveness.

### Getting Started with Fast2SMS

1. Sign up for a Fast2SMS account at [fast2sms.com](https://www.fast2sms.com/)
2. Complete the registration process and KYC verification
3. Get your API key from the dashboard
4. Update your `.env` file:
```env
VITE_FAST2SMS_API_KEY=your_fast2sms_api_key
VITE_OWNER_PHONE_NUMBER=+919876543210  # Owner's phone number to receive alerts (with country code)
```

### Implementation

Update the `sendSMSNotification` function in `src/hooks/useAlerts.js`:

```javascript
async function sendSMSNotification(alert) {
  try {
    // Get product details if it's a product-related alert
    let productInfo = '';
    if (alert.product_id) {
      const products = (await cacheService.get('products')) || await productsService.getAll();
      const product = products.find(p => p.id === alert.product_id);
      if (product) {
        productInfo = ` Product: ${product.name} (SKU: ${product.sku}).`;
      }
    }
    
    // Construct SMS message (keep it short for SMS)
    const message = `STOCK ALERT: ${alert.title}.${productInfo} Please reorder soon.`;
    
    // Send message via Fast2SMS
    const response = await fetch('https://www.fast2sms.com/dev/bulkV2', {
      method: 'POST',
      headers: {
        'authorization': import.meta.env.VITE_FAST2SMS_API_KEY,
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache'
      },
      body: JSON.stringify({
        route: 'v3',
        sender_id: 'FSTSMS',
        message: message,
        language: 'english',
        flash: 0,
        numbers: import.meta.env.VITE_OWNER_PHONE_NUMBER.replace('+', '') // Remove + sign for Fast2SMS
      })
    });
    
    const result = await response.json();
    
    if (!result.return) {
      throw new Error(`Fast2SMS API error: ${result.message}`);
    }
    
    console.log('SMS Notification Sent');
    toast.success(`SMS alert sent for ${alert.title}`);
    
    return {
      success: true,
      messageId: `sms_${Date.now()}`,
      timestamp: new Date().toISOString(),
      recipient: import.meta.env.VITE_OWNER_PHONE_NUMBER
    };
  } catch (err) {
    console.error('SMS notification error:', err);
    toast.error(`Failed to send SMS alert for ${alert.title}`);
    throw err;
  }
}
```

## Testing

To test the email and SMS notifications:

1. Make sure your environment variables are correctly set
2. Reduce the stock level of a product below its reorder level
3. The system should automatically generate an alert and send both email and SMS messages
4. Check the browser console for any errors

## Troubleshooting

1. **Authentication Errors**: Verify your credentials are correct
2. **Messages Not Sending**: 
   - For email: Ensure the recipient email address is correct
   - For SMS: Ensure the recipient phone number is in E.164 format (+1234567890)
3. **Rate Limiting**: Both email and SMS services have rate limits; avoid sending too many messages in a short period
4. **Network Issues**: Check your internet connection and firewall settings

## Best Practices

1. **Error Handling**: Always wrap API calls in try/catch blocks
2. **Rate Limiting**: Implement rate limiting to avoid hitting API limits
3. **Logging**: Log all notifications for auditing purposes
4. **Security**: Never expose API keys in client-side code; use environment variables
5. **Testing**: Test thoroughly in a development environment before deploying to production
6. **Fallbacks**: Implement fallback mechanisms (e.g., if SMS fails, send email)