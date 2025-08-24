import React from "react";
import { useFollowerTargetRef } from "./FollowerProvider";

interface MovingTargetProps {
  id: string;
  primaryColor: string;
  secondaryColor: string;
}

export function MovingTarget({ id, primaryColor, secondaryColor }: MovingTargetProps) {
  // Each target registers itself with the follower system
  const followerRef = useFollowerTargetRef<HTMLDivElement>(id);
  
  return (
    <div 
      ref={followerRef} 
      className="target-hover"
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
        transition: "all 0.3s ease-in-out",
      }}
    >
      Target {id}
    </div>
  );
}
