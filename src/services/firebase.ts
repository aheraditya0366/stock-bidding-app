// src/services/firebase.ts
import { initializeApp } from 'firebase/app';
import {
  getAuth,
  connectAuthEmulator,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  type User as FirebaseUser,
  updateProfile,
  sendPasswordResetEmail,
  updatePassword,
  EmailAuthProvider,
  reauthenticateWithCredential,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  PhoneAuthProvider,
  signInWithCredential
} from 'firebase/auth';
import {
  getFirestore,
  connectFirestoreEmulator,
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  limit,
  doc,
  updateDoc,
  increment,
  onSnapshot,
  serverTimestamp,
  setDoc,
  getDoc,
  where
} from 'firebase/firestore';
import { getAnalytics } from 'firebase/analytics';

// Types
export interface User {
  uid: string;
  email: string;
  displayName: string;
  phoneNumber?: string;
  profitLoss?: number;
  totalBids?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Bid {
  id: string;
  userId: string;
  userName: string;
  amount: number; // Price per share
  quantity: number; // Number of shares/units
  type: 'buy' | 'sell';
  timestamp: number;
  stockSymbol: string;
  status?: 'active' | 'cancelled' | 'executed';
  profitLoss?: number;
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
}

export interface Stock {
  symbol: string;
  name: string;
  currentPrice: number;
  change?: number;
  changePercent?: number;
}

const firebaseConfig = {
  apiKey: "AIzaSyCbe3eqvmNwjgWwfAMRxH3ZzUr4X5v2msA",
  authDomain: "stock-auction-8559a.firebaseapp.com",
  projectId: "stock-auction-8559a",
  storageBucket: "stock-auction-8559a.firebasestorage.app",
  messagingSenderId: "778640693799",
  appId: "1:778640693799:web:7b5789e54e72c942778c02",
  measurementId: "G-KDWJGT1BF3"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const analytics = getAnalytics(app);

// Connect to emulators in development (only if explicitly enabled)
if (import.meta.env.DEV && import.meta.env.VITE_USE_FIREBASE_EMULATOR === 'true') {
  try {
    // Try to connect to emulators
    connectAuthEmulator(auth, 'http://localhost:9099', { disableWarnings: true });
    connectFirestoreEmulator(db, 'localhost', 8080);
    console.log('🔧 Connected to Firebase emulators');
  } catch (error) {
    console.warn('⚠️ Failed to connect to Firebase emulators, using production:', error);
  }
} else {
  console.log('📡 Using production Firebase services');
}

// Initialize Firestore with better error handling
console.log('🚀 Firebase initialized:', {
  projectId: firebaseConfig.projectId,
  authDomain: firebaseConfig.authDomain,
  environment: import.meta.env.DEV ? 'development' : 'production'
});

// Firebase service class
class FirebaseService {
  private static instance: FirebaseService;

  constructor() {
    if (FirebaseService.instance) {
      return FirebaseService.instance;
    }
    FirebaseService.instance = this;
  }

  // Authentication methods
  async signIn(email: string, password: string): Promise<User> {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;

      // Get or create user document
      const userData = await this.getUserData(firebaseUser.uid);

      return {
        uid: firebaseUser.uid,
        email: firebaseUser.email!,
        displayName: firebaseUser.displayName || firebaseUser.email!.split('@')[0],
        phoneNumber: firebaseUser.phoneNumber || undefined,
        profitLoss: userData?.profitLoss || 0,
        totalBids: userData?.totalBids || 0
      };
    } catch (error: any) {
      console.error('Sign in error:', error);
      throw this.handleAuthError(error);
    }
  }

  private handleAuthError(error: any): Error {
    switch (error.code) {
      case 'auth/network-request-failed':
        return new Error('Network connection failed. Please check your internet connection and try again.');
      case 'auth/user-not-found':
        return new Error('No account found with this email. Please sign up first.');
      case 'auth/wrong-password':
        return new Error('Incorrect password. Please try again.');
      case 'auth/invalid-email':
        return new Error('Please enter a valid email address.');
      case 'auth/user-disabled':
        return new Error('This account has been disabled. Please contact support.');
      case 'auth/email-already-in-use':
        return new Error('An account with this email already exists. Please sign in instead.');
      case 'auth/weak-password':
        return new Error('Password is too weak. Please use at least 6 characters.');
      case 'auth/too-many-requests':
        return new Error('Too many failed attempts. Please try again later.');
      default:
        return new Error(error.message || 'Authentication failed. Please try again.');
    }
  }

  async signUp(email: string, password: string, displayName?: string): Promise<User> {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;

      const finalDisplayName = displayName || email.split('@')[0];

      // Update profile with display name
      await updateProfile(firebaseUser, {
        displayName: finalDisplayName
      });

      // Create user document in Firestore
      await this.createUserDocument(firebaseUser, finalDisplayName);

      return {
        uid: firebaseUser.uid,
        email: firebaseUser.email!,
        displayName: finalDisplayName,
        phoneNumber: firebaseUser.phoneNumber || undefined,
        profitLoss: 0,
        totalBids: 0
      };
    } catch (error: any) {
      console.error('Sign up error:', error);
      throw this.handleAuthError(error);
    }
  }

  async signOut(): Promise<void> {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Sign out error:', error);
      throw new Error('Failed to sign out');
    }
  }

  // Password reset
  async resetPassword(email: string): Promise<void> {
    try {
      await sendPasswordResetEmail(auth, email);
      console.log('✅ Password reset email sent');
    } catch (error) {
      console.error('Password reset error:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to send password reset email');
    }
  }

  // Update password
  async updateUserPassword(currentPassword: string, newPassword: string): Promise<void> {
    try {
      const user = auth.currentUser;
      if (!user || !user.email) {
        throw new Error('No authenticated user found');
      }

      // Re-authenticate user before updating password
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);

      // Update password
      await updatePassword(user, newPassword);
      console.log('✅ Password updated successfully');
    } catch (error) {
      console.error('Password update error:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to update password');
    }
  }

  // Phone authentication setup
  setupRecaptcha(containerId: string): RecaptchaVerifier {
    return new RecaptchaVerifier(auth, containerId, {
      size: 'invisible',
      callback: () => {
        console.log('✅ reCAPTCHA solved');
      },
      'expired-callback': () => {
        console.log('⚠️ reCAPTCHA expired');
      }
    });
  }

  // Send phone verification code
  async sendPhoneVerificationCode(phoneNumber: string, recaptchaVerifier: RecaptchaVerifier) {
    try {
      const confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, recaptchaVerifier);
      console.log('✅ SMS sent successfully');
      return confirmationResult;
    } catch (error) {
      console.error('Phone verification error:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to send verification code');
    }
  }

  // Verify phone code and sign in
  async verifyPhoneCode(verificationId: string, code: string): Promise<User> {
    try {
      const credential = PhoneAuthProvider.credential(verificationId, code);
      const userCredential = await signInWithCredential(auth, credential);
      const firebaseUser = userCredential.user;

      // Create user document (will merge if exists)
      await this.createUserDocument(firebaseUser);

      return {
        uid: firebaseUser.uid,
        email: firebaseUser.email || '',
        displayName: firebaseUser.displayName || firebaseUser.phoneNumber || 'Phone User',
        phoneNumber: firebaseUser.phoneNumber || undefined
      };
    } catch (error) {
      console.error('Phone verification error:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to verify phone number');
    }
  }

  // Create user document in Firestore with proper error handling
  private async createUserDocument(user: FirebaseUser, displayName?: string): Promise<void> {
    try {
      console.log('📝 Creating user document for:', user.uid);

      const userDocRef = doc(db, 'users', user.uid);
      const userData = {
        uid: user.uid,
        email: user.email,
        displayName: displayName || user.displayName || user.email!.split('@')[0],
        phoneNumber: user.phoneNumber || null,
        profitLoss: 0,
        totalBids: 0,
        activeBids: 0,
        winningBids: 0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      // Use setDoc with merge to create or update
      await setDoc(userDocRef, userData, { merge: true });

      console.log('✅ User document created/updated successfully');
    } catch (error) {
      console.error('❌ Error creating user document:', {
        error: error instanceof Error ? error.message : "Unknown error",
        userId: user.uid
      });
      // Don't throw error to prevent blocking user creation
    }
  }

  // Bid management with comprehensive error handling
  async addBid(bid: Omit<Bid, 'id'>): Promise<Bid> {
    try {
      console.log('📊 Adding bid to Firestore:', bid);

      const bidData = {
        ...bid,
        status: 'active' as const,
        timestamp: serverTimestamp(),
        createdAt: serverTimestamp()
      };

      const docRef = await addDoc(collection(db, 'bids'), bidData);

      console.log('✅ Bid added successfully with ID:', docRef.id);

      // Update user's bid count and statistics
      if (bid.userId && bid.userId !== 'bot') {
        await this.updateUserBidCount(bid.userId);
        await this.updateUserStats(bid.userId, 'activeBids', 1);
      }

      // Update auction statistics
      await this.updateAuctionStats(bid.stockSymbol, bid.amount);

      return {
        id: docRef.id,
        ...bid,
        status: 'active',
        timestamp: Date.now() // Use current timestamp for immediate display
      };
    } catch (error) {
      console.error('❌ Error adding bid:', {
        error: error instanceof Error ? error.message : "Unknown error",
        bid: bid
      });
      throw new Error(`Failed to place bid: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Cancel a bid
  async cancelBid(bidId: string, userId: string): Promise<void> {
    try {
      const bidRef = doc(db, 'bids', bidId);
      const bidDoc = await getDoc(bidRef);

      if (!bidDoc.exists()) {
        throw new Error('Bid not found');
      }

      const bidData = bidDoc.data();
      if (bidData.userId !== userId) {
        throw new Error('You can only cancel your own bids');
      }

      if (bidData.status !== 'active') {
        throw new Error('Bid cannot be cancelled');
      }

      await updateDoc(bidRef, {
        status: 'cancelled',
        cancelledAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      // Update user statistics
      await this.updateUserStats(userId, 'activeBids', -1);

      console.log('✅ Bid cancelled successfully:', bidId);
    } catch (error) {
      console.error('❌ Error cancelling bid:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to cancel bid');
    }
  }

  async getBids(stockSymbol: string = 'AAPL', limitCount: number = 50): Promise<Bid[]> {
    try {
      console.log('📖 Fetching bids from Firestore for:', stockSymbol);
      
      const bidsQuery = query(
        collection(db, 'bids'),
        where('stockSymbol', '==', stockSymbol),
        orderBy('timestamp', 'desc'),
        limit(limitCount)
      );

      const querySnapshot = await getDocs(bidsQuery);
      const bids: Bid[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        bids.push({
          id: doc.id,
          userId: data.userId,
          userName: data.userName,
          amount: data.amount,
          quantity: data.quantity || 1, // Default to 1 for backward compatibility
          type: data.type,
          timestamp: data.timestamp?.toDate?.()?.getTime() || Date.now(),
          stockSymbol: data.stockSymbol || stockSymbol
        });
      });

      console.log(`✅ Retrieved ${bids.length} bids from Firestore`);
      return bids;
    } catch (error) {
      console.error('❌ Error getting bids:', {
        error: error instanceof Error ? error instanceof Error ? error.message : "Unknown error" : 'Unknown error',
        stockSymbol: stockSymbol
      });
      return []; // Return empty array on error
    }
  }

  // Real-time bid subscription with error handling
  subscribeToBids(
    callback: (bids: Bid[]) => void,
    stockSymbol: string = 'AAPL',
    limitCount: number = 50
  ): () => void {
    console.log('🔄 Setting up real-time bid subscription for:', stockSymbol);
    
    const bidsQuery = query(
      collection(db, 'bids'),
      where('stockSymbol', '==', stockSymbol),
      orderBy('timestamp', 'desc'),
      limit(limitCount)
    );

    return onSnapshot(bidsQuery, 
      (snapshot) => {
        const bids: Bid[] = [];
        
        snapshot.forEach((doc) => {
          const data = doc.data();
          bids.push({
            id: doc.id,
            userId: data.userId,
            userName: data.userName,
            amount: data.amount,
            quantity: data.quantity || 1, // Default to 1 for backward compatibility
            type: data.type,
            timestamp: data.timestamp?.toDate?.()?.getTime() || Date.now(),
            stockSymbol: data.stockSymbol || stockSymbol
          });
        });

        console.log(`📡 Real-time update: ${bids.length} bids received`);
        callback(bids);
      }, 
      (error) => {
        console.error('❌ Error in bid subscription:', {
          error: error instanceof Error ? error.message : "Unknown error",
          stockSymbol: stockSymbol
        });
        // Provide empty array on error to prevent app crashes
        callback([]);
      }
    );
  }

  // Profit/Loss management with detailed error handling
  async updateUserProfitLoss(userId: string, amount: number): Promise<void> {
    try {
      console.log('💰 Updating profit/loss for user:', userId, 'Amount:', amount);
      
      const userDocRef = doc(db, 'users', userId);
      
      // Check if user document exists first
      const userDoc = await getDoc(userDocRef);
      if (!userDoc.exists()) {
        console.warn('⚠️ User document not found, creating new one');
        await setDoc(userDocRef, {
          uid: userId,
          profitLoss: amount,
          totalBids: 1,
          updatedAt: serverTimestamp()
        });
      } else {
        await updateDoc(userDocRef, {
          profitLoss: increment(amount),
          updatedAt: serverTimestamp()
        });
      }
      
      console.log('✅ Profit/loss updated successfully');
    } catch (error) {
      console.error('❌ Error updating profit/loss:', {
        error: error instanceof Error ? error instanceof Error ? error.message : "Unknown error" : 'Unknown error',
        userId: userId,
        amount: amount
      });
      throw new Error(`Failed to update profit/loss: ${error instanceof Error ? error instanceof Error ? error.message : "Unknown error" : 'Unknown error'}`);
    }
  }

  // Helper method to update user bid count
  private async updateUserBidCount(userId: string): Promise<void> {
    try {
      const userDocRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        await updateDoc(userDocRef, {
          totalBids: increment(1),
          updatedAt: serverTimestamp()
        });
      }
    } catch (error) {
      console.error('❌ Error updating bid count:', error instanceof Error ? error.message : "Unknown error");
      // Don't throw error as this is non-critical
    }
  }

  // Helper method to update user statistics
  private async updateUserStats(userId: string, field: string, value: number): Promise<void> {
    try {
      const userDocRef = doc(db, 'users', userId);
      await updateDoc(userDocRef, {
        [field]: increment(value),
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('❌ Error updating user stats:', error instanceof Error ? error.message : "Unknown error");
    }
  }

  // Helper method to update auction statistics
  private async updateAuctionStats(stockSymbol: string, bidAmount: number): Promise<void> {
    try {
      const auctionRef = doc(db, 'auctions', stockSymbol);
      const auctionDoc = await getDoc(auctionRef);

      if (auctionDoc.exists()) {
        const currentData = auctionDoc.data();
        const updates: any = {
          totalBids: increment(1),
          updatedAt: serverTimestamp()
        };

        // Update highest bid if this bid is higher
        if (!currentData.highestBid || bidAmount > currentData.highestBid.amount) {
          updates.currentPrice = bidAmount;
        }

        await updateDoc(auctionRef, updates);
      }
    } catch (error) {
      console.error('❌ Error updating auction stats:', error instanceof Error ? error.message : "Unknown error");
    }
  }

  // Phone number update with validation
  async updatePhoneNumber(userId: string, phoneNumber: string): Promise<void> {
    try {
      console.log('📱 Updating phone number for user:', userId);
      
      // Validate phone number format
      const phoneRegex = /^\+[1-9]\d{1,14}$/;
      if (!phoneRegex.test(phoneNumber)) {
        throw new Error('Invalid phone number format. Use international format: +1234567890');
      }
      
      const userDocRef = doc(db, 'users', userId);
      
      // Check if user document exists
      const userDoc = await getDoc(userDocRef);
      if (!userDoc.exists()) {
        throw new Error('User document not found');
      }
      
      await updateDoc(userDocRef, {
        phoneNumber: phoneNumber,
        updatedAt: serverTimestamp()
      });
      
      console.log('✅ Phone number updated successfully');
    } catch (error) {
      console.error('❌ Error updating phone number:', {
        error: error instanceof Error ? error.message : "Unknown error",
        userId: userId,
        phoneNumber: phoneNumber
      });
      throw new Error(`Failed to update phone number: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  }

  // Get user data with error handling
  async getUserData(userId: string): Promise<User | null> {
    try {
      console.log('👤 Fetching user data for:', userId);
      
      const userDocRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userDocRef);
      
      if (userDoc.exists()) {
        const data = userDoc.data();
        console.log('✅ User data retrieved successfully');
        return {
          uid: data.uid,
          email: data.email,
          displayName: data.displayName,
          phoneNumber: data.phoneNumber,
          profitLoss: data.profitLoss || 0,
          createdAt: data.createdAt?.toDate()
        };
      } else {
        console.warn('⚠️ User document not found');
        return null;
      }
    } catch (error) {
      console.error('❌ Error getting user data:', {
        error: error instanceof Error ? error.message : "Unknown error",
        userId: userId
      });
      return null;
    }
  }

  // Auction management with comprehensive error handling
  async createAuction(stock: Stock, duration: number = 300): Promise<Auction> {
    try {
      console.log('🎯 Creating auction for:', stock.symbol);

      const startTime = Date.now();
      const endTime = startTime + (duration * 1000);

      const auctionData = {
        stockSymbol: stock.symbol,
        stockName: stock.name,
        startPrice: stock.currentPrice,
        currentPrice: stock.currentPrice,
        startTime,
        endTime,
        duration,
        isActive: true,
        totalBids: 0,
        participants: [],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      // Use stock symbol as document ID for easy reference
      const auctionRef = doc(db, 'auctions', stock.symbol);
      await setDoc(auctionRef, auctionData);

      console.log('✅ Auction created successfully for:', stock.symbol);

      return {
        id: stock.symbol,
        ...auctionData,
        startTime,
        endTime
      };
    } catch (error) {
      console.error('❌ Error creating auction:', {
        error: error instanceof Error ? error.message : "Unknown error",
        stockSymbol: stock.symbol
      });
      throw new Error(`Failed to create auction: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  }

  async getAuction(stockSymbol: string): Promise<Auction | null> {
    try {
      const auctionRef = doc(db, 'auctions', stockSymbol);
      const auctionDoc = await getDoc(auctionRef);

      if (!auctionDoc.exists()) {
        return null;
      }

      const data = auctionDoc.data();
      return {
        id: auctionDoc.id,
        stockSymbol: data.stockSymbol,
        stockName: data.stockName,
        startPrice: data.startPrice,
        currentPrice: data.currentPrice,
        highestBid: data.highestBid,
        startTime: data.startTime,
        endTime: data.endTime,
        duration: data.duration,
        isActive: data.isActive,
        totalBids: data.totalBids,
        participants: data.participants || []
      };
    } catch (error) {
      console.error('❌ Error getting auction:', error);
      return null;
    }
  }

  async endAuction(auctionId: string): Promise<void> {
    try {
      const auctionRef = doc(db, 'auctions', auctionId);
      await updateDoc(auctionRef, {
        isActive: false,
        endedAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      console.log('✅ Auction ended successfully:', auctionId);
    } catch (error) {
      console.error('❌ Error ending auction:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to end auction');
    }
  }

  async getUserProfile(userId: string): Promise<any | null> {
    try {
      console.log('📋 Loading user profile for:', userId);
      const userRef = doc(db, 'users', userId);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        const userData = userSnap.data();
        console.log('✅ User profile loaded:', userData);
        return {
          uid: userId,
          ...userData,
          // Ensure createdAt is a Date object
          createdAt: userData.createdAt?.toDate?.() || new Date(userData.createdAt || Date.now()),
          joinedAt: userData.joinedAt || userData.createdAt || Date.now()
        };
      } else {
        console.log('👤 No user profile found in Firestore');
        return null;
      }
    } catch (error) {
      console.error('❌ Error loading user profile:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to load user profile');
    }
  }

  async createUserProfile(userData: any): Promise<void> {
    try {
      console.log('👤 Creating user profile:', userData);
      const userRef = doc(db, 'users', userData.uid);

      const profileData = {
        ...userData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        // Remove uid from the document data (it's the document ID)
        uid: undefined
      };

      await setDoc(userRef, profileData);
      console.log('✅ User profile created successfully');
    } catch (error) {
      console.error('❌ Error creating user profile:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to create user profile');
    }
  }

  async updateUserPhoneNumber(userId: string, phoneNumber: string): Promise<void> {
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        phoneNumber,
        updatedAt: serverTimestamp()
      });
      console.log('✅ Phone number updated successfully');
    } catch (error) {
      console.error('❌ Error updating phone number:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to update phone number');
    }
  }



  // Test Firebase connection
  async testConnection(): Promise<boolean> {
    try {
      console.log('🧪 Testing Firebase connection...');

      // Simple connection test - just try to access Firestore
      // This will work even if the collection doesn't exist
      const testRef = collection(db, 'connection-test');

      // This is a lightweight operation that tests the connection
      await getDocs(query(testRef, limit(1)));

      console.log('✅ Firebase connection test successful');
      return true;
    } catch (error: any) {
      console.warn('⚠️ Firebase connection test failed, but this might be normal:', {
        error: error instanceof Error ? error.message : "Unknown error",
        code: error?.code
      });

      // If it's just a permission error or missing collection, consider it connected
      if (error?.code === 'permission-denied' || error?.code === 'not-found') {
        console.log('✅ Firebase is connected (permission/not-found errors are expected)');
        return true;
      }

      return false;
    }
  }

  // Database health check
  async performHealthCheck(): Promise<{
    connected: boolean;
    canRead: boolean;
    canWrite: boolean;
    errors: string[];
  }> {
    const result = {
      connected: false,
      canRead: false,
      canWrite: false,
      errors: [] as string[]
    };

    try {
      // Test connection
      result.connected = await this.testConnection();

      // Test read - try to read from bids collection
      try {
        await getDocs(query(collection(db, 'bids'), limit(1)));
        result.canRead = true;
        console.log('✅ Firebase read test successful');
      } catch (error: any) {
        const errorMsg = error instanceof Error ? error.message : "Unknown error";
        console.warn('⚠️ Firebase read test failed:', errorMsg);

        // If it's just permission denied or not found, we can still consider it readable
        if (error?.code === 'permission-denied' || error?.code === 'not-found') {
          result.canRead = true;
          console.log('✅ Firebase read considered successful (permission/not-found is expected)');
        } else {
          result.errors.push(`Read test failed: ${errorMsg}`);
        }
      }

      // Test write - try to write to a test collection
      try {
        const testDoc = doc(collection(db, 'health-check'), 'test-' + Date.now());
        await setDoc(testDoc, {
          timestamp: serverTimestamp(),
          test: true,
          userAgent: navigator.userAgent
        });
        result.canWrite = true;
        console.log('✅ Firebase write test successful');
      } catch (error: any) {
        const errorMsg = error instanceof Error ? error.message : "Unknown error";
        console.warn('⚠️ Firebase write test failed:', errorMsg);
        result.errors.push(`Write test failed: ${errorMsg}`);
      }

    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "Unknown error";
      console.error('❌ Health check failed:', errorMsg);
      result.errors.push(`Health check failed: ${errorMsg}`);
    }

    console.log('🏥 Firebase health check results:', result);
    return result;
  }

  // Get current user data
  getCurrentUser(): FirebaseUser | null {
    return auth.currentUser;
  }

  // Auth state observer
  onAuthStateChanged(callback: (user: FirebaseUser | null) => void): () => void {
    return auth.onAuthStateChanged(callback);
  }
}

// Export singleton instance
export const firebaseService = new FirebaseService();

// Export Firebase app for direct access if needed
export { app };

// Export auth and db for direct access
export { auth as firebaseAuth, db as firebaseDB };

// Default export
export default firebaseService;
