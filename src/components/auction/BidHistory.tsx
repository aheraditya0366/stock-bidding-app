import React, { useState } from 'react';
import { History, Filter, User, Clock } from 'lucide-react';

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
  profitLoss?: number;
}

interface BidHistoryProps {
  bids: Bid[];
  currentUserId?: string;
  showUserOnly?: boolean;
}

type FilterType = 'all' | 'buy' | 'sell' | 'user';

const BidHistory: React.FC<BidHistoryProps> = ({ 
  bids, 
  currentUserId, 
  showUserOnly = false 
}) => {
  const [filter, setFilter] = useState<FilterType>('all');
  const [showDetails, setShowDetails] = useState<string | null>(null);

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const formatDateTime = (timestamp: number): string => {
    const date = new Date(timestamp);
    return date.toLocaleString('en-IN', {
      month: 'short',
      day: 'numeric',
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
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return `${seconds}s ago`;
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'executed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'active': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status?: string) => {
    switch (status) {
      case 'executed': return 'Executed';
      case 'cancelled': return 'Cancelled';
      case 'active': return 'Active';
      default: return 'Pending';
    }
  };

  // Filter bids based on selected filter
  const filteredBids = bids
    .filter(bid => {
      if (showUserOnly && bid.userId !== currentUserId) return false;
      
      switch (filter) {
        case 'buy': return bid.type === 'buy';
        case 'sell': return bid.type === 'sell';
        case 'user': return bid.userId === currentUserId;
        default: return true;
      }
    })
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, 20); // Show latest 20 bids

  const userBids = bids.filter(bid => bid.userId === currentUserId);
  const totalUserBids = userBids.length;
  const totalUserVolume = userBids.reduce((sum, bid) => sum + (bid.quantity || 1), 0);
  const totalUserValue = userBids.reduce((sum, bid) => sum + (bid.amount * (bid.quantity || 1)), 0);
  const totalProfitLoss = userBids.reduce((sum, bid) => sum + (bid.profitLoss || 0), 0);

  return (
    <div className="card-premium p-6 hover:shadow-xl transition-all duration-300 border border-blue-200/50 hover:border-blue-300 transform hover:-translate-y-1 flex flex-col relative overflow-hidden" style={{ height: '500px' }}>
      {/* Decorative Background */}
      <div className="absolute top-0 right-0 w-36 h-36 bg-gradient-to-br from-blue-400/10 to-purple-400/10 rounded-full blur-xl animate-float"></div>
      <div className="absolute bottom-0 left-0 w-28 h-28 bg-gradient-to-tr from-indigo-400/10 to-pink-400/10 rounded-full blur-xl animate-float delay-1000"></div>

      <div className="relative z-10 flex flex-col h-full">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center animate-pulse-glow">
              <History className="w-5 h-5 text-white animate-pulse" />
            </div>
            <h3 className="text-xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
              {showUserOnly ? 'Your Trading History' : 'Trading History'}
            </h3>
          </div>
        <div className="flex items-center space-x-2">
          <Filter className="w-4 h-4 text-gray-500" />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as FilterType)}
            className="text-sm border border-gray-300 rounded-lg px-3 py-1 focus:ring-2 focus:ring-blue-500 focus:border-transparent hover:border-blue-400 transition-all duration-200 transform hover:scale-105"
          >
            <option value="all">All Bids</option>
            <option value="buy">Buy Orders</option>
            <option value="sell">Sell Orders</option>
            {currentUserId && <option value="user">My Bids</option>}
          </select>
        </div>
      </div>

      {/* User Statistics (if showing user bids) */}
      {(showUserOnly || filter === 'user') && currentUserId && (
        <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Your Trading Summary</h4>
          <div className="grid grid-cols-4 gap-3">
            <div className="text-center">
              <p className="text-lg font-bold text-gray-900">{totalUserBids}</p>
              <p className="text-xs text-gray-600">Total Bids</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-blue-600">{totalUserVolume.toLocaleString()}</p>
              <p className="text-xs text-gray-600">Shares</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-purple-600">{formatCurrency(totalUserValue)}</p>
              <p className="text-xs text-gray-600">Total Value</p>
            </div>
            <div className="text-center">
              <p className={`text-lg font-bold ${totalProfitLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {totalProfitLoss >= 0 ? '+' : ''}{formatCurrency(totalProfitLoss)}
              </p>
              <p className="text-xs text-gray-600">P&L</p>
            </div>
          </div>
        </div>
      )}

      {/* Scrollable Bid List */}
      <div className="flex-1 overflow-hidden">
        {filteredBids.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <History className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-600 font-medium">No bids found</p>
            <p className="text-sm text-gray-500 mt-1">
              {filter === 'user' ? 'You haven\'t placed any bids yet' : 'No bids match your filter'}
            </p>
          </div>
        ) : (
          <div className="overflow-y-auto pr-2 space-y-3" style={{ height: '300px' }}>
          {filteredBids.map((bid) => {
            const isCurrentUser = bid.userId === currentUserId;
            const isExpanded = showDetails === bid.id;

            return (
              <div
                key={bid.id}
                className={`border rounded-lg transition-all ${
                  isCurrentUser 
                    ? 'border-blue-200 bg-blue-50' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div
                  className="p-4 cursor-pointer"
                  onClick={() => setShowDetails(isExpanded ? null : bid.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full ${
                        bid.type === 'buy' ? 'bg-green-500' : 'bg-red-500'
                      }`}></div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-medium text-gray-900">
                            {formatCurrency(bid.amount)}
                          </span>
                          <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                            bid.type === 'buy' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {bid.type.toUpperCase()}
                          </span>
                          {bid.status && (
                            <span className={`text-xs px-2 py-1 rounded-full font-medium ${getStatusColor(bid.status)}`}>
                              {getStatusText(bid.status)}
                            </span>
                          )}
                          {isCurrentUser && (
                            <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-800 font-medium">
                              YOU
                            </span>
                          )}
                        </div>
                        <div className="flex items-center space-x-2 text-xs text-gray-500 mt-1">
                          <User className="w-3 h-3" />
                          <span>{bid.userName}</span>
                          <span>•</span>
                          <Clock className="w-3 h-3" />
                          <span>{getTimeAgo(bid.timestamp)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      {bid.profitLoss !== undefined && (
                        <div className={`text-sm font-medium ${
                          bid.profitLoss >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {bid.profitLoss >= 0 ? '+' : ''}{formatCurrency(bid.profitLoss)}
                        </div>
                      )}
                      <div className="text-xs text-gray-500">
                        {formatDateTime(bid.timestamp)}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="px-4 pb-4 border-t border-gray-200 bg-gray-50">
                    <div className="grid grid-cols-2 gap-4 mt-3 text-sm">
                      <div>
                        <span className="text-gray-600">Bid ID:</span>
                        <span className="ml-2 font-mono text-gray-900">{bid.id.slice(0, 8)}...</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Stock:</span>
                        <span className="ml-2 font-medium text-gray-900">{bid.stockSymbol}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Type:</span>
                        <span className={`ml-2 font-medium ${
                          bid.type === 'buy' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {bid.type === 'buy' ? '🟢 BUY ORDER' : '🔴 SELL ORDER'}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600">Status:</span>
                        <span className="ml-2 font-medium text-gray-900">{getStatusText(bid.status)}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
          </div>
        )}
      </div>

      {/* Load More Button */}
      {filteredBids.length === 20 && (
        <div className="text-center mt-6 pt-4 border-t border-gray-200">
          <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
            Load More History
          </button>
        </div>
      )}
      </div>
    </div>
  );
};

export default BidHistory;
