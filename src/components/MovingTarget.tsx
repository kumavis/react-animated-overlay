import React, { CSSProperties, useCallback } from "react";
import { useFollowerTargetRef } from "./FollowerProvider";

interface MovingTargetProps {
  id: string;
  primaryColor: string;
  secondaryColor: string;
}

export function MovingTarget({ id, primaryColor, secondaryColor }: MovingTargetProps) {

  const renderFollower = useCallback(() => {
    return (
      <div
        style={{
          height: 96,
          boxSizing: "border-box",
          background: primaryColor,
          opacity: 0.8,
          borderRadius: 12,
          padding: 12,
          pointerEvents: "none",
          fontWeight: "bold",
        }}
      >Follower {id}</div>
    )
  }, [id, primaryColor]);

  // Each target registers itself with the follower system
  const followerRef = useFollowerTargetRef<HTMLDivElement>(id, renderFollower);
  
  return (
    <div 
      ref={followerRef}
      style={{
        width: 180, 
        height: 90,
        background: "transparent",
        border: `3px solid ${secondaryColor}`,
        borderRadius: 8,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "14px",
        fontWeight: "bold",
        color: "#333",
        boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
      }}
    >
      Target {id}
    </div>
  );
}
