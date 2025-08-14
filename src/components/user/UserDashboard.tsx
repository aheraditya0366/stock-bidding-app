import React from 'react';
import {
  User,
  TrendingUp,
  TrendingDown,
  Target,
  Award,
  Phone,
  Mail,
  Activity
} from 'lucide-react';
import { useAuction } from '../../context/AuctionContext';

const UserDashboard: React.FC = () => {
  const { state, formatCurrency } = useAuction();

  if (!state.user) {
    return null;
  }

  const userBids = state.bids.filter(bid => bid.userId === state.user?.uid);
  const activeBids = userBids.filter(bid => !bid.status || bid.status === 'active');
  const buyBids = userBids.filter(bid => bid.type === 'buy');
  const sellBids = userBids.filter(bid => bid.type === 'sell');
  const totalVolume = userBids.reduce((sum, bid) => sum + bid.amount, 0);
  const averageBidAmount = userBids.length > 0 ? totalVolume / userBids.length : 0;

  const stats = [
    {
      label: 'Total Bids',
      value: userBids.length,
      icon: Target,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      label: 'Active Bids',
      value: activeBids.length,
      icon: Activity,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      label: 'Buy Orders',
      value: buyBids.length,
      icon: TrendingUp,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      label: 'Sell Orders',
      value: sellBids.length,
      icon: TrendingDown,
      color: 'text-red-600',
      bgColor: 'bg-red-100'
    }
  ];

  return (
    <div className="card-premium p-6 hover:shadow-premium-lg transition-all duration-500 border-2 border-white/30 hover:border-green-300/50">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-900 hover:text-blue-600 transition-colors duration-200 text-shadow">Dashboard</h3>
        <div className="flex items-center space-x-2 glass-effect px-3 py-2 rounded-premium border border-green-200/50">
          <div className="w-3 h-3 bg-green-500 rounded-full animate-ping"></div>
          <span className="text-xs text-green-600 font-medium">Live</span>
        </div>
      </div>

      {/* Horizontal Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

        {/* User Info Section */}
        <div className="lg:col-span-1">
          <div className="p-4 glass-effect rounded-premium border border-white/20">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mb-3 shadow-lg">
                <User className="w-8 h-8 text-white" />
              </div>
              <h4 className="font-bold text-gray-900 text-lg mb-1">{state.user.displayName}</h4>
              <div className="text-xs text-gray-600 space-y-1">
                <div className="flex items-center justify-center space-x-1">
                  <Mail className="w-3 h-3" />
                  <span className="truncate max-w-32">{state.user.email}</span>
                </div>
                {state.user.phoneNumber && (
                  <div className="flex items-center justify-center space-x-1">
                    <Phone className="w-3 h-3" />
                    <span>{state.user.phoneNumber}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Profit/Loss Section */}
        <div className="lg:col-span-1">
          <div className={`p-4 rounded-premium border-2 transition-all duration-300 hover:shadow-lg ${
            state.userProfitLoss >= 0
              ? 'bg-green-50 border-green-200 hover:bg-green-100'
              : 'bg-red-50 border-red-200 hover:bg-red-100'
          } ${state.userProfitLoss >= 0 ? 'animate-glow' : ''}`}>
            <div className="text-center">
              <div className={`inline-flex p-3 rounded-full mb-3 ${
                state.userProfitLoss >= 0 ? 'bg-green-100' : 'bg-red-100'
              }`}>
                {state.userProfitLoss >= 0 ? (
                  <TrendingUp className="w-6 h-6 text-green-600 animate-bounce" />
                ) : (
                  <TrendingDown className="w-6 h-6 text-red-600 animate-pulse" />
                )}
              </div>
              <p className="text-xs text-gray-600 mb-1 font-medium">Total P&L</p>
              <p className={`text-xl font-bold ${
                state.userProfitLoss >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {state.userProfitLoss >= 0 ? '+' : ''}{formatCurrency(state.userProfitLoss)}
              </p>
            </div>
          </div>
        </div>

        {/* Trading Stats Section */}
        <div className="lg:col-span-2">
          <div className="grid grid-cols-2 gap-3">
            {stats.map((stat, index) => (
              <div key={index} className="p-4 glass-effect rounded-premium border border-white/20 hover:shadow-md transition-all duration-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-600 mb-1 font-medium">{stat.label}</p>
                    <p className="text-lg font-bold text-gray-900">{stat.value}</p>
                  </div>
                  <div className={`p-2 rounded-full ${stat.bgColor} shadow-sm`}>
                    <stat.icon className={`w-4 h-4 ${stat.color}`} />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Quick Financial Summary */}
          <div className="mt-4 p-3 glass-effect rounded-premium border border-white/20">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-xs text-gray-600 mb-1">Total Volume</p>
                <p className="text-sm font-bold text-gray-900">{formatCurrency(totalVolume)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-600 mb-1">Avg Bid</p>
                <p className="text-sm font-bold text-gray-900">{formatCurrency(averageBidAmount)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-600 mb-1">Success Rate</p>
                <p className="text-sm font-bold text-gray-900">
                  {userBids.length > 0 ? Math.round((activeBids.length / userBids.length) * 100) : 0}%
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Performance Summary - Bottom Row */}
      <div className="mt-6 pt-4 border-t border-gray-200/50">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

          {/* Performance Indicator */}
          <div className="flex items-center justify-center space-x-3 p-3 glass-effect rounded-premium border border-white/20">
            {state.userProfitLoss >= 0 ? (
              <>
                <Award className="w-5 h-5 text-yellow-500" />
                <span className="text-sm font-semibold text-green-600">Profitable Trader</span>
              </>
            ) : (
              <>
                <TrendingDown className="w-5 h-5 text-red-500" />
                <span className="text-sm font-semibold text-red-600">Learning Phase</span>
              </>
            )}
          </div>

          {/* Buy/Sell Ratio */}
          <div className="text-center p-3 glass-effect rounded-premium border border-white/20">
            <p className="text-xs text-gray-600 mb-1">Buy/Sell Ratio</p>
            <p className="text-lg font-bold text-gray-900">{buyBids.length}:{sellBids.length}</p>
          </div>

          {/* Market Activity */}
          <div className="text-center p-3 glass-effect rounded-premium border border-white/20">
            <p className="text-xs text-gray-600 mb-1">Market Activity</p>
            <p className="text-lg font-bold text-blue-600">{state.bids.length} bids</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
