# Notification Channel Setup Guide

This guide explains how to configure Email and SMS notifications for the alert engine.

## Email Notifications

### Using Nodemailer
1. Install nodemailer: `npm install nodemailer`
2. Configure SMTP settings in your environment variables
3. Update your `.env` file:

```env
VITE_SMTP_HOST=smtp.yourprovider.com
VITE_SMTP_PORT=587
VITE_SMTP_USER=your_email@domain.com
VITE_SMTP_PASS=your_password
VITE_OWNER_EMAIL=manager@yourcompany.com
```

4. Update the email notification method:

```javascript
import nodemailer from 'nodemailer';

// Create transporter
const transporter = nodemailer.createTransporter({
  host: process.env.VITE_SMTP_HOST,
  port: process.env.VITE_SMTP_PORT,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.VITE_SMTP_USER,
    pass: process.env.VITE_SMTP_PASS
  }
});

await transporter.sendMail({
  from: '"Inventory Manager" <noreply@yourcompany.com>',
  to: process.env.VITE_OWNER_EMAIL,
  subject: `STOCK ALERT: ${alert.title}`,
  text: `${alert.title}\n\n${alert.message}`
});
```

### Using SendGrid
1. Sign up for SendGrid and get an API key
2. Install SendGrid package: `npm install @sendgrid/mail`
3. Update your `.env` file:

```env
VITE_SENDGRID_API_KEY=your_sendgrid_api_key
VITE_OWNER_EMAIL=manager@yourcompany.com
```

4. Update the email notification method:

```javascript
import sgMail from '@sendgrid/mail';

sgMail.setApiKey(process.env.VITE_SENDGRID_API_KEY);

const msg = {
  to: process.env.VITE_OWNER_EMAIL,
  from: 'noreply@yourcompany.com',
  subject: `STOCK ALERT: ${alert.title}`,
  text: `${alert.title}\n\n${alert.message}`,
  html: `<h2>${alert.title}</h2><p>${alert.message}</p>`,
};

await sgMail.send(msg);
```

## SMS Notifications with Fast2SMS

Fast2SMS is recommended for its ease of use and affordability, especially for beginners.

### Setup Instructions

1. Sign up for a Fast2SMS account at [fast2sms.com](https://www.fast2sms.com/)
2. Complete the registration process and KYC verification
3. Get your API key from the dashboard
4. Update your `.env` file:

```env
VITE_FAST2SMS_API_KEY=your_fast2sms_api_key
VITE_OWNER_PHONE_NUMBER=+919876543210
```

5. Update the SMS notification method:

```javascript
// Send SMS via Fast2SMS
const response = await fetch('https://www.fast2sms.com/dev/bulkV2', {
  method: 'POST',
  headers: {
    'authorization': process.env.VITE_FAST2SMS_API_KEY,
    'Content-Type': 'application/json',
    'Cache-Control': 'no-cache'
  },
  body: JSON.stringify({
    route: 'v3',
    sender_id: 'FSTSMS',
    message: `STOCK ALERT: ${alert.title}. Please reorder soon.`,
    language: 'english',
    flash: 0,
    numbers: process.env.VITE_OWNER_PHONE_NUMBER.replace('+', '')
  })
});

const result = await response.json();

if (!result.return) {
  throw new Error(`Fast2SMS API error: ${result.message}`);
}
```

## Environment Variables

Add the following to your `.env` file:

```env
# Email (SMTP)
VITE_SMTP_HOST=smtp.yourprovider.com
VITE_SMTP_PORT=587
VITE_SMTP_USER=your_email@domain.com
VITE_SMTP_PASS=your_password
VITE_OWNER_EMAIL=manager@yourcompany.com

# Email (SendGrid)
VITE_SENDGRID_API_KEY=your_sendgrid_api_key
VITE_OWNER_EMAIL=manager@yourcompany.com

# SMS (Fast2SMS) - BEST for beginners & cheap
VITE_FAST2SMS_API_KEY=your_fast2sms_api_key
VITE_OWNER_PHONE_NUMBER=+919876543210
```

## Testing Notifications

You can test your notification setup by calling the `sendNotification` method directly:

```javascript
// In a component or service
import { alertEngineService } from '../services/alertEngine.service';

const testAlert = {
  title: "Test Alert",
  message: "This is a test notification",
  type: "test",
  severity: "medium"
};

// Send to all channels
await alertEngineService.sendNotification(testAlert, ['email', 'sms']);
```

## Best Practices

1. **Rate Limiting**: Implement rate limiting to avoid spamming users
2. **Error Handling**: Always wrap notification calls in try/catch blocks
3. **Queue System**: For production, consider using a queue system like Bull or RabbitMQ
4. **Template System**: Use templates for consistent messaging
5. **User Preferences**: Allow users to configure which channels they want for different alert types