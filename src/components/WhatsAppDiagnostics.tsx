import React, { useState, useEffect } from 'react';
import { whatsappService } from '../services/whatsapp';
import { MessageCircle, CheckCircle, XCircle, AlertTriangle, RefreshCw } from 'lucide-react';

const WhatsAppDiagnostics: React.FC = () => {
  const [diagnostics, setDiagnostics] = useState<any>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [testPhone, setTestPhone] = useState('+1234567890');
  const [testResult, setTestResult] = useState<any>(null);

  const runDiagnostics = async () => {
    setIsRunning(true);
    try {
      const results = await whatsappService.runDiagnostics();
      setDiagnostics(results);
    } catch (error) {
      console.error('Diagnostics failed:', error);
    } finally {
      setIsRunning(false);
    }
  };

  const testMessage = async () => {
    setIsRunning(true);
    setTestResult(null);
    
    try {
      const result = await whatsappService.testConnection(testPhone);
      setTestResult(result);
    } catch (error) {
      setTestResult({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setIsRunning(false);
    }
  };

  useEffect(() => {
    runDiagnostics();
  }, []);

  const StatusIcon = ({ success }: { success: boolean }) => {
    return success ? (
      <CheckCircle className="w-5 h-5 text-green-500" />
    ) : (
      <XCircle className="w-5 h-5 text-red-500" />
    );
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <MessageCircle className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-bold text-gray-900">WhatsApp Diagnostics</h2>
          </div>
          <button
            onClick={runDiagnostics}
            disabled={isRunning}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isRunning ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>

        {diagnostics && (
          <div className="space-y-6">
            {/* Configuration Status */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold mb-4">Configuration Status</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Service Configured:</span>
                    <div className="flex items-center space-x-2">
                      <StatusIcon success={diagnostics.configuration.configured} />
                      <span className={`text-sm font-medium ${
                        diagnostics.configuration.configured ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {diagnostics.configuration.configured ? 'Yes' : 'No'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Backend API:</span>
                    <span className="text-sm font-medium">
                      {diagnostics.configuration.useBackendApi ? 'Enabled' : 'Disabled'}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">API URL:</span>
                    <span className="text-sm font-mono text-gray-800">
                      {diagnostics.configuration.backendApiUrl}
                    </span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Account SID:</span>
                    <span className="text-sm font-mono text-gray-800">
                      {diagnostics.configuration.accountSid}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Auth Token:</span>
                    <span className="text-sm font-mono text-gray-800">
                      {diagnostics.configuration.authToken}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">WhatsApp Number:</span>
                    <span className="text-sm font-mono text-gray-800">
                      {diagnostics.configuration.whatsappNumber}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Test Results */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold mb-4">Test Results</h3>
              <div className="space-y-3">
                {diagnostics.tests.backendApiTest && (
                  <div className="flex items-center justify-between p-3 bg-white rounded border">
                    <span className="text-sm font-medium">Backend API Test:</span>
                    <div className="flex items-center space-x-2">
                      <StatusIcon success={diagnostics.tests.backendApiTest.success} />
                      <span className="text-sm">{diagnostics.tests.backendApiTest.message}</span>
                    </div>
                  </div>
                )}
                
                <div className="flex items-center justify-between p-3 bg-white rounded border">
                  <span className="text-sm font-medium">Phone Format Test:</span>
                  <div className="flex items-center space-x-2">
                    <StatusIcon success={diagnostics.tests.phoneFormatTest.success} />
                    <span className="text-sm">
                      {diagnostics.tests.phoneFormatTest.input} → {diagnostics.tests.phoneFormatTest.output}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Manual Test */}
        <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
          <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5 text-yellow-600" />
            <span>Manual Test</span>
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Test Phone Number:
              </label>
              <input
                type="tel"
                value={testPhone}
                onChange={(e) => setTestPhone(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="+8010822283"
              />
            </div>

            <div className="grid grid-cols-1 gap-3">
              <button
                onClick={testMessage}
                disabled={isRunning || !testPhone}
                className="flex items-center justify-center space-x-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                {isRunning ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Sending Test...</span>
                  </>
                ) : (
                  <>
                    <MessageCircle className="w-4 h-4" />
                    <span>Send Test Message</span>
                  </>
                )}
              </button>

              <button
                onClick={async () => {
                  setIsRunning(true);
                  try {
                    // Test invoice directly
                    const testInvoice = {
                      item: 'Apple Inc.',
                      quantity: 10,
                      price: 151.50,
                      profitLoss: 15.00,
                      timestamp: new Date().toISOString(),
                      user: 'Test User',
                      bidType: 'buy' as const,
                      stockSymbol: 'AAPL',
                      bidId: 'test-bid-' + Date.now()
                    };

                    const result = await whatsappService.sendInvoice(testPhone, testInvoice);
                    setTestResult(result);
                  } catch (error) {
                    setTestResult({
                      success: false,
                      error: error instanceof Error ? error.message : 'Unknown error'
                    });
                  } finally {
                    setIsRunning(false);
                  }
                }}
                disabled={isRunning || !testPhone}
                className="flex items-center justify-center space-x-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {isRunning ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Testing Invoice...</span>
                  </>
                ) : (
                  <>
                    <MessageCircle className="w-4 h-4" />
                    <span>Test Trading Invoice</span>
                  </>
                )}
              </button>
            </div>
            
            {testResult && (
              <div className={`p-3 rounded-lg border ${
                testResult.success 
                  ? 'bg-green-50 border-green-200 text-green-800' 
                  : 'bg-red-50 border-red-200 text-red-800'
              }`}>
                <div className="flex items-center space-x-2">
                  <StatusIcon success={testResult.success} />
                  <span className="font-medium">
                    {testResult.success ? 'Test Successful!' : 'Test Failed'}
                  </span>
                </div>
                {testResult.error && (
                  <p className="text-sm mt-1">Error: {testResult.error}</p>
                )}
                {testResult.messageId && (
                  <p className="text-sm mt-1">Message ID: {testResult.messageId}</p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
          <h3 className="text-lg font-semibold mb-2 text-blue-900">Next Steps</h3>
          <div className="text-sm text-blue-800 space-y-1">
            <p>1. Check the configuration status above</p>
            <p>2. If Backend API is enabled, ensure the server is running</p>
            <p>3. If Direct Twilio is configured, test with the manual test</p>
            <p>4. Check browser console for detailed logs</p>
            <p>5. Verify your Twilio account and WhatsApp sandbox setup</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WhatsAppDiagnostics;
