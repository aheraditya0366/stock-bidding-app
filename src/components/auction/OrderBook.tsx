import React from 'react';
import { TrendingUp, TrendingDown, Crown, Clock } from 'lucide-react';

interface Bid {
  id: string;
  userId: string;
  userName: string;
  amount: number;
  type: 'buy' | 'sell';
  timestamp: number;
  stockSymbol: string;
  status?: 'active' | 'cancelled' | 'executed';
}

interface OrderBookProps {
  bids: Bid[];
  currentUserId?: string;
}

const OrderBook: React.FC<OrderBookProps> = ({ bids, currentUserId }) => {
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const formatTime = (timestamp: number): string => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const getTimeAgo = (timestamp: number): string => {
    const now = Date.now();
    const diff = now - timestamp;
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return `${seconds}s ago`;
  };

  // Filter and sort bids
  const activeBids = bids.filter(bid => !bid.status || bid.status === 'active');
  const buyBids = activeBids
    .filter(bid => bid.type === 'buy')
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 5);
  
  const sellBids = activeBids
    .filter(bid => bid.type === 'sell')
    .sort((a, b) => a.amount - b.amount)
    .slice(0, 5);

  const topBids = activeBids
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 5);

  const BidRow: React.FC<{ bid: Bid; index: number; showType?: boolean }> = ({ 
    bid, 
    index, 
    showType = true 
  }) => {
    const isCurrentUser = bid.userId === currentUserId;
    const isTopBid = index === 0;

    return (
      <div className={`flex items-center justify-between p-3 rounded-lg transition-all duration-200 transform hover:scale-[1.02] hover:shadow-md ${
        isCurrentUser
          ? 'bg-blue-50 border border-blue-200 hover:bg-blue-100'
          : 'bg-gray-50 hover:bg-gray-100'
      } ${isTopBid ? 'ring-2 ring-yellow-300 bg-gradient-to-r from-yellow-50 to-orange-50' : ''}`}>
        <div className="flex items-center space-x-3">
          {isTopBid && (
            <Crown className="w-4 h-4 text-yellow-500 animate-bounce" />
          )}
          <div className={`w-2 h-2 rounded-full animate-pulse ${
            bid.type === 'buy' ? 'bg-green-500' : 'bg-red-500'
          }`}></div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-medium text-gray-900">
                {formatCurrency(bid.amount)}
              </span>
              {showType && (
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                  bid.type === 'buy' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {bid.type.toUpperCase()}
                </span>
              )}
              {isCurrentUser && (
                <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-800 font-medium">
                  YOU
                </span>
              )}
            </div>
            <div className="flex items-center space-x-2 text-xs text-gray-500">
              <span>{bid.userName}</span>
              <span>•</span>
              <span>{getTimeAgo(bid.timestamp)}</span>
            </div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-xs text-gray-500">
            {formatTime(bid.timestamp)}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Order Book</h3>
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <Clock className="w-4 h-4" />
          <span>Live Updates</span>
        </div>
      </div>

      {activeBids.length === 0 ? (
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <TrendingUp className="w-8 h-8 text-gray-400" />
          </div>
          <p className="text-gray-600 font-medium">No active bids yet</p>
          <p className="text-sm text-gray-500 mt-1">Be the first to place a bid!</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Top Bids Section */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-medium text-gray-700">Top Bids</h4>
              <span className="text-xs text-gray-500">{topBids.length} active</span>
            </div>
            <div className="space-y-2">
              {topBids.map((bid, index) => (
                <BidRow key={bid.id} bid={bid} index={index} />
              ))}
            </div>
          </div>

          {/* Buy/Sell Split View */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Buy Orders */}
            <div>
              <div className="flex items-center space-x-2 mb-3">
                <TrendingUp className="w-4 h-4 text-green-600" />
                <h4 className="text-sm font-medium text-gray-700">Buy Orders</h4>
                <span className="text-xs text-gray-500">({buyBids.length})</span>
              </div>
              <div className="space-y-2">
                {buyBids.length > 0 ? (
                  buyBids.map((bid, index) => (
                    <BidRow key={bid.id} bid={bid} index={index} showType={false} />
                  ))
                ) : (
                  <div className="text-center py-4 text-gray-500 text-sm">
                    No buy orders
                  </div>
                )}
              </div>
            </div>

            {/* Sell Orders */}
            <div>
              <div className="flex items-center space-x-2 mb-3">
                <TrendingDown className="w-4 h-4 text-red-600" />
                <h4 className="text-sm font-medium text-gray-700">Sell Orders</h4>
                <span className="text-xs text-gray-500">({sellBids.length})</span>
              </div>
              <div className="space-y-2">
                {sellBids.length > 0 ? (
                  sellBids.map((bid, index) => (
                    <BidRow key={bid.id} bid={bid} index={index} showType={false} />
                  ))
                ) : (
                  <div className="text-center py-4 text-gray-500 text-sm">
                    No sell orders
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Market Summary */}
          <div className="pt-4 border-t border-gray-200">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-lg font-bold text-green-600">{buyBids.length}</p>
                <p className="text-xs text-gray-600">Buy Orders</p>
              </div>
              <div>
                <p className="text-lg font-bold text-gray-900">{activeBids.length}</p>
                <p className="text-xs text-gray-600">Total Active</p>
              </div>
              <div>
                <p className="text-lg font-bold text-red-600">{sellBids.length}</p>
                <p className="text-xs text-gray-600">Sell Orders</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderBook;
