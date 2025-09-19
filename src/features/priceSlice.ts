import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface PriceState {
  prices: { time: string; price: number }[];
}

const initialState: PriceState = {
  prices: [
    { time: "12:00", price: 68000 },
    { time: "12:15", price: 61200 },
    { time: "12:30", price: 88400 },
    { time: "12:45", price: 68600 },
    { time: "13:00", price: 68900 },
  ],
};

const priceSlice = createSlice({
  name: "price",
  initialState,
  reducers: {
    addPrice: (state: PriceState, action: PayloadAction<{ time: string; price: number }>) => {
      state.prices.push(action.payload);
    },
  },
});

export const { addPrice } = priceSlice.actions;
export default priceSlice.reducer;
