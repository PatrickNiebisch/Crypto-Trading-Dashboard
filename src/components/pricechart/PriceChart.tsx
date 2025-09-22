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
  const { btc, tradeHistory } = useSelector((state: RootState) => state.wallet);

  const [chartData, setChartData] = useState<{ time: number; price: number }[]>(
    []
  );
  const [_, setLastUpdated] = useState<string>("");

  const getPortfolioData = () => {
    const buyTrades = tradeHistory.filter((trade) => trade.action === "Buy");

    if (buyTrades.length === 0) {
      return {
        btcHoldings: btc,
        averageBuyPrice: 0,
        totalInvested: 0,
      };
    }

    const totalEurSpent = buyTrades.reduce(
      (sum, trade) => sum + Math.abs(trade.amountEUR),
      0
    );
    const totalBtcBought = buyTrades.reduce(
      (sum, trade) => sum + trade.amountBTC,
      0
    );
    const averageBuyPrice =
      totalBtcBought > 0 ? totalEurSpent / totalBtcBought : 0;

    return {
      btcHoldings: btc,
      averageBuyPrice,
      totalInvested: totalEurSpent,
    };
  };

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
  const currentPrice =
    chartData.length > 0 ? chartData[chartData.length - 1].price : null;

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
    if (!currentPrice) return null;

    const portfolio = getPortfolioData();
    const currentValue = portfolio.btcHoldings * currentPrice;
    const totalProfit = currentValue - portfolio.totalInvested;
    const profitPercent =
      portfolio.totalInvested > 0
        ? (totalProfit / portfolio.totalInvested) * 100
        : 0;

    return {
      portfolio,
      currentValue,
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
        <>
          <div className="text-2xl font-bold text-gray-900 text-center">
            BTC
          </div>
          <div className="price-portfolio-container text-center">
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
        </>
      )}
    </div>
  );
};

export default PriceChart;
