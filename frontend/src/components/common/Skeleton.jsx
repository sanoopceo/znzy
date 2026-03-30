import React from "react";

export const Skeleton = ({ className, width, height, style }) => {
  return (
    <div
      className={`skeleton-base ${className || ""}`}
      style={{
        width: width || "100%",
        height: height || "20px",
        backgroundColor: "#e2e8f0",
        borderRadius: "4px",
        animation: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        ...style,
      }}
    />
  );
};

export const CardSkeleton = () => {
  return (
    <div style={{ padding: '1rem', border: '1px solid #f0f0f0', borderRadius: '12px', background: '#fff' }}>
      <Skeleton height="200px" style={{ marginBottom: '1rem' }} />
      <Skeleton width="80%" style={{ marginBottom: '0.5rem' }} />
      <Skeleton width="40%" />
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: .5; }
        }
      `}</style>
    </div>
  );
};
