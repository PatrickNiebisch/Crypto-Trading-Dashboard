import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";

interface PriceState {
  prices: { time: number; price: number }[];
  loading: boolean;
  error: string | null;
}

const initialState: PriceState = {
  prices: [],
  loading: false,
  error: null,
};

interface CoinCapPriceEntry {
  time: number; 
  priceUsd: string;
}

interface CoinCapResponse {
  data: CoinCapPriceEntry[];
  timestamp: number;
}

const API_KEY = "yourKey";

export const fetchPrices = createAsyncThunk(
  "price/fetchPrices",
  async (_, { rejectWithValue }) => {
    try {
      const priceResponse = await fetch(
        "https://rest.coincap.io/v3/assets/bitcoin/history?interval=m1",
        {
          headers: {
            Authorization: `Bearer ${API_KEY}`,
          },
        }
      );

      if (!priceResponse.ok) {
        throw new Error(`Failed to fetch price data: ${priceResponse.statusText}`);
      }

      const priceData: CoinCapResponse = await priceResponse.json();

      if (!priceData.data || !Array.isArray(priceData.data)) {
        throw new Error("Invalid response structure: 'data' field is missing or not an array");
      }

      const pricesInUsd = priceData.data.map((entry: CoinCapPriceEntry) => ({
        time: entry.time,
        price: parseFloat(entry.priceUsd),
      }));

      return pricesInUsd;
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

const priceSlice = createSlice({
  name: "price",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchPrices.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPrices.fulfilled, (state, action: PayloadAction<{ time: number; price: number }[]>) => {
        state.prices = action.payload;
        state.loading = false;
      })
      .addCase(fetchPrices.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export default priceSlice.reducer;
