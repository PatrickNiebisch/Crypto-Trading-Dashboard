"use client";

import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "../app/store";
import { fetchPrices } from "../features/priceSlice";
import { Line } from "react-chartjs-2";
import "../styles/components/pricechart.css";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  Filler,
  TooltipItem,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  Filler
);

const PriceChart: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { prices, error } = useSelector((state: RootState) => state.price);

  const [chartData, setChartData] = useState<{ time: number; price: number }[]>(
    []
  );
  const [lastUpdated, setLastUpdated] = useState<string>("");

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

  let upperBound: number;
  let lowerBound: number;

  if (highestPrice !== null && lowestPrice !== null) {
    const range = highestPrice - lowestPrice;
    upperBound = highestPrice + range * 0.05;
    lowerBound = lowestPrice - range * 0.05;
  } else {
    upperBound = 150000;
    lowerBound = 100000;
  }

  const data = {
    labels: chartData.map((point) =>
      new Date(point.time).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })
    ),
    datasets: [
      {
        label: "BTC Price",
        data: chartData.map((point) => point.price),
        borderColor: "#14b8a6",
        backgroundColor: "rgba(20, 184, 166, 0.2)",
        borderWidth: 2,
        tension: 0.4,
        fill: true,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        enabled: true,
        callbacks: {
          label: (context: TooltipItem<"line">) => {
            const value = context.raw as number;
            return `€${value.toFixed(2)}`;
          },
        },
      },
    },
    scales: {
      x: {
        ticks: {
          color: "#6b7280",
        },
      },
      y: {
        ticks: {
          color: "#6b7280",
        },
        suggestedMin: lowerBound,
        suggestedMax: upperBound,
      },
    },
    elements: {
      point: {
        radius: 0,
      },
    },
  };

  return (
    <div className="main-view">
      <h1 className="main-view-title">BTC Trading</h1>
      {error ? (
        <p className="text-red-500">{error}</p>
      ) : (
        <>
          <h2 className="main-view-price">
            {chartData.length > 0 ? `€${currentPrice!.toFixed(2)}` : "N/A"}
          </h2>
          <p className="text-sm text-gray-500">Last updated: {lastUpdated}</p>
          <div className="main-view-chart">
            <Line data={data} options={options} />
          </div>
        </>
      )}
    </div>
  );
};

export default PriceChart;
