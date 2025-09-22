import React from "react";
import "../../styles/components/general.css";

interface PriceDisplayProps {
  currentPrice: number | null;
  stats: {
    change: number;
    changePercent: number;
    isPositive: boolean;
  } | null;
  highestPrice: number | null;
  lowestPrice: number | null;
}

const PriceDisplay: React.FC<PriceDisplayProps> = ({ currentPrice, stats }) => {
  return (
    <div className="price-section">
      <div className="main-view-price">
        {currentPrice
          ? `€${currentPrice.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}`
          : "N/A"}
      </div>

      {stats && (
        <div
          className={`price-change ${
            stats.isPositive ? "positive" : "negative"
          }`}
        >
          <span className="change-icon">{stats.isPositive ? "↗" : "↘"}</span>
          <span>
            €
            {Math.abs(stats.change).toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </span>
          <span>({stats.changePercent.toFixed(2)}%)</span>
          <span className="timeframe">24h</span>
        </div>
      )}
    </div>
  );
};

export default PriceDisplay;
