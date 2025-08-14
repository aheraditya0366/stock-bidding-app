import React from 'react';
import { Crown, Clock } from 'lucide-react';

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

interface TopBidsProps {
  bids: Bid[];
  currentUserId?: string;
}

const TopBids: React.FC<TopBidsProps> = ({ bids, currentUserId }) => {
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

  // Filter and sort bids to get top bids with better logic
  const activeBids = bids.filter(bid => bid.status !== 'cancelled');
  const topBids = activeBids
    .sort((a, b) => {
      // Primary sort: by amount (highest first)
      if (b.amount !== a.amount) return b.amount - a.amount;
      // Secondary sort: by timestamp (earliest first for same amount)
      return a.timestamp - b.timestamp;
    })
    .slice(0, 15); // Show top 15 bids

  // Calculate leaderboard statistics based on quantity (volume)
  const totalVolume = topBids.reduce((sum, bid) => sum + (bid.quantity || 1), 0);
  const totalValue = topBids.reduce((sum, bid) => sum + (bid.amount * (bid.quantity || 1)), 0);
  const averageBid = topBids.length > 0 ? totalValue / topBids.length : 0;
  const uniqueBidders = new Set(topBids.map(bid => bid.userId)).size;

  const LeaderboardRow: React.FC<{
    bid: Bid;
    index: number;
    totalVolume: number;
  }> = ({ bid, index, totalVolume }) => {
    const isCurrentUser = bid.userId === currentUserId;
    const isTopBid = index === 0;
    const isTopThree = index < 3;
    const bidQuantity = bid.quantity || 1;
    const volumePercentage = totalVolume > 0 ? (bidQuantity / totalVolume) * 100 : 0;

    const getRankIcon = (rank: number) => {
      switch (rank) {
        case 0: return '🥇';
        case 1: return '🥈';
        case 2: return '🥉';
        default: return `#${rank + 1}`;
      }
    };

    const getRankColor = (rank: number) => {
      switch (rank) {
        case 0: return 'text-yellow-600 bg-yellow-50 border-yellow-200';
        case 1: return 'text-gray-600 bg-gray-50 border-gray-200';
        case 2: return 'text-orange-600 bg-orange-50 border-orange-200';
        default: return 'text-gray-600 bg-gray-50 border-gray-200';
      }
    };

    return (
      <div className={`relative flex items-center justify-between p-3 rounded-lg transition-all duration-200 transform hover:scale-[1.01] hover:shadow-md border ${
        isCurrentUser
          ? 'bg-blue-50 border-blue-300 ring-2 ring-blue-200'
          : isTopThree
            ? getRankColor(index)
            : 'bg-white border-gray-200 hover:bg-gray-50'
      }`}>

        {/* Volume percentage bar */}
        <div
          className={`absolute left-0 top-0 h-full rounded-lg opacity-10 ${
            isTopBid ? 'bg-yellow-400' : 'bg-blue-400'
          }`}
          style={{ width: `${Math.min(volumePercentage, 100)}%` }}
        />

        <div className="relative flex items-center space-x-3 flex-1">
          {/* Rank indicator */}
          <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold ${
            isTopThree ? 'text-white' : 'text-gray-600'
          } ${
            index === 0 ? 'bg-gradient-to-r from-yellow-400 to-yellow-500' :
            index === 1 ? 'bg-gradient-to-r from-gray-400 to-gray-500' :
            index === 2 ? 'bg-gradient-to-r from-orange-400 to-orange-500' :
            'bg-gray-200'
          }`}>
            {isTopThree ? getRankIcon(index).slice(0, 2) : index + 1}
          </div>

          <div className="flex-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className={`font-bold text-lg ${
                  isTopBid ? 'text-yellow-700' : 'text-gray-900'
                }`}>
                  {formatCurrency(bid.amount)}
                </span>
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                  bid.type === 'buy'
                    ? 'bg-green-100 text-green-700'
                    : 'bg-red-100 text-red-700'
                }`}>
                  {bid.type.toUpperCase()}
                </span>
              </div>
              {isCurrentUser && (
                <span className="text-xs px-2 py-1 rounded-full bg-blue-500 text-white font-bold animate-pulse">
                  YOU
                </span>
              )}
            </div>
            <div className="flex items-center justify-between text-xs text-gray-600 mt-1">
              <span className="font-medium truncate max-w-24">{bid.userName}</span>
              <div className="flex items-center space-x-2">
                <span className="bg-gray-100 px-2 py-1 rounded">{bidQuantity} shares</span>
                <span>{volumePercentage.toFixed(1)}% vol</span>
                <span>•</span>
                <span>{getTimeAgo(bid.timestamp)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="card-premium p-6 hover:shadow-xl transition-all duration-300 border border-yellow-200/50 hover:border-yellow-300 transform hover:-translate-y-1 relative overflow-hidden" style={{ height: '350px' }}>
      {/* Decorative Background */}
      <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-yellow-400/10 to-orange-400/10 rounded-full blur-xl animate-float"></div>
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-purple-400/10 to-pink-400/10 rounded-full blur-xl animate-float delay-1000"></div>

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center animate-pulse-glow">
              <Crown className="w-5 h-5 text-white animate-pulse" />
            </div>
            <h3 className="text-xl font-bold bg-gradient-to-r from-yellow-600 via-orange-600 to-red-600 bg-clip-text text-transparent">
              Leaderboard
            </h3>
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-500 bg-yellow-50 px-3 py-1 rounded-full border border-yellow-200">
            <Clock className="w-4 h-4 animate-pulse" />
            <span className="font-medium">Live Rankings</span>
          </div>
        </div>

      {/* Leaderboard Stats */}
      {topBids.length > 0 && (
        <div className="mb-4 p-3 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border border-yellow-200">
          <div className="grid grid-cols-3 gap-2 text-center">
            <div>
              <p className="text-xs text-gray-600">Total Volume</p>
              <p className="text-sm font-bold text-gray-900">{totalVolume.toLocaleString()} shares</p>
            </div>
            <div>
              <p className="text-xs text-gray-600">Avg Value</p>
              <p className="text-sm font-bold text-blue-600">{formatCurrency(averageBid)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-600">Bidders</p>
              <p className="text-sm font-bold text-purple-600">{uniqueBidders}</p>
            </div>
          </div>
        </div>
      )}

      {topBids.length === 0 ? (
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-gradient-to-r from-yellow-100 to-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Crown className="w-8 h-8 text-yellow-500" />
          </div>
          <p className="text-gray-600 font-medium">No bids yet</p>
          <p className="text-sm text-gray-500 mt-1">Be the first to claim the crown! 👑</p>
        </div>
      ) : (
        <div className="space-y-2 overflow-y-auto pr-1" style={{ height: '180px' }}>
          {topBids.map((bid, index) => (
            <LeaderboardRow
              key={bid.id}
              bid={bid}
              index={index}
              totalVolume={totalVolume}
            />
          ))}
        </div>
      )}

      {/* Competition Summary */}
      {topBids.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="grid grid-cols-4 gap-3 text-center">
            <div>
              <p className="text-sm font-bold text-yellow-600">
                {topBids[0] ? formatCurrency(topBids[0].amount) : '-'}
              </p>
              <p className="text-xs text-gray-600">Leader</p>
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900">{topBids.length}</p>
              <p className="text-xs text-gray-600">Ranked</p>
            </div>
            <div>
              <p className="text-sm font-bold text-green-600">
                {topBids.filter(b => b.type === 'buy').length}
              </p>
              <p className="text-xs text-gray-600">Buyers</p>
            </div>
            <div>
              <p className="text-sm font-bold text-red-600">
                {topBids.filter(b => b.type === 'sell').length}
              </p>
              <p className="text-xs text-gray-600">Sellers</p>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
};

export default TopBids;
