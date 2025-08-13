// Backend API Example for WhatsApp Integration
// This file shows how to implement a backend API for real WhatsApp messaging

const express = require('express');
const cors = require('cors');
const twilio = require('twilio');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Twilio configuration
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const whatsappNumber = process.env.TWILIO_WHATSAPP_NUMBER || 'whatsapp:+14155238886';

const client = twilio(accountSid, authToken);

// WhatsApp message endpoint
app.post('/api/send-whatsapp', async (req, res) => {
  try {
    const { to, body } = req.body;

    // Validate input
    if (!to || !body) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: to, body'
      });
    }

    // Format phone number for WhatsApp
    const formattedTo = to.startsWith('whatsapp:') ? to : `whatsapp:${to}`;

    // Send message via Twilio
    const message = await client.messages.create({
      from: whatsappNumber,
      to: formattedTo,
      body: body
    });

    console.log('✅ WhatsApp message sent:', {
      to: formattedTo,
      messageId: message.sid,
      status: message.status
    });

    res.json({
      success: true,
      messageId: message.sid,
      status: message.status
    });

  } catch (error) {
    console.error('❌ WhatsApp send error:', error);
    
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to send WhatsApp message'
    });
  }
});

// Test endpoint
app.post('/api/test-whatsapp', async (req, res) => {
  try {
    const { phoneNumber } = req.body;

    const testMessage = `🧪 WhatsApp Test Message

✅ Your WhatsApp integration is working!

🎯 Stock Auction Platform
📱 Test completed successfully

This confirms that:
• Your Twilio account is active
• WhatsApp Business API is configured
• Messages can be delivered to ${phoneNumber}

Ready to receive trading invoices! 🚀`;

    const formattedTo = phoneNumber.startsWith('whatsapp:') 
      ? phoneNumber 
      : `whatsapp:${phoneNumber}`;

    const message = await client.messages.create({
      from: whatsappNumber,
      to: formattedTo,
      body: testMessage
    });

    res.json({
      success: true,
      messageId: message.sid,
      message: 'Test message sent successfully!'
    });

  } catch (error) {
    console.error('❌ WhatsApp test error:', error);
    
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to send test message'
    });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'WhatsApp API',
    timestamp: new Date().toISOString()
  });
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`🚀 WhatsApp API server running on port ${PORT}`);
  console.log(`📱 Twilio Account: ${accountSid ? accountSid.substring(0, 8) + '...' : 'Not configured'}`);
  console.log(`📞 WhatsApp Number: ${whatsappNumber}`);
});

// Export for serverless deployment
module.exports = app;

/*
DEPLOYMENT INSTRUCTIONS:

1. Install dependencies:
   npm install express cors twilio

2. Set environment variables:
   TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   TWILIO_AUTH_TOKEN=your_auth_token_here
   TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886

3. Run the server:
   node backend-api-example.js

4. Update frontend to use: http://localhost:3001/api/send-whatsapp

5. For production, deploy to:
   - Vercel (serverless)
   - Heroku
   - AWS Lambda
   - Your own server

6. Update CORS settings for your domain
*/
