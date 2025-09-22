import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";

export const SUPPORTED_CRYPTOS = {
  bitcoin: {
    id: "bitcoin",
    symbol: "BTC",
    name: "Bitcoin",
    coinCapId: "bitcoin",
    isActive: true,
  },
  ethereum: {
    id: "ethereum",
    symbol: "ETH",
    name: "Ethereum",
    coinCapId: "ethereum",
    isActive: false,
  },
} as const;

export type CryptoId = keyof typeof SUPPORTED_CRYPTOS;

interface PriceDataPoint {
  time: number;
  price: number;
}

interface CryptoPriceData {
  prices: PriceDataPoint[];
  loading: boolean;
  error: string | null;
  lastUpdated?: number;
}

interface PriceState {
  cryptos: Record<CryptoId, CryptoPriceData>;

  exchangeRate: number;
  dataSource: "live" | "mock";
  globalLoading: boolean;
  globalError: string | null;

  activeCrypto: CryptoId;
}

const createEmptyCryptoData = (): CryptoPriceData => ({
  prices: [],
  loading: false,
  error: null,
});

const initialState: PriceState = {
  cryptos: {
    bitcoin: createEmptyCryptoData(),
    ethereum: createEmptyCryptoData(),
  },
  exchangeRate: 0.85,
  dataSource: "mock",
  globalLoading: false,
  globalError: null,
  activeCrypto: "bitcoin",
};

interface CoinCapPriceEntry {
  time: number;
  priceUsd: string;
}

interface CoinCapResponse {
  data: CoinCapPriceEntry[];
  timestamp: number;
}

interface FetchPricesParams {
  cryptoId: CryptoId;
  forceRefresh?: boolean;
}

interface FetchPricesResult {
  cryptoId: CryptoId;
  prices: PriceDataPoint[];
  dataSource: "live" | "mock";
  exchangeRate: number;
}

const getMockPriceData = (cryptoId: CryptoId): PriceDataPoint[] => {
  const now = Date.now();
  const mockData: PriceDataPoint[] = [];
  const dataPoints = 96;
  const intervalMinutes = 15;

  const basePrices: Record<CryptoId, number> = {
    bitcoin: 95000,
    ethereum: 3500,
  };

  const basePrice = basePrices[cryptoId] || 1000;

  for (let i = dataPoints - 1; i >= 0; i--) {
    const time = now - i * intervalMinutes * 60 * 1000;
    const hoursAgo = i * (intervalMinutes / 60);

    const dailyTrend = (dataPoints - i) * (basePrice * 0.0001);
    const longWave = Math.sin(hoursAgo * 0.1) * (basePrice * 0.007);
    const mediumWave = Math.sin(hoursAgo * 0.3) * (basePrice * 0.0035);
    const shortWave = Math.sin(hoursAgo * 0.8) * (basePrice * 0.0018);
    const randomVariation = (Math.random() - 0.5) * (basePrice * 0.005);

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

    return eurRate;
  } catch (error) {
    console.error("Exchange rate fetch failed:", error);
    return 0.85;
  }
};

export const fetchCryptoPrices = createAsyncThunk(
  "price/fetchCryptoPrices",
  async ({ cryptoId }: FetchPricesParams, { rejectWithValue }) => {
    try {
      const cryptoConfig = SUPPORTED_CRYPTOS[cryptoId];

      if (!cryptoConfig.isActive) {
        throw new Error(`${cryptoConfig.name} is not currently active`);
      }

      const API_KEY = process.env.NEXT_PUBLIC_COINCAP_API_KEY;

      if (!API_KEY) {
        console.warn(
          `No API key found for ${cryptoConfig.name}, using mock data`
        );
        return {
          cryptoId,
          prices: getMockPriceData(cryptoId),
          dataSource: "mock" as const,
          exchangeRate: 0.85,
        };
      }

      const exchangeRate = await fetchExchangeRate();

      const headers: HeadersInit = {
        Authorization: `Bearer ${API_KEY}`,
      };

      const priceResponse = await fetch(
        `https://rest.coincap.io/v3/assets/${cryptoConfig.coinCapId}/history?interval=m1`,
        { headers }
      );

      if (!priceResponse.ok) {
        console.warn(
          `CoinCap API failed for ${cryptoConfig.name}, using mock data`
        );
        return {
          cryptoId,
          prices: getMockPriceData(cryptoId),
          dataSource: "mock" as const,
          exchangeRate,
        };
      }

      const priceData: CoinCapResponse = await priceResponse.json();

      if (!priceData.data || !Array.isArray(priceData.data)) {
        throw new Error("Invalid API response structure");
      }

      const pricesInEur = priceData.data.map((entry: CoinCapPriceEntry) => ({
        time: entry.time,
        price:
          Math.round(parseFloat(entry.priceUsd) * exchangeRate * 100) / 100,
      }));

      console.info(
        `Using live data for ${cryptoConfig.name}, converted to EUR`
      );

      return {
        cryptoId,
        prices: pricesInEur,
        dataSource: "live" as const,
        exchangeRate,
      };
    } catch (error) {
      console.error(`Error fetching ${cryptoId} data:`, error);
      return rejectWithValue(`Failed to fetch ${cryptoId} prices`);
    }
  }
);

export const fetchPrices = createAsyncThunk(
  "price/fetchPrices",
  async (_, { dispatch, getState }) => {
    const state = getState() as { price: PriceState };
    const activeCrypto = state.price.activeCrypto;
    return dispatch(fetchCryptoPrices({ cryptoId: activeCrypto }));
  }
);

export const fetchAllActiveCryptos = createAsyncThunk(
  "price/fetchAllActiveCryptos",
  async (_, { dispatch }) => {
    const activeCryptos = Object.entries(SUPPORTED_CRYPTOS)
      .filter(([_, config]) => config.isActive)
      .map(([id]) => id as CryptoId);

    const promises = activeCryptos.map((cryptoId) =>
      dispatch(fetchCryptoPrices({ cryptoId }))
    );

    return Promise.all(promises);
  }
);

const priceSlice = createSlice({
  name: "price",
  initialState,
  reducers: {
    setActiveCrypto: (state, action: PayloadAction<CryptoId>) => {
      state.activeCrypto = action.payload;
    },

    clearCryptoError: (state, action: PayloadAction<CryptoId>) => {
      state.cryptos[action.payload].error = null;
    },

    clearAllErrors: (state) => {
      state.globalError = null;
      Object.values(state.cryptos).forEach((crypto) => {
        crypto.error = null;
      });
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCryptoPrices.pending, (state, action) => {
        const { cryptoId } = action.meta.arg;
        state.cryptos[cryptoId].loading = true;
        state.cryptos[cryptoId].error = null;
      })
      .addCase(
        fetchCryptoPrices.fulfilled,
        (state, action: PayloadAction<FetchPricesResult>) => {
          const { cryptoId, prices, dataSource, exchangeRate } = action.payload;
          state.cryptos[cryptoId].prices = prices;
          state.cryptos[cryptoId].loading = false;
          state.cryptos[cryptoId].lastUpdated = Date.now();
          state.dataSource = dataSource;
          state.exchangeRate = exchangeRate;
        }
      )
      .addCase(fetchCryptoPrices.rejected, (state, action) => {
        const { cryptoId } = action.meta.arg;
        state.cryptos[cryptoId].loading = false;
        state.cryptos[cryptoId].error = action.payload as string;
      })

      .addCase(fetchAllActiveCryptos.pending, (state) => {
        state.globalLoading = true;
        state.globalError = null;
      })
      .addCase(fetchAllActiveCryptos.fulfilled, (state) => {
        state.globalLoading = false;
      })
      .addCase(fetchAllActiveCryptos.rejected, (state, action) => {
        state.globalLoading = false;
        state.globalError =
          action.error.message || "Failed to fetch crypto prices";
      });
  },
});

export const selectCurrentCryptoPrices = (state: { price: PriceState }) => {
  const activeCrypto = state.price.activeCrypto;
  return state.price.cryptos[activeCrypto].prices;
};

export const selectCurrentCryptoLoading = (state: { price: PriceState }) => {
  const activeCrypto = state.price.activeCrypto;
  return state.price.cryptos[activeCrypto].loading;
};

export const selectCurrentCryptoError = (state: { price: PriceState }) => {
  const activeCrypto = state.price.activeCrypto;
  return state.price.cryptos[activeCrypto].error;
};

export const selectCryptoPrices =
  (cryptoId: CryptoId) => (state: { price: PriceState }) => {
    return state.price.cryptos[cryptoId].prices;
  };

export const { setActiveCrypto, clearCryptoError, clearAllErrors } =
  priceSlice.actions;
export default priceSlice.reducer;
