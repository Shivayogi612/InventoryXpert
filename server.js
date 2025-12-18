// Simple Express server to handle SMS sending and avoid CORS issues
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import fetch from 'node-fetch';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3002; // Changed from 3001 to 3002

// Middleware
app.use(cors());
app.use(express.json());

// SMS endpoint
app.post('/api/send-sms', async (req, res) => {
  try {
    const { message, phoneNumber } = req.body;
    console.log(`Received SMS request for ${phoneNumber}: "${message}"`);

    if (!message || !phoneNumber) {
      console.warn('Missing message or phone number');
      return res.status(400).json({
        success: false,
        message: 'Message and phone number are required'
      });
    }

    // Send SMS via Fast2SMS
    const response = await fetch('https://www.fast2sms.com/dev/bulkV2', {
      method: 'POST',
      headers: {
        'authorization': process.env.VITE_FAST2SMS_API_KEY || process.env.FAST2SMS_API_KEY,
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache'
      },
      body: JSON.stringify({
        route: 'q',
        message: message,
        language: 'english',
        flash: 0,
        numbers: phoneNumber.replace('+', '').trim()
      })
    });

    const result = await response.json();

    if (result.return) {
      return res.json({
        success: true,
        messageId: result.request_id,
        message: 'SMS sent successfully'
      });
    } else {
      return res.status(400).json({
        success: false,
        message: result.message || 'Failed to send SMS'
      });
    }
  } catch (error) {
    console.error('SMS sending error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Start server
app.listen(PORT, () => {
  console.log(`Proxy server running on port ${PORT}`);
});

export default app;