import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface Trade {
  id: string;
  action: "Buy" | "Sell";
  amountBTC: number;
  amountEUR: number;
  price: number;
  timestamp: number;
}

interface WalletState {
  btc: number;
  eur: number;
  tradeHistory: Trade[];
}

const initialState: WalletState = {
  btc: 0.005,
  eur: 10000, 
  tradeHistory: [ {
    id: "1",
    action: "Buy",
    amountBTC: 0.001,
    amountEUR: 68.50,
    price: 68500,
    timestamp: Date.now() - 86400000 * 5,
  },
  {
    id: "2", 
    action: "Buy",
    amountBTC: 0.0015,
    amountEUR: 103.75,
    price: 69166.67,
    timestamp: Date.now() - 86400000 * 3,
  },
  {
    id: "3",
    action: "Sell", 
    amountBTC: 0.0005,
    amountEUR: 34.80,
    price: 69600,
    timestamp: Date.now() - 86400000 * 1,
  },
  {
    id: "4",
    action: "Buy",
    amountBTC: 0.002,
    amountEUR: 139.20,
    price: 69600,
    timestamp: Date.now() - 3600000 * 4, 
  },],
};



interface TradePayload {
  btc: number;
  eur: number;
  price?: number; 
}

const walletSlice = createSlice({
  name: "wallet",
  initialState,
  reducers: {
    buyBTC: (state, action: PayloadAction<TradePayload>) => {
      const { btc, eur, price } = action.payload;
      
      state.btc += btc;
      state.eur -= eur;
      
      state.tradeHistory.push({
        id: Date.now().toString(),
        action: "Buy",
        amountBTC: btc,
        amountEUR: eur,
        price: price || 0,
        timestamp: Date.now(),
      });
    },
    
    sellBTC: (state, action: PayloadAction<TradePayload>) => {
      const { btc, eur, price } = action.payload;
      
      state.btc -= btc;
      state.eur += eur;
      
      state.tradeHistory.push({
        id: Date.now().toString(),
        action: "Sell",
        amountBTC: btc,
        amountEUR: eur,
        price: price || 0,
        timestamp: Date.now(),
      });
    },
    
    setInitialBalance: (state, action: PayloadAction<{ btc: number; eur: number }>) => {
      state.btc = action.payload.btc;
      state.eur = action.payload.eur;
    },
    
    resetWallet: (state) => {
      state.btc = 0;
      state.eur = 10000;
      state.tradeHistory = [];
    },
    
    migrateFromTradeHistory: (state) => {
      let btcBalance = 0;
      let eurBalance = 10000;
      
      state.tradeHistory.forEach((trade) => {
        if (trade.action === "Buy") {
          btcBalance += trade.amountBTC;
          eurBalance -= trade.amountEUR;
        } else {
          btcBalance -= trade.amountBTC;
          eurBalance += trade.amountEUR;
        }
      });
      
      state.btc = btcBalance;
      state.eur = eurBalance;
    },
  },
});

export const { 
  buyBTC, 
  sellBTC, 
  setInitialBalance, 
  resetWallet, 
  migrateFromTradeHistory 
} = walletSlice.actions;

export default walletSlice.reducer;