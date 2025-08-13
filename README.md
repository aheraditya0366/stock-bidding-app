# 🎯 Stock Auction Platform

A comprehensive, real-time stock auction application built with React, TypeScript, Firebase, and Tailwind CSS. Features live bidding, WhatsApp invoice delivery, profit/loss tracking, and bot simulation.

## ✨ Features

### 🔐 Authentication
- **Email/Password Authentication** - Secure user registration and login
- **Phone Number Integration** - Optional phone number for WhatsApp notifications
- **Password Reset** - Email-based password recovery
- **User Profiles** - Persistent user data and preferences

### 🎯 Auction System
- **Live Auctions** - Real-time bidding with countdown timers
- **Buy/Sell Orders** - Support for both buy and sell bid types
- **Order Book** - Live display of top 5 bids and market depth
- **Bid History** - Complete transaction history with filtering
- **Bid Validation** - Minimum increment enforcement and amount limits
- **Bid Cancellation** - Cancel active bids before auction ends

### 📱 WhatsApp Integration
- **Instant Invoices** - Automatic invoice delivery via WhatsApp
- **Detailed Reports** - Comprehensive trading summaries
- **Profit/Loss Calculations** - Real-time P&L in invoices
- **Trading Tips** - Educational content in messages
- **Connection Testing** - Verify WhatsApp integration

### 📊 Real-Time Features
- **Live Updates** - Real-time bid updates across all users
- **Countdown Timer** - Visual auction progress with warnings
- **Profit/Loss Tracking** - Live P&L calculations and display
- **Market Statistics** - Participant count, bid volume, success rates

### 🤖 Bot Simulation
- **Automated Bidding** - Configurable bot bidders for testing
- **Realistic Behavior** - Varied bidding patterns and timing
- **Market Simulation** - Enhanced auction activity

### 🎨 User Experience
- **Responsive Design** - Mobile-first, works on all devices
- **Beautiful UI** - Modern design with Tailwind CSS
- **Toast Notifications** - Real-time feedback and alerts
- **Loading States** - Smooth user experience with proper loading
- **Error Handling** - Comprehensive error messages and recovery

## 🚀 Tech Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS
- **Backend**: Firebase (Authentication, Firestore, Real-time)
- **Build Tool**: Vite
- **Notifications**: React Hot Toast
- **Icons**: Lucide React
- **WhatsApp**: Twilio API
- **State Management**: Context API + useReducer

## 📦 Installation

### Prerequisites
- Node.js 18+ and npm
- Firebase project with Firestore enabled
- Twilio account for WhatsApp (optional)

### 1. Clone and Install
```bash
git clone <repository-url>
cd stock_bidding_app
npm install
```

### 2. Firebase Setup
1. Create a Firebase project at [Firebase Console](https://console.firebase.google.com)
2. Enable Authentication (Email/Password)
3. Enable Firestore Database
4. Get your Firebase config from Project Settings
5. Update `src/services/firebase.ts` with your config

### 3. Environment Configuration
Create `.env.local` file:
```env
# Firebase Configuration
VITE_USE_FIREBASE_EMULATOR=false

# Twilio WhatsApp Configuration (Optional)
VITE_TWILIO_ACCOUNT_SID=your_twilio_account_sid
VITE_TWILIO_AUTH_TOKEN=your_twilio_auth_token
VITE_TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886

# App Configuration
VITE_AUCTION_DURATION=300
VITE_MIN_BID_INCREMENT=1.00
VITE_BOT_BIDDING_ENABLED=true
```

### 4. Start Development Server
```bash
npm run dev
```

Visit `http://localhost:5173` to see the app!

## 🎮 Usage

### Getting Started
1. **Sign Up** - Create an account with email/password
2. **Add Phone** - Optional: Add phone number for WhatsApp invoices
3. **Join Auction** - Auction starts automatically when you log in
4. **Place Bids** - Use Buy/Sell buttons to place bids
5. **Track Progress** - Monitor your profit/loss in real-time

### Key Features
- **Dashboard**: View your trading statistics and P&L
- **Bid Form**: Place buy/sell orders with validation
- **Order Book**: See top bids and market depth
- **Timer**: Track auction countdown and progress
- **History**: Review all your past bids and trades
- **Settings**: Configure WhatsApp notifications

### WhatsApp Setup
1. Go to Settings (gear icon in header)
2. Add your WhatsApp phone number (include country code)
3. Click "Send Test Message" to verify connection
4. Invoices will be sent automatically after each bid

## 🏗️ Project Structure

```
src/
├── components/           # React components
│   ├── auth/            # Authentication forms
│   ├── auction/         # Auction-related components
│   └── user/            # User dashboard and settings
├── context/             # React Context for state management
├── services/            # External service integrations
│   ├── firebase.ts      # Firebase operations
│   └── whatsapp.ts      # WhatsApp/Twilio integration
├── types/               # TypeScript type definitions
└── App.tsx              # Main application component
```

## 🔧 Configuration

### Auction Settings
- **Duration**: Default 5 minutes (300 seconds)
- **Min Increment**: ₹1.00 minimum bid increase
- **Max Bid**: ₹10,00,000 maximum bid amount
- **Bot Bidding**: Configurable automated bidders

### WhatsApp Features
- **Invoice Format**: Detailed trading summaries
- **Delivery**: Instant delivery after each bid
- **Content**: P&L, tips, market insights
- **Testing**: Built-in connection verification

## 🚀 Deployment

### Build for Production
```bash
npm run build
```

### Deploy to Firebase Hosting
```bash
npm install -g firebase-tools
firebase login
firebase init hosting
firebase deploy
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

If you encounter any issues:

1. Check the browser console for errors
2. Verify Firebase configuration
3. Ensure Firestore rules are properly set
4. Test WhatsApp connection in settings
5. Check network connectivity

## 🎯 Future Enhancements

- [ ] Multiple stock symbols
- [ ] Advanced charting
- [ ] Portfolio management
- [ ] Social features
- [ ] Mobile app
- [ ] Advanced analytics

---

**Built with ❤️ using React, TypeScript, and Firebase**
