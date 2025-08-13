import React, { useState, useEffect } from 'react';
import { Clock, AlertCircle, CheckCircle, Pause } from 'lucide-react';

interface TimerProps {
  endTime: number;
  onTimeUp?: () => void;
  isActive: boolean;
  className?: string;
}

const Timer: React.FC<TimerProps> = ({ 
  endTime, 
  onTimeUp, 
  isActive, 
  className = '' 
}) => {
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isWarning, setIsWarning] = useState(false);
  const [isCritical, setIsCritical] = useState(false);

  useEffect(() => {
    const updateTimer = () => {
      const now = Date.now();
      const remaining = Math.max(0, Math.floor((endTime - now) / 1000));
      
      setTimeRemaining(remaining);
      setIsWarning(remaining <= 300 && remaining > 60); // 5 minutes warning
      setIsCritical(remaining <= 60); // 1 minute critical

      if (remaining === 0 && onTimeUp) {
        onTimeUp();
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [endTime, onTimeUp]);

  const formatTime = (seconds: number): { hours: string; minutes: string; seconds: string } => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;

    return {
      hours: h.toString().padStart(2, '0'),
      minutes: m.toString().padStart(2, '0'),
      seconds: s.toString().padStart(2, '0')
    };
  };

  const getStatusColor = () => {
    if (!isActive) return 'text-gray-500';
    if (isCritical) return 'text-red-600';
    if (isWarning) return 'text-yellow-600';
    return 'text-green-600';
  };

  const getBackgroundColor = () => {
    if (!isActive) return 'bg-gray-100';
    if (isCritical) return 'bg-red-50 border-red-200';
    if (isWarning) return 'bg-yellow-50 border-yellow-200';
    return 'bg-green-50 border-green-200';
  };

  const getStatusIcon = () => {
    if (!isActive) return <Pause className="w-5 h-5" />;
    if (isCritical) return <AlertCircle className="w-5 h-5" />;
    if (isWarning) return <Clock className="w-5 h-5" />;
    return <CheckCircle className="w-5 h-5" />;
  };

  const getStatusText = () => {
    if (!isActive) return 'Auction Ended';
    if (isCritical) return 'Final Minute!';
    if (isWarning) return 'Ending Soon';
    return 'Active Auction';
  };

  const time = formatTime(timeRemaining);
  const progressPercentage = isActive ? Math.max(0, (timeRemaining / 300) * 100) : 0;

  return (
    <div className={`${className}`}>
      <div className={`rounded-xl border-2 p-6 transition-all duration-500 hover:shadow-lg transform hover:-translate-y-1 ${getBackgroundColor()} ${
        isCritical ? 'animate-pulse' : ''
      }`}>
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <div className={`${getStatusColor()} ${isCritical ? 'animate-bounce' : isWarning ? 'animate-pulse' : ''}`}>
              {getStatusIcon()}
            </div>
            <span className={`text-sm font-medium ${getStatusColor()} ${isCritical ? 'animate-pulse' : ''}`}>
              {getStatusText()}
            </span>
          </div>
          {isActive && (
            <div className="flex items-center space-x-1">
              <div className={`w-2 h-2 rounded-full ${
                isCritical ? 'bg-red-500 animate-ping' : isWarning ? 'bg-yellow-500 animate-pulse' : 'bg-green-500 animate-pulse'
              }`}></div>
              <span className="text-xs text-gray-500 font-medium">LIVE</span>
            </div>
          )}
        </div>

        {/* Time Display */}
        <div className="text-center mb-4">
          <div className="flex items-center justify-center space-x-2">
            <div className={`text-4xl font-bold font-mono ${getStatusColor()}`}>
              {time.hours !== '00' && (
                <>
                  <span>{time.hours}</span>
                  <span className="text-gray-400">:</span>
                </>
              )}
              <span>{time.minutes}</span>
              <span className="text-gray-400">:</span>
              <span className={isCritical ? 'animate-pulse' : ''}>{time.seconds}</span>
            </div>
          </div>
          <div className="text-xs text-gray-500 mt-2">
            {time.hours !== '00' ? 'Hours : Minutes : Seconds' : 'Minutes : Seconds'}
          </div>
        </div>

        {/* Progress Bar */}
        {isActive && (
          <div className="mb-4">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all duration-1000 ${
                  isCritical ? 'bg-red-500' : 
                  isWarning ? 'bg-yellow-500' : 'bg-green-500'
                }`}
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Started</span>
              <span>{Math.round(progressPercentage)}% Complete</span>
              <span>End</span>
            </div>
          </div>
        )}

        {/* Status Messages */}
        {isActive && (
          <div className="text-center">
            {isCritical && (
              <div className="text-red-600 text-sm font-medium animate-pulse">
                🚨 Auction ending in less than 1 minute!
              </div>
            )}
            {isWarning && !isCritical && (
              <div className="text-yellow-600 text-sm font-medium">
                ⚠️ Less than 5 minutes remaining
              </div>
            )}
            {!isWarning && !isCritical && (
              <div className="text-green-600 text-sm font-medium">
                ✅ Auction is active - Place your bids!
              </div>
            )}
          </div>
        )}

        {!isActive && (
          <div className="text-center">
            <div className="text-gray-600 text-sm font-medium">
              🏁 Bidding has closed
            </div>
            <div className="text-xs text-gray-500 mt-1">
              Check the results below
            </div>
          </div>
        )}

        {/* Auction End Time */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="text-center text-xs text-gray-500">
            Auction {isActive ? 'ends' : 'ended'} at{' '}
            {new Date(endTime).toLocaleString('en-IN', {
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
              timeZone: 'Asia/Kolkata'
            })}
          </div>
        </div>
      </div>

      {/* Mobile-friendly compact version */}
      <div className="md:hidden mt-4">
        <div className={`flex items-center justify-between p-3 rounded-lg ${getBackgroundColor()}`}>
          <div className="flex items-center space-x-2">
            <div className={getStatusColor()}>
              <Clock className="w-4 h-4" />
            </div>
            <span className={`text-sm font-medium ${getStatusColor()}`}>
              {time.minutes}:{time.seconds}
            </span>
          </div>
          <span className={`text-xs font-medium ${getStatusColor()}`}>
            {getStatusText()}
          </span>
        </div>
      </div>
    </div>
  );
};

export default Timer;
