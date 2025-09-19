import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface Trade {
  action: "Buy" | "Sell";
  amountBTC: number;
  amountEUR: number;
  time: number;
}

interface WalletState {
  eur: number;
  btc: number;
  tradeHistory: Trade[];
}

const initialState: WalletState = {
  eur: 10000,
  btc: 0.6,
  tradeHistory: [
    {
      action: "Buy",
      amountBTC: 0.1,
      amountEUR: -3000, 
      time: new Date("2023-07-15T10:30:00").getTime(), 
    },
    {
      action: "Buy",
      amountBTC: 0.05,
      amountEUR: -1600, 
      time: new Date("2023-08-01T14:45:00").getTime(),
    },
    {
      action: "Buy",
      amountBTC: 0.2,
      amountEUR: -6200, 
      time: new Date("2023-08-20T09:15:00").getTime(),
    },
    {
      action: "Buy",
      amountBTC: 0.15,
      amountEUR: -5250, 
      time: new Date("2023-09-05T16:00:00").getTime(),
    },
    {
      action: "Buy",
      amountBTC: 0.1,
      amountEUR: -3400,
      time: new Date("2023-09-18T11:30:00").getTime(),
    },
  ],
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
        time: new Date().getTime(),
      });
    },
    sellBTC: (state, action: PayloadAction<{ btc: number; eur: number }>) => {
      state.btc -= action.payload.btc;
      state.eur += action.payload.eur;
      state.tradeHistory.push({
        action: "Sell",
        amountBTC: -action.payload.btc,
        amountEUR: action.payload.eur,
        time: new Date().getTime(),
      });
    },
  },
});

export const { buyBTC, sellBTC } = walletSlice.actions;
export default walletSlice.reducer;
