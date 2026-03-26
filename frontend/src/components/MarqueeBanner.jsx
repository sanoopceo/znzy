import React from 'react';
import './MarqueeBanner.css';

const messages = [
  "⚡ ALL ORDERS DELIVERED WITHIN 7 BUSINESS DAYS",
  "✦ FREE SHIPPING ON ORDERS OVER ₹5000",
  "✦ PREMIUM FASHION. CULT AESTHETIC.",
  "✦ SECURE CHECKOUT — 100% SAFE PAYMENTS",
  "✦ NEW DROPS EVERY WEEK — FOLLOW @ZNZY",
  "⚡ EASY 14-DAY RETURNS",
  "✦ MADE TO OUTLAST EVERY TREND",
];

const MarqueeBanner = () => {
  // Triplicate for seamless infinite loop
  const items = [...messages, ...messages, ...messages];
  return (
    <div className="marquee-container">
      <div className="marquee-content">
        {items.map((msg, idx) => (
          <React.Fragment key={idx}>
            <span className="marquee-text">{msg}</span>
            <span className="marquee-dot">◆</span>
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default MarqueeBanner;
