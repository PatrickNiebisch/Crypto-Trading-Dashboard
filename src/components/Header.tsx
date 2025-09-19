"use client";

import React from "react";

const Header: React.FC = () => {
  return (
    <header className="header">
      <div className="header-logo">CryptoTracker</div>
      <div className="header-balance">
        <p>Available: <span>0.12345678 BTC</span></p>
        <p>224,01 €</p>
      </div>
    </header>
  );
};

export default Header;
