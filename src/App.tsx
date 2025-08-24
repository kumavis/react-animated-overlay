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

function AppContent({ getFollowerColor }: { getFollowerColor: (targetId: string) => string }) {
  const [targets, setTargets] = useState<Target[]>(() => {
    const now = Date.now();
    return [
      { 
        id: "A", 
        primaryColor: "#cde4ff", 
        secondaryColor: "#4a90e2",
        quadrant: Math.floor(Math.random() * 4), 
        nextMoveTime: now + Math.random() * 3000 
      },
      { 
        id: "B", 
        primaryColor: "#ffcdcd", 
        secondaryColor: "#e24a4a",
        quadrant: Math.floor(Math.random() * 4), 
        nextMoveTime: now + Math.random() * 3000 
      },
      { 
        id: "C", 
        primaryColor: "#cdffcd", 
        secondaryColor: "#4ae24a",
        quadrant: Math.floor(Math.random() * 4), 
        nextMoveTime: now + Math.random() * 3000 
      },
      { 
        id: "D", 
        primaryColor: "#ffcdff", 
        secondaryColor: "#e24ae2",
        quadrant: Math.floor(Math.random() * 4), 
        nextMoveTime: now + Math.random() * 3000 
      },
    ];
  });

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
        <h1>Multiple Moving Targets Demo</h1>
        <p>Targets move to different quadrants at random intervals. Each target has its own follower!</p>
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
    const targetColors = {
      "A": "#cde4ff", // Target A primary color (light blue)
      "B": "#ffcdcd", // Target B primary color (light red)
      "C": "#cdffcd", // Target C primary color (light green)
      "D": "#ffcdff", // Target D primary color (light purple)
    };
    return targetColors[targetId as keyof typeof targetColors] || "#e11";
  };
  
  return (
    <FollowerProvider followerColor={getFollowerColor}>
      <AppContent getFollowerColor={getFollowerColor} />
    </FollowerProvider>
  );
}

export default App;
