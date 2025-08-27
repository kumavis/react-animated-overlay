import React, { useEffect, useRef, useState } from "react";
import { FollowPortal } from "./FollowerSystem";


// Target component that represents the virtual position
const VirtualTarget: React.FC<{ virtualPosition: { x: number, y: number } }> = ({ virtualPosition }) => {
  const size = 20;
  return (
    <div style={{
      position: 'fixed',
      left: virtualPosition.x - size / 2,
      top: virtualPosition.y - size / 2,
      width: `${size}px`,
      height: `${size}px`,
      background: '#007bff',
      borderRadius: '50%',
      border: '3px solid white',
      boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
      zIndex: 5,
      pointerEvents: 'none',
    }} />
  );
};

/**
 * A demo showing a floating element that follows a virtual position with inertial animation.
 * Uses the FollowerSystem with inertial mode enabled.
 */
export default function InertialFloatingDemo() {
  const [virtualPosition, setVirtualPosition] = useState({ x: 100, y: 100 });
  const containerRef = useRef<HTMLDivElement>(null);

  const handleClick = (event: React.MouseEvent) => {
    setVirtualPosition({
      x: event.clientX,
      y: event.clientY,
    });
  };

  return (
    <div className="inertial-demo" style={{
      height: '100%',
      display: 'flex',
      flexDirection: 'column'
    }}>

      <div
        ref={containerRef}
        className="demo-area"
        onClick={handleClick}
        style={{
          flex: 1,
          position: 'relative',
          cursor: 'crosshair',
          background: 'linear-gradient(45deg, #f0f0f0 25%, transparent 25%), linear-gradient(-45deg, #f0f0f0 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #f0f0f0 75%), linear-gradient(-45deg, transparent 75%, #f0f0f0 75%)',
          backgroundSize: '20px 20px',
          backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px'
        }}
      >
        {/* Virtual target position indicator */}
        <VirtualTarget virtualPosition={virtualPosition} />

        {/* Follower that follows the virtual target with inertia */}
        <FollowPortal 
          id="inertial-follower" 
          useInertial={true}
          altTarget={virtualPosition}
        >
          <div
            className="inertial-floating-panel"
            style={{
              background: 'white',
              border: '2px solid #28a745',
              borderRadius: '12px',
              padding: '16px',
              boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
              minWidth: '200px',
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#28a745' }}>
              Following with inertia! 🚀
            </div>
            <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
              Click anywhere to move the target
            </div>
            <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
              Virtual Pos: ({Math.round(virtualPosition.x)}, {Math.round(virtualPosition.y)})
            </div>
          </div>
        </FollowPortal>
      </div>
    </div>
  );
}
