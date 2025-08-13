import React from 'react';
import {
  User,
  TrendingUp,
  TrendingDown,
  Target,
  Award,
  Phone,
  Mail,
  Calendar,
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
    <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 border border-gray-200 hover:border-blue-300 transform hover:-translate-y-1">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 hover:text-blue-600 transition-colors duration-200">Dashboard</h3>
        <div className="flex items-center space-x-2 bg-green-50 px-2 py-1 rounded-full">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-ping"></div>
          <span className="text-xs text-green-600 font-medium">Live</span>
        </div>
      </div>

      {/* User Info */}
      <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
            <User className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <h4 className="font-semibold text-gray-900">{state.user.displayName}</h4>
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <div className="flex items-center space-x-1">
                <Mail className="w-4 h-4" />
                <span>{state.user.email}</span>
              </div>
              {state.user.phoneNumber && (
                <div className="flex items-center space-x-1">
                  <Phone className="w-4 h-4" />
                  <span>{state.user.phoneNumber}</span>
                </div>
              )}
            </div>
            <div className="flex items-center space-x-1 text-xs text-gray-500 mt-1">
              <Calendar className="w-3 h-3" />
              <span>Member since {new Date(state.user.createdAt || Date.now()).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Profit/Loss Display */}
      <div className="mb-6">
        <div className={`p-4 rounded-lg border-2 transition-all duration-300 hover:shadow-lg transform hover:scale-[1.02] ${
          state.userProfitLoss >= 0
            ? 'bg-green-50 border-green-200 hover:bg-green-100'
            : 'bg-red-50 border-red-200 hover:bg-red-100'
        } ${state.userProfitLoss >= 0 ? 'animate-glow' : ''}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1 font-medium">Total Profit/Loss</p>
              <p className={`text-2xl font-bold transition-all duration-200 hover:scale-110 cursor-default ${
                state.userProfitLoss >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {state.userProfitLoss >= 0 ? '+' : ''}{formatCurrency(state.userProfitLoss)}
              </p>
            </div>
            <div className={`p-3 rounded-full transition-all duration-200 transform hover:scale-110 hover:rotate-12 ${
              state.userProfitLoss >= 0 ? 'bg-green-100 hover:bg-green-200' : 'bg-red-100 hover:bg-red-200'
            }`}>
              {state.userProfitLoss >= 0 ? (
                <TrendingUp className="w-6 h-6 text-green-600 animate-bounce" />
              ) : (
                <TrendingDown className="w-6 h-6 text-red-600 animate-pulse" />
              )}
            </div>
          </div>
          <div className="mt-2 text-xs text-gray-500 font-medium">
            {state.userProfitLoss >= 0 ? '📈 Great trading! Keep it up!' : '📉 Keep going, every trader has ups and downs!'}
          </div>
        </div>
      </div>

      {/* Trading Stats */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        {stats.map((stat, index) => (
          <div key={index} className="p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600 mb-1">{stat.label}</p>
                <p className="text-lg font-bold text-gray-900">{stat.value}</p>
              </div>
              <div className={`p-2 rounded-full ${stat.bgColor}`}>
                <stat.icon className={`w-4 h-4 ${stat.color}`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Financial Summary */}
      <div className="space-y-3">
        <h4 className="text-sm font-medium text-gray-700">Financial Summary</h4>
        
        <div className="space-y-2">
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-600">Total Volume</span>
            <span className="font-medium text-gray-900">{formatCurrency(totalVolume)}</span>
          </div>
          
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-600">Average Bid</span>
            <span className="font-medium text-gray-900">{formatCurrency(averageBidAmount)}</span>
          </div>
          
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-600">Success Rate</span>
            <span className="font-medium text-gray-900">
              {userBids.length > 0 ? Math.round((activeBids.length / userBids.length) * 100) : 0}%
            </span>
          </div>
          
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-600">Buy/Sell Ratio</span>
            <span className="font-medium text-gray-900">
              {buyBids.length}:{sellBids.length}
            </span>
          </div>
        </div>
      </div>

      {/* Performance Indicator */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Trading Performance</span>
          <div className="flex items-center space-x-2">
            {state.userProfitLoss >= 0 ? (
              <>
                <Award className="w-4 h-4 text-yellow-500" />
                <span className="text-sm font-medium text-green-600">Profitable</span>
              </>
            ) : (
              <>
                <TrendingDown className="w-4 h-4 text-red-500" />
                <span className="text-sm font-medium text-red-600">Learning</span>
              </>
            )}
          </div>
        </div>
        
        {/* Performance Bar */}
        <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
          <div 
            className={`h-2 rounded-full transition-all duration-500 ${
              state.userProfitLoss >= 0 ? 'bg-green-500' : 'bg-red-500'
            }`}
            style={{ 
              width: `${Math.min(100, Math.max(10, Math.abs(state.userProfitLoss) / 100 * 100))}%` 
            }}
          ></div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Quick Stats</h4>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="text-center p-2 bg-blue-50 rounded">
            <div className="font-bold text-blue-600">{state.bids.length}</div>
            <div className="text-gray-600">Market Bids</div>
          </div>
          <div className="text-center p-2 bg-purple-50 rounded">
            <div className="font-bold text-purple-600">
              {state.auction?.participants.length || 0}
            </div>
            <div className="text-gray-600">Participants</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
