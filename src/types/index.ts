// Core types for the auction app

export interface User {
  uid: string;
  email: string;
  displayName: string;
  phoneNumber?: string;
  profitLoss?: number;
  totalBids?: number;
  activeBids?: number;
  winningBids?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Bid {
  id: string;
  userId: string;
  userName: string;
  amount: number;
  type: 'buy' | 'sell';
  timestamp: number;
  stockSymbol: string;
  status?: 'active' | 'cancelled' | 'executed';
  profitLoss?: number;
}

export interface Stock {
  symbol: string;
  name: string;
  currentPrice: number;
  change?: number;
  changePercent?: number;
  volume?: number;
  marketCap?: number;
}

export interface Auction {
  id: string;
  stockSymbol: string;
  stockName: string;
  startPrice: number;
  currentPrice: number;
  highestBid?: Bid;
  startTime: number;
  endTime: number;
  duration: number;
  isActive: boolean;
  totalBids: number;
  participants: string[];
  winner?: {
    userId: string;
    userName: string;
    winningBid: Bid;
  };
}

export interface AppState {
  // Authentication
  user: User | null;
  authInitialized: boolean;
  
  // Firebase
  firebaseConnected: boolean;
  
  // Auction
  auction: Auction | null;
  stock: Stock;
  bids: Bid[];
  highestBid: Bid | null;
  
  // UI State
  loading: boolean;
  error: string | null;
  
  // User specific
  userProfitLoss: number;
  userBids: Bid[];
  
  // Bot simulation
  botBiddingEnabled: boolean;
  
  // WhatsApp
  whatsappConnected: boolean;

  // Invoice Modal
  invoiceModal: {
    isOpen: boolean;
    invoice: Invoice | null;
  };
}

export type AppAction =
  | { type: 'SET_USER'; payload: User | null }
  | { type: 'SET_AUTH_INITIALIZED'; payload: boolean }
  | { type: 'SET_FIREBASE_CONNECTED'; payload: boolean }
  | { type: 'SET_AUCTION'; payload: Auction | null }
  | { type: 'SET_STOCK'; payload: Stock }
  | { type: 'SET_BIDS'; payload: Bid[] }
  | { type: 'ADD_BID'; payload: Bid }
  | { type: 'UPDATE_BID'; payload: { id: string; updates: Partial<Bid> } }
  | { type: 'SET_HIGHEST_BID'; payload: Bid | null }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'UPDATE_PROFIT_LOSS'; payload: number }
  | { type: 'SET_USER_BIDS'; payload: Bid[] }
  | { type: 'SET_BOT_BIDDING'; payload: boolean }
  | { type: 'SET_WHATSAPP_CONNECTED'; payload: boolean }
  | { type: 'SET_INVOICE_MODAL'; payload: { isOpen: boolean; invoice?: Invoice | null } }
  | { type: 'RESET_STATE' };

export interface AuctionContextType {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
  
  // Authentication actions
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, displayName?: string) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updatePhoneNumber: (phoneNumber: string) => Promise<void>;
  
  // Auction actions
  placeBid: (amount: number, type: 'buy' | 'sell', quantity?: number) => Promise<void>;
  cancelBid: (bidId: string) => Promise<void>;
  startAuction: (stock: Stock, duration?: number) => Promise<void>;
  endAuction: () => Promise<void>;
  
  // WhatsApp actions
  testWhatsApp: (phoneNumber: string) => Promise<void>;
  
  // Utility functions
  formatCurrency: (amount: number) => string;
  getTimeRemaining: () => number;
  isAuctionActive: () => boolean;
}

// Configuration types
export interface AppConfig {
  auctionDuration: number;
  minBidIncrement: number;
  maxBidAmount: number;
  botBiddingEnabled: boolean;
  botBiddingInterval: [number, number]; // min, max seconds
  whatsappEnabled: boolean;
}

// WhatsApp types
export interface Invoice {
  item: string;
  quantity: number;
  price: number;
  profitLoss: number;
  timestamp: string;
  user: string;
  bidType: 'buy' | 'sell';
  stockSymbol: string;
  bidId?: string;
}

export interface WhatsAppResponse {
  success: boolean;
  messageId?: string;
  error?: string;
  deliveryStatus?: 'sent' | 'delivered' | 'read' | 'failed';
}

// Bot types
export interface BotBidder {
  id: string;
  name: string;
  avatar?: string;
  biddingStyle: 'aggressive' | 'conservative' | 'random';
  minBidAmount: number;
  maxBidAmount: number;
  biddingFrequency: number; // seconds between bids
}

// Notification types
export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  timestamp: number;
  read: boolean;
  action?: {
    label: string;
    onClick: () => void;
  };
}

// Analytics types
export interface TradingStats {
  totalBids: number;
  totalVolume: number;
  profitLoss: number;
  winRate: number;
  averageBidAmount: number;
  bestTrade: {
    amount: number;
    profitLoss: number;
    timestamp: number;
  };
  worstTrade: {
    amount: number;
    profitLoss: number;
    timestamp: number;
  };
}

// Local storage keys
export const STORAGE_KEYS = {
  USER_PREFERENCES: 'auction_user_preferences',
  AUCTION_STATE: 'auction_state',
  TRADING_HISTORY: 'trading_history',
  WHATSAPP_SETTINGS: 'whatsapp_settings'
} as const;
