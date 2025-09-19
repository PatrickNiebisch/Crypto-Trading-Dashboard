"use client";

import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "../app/store";
import { buyBTC, sellBTC } from "../features/walletSlice";
import "../styles/components/tradedialog.css";

interface TradeDialogProps {
  onClose: () => void;
}

const TradeDialog: React.FC<TradeDialogProps> = ({ onClose }) => {
  const dispatch = useDispatch<AppDispatch>();
  const currentPrice = useSelector((state: RootState) =>
    state.price.prices.length > 0 ? state.price.prices[state.price.prices.length - 1].price : 0
  );
  const wallet = useSelector((state: RootState) => state.wallet);

  const [eurAmount, setEurAmount] = useState<number | "">("");
  const [btcAmount, setBtcAmount] = useState<number | "">("");

  const handleEurChange = (value: string) => {
    const eur = parseFloat(value);
    setEurAmount(value === "" ? "" : eur);
    setBtcAmount(value === "" || currentPrice === 0 ? "" : parseFloat((eur / currentPrice).toFixed(8)));
  };

  const handleBtcChange = (value: string) => {
    const btc = parseFloat(value);
    setBtcAmount(value === "" ? "" : btc);
    setEurAmount(value === "" || currentPrice === 0 ? "" : parseFloat((btc * currentPrice).toFixed(2)));
  };

  const handleBuy = () => {
    if (eurAmount && btcAmount) {
      if (eurAmount > wallet.eur) {
        alert("Insufficient EUR balance.");
        return;
      }
      dispatch(buyBTC({ btc: btcAmount, eur: eurAmount }));
      onClose();
    } else {
      alert("Please enter a valid amount.");
    }
  };

  const handleSell = () => {
    if (eurAmount && btcAmount) {
      if (btcAmount > wallet.btc) {
        alert("Insufficient BTC balance.");
        return;
      }
      dispatch(sellBTC({ btc: btcAmount, eur: eurAmount }));
      onClose();
    } else {
      alert("Please enter a valid amount.");
    }
  };

  return (
    <div className="trade-dialog-overlay">
      <div className="trade-dialog">
        <button className="trade-dialog-close" onClick={onClose}>
          ✕
        </button>
        <h3 className="trade-dialog-title">Trade Bitcoin</h3>
        <div className="mb-4">
          <label className="trade-dialog-label">Amount in EUR</label>
          <input
            type="number"
            className="trade-dialog-input"
            value={eurAmount}
            onChange={(e) => handleEurChange(e.target.value)}
            placeholder="Enter EUR amount"
          />
        </div>
        <div className="mb-4">
          <label className="trade-dialog-label">Amount in BTC</label>
          <input
            type="number"
            className="trade-dialog-input"
            value={btcAmount}
            onChange={(e) => handleBtcChange(e.target.value)}
            placeholder="Enter BTC amount"
          />
        </div>
        <p className="text-sm text-gray-500">
          Current BTC Price: {currentPrice > 0 ? `€${currentPrice.toFixed(2)}` : "Loading..."}
        </p>
        <div className="trade-dialog-buttons">
          <button className="trade-dialog-button-buy" onClick={handleBuy}>
            Buy
          </button>
          <button className="trade-dialog-button-sell" onClick={handleSell}>
            Sell
          </button>
        </div>
      </div>
    </div>
  );
};

export default TradeDialog;
