import React from 'react';
import { X, Share, MessageCircle } from 'lucide-react';

interface Invoice {
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

interface InvoiceModalProps {
  invoice: Invoice;
  isOpen: boolean;
  onClose: () => void;
}

const InvoiceModal: React.FC<InvoiceModalProps> = ({ invoice, isOpen, onClose }) => {
  if (!isOpen) return null;

  const profitLossEmoji = invoice.profitLoss >= 0 ? '📈' : '📉';
  const profitLossText = invoice.profitLoss >= 0 ? 'PROFIT' : 'LOSS';
  const statusEmoji = invoice.profitLoss >= 0 ? '🟢' : '🔴';
  const bidTypeEmoji = invoice.bidType === 'buy' ? '🟢' : '🔴';
  const totalValue = invoice.price * invoice.quantity;

  const encouragement = invoice.profitLoss >= 0
    ? invoice.profitLoss > 50 
      ? '🎉 Outstanding trade! You\'re on fire! 🔥'
      : '✨ Great trade! Keep building that portfolio!'
    : invoice.profitLoss < -50
      ? '💪 Tough break, but champions bounce back stronger!'
      : '📊 Learning opportunity! Every trade teaches us something.';

  const copyToClipboard = () => {
    const invoiceText = `
🎯 STOCK AUCTION INVOICE 🎯
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

👤 Trader: ${invoice.user}
📊 Stock: ${invoice.stockSymbol} - ${invoice.item}
${invoice.bidType === 'buy' ? '🟢 BUY' : '🔴 SELL'} Order Type: ${invoice.bidType.toUpperCase()}
🔢 Quantity: ${invoice.quantity} shares
💰 Price per Share: ₹${invoice.price.toFixed(2)}
💵 Total Value: ₹${totalValue.toFixed(2)}
${invoice.bidId ? `🆔 Bid ID: ${invoice.bidId}` : ''}

${statusEmoji} ${profitLossText}: ${invoice.profitLoss >= 0 ? '+' : ''}₹${Math.abs(invoice.profitLoss).toFixed(2)} ${profitLossEmoji}

🕐 Timestamp: ${new Date(invoice.timestamp).toLocaleString()}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🚀 Stock Auction Platform

${encouragement}
    `.trim();

    navigator.clipboard.writeText(invoiceText);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <MessageCircle className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-bold text-gray-900">Trading Invoice</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Invoice Content */}
        <div className="p-6 space-y-6">
          {/* Header */}
          <div className="text-center">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">🎯 STOCK AUCTION INVOICE 🎯</h3>
            <div className="w-full h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
          </div>

          {/* Trader Info */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">👤 Trader:</span>
                <p className="font-semibold text-gray-900">{invoice.user}</p>
              </div>
              <div>
                <span className="text-gray-600">📊 Stock:</span>
                <p className="font-semibold text-gray-900">{invoice.stockSymbol} - {invoice.item}</p>
              </div>
            </div>
          </div>

          {/* Order Details */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Order Type:</span>
                <div className="flex items-center space-x-2">
                  <div className={`w-3 h-3 rounded-full ${bidTypeEmoji === '🟢' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  <span className="font-semibold">{invoice.bidType.toUpperCase()}</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-gray-600">🔢 Quantity:</span>
                <span className="font-semibold">{invoice.quantity} shares</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-gray-600">💰 Price per Share:</span>
                <span className="font-semibold">₹{invoice.price.toFixed(2)}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-gray-600">💵 Total Value:</span>
                <span className="font-semibold">₹{totalValue.toFixed(2)}</span>
              </div>

              {invoice.bidId && (
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">🆔 Bid ID:</span>
                  <span className="font-mono text-sm">{invoice.bidId}</span>
                </div>
              )}
            </div>
          </div>

          {/* Profit/Loss */}
          <div className={`rounded-lg p-4 ${
            invoice.profitLoss >= 0 ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
          }`}>
            <div className="text-center">
              <div className="text-2xl mb-2">{statusEmoji}</div>
              <h4 className={`text-lg font-bold ${
                invoice.profitLoss >= 0 ? 'text-green-800' : 'text-red-800'
              }`}>
                {profitLossText}: {invoice.profitLoss >= 0 ? '+' : ''}₹{Math.abs(invoice.profitLoss).toFixed(2)} {profitLossEmoji}
              </h4>
              <p className={`text-sm mt-2 ${
                invoice.profitLoss >= 0 ? 'text-green-700' : 'text-red-700'
              }`}>
                {encouragement}
              </p>
            </div>
          </div>

          {/* Timestamp */}
          <div className="text-center text-sm text-gray-600">
            🕐 {new Date(invoice.timestamp).toLocaleString('en-IN', {
              timeZone: 'Asia/Kolkata',
              dateStyle: 'medium',
              timeStyle: 'short'
            })}
          </div>

          {/* Actions */}
          <div className="flex space-x-3">
            <button
              onClick={copyToClipboard}
              className="flex-1 flex items-center justify-center space-x-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Share className="w-4 h-4" />
              <span>Copy Invoice</span>
            </button>
            
            <button
              onClick={onClose}
              className="flex-1 flex items-center justify-center space-x-2 px-4 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              <span>Close</span>
            </button>
          </div>

          {/* Footer */}
          <div className="text-center text-xs text-gray-500 pt-4 border-t border-gray-200">
            🚀 Stock Auction Platform<br/>
            <em>Risk Warning: Trading involves risk. This is a simulated platform for educational purposes only.</em>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoiceModal;
