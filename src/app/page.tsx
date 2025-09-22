"use client";

import TradeHistory from "@/components/TradeHistory";
import Header from "../components/Header";
import PriceChart from "../components/pricechart/PriceChart";
import TradeDialog from "@/components/TradeDialog";
import { useState } from "react";

const Home: React.FC = () => {
  const [isTradeDialogOpen, setTradeDialogOpen] = useState(false);

  return (
    <div>
      <Header />
      <PriceChart />
      <div className="px-4 mb-6">
        <button
          className="w-full py-4 bg-slate-800 text-white text-lg font-semibold rounded-lg shadow-lg hover:bg-slate-700 transition-colors"
          onClick={() => setTradeDialogOpen(true)}
        >
          Trade
        </button>
      </div>
      <TradeHistory />
      {isTradeDialogOpen && (
        <TradeDialog onClose={() => setTradeDialogOpen(false)} />
      )}
    </div>
  );
};

export default Home;
