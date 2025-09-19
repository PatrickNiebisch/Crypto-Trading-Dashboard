"use client";

import TradeHistory from "@/components/TradeHistory";
import Header from "../components/Header";
import PriceChart from "../components/PriceChart";
import TradeDialog from "@/components/TradeDialog";
import { useState } from "react";

const Home: React.FC = () => {
  const [isTradeDialogOpen, setTradeDialogOpen] = useState(false);

  return (
    <div>
      <Header />
      <PriceChart />
      <TradeHistory />
      {isTradeDialogOpen && (
        <TradeDialog onClose={() => setTradeDialogOpen(false)} />
      )}
      <button
        className="fixed bottom-4 right-4 bg-blue-500 text-white px-4 py-2 rounded-lg"
        onClick={() => setTradeDialogOpen(true)}
      >Trade</button>
    </div>
  );
};

export default Home;
