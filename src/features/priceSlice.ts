import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";

interface PriceState {
  prices: { time: number; price: number }[];
  loading: boolean;
  error: string | null;
  isUsingMockData: boolean;
  dataSource: "live" | "mock";
  exchangeRate?: number;
}

const initialState: PriceState = {
  prices: [],
  loading: false,
  error: null,
  isUsingMockData: false,
  dataSource: "live",
  exchangeRate: undefined,
};

interface CoinCapPriceEntry {
  time: number;
  priceUsd: string;
}

interface CoinCapResponse {
  data: CoinCapPriceEntry[];
  timestamp: number;
}

interface FetchPricesResult {
  prices: { time: number; price: number }[];
  dataSource: "live" | "mock";
  exchangeRate?: number;
}

const getMockPriceData = () => {
  const now = Date.now();
  const mockData = [];

  const dataPoints = 96;
  const intervalMinutes = 15;

  for (let i = dataPoints - 1; i >= 0; i--) {
    const time = now - i * intervalMinutes * 60 * 1000;

    const hoursAgo = i * (intervalMinutes / 60);

    const basePrice = 95000;

    const dailyTrend = (dataPoints - i) * 12;

    const hour = new Date(time).getHours();
    const volatilityMultiplier = hour >= 8 && hour <= 16 ? 1.5 : 1.0;

    const longWave = Math.sin(hoursAgo * 0.1) * 700;
    const mediumWave = Math.sin(hoursAgo * 0.3) * 350;
    const shortWave = Math.sin(hoursAgo * 0.8) * 180;

    const randomVariation = (Math.random() - 0.5) * 500 * volatilityMultiplier;

    const price =
      basePrice +
      dailyTrend +
      longWave +
      mediumWave +
      shortWave +
      randomVariation;

    mockData.push({
      time,
      price: Math.round(price * 100) / 100,
    });
  }

  return mockData.sort((a, b) => a.time - b.time);
};

const fetchExchangeRate = async (): Promise<number> => {
  try {
    const response = await fetch(
      "https://api.exchangerate-api.com/v4/latest/USD"
    );

    if (!response.ok) {
      throw new Error("Exchange rate API failed");
    }

    const data = await response.json();
    const eurRate = data.rates?.EUR;

    if (!eurRate || typeof eurRate !== "number") {
      throw new Error("Invalid EUR rate in response");
    }

    console.log(`💱 Current USD to EUR rate: ${eurRate}`);
    return eurRate;
  } catch (error) {
    console.error(error);
    console.warn(
      "⚠️  Could not fetch exchange rate, using fallback rate of 0.85"
    );
    return 0.85;
  }
};

export const fetchPrices = createAsyncThunk(
  "price/fetchPrices",
  async (_, { rejectWithValue }) => {
    try {
      const API_KEY = process.env.NEXT_PUBLIC_COINCAP_API_KEY;
      console.log("Using API Key:", API_KEY);

      if (!API_KEY) {
        console.warn(
          "⚠️  No API key found, using mock data. Set NEXT_PUBLIC_COINCAP_API_KEY environment variable for real data."
        );
        return {
          prices: getMockPriceData(),
          dataSource: "mock" as const,
          exchangeRate: 0.85,
        };
      }

      const exchangeRate = await fetchExchangeRate();

      const headers: HeadersInit = {
        Authorization: `Bearer ${API_KEY}`,
      };

      const priceResponse = await fetch(
        "https://rest.coincap.io/v3/assets/bitcoin/history?interval=m1",
        { headers }
      );

      if (!priceResponse.ok) {
        console.warn(
          "⚠️  CoinCap API request failed, falling back to mock data"
        );
        return {
          prices: getMockPriceData(),
          dataSource: "mock" as const,
          exchangeRate,
        };
      }

      const priceData: CoinCapResponse = await priceResponse.json();

      if (!priceData.data || !Array.isArray(priceData.data)) {
        throw new Error(
          "Invalid response structure: 'data' field is missing or not an array"
        );
      }

      const pricesInEur = priceData.data.map((entry: CoinCapPriceEntry) => ({
        time: entry.time,
        price:
          Math.round(parseFloat(entry.priceUsd) * exchangeRate * 100) / 100,
      }));

      console.info("✅ Using live data from CoinCap API, converted to EUR");
      console.info(`💱 Applied exchange rate: 1 USD = ${exchangeRate} EUR`);

      return {
        prices: pricesInEur,
        dataSource: "live" as const,
        exchangeRate,
      };
    } catch (error) {
      console.error(error);
      console.warn("⚠️  Error fetching real data, falling back to mock data");
      return {
        prices: getMockPriceData(),
        dataSource: "mock" as const,
        exchangeRate: 0.85,
      };
    }
  }
);

const priceSlice = createSlice({
  name: "price",
  initialState,
  reducers: {
    refreshPrices: (state) => {
      state.loading = true;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPrices.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchPrices.fulfilled,
        (state, action: PayloadAction<FetchPricesResult>) => {
          state.prices = action.payload.prices;
          state.dataSource = action.payload.dataSource;
          state.isUsingMockData = action.payload.dataSource === "mock";
          state.exchangeRate = action.payload.exchangeRate;
          state.loading = false;
        }
      )
      .addCase(fetchPrices.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { refreshPrices } = priceSlice.actions;
export default priceSlice.reducer;
