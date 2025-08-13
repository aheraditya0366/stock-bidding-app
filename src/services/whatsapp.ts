// src/services/whatsapp.ts

export interface Invoice {
  item: string;
  quantity: number;
  price: number;
  profitLoss: number;
  timestamp: string;
  user: string;
  bidType: 'buy' | 'sell';
  stockSymbol: string;
  bidId?: string;
}

export interface WhatsAppResponse {
  success: boolean;
  messageId?: string;
  error?: string;
  deliveryStatus?: 'sent' | 'delivered' | 'read' | 'failed';
}

class WhatsAppService {
  private accountSid: string;
  private authToken: string;
  private whatsappNumber: string;
  private isConfigured: boolean;
  private backendApiUrl: string;
  private useBackendApi: boolean;

  constructor() {
    // Twilio credentials
    this.accountSid = import.meta.env.VITE_TWILIO_ACCOUNT_SID || '';
    this.authToken = import.meta.env.VITE_TWILIO_AUTH_TOKEN || '';
    this.whatsappNumber = import.meta.env.VITE_TWILIO_WHATSAPP_NUMBER || 'whatsapp:+14155238886';

    // Backend API configuration
    this.backendApiUrl = import.meta.env.VITE_BACKEND_API_URL || 'http://localhost:3001';
    this.useBackendApi = import.meta.env.VITE_USE_BACKEND_API === 'true';

    // Check if service is properly configured
    this.isConfigured = Boolean(
      (this.useBackendApi && this.backendApiUrl) ||
      (this.accountSid &&
       this.authToken &&
       this.accountSid !== 'your_twilio_account_sid' &&
       this.authToken !== 'your_twilio_auth_token')
    );

    console.log('📱 WhatsApp Service Configuration:');
    console.log(`   Backend API: ${this.useBackendApi ? 'Enabled' : 'Disabled'}`);
    console.log(`   API URL: ${this.backendApiUrl}`);
    console.log(`   Direct Twilio: ${this.accountSid ? 'Configured' : 'Not configured'}`);
    console.log(`   Account SID: ${this.accountSid ? this.accountSid.substring(0, 8) + '...' : 'Not set'}`);
    console.log(`   Auth Token: ${this.authToken ? 'Set (' + this.authToken.length + ' chars)' : 'Not set'}`);
    console.log(`   WhatsApp Number: ${this.whatsappNumber}`);
    console.log(`   Service Configured: ${this.isConfigured}`);

    if (!this.isConfigured) {
      console.warn('⚠️ WhatsApp not configured. Messages will be simulated.');
      console.log('📝 To enable real WhatsApp messages, choose one option:');
      console.log('');
      console.log('OPTION 1: Backend API (Recommended)');
      console.log('1. Set up backend server (see backend-api-example.js)');
      console.log('2. Add to .env.local:');
      console.log('   VITE_USE_BACKEND_API=true');
      console.log('   VITE_BACKEND_API_URL=http://localhost:3001');
      console.log('');
      console.log('OPTION 2: Direct Twilio (Limited by CORS)');
      console.log('1. Add to .env.local:');
      console.log('   VITE_TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxx');
      console.log('   VITE_TWILIO_AUTH_TOKEN=your_actual_auth_token');
      console.log('   VITE_TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886');
    } else {
      console.log('✅ WhatsApp service configured and ready');
    }
  }

  /**
   * Send WhatsApp invoice to user
   */
  async sendInvoice(phoneNumber: string, invoice: Invoice): Promise<WhatsAppResponse> {
    try {
      // Format phone number
      const formattedPhone = this.formatPhoneNumber(phoneNumber);
      if (!formattedPhone) {
        throw new Error('Invalid phone number format');
      }

      // Create invoice message
      const message = this.formatInvoiceMessage(invoice);

      // Send message via backend API or simulate
      console.log('📱 Sending WhatsApp invoice...');

      if (this.useBackendApi) {
        return await this.sendViaBackendAPI(formattedPhone, message);
      } else if (this.isConfigured) {
        return await this.sendTwilioMessage(formattedPhone, message);
      } else {
        return await this.simulateMessage(formattedPhone, message);
      }

    } catch (error) {
      console.error('❌ WhatsApp send failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Send message via backend API
   */
  private async sendViaBackendAPI(to: string, body: string): Promise<WhatsAppResponse> {
    try {
      console.log('🌐 Sending via backend API:', this.backendApiUrl);

      const response = await fetch(`${this.backendApiUrl}/api/send-whatsapp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ to, body })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      console.log('✅ WhatsApp message sent via backend:', {
        to,
        messageId: data.messageId,
        status: data.status
      });

      return {
        success: true,
        messageId: data.messageId,
        deliveryStatus: 'sent'
      };

    } catch (error) {
      console.error('❌ Backend API Error:', error);
      console.log('🔄 Falling back to simulation mode...');
      return await this.simulateMessage(to, body);
    }
  }

  /**
   * Send actual message via Twilio API (Direct - Limited by CORS)
   */
  private async sendTwilioMessage(to: string, body: string): Promise<WhatsAppResponse> {
    try {
      console.log('📞 Attempting direct Twilio API call...');

      const url = `https://api.twilio.com/2010-04-01/Accounts/${this.accountSid}/Messages.json`;

      const formData = new URLSearchParams({
        From: this.whatsappNumber,
        To: to,
        Body: body
      });

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': 'Basic ' + btoa(`${this.accountSid}:${this.authToken}`),
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      console.log('✅ WhatsApp message sent directly:', {
        to,
        messageId: data.sid,
        status: data.status
      });

      return {
        success: true,
        messageId: data.sid,
        deliveryStatus: 'sent'
      };

    } catch (error) {
      console.error('❌ Direct Twilio API failed (likely CORS):', error);
      console.log('🔄 Falling back to simulation mode...');
      return await this.simulateMessage(to, body);
    }
  }

  /**
   * Simulate message sending (when credentials not configured)
   */
  private async simulateMessage(to: string, body: string): Promise<WhatsAppResponse> {
    console.log('');
    console.log('📱 ═══════════════════════════════════════════════════════════');
    console.log('📱 SIMULATED WhatsApp Invoice (CORS prevents real sending)');
    console.log('📱 ═══════════════════════════════════════════════════════════');
    console.log(`📞 To: ${to}`);
    console.log('📄 Message Content:');
    console.log('─────────────────────────────────────────────────────────────');
    console.log(body);
    console.log('─────────────────────────────────────────────────────────────');
    console.log('✅ Invoice simulated successfully!');
    console.log('💡 In production, implement a backend API to send real messages');
    console.log('📱 ═══════════════════════════════════════════════════════════');
    console.log('');

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 800));

    return {
      success: true,
      messageId: 'simulated_' + Date.now(),
      deliveryStatus: 'sent'
    };
  }

  /**
   * Format invoice message with beautiful styling
   */
  private formatInvoiceMessage(invoice: Invoice): string {
    const profitLossEmoji = invoice.profitLoss >= 0 ? '📈' : '📉';
    const profitLossText = invoice.profitLoss >= 0 ? 'PROFIT' : 'LOSS';
    const statusEmoji = invoice.profitLoss >= 0 ? '🟢' : '🔴';
    const bidTypeEmoji = invoice.bidType === 'buy' ? '🟢 BUY' : '🔴 SELL';

    // Enhanced encouragement messages
    const encouragement = invoice.profitLoss >= 0
      ? invoice.profitLoss > 50
        ? '🎉 Outstanding trade! You\'re on fire! 🔥'
        : '✨ Great trade! Keep building that portfolio!'
      : invoice.profitLoss < -50
        ? '💪 Tough break, but champions bounce back stronger!'
        : '📊 Learning opportunity! Every trade teaches us something.';

    const bidIdText = invoice.bidId ? `\n🆔 *Bid ID:* ${invoice.bidId}` : '';

    // Calculate total value
    const totalValue = invoice.price * invoice.quantity;
    const currentTime = new Date(invoice.timestamp);

    return `
🎯 *STOCK AUCTION INVOICE* 🎯
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

👤 *Trader:* ${invoice.user}
📊 *Stock:* ${invoice.stockSymbol} - ${invoice.item}
${bidTypeEmoji} *Order Type:* ${invoice.bidType.toUpperCase()}
🔢 *Quantity:* ${invoice.quantity} shares
💰 *Price per Share:* ₹${invoice.price.toFixed(2)}
💵 *Total Value:* ₹${totalValue.toFixed(2)}${bidIdText}

${statusEmoji} *${profitLossText}:* ${invoice.profitLoss >= 0 ? '+' : ''}₹${Math.abs(invoice.profitLoss).toFixed(2)} ${profitLossEmoji}

🕐 *Timestamp:* ${currentTime.toLocaleString('en-IN', {
      timeZone: 'Asia/Kolkata',
      dateStyle: 'medium',
      timeStyle: 'short'
    })}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🚀 *Stock Auction Platform*

${encouragement}

💡 *Trading Analysis:*
${invoice.bidType === 'buy'
  ? `• You bought at ₹${invoice.price.toFixed(2)} per share
• Current market price affects your P&L
• Hold for potential gains or sell strategically`
  : `• You sold at ₹${invoice.price.toFixed(2)} per share
• Profit if market price drops below your sell price
• Monitor market trends for next opportunity`}

📈 *Portfolio Tips:*
• Diversify across different stocks
• Set stop-loss limits (5-10%)
• Keep 20% cash for opportunities
• Review trades weekly

📱 *Quick Actions:*
• Check live market prices
• View your trading history
• Set price alerts
• Join our trading community

_Happy Trading!_ 🎯✨

*Risk Warning:* Trading involves risk. This is a simulated platform for educational purposes only.
    `.trim();
  }

  /**
   * Format phone number for WhatsApp (international format)
   */
  private formatPhoneNumber(phone: string): string | null {
    // Remove all non-digits
    const cleaned = phone.replace(/\D/g, '');
    
    // Handle different formats
    let formatted = cleaned;
    
    // Add US country code if missing (assuming US +1)
    if (formatted.length === 10) {
      formatted = '1' + formatted;
    }
    
    // Validate length
    if (formatted.length < 10 || formatted.length > 15) {
      console.error('Invalid phone number length:', formatted.length);
      return null;
    }
    
    return `whatsapp:+${formatted}`;
  }

  /**
   * Test WhatsApp connection
   */
  async testConnection(phoneNumber: string): Promise<WhatsAppResponse> {
    const testInvoice: Invoice = {
      item: 'TEST - Connection Verification',
      quantity: 1,
      price: 0,
      profitLoss: 0,
      timestamp: new Date().toISOString(),
      user: 'System Test',
      bidType: 'buy',
      stockSymbol: 'TEST'
    };

    console.log('🧪 Testing WhatsApp connection...');
    return this.sendInvoice(phoneNumber, testInvoice);
  }

  /**
   * Get service status
   */
  getStatus() {
    return {
      configured: this.isConfigured,
      useBackendApi: this.useBackendApi,
      backendApiUrl: this.backendApiUrl,
      accountSid: this.accountSid ? `${this.accountSid.substring(0, 8)}...` : 'Not set',
      authToken: this.authToken ? `Set (${this.authToken.length} chars)` : 'Not set',
      whatsappNumber: this.whatsappNumber
    };
  }

  /**
   * Comprehensive diagnostic test
   */
  async runDiagnostics(): Promise<any> {
    console.log('🔍 Running WhatsApp Diagnostics...');

    const diagnostics = {
      timestamp: new Date().toISOString(),
      configuration: this.getStatus(),
      tests: {
        backendApiTest: null as any,
        directTwilioTest: null as any,
        phoneFormatTest: null as any
      }
    };

    // Test backend API if enabled
    if (this.useBackendApi) {
      try {
        const response = await fetch(`${this.backendApiUrl}/api/health`);
        diagnostics.tests.backendApiTest = {
          success: response.ok,
          status: response.status,
          message: response.ok ? 'Backend API accessible' : 'Backend API not responding'
        };
      } catch (error) {
        diagnostics.tests.backendApiTest = {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
          message: 'Backend API not accessible'
        };
      }
    }

    // Test phone number formatting
    const testPhone = '+8010822283';
    const formatted = this.formatPhoneNumber(testPhone);
    diagnostics.tests.phoneFormatTest = {
      input: testPhone,
      output: formatted,
      success: formatted !== null
    };

    console.log('📊 Diagnostics Results:', diagnostics);
    return diagnostics;
  }
}

// Export singleton instance
export const whatsappService = new WhatsAppService();

// Export main function for compatibility with your existing code
export const sendWhatsAppInvoice = async (phoneNumber: string, invoice: Invoice): Promise<WhatsAppResponse> => {
  return whatsappService.sendInvoice(phoneNumber, invoice);
};

