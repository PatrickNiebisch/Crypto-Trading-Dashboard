"use client";

import React from "react";
import { useSelector } from "react-redux";
import { RootState } from "../app/store";
import "../styles/components/tradehistory.css";

const TradeHistory: React.FC = () => {
  const tradeHistory = useSelector(
    (state: RootState) => state.wallet.tradeHistory
  );
  const formatDate = (timestamp: number): string => {
    return new Intl.DateTimeFormat("de-DE", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(timestamp));
  };
  return (
    <div className="trade-history">
      <table className="trade-history-table">
        <tbody>
          {tradeHistory
            .slice()
            .reverse()
            .map((trade, index) => (
              <tr key={index} className="trade-history-row">
                <td>{trade.action}</td>
                <td>
                  {trade.amountBTC > 0
                    ? `+${trade.amountBTC.toFixed(4)} BTC`
                    : `${trade.amountBTC.toFixed(4)} BTC`}
                </td>
                <td>
                  {trade.amountEUR > 0
                    ? `+${trade.amountEUR.toFixed(2)} €`
                    : `${trade.amountEUR.toFixed(2)} €`}
                </td>
                <td>{formatDate(trade.time)}</td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
};

export default TradeHistory;
