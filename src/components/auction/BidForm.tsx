import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, DollarSign, AlertCircle, CheckCircle, Hash } from 'lucide-react';
import toast from 'react-hot-toast';

interface Bid {
  id: string;
  userId: string;
  userName: string;
  amount: number;
  type: 'buy' | 'sell';
  timestamp: number;
  stockSymbol: string;
}

interface BidFormProps {
  onPlaceBid: (amount: number, type: 'buy' | 'sell', quantity: number) => Promise<void>;
  highestBid: Bid | null;
  currentPrice: number;
  minIncrement: number;
  isActive: boolean;
  loading: boolean;
  userBids: Bid[];
  onCancelBid?: (bidId: string) => Promise<void>;
}

const BidForm: React.FC<BidFormProps> = ({
  onPlaceBid,
  highestBid,
  currentPrice,
  minIncrement,
  isActive,
  loading,
  userBids,
  onCancelBid
}) => {
  const [bidAmount, setBidAmount] = useState('');
  const [quantity, setQuantity] = useState('10');
  const [bidType, setBidType] = useState<'buy' | 'sell'>('buy');
  const [isValidBid, setIsValidBid] = useState(false);
  const [validationMessage, setValidationMessage] = useState('');

  const minBid = highestBid ? highestBid.amount + minIncrement : currentPrice + minIncrement;

  useEffect(() => {
    validateBid();
  }, [bidAmount, quantity, bidType, minBid]);

  const validateBid = () => {
    const amount = parseFloat(bidAmount);
    const qty = parseInt(quantity);

    if (!bidAmount || !quantity) {
      setIsValidBid(false);
      setValidationMessage('');
      return;
    }

    if (isNaN(amount) || amount <= 0) {
      setIsValidBid(false);
      setValidationMessage('Please enter a valid price');
      return;
    }

    if (isNaN(qty) || qty <= 0) {
      setIsValidBid(false);
      setValidationMessage('Please enter a valid quantity (minimum 1)');
      return;
    }

    if (qty > 10000) {
      setIsValidBid(false);
      setValidationMessage('Maximum quantity is 10,000 shares');
      return;
    }

    if (amount < minBid) {
      setIsValidBid(false);
      setValidationMessage(`Minimum bid is ₹${minBid.toFixed(2)}`);
      return;
    }

    if (amount > 1000000) {
      setIsValidBid(false);
      setValidationMessage('Maximum bid is ₹10,00,000');
      return;
    }

    const totalValue = amount * qty;
    if (totalValue > 50000000) {
      setIsValidBid(false);
      setValidationMessage('Total order value cannot exceed ₹5 crores');
      return;
    }

    setIsValidBid(true);
    setValidationMessage(`Valid ${bidType} bid of ₹${amount.toFixed(2)}`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isValidBid || !isActive) return;

    const amount = parseFloat(bidAmount);
    const qty = parseInt(quantity);

    try {
      await onPlaceBid(amount, bidType, qty);
      setBidAmount('');
      setQuantity('10'); // Reset to default
      toast.success(`${bidType.toUpperCase()} bid placed successfully! (${qty} shares)`);
    } catch (error) {
      console.error('Bid placement error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to place bid');
    }
  };

  const handleQuickBid = (multiplier: number) => {
    const quickAmount = minBid * multiplier;
    setBidAmount(quickAmount.toFixed(2));
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const activeBids = userBids.filter(bid => (bid as any).status === 'active' || !(bid as any).status);

  if (!isActive) {
    return (
      <div className="card-premium p-8">
        <h3 className="text-xl font-bold text-gray-900 mb-6 text-shadow">Place Bid</h3>
        <div className="text-center p-10 glass-effect rounded-premium-lg border border-white/20">
          <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-6 animate-pulse" />
          <p className="text-gray-700 font-semibold text-lg">Auction has ended</p>
          <p className="text-sm text-gray-500 mt-3">Bidding is no longer available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card-premium p-8 hover:shadow-premium-lg transition-all duration-500 transform hover:-translate-y-2 border-2 border-white/30 hover:border-blue-300/50 relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-400/10 to-purple-400/10 rounded-full blur-xl"></div>
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-pink-400/10 to-orange-400/10 rounded-full blur-xl"></div>

      <div className="relative z-10">
        <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-8 flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center animate-pulse-glow">
            <DollarSign className="w-5 h-5 text-white" />
          </div>
          <span>Place Your Bid</span>
        </h3>

      {/* Enhanced Market Info */}
      <div className="mb-8 p-6 glass-effect rounded-premium border border-white/20 bg-gradient-to-r from-blue-50/50 to-purple-50/50">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-gray-600 mb-1">Current Price</p>
            <p className="text-lg font-bold text-gray-900">{formatCurrency(currentPrice)}</p>
          </div>
          <div>
            <p className="text-xs text-gray-600 mb-1">Minimum Bid</p>
            <p className="text-lg font-bold text-blue-600">{formatCurrency(minBid)}</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Bid Type Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">Order Type</label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setBidType('buy')}
              className={`flex items-center justify-center py-3 px-4 rounded-lg font-medium transition-all duration-200 transform hover:scale-105 ${
                bidType === 'buy'
                  ? 'bg-green-600 text-white shadow-lg hover:bg-green-700 animate-pulse'
                  : 'bg-gray-100 text-gray-700 hover:bg-green-50 hover:text-green-700 hover:border-green-300 border border-transparent'
              }`}
            >
              <TrendingUp className={`w-5 h-5 mr-2 ${bidType === 'buy' ? 'animate-bounce' : ''}`} />
              BUY
            </button>
            <button
              type="button"
              onClick={() => setBidType('sell')}
              className={`flex items-center justify-center py-3 px-4 rounded-lg font-medium transition-all duration-200 transform hover:scale-105 ${
                bidType === 'sell'
                  ? 'bg-red-600 text-white shadow-lg hover:bg-red-700 animate-pulse'
                  : 'bg-gray-100 text-gray-700 hover:bg-red-50 hover:text-red-700 hover:border-red-300 border border-transparent'
              }`}
            >
              <TrendingDown className={`w-5 h-5 mr-2 ${bidType === 'sell' ? 'animate-bounce' : ''}`} />
              SELL
            </button>
          </div>
        </div>

        {/* Bid Amount Input */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-3 text-shadow">
            Bid Amount (₹)
          </label>
          <div className="relative group">
            <input
              type="number"
              value={bidAmount}
              onChange={(e) => setBidAmount(e.target.value)}
              className={`input-premium px-4 py-4 text-lg font-medium ${
                bidAmount && !isValidBid
                  ? 'border-red-300 focus:ring-red-500/20 hover:border-red-400'
                  : 'border-gray-200 focus:ring-blue-500/20 hover:border-blue-400'
              }`}
              placeholder={`Minimum ₹${minBid.toFixed(2)}`}
              min={minBid}
              max={1000000}
              step="0.01"
            />
          </div>
          
          {/* Validation Message */}
          {validationMessage && (
            <div className={`mt-2 flex items-center text-sm ${
              isValidBid ? 'text-green-600' : 'text-red-600'
            }`}>
              {isValidBid ? (
                <CheckCircle className="w-4 h-4 mr-1" />
              ) : (
                <AlertCircle className="w-4 h-4 mr-1" />
              )}
              {validationMessage}
            </div>
          )}
        </div>

        {/* Quantity Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Quantity (Shares)
          </label>
          <div className="relative group">
            <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 group-focus-within:text-blue-500 transition-colors duration-200" />
            <input
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:border-transparent transition-all duration-200 hover:shadow-md focus:shadow-lg transform focus:scale-[1.02] ${
                quantity && parseInt(quantity) <= 0
                  ? 'border-red-300 focus:ring-red-500 hover:border-red-400'
                  : 'border-gray-300 focus:ring-blue-500 hover:border-blue-400'
              }`}
              placeholder="Enter quantity"
              min="1"
              max="10000"
              step="1"
            />
          </div>

          {/* Total Value Display */}
          {bidAmount && quantity && !isNaN(parseFloat(bidAmount)) && !isNaN(parseInt(quantity)) && (
            <div className="mt-2 p-2 bg-blue-50 rounded-lg border border-blue-200">
              <div className="text-sm text-blue-800">
                <span className="font-medium">Total Value: </span>
                ₹{(parseFloat(bidAmount) * parseInt(quantity)).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
            </div>
          )}
        </div>

        {/* Quick Quantity Buttons */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">Quick Quantity</label>
          <div className="grid grid-cols-4 gap-2">
            <button
              type="button"
              onClick={() => setQuantity('1')}
              className="py-2 px-3 text-sm bg-gray-100 hover:bg-blue-100 hover:text-blue-700 rounded-lg transition-all duration-200 transform hover:scale-105 hover:shadow-md border border-transparent hover:border-blue-300"
            >
              1
            </button>
            <button
              type="button"
              onClick={() => setQuantity('10')}
              className="py-2 px-3 text-sm bg-gray-100 hover:bg-green-100 hover:text-green-700 rounded-lg transition-all duration-200 transform hover:scale-105 hover:shadow-md border border-transparent hover:border-green-300"
            >
              10
            </button>
            <button
              type="button"
              onClick={() => setQuantity('50')}
              className="py-2 px-3 text-sm bg-gray-100 hover:bg-purple-100 hover:text-purple-700 rounded-lg transition-all duration-200 transform hover:scale-105 hover:shadow-md border border-transparent hover:border-purple-300"
            >
              50
            </button>
            <button
              type="button"
              onClick={() => setQuantity('100')}
              className="py-2 px-3 text-sm bg-gray-100 hover:bg-orange-100 hover:text-orange-700 rounded-lg transition-all duration-200 transform hover:scale-105 hover:shadow-md border border-transparent hover:border-orange-300"
            >
              100
            </button>
          </div>
        </div>

        {/* Quick Bid Buttons */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">Quick Bid</label>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handleQuickBid(1)}
              className="py-2 px-3 text-sm bg-gray-100 hover:bg-blue-100 hover:text-blue-700 rounded-lg transition-all duration-200 transform hover:scale-105 hover:shadow-md border border-transparent hover:border-blue-300"
            >
              Min Bid
            </button>
            <button
              type="button"
              onClick={() => handleQuickBid(1.05)}
              className="py-2 px-3 text-sm bg-gray-100 hover:bg-green-100 hover:text-green-700 rounded-lg transition-all duration-200 transform hover:scale-105 hover:shadow-md border border-transparent hover:border-green-300"
            >
              +5%
            </button>
            <button
              type="button"
              onClick={() => handleQuickBid(1.1)}
              className="py-2 px-3 text-sm bg-gray-100 hover:bg-purple-100 hover:text-purple-700 rounded-lg transition-all duration-200 transform hover:scale-105 hover:shadow-md border border-transparent hover:border-purple-300"
            >
              +10%
            </button>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={!isValidBid || loading}
          className={`w-full py-3 px-4 rounded-lg font-medium transition-all duration-200 transform hover:scale-105 hover:shadow-lg btn-interactive relative overflow-hidden ${
            bidType === 'buy'
              ? 'bg-green-600 hover:bg-green-700 text-white hover:shadow-green-500/25'
              : 'bg-red-600 hover:bg-red-700 text-white hover:shadow-red-500/25'
          } disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none`}
        >
          {loading ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              Placing Bid...
            </div>
          ) : (
            `Place ${bidType.toUpperCase()} Bid`
          )}
        </button>
      </form>

      {/* Active Bids */}
      {activeBids.length > 0 && onCancelBid && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Your Active Bids</h4>
          <div className="space-y-2">
            {activeBids.slice(0, 3).map((bid) => (
              <div key={bid.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className={`w-2 h-2 rounded-full ${
                    bid.type === 'buy' ? 'bg-green-500' : 'bg-red-500'
                  }`}></div>
                  <span className="text-sm font-medium">{formatCurrency(bid.amount)}</span>
                  <span className="text-xs text-gray-500">{bid.type.toUpperCase()}</span>
                </div>
                <button
                  onClick={() => onCancelBid(bid.id)}
                  className="text-xs text-red-600 hover:text-red-800 font-medium"
                >
                  Cancel
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
      </div>
    </div>
  );
};

export default BidForm;
