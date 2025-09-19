import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface Trade {
  action: "Buy" | "Sell";
  amountBTC: number;
  amountEUR: number;
  time: string;
}

interface WalletState {
  eur: number; 
  btc: number; 
  tradeHistory: Trade[]; 
}

const initialState: WalletState = {
  eur: 10000,
  btc: 0.5,
  tradeHistory: [], 
};

const walletSlice = createSlice({
  name: "wallet",
  initialState,
  reducers: {
    buyBTC: (state, action: PayloadAction<{ btc: number; eur: number }>) => {
      state.btc += action.payload.btc; 
      state.eur -= action.payload.eur; 
      state.tradeHistory.push({
        action: "Buy",
        amountBTC: action.payload.btc,
        amountEUR: -action.payload.eur,
        time: new Date().toLocaleTimeString(),
      });
    },
    sellBTC: (state, action: PayloadAction<{ btc: number; eur: number }>) => {
      state.btc -= action.payload.btc; 
      state.eur += action.payload.eur; 
      state.tradeHistory.push({
        action: "Sell",
        amountBTC: -action.payload.btc,
        amountEUR: action.payload.eur,
        time: new Date().toLocaleTimeString(),
      });
    },
  },
});

export const { buyBTC, sellBTC } = walletSlice.actions;
export default walletSlice.reducer;
