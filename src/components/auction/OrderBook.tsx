import React from 'react';
import { TrendingUp, TrendingDown, Clock } from 'lucide-react';

interface Bid {
  id: string;
  userId: string;
  userName: string;
  amount: number; // Price per share
  quantity?: number; // Number of shares/units
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

  // Filter and sort bids for proper order book
  const activeBids = bids.filter(bid => !bid.status || bid.status === 'active');

  // Buy orders: highest price first (buyers want to pay more)
  const buyBids = activeBids
    .filter(bid => bid.type === 'buy')
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 10);

  // Sell orders: lowest price first (sellers want to sell cheaper)
  const sellBids = activeBids
    .filter(bid => bid.type === 'sell')
    .sort((a, b) => a.amount - b.amount)
    .slice(0, 10);

  // Calculate market depth based on quantity (volume)
  const totalBuyVolume = buyBids.reduce((sum, bid) => sum + (bid.quantity || 1), 0);
  const totalSellVolume = sellBids.reduce((sum, bid) => sum + (bid.quantity || 1), 0);
  const spread = buyBids.length > 0 && sellBids.length > 0
    ? sellBids[0].amount - buyBids[0].amount
    : 0;

  const OrderRow: React.FC<{
    bid: Bid;
    index: number;
    type: 'buy' | 'sell';
    totalVolume: number;
  }> = ({ bid, index, type, totalVolume }) => {
    const isCurrentUser = bid.userId === currentUserId;
    const isBestPrice = index === 0;
    const bidQuantity = bid.quantity || 1;
    const volumePercentage = totalVolume > 0 ? (bidQuantity / totalVolume) * 100 : 0;

    return (
      <div className={`relative grid grid-cols-4 gap-2 p-2 rounded-md transition-all duration-200 hover:shadow-sm text-sm ${
        isCurrentUser
          ? 'bg-blue-50 border border-blue-200 ring-1 ring-blue-300'
          : type === 'buy'
            ? 'bg-white hover:bg-green-50 border border-green-100'
            : 'bg-white hover:bg-red-50 border border-red-100'
      } ${isBestPrice ? 'ring-2 ring-opacity-75 ' + (type === 'buy' ? 'ring-green-400 bg-green-50' : 'ring-red-400 bg-red-50') : ''}`}>

        {/* Volume bar background */}
        <div
          className={`absolute left-0 top-0 h-full rounded-md opacity-15 ${
            type === 'buy' ? 'bg-green-400' : 'bg-red-400'
          }`}
          style={{ width: `${Math.min(volumePercentage, 100)}%` }}
        />

        {/* Price Column */}
        <div className="relative flex items-center">
          {isBestPrice && (
            <div className={`w-1 h-6 rounded-full mr-2 ${
              type === 'buy' ? 'bg-green-500' : 'bg-red-500'
            }`} />
          )}
          <div className="flex flex-col">
            <span className={`font-bold text-sm ${
              type === 'buy' ? 'text-green-700' : 'text-red-700'
            }`}>
              {formatCurrency(bid.amount)}
            </span>
            {isCurrentUser && (
              <span className="text-xs px-1 py-0.5 rounded bg-blue-100 text-blue-700 font-medium">
                YOU
              </span>
            )}
          </div>
        </div>

        {/* Size Column */}
        <div className="text-center">
          <div className="font-semibold text-gray-900">{bidQuantity.toLocaleString()}</div>
          <div className="text-xs text-gray-500">shares</div>
        </div>

        {/* Total Column */}
        <div className="text-center">
          <div className="font-semibold text-gray-900">
            {formatCurrency(bid.amount * bidQuantity)}
          </div>
          <div className="text-xs text-gray-500">
            {volumePercentage.toFixed(1)}%
          </div>
        </div>

        {/* Time Column */}
        <div className="text-right">
          <div className="text-xs text-gray-600">{getTimeAgo(bid.timestamp)}</div>
          <div className="text-xs text-gray-500 truncate">
            {bid.userName.length > 8 ? bid.userName.substring(0, 8) + '...' : bid.userName}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="card-premium p-6 relative overflow-hidden" style={{ height: '400px' }}>
      {/* Decorative Background */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-400/10 to-red-400/10 rounded-full blur-xl"></div>

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-red-500 rounded-xl flex items-center justify-center animate-pulse-glow">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-xl font-bold bg-gradient-to-r from-green-600 to-red-600 bg-clip-text text-transparent">Order Book</h3>
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
            <Clock className="w-4 h-4 animate-pulse" />
            <span className="font-medium">Live Market</span>
          </div>
        </div>



      {activeBids.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-20 h-20 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
            <TrendingUp className="w-10 h-10 text-blue-500 animate-pulse" />
          </div>
          <h4 className="text-lg font-bold text-gray-700 mb-2">Order Book Empty</h4>
          <p className="text-gray-600 font-medium mb-1">No active orders in the market</p>
          <p className="text-sm text-gray-500">Place the first bid to start trading!</p>
          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200 max-w-sm mx-auto">
            <p className="text-xs text-blue-700 font-medium">
              💡 Tip: Use the bid form to place buy or sell orders
            </p>
          </div>
        </div>
      ) : (
        <div className="overflow-hidden">
          <div className="overflow-y-auto pr-2" style={{ height: '280px' }}>
          {/* Professional Order Book Layout */}
          <div className="space-y-4">
            {/* Order Book Headers */}
            <div className="grid grid-cols-4 gap-2 text-xs font-semibold text-gray-600 bg-gray-50 p-2 rounded-lg">
              <div className="text-left">Price</div>
              <div className="text-center">Size</div>
              <div className="text-center">Total</div>
              <div className="text-right">Time</div>
            </div>

            {/* Sell Orders (Ask) - Displayed in reverse order (lowest price first) */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <TrendingDown className="w-4 h-4 text-red-600" />
                  <h4 className="text-sm font-bold text-red-700">Sell Orders</h4>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-gray-500 bg-red-50 px-3 py-1 rounded-full border border-red-200">
                    {sellBids.length} orders
                  </span>
                  <span className="text-xs text-gray-500 bg-red-100 px-3 py-1 rounded-full">
                    {totalSellVolume.toLocaleString()} shares
                  </span>
                </div>
              </div>
              <div className="bg-red-50/30 rounded-lg border border-red-100 p-2">
                <div className="space-y-1 overflow-y-auto pr-1" style={{ height: '120px' }}>
                  {sellBids.length > 0 ? (
                    sellBids.slice().reverse().map((bid, index) => (
                      <OrderRow
                        key={bid.id}
                        bid={bid}
                        index={sellBids.length - 1 - index}
                        type="sell"
                        totalVolume={totalSellVolume}
                      />
                    ))
                  ) : (
                    <div className="text-center py-6 text-gray-500 text-sm">
                      <TrendingDown className="w-6 h-6 mx-auto mb-2 text-gray-400" />
                      No sell orders
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Market Spread Indicator */}
            {buyBids.length > 0 && sellBids.length > 0 && (
              <div className="text-center py-2 bg-gradient-to-r from-green-100 to-red-100 rounded-lg border-2 border-dashed border-gray-300">
                <span className="text-sm font-bold text-gray-700">
                  Spread: {formatCurrency(Math.abs(spread))}
                  <span className="text-xs text-gray-500 ml-2">
                    ({((Math.abs(spread) / buyBids[0].amount) * 100).toFixed(2)}%)
                  </span>
                </span>
              </div>
            )}

            {/* Buy Orders (Bid) */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <TrendingUp className="w-4 h-4 text-green-600" />
                  <h4 className="text-sm font-bold text-green-700">Buy Orders</h4>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-gray-500 bg-green-50 px-3 py-1 rounded-full border border-green-200">
                    {buyBids.length} orders
                  </span>
                  <span className="text-xs text-gray-500 bg-green-100 px-3 py-1 rounded-full">
                    {totalBuyVolume.toLocaleString()} shares
                  </span>
                </div>
              </div>
              <div className="bg-green-50/30 rounded-lg border border-green-100 p-2">
                <div className="space-y-1 overflow-y-auto pr-1" style={{ height: '120px' }}>
                  {buyBids.length > 0 ? (
                    buyBids.map((bid, index) => (
                      <OrderRow
                        key={bid.id}
                        bid={bid}
                        index={index}
                        type="buy"
                        totalVolume={totalBuyVolume}
                      />
                    ))
                  ) : (
                    <div className="text-center py-6 text-gray-500 text-sm">
                      <TrendingUp className="w-6 h-6 mx-auto mb-2 text-gray-400" />
                      No buy orders
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Market Depth Summary */}
          <div className="mt-6 pt-4 border-t-2 border-gray-200">
            <h5 className="text-sm font-bold text-gray-700 mb-3 text-center">Market Depth</h5>
            <div className="grid grid-cols-2 gap-4">
              {/* Buy Side Summary */}
              <div className="bg-green-50 p-4 rounded-xl border border-green-200">
                <div className="text-center">
                  <div className="flex items-center justify-center space-x-2 mb-2">
                    <TrendingUp className="w-4 h-4 text-green-600" />
                    <span className="text-sm font-bold text-green-700">Buy Side</span>
                  </div>
                  <div className="space-y-2">
                    <div>
                      <p className="text-lg font-bold text-green-600">{buyBids.length}</p>
                      <p className="text-xs text-green-700">Orders</p>
                    </div>
                    <div>
                      <p className="text-lg font-bold text-green-600">
                        {totalBuyVolume.toLocaleString()}
                      </p>
                      <p className="text-xs text-green-700">Shares</p>
                    </div>
                    {buyBids.length > 0 && (
                      <div>
                        <p className="text-sm font-bold text-green-600">
                          {formatCurrency(buyBids[0].amount)}
                        </p>
                        <p className="text-xs text-green-700">Best Bid</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Sell Side Summary */}
              <div className="bg-red-50 p-4 rounded-xl border border-red-200">
                <div className="text-center">
                  <div className="flex items-center justify-center space-x-2 mb-2">
                    <TrendingDown className="w-4 h-4 text-red-600" />
                    <span className="text-sm font-bold text-red-700">Sell Side</span>
                  </div>
                  <div className="space-y-2">
                    <div>
                      <p className="text-lg font-bold text-red-600">{sellBids.length}</p>
                      <p className="text-xs text-red-700">Orders</p>
                    </div>
                    <div>
                      <p className="text-lg font-bold text-red-600">
                        {totalSellVolume.toLocaleString()}
                      </p>
                      <p className="text-xs text-red-700">Shares</p>
                    </div>
                    {sellBids.length > 0 && (
                      <div>
                        <p className="text-sm font-bold text-red-600">
                          {formatCurrency(sellBids[0].amount)}
                        </p>
                        <p className="text-xs text-red-700">Best Ask</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Market Statistics */}
            {buyBids.length > 0 && sellBids.length > 0 && (
              <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-sm font-bold text-gray-900">
                      {formatCurrency(Math.abs(spread))}
                    </p>
                    <p className="text-xs text-gray-600">Spread</p>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900">
                      {((Math.abs(spread) / buyBids[0].amount) * 100).toFixed(2)}%
                    </p>
                    <p className="text-xs text-gray-600">Spread %</p>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900">
                      {(totalBuyVolume + totalSellVolume).toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-600">Total Volume</p>
                  </div>
                </div>
              </div>
            )}
          </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
};

export default OrderBook;
