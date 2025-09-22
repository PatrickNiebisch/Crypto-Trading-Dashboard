"use client";

import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "../../app/store";
import { fetchPrices } from "../../features/priceSlice";
import "../../styles/components/general.css";

import PriceDisplay from "./PriceDisplay";
import PortfolioStats from "./PortfolioStats";
import ChartDisplay from "./ChartDisplay";

const PriceChart: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { prices, error } = useSelector((state: RootState) => state.price);

  const { btc, eur, tradeHistory } = useSelector(
    (state: RootState) => state.wallet
  );

  const [chartData, setChartData] = useState<{ time: number; price: number }[]>(
    []
  );
  const [_, setLastUpdated] = useState<string>("");

  const getCurrentPrice = (state: RootState): number => {
    return state.price.prices.length > 0
      ? state.price.prices[state.price.prices.length - 1].price
      : 0;
  };

  const currentPrice = useSelector(getCurrentPrice);

  useEffect(() => {
    dispatch(fetchPrices());
  }, [dispatch]);

  useEffect(() => {
    if (prices.length > 0) {
      setChartData(prices);
      setLastUpdated(new Date().toLocaleTimeString());
    }
  }, [prices]);

  useEffect(() => {
    const interval = setInterval(() => {
      dispatch(fetchPrices());
    }, 10000);

    return () => clearInterval(interval);
  }, [dispatch]);

  const highestPrice =
    chartData.length > 0 ? Math.max(...chartData.map((p) => p.price)) : null;
  const lowestPrice =
    chartData.length > 0 ? Math.min(...chartData.map((p) => p.price)) : null;

  const get24hStats = () => {
    if (chartData.length < 2) return null;

    const oldestPrice = chartData[0].price;
    const newestPrice = chartData[chartData.length - 1].price;
    const change = newestPrice - oldestPrice;
    const changePercent = (change / oldestPrice) * 100;

    return {
      change,
      changePercent,
      isPositive: change >= 0,
    };
  };

  const getPortfolioStats = () => {
    if (!currentPrice || tradeHistory.length === 0) return null;

    let totalInvested = 0;
    let totalBtcBought = 0;

    tradeHistory.forEach((trade) => {
      if (trade.action === "Buy") {
        totalInvested += trade.amountEUR;
        totalBtcBought += trade.amountBTC;
      } else {
        const soldRatio =
          trade.amountBTC / (totalBtcBought > 0 ? totalBtcBought : 1);
        totalInvested -= totalInvested * soldRatio;
        totalBtcBought -= trade.amountBTC;
      }
    });

    const currentValue = btc * currentPrice;
    const totalProfit = currentValue - totalInvested;
    const profitPercent =
      totalInvested > 0 ? (totalProfit / totalInvested) * 100 : 0;
    const averageBuyPrice = totalBtcBought > 0 ? totalInvested / btc : 0;

    return {
      currentValue,
      totalInvested,
      averageBuyPrice,
      totalProfit,
      profitPercent,
      isProfit: totalProfit >= 0,
    };
  };

  const getChartBounds = () => {
    if (highestPrice !== null && lowestPrice !== null) {
      const range = highestPrice - lowestPrice;
      return {
        upperBound: highestPrice + range * 0.05,
        lowerBound: lowestPrice - range * 0.05,
      };
    }
    return {
      upperBound: 150000,
      lowerBound: 100000,
    };
  };

  const stats = get24hStats();
  const portfolioStats = getPortfolioStats();
  const { upperBound, lowerBound } = getChartBounds();

  return (
    <div className="main-view">
      {error ? (
        <div className="error-message">{error}</div>
      ) : (
        <div className="compact-layout">
          <div className="text-3xl font-bold text-gray-900 text-center mb-2">
            BTC
          </div>

          <div className="price-portfolio-container">
            <PriceDisplay
              currentPrice={currentPrice}
              stats={stats}
              highestPrice={highestPrice}
              lowestPrice={lowestPrice}
            />

            {portfolioStats && (
              <PortfolioStats portfolioStats={portfolioStats} />
            )}
          </div>

          <ChartDisplay
            chartData={chartData}
            upperBound={upperBound}
            lowerBound={lowerBound}
          />
        </div>
      )}
    </div>
  );
};

export default PriceChart;
