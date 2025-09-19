"use client";

import React from "react";
import { useSelector } from "react-redux";
import { RootState } from "../app/store";
import "../styles/components/header.css";

const Header: React.FC = () => {
  const balance = useSelector((state: RootState) => state.wallet);

  return (
    <header className="header">
      <div className="header-logo">🐘 CryptoTracker</div>
      <div className="header-balance">
        <p>
          Available: <span>{balance.btc.toFixed(8)} BTC</span>
        </p>
        <p>{balance.eur.toFixed(2)} €</p>
      </div>
    </header>
  );
};

export default Header;
