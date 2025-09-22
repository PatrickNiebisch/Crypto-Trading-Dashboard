import React from "react";
import "../../styles/components/general.css";

interface PortfolioStatsProps {
  portfolioStats: {
    totalProfit: number;
    isProfit: boolean;
  };
}

const PortfolioStats: React.FC<PortfolioStatsProps> = ({ portfolioStats }) => {
  return (
    <div className="pnl-display">
      <span
        className={`pnl-value ${portfolioStats.isProfit ? "profit" : "loss"}`}
      >
        PnL: {portfolioStats.isProfit ? "+" : ""}
        {portfolioStats.totalProfit.toFixed(1)} €
      </span>
    </div>
  );
};

export default PortfolioStats;
