// WhatsApp Backend Server for Stock Auction Platform
// Run this file to enable real WhatsApp messaging

const express = require('express');
const cors = require('cors');

// Check if Twilio is installed
let twilio;
try {
  twilio = require('twilio');
} catch (error) {
  console.error('❌ Twilio not installed. Run: npm install twilio');
  process.exit(1);
}

const app = express();

// Middleware
app.use(cors({
  origin: ['http://localhost:5177', 'http://localhost:3000', 'http://localhost:5173'],
  credentials: true
}));
app.use(express.json());

// Twilio configuration from environment variables
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const whatsappNumber = process.env.TWILIO_WHATSAPP_NUMBER || 'whatsapp:+14155238886';

// Validate Twilio configuration
if (!accountSid || !authToken) {
  console.error('❌ Missing Twilio credentials!');
  console.log('📝 Create a .env file with:');
  console.log('TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxx');
  console.log('TWILIO_AUTH_TOKEN=your_auth_token_here');
  console.log('TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886');
  process.exit(1);
}

const client = twilio(accountSid, authToken);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'WhatsApp API Server',
    timestamp: new Date().toISOString(),
    twilio: {
      accountSid: accountSid.substring(0, 8) + '...',
      whatsappNumber: whatsappNumber
    }
  });
});

// Send WhatsApp message endpoint
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
    let formattedTo = to;
    if (!to.startsWith('whatsapp:')) {
      // Remove any non-digits and add whatsapp: prefix
      const cleanNumber = to.replace(/\D/g, '');
      formattedTo = `whatsapp:+${cleanNumber}`;
    }

    console.log(`📱 Sending WhatsApp message to: ${formattedTo}`);

    // Send message via Twilio
    const message = await client.messages.create({
      from: whatsappNumber,
      to: formattedTo,
      body: body
    });

    console.log('✅ WhatsApp message sent successfully:', {
      to: formattedTo,
      messageId: message.sid,
      status: message.status
    });

    res.json({
      success: true,
      messageId: message.sid,
      status: message.status,
      to: formattedTo
    });

  } catch (error) {
    console.error('❌ WhatsApp send error:', error);
    
    // Handle specific Twilio errors
    let errorMessage = error.message;
    if (error.code === 21211) {
      errorMessage = 'Invalid phone number format';
    } else if (error.code === 21408) {
      errorMessage = 'WhatsApp not enabled for this number';
    } else if (error.code === 20003) {
      errorMessage = 'Authentication failed - check credentials';
    }
    
    res.status(500).json({
      success: false,
      error: errorMessage,
      code: error.code || 'UNKNOWN'
    });
  }
});

// Test WhatsApp endpoint
app.post('/api/test-whatsapp', async (req, res) => {
  try {
    const { phoneNumber } = req.body;

    if (!phoneNumber) {
      return res.status(400).json({
        success: false,
        error: 'Phone number is required'
      });
    }

    const testMessage = `🧪 WhatsApp Test Message

✅ Your WhatsApp integration is working!

🎯 Stock Auction Platform
📱 Test completed successfully at ${new Date().toLocaleString()}

This confirms that:
• Your Twilio account is active
• WhatsApp Business API is configured  
• Messages can be delivered to ${phoneNumber}

Ready to receive trading invoices! 🚀

_This is an automated test message_`;

    // Format phone number
    let formattedTo = phoneNumber;
    if (!phoneNumber.startsWith('whatsapp:')) {
      const cleanNumber = phoneNumber.replace(/\D/g, '');
      formattedTo = `whatsapp:+${cleanNumber}`;
    }

    console.log(`🧪 Sending test message to: ${formattedTo}`);

    const message = await client.messages.create({
      from: whatsappNumber,
      to: formattedTo,
      body: testMessage
    });

    console.log('✅ Test message sent successfully:', {
      to: formattedTo,
      messageId: message.sid
    });

    res.json({
      success: true,
      messageId: message.sid,
      message: 'Test message sent successfully!',
      to: formattedTo
    });

  } catch (error) {
    console.error('❌ WhatsApp test error:', error);
    
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to send test message',
      code: error.code || 'UNKNOWN'
    });
  }
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('❌ Server error:', error);
  res.status(500).json({
    success: false,
    error: 'Internal server error'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found'
  });
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log('');
  console.log('🚀 ═══════════════════════════════════════════════════════════');
  console.log('📱 WhatsApp API Server Started Successfully!');
  console.log('🚀 ═══════════════════════════════════════════════════════════');
  console.log(`🌐 Server running on: http://localhost:${PORT}`);
  console.log(`📞 Twilio Account: ${accountSid.substring(0, 8)}...`);
  console.log(`📱 WhatsApp Number: ${whatsappNumber}`);
  console.log('');
  console.log('📋 Available Endpoints:');
  console.log(`   GET  /api/health           - Health check`);
  console.log(`   POST /api/send-whatsapp    - Send WhatsApp message`);
  console.log(`   POST /api/test-whatsapp    - Send test message`);
  console.log('');
  console.log('✅ Ready to send WhatsApp messages!');
  console.log('🚀 ═══════════════════════════════════════════════════════════');
  console.log('');
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('📱 WhatsApp server shutting down gracefully...');
  process.exit(0);
});

module.exports = app;
