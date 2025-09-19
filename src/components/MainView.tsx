"use client";

import React from "react";
import { Line } from "react-chartjs-2";
import { useSelector } from "react-redux";
import { RootState } from "../app/store";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend);

const MainView: React.FC = () => {
  const prices = useSelector((state: RootState) => state.price.prices);

  const chartData = {
    labels: prices.map((price) => price.time), 
    datasets: [
      {
        label: "BTC price",
        data: prices.map((price) => price.price), 
        borderColor: "#2563eb",
        backgroundColor: "rgba(37, 99, 235, 0.2)",
        borderWidth: 2,
        tension: 0.4, 
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        enabled: true, 
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
      },
    },
  };

  return (
    <div className="main-view">
      <h1 className="main-view-title">BTC</h1>
      <h2 className="main-view-price">69.820,12 €</h2>
      <p className="main-view-pnl">PnL: +12,3 €</p>
      <div className="main-view-chart">
        <Line data={chartData} options={chartOptions} />
      </div>
    </div>
  );
};

export default MainView;
