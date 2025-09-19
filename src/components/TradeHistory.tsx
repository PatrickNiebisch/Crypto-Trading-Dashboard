"use client";

import React from "react";
import { useSelector } from "react-redux";
import { RootState } from "../app/store";
import "../styles/components/tradehistory.css";

const TradeHistory: React.FC = () => {
  const tradeHistory = useSelector(
    (state: RootState) => state.wallet.tradeHistory
  );
  const formatDate = (date: Date): string => {
    return new Intl.DateTimeFormat("de-DE", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(date));
  };
  return (
    <div className="trade-history">
      <h3 className="trade-history-title">Trade history</h3>
      <table className="trade-history-table">
        <thead>
          <tr>
            <th>Action</th>
            <th>Amount (BTC)</th>
            <th>Amount (€)</th>
            <th>Time</th>
          </tr>
        </thead>
        <tbody>
          {tradeHistory.map((trade, index) => (
            <tr key={index} className="trade-history-row">
              <td>{trade.action}</td>
              <td>
                {trade.amountBTC > 0
                  ? `+${trade.amountBTC.toFixed(8)} BTC`
                  : `${trade.amountBTC.toFixed(8)} BTC`}
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
