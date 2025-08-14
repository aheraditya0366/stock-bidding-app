import React from 'react';
import { TrendingUp, TrendingDown, DollarSign, Users, Clock, Target } from 'lucide-react';

interface Stock {
  symbol: string;
  name: string;
  currentPrice: number;
  change?: number;
  changePercent?: number;
}

interface Bid {
  id: string;
  userId: string;
  userName: string;
  amount: number;
  type: 'buy' | 'sell';
  timestamp: number;
  stockSymbol: string;
}

interface AuctionCardProps {
  stock: Stock;
  highestBid: Bid | null;
  totalBids: number;
  timeRemaining: number;
  isActive: boolean;
  participants: number;
}

const AuctionCard: React.FC<AuctionCardProps> = ({
  stock,
  highestBid,
  totalBids,
  timeRemaining,
  isActive,
  participants
}) => {
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const getChangeColor = (change?: number) => {
    if (!change) return 'text-gray-500';
    return change >= 0 ? 'text-green-600' : 'text-red-600';
  };

  const getChangeIcon = (change?: number) => {
    if (!change) return null;
    return change >= 0 ? 
      <TrendingUp className="w-4 h-4" /> : 
      <TrendingDown className="w-4 h-4" />;
  };

  const getStatusColor = () => {
    if (!isActive) return 'bg-gray-100 text-gray-600';
    if (timeRemaining <= 60) return 'bg-red-100 text-red-600';
    if (timeRemaining <= 300) return 'bg-yellow-100 text-yellow-600';
    return 'bg-green-100 text-green-600';
  };

  return (
    <div className="card-premium p-8 hover:shadow-premium-lg transition-all duration-500 transform hover:-translate-y-2 border-2 border-white/30 hover:border-blue-300/50 hover:scale-[1.02]">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg transform hover:scale-110 transition-all duration-200 hover:rotate-12">
            <DollarSign className="w-6 h-6 text-white animate-pulse" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900 hover:text-blue-600 transition-colors duration-200 cursor-default">{stock.symbol}</h3>
            <p className="text-sm text-gray-600 hover:text-gray-800 transition-colors duration-200">{stock.name}</p>
          </div>
        </div>
        <div className={`px-3 py-1 rounded-full text-xs font-medium transition-all duration-300 ${getStatusColor()}`}>
          {isActive ? (
            <span className="flex items-center space-x-1">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-ping"></span>
              <span>LIVE AUCTION</span>
            </span>
          ) : (
            'ENDED'
          )}
        </div>
      </div>

      {/* Current Price */}
      <div className="mb-6 bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg p-4 hover:from-blue-50 hover:to-purple-50 transition-all duration-300">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600 mb-1 font-medium">Current Price</p>
            <p className="text-3xl font-bold text-gray-900 hover:text-blue-600 transition-colors duration-200 cursor-default">
              {formatCurrency(stock.currentPrice)}
            </p>
          </div>
          {stock.change !== undefined && (
            <div className={`flex items-center space-x-1 ${getChangeColor(stock.change)} bg-white rounded-lg px-3 py-2 shadow-sm hover:shadow-md transition-all duration-200 transform hover:scale-105`}>
              <span className="animate-bounce">{getChangeIcon(stock.change)}</span>
              <span className="text-sm font-medium">
                {stock.change >= 0 ? '+' : ''}{formatCurrency(stock.change)}
              </span>
              {stock.changePercent !== undefined && (
                <span className="text-xs">
                  ({stock.changePercent >= 0 ? '+' : ''}{stock.changePercent.toFixed(2)}%)
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Highest Bid */}
      {highestBid && (
        <div className="mb-6 p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Highest Bid</p>
              <p className="text-2xl font-bold text-green-600">
                {formatCurrency(highestBid.amount)}
              </p>
              <p className="text-xs text-gray-500">
                by {highestBid.userName} • {highestBid.type.toUpperCase()}
              </p>
            </div>
            <div className="text-right">
              <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                highestBid.type === 'buy' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {highestBid.type === 'buy' ? '🟢 BUY' : '🔴 SELL'}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {new Date(highestBid.timestamp).toLocaleTimeString()}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Auction Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="text-center">
          <div className="flex items-center justify-center mb-2">
            <Target className="w-5 h-5 text-blue-500" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{totalBids}</p>
          <p className="text-xs text-gray-600">Total Bids</p>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center mb-2">
            <Users className="w-5 h-5 text-purple-500" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{participants}</p>
          <p className="text-xs text-gray-600">Participants</p>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center mb-2">
            <Clock className="w-5 h-5 text-orange-500" />
          </div>
          <p className={`text-2xl font-bold ${timeRemaining <= 60 ? 'text-red-600' : 'text-gray-900'}`}>
            {formatTime(timeRemaining)}
          </p>
          <p className="text-xs text-gray-600">Time Left</p>
        </div>
      </div>

      {/* Progress Bar */}
      {isActive && (
        <div className="mb-4">
          <div className="flex justify-between text-xs text-gray-600 mb-2">
            <span>Auction Progress</span>
            <span>{Math.max(0, Math.round((1 - timeRemaining / 300) * 100))}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all duration-1000 ${
                timeRemaining <= 60 ? 'bg-red-500' : 
                timeRemaining <= 300 ? 'bg-yellow-500' : 'bg-green-500'
              }`}
              style={{ width: `${Math.max(0, Math.min(100, (1 - timeRemaining / 300) * 100))}%` }}
            ></div>
          </div>
        </div>
      )}

      {/* Status Message */}
      {!isActive && (
        <div className="text-center p-4 bg-gray-50 rounded-lg">
          <p className="text-gray-600 font-medium">Auction Ended</p>
          {highestBid && (
            <p className="text-sm text-gray-500 mt-1">
              Winner: {highestBid.userName} with {formatCurrency(highestBid.amount)}
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default AuctionCard;
