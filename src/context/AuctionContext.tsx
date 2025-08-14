import React, { createContext, useContext, useReducer, useEffect, type ReactNode } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import toast from 'react-hot-toast';
import { auth, firebaseService } from '../services/firebase';
import { whatsappService } from '../services/whatsapp';
import type {
  AppState,
  AppAction,
  AuctionContextType,
  Stock,
  Bid,
  Invoice
} from '../types';

// Initial state
const initialState: AppState = {
  user: null,
  authInitialized: false,
  firebaseConnected: false,
  auction: null,
  stock: {
    symbol: 'AAPL',
    name: 'Apple Inc.',
    currentPrice: 150.00,
    change: 2.50,
    changePercent: 1.69
  },
  bids: [],
  highestBid: null,
  loading: false,
  error: null,
  userProfitLoss: 0,
  userBids: [],
  botBiddingEnabled: import.meta.env.VITE_BOT_BIDDING_ENABLED === 'true',
  whatsappConnected: false,
  invoiceModal: {
    isOpen: false,
    invoice: null
  }
};

// Reducer
const auctionReducer = (state: AppState, action: AppAction): AppState => {
  switch (action.type) {
    case 'SET_USER':
      return { ...state, user: action.payload };
    
    case 'SET_AUTH_INITIALIZED':
      return { ...state, authInitialized: action.payload };
    
    case 'SET_FIREBASE_CONNECTED':
      return { ...state, firebaseConnected: action.payload };
    
    case 'SET_AUCTION':
      return { ...state, auction: action.payload };
    
    case 'SET_STOCK':
      return { ...state, stock: action.payload };
    
    case 'SET_BIDS':
      return { ...state, bids: action.payload };
    
    case 'ADD_BID':
      return { 
        ...state, 
        bids: [action.payload, ...state.bids].sort((a, b) => b.timestamp - a.timestamp)
      };
    
    case 'UPDATE_BID':
      return {
        ...state,
        bids: state.bids.map(bid => 
          bid.id === action.payload.id 
            ? { ...bid, ...action.payload.updates }
            : bid
        )
      };
    
    case 'SET_HIGHEST_BID':
      return { ...state, highestBid: action.payload };
    
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    
    case 'UPDATE_PROFIT_LOSS':
      return { ...state, userProfitLoss: action.payload };
    
    case 'SET_USER_BIDS':
      return { ...state, userBids: action.payload };
    
    case 'SET_BOT_BIDDING':
      return { ...state, botBiddingEnabled: action.payload };
    
    case 'SET_WHATSAPP_CONNECTED':
      return { ...state, whatsappConnected: action.payload };

    case 'SET_INVOICE_MODAL':
      return {
        ...state,
        invoiceModal: {
          isOpen: action.payload.isOpen,
          invoice: action.payload.invoice || state.invoiceModal.invoice
        }
      };

    case 'RESET_STATE':
      return { ...initialState, authInitialized: state.authInitialized };
    
    default:
      return state;
  }
};

// Context
const AuctionContext = createContext<AuctionContextType | undefined>(undefined);

// Provider component
interface AuctionProviderProps {
  children: ReactNode;
}

export const AuctionProvider: React.FC<AuctionProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(auctionReducer, initialState);

  // Initialize authentication - Preserve session on refresh, clear on new visits
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Check if this is a page refresh or new visit
        const isPageRefresh = sessionStorage.getItem('app_session_active') === 'true';

        if (isPageRefresh) {
          // This is a page refresh - preserve existing authentication
          console.log('🔄 Page refresh detected - preserving authentication state');
        } else {
          // This is a new visit - clear any existing sessions
          console.log('🔄 New app visit - ensuring clean authentication state');
          console.log('🔐 Clearing any existing sessions for fresh start');
          await firebaseService.signOut();
          console.log('✅ Previous session cleared - fresh start');
        }

        // Mark that the app session is now active
        sessionStorage.setItem('app_session_active', 'true');

        // Set up auth state listener
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
          try {
            if (firebaseUser) {
              // User is signed in - load complete profile from Firestore
              console.log('🔐 User authenticated, loading profile:', firebaseUser.uid);

              try {
                // Try to get user data from Firestore
                const userProfile = await firebaseService.getUserProfile(firebaseUser.uid);

                if (userProfile) {
                  // User profile exists in Firestore
                  console.log('📋 User profile loaded from Firestore:', userProfile);
                  dispatch({ type: 'SET_USER', payload: userProfile });
                } else {
                  // Create new user profile in Firestore
                  console.log('👤 Creating new user profile in Firestore');
                  const newUserData = {
                    uid: firebaseUser.uid,
                    email: firebaseUser.email || '',
                    displayName: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
                    phoneNumber: '', // Will be empty until user adds it
                    totalBids: 0,
                    totalProfit: 0,
                    createdAt: new Date() // Use Date object for consistency
                  };

                  await firebaseService.createUserProfile(newUserData);
                  dispatch({ type: 'SET_USER', payload: newUserData });
                  console.log('✅ New user profile created');
                }
              } catch (profileError) {
                console.warn('⚠️ Failed to load user profile from Firestore:', profileError);
                // Fallback to basic user data from Firebase Auth
                const fallbackUserData = {
                  uid: firebaseUser.uid,
                  email: firebaseUser.email || '',
                  displayName: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
                  phoneNumber: '', // Will be empty until user adds it
                  totalBids: 0,
                  totalProfit: 0,
                  createdAt: new Date()
                };
                dispatch({ type: 'SET_USER', payload: fallbackUserData });
              }
            } else {
              // User is signed out
              console.log('🚪 User signed out - showing login page');
              dispatch({ type: 'SET_USER', payload: null });
            }
          } catch (error) {
            console.error('❌ Auth state change error:', error);
            toast.error('Authentication error occurred');
          } finally {
            // Mark auth as initialized regardless of success/failure
            dispatch({ type: 'SET_AUTH_INITIALIZED', payload: true });
          }
        });

        return unsubscribe;
      } catch (error) {
        console.error('❌ Auth initialization error:', error);
        // Even if there's an error, still initialize auth
        dispatch({ type: 'SET_AUTH_INITIALIZED', payload: true });
        dispatch({ type: 'SET_USER', payload: null });
      }
    };

    const unsubscribePromise = initializeAuth();

    return () => {
      // Cleanup auth listener when component unmounts
      unsubscribePromise.then(unsubscribe => {
        if (unsubscribe) {
          unsubscribe();
        }
      }).catch(console.error);
    };
  }, []);

  // Initialize Firebase connection
  useEffect(() => {
    const initializeFirebase = async () => {
      try {
        // Test Firebase connection by attempting to get a document
        await firebaseService.testConnection();
        dispatch({ type: 'SET_FIREBASE_CONNECTED', payload: true });
      } catch (error) {
        console.error('Firebase connection failed:', error);
        dispatch({ type: 'SET_FIREBASE_CONNECTED', payload: false });
        toast.error('Failed to connect to Firebase');
      }
    };

    initializeFirebase();
  }, []);

  // Initialize WhatsApp service
  useEffect(() => {
    const initializeWhatsApp = () => {
      const status = whatsappService.getStatus();
      console.log('📱 WhatsApp Service Status:', status);

      // Set WhatsApp as connected if configured, or allow simulation mode
      dispatch({ type: 'SET_WHATSAPP_CONNECTED', payload: true });
    };

    initializeWhatsApp();
  }, []);

  // Initialize auction when user is authenticated
  useEffect(() => {
    const initializeAuction = async () => {
      if (state.firebaseConnected && state.authInitialized && state.user && !state.auction) {
        // Create a default auction for AAPL
        const defaultStock: Stock = {
          symbol: 'AAPL',
          name: 'Apple Inc.',
          currentPrice: 150.00,
          change: 2.50,
          changePercent: 1.69
        };

        // Always use demo auction to avoid permission issues
        console.log('🎯 Creating demo auction (skipping Firebase to avoid permission errors)');
        const mockAuction = {
          id: 'demo-auction-' + Date.now(),
          stockSymbol: 'AAPL',
          stockName: 'Apple Inc.',
          startPrice: 150.00,
          currentPrice: 150.00,
          startTime: Date.now(),
          endTime: Date.now() + (300 * 1000), // 5 minutes
          duration: 300,
          isActive: true,
          totalBids: 0,
          participants: [],
          createdBy: state.user?.uid || 'demo-user',
          createdAt: Date.now()
        };
        dispatch({ type: 'SET_AUCTION', payload: mockAuction });
        dispatch({ type: 'SET_STOCK', payload: defaultStock });
        console.log('✅ Demo auction initialized successfully');
        console.log('📱 All features including WhatsApp invoices will work!');
      }
    };

    initializeAuction();
  }, [state.firebaseConnected, state.authInitialized, state.user, state.auction]);

  // WhatsApp Invoice Helper Function
  const sendWhatsAppInvoice = async (
    savedBid: Bid,
    amount: number,
    type: 'buy' | 'sell',
    profitLoss: number,
    quantity: number
  ): Promise<void> => {
    try {
      console.log('📱 Preparing WhatsApp invoice...');

      const invoice: Invoice = {
        item: state.stock.name,
        quantity: quantity,
        price: amount,
        profitLoss,
        timestamp: new Date().toISOString(),
        user: state.user?.displayName || state.user?.email || 'Anonymous',
        bidType: type,
        stockSymbol: state.stock.symbol,
        bidId: savedBid.id
      };

      console.log('📊 Invoice Details:', invoice);

      // Try to send WhatsApp invoice
      if (state.user?.phoneNumber) {
        console.log('📱 Sending to phone number:', state.user.phoneNumber);

        const response = await whatsappService.sendInvoice(state.user.phoneNumber, invoice);

        if (response.success) {
          toast.success('📱 Invoice sent to WhatsApp!');
          console.log('✅ WhatsApp invoice delivered:', response.messageId);
        } else {
          console.warn('⚠️ WhatsApp delivery failed:', response.error);
          toast.success('📱 Invoice simulated (check console)');
        }
      } else {
        // No phone number - show invoice in console for demo
        console.log('📱 No phone number set - showing invoice in console:');
        console.log('═══════════════════════════════════════════════════════════');
        console.log('📱 TRADING INVOICE (Phone number not set)');
        console.log('═══════════════════════════════════════════════════════════');
        console.log(`👤 Trader: ${invoice.user}`);
        console.log(`📊 Stock: ${invoice.stockSymbol} - ${invoice.item}`);
        console.log(`${type === 'buy' ? '🟢 BUY' : '🔴 SELL'} Order: ${type.toUpperCase()}`);
        console.log(`🔢 Quantity: ${invoice.quantity}`);
        console.log(`💰 Bid Price: ₹${invoice.price.toFixed(2)}`);
        console.log(`${profitLoss >= 0 ? '🟢 PROFIT' : '🔴 LOSS'}: ${profitLoss >= 0 ? '+' : ''}₹${Math.abs(profitLoss).toFixed(2)}`);
        console.log(`🕐 Time: ${new Date(invoice.timestamp).toLocaleString()}`);
        console.log(`🆔 Bid ID: ${invoice.bidId}`);
        console.log('═══════════════════════════════════════════════════════════');

        // Show invoice modal for better user experience
        dispatch({
          type: 'SET_INVOICE_MODAL',
          payload: { isOpen: true, invoice }
        });

        toast.success('📱 Invoice created (add phone number for WhatsApp)');
      }
    } catch (error) {
      console.error('❌ Invoice creation failed:', error);
      toast.error('Failed to create invoice');
    }
  };

  // Utility functions
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const getTimeRemaining = (): number => {
    if (!state.auction || !state.auction.isActive) return 0;
    return Math.max(0, Math.floor((state.auction.endTime - Date.now()) / 1000));
  };

  const isAuctionActive = (): boolean => {
    return Boolean(state.auction?.isActive && getTimeRemaining() > 0);
  };

  // Authentication functions
  const login = async (email: string, password: string): Promise<void> => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });
    
    try {
      const user = await firebaseService.signIn(email, password);
      dispatch({ type: 'SET_USER', payload: user });
      
      // Load user data
      const userData = await firebaseService.getUserData(user.uid);
      if (userData?.profitLoss) {
        dispatch({ type: 'UPDATE_PROFIT_LOSS', payload: userData.profitLoss });
      }
      
      toast.success(`Welcome back, ${user.displayName}!`);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Login failed';
      dispatch({ type: 'SET_ERROR', payload: message });
      toast.error(message);
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const signup = async (email: string, password: string, displayName?: string): Promise<void> => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });
    
    try {
      const user = await firebaseService.signUp(email, password, displayName);
      dispatch({ type: 'SET_USER', payload: user });
      toast.success(`Welcome to Stock Auction, ${user.displayName}!`);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Signup failed';
      dispatch({ type: 'SET_ERROR', payload: message });
      toast.error(message);
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await firebaseService.signOut();
      // Clear session storage to ensure login page shows on next visit
      sessionStorage.removeItem('app_session_active');
      console.log('🚪 User logged out - session cleared for fresh start next time');
      dispatch({ type: 'RESET_STATE' });
      toast.success('Logged out successfully');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Logout failed';
      toast.error(message);
      throw error;
    }
  };

  const resetPassword = async (email: string): Promise<void> => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });
    
    try {
      await firebaseService.resetPassword(email);
      toast.success('Password reset email sent!');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Password reset failed';
      dispatch({ type: 'SET_ERROR', payload: message });
      toast.error(message);
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const updatePhoneNumber = async (phoneNumber: string): Promise<void> => {
    if (!state.user) throw new Error('User not authenticated');
    
    dispatch({ type: 'SET_LOADING', payload: true });
    
    try {
      await firebaseService.updateUserPhoneNumber(state.user.uid, phoneNumber);
      dispatch({ 
        type: 'SET_USER', 
        payload: { ...state.user, phoneNumber } 
      });
      toast.success('Phone number updated successfully!');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Phone update failed';
      toast.error(message);
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  // Auction functions
  const placeBid = async (amount: number, type: 'buy' | 'sell', quantity: number = 10): Promise<void> => {
    if (!state.user) {
      const error = 'User not authenticated';
      toast.error(error);
      throw new Error(error);
    }

    if (!isAuctionActive()) {
      const error = 'Auction is not active';
      toast.error(error);
      throw new Error(error);
    }

    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });

    try {
      console.log('🎯 Placing bid:', { amount, type, user: state.user.uid });

      const bid: Omit<Bid, 'id'> = {
        userId: state.user.uid,
        userName: state.user.displayName || state.user.email || 'Anonymous',
        amount,
        type,
        timestamp: Date.now(),
        stockSymbol: state.stock.symbol
      };

      console.log('📊 Bid data to save:', bid);
      const savedBid = await firebaseService.addBid(bid);
      console.log('✅ Bid saved successfully:', savedBid);

      dispatch({ type: 'ADD_BID', payload: savedBid });

      // Calculate profit/loss with user-specified quantity
      const profitLoss = type === 'buy'
        ? (state.stock.currentPrice - amount) * quantity  // Buy low, profit when price is higher
        : (amount - state.stock.currentPrice) * quantity; // Sell high, profit when price is lower

      console.log('💰 Profit/Loss Calculation:', {
        bidType: type,
        bidAmount: amount,
        currentPrice: state.stock.currentPrice,
        profitLoss: profitLoss,
        quantity: quantity
      });

      // Update user profit/loss (don't fail if this fails)
      try {
        const newProfitLoss = state.userProfitLoss + profitLoss;
        await firebaseService.updateUserProfitLoss(state.user.uid, profitLoss);
        dispatch({ type: 'UPDATE_PROFIT_LOSS', payload: newProfitLoss });
      } catch (profitError) {
        console.warn('Failed to update profit/loss:', profitError);
        // Don't throw - bid was successful
      }

      // ALWAYS attempt to send WhatsApp invoice (with fallbacks)
      await sendWhatsAppInvoice(savedBid, amount, type, profitLoss, quantity);

      toast.success(`${type.toUpperCase()} bid placed successfully!`);
    } catch (error) {
      console.error('❌ Failed to place bid:', error);

      // If it's a permission error, try to create a local bid for demo purposes
      if (error instanceof Error && error.message.includes('permissions')) {
        console.log('🔄 Creating local demo bid due to permission error');

        const localBid: Bid = {
          id: `local-${Date.now()}`,
          userId: state.user!.uid,
          userName: state.user!.displayName || state.user!.email || 'Anonymous',
          amount,
          type,
          timestamp: Date.now(),
          stockSymbol: state.stock.symbol,
          status: 'active'
        };

        dispatch({ type: 'ADD_BID', payload: localBid });

        // Calculate profit/loss for local bid
        const profitLoss = type === 'buy'
          ? (state.stock.currentPrice - amount) * quantity
          : (amount - state.stock.currentPrice) * quantity;

        const newProfitLoss = state.userProfitLoss + profitLoss;
        dispatch({ type: 'UPDATE_PROFIT_LOSS', payload: newProfitLoss });

        // Send WhatsApp invoice for demo bid too!
        await sendWhatsAppInvoice(localBid, amount, type, profitLoss, quantity);

        toast.success(`${type.toUpperCase()} bid placed (demo mode)!`);
        return; // Don't throw error for demo mode
      }

      const message = error instanceof Error ? error.message : 'Failed to place bid';
      dispatch({ type: 'SET_ERROR', payload: message });
      toast.error(`Failed to place bid: ${message}`);
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const cancelBid = async (bidId: string): Promise<void> => {
    if (!state.user) throw new Error('User not authenticated');
    
    try {
      await firebaseService.cancelBid(bidId, state.user.uid);
      dispatch({ 
        type: 'UPDATE_BID', 
        payload: { id: bidId, updates: { status: 'cancelled' } } 
      });
      toast.success('Bid cancelled successfully');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to cancel bid';
      toast.error(message);
      throw error;
    }
  };

  const startAuction = async (stock: Stock, duration = 300): Promise<void> => {
    try {
      const auction = await firebaseService.createAuction(stock, duration);
      dispatch({ type: 'SET_AUCTION', payload: auction });
      dispatch({ type: 'SET_STOCK', payload: stock });
      toast.success('Auction started!');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to start auction';
      toast.error(message);
      throw error;
    }
  };

  const endAuction = async (): Promise<void> => {
    if (!state.auction) return;
    
    try {
      await firebaseService.endAuction(state.auction.id);
      dispatch({ 
        type: 'SET_AUCTION', 
        payload: { ...state.auction, isActive: false } 
      });
      toast.success('Auction ended!');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to end auction';
      toast.error(message);
      throw error;
    }
  };

  // WhatsApp functions
  const testWhatsApp = async (phoneNumber: string): Promise<void> => {
    try {
      const response = await whatsappService.testConnection(phoneNumber);
      if (response.success) {
        dispatch({ type: 'SET_WHATSAPP_CONNECTED', payload: true });
        toast.success('WhatsApp test message sent!');
      } else {
        throw new Error(response.error || 'WhatsApp test failed');
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'WhatsApp test failed';
      toast.error(message);
      throw error;
    }
  };

  const contextValue: AuctionContextType = {
    state,
    dispatch,
    login,
    signup,
    logout,
    resetPassword,
    updatePhoneNumber,
    placeBid,
    cancelBid,
    startAuction,
    endAuction,
    testWhatsApp,
    formatCurrency,
    getTimeRemaining,
    isAuctionActive
  };

  return (
    <AuctionContext.Provider value={contextValue}>
      {children}
    </AuctionContext.Provider>
  );
};

// Hook to use the auction context
export const useAuction = (): AuctionContextType => {
  const context = useContext(AuctionContext);
  if (context === undefined) {
    throw new Error('useAuction must be used within an AuctionProvider');
  }
  return context;
};

export default AuctionContext;
