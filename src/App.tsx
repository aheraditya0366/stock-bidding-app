import React, { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { Toaster } from 'react-hot-toast';
import { LogOut, Settings, DollarSign } from 'lucide-react';

// Import services
import { auth } from './services/firebase';

// Import context
import { AuctionProvider, useAuction } from './context/AuctionContext';

// Import components
import {
  AuthForm,
  AuctionCard,
  BidForm,
  OrderBook,
  BidHistory,
  Timer,
  UserDashboard,
  WhatsAppSettings
} from './components';
import WhatsAppDiagnostics from './components/WhatsAppDiagnostics';
import InvoiceModal from './components/InvoiceModal';
import AnimatedBackground from './components/ui/AnimatedBackground';

// Main App Content Component
const AppContent: React.FC = () => {
  // Check for diagnostics mode
  const urlParams = new URLSearchParams(window.location.search);
  const showDiagnostics = urlParams.get('diagnostics') === 'true';

  const {
    state,
    dispatch,
    login,
    signup,
    logout,
    resetPassword,
    placeBid,
    cancelBid,
    getTimeRemaining,
    isAuctionActive
  } = useAuction();

  const [showSettings, setShowSettings] = useState(false);

  // Show diagnostics if requested
  if (showDiagnostics) {
    return <WhatsAppDiagnostics />;
  }

  // Note: Auction initialization is now handled in AuctionContext
  // No need to manually start auction here - it's automatic

  // Set up authentication listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async () => {
      // Authentication state changes are handled by the context
    });

    return () => unsubscribe();
  }, []);

  // Show loading screen while initializing
  if (!state.authInitialized) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-800 flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p>Initializing...</p>
        </div>
      </div>
    );
  }

  // Show auth form if user is not authenticated
  if (!state.user) {
    return (
      <AuthForm
        onLogin={login}
        onSignup={signup}
        onResetPassword={resetPassword}
        loading={state.loading}
        error={state.error}
      />
    );
  }

  // Main auction interface
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 relative overflow-hidden">
      {/* Animated Background */}
      <AnimatedBackground />

      {/* Premium Background Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-blue-500/5 pointer-events-none"></div>
      {/* Premium Header */}
      <header className="glass-effect border-b border-white/20 sticky top-0 z-50 shadow-premium">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Enhanced Logo */}
            <div className="flex items-center space-x-4 group">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 via-purple-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-premium transform group-hover:scale-110 transition-all duration-300 group-hover:rotate-12">
                <DollarSign className="w-7 h-7 text-white animate-pulse" />
              </div>
              <div>
                <h1 className="text-2xl font-bold gradient-text text-shadow cursor-default">Stock Auction</h1>
                <p className="text-sm text-gray-600 font-medium">Professional Trading Platform</p>
              </div>
            </div>

            {/* Enhanced User info and actions */}
            <div className="flex items-center space-x-6">
              <div className="glass-effect px-4 py-2 rounded-premium border border-white/20">
                <span className="text-sm text-gray-600">Welcome, </span>
                <span className="font-semibold text-gray-900 hover:text-blue-600 transition-colors duration-200">{state.user.displayName}</span>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setShowSettings(!showSettings)}
                  className="btn-premium p-3 text-gray-600 hover:text-blue-600 bg-white/50 hover:bg-white/80 border border-white/20 rounded-xl transition-all duration-200 transform hover:scale-110"
                  title="Settings"
                >
                  <Settings className={`w-5 h-5 ${showSettings ? 'animate-spin' : ''}`} />
                </button>
                <button
                  onClick={logout}
                  className="btn-premium p-3 text-gray-600 hover:text-red-600 bg-white/50 hover:bg-red-50 border border-white/20 rounded-xl transition-all duration-200 transform hover:scale-110"
                  title="Logout"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Premium Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
        {showSettings ? (
          <div className="max-w-2xl mx-auto animate-fade-in">
            <div className="mb-6">
              <button
                onClick={() => setShowSettings(false)}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center space-x-1 hover:space-x-2 transition-all duration-200 transform hover:scale-105"
              >
                <span>←</span>
                <span>Back to Auction</span>
              </button>
            </div>
            <div className="transform transition-all duration-300 hover:scale-[1.01]">
              <WhatsAppSettings />
            </div>
          </div>
        ) : (
          <div className="space-y-8 animate-fade-in">
            {/* Timer Section */}
            {state.auction && (
              <div className="max-w-2xl mx-auto transform transition-all duration-300 hover:scale-[1.02]">
                <Timer
                  endTime={state.auction.endTime}
                  isActive={isAuctionActive()}
                  onTimeUp={() => {
                    // Handle auction end
                  }}
                />
              </div>
            )}

            {/* Horizontal Dashboard */}
            <div className="mb-8 animate-fade-in">
              <UserDashboard />
            </div>

            {/* Main Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-stagger-in">
              {/* Left Column - Bid Form */}
              <div className="space-y-6">
                <BidForm
                  onPlaceBid={placeBid}
                  highestBid={state.highestBid}
                  currentPrice={state.stock.currentPrice}
                  minIncrement={1.0}
                  isActive={isAuctionActive()}
                  loading={state.loading}
                  userBids={state.userBids}
                  onCancelBid={cancelBid}
                />
              </div>

              {/* Middle Column */}
              <div className="space-y-6">
                <AuctionCard
                  stock={state.stock}
                  highestBid={state.highestBid}
                  totalBids={state.bids.length}
                  timeRemaining={getTimeRemaining()}
                  isActive={isAuctionActive()}
                  participants={state.auction?.participants.length || 0}
                />
                <OrderBook
                  bids={state.bids}
                  currentUserId={state.user.uid}
                />
              </div>

              {/* Right Column */}
              <div className="space-y-6">
                <BidHistory
                  bids={state.bids}
                  currentUserId={state.user.uid}
                />
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Error Display */}
      {state.error && (
        <div className="fixed bottom-4 right-4 max-w-sm bg-red-50 border border-red-200 rounded-lg p-4 shadow-lg">
          <div className="flex items-center justify-between">
            <div className="text-red-600 text-sm">
              <strong>Error:</strong> {state.error}
            </div>
            <button
              onClick={() => {/* Clear error */}}
              className="text-red-400 hover:text-red-600 ml-2"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Invoice Modal */}
      {state.invoiceModal.isOpen && state.invoiceModal.invoice && (
        <InvoiceModal
          invoice={state.invoiceModal.invoice}
          isOpen={state.invoiceModal.isOpen}
          onClose={() => {
            dispatch({
              type: 'SET_INVOICE_MODAL',
              payload: { isOpen: false }
            });
          }}
        />
      )}

    </div>
  );
};

// Main App Component with Provider
const App: React.FC = () => {
  return (
    <AuctionProvider>
      <AppContent />
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            duration: 3000,
            iconTheme: {
              primary: '#4ade80',
              secondary: '#fff',
            },
          },
          error: {
            duration: 5000,
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />
    </AuctionProvider>
  );
};

export default App;
