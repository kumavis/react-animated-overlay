import React, { useState, useEffect, useRef } from "react";
import { FollowerProvider } from "./components/FollowerProvider";
import { MovingTarget } from "./components/MovingTarget";
import "./App.css";

interface Target {
  id: string;
  primaryColor: string;
  secondaryColor: string;
  quadrant: number;
  nextMoveTime: number;
}

// Predefined color palette for targets
const COLOR_PALETTE = [
  { primary: "#cde4ff", secondary: "#4a90e2" }, // Blue
  { primary: "#ffcdcd", secondary: "#e24a4a" }, // Red
  { primary: "#cdffcd", secondary: "#4ae24a" }, // Green
  { primary: "#ffcdff", secondary: "#e24ae2" }, // Purple
  { primary: "#ffe4cd", secondary: "#e2904a" }, // Orange
  { primary: "#e4cdff", secondary: "#904ae2" }, // Violet
  { primary: "#cdffe4", secondary: "#4ae290" }, // Mint
  { primary: "#ffffe4", secondary: "#e2e24a" }, // Yellow
];

function AppContent() {
  const [targets, setTargets] = useState<Target[]>(() => {
    const now = Date.now();
    return [
      { 
        id: "1", 
        primaryColor: COLOR_PALETTE[0].primary, 
        secondaryColor: COLOR_PALETTE[0].secondary,
        quadrant: Math.floor(Math.random() * 4), 
        nextMoveTime: now + Math.random() * 3000 
      },
      { 
        id: "2", 
        primaryColor: COLOR_PALETTE[1].primary, 
        secondaryColor: COLOR_PALETTE[1].secondary,
        quadrant: Math.floor(Math.random() * 4), 
        nextMoveTime: now + Math.random() * 3000 
      },
    ];
  });

  // Add a new target
  const addTarget = () => {
    const now = Date.now();
    const newId = (targets.length + 1).toString();
    const colorIndex = targets.length % COLOR_PALETTE.length;
    
    const newTarget: Target = {
      id: newId,
      primaryColor: COLOR_PALETTE[colorIndex].primary,
      secondaryColor: COLOR_PALETTE[colorIndex].secondary,
      quadrant: Math.floor(Math.random() * 4),
      nextMoveTime: now + Math.random() * 3000
    };
    
    setTargets(prev => [...prev, newTarget]);
  };

  // Remove the last target
  const removeTarget = () => {
    if (targets.length > 1) { // Keep at least one target
      setTargets(prev => prev.slice(0, -1));
    }
  };

  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const checkAndMoveTargets = () => {
      const now = Date.now();
      setTargets(prevTargets => 
        prevTargets.map(target => {
          if (now >= target.nextMoveTime) {
            // Move to a different random quadrant and set new random move time
            let newQuadrant;
            do {
              newQuadrant = Math.floor(Math.random() * 4);
            } while (newQuadrant === target.quadrant);
            
            return {
              ...target,
              quadrant: newQuadrant,
              nextMoveTime: now + 2000 + Math.random() * 4000 // Random interval between 2-6 seconds
            };
          }
          return target;
        })
      );
    };

    // Check every 100ms for targets that need to move
    intervalRef.current = setInterval(checkAndMoveTargets, 100);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const renderQuadrant = (index: number) => {
    const quadrantTargets = targets.filter(target => target.quadrant === index);
    
    return (
      <div
        key={index}
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          border: "2px solid #ddd",
          position: "relative",
          minHeight: "50vh",
          transition: "all 0.3s ease-in-out",
        }}
      >
        <div style={{ textAlign: "center" }}>
          {quadrantTargets.map(target => (
            <div key={target.id} style={{ margin: "10px 0" }}>
              <MovingTarget id={target.id} primaryColor={target.primaryColor} secondaryColor={target.secondaryColor} />
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Dynamic Moving Targets Demo</h1>
        <p>Targets move to different quadrants at random intervals. Each target has its own follower!</p>
        
        <div className="target-controls">
          <button 
            onClick={addTarget}
            className="control-button add-button"
            disabled={targets.length >= COLOR_PALETTE.length}
          >
            + Add Target ({targets.length}/{COLOR_PALETTE.length})
          </button>
          <button 
            onClick={removeTarget}
            className="control-button remove-button"
            disabled={targets.length <= 1}
          >
            - Remove Target
          </button>
        </div>
      </header>
      
      <main className="quadrant-container">
        <div className="quadrant-row">
          {renderQuadrant(0)}
          {renderQuadrant(1)}
        </div>
        <div className="quadrant-row">
          {renderQuadrant(2)}
          {renderQuadrant(3)}
        </div>
      </main>
      
      <footer className="App-footer">
        <p>{targets.length} targets moving independently • Each has its own follower</p>
        <div style={{ marginTop: "10px" }}>
          {targets.map(target => {
            const timeUntilMove = Math.max(0, target.nextMoveTime - Date.now());
            const secondsUntilMove = Math.ceil(timeUntilMove / 1000);
            return (
              <span 
                key={target.id}
                style={{ 
                  margin: "0 10px",
                  padding: "5px 10px",
                  background: target.primaryColor,
                  borderRadius: "15px",
                  fontSize: "12px",
                  fontWeight: "bold"
                }}
              >
                {target.id}: Q{target.quadrant + 1} ({secondsUntilMove}s)
              </span>
            );
          })}
        </div>
      </footer>
    </div>
  );
}

function App() {
  // Function to get the follower color for a specific target
  const getFollowerColor = (targetId: string) => {
    const targetIndex = parseInt(targetId) - 1;
    const colorIndex = targetIndex % COLOR_PALETTE.length;
    return COLOR_PALETTE[colorIndex].primary;
  };
  
  return (
    <FollowerProvider followerColor={getFollowerColor}>
      <AppContent />
    </FollowerProvider>
  );
}

export default App;
