"use client";

import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "../app/store";
import { buyBTC, sellBTC } from "../features/walletSlice";
import "../styles/components/tradedialog.css";

interface TradeDialogProps {
  onClose: () => void;
}

const TradeDialog: React.FC<TradeDialogProps> = ({ onClose }) => {
  const dispatch = useDispatch<AppDispatch>();

  const getCurrentPrice = (state: RootState): number => {
    return state.price.prices.length > 0
      ? state.price.prices[state.price.prices.length - 1].price
      : 0;
  };

  const currentPrice = useSelector(getCurrentPrice);
  const wallet = useSelector((state: RootState) => state.wallet);

  const [eurAmount, setEurAmount] = useState<string>("");
  const [btcAmount, setBtcAmount] = useState<string>("");
  const [isEurEditing, setIsEurEditing] = useState(false);
  const [isBtcEditing, setIsBtcEditing] = useState(false);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    if (isEurEditing && eurAmount && currentPrice > 0) {
      const eurValue = parseFloat(eurAmount);
      if (!isNaN(eurValue)) {
        const btcValue = (eurValue / currentPrice).toFixed(8);
        setBtcAmount(btcValue);
        setError("");
      }
    }
  }, [eurAmount, isEurEditing, currentPrice]);

  useEffect(() => {
    if (isBtcEditing && btcAmount && currentPrice > 0) {
      const btcValue = parseFloat(btcAmount);
      if (!isNaN(btcValue)) {
        const eurValue = (btcValue * currentPrice).toFixed(2);
        setEurAmount(eurValue);
        setError("");
      }
    }
  }, [btcAmount, isBtcEditing, currentPrice]);

  const handleEurChange = (value: string) => {
    setEurAmount(value);
    setIsEurEditing(true);
    setIsBtcEditing(false);
    setError("");
  };

  const handleBtcChange = (value: string) => {
    setBtcAmount(value);
    setIsBtcEditing(true);
    setIsEurEditing(false);
    setError("");
  };

  const handleBuy = () => {
    const eurValue = parseFloat(eurAmount);
    const btcValue = parseFloat(btcAmount);

    if (eurAmount && btcAmount && !isNaN(eurValue) && !isNaN(btcValue)) {
      if (eurValue > wallet.eur) {
        setError("Insufficient EUR balance.");
        return;
      }

      dispatch(
        buyBTC({
          btc: btcValue,
          eur: eurValue,
          price: currentPrice,
        })
      );
      onClose();
    } else {
      setError("Please enter a valid amount.");
    }
  };

  const handleSell = () => {
    const eurValue = parseFloat(eurAmount);
    const btcValue = parseFloat(btcAmount);

    if (eurAmount && btcAmount && !isNaN(eurValue) && !isNaN(btcValue)) {
      if (btcValue > wallet.btc) {
        setError("Insufficient BTC balance.");
        return;
      }

      dispatch(
        sellBTC({
          btc: btcValue,
          eur: eurValue,
          price: currentPrice,
        })
      );
      onClose();
    } else {
      setError("Please enter a valid amount.");
    }
  };

  return (
    <div className="trade-dialog-overlay" onClick={onClose}>
      <div className="trade-dialog-modern" onClick={(e) => e.stopPropagation()}>
        <div className="trade-dialog-header">
          <button className="trade-dialog-close-modern" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="trade-dialog-content">
          <div className="trade-input-group">
            <div className="trade-input-container">
              <input
                type="number"
                className="trade-input-modern"
                value={eurAmount}
                onChange={(e) => handleEurChange(e.target.value)}
                placeholder="220.23"
              />
              <span className="trade-currency-label">EUR</span>
            </div>
          </div>

          <div className="trade-input-group">
            <div className="trade-input-container">
              <input
                type="number"
                className="trade-input-modern"
                value={btcAmount}
                onChange={(e) => handleBtcChange(e.target.value)}
                placeholder="0.0023451"
              />
              <span className="trade-currency-label">BTC</span>
            </div>
          </div>

           {error && (
            <div className="trade-error-message">
              {error}
            </div>
          )}
          
          <div className="trade-dialog-buttons-modern">
            <button
              className="trade-button-modern buy-button"
              onClick={handleBuy}
            >
              Buy
            </button>
            <button
              className="trade-button-modern sell-button"
              onClick={handleSell}
            >
              Sell
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TradeDialog;
