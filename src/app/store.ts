import { configureStore } from "@reduxjs/toolkit";
import priceReducer from "../features/priceSlice";
import walletReducer from "../features/walletSlice";


export const store = configureStore({
  reducer: {
    price: priceReducer,
    wallet: walletReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
