import React, { useState, useEffect } from 'react';
import { 
  MessageCircle, 
  Phone, 
  Send, 
  CheckCircle, 
  AlertCircle, 
  Settings,
  Bell,
  Shield
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuction } from '../../context/AuctionContext';

const WhatsAppSettings: React.FC = () => {
  const { state, updatePhoneNumber, testWhatsApp } = useAuction();
  const [phoneNumber, setPhoneNumber] = useState(state.user?.phoneNumber || '');
  const [isEditing, setIsEditing] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<'success' | 'error' | null>(null);

  // Sync phone number when user data changes
  useEffect(() => {
    if (state.user?.phoneNumber && state.user.phoneNumber !== phoneNumber) {
      setPhoneNumber(state.user.phoneNumber);
      console.log('📱 Phone number loaded from user profile:', state.user.phoneNumber);

      // Show a subtle success message when phone number is loaded
      if (phoneNumber === '') {
        toast.success('📱 Phone number loaded from your profile!', {
          duration: 2000,
          icon: '✅'
        });
      }
    }
  }, [state.user?.phoneNumber, phoneNumber]);

  const handleUpdatePhone = async () => {
    if (!phoneNumber.trim()) {
      toast.error('Please enter a valid phone number');
      return;
    }

    // Basic phone number validation
    const phoneRegex = /^\+?[\d\s\-\(\)]{10,}$/;
    if (!phoneRegex.test(phoneNumber)) {
      toast.error('Please enter a valid phone number with country code');
      return;
    }

    try {
      await updatePhoneNumber(phoneNumber);
      setIsEditing(false);
      setTestResult(null);
    } catch (error) {
      console.error('Phone update error:', error);
    }
  };

  const handleTestWhatsApp = async () => {
    if (!phoneNumber.trim()) {
      toast.error('Please enter a phone number first');
      return;
    }

    setIsTesting(true);
    setTestResult(null);

    try {
      await testWhatsApp(phoneNumber);
      setTestResult('success');
    } catch (error) {
      setTestResult('error');
      console.error('WhatsApp test error:', error);
    } finally {
      setIsTesting(false);
    }
  };

  const formatPhoneNumber = (phone: string): string => {
    // Simple formatting for display
    if (phone.startsWith('+')) return phone;
    return `+${phone}`;
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <MessageCircle className="w-5 h-5 text-green-600" />
          <h3 className="text-lg font-semibold text-gray-900">WhatsApp Invoices</h3>
        </div>
        <div className={`px-3 py-1 rounded-full text-xs font-medium ${
          state.whatsappConnected 
            ? 'bg-green-100 text-green-800' 
            : 'bg-gray-100 text-gray-600'
        }`}>
          {state.whatsappConnected ? 'Connected' : 'Not Connected'}
        </div>
      </div>

      {/* Feature Description */}
      <div className="mb-6 p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-green-200">
        <div className="flex items-start space-x-3">
          <div className="p-2 bg-green-100 rounded-full">
            <Bell className="w-4 h-4 text-green-600" />
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-1">Instant Invoice Delivery</h4>
            <p className="text-xs text-gray-600">
              Get detailed trading invoices sent directly to your WhatsApp after each bid. 
              Includes profit/loss calculations, timestamps, and trading tips.
            </p>
          </div>
        </div>
      </div>

      {/* Phone Number Section */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          WhatsApp Phone Number
        </label>
        
        {isEditing ? (
          <div className="space-y-3">
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                placeholder="+1 (555) 123-4567"
              />
            </div>
            <div className="text-xs text-gray-500">
              Include country code (e.g., +1 for US, +91 for India)
            </div>
            <div className="flex space-x-3">
              <button
                onClick={handleUpdatePhone}
                disabled={state.loading}
                className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors text-sm font-medium"
              >
                {state.loading ? 'Saving...' : 'Save Number'}
              </button>
              <button
                onClick={() => {
                  setIsEditing(false);
                  setPhoneNumber(state.user?.phoneNumber || '');
                }}
                className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors text-sm font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className={`flex items-center justify-between p-3 rounded-lg transition-all duration-200 ${
            state.user?.phoneNumber
              ? 'bg-green-50 border border-green-200 hover:bg-green-100'
              : 'bg-gray-50 border border-gray-200 hover:bg-gray-100'
          }`}>
            <div className="flex items-center space-x-3">
              <Phone className={`w-5 h-5 ${
                state.user?.phoneNumber ? 'text-green-600' : 'text-gray-400'
              }`} />
              <div className="flex flex-col">
                <span className="text-gray-900 font-medium">
                  {state.user?.phoneNumber ? formatPhoneNumber(state.user.phoneNumber) : 'Not set'}
                </span>
                {state.user?.phoneNumber && (
                  <span className="text-xs text-green-600 flex items-center space-x-1">
                    <CheckCircle className="w-3 h-3" />
                    <span>Saved to your profile</span>
                  </span>
                )}
              </div>
            </div>
            <button
              onClick={() => setIsEditing(true)}
              className={`text-sm font-medium transition-colors duration-200 ${
                state.user?.phoneNumber
                  ? 'text-green-600 hover:text-green-800'
                  : 'text-blue-600 hover:text-blue-800'
              }`}
            >
              {state.user?.phoneNumber ? 'Edit' : 'Add Number'}
            </button>
          </div>
        )}
      </div>

      {/* Test Connection */}
      {state.user?.phoneNumber && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-medium text-gray-700">Test Connection</h4>
            {testResult && (
              <div className={`flex items-center space-x-1 text-xs ${
                testResult === 'success' ? 'text-green-600' : 'text-red-600'
              }`}>
                {testResult === 'success' ? (
                  <CheckCircle className="w-4 h-4" />
                ) : (
                  <AlertCircle className="w-4 h-4" />
                )}
                <span>{testResult === 'success' ? 'Test Successful' : 'Test Failed'}</span>
              </div>
            )}
          </div>
          
          <button
            onClick={handleTestWhatsApp}
            disabled={isTesting || !state.user?.phoneNumber}
            className="w-full flex items-center justify-center space-x-2 bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors font-medium"
          >
            {isTesting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Sending Test...</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>Send Test Message</span>
              </>
            )}
          </button>
          
          <p className="text-xs text-gray-500 mt-2 text-center">
            This will send a test invoice to verify your WhatsApp connection
          </p>
        </div>
      )}

      {/* Features List */}
      <div className="space-y-4">
        <h4 className="text-sm font-medium text-gray-700">Invoice Features</h4>
        
        <div className="space-y-3">
          <div className="flex items-center space-x-3">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-sm text-gray-600">Instant bid confirmations</span>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-sm text-gray-600">Real-time profit/loss calculations</span>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-sm text-gray-600">Detailed trading summaries</span>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-sm text-gray-600">Trading tips and insights</span>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-sm text-gray-600">Formatted for easy reading</span>
          </div>
        </div>
      </div>

      {/* Privacy Notice */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="flex items-start space-x-2">
          <Shield className="w-4 h-4 text-gray-400 mt-0.5" />
          <div className="text-xs text-gray-500">
            <p className="font-medium mb-1">Privacy & Security</p>
            <p>
              Your phone number is securely stored and only used for sending trading invoices. 
              We never share your information with third parties.
            </p>
          </div>
        </div>
      </div>

      {/* Sample Invoice Preview */}
      {state.user?.phoneNumber && (
        <div className="mt-6 pt-4 border-t border-gray-200">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Sample Invoice Preview</h4>
          <div className="p-3 bg-gray-50 rounded-lg text-xs font-mono text-gray-600 border">
            <div className="whitespace-pre-line">
{`🎯 STOCK AUCTION INVOICE 🎯
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

👤 Trader: ${state.user.displayName}
📊 Stock: AAPL - Apple Inc.
🟢 BUY Order Type: BUY
🔢 Quantity: 10
💰 Bid Price: ₹150.00

🟢 PROFIT: +₹25.00 📈

🕐 Timestamp: ${new Date().toLocaleString('en-IN')}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🚀 Stock Auction Platform

🎉 Excellent trade! Keep up the great work!`}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WhatsAppSettings;
